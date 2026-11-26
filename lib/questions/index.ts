import { D1_D2 } from './d1-d2';
import { D3_D4 } from './d3-d4';
import { D1_EXTRA } from './d1-extra';
import { D2_EXTRA } from './d2-extra';
import { D3_EXTRA } from './d3-extra';
import { D4_EXTRA } from './d4-extra';
import type { Question } from './types';

export type { Question, QuestionLevel } from './types';

const DOMAIN_ORDER = ['domain_1_governance', 'domain_2_risk_management', 'domain_3_security_program', 'domain_4_incident_management'];

/** 240 vragen: 60 per domein, elk met een zwaarte (basis / gemiddeld / examen). */
export const QUESTIONS: Question[] = [...D1_D2, ...D3_D4, ...D1_EXTRA, ...D2_EXTRA, ...D3_EXTRA, ...D4_EXTRA].sort(
  (a, b) => DOMAIN_ORDER.indexOf(a.domain) - DOMAIN_ORDER.indexOf(b.domain) || a.id.localeCompare(b.id),
);

const BY_ID = new Map(QUESTIONS.map((q) => [q.id, q]));

export const getQuestion = (id: string) => BY_ID.get(id);
