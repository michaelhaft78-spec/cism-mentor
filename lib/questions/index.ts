import { D1_D2 } from './d1-d2';
import { D3_D4 } from './d3-d4';
import type { Question } from './types';

export type { Question } from './types';

export const QUESTIONS: Question[] = [...D1_D2, ...D3_D4];

const BY_ID = new Map(QUESTIONS.map((q) => [q.id, q]));

export const getQuestion = (id: string) => BY_ID.get(id);
