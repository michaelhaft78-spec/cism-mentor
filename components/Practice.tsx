'use client';
import { useMemo, useState } from 'react';
import { QUESTIONS, type Question } from '@/lib/questions';
import type { CismState } from '@/lib/types';
import { ERROR_LABEL } from './MistakeAnalysis';

const SHORT: Record<string, string> = {
  domain_1_governance: 'D1',
  domain_2_risk_management: 'D2',
  domain_3_security_program: 'D3',
  domain_4_incident_management: 'D4',
};
const SETS: { key: string; label: string }[] = [
  { key: 'mix', label: 'Mix van alle domeinen' },
  { key: 'weak', label: 'Mijn zwakke onderwerpen' },
  { key: 'domain_1_governance', label: 'D1 Governance' },
  { key: 'domain_2_risk_management', label: 'D2 Risk Management' },
  { key: 'domain_3_security_program', label: 'D3 Security Program' },
  { key: 'domain_4_incident_management', label: 'D4 Incident Management' },
];
const KEYWORD_NL: Record<Question['keyword'], string> = {
  FIRST: 'EERSTE',
  BEST: 'BESTE',
  MOST: 'MEEST',
  PRIMARY: 'PRIMAIR',
};
const LETTERS = ['A', 'B', 'C', 'D'];
const ROUND = 10;

function shuffle<T>(a: T[]): T[] {
  const r = a.slice();
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

/** Nieuwe vragen eerst, daarna eerder fout beantwoorde, daarna de rest. */
function buildRound(set: string, state: CismState): Question[] {
  const results = state.quiz_progress?.results ?? {};
  const weak = Object.values(state.domains).flatMap((d) => d.weak_topics.map((t) => t.toLowerCase()));
  // Onderwerpnamen uit de mentor-chat kunnen iets afwijken: "lijkt op" is genoeg.
  const isWeak = (topic: string) => {
    const t = topic.toLowerCase();
    return weak.some((w) => w.includes(t) || t.includes(w));
  };
  const pool = QUESTIONS.filter((q) =>
    set === 'mix' ? true : set === 'weak' ? isWeak(q.topic) || results[q.id] === false : q.domain === set,
  );
  const fresh = shuffle(pool.filter((q) => !(q.id in results)));
  const wrong = shuffle(pool.filter((q) => results[q.id] === false));
  const right = shuffle(pool.filter((q) => results[q.id] === true));
  return [...fresh, ...wrong, ...right].slice(0, ROUND);
}

async function readJson(res: Response): Promise<any> {
  try {
    return JSON.parse(await res.text());
  } catch {
    return { error: `Onverwacht antwoord van de server (${res.status}).` };
  }
}

export default function Practice({ state, onState }: { state: CismState; onState: (s: CismState) => void }) {
  const [set, setSet] = useState('mix');
  const [round, setRound] = useState<Question[] | null>(null);
  const [idx, setIdx] = useState(0);
  const [choice, setChoice] = useState<number | null>(null);
  const [answers, setAnswers] = useState<{ q: Question; correct: boolean }[]>([]);
  const [saveError, setSaveError] = useState<string | null>(null);

  const results = state.quiz_progress?.results ?? {};
  const answeredCount = Object.keys(results).length;
  const rightCount = Object.values(results).filter(Boolean).length;
  const weakCount = useMemo(
    () => buildRound('weak', state).length,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.quiz_progress, state.domains],
  );

  function start(s = set) {
    setRound(buildRound(s, state));
    setIdx(0);
    setChoice(null);
    setAnswers([]);
    setSaveError(null);
  }

  async function answer(i: number) {
    if (!round || choice !== null) return;
    const q = round[idx];
    setChoice(i);
    setAnswers((a) => [...a, { q, correct: i === q.correct }]);
    try {
      const res = await fetch('/api/quiz/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: q.id, choice: i }),
      });
      const data = await readJson(res);
      if (!res.ok || data.error) throw new Error(data.error ?? 'Opslaan mislukt');
      onState(data.state);
      setSaveError(null);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Opslaan mislukt');
    }
  }

  function next() {
    setChoice(null);
    setIdx((n) => n + 1);
    if (typeof window !== 'undefined') document.getElementById('practice-top')?.scrollIntoView({ block: 'start' });
  }

  // ---------- Startscherm ----------
  if (!round) {
    return (
      <div className="stack">
        <section className="card">
          <h2>Oefenvragen</h2>
          <p className="card-sub">
            Meerkeuzevragen in ISACA-stijl, met uitleg bij elk antwoord. Werkt ook als de mentor (Gemini) niet
            beschikbaar is. Je scores, zwakke onderwerpen en foutenanalyse worden automatisch bijgewerkt.
          </p>
          <div className="quiz-stats">
            <div>
              <span className="quiz-stat">
                {answeredCount}/{QUESTIONS.length}
              </span>
              <span className="muted">vragen gedaan</span>
            </div>
            <div>
              <span className="quiz-stat">{answeredCount ? Math.round((rightCount / answeredCount) * 100) : 0}%</span>
              <span className="muted">laatste keer goed</span>
            </div>
          </div>
          <h3>Waar wil je op oefenen?</h3>
          <div className="quiz-sets" role="radiogroup" aria-label="Kies een set">
            {SETS.map((s) => {
              const n =
                s.key === 'mix'
                  ? QUESTIONS.length
                  : s.key === 'weak'
                    ? weakCount
                    : QUESTIONS.filter((q) => q.domain === s.key).length;
              return (
                <button
                  key={s.key}
                  role="radio"
                  aria-checked={set === s.key}
                  className={`quiz-set ${set === s.key ? 'active' : ''}`}
                  disabled={n === 0}
                  onClick={() => setSet(s.key)}
                >
                  <strong>{s.label}</strong>
                  <span>{n === 0 ? 'nog geen' : `${n} vragen`}</span>
                </button>
              );
            })}
          </div>
          <button className="quiz-start" onClick={() => start()}>
            Start een ronde van {ROUND} vragen
          </button>
        </section>
      </div>
    );
  }

  // ---------- Einde ronde ----------
  if (idx >= round.length) {
    const good = answers.filter((a) => a.correct).length;
    const missed = answers.filter((a) => !a.correct);
    return (
      <div className="stack">
        <section className="card">
          <h2>Ronde klaar</h2>
          <div className="quiz-result">
            <span className="quiz-stat">
              {good}/{answers.length}
            </span>
            <span className="muted">goed ({answers.length ? Math.round((good / answers.length) * 100) : 0}%)</span>
          </div>
          {missed.length > 0 ? (
            <>
              <h3>Hier ging het mis</h3>
              <ul className="topiclist">
                {missed.map(({ q }) => (
                  <li key={q.id}>
                    <strong>{SHORT[q.domain]}</strong> {q.topic}
                  </li>
                ))}
              </ul>
              <p className="muted">Deze staan nu in je foutenanalyse, met de les erbij.</p>
            </>
          ) : (
            <p>Alles goed. Sterk!</p>
          )}
          <div className="date-actions">
            <button onClick={() => start()}>Nog een ronde</button>
            <button className="ghost" onClick={() => setRound(null)}>
              Andere set kiezen
            </button>
          </div>
        </section>
      </div>
    );
  }

  // ---------- Vraag ----------
  const q = round[idx];
  const answered = choice !== null;
  return (
    <div className="stack" id="practice-top">
      <section className="card quiz-card">
        <div className="card-head">
          <span className="muted">
            Vraag {idx + 1} van {round.length}
          </span>
          <button className="linklike" onClick={() => setRound(null)}>
            Stoppen
          </button>
        </div>
        <div className="quiz-bar" aria-hidden>
          <span style={{ width: `${((idx + (answered ? 1 : 0)) / round.length) * 100}%` }} />
        </div>
        <div className="mistake-meta">
          <span className="pill">{SHORT[q.domain]}</span>
          <span className="pill">{q.topic}</span>
          <span className="pill pill-key">Sleutelwoord: {KEYWORD_NL[q.keyword]}</span>
        </div>
        <p className="quiz-q">{q.question}</p>
        <div className="quiz-options">
          {q.options.map((o, i) => {
            const state = !answered ? '' : i === q.correct ? 'is-right' : i === choice ? 'is-wrong' : 'is-other';
            return (
              <button key={i} className={`quiz-option ${state}`} disabled={answered} onClick={() => answer(i)}>
                <span className="quiz-letter">{LETTERS[i]}</span>
                <span className="quiz-text">
                  {o.text}
                  {answered && (
                    <span className="quiz-why">
                      {i === choice && i !== q.correct && o.error_type && (
                        <span className={`pill pill-${o.error_type}`}>{ERROR_LABEL[o.error_type]}</span>
                      )}{' '}
                      {o.why}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
        {answered && (
          <div className="quiz-feedback">
            <strong className={choice === q.correct ? 'right' : 'wrong'}>
              {choice === q.correct ? 'Goed!' : `Helaas. Het juiste antwoord is ${LETTERS[q.correct]}.`}
            </strong>
            {saveError && <span className="wrong">Let op: niet opgeslagen ({saveError}).</span>}
            <button onClick={next}>{idx + 1 < round.length ? 'Volgende vraag' : 'Bekijk resultaat'}</button>
          </div>
        )}
      </section>
    </div>
  );
}
