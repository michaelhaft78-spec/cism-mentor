'use client';
import { useState } from 'react';
import type { CismState, DomainKey, ProgressPoint } from '@/lib/types';

/** Examenniveau: vanaf 71 zit je in de fase "Examen-meesterschap". */
export const TARGET = 70;

const DOMAINS: { key: DomainKey; short: string; label: string }[] = [
  { key: 'domain_1_governance', short: 'D1', label: 'Governance' },
  { key: 'domain_2_risk_management', short: 'D2', label: 'Risk Mgmt' },
  { key: 'domain_3_security_program', short: 'D3', label: 'Program' },
  { key: 'domain_4_incident_management', short: 'D4', label: 'Incident Mgmt' },
];

type Tip = { x: number; y: number; title: string; lines: string[] } | null;

function Tooltip({ tip }: { tip: Tip }) {
  if (!tip) return null;
  return (
    <div className="viz-tip" style={{ left: `${tip.x}%`, top: `${tip.y}%` }} role="status">
      <strong>{tip.title}</strong>
      {tip.lines.map((l) => (
        <span key={l}>{l}</span>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 1. Radar: beheersing per domein t.o.v. examenniveau                 */
/* ------------------------------------------------------------------ */
export function DomainRadar({ state }: { state: CismState }) {
  const [tip, setTip] = useState<Tip>(null);
  const W = 400;
  const H = 300;
  const cx = W / 2;
  const cy = H / 2 + 2;
  const R = 100;
  // D1 boven, D2 rechts, D3 onder, D4 links
  const angle = (i: number) => -Math.PI / 2 + (i * Math.PI) / 2;
  const pt = (i: number, v: number) => [cx + Math.cos(angle(i)) * (R * v) / 100, cy + Math.sin(angle(i)) * (R * v) / 100];
  const ring = (v: number) => DOMAINS.map((_, i) => pt(i, v).join(',')).join(' ');
  const values = DOMAINS.map((d) => state.domains[d.key].mastery_score);
  const poly = values.map((v, i) => pt(i, v).join(',')).join(' ');
  const labelPos = [
    { x: cx, y: cy - R - 14, anchor: 'middle' as const },
    { x: cx + R + 10, y: cy + 4, anchor: 'start' as const },
    { x: cx, y: cy + R + 22, anchor: 'middle' as const },
    { x: cx - R - 10, y: cy + 4, anchor: 'end' as const },
  ];

  return (
    <figure className="viz" aria-label="Radargrafiek: beheersing per domein">
      <div className="viz-plot">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-hidden="true">
          {[25, 50, 75, 100].map((v) => (
            <polygon key={v} points={ring(v)} className="viz-grid" />
          ))}
          {DOMAINS.map((_, i) => {
            const [x, y] = pt(i, 100);
            return <line key={i} x1={cx} y1={cy} x2={x} y2={y} className="viz-grid" />;
          })}
          <polygon points={ring(TARGET)} className="viz-ref" />
          <text x={pt(1, TARGET)[0] + 4} y={pt(1, TARGET)[1] - 8} className="viz-ref-label">
            {TARGET}
          </text>
          <polygon points={poly} className="viz-area" />
          {values.map((v, i) => {
            const [x, y] = pt(i, v);
            const d = DOMAINS[i];
            const ds = state.domains[d.key];
            return (
              <g key={d.key}>
                <circle cx={x} cy={y} r={5} className="viz-dot" />
                <circle
                  cx={x}
                  cy={y}
                  r={16}
                  className="viz-hit"
                  onMouseEnter={() =>
                    setTip({
                      x: (x / W) * 100,
                      y: (y / H) * 100,
                      title: `${d.short} ${ds.name}`,
                      lines: [`Beheersing: ${v}`, `Nog ${Math.max(0, TARGET - v)} tot examenniveau`, `Gewicht: ${ds.weight_percentage}%`],
                    })
                  }
                  onMouseLeave={() => setTip(null)}
                />
              </g>
            );
          })}
          {DOMAINS.map((d, i) => (
            <text key={d.key} x={labelPos[i].x} y={labelPos[i].y} textAnchor={labelPos[i].anchor} className="viz-label">
              <tspan className="viz-label-strong">{d.short}</tspan> {d.label} · {values[i]}
            </text>
          ))}
        </svg>
        <Tooltip tip={tip} />
      </div>
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Trendlijn: readiness over tijd, met examenniveau en examendatum   */
/* ------------------------------------------------------------------ */
export function ReadinessTrend({ history, examDate }: { history: ProgressPoint[]; examDate: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 520;
  const H = 260;
  const m = { l: 34, r: 16, t: 14, b: 28 };
  const iw = W - m.l - m.r;
  const ih = H - m.t - m.b;
  const t = (d: string) => Date.parse(`${d}T00:00:00Z`);
  const start = history.length ? t(history[0].date) : Date.now();
  const end = Math.max(t(examDate), start + 86_400_000);
  const x = (d: string) => m.l + ((t(d) - start) / (end - start)) * iw;
  const y = (v: number) => m.t + ih - (v / 100) * ih;
  const path = history.map((p, i) => `${i ? 'L' : 'M'}${x(p.date).toFixed(1)},${y(p.readiness).toFixed(1)}`).join(' ');
  const fmt = (d: string) => new Date(`${d}T00:00:00Z`).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', timeZone: 'UTC' });

  function onMove(e: React.MouseEvent<SVGRectElement>) {
    const box = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
    const px = ((e.clientX - box.left) / box.width) * W;
    let best = 0;
    history.forEach((p, i) => {
      if (Math.abs(x(p.date) - px) < Math.abs(x(history[best].date) - px)) best = i;
    });
    setHover(history.length ? best : null);
  }

  const h = hover !== null ? history[hover] : null;

  return (
    <figure className="viz viz-wide" aria-label="Lijngrafiek: readiness over tijd">
      <div className="viz-plot">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-hidden="true">
          {[0, 25, 50, 75, 100].map((v) => (
            <g key={v}>
              <line x1={m.l} x2={W - m.r} y1={y(v)} y2={y(v)} className={v === 0 ? 'viz-axis' : 'viz-grid'} />
              <text x={m.l - 6} y={y(v) + 4} textAnchor="end" className="viz-tick">
                {v}
              </text>
            </g>
          ))}
          <line x1={m.l} x2={W - m.r} y1={y(TARGET)} y2={y(TARGET)} className="viz-ref" />
          <text x={m.l + 4} y={y(TARGET) - 6} className="viz-ref-label">
            examenniveau {TARGET}
          </text>
          <line x1={x(examDate)} x2={x(examDate)} y1={m.t} y2={m.t + ih} className="viz-ref" />
          <text x={x(examDate) - 4} y={m.t + 10} textAnchor="end" className="viz-ref-label">
            examen {fmt(examDate)}
          </text>
          {history.length > 0 && (
            <text x={m.l} y={H - 8} className="viz-tick">
              {fmt(history[0].date)}
            </text>
          )}
          {history.length > 1 && <path d={path} className="viz-line" />}
          {history.map((p, i) => (
            <circle key={p.date} cx={x(p.date)} cy={y(p.readiness)} r={i === hover ? 6 : 4.5} className="viz-dot" />
          ))}
          {h && (
            <line x1={x(h.date)} x2={x(h.date)} y1={m.t} y2={m.t + ih} className="viz-crosshair" />
          )}
          {history.length > 0 && (
            <text
              x={x(history[history.length - 1].date) + 8}
              y={y(history[history.length - 1].readiness) + 4}
              className="viz-label viz-label-strong"
            >
              {history[history.length - 1].readiness}%
            </text>
          )}
          <rect
            x={m.l}
            y={m.t}
            width={iw}
            height={ih}
            fill="transparent"
            onMouseMove={onMove}
            onMouseLeave={() => setHover(null)}
          />
        </svg>
        {h && (
          <Tooltip
            tip={{
              x: (x(h.date) / W) * 100,
              y: (y(h.readiness) / H) * 100,
              title: fmt(h.date),
              lines: [`Readiness: ${h.readiness}%`, `D1 ${h.d1} · D2 ${h.d2} · D3 ${h.d3} · D4 ${h.d4}`],
            }}
          />
        )}
      </div>
      {history.length < 2 && (
        <figcaption className="viz-note">Elke dag dat je oefent komt er een punt bij, zo zie je je lijn naar het examen groeien.</figcaption>
      )}
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Waar win je de meeste punten? (gewicht × wat je nog mist)         */
/* ------------------------------------------------------------------ */
export function GainBars({ state }: { state: CismState }) {
  const [tip, setTip] = useState<Tip>(null);
  const rows = DOMAINS.map((d) => {
    const ds = state.domains[d.key];
    const toTarget = Math.max(0, TARGET - ds.mastery_score);
    return { ...d, gain: Math.round((ds.weight_percentage * toTarget) / 100 * 10) / 10, weight: ds.weight_percentage, toTarget };
  }).sort((a, b) => b.gain - a.gain);
  const max = Math.max(...rows.map((r) => r.gain), 1);
  const W = 420;
  const rowH = 40;
  const labelW = 150;
  const valueW = 50;
  const H = rows.length * rowH + 4;
  const bw = W - labelW - valueW;

  return (
    <figure className="viz viz-wide" aria-label="Staafgrafiek: te winnen readiness-punten per domein">
      <div className="viz-plot">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-hidden="true">
          {rows.map((r, i) => {
            const yy = i * rowH + 10;
            const w = Math.max(2, (r.gain / max) * bw);
            return (
              <g
                key={r.key}
                onMouseEnter={() =>
                  setTip({
                    x: ((labelW + w) / W) * 100,
                    y: ((yy + 6) / H) * 100,
                    title: `${r.short} ${r.label}`,
                    lines: [
                      `Nog ${r.toTarget} punten tot examenniveau`,
                      `× gewicht ${r.weight}% = +${r.gain} readiness`,
                    ],
                  })
                }
                onMouseLeave={() => setTip(null)}
              >
                <rect x={0} y={yy - 8} width={W} height={rowH - 4} fill="transparent" />
                <text x={0} y={yy + 10} className="viz-label">
                  <tspan className="viz-label-strong">{r.short}</tspan> {r.label}
                </text>
                <path
                  d={`M${labelW},${yy} h${w - 4} a4,4 0 0 1 4,4 v8 a4,4 0 0 1 -4,4 h${-(w - 4)} z`}
                  className={i === 0 ? 'viz-bar viz-bar-top' : 'viz-bar'}
                />
                <text x={labelW + w + 8} y={yy + 11} className="viz-label viz-label-strong">
                  +{r.gain}
                </text>
              </g>
            );
          })}
        </svg>
        <Tooltip tip={tip} />
      </div>
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* 4. Fouttypes (mindset)                                              */
/* ------------------------------------------------------------------ */
export function ErrorBars({ state }: { state: CismState }) {
  const ea = state.error_analytics;
  const rows = [
    { label: 'Technische reflex', value: ea.technical_reflex_errors, cls: 'viz-s1', hint: 'Koos een technische fix i.p.v. governance/proces' },
    { label: 'Definitiekennis', value: ea.definition_knowledge_errors, cls: 'viz-s2', hint: 'Kende de ISACA-definitie of volgorde niet' },
    { label: 'Sleutelwoord gemist', value: ea.misread_keyword_errors, cls: 'viz-s3', hint: 'Las over FIRST / BEST / MOST heen' },
  ];
  const total = rows.reduce((s, r) => s + r.value, 0) || 1;
  return (
    <div className="errbars">
      {rows.map((r) => (
        <div key={r.label} className="errbar" title={r.hint}>
          <div className="errbar-head">
            <span>
              <i className={`swatch ${r.cls}`} /> {r.label}
            </span>
            <span className="score">
              {r.value} <span className="muted small">({Math.round((r.value / total) * 100)}%)</span>
            </span>
          </div>
          <div className="track">
            <div className={`fill ${r.cls}`} style={{ width: `${(r.value / total) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
