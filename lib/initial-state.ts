import type { CismState } from './types';

/**
 * Startstatus voor een nieuwe gebruiker (Michaels stand van 24 nov 2026).
 * Wordt automatisch in Supabase gezet bij de eerste login als er nog geen state is.
 */
export const INITIAL_STATE: CismState = {
  user_profile: {
    target_exam_date: '2026-12-15',
    overall_readiness_score: 31,
    current_focus_domain: 'domain_4_incident_management',
  },
  domains: {
    domain_1_governance: {
      name: 'Information Security Governance',
      weight_percentage: 17,
      mastery_score: 45,
      phase: 'Toepassing & Context',
      questions_attempted: 20,
      questions_correct: 12,
      weak_topics: ['Business Alignment', 'Reporting Lines'],
      mastered_topics: ['Security Policy vs Standards'],
    },
    domain_2_risk_management: {
      name: 'Information Security Risk Management',
      weight_percentage: 20,
      mastery_score: 33,
      phase: 'Toepassing & Context',
      questions_attempted: 11,
      questions_correct: 6,
      weak_topics: ['Risk Appetite vs Tolerance', 'BIA metrics (RTO/RPO)'],
      mastered_topics: [],
    },
    domain_3_security_program: {
      name: 'Information Security Program',
      weight_percentage: 33,
      mastery_score: 25,
      phase: 'Fundament',
      questions_attempted: 8,
      questions_correct: 4,
      weak_topics: ['Metrics & KPIs', 'Third-Party Risk'],
      mastered_topics: [],
    },
    domain_4_incident_management: {
      name: 'Incident Management',
      weight_percentage: 30,
      mastery_score: 28,
      phase: 'Fundament',
      questions_attempted: 12,
      questions_correct: 6,
      weak_topics: ['Containment vs Eradication order', 'Post-Incident Review'],
      mastered_topics: [],
    },
  },
  error_analytics: {
    technical_reflex_errors: 7,
    definition_knowledge_errors: 4,
    misread_keyword_errors: 3,
    recent_blind_spots: [
      'Kiest te snel voor een technische fix (bijv. firewall aanpassen) voordat risk assessment of management goedkeuring plaatsvindt.',
      "Mist het sleutelwoord 'FIRST' in incident response scenario's.",
      'Geeft een antwoord zonder onderbouwing; de ISACA-redenering (waarom MOST/BEST/FIRST) ontbreekt.',
    ],
  },
  weekly_intel_log: [
    {
      date: '2026-11-24',
      topic: 'NIS2 / Cyberbeveiligingswet toezicht',
      linked_domain: 'domain_1_governance',
      completed: true,
    },
  ],
  progress_history: [{ date: '2026-11-24', readiness: 31, d1: 45, d2: 33, d3: 25, d4: 28 }],
};
