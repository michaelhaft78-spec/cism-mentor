'use client';
import { useMemo, useState } from 'react';
import type { CismState, ErrorType, MistakeEntry } from '@/lib/types';
import { DOMAIN_KEYS } from '@/lib/state';

export const ERROR_LABEL: Record<ErrorType, string> = {
  technical_reflex: 'Technische reflex',
  definition_knowledge: 'Definitiekennis',
  misread_keyword: 'Sleutelwoord gemist',
  other: 'Overig',
};
const ERROR_HINT: Record<ErrorType, string> = {
  technical_reflex: 'Je koos een technische oplossing waar ISACA eerst governance, risico of proces wil zien.',
  definition_knowledge: 'Je kende de ISACA-definitie of de juiste volgorde niet.',
  misread_keyword: 'Je las over FIRST / BEST / MOST / PRIMARY heen.',
  other: 'Een andere oorzaak.',
};
const TYPES: ErrorType[] = ['technical_reflex', 'definition_knowledge', 'misread_keyword', 'other'];
const SHORT: Record<string, string> = {
  domain_1_governance: 'D1',
  domain_2_risk_management: 'D2',
  domain_3_security_program: 'D3',
  domain_4_incident_management: 'D4',
};

export default function MistakeAnalysis({
  state,
  busy,
  onPractice,
}: {
  state: CismState;
  busy: boolean;
  onPractice: (prompt: string) => void;
}) {
  const log = state.mistake_log ?? [];
  const [domain, setDomain] = useState<string>('all');
  const [type, setType] = useState<string>('all');

  const matrix = useMemo(() => {
    const m: Record<string, Record<string, number>> = {};
    for (const d of DOMAIN_KEYS) m[d] = { technical_reflex: 0, definition_knowledge: 0, misread_keyword: 0, other: 0 };
    for (const e of log) if (m[e.domain]) m[e.domain][e.error_type] = (m[e.domain][e.error_type] ?? 0) + 1;
    return m;
  }, [log]);
  const maxCell = Math.max(1, ...DOMAIN_KEYS.flatMap((d) => TYPES.map((t) => matrix[d][t])));

  const topics = useMemo(() => {
    const c = new Map<string, { count: number; domain: string }>();
    for (const e of log) c.set(e.topic, { count: (c.get(e.topic)?.count ?? 0) + 1, domain: e.domain as string });
    return [...c.entries()].sort((a, b) => b[1].count - a[1].count).slice(0, 5);
  }, [log]);

  const filtered = log
    .filter((e) => (domain === 'all' || e.domain === domain) && (type === 'all' || e.error_type === type))
    .slice()
    .reverse();

  const ea = state.error_analytics;
  const counters = [
    { t: 'technical_reflex' as const, n: ea.technical_reflex_errors },
    { t: 'definition_knowledge' as const, n: ea.definition_knowledge_errors },
    { t: 'misread_keyword' as const, n: ea.misread_keyword_errors },
  ];
  const biggest = counters.slice().sort((a, b) => b.n - a.n)[0];

  const practice = (e: MistakeEntry) =>
    onPractice(
      `Geef me een nieuwe scenario-vraag op ISACA-niveau over "${e.topic}" (${SHORT[e.domain] ?? e.domain}). ` +
        `Eerder maakte ik hier een fout van het type "${ERROR_LABEL[e.error_type]}". De les was: ${e.lesson}`,
    );

  return (
    <div className="stack">
      <div className="grid">
        <section className="card">
          <h2>Jouw grootste valkuil</h2>
          <p className="card-sub">Op basis van al je fouten tot nu toe.</p>
          <div className="callout">
            <span className="callout-big">{ERROR_LABEL[biggest.t]}</span>
            <span>
              {biggest.n} keer. {ERROR_HINT[biggest.t]}
            </span>
          </div>
          <button
            disabled={busy}
            onClick={() =>
              onPractice(
                `Train mij gericht op mijn grootste valkuil: "${ERROR_LABEL[biggest.t]}". Geef één scenario-vraag waar deze fout makkelijk gemaakt wordt.`,
              )
            }
          >
            Train mij op deze valkuil
          </button>
          {topics.length > 0 && (
            <>
              <h3>Onderwerpen met de meeste fouten</h3>
              <ol className="topiclist">
                {topics.map(([t, v]) => (
                  <li key={t}>
                    <span>
                      <strong>{SHORT[v.domain] ?? ''}</strong> {t}
                    </span>
                    <span className="score">{v.count}×</span>
                  </li>
                ))}
              </ol>
            </>
          )}
        </section>

        <section className="card">
          <h2>Waar gaat het mis?</h2>
          <p className="card-sub">Fouten per domein en type (vanaf nu bijgehouden). Hoe donkerder, hoe vaker.</p>
          {log.length === 0 ? (
            <p className="muted">
              Nog geen fouten vastgelegd. Vanaf nu komt elke fout die je bij een oefenvraag maakt hier automatisch in,
              met de vraag, jouw antwoord, het juiste antwoord en de les.
            </p>
          ) : (
            <div className="heat" role="table" aria-label="Fouten per domein en type">
              <div className="heat-row heat-head" role="row">
                <span />
                {TYPES.map((t) => (
                  <span key={t} role="columnheader">
                    {ERROR_LABEL[t]}
                  </span>
                ))}
              </div>
              {DOMAIN_KEYS.map((d) => (
                <div key={d} className="heat-row" role="row">
                  <span role="rowheader">
                    <strong>{SHORT[d]}</strong>
                  </span>
                  {TYPES.map((t) => {
                    const n = matrix[d][t];
                    const level = n === 0 ? 0 : Math.ceil((n / maxCell) * 4);
                    return (
                      <button
                        key={t}
                        className={`heat-cell heat-${level}`}
                        title={`${SHORT[d]} · ${ERROR_LABEL[t]}: ${n}`}
                        onClick={() => {
                          setDomain(d);
                          setType(t);
                        }}
                        role="cell"
                      >
                        {n || ''}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="card">
        <div className="card-head">
          <h2>Foutenlogboek</h2>
          <div className="filters">
            <select value={domain} onChange={(e) => setDomain(e.target.value)} aria-label="Filter op domein">
              <option value="all">Alle domeinen</option>
              {DOMAIN_KEYS.map((d) => (
                <option key={d} value={d}>
                  {SHORT[d]} {state.domains[d].name}
                </option>
              ))}
            </select>
            <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Filter op fouttype">
              <option value="all">Alle fouttypes</option>
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {ERROR_LABEL[t]}
                </option>
              ))}
            </select>
          </div>
        </div>
        {filtered.length === 0 ? (
          <p className="muted">
            {log.length === 0 ? 'Beantwoord een oefenvraag in de mentor-chat om te beginnen.' : 'Geen fouten met deze filters.'}
          </p>
        ) : (
          <ul className="mistakes">
            {filtered.map((e, i) => (
              <li key={i} className="mistake">
                <div className="mistake-meta">
                  <span className="pill">{SHORT[e.domain] ?? e.domain}</span>
                  <span className={`pill pill-${e.error_type}`}>{ERROR_LABEL[e.error_type]}</span>
                  <span className="muted small">{e.date}</span>
                </div>
                <p className="mistake-q">
                  <strong>{e.topic}:</strong> {e.question}
                </p>
                {(e.your_answer || e.correct_answer) && (
                  <p className="small">
                    {e.your_answer && (
                      <>
                        <span className="wrong">Jouw antwoord: {e.your_answer}</span>
                        <br />
                      </>
                    )}
                    {e.correct_answer && <span className="right">Juist: {e.correct_answer}</span>}
                  </p>
                )}
                {e.lesson && <p className="lesson">💡 {e.lesson}</p>}
                <button className="ghost small-btn" disabled={busy} onClick={() => practice(e)}>
                  Oefen dit opnieuw
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
