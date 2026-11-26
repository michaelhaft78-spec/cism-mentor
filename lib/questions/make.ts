import type { DomainKey, ErrorType } from '../types';
import type { Question, QuestionKeyword, QuestionLevel } from './types';

/** [tekst, uitleg, denkfout]. De optie zonder denkfout is het juiste antwoord. */
export type Opt = [text: string, why: string, error?: Exclude<ErrorType, 'other'>];

const LEVEL: Record<'B' | 'G' | 'E', QuestionLevel> = { B: 'basis', G: 'gemiddeld', E: 'examen' };

/** Compacte schrijfwijze voor vragen: precies één optie heeft geen denkfout, en dat is het juiste antwoord. */
export function bank(
  domain: DomainKey,
  prefix: string,
  rows: [num: number, level: 'B' | 'G' | 'E', topic: string, keyword: QuestionKeyword, question: string, options: Opt[]][],
): Question[] {
  return rows.map(([num, level, topic, keyword, question, opts]) => {
    const correct = opts.findIndex((o) => !o[2]);
    if (opts.length !== 4 || correct < 0 || opts.filter((o) => !o[2]).length !== 1) {
      throw new Error(`Vraag ${prefix}-${num}: nodig zijn 4 opties met precies één juiste.`);
    }
    return {
      id: `${prefix}-${String(num).padStart(2, '0')}`,
      domain,
      level: LEVEL[level],
      topic,
      keyword,
      question,
      options: opts.map(([text, why, error_type]) => (error_type ? { text, why, error_type } : { text, why })),
      correct,
    };
  });
}
