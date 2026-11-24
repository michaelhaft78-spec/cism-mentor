'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { DOMAIN_KEYS } from '@/lib/state';
import type { Briefing, ChatMessage, CismState, DomainKey, ProgressPoint } from '@/lib/types';
import { DomainRadar, ErrorBars, GainBars, ReadinessTrend, TARGET } from './charts';
import ThemeToggle from './ThemeToggle';
import MistakeAnalysis from './MistakeAnalysis';
import KnowledgeBase from './KnowledgeBase';
import Practice from './Practice';

interface Props {
  email: string;
  initialState: CismState;
  daysLeft: number | null;
  briefing: Briefing | null;
  initialMessages: ChatMessage[];
  fallbackHistory: ProgressPoint[];
}

/** Leest het antwoord veilig: Vercel geeft bij een time-out platte tekst i.p.v. JSON. */
async function readJson(res: Response): Promise<any> {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    if (res.status === 504 || /timeout|timed out|An error occurred/i.test(text))
      return { error: 'De mentor deed er te lang over (time-out). Probeer het opnieuw.' };
    return { error: `Onverwacht antwoord van de server (${res.status}).` };
  }
}

const DOMAIN_SHORT: Record<string, string> = {
  domain_1_governance: 'D1',
  domain_2_risk_management: 'D2',
  domain_3_security_program: 'D3',
  domain_4_incident_management: 'D4',
};

export default function Dashboard({ email, initialState, daysLeft, briefing, initialMessages, fallbackHistory }: Props) {
  const router = useRouter();
  const [state, setState] = useState(initialState);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [intelBusy, setIntelBusy] = useState(false);
  const [tab, setTab] = useState<'overzicht' | 'oefenen' | 'fouten' | 'kennis'>('overzicht');
  const [editDate, setEditDate] = useState(false);
  const [dateDraft, setDateDraft] = useState(initialState.user_profile.target_exam_date);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages, busy]);

  async function send(text: string) {
    const message = text.trim();
    if (!message || busy) return;
    setBusy(true);
    setNotice(null);
    setInput('');
    setMessages((m) => [...m, { role: 'user', content: message }]);
    chatRef.current?.scrollIntoView({ behavior: 'smooth' });
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      const data = await readJson(res);
      if (!res.ok) throw new Error(data.error || 'Onbekende fout');
      setMessages((m) => [...m, { role: 'model', content: data.reply }]);
      setState(data.state);
      if (data.stateWarning) setNotice(data.stateWarning);
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Er ging iets mis.');
    } finally {
      setBusy(false);
    }
  }

  async function saveExamDate() {
    setNotice(null);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_exam_date: dateDraft }),
      });
      const data = await readJson(res);
      if (!res.ok) throw new Error(data.error || 'Opslaan mislukt');
      setState(data.state);
      setEditDate(false);
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Opslaan mislukt.');
    }
  }

  async function newConversation() {
    if (busy) return;
    await fetch('/api/chat', { method: 'DELETE' });
    setMessages([]);
    setNotice(null);
  }

  async function generateBriefing() {
    setIntelBusy(true);
    setNotice(null);
    try {
      const res = await fetch('/api/weekly-intel', { method: 'POST' });
      const data = await readJson(res);
      if (!res.ok) throw new Error(data.error || 'Onbekende fout');
      router.refresh();
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Briefing genereren mislukt.');
    } finally {
      setIntelBusy(false);
    }
  }

  const readiness = state.user_profile.overall_readiness_score;
  const ea = state.error_analytics;
  const focusKey = state.user_profile.current_focus_domain as DomainKey;
  const focus = state.domains[focusKey];
  const attempted = DOMAIN_KEYS.reduce((s, k) => s + state.domains[k].questions_attempted, 0);
  const correct = DOMAIN_KEYS.reduce((s, k) => s + state.domains[k].questions_correct, 0);
  const history = state.progress_history?.length ? state.progress_history : fallbackHistory;
  const days = daysUntil(state.user_profile.target_exam_date) ?? daysLeft;
  const examLabel = new Date(`${state.user_profile.target_exam_date}T00:00:00Z`).toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  });

  return (
    <>
      {/* 1. Hero: altijd donker, de rest volgt het thema (hybride) */}
      <header className="hero">
        <div className="hero-inner">
          <nav className="nav">
            <div className="brand">
              <span className="brand-mark" aria-hidden="true">◆</span> CISM Mentor
            </div>
            <div className="nav-right">
              <ThemeToggle />
              <form action="/auth/signout" method="post">
                <button className="chip" type="submit" title={email}>
                  Uitloggen
                </button>
              </form>
            </div>
          </nav>

          <div className="hero-main">
            <div className="gauge" style={{ ['--pct' as string]: `${readiness}` }}>
              <div className="gauge-inner">
                <span className="gauge-num">{readiness}%</span>
                <span className="gauge-label">readiness</span>
              </div>
            </div>
            <div className="hero-text">
              <p className="eyebrow">Van 0 naar 100</p>
              <h1>Jouw weg naar het CISM-examen</h1>
              <p className="hero-sub">
                Nog {Math.max(0, TARGET - readiness)} punten tot examenniveau. Grootste winst nu:{' '}
                <strong>{biggestGain(state)}</strong>.
              </p>
            </div>
          </div>

          <div className="tiles">
            <div className="tile">
              <span className="tile-label">
                Examen
                {!editDate && (
                  <button className="tile-edit" onClick={() => setEditDate(true)} title="Examendatum wijzigen">
                    wijzig
                  </button>
                )}
              </span>
              {editDate ? (
                <form
                  className="date-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    saveExamDate();
                  }}
                >
                  <input
                    type="date"
                    value={dateDraft}
                    onChange={(e) => setDateDraft(e.target.value)}
                    required
                    aria-label="Examendatum"
                  />
                  <div className="date-actions">
                    <button type="submit" className="chip chip-solid">
                      Opslaan
                    </button>
                    <button
                      type="button"
                      className="chip"
                      onClick={() => {
                        setEditDate(false);
                        setDateDraft(state.user_profile.target_exam_date);
                      }}
                    >
                      Annuleer
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <span className="tile-value">
                    {days === null ? '—' : days > 0 ? `${days} dagen` : days === 0 ? 'Vandaag!' : 'Geweest'}
                  </span>
                  <span className="tile-sub">{examLabel}</span>
                </>
              )}
            </div>
            <div className="tile">
              <span className="tile-label">Geoefend</span>
              <span className="tile-value">{attempted} vragen</span>
              <span className="tile-sub">{attempted ? Math.round((correct / attempted) * 100) : 0}% goed</span>
            </div>
            <div className="tile">
              <span className="tile-label">Focus</span>
              <span className="tile-value">{DOMAIN_SHORT[focusKey] ?? '—'}</span>
              <span className="tile-sub">{focus?.name ?? state.user_profile.current_focus_domain}</span>
            </div>
            <div className="tile">
              <span className="tile-label">Technische reflex</span>
              <span className="tile-value">{ea.technical_reflex_errors}×</span>
              <span className="tile-sub">moet naar nul</span>
            </div>
          </div>
        </div>
      </header>

      <main className="page">
        <nav className="tabs" aria-label="Onderdelen">
          {(
            [
              ['overzicht', 'Overzicht'],
              ['oefenen', 'Oefenvragen'],
              ['fouten', `Foutenanalyse${state.mistake_log?.length ? ` (${state.mistake_log.length})` : ''}`],
              ['kennis', 'Kennisbank'],
            ] as const
          ).map(([k, label]) => (
            <button key={k} className={`tab ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)} aria-current={tab === k}>
              {label}
            </button>
          ))}
        </nav>

        {tab === 'oefenen' && <Practice state={state} onState={setState} />}
        {tab === 'fouten' && <MistakeAnalysis state={state} busy={busy} onPractice={send} />}
        {tab === 'kennis' && <KnowledgeBase busy={busy} onAsk={send} />}

        {tab === 'overzicht' && (
        <>
        {/* 2. Visualisaties */}
        <div className="grid grid-viz">
          <section className="card">
            <h2>Beheersing per domein</h2>
            <p className="card-sub">De stippellijn is examenniveau (70). Hoe dichter je lijn daarbij komt, hoe beter.</p>
            <DomainRadar state={state} />
          </section>
          <section className="card">
            <h2>Readiness over tijd</h2>
            <p className="card-sub">Je gewogen score per dag, richting de examendatum.</p>
            <ReadinessTrend history={history} examDate={state.user_profile.target_exam_date} />
          </section>
        </div>

        <div className="grid">
          <section className="card">
            <h2>Waar win je de meeste punten?</h2>
            <p className="card-sub">
              Readiness-punten die je wint als een domein examenniveau ({TARGET}) haalt: gewicht × wat je nog mist.
            </p>
            <GainBars state={state} />
          </section>
          <section className="card">
            <h2>Mindset-meter</h2>
            <p className="card-sub">Welk type fout maak je? Technische-reflexfouten horen naar nul te gaan.</p>
            <ErrorBars state={state} />
            <h3>Blind spots</h3>
            <ul className="blindspots">
              {ea.recent_blind_spots.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </section>
        </div>

        {/* 3. Domeinen + intel */}
        <div className="grid">
          <section className="card">
            <h2>De 4 CISM-domeinen</h2>
            <p className="card-sub">Klik op een rood onderwerp om er direct op te trainen.</p>
            {DOMAIN_KEYS.map((key) => {
              const d = state.domains[key];
              const pct = d.questions_attempted ? Math.round((d.questions_correct / d.questions_attempted) * 100) : 0;
              return (
                <div key={key} className="domain">
                  <div className="domain-head">
                    <span>
                      <strong>{DOMAIN_SHORT[key]}</strong> {d.name}{' '}
                      <span className="muted small">({d.weight_percentage}%)</span>
                    </span>
                    <span className="score">{d.mastery_score}</span>
                  </div>
                  <div className="track" title={`${d.mastery_score} van 100, examenniveau ${TARGET}`}>
                    <div className="fill viz-s1" style={{ width: `${d.mastery_score}%` }} />
                    <span className="track-target" style={{ left: `${TARGET}%` }} />
                  </div>
                  <div className="muted small">
                    {d.phase} · {d.questions_correct}/{d.questions_attempted} goed ({pct}%)
                  </div>
                  <div className="badges">
                    {d.weak_topics.map((t) => (
                      <button
                        key={t}
                        className="badge weak"
                        disabled={busy}
                        title="Train mij hierop"
                        onClick={() => send(`Train mij op ${t} in Modus 1`)}
                      >
                        {t} →
                      </button>
                    ))}
                    {d.mastered_topics.map((t) => (
                      <span key={t} className="badge mastered">
                        ✓ {t}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </section>

          <section className="card">
            <div className="card-head">
              <h2>Wekelijkse intel</h2>
              <button className="ghost" onClick={generateBriefing} disabled={intelBusy}>
                {intelBusy ? 'Bezig (±1 min)…' : 'Genereer nu'}
              </button>
            </div>
            {briefing ? (
              <>
                <p className="muted small">Week van {briefing.week_label}</p>
                <div className="markdown briefing">
                  <ReactMarkdown>{briefing.briefing_markdown}</ReactMarkdown>
                </div>
                {Array.isArray(briefing.sources) && briefing.sources.length > 0 && (
                  <details className="sources">
                    <summary>Bronnen ({briefing.sources.length})</summary>
                    <ul>
                      {(briefing.sources as { title?: string; uri?: string }[]).map((s, i) => (
                        <li key={i}>
                          <a href={s.uri} target="_blank" rel="noreferrer">
                            {s.title || s.uri}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
                <button
                  disabled={busy}
                  onClick={() =>
                    send(
                      `Overhoor mij over het nieuws van deze week met 3 scenario-vragen op ISACA-niveau (één tegelijk). Dit is de briefing:\n\n${briefing.briefing_markdown}`,
                    )
                  }
                >
                  Overhoor mij over het nieuws van deze week
                </button>
              </>
            ) : (
              <p className="muted">
                Nog geen briefing. Elke maandag om 07:00 komt er automatisch een nieuwe, of klik op &quot;Genereer
                nu&quot;.
              </p>
            )}
          </section>
        </div>

        </>
        )}

      {/* Chat met de mentor */}
      <section className="card chat" ref={chatRef}>
        <div className="card-head">
          <h2>Mentor</h2>
          <button className="ghost" onClick={newConversation} disabled={busy || messages.length === 0}>
            Nieuw gesprek
          </button>
        </div>
        <div className="messages">
          {messages.length === 0 && (
            <div className="muted">
              Begin met een vraag, klik op een zwak onderwerp hierboven, of probeer:
              <div className="badges">
                {[
                  'Geef me een scenario-vraag over mijn focusdomein',
                  'Leg Containment vs Eradication uit op ISACA-manier',
                  'Waar sta ik nu en wat moet ik deze week doen?',
                ].map((s) => (
                  <button key={s} className="badge" onClick={() => send(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`msg ${m.role}`}>
              {m.role === 'model' ? (
                <div className="markdown">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              ) : (
                <div className="user-text">{m.content}</div>
              )}
            </div>
          ))}
          {busy && <div className="msg model muted">Mentor denkt na…</div>}
          <div ref={chatEndRef} />
        </div>
        {notice && <p className="warn">{notice}</p>}
        <form
          className="composer"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <textarea
            value={input}
            placeholder="Typ je antwoord of vraag… (Enter = versturen, Shift+Enter = nieuwe regel)"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            rows={3}
          />
          <button type="submit" disabled={busy || !input.trim()}>
            Verstuur
          </button>
        </form>
      </section>
      </main>
    </>
  );
}

function daysUntil(dateStr: string): number | null {
  const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Amsterdam' }).format(new Date());
  const ms = Date.parse(`${dateStr}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`);
  return Number.isFinite(ms) ? Math.round(ms / 86_400_000) : null;
}

function biggestGain(state: CismState) {
  let best = DOMAIN_KEYS[0];
  let bestGain = -1;
  for (const k of DOMAIN_KEYS) {
    const d = state.domains[k];
    const g = d.weight_percentage * Math.max(0, TARGET - d.mastery_score);
    if (g > bestGain) {
      bestGain = g;
      best = k;
    }
  }
  return `${DOMAIN_SHORT[best]} ${state.domains[best].name}`;
}
