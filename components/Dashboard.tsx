'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { DOMAIN_KEYS } from '@/lib/state';
import type { Briefing, ChatMessage, CismState } from '@/lib/types';

interface Props {
  email: string;
  initialState: CismState;
  daysLeft: number | null;
  briefing: Briefing | null;
  initialMessages: ChatMessage[];
}

const DOMAIN_SHORT: Record<string, string> = {
  domain_1_governance: 'D1',
  domain_2_risk_management: 'D2',
  domain_3_security_program: 'D3',
  domain_4_incident_management: 'D4',
};

export default function Dashboard({ email, initialState, daysLeft, briefing, initialMessages }: Props) {
  const router = useRouter();
  const [state, setState] = useState(initialState);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [intelBusy, setIntelBusy] = useState(false);
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
      const data = await res.json();
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
      const data = await res.json();
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
  const totalErrors = ea.technical_reflex_errors + ea.definition_knowledge_errors + ea.misread_keyword_errors || 1;
  const mindset = [
    { label: 'Technische reflex', value: ea.technical_reflex_errors, cls: 'bar-red' },
    { label: 'Definitiekennis', value: ea.definition_knowledge_errors, cls: 'bar-amber' },
    { label: 'Sleutelwoord gemist', value: ea.misread_keyword_errors, cls: 'bar-blue' },
  ];

  return (
    <main className="page">
      {/* 1. Bovenbalk: readiness + afteller */}
      <header className="card topbar">
        <div className="gauge" style={{ ['--pct' as string]: `${readiness}` }}>
          <div className="gauge-inner">
            <span className="gauge-num">{readiness}%</span>
            <span className="gauge-label">readiness</span>
          </div>
        </div>
        <div className="topbar-text">
          <h1>CISM Mentor</h1>
          <p>
            Examen op <strong>{state.user_profile.target_exam_date}</strong>
            {daysLeft !== null && (
              <>
                {' '}
                · nog <strong>{daysLeft} dagen</strong>
              </>
            )}
          </p>
          <p className="muted">
            Focus: {DOMAIN_SHORT[state.user_profile.current_focus_domain] ?? ''}{' '}
            {state.domains[state.user_profile.current_focus_domain as keyof CismState['domains']]?.name ??
              state.user_profile.current_focus_domain}
          </p>
        </div>
        <form action="/auth/signout" method="post" className="signout">
          <span className="muted small">{email}</span>
          <button className="ghost" type="submit">
            Uitloggen
          </button>
        </form>
      </header>

      <div className="grid">
        {/* 2. Linker kolom: de 4 domeinen */}
        <section className="card">
          <h2>De 4 CISM-domeinen</h2>
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
                <div className="bar">
                  <div className="bar-fill" style={{ width: `${d.mastery_score}%` }} />
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

        {/* 3. Rechter kolom: mindset + blind spots + intel */}
        <div className="col">
          <section className="card">
            <h2>Mindset-meter</h2>
            <p className="muted small">
              Denk je nog als techneut? Technische-reflexfouten horen naar nul te gaan.
            </p>
            {mindset.map((m) => (
              <div key={m.label} className="mindset-row">
                <span>{m.label}</span>
                <div className="bar small-bar">
                  <div className={`bar-fill ${m.cls}`} style={{ width: `${(m.value / totalErrors) * 100}%` }} />
                </div>
                <span className="score">{m.value}</span>
              </div>
            ))}
            <h3>Blind spots</h3>
            <ul className="blindspots">
              {ea.recent_blind_spots.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </section>

          <section className="card">
            <div className="card-head">
              <h2>Wekelijkse intel</h2>
              <button className="ghost" onClick={generateBriefing} disabled={intelBusy}>
                {intelBusy ? 'Bezig (±30 s)…' : 'Genereer nu'}
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
      </div>

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
  );
}
