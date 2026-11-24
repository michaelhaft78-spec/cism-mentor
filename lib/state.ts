import type { CismState, DomainKey, DomainState, MistakeEntry } from './types';

export const DOMAIN_KEYS: DomainKey[] = [
  'domain_1_governance',
  'domain_2_risk_management',
  'domain_3_security_program',
  'domain_4_incident_management',
];

const MAX_BLIND_SPOTS = 5;

/** Haalt de inhoud tussen <TAG> en </TAG> op en geeft ook de tekst zonder dat blok terug. */
export function splitTaggedBlock(text: string, tag: string): { visible: string; block: string | null } {
  const re = new RegExp(`<${tag}>\\s*([\\s\\S]*?)\\s*</${tag}>`, 'i');
  const match = text.match(re);
  if (!match) {
    // Model heeft de sluit-tag vergeten: pak alles na de open-tag.
    const openIdx = text.search(new RegExp(`<${tag}>`, 'i'));
    if (openIdx >= 0) {
      return {
        visible: text.slice(0, openIdx).trim(),
        block: text.slice(openIdx).replace(new RegExp(`<${tag}>`, 'i'), '').trim(),
      };
    }
    return { visible: text.trim(), block: null };
  }
  return { visible: text.replace(re, '').trim(), block: match[1] };
}

/** Verwijdert ```json ... ``` fences en pakt het buitenste {...} of [...] blok. */
export function parseLooseJson(raw: string): unknown {
  let s = raw.trim();
  s = s.replace(/^```(?:json|JSON)?\s*/, '').replace(/\s*```$/, '').trim();
  try {
    return JSON.parse(s);
  } catch {
    const firstObj = s.indexOf('{');
    const firstArr = s.indexOf('[');
    const start =
      firstObj === -1 ? firstArr : firstArr === -1 ? firstObj : Math.min(firstObj, firstArr);
    const end = Math.max(s.lastIndexOf('}'), s.lastIndexOf(']'));
    if (start >= 0 && end > start) return JSON.parse(s.slice(start, end + 1));
    throw new Error('Geen geldige JSON gevonden');
  }
}

const clamp = (n: unknown, fallback: number, min = 0, max = 100) => {
  const v = typeof n === 'number' && Number.isFinite(n) ? n : fallback;
  return Math.max(min, Math.min(max, Math.round(v)));
};
const strArr = (v: unknown, fallback: string[]) =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : fallback;
const nonNeg = (v: unknown, fallback: number) =>
  typeof v === 'number' && Number.isFinite(v) && v >= 0 ? Math.round(v) : fallback;

export function computeReadiness(domains: Record<DomainKey, DomainState>): number {
  let total = 0;
  let weights = 0;
  for (const key of DOMAIN_KEYS) {
    const d = domains[key];
    total += d.mastery_score * d.weight_percentage;
    weights += d.weight_percentage;
  }
  return weights ? Math.round(total / weights) : 0;
}

/**
 * Valideert de door het model voorgestelde state tegen de vorige state.
 * Ontbrekende/ongeldige velden vallen terug op de vorige waarde, zodat er nooit
 * voortgang verloren gaat. Readiness wordt server-side herberekend.
 */
export function normalizeState(candidate: unknown, previous: CismState): CismState {
  const c = (candidate && typeof candidate === 'object' ? candidate : {}) as Partial<CismState> & Record<string, any>;
  const cDomains = (c.domains ?? {}) as Partial<Record<DomainKey, Partial<DomainState>>>;

  const domains = {} as Record<DomainKey, DomainState>;
  for (const key of DOMAIN_KEYS) {
    const prev = previous.domains[key];
    const next = cDomains[key] ?? {};
    domains[key] = {
      name: prev.name,
      weight_percentage: prev.weight_percentage, // gewichten liggen vast (ISACA)
      mastery_score: clamp(next.mastery_score, prev.mastery_score),
      phase: typeof next.phase === 'string' ? next.phase : prev.phase,
      questions_attempted: nonNeg(next.questions_attempted, prev.questions_attempted),
      questions_correct: nonNeg(next.questions_correct, prev.questions_correct),
      weak_topics: strArr(next.weak_topics, prev.weak_topics),
      mastered_topics: strArr(next.mastered_topics, prev.mastered_topics),
    };
    // Fase volgt de mastery_score
    const m = domains[key].mastery_score;
    domains[key].phase = m <= 30 ? 'Fundament' : m <= 70 ? 'Toepassing & Context' : 'Examen-meesterschap';
  }

  const pe = previous.error_analytics;
  const ce = (c.error_analytics ?? {}) as Partial<CismState['error_analytics']>;
  const profile = (c.user_profile ?? {}) as Partial<CismState['user_profile']>;

  return {
    user_profile: {
      target_exam_date:
        typeof profile.target_exam_date === 'string' ? profile.target_exam_date : previous.user_profile.target_exam_date,
      current_focus_domain:
        typeof profile.current_focus_domain === 'string'
          ? profile.current_focus_domain
          : previous.user_profile.current_focus_domain,
      overall_readiness_score: computeReadiness(domains),
    },
    domains,
    error_analytics: {
      technical_reflex_errors: nonNeg(ce.technical_reflex_errors, pe.technical_reflex_errors),
      definition_knowledge_errors: nonNeg(ce.definition_knowledge_errors, pe.definition_knowledge_errors),
      misread_keyword_errors: nonNeg(ce.misread_keyword_errors, pe.misread_keyword_errors),
      recent_blind_spots: strArr(ce.recent_blind_spots, pe.recent_blind_spots).slice(-MAX_BLIND_SPOTS),
    },
    // Het intel-log wordt door de server (cron) gevuld; de chat mag alleen
    // een bestaand item als 'completed' markeren (na overhoring).
    progress_history: previous.progress_history ?? [],
    mistake_log: previous.mistake_log ?? [],
    weekly_intel_log: previous.weekly_intel_log.map((entry) => {
      const cLog = Array.isArray(c.weekly_intel_log) ? c.weekly_intel_log : [];
      const hit = cLog.find((x: any) => x && x.date === entry.date && x.topic === entry.topic);
      return hit && hit.completed === true ? { ...entry, completed: true } : entry;
    }),
  };
}

export const todayInAmsterdam = () =>
  new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Amsterdam' }).format(new Date()); // YYYY-MM-DD

/** Zet het meetpunt van vandaag (overschrijft een eerder punt van dezelfde dag). Max. 120 punten. */
export function withTodaySnapshot(state: CismState): CismState {
  const d = state.domains;
  const point = {
    date: todayInAmsterdam(),
    readiness: state.user_profile.overall_readiness_score,
    d1: d.domain_1_governance.mastery_score,
    d2: d.domain_2_risk_management.mastery_score,
    d3: d.domain_3_security_program.mastery_score,
    d4: d.domain_4_incident_management.mastery_score,
  };
  const history = (state.progress_history ?? []).filter((p) => p.date !== point.date);
  return { ...state, progress_history: [...history, point].slice(-120) };
}

/** De state zoals het model hem ziet: zonder de (lange) voortgangshistorie. */
export function stateForModel(state: CismState): Omit<CismState, 'progress_history' | 'mistake_log'> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { progress_history, mistake_log, ...rest } = state;
  return rest;
}

const ERROR_TYPES = ['technical_reflex', 'definition_knowledge', 'misread_keyword', 'other'] as const;
const str = (v: unknown, max = 600) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/**
 * Leest het optionele "last_answer"-object uit de STATE_UPDATE. Is het antwoord fout,
 * dan komt het in de foutenanalyse (max. 300 items).
 */
export function withMistakeFromUpdate(state: CismState, parsed: unknown): CismState {
  const la = (parsed as any)?.last_answer;
  if (!la || typeof la !== 'object' || la.correct !== false) return state;
  const entry: MistakeEntry = {
    date: todayInAmsterdam(),
    domain: DOMAIN_KEYS.includes(la.domain) ? la.domain : state.user_profile.current_focus_domain,
    topic: str(la.topic, 120) || 'Onbekend onderwerp',
    error_type: (ERROR_TYPES as readonly string[]).includes(la.error_type) ? la.error_type : 'other',
    question: str(la.question) || '(geen samenvatting)',
    your_answer: str(la.your_answer, 300) || undefined,
    correct_answer: str(la.correct_answer, 300) || undefined,
    lesson: str(la.lesson) || '',
  };
  return { ...state, mistake_log: [...(state.mistake_log ?? []), entry].slice(-300) };
}
