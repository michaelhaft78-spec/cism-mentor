export type DomainKey =
  | 'domain_1_governance'
  | 'domain_2_risk_management'
  | 'domain_3_security_program'
  | 'domain_4_incident_management';

export interface DomainState {
  name: string;
  weight_percentage: number;
  mastery_score: number;
  phase: string;
  questions_attempted: number;
  questions_correct: number;
  weak_topics: string[];
  mastered_topics: string[];
}

export interface IntelLogEntry {
  date: string;
  topic: string;
  linked_domain: DomainKey | string;
  completed: boolean;
}

export interface CismState {
  user_profile: {
    target_exam_date: string;
    overall_readiness_score: number;
    current_focus_domain: DomainKey | string;
  };
  domains: Record<DomainKey, DomainState>;
  error_analytics: {
    technical_reflex_errors: number;
    definition_knowledge_errors: number;
    misread_keyword_errors: number;
    recent_blind_spots: string[];
  };
  weekly_intel_log: IntelLogEntry[];
}

export interface Briefing {
  id: string;
  week_label: string;
  briefing_markdown: string;
  sources: unknown;
  created_at: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}
