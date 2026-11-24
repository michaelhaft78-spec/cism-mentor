import type { Question } from './questions/types';
import { computeReadiness, todayInAmsterdam, withTodaySnapshot } from './state';
import type { CismState, ErrorType } from './types';

const MAX_BLIND_SPOTS = 5;
const MASTERY_STREAK = 3;
const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
const phaseOf = (m: number) => (m <= 30 ? 'Fundament' : m <= 70 ? 'Toepassing & Context' : 'Examen-meesterschap');

const COUNTER: Record<Exclude<ErrorType, 'other'>, 'technical_reflex_errors' | 'definition_knowledge_errors' | 'misread_keyword_errors'> = {
  technical_reflex: 'technical_reflex_errors',
  definition_knowledge: 'definition_knowledge_errors',
  misread_keyword: 'misread_keyword_errors',
};

/**
 * Verwerkt één antwoord op een meerkeuzevraag uit de vragenbank, volgens het STATE PROTOCOL:
 * goed +3, fout -1, beheerst na 3 keer goed op rij, fouten in de foutenanalyse.
 */
export function applyQuizAnswer(state: CismState, q: Question, choice: number): { state: CismState; correct: boolean } {
  const correct = choice === q.correct;
  const picked = q.options[choice];
  const prev = state.domains[q.domain];
  const progress = state.quiz_progress ?? { results: {}, topic_streaks: {} };
  const streak = correct ? (progress.topic_streaks[q.topic] ?? 0) + 1 : 0;

  let weak = prev.weak_topics.slice();
  let mastered = prev.mastered_topics.slice();
  if (correct && streak >= MASTERY_STREAK) {
    weak = weak.filter((t) => t !== q.topic);
    if (!mastered.includes(q.topic)) mastered.push(q.topic);
  } else if (!correct) {
    mastered = mastered.filter((t) => t !== q.topic);
    if (!weak.includes(q.topic)) weak.push(q.topic);
  }

  const mastery = clamp(prev.mastery_score + (correct ? 3 : -1));
  const domains = {
    ...state.domains,
    [q.domain]: {
      ...prev,
      mastery_score: mastery,
      phase: phaseOf(mastery),
      questions_attempted: prev.questions_attempted + 1,
      questions_correct: prev.questions_correct + (correct ? 1 : 0),
      weak_topics: weak,
      mastered_topics: mastered,
    },
  };

  const errorType: ErrorType = picked?.error_type ?? 'other';
  const ea = { ...state.error_analytics };
  let mistakeLog = state.mistake_log ?? [];
  if (!correct) {
    if (errorType !== 'other') ea[COUNTER[errorType]] += 1;
    const spot = `${q.topic}: ${picked?.why ?? ''}`.slice(0, 160);
    ea.recent_blind_spots = [...ea.recent_blind_spots.filter((s) => !s.startsWith(`${q.topic}:`)), spot].slice(
      -MAX_BLIND_SPOTS,
    );
    mistakeLog = [
      ...mistakeLog,
      {
        date: todayInAmsterdam(),
        domain: q.domain,
        topic: q.topic,
        error_type: errorType,
        question: q.question,
        your_answer: picked?.text,
        correct_answer: q.options[q.correct].text,
        lesson: q.options[q.correct].why.replace(/^Juist\.\s*/, ''),
      },
    ].slice(-300);
  }

  const next: CismState = {
    ...state,
    domains,
    error_analytics: ea,
    mistake_log: mistakeLog,
    quiz_progress: {
      results: { ...progress.results, [q.id]: correct },
      topic_streaks: { ...progress.topic_streaks, [q.topic]: streak },
    },
    user_profile: { ...state.user_profile, overall_readiness_score: computeReadiness(domains) },
  };
  return { state: withTodaySnapshot(next), correct };
}
