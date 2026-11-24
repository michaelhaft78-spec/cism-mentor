import type { DomainKey, ErrorType } from '../types';

export type QuestionKeyword = 'FIRST' | 'BEST' | 'MOST' | 'PRIMARY';

export interface QuestionOption {
  text: string;
  /** Waarom deze optie (on)juist is. */
  why: string;
  /** Alleen bij foute opties: welk type denkfout dit antwoord meestal verraadt. */
  error_type?: ErrorType;
}

export interface Question {
  id: string;
  domain: DomainKey;
  topic: string;
  keyword: QuestionKeyword;
  question: string;
  options: QuestionOption[];
  correct: number;
}
