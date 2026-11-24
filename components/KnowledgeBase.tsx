'use client';
import { useMemo, useState } from 'react';
import { GLOSSARY, GLOSSARY_DOMAIN_LABEL, type GlossaryTerm } from '@/lib/glossary';

const FILTERS: (GlossaryTerm['domain'] | 'alles')[] = [
  'alles',
  'domain_1_governance',
  'domain_2_risk_management',
  'domain_3_security_program',
  'domain_4_incident_management',
  'all',
];

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

export default function KnowledgeBase({ busy, onAsk }: { busy: boolean; onAsk: (prompt: string) => void }) {
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('alles');

  const results = useMemo(() => {
    const nq = norm(q.trim());
    return GLOSSARY.filter((t) => filter === 'alles' || t.domain === filter)
      .filter((t) => !nq || norm(`${t.term} ${t.plain} ${t.exam} ${t.confuse ?? ''}`).includes(nq))
      .sort((a, b) => {
        // treffers in de term zelf eerst
        const at = norm(a.term).includes(nq) ? 0 : 1;
        const bt = norm(b.term).includes(nq) ? 0 : 1;
        return at - bt || a.term.localeCompare(b.term, 'nl');
      });
  }, [q, filter]);

  return (
    <div className="stack">
      <section className="card">
        <h2>Kennisbank</h2>
        <p className="card-sub">
          {GLOSSARY.length} kernbegrippen van het CISM-examen in begrijpelijke taal, met wat het examen ervan wil horen.
        </p>
        <input
          type="search"
          placeholder="Zoek een begrip, bijv. RTO, risk appetite, containment…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Zoek in de kennisbank"
        />
        <div className="badges">
          {FILTERS.map((f) => (
            <button
              key={f}
              className={`badge ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
            >
              {f === 'alles' ? 'Alles' : GLOSSARY_DOMAIN_LABEL[f]}
            </button>
          ))}
        </div>
      </section>

      {results.length === 0 ? (
        <section className="card">
          <p>Dit begrip staat nog niet in de kennisbank.</p>
          {q.trim() && (
            <button
              disabled={busy}
              onClick={() =>
                onAsk(`Leg het begrip "${q.trim()}" uit in begrijpelijke taal, en vertel hoe ISACA er op het CISM-examen naar kijkt.`)
              }
            >
              Vraag de mentor om &quot;{q.trim()}&quot; uit te leggen
            </button>
          )}
        </section>
      ) : (
        <div className="terms">
          {results.map((t) => (
            <article key={t.term} className="card term">
              <div className="term-head">
                <h3>{t.term}</h3>
                <span className="pill">{GLOSSARY_DOMAIN_LABEL[t.domain]}</span>
              </div>
              <p>{t.plain}</p>
              <p className="exam-tip">
                <strong>Op het examen:</strong> {t.exam}
              </p>
              {t.confuse && (
                <p className="small muted">
                  Niet verwarren met: <button className="linklike" onClick={() => setQ(t.confuse!.split(' (')[0])}>{t.confuse}</button>
                </p>
              )}
              <button
                className="ghost small-btn"
                disabled={busy}
                onClick={() =>
                  onAsk(`Leg "${t.term}" uit met een praktijkvoorbeeld en geef daarna één oefenvraag op ISACA-niveau.`)
                }
              >
                Leg uit met voorbeeld + oefenvraag
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
