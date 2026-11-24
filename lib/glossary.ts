import type { DomainKey } from './types';

export interface GlossaryTerm {
  term: string;
  domain: DomainKey | 'all';
  /** Uitleg in gewone taal. */
  plain: string;
  /** Hoe ISACA ernaar kijkt / wat het examen wil horen. */
  exam: string;
  /** Begrip waarmee het vaak verward wordt. */
  confuse?: string;
}

/**
 * Kennisbank: kernbegrippen van het CISM-examen in begrijpelijke taal.
 * Engelse ISACA-termen blijven staan, uitleg is Nederlands.
 */
export const GLOSSARY: GlossaryTerm[] = [
  // ---------------- Domein 1: Governance ----------------
  {
    term: 'Information Security Governance',
    domain: 'domain_1_governance',
    plain: 'Hoe de top van de organisatie richting geeft aan informatiebeveiliging: wie beslist, wie verantwoordelijk is en hoe je bewaakt dat beveiliging de bedrijfsdoelen dient.',
    exam: 'Governance is de verantwoordelijkheid van de raad van bestuur en het senior management, niet van IT. Bij twijfel: kies het antwoord dat beveiliging koppelt aan bedrijfsdoelen.',
    confuse: 'Security Management (de uitvoering, het dagelijkse "hoe")',
  },
  {
    term: 'Business Alignment',
    domain: 'domain_1_governance',
    plain: 'Zorgen dat beveiliging de bedrijfsstrategie ondersteunt in plaats van een los IT-project te zijn.',
    exam: 'De belangrijkste reden voor een security-strategie is business alignment. Het eerste wat je doet bij een nieuwe strategie: de bedrijfsdoelen begrijpen.',
  },
  {
    term: 'Security Strategy',
    domain: 'domain_1_governance',
    plain: 'Het plan om van de huidige beveiligingssituatie (current state) naar de gewenste situatie (desired state) te komen.',
    exam: 'Een goede strategie begint bij bedrijfsdoelen, kent een gap-analyse tussen current en desired state, en levert een roadmap op.',
  },
  {
    term: 'Policy vs Standard vs Procedure vs Guideline',
    domain: 'domain_1_governance',
    plain: 'Policy = wát en waarom (intentie van management). Standard = verplichte, meetbare eisen. Procedure = stap-voor-stap hoe. Guideline = vrijblijvend advies.',
    exam: 'Policies veranderen zelden en worden goedgekeurd door senior management. Standards zijn verplicht en concreet, guidelines niet.',
  },
  {
    term: 'Reporting Lines',
    domain: 'domain_1_governance',
    plain: 'Aan wie de security manager / CISO rapporteert.',
    exam: 'Het beste is rapporteren aan een niveau dat onafhankelijk is van IT (bijv. CEO of bestuur), zodat er geen belangenconflict is met IT-operations.',
  },
  {
    term: 'Steering Committee',
    domain: 'domain_1_governance',
    plain: 'Een overleg met vertegenwoordigers van verschillende afdelingen dat beveiligingskeuzes afstemt en prioriteert.',
    exam: 'Zorgt voor draagvlak en business-betrokkenheid. Bij vragen over "commitment van het management krijgen" is dit vaak het juiste antwoord.',
  },
  {
    term: 'Data Owner vs Data Custodian',
    domain: 'domain_1_governance',
    plain: 'De owner (een business-manager) beslist over de data: classificatie en wie toegang krijgt. De custodian (vaak IT) beheert en beschermt de data volgens die beslissingen.',
    exam: 'Toegang goedkeuren en classificeren = data owner. Back-ups maken en controls uitvoeren = custodian.',
    confuse: 'Data Custodian',
  },
  {
    term: 'Due Care vs Due Diligence',
    domain: 'domain_1_governance',
    plain: 'Due diligence = onderzoeken en begrijpen wat de risico\'s zijn. Due care = vervolgens redelijke maatregelen nemen, zoals een verstandig persoon zou doen.',
    exam: 'Ezelsbruggetje: eerst kijken (diligence), dan doen (care). Beide beschermen het management tegen nalatigheid.',
  },
  {
    term: 'Business Case',
    domain: 'domain_1_governance',
    plain: 'Een onderbouwing waarom een investering de moeite waard is: kosten, baten, risico\'s en alternatieven.',
    exam: 'Een beveiligingsinvestering wordt gerechtvaardigd met een business case, niet met technische argumenten.',
  },

  // ---------------- Domein 2: Risk Management ----------------
  {
    term: 'Risk Appetite',
    domain: 'domain_2_risk_management',
    plain: 'Hoeveel risico de organisatie in het algemeen bereid is te nemen om haar doelen te halen. Een strategische keuze van het bestuur.',
    exam: 'Wordt bepaald door senior management / bestuur. Alle risicobeslissingen moeten binnen de risk appetite vallen.',
    confuse: 'Risk Tolerance',
  },
  {
    term: 'Risk Tolerance',
    domain: 'domain_2_risk_management',
    plain: 'De acceptabele afwijking rondom de risk appetite, vaak per doel of activiteit en meetbaar (bijv. "maximaal 4 uur uitval").',
    exam: 'Appetite = het algemene niveau; tolerance = de grens van wat nog acceptabel is per situatie.',
    confuse: 'Risk Appetite',
  },
  {
    term: 'Risk Capacity',
    domain: 'domain_2_risk_management',
    plain: 'Het maximale risico dat de organisatie kan dragen zonder om te vallen.',
    exam: 'Risk appetite ligt altijd onder de risk capacity.',
  },
  {
    term: 'Inherent Risk vs Residual Risk',
    domain: 'domain_2_risk_management',
    plain: 'Inherent risk = het risico zonder maatregelen. Residual risk = het risico dat overblijft nadat maatregelen zijn genomen.',
    exam: 'Het doel is niet nul risico, maar een residual risk binnen de risk appetite. De risk owner accepteert het restrisico formeel.',
  },
  {
    term: 'Risk Owner',
    domain: 'domain_2_risk_management',
    plain: 'De (business)persoon die verantwoordelijk is voor een risico en beslist hoe ermee om te gaan.',
    exam: 'De risk owner, niet de security manager, accepteert risico\'s. De security manager adviseert.',
  },
  {
    term: 'Risk Treatment (4 opties)',
    domain: 'domain_2_risk_management',
    plain: 'De vier manieren om met een risico om te gaan: mitigate (verkleinen), transfer (overdragen, bijv. verzekering), avoid (activiteit stoppen) en accept (bewust accepteren).',
    exam: 'Bij transfer blijft de verantwoordelijkheid bij de organisatie, alleen de financiële impact verschuift.',
  },
  {
    term: 'Risk Assessment',
    domain: 'domain_2_risk_management',
    plain: 'Het in kaart brengen van dreigingen, kwetsbaarheden, kans en impact om te bepalen hoe groot een risico is.',
    exam: 'Vóór je maatregelen kiest, doe je FIRST een risk assessment. Een technische fix zonder assessment is bijna altijd het foute antwoord.',
  },
  {
    term: 'Risk Register',
    domain: 'domain_2_risk_management',
    plain: 'Een overzicht van alle bekende risico\'s met hun eigenaar, score, maatregelen en status.',
    exam: 'Een nieuw ontdekt risico wordt eerst in het risk register gezet en aan een risk owner gekoppeld.',
  },
  {
    term: 'BIA (Business Impact Analysis)',
    domain: 'domain_2_risk_management',
    plain: 'Onderzoek naar welke bedrijfsprocessen het belangrijkst zijn en wat de gevolgen zijn als ze uitvallen.',
    exam: 'De BIA bepaalt de prioriteiten en levert RTO en RPO op. Hij wordt gedaan vóór je een continuïteitsstrategie kiest.',
  },
  {
    term: 'RTO (Recovery Time Objective)',
    domain: 'domain_2_risk_management',
    plain: 'Hoe snel een proces of systeem weer moet werken na een verstoring. Gaat over tijd van uitval.',
    exam: 'Lage RTO = snel herstel nodig = duurdere oplossing (bijv. hot site).',
    confuse: 'RPO',
  },
  {
    term: 'RPO (Recovery Point Objective)',
    domain: 'domain_2_risk_management',
    plain: 'Hoeveel dataverlies acceptabel is, gemeten in tijd. RPO van 1 uur = je mag maximaal het laatste uur aan data kwijtraken.',
    exam: 'RPO bepaalt hoe vaak je back-ups of replicatie nodig hebt.',
    confuse: 'RTO',
  },
  {
    term: 'MTO / MTD (Maximum Tolerable Outage / Downtime)',
    domain: 'domain_2_risk_management',
    plain: 'De absolute maximale tijd dat een proces kan uitvallen voordat de schade onacceptabel wordt.',
    exam: 'De RTO moet altijd korter zijn dan de MTO.',
  },
  {
    term: 'KRI (Key Risk Indicator)',
    domain: 'domain_2_risk_management',
    plain: 'Een meetbare waarschuwing dat een risico groter wordt, bijv. het aantal ongepatchte kritieke systemen.',
    exam: 'KRI\'s zijn vooruitkijkend (early warning). KPI\'s meten prestaties achteraf.',
    confuse: 'KPI',
  },

  // ---------------- Domein 3: Security Program ----------------
  {
    term: 'Information Security Program',
    domain: 'domain_3_security_program',
    plain: 'Het geheel van projecten, processen, mensen en middelen waarmee de security-strategie wordt uitgevoerd.',
    exam: 'Het programma voert de strategie uit. Het moet meetbaar zijn en aansluiten op de business.',
  },
  {
    term: 'KPI (Key Performance Indicator)',
    domain: 'domain_3_security_program',
    plain: 'Een meetwaarde die laat zien of een proces of maatregel goed presteert, bijv. "% systemen gepatcht binnen 30 dagen".',
    exam: 'Goede metrics zijn relevant voor de doelgroep: het bestuur wil business-impact zien, geen technische details.',
    confuse: 'KRI',
  },
  {
    term: 'KGI (Key Goal Indicator)',
    domain: 'domain_3_security_program',
    plain: 'Meet of een doel uiteindelijk gehaald is (het resultaat), terwijl een KPI meet hoe goed het proces ernaartoe loopt.',
    exam: 'KGI = wat (uitkomst), KPI = hoe (proces).',
  },
  {
    term: 'Control (preventief, detectief, correctief)',
    domain: 'domain_3_security_program',
    plain: 'Een maatregel om risico te beperken. Preventief voorkomt (bijv. toegangsbeheer), detectief signaleert (bijv. logging), correctief herstelt (bijv. back-up terugzetten).',
    exam: 'Kies controls op basis van risico en kosten-baten. De kosten van een control mogen niet hoger zijn dan het risico dat hij afdekt.',
  },
  {
    term: 'Compensating Control',
    domain: 'domain_3_security_program',
    plain: 'Een alternatieve maatregel als de gewenste maatregel niet mogelijk of te duur is.',
    exam: 'Logisch antwoord als een standaardmaatregel niet haalbaar is, maar het risico wel beperkt moet worden.',
  },
  {
    term: 'Third-Party Risk',
    domain: 'domain_3_security_program',
    plain: 'Risico\'s die ontstaan doordat je met leveranciers of partners werkt, bijv. een cloudleverancier met toegang tot je data.',
    exam: 'Beveiligingseisen leg je vast in het contract, vóór ondertekening. Je blijft zelf verantwoordelijk, ook als je uitbesteedt.',
  },
  {
    term: 'Right to Audit',
    domain: 'domain_3_security_program',
    plain: 'Een contractclausule die je het recht geeft de beveiliging van een leverancier te (laten) controleren.',
    exam: 'Het belangrijkste wat je in een outsourcingcontract wilt hebben om zekerheid te krijgen.',
  },
  {
    term: 'Security Awareness',
    domain: 'domain_3_security_program',
    plain: 'Medewerkers bewust maken van risico\'s en het juiste gedrag, bijv. phishing herkennen.',
    exam: 'Effectiviteit meet je aan gedrag (bijv. minder klikken op phishingtests), niet aan het aantal gevolgde trainingen.',
  },
  {
    term: 'Defense in Depth',
    domain: 'domain_3_security_program',
    plain: 'Meerdere beveiligingslagen achter elkaar, zodat het falen van één laag niet meteen tot schade leidt.',
    exam: 'Verkleint de kans dat één zwakke plek het hele systeem compromitteert.',
  },
  {
    term: 'Gap Analysis',
    domain: 'domain_3_security_program',
    plain: 'Vergelijken van de huidige situatie met de gewenste situatie (of met een norm) om te zien wat ontbreekt.',
    exam: 'Basis voor de roadmap van het security-programma.',
  },

  // ---------------- Domein 4: Incident Management ----------------
  {
    term: 'Incident Response Plan (IRP)',
    domain: 'domain_4_incident_management',
    plain: 'Het vooraf vastgelegde draaiboek voor wat je doet bij een beveiligingsincident: rollen, stappen, communicatie.',
    exam: 'Bij een incident volg je FIRST het plan. Het plan moet goedgekeurd, getest en bekend zijn.',
  },
  {
    term: 'Fasen van incident response',
    domain: 'domain_4_incident_management',
    plain: 'Voorbereiden → detecteren en analyseren → containment (inperken) → eradication (oorzaak verwijderen) → recovery (herstellen) → lessons learned.',
    exam: 'De volgorde is cruciaal: eerst inperken, dan pas de oorzaak verwijderen, dan herstellen.',
  },
  {
    term: 'Containment',
    domain: 'domain_4_incident_management',
    plain: 'Het incident inperken zodat de schade zich niet verder verspreidt, bijv. een besmette server van het netwerk halen.',
    exam: 'Bij een actief incident (bijv. ransomware die zich verspreidt) is containment het FIRST-antwoord, vóór eradication en vóór forensisch onderzoek.',
    confuse: 'Eradication',
  },
  {
    term: 'Eradication',
    domain: 'domain_4_incident_management',
    plain: 'De oorzaak van het incident verwijderen, bijv. malware opruimen of een lek dichten.',
    exam: 'Komt ná containment. Wie eerst gaat opruimen terwijl het incident zich nog verspreidt, kiest het foute antwoord.',
    confuse: 'Containment',
  },
  {
    term: 'Recovery',
    domain: 'domain_4_incident_management',
    plain: 'Systemen en processen weer normaal laten werken, bijv. schone back-ups terugzetten.',
    exam: 'Herstelvolgorde volgt de prioriteiten uit de BIA.',
  },
  {
    term: 'Post-Incident Review (Lessons Learned)',
    domain: 'domain_4_incident_management',
    plain: 'Na afloop evalueren wat er gebeurde, wat goed en fout ging en wat je verbetert.',
    exam: 'Doel: het proces en de controls verbeteren, niet schuldigen aanwijzen. Uitkomsten leiden tot updates van het IRP en het risk register.',
  },
  {
    term: 'Escalation',
    domain: 'domain_4_incident_management',
    plain: 'Een incident doorzetten naar een hoger niveau of naar de juiste mensen als het ernstiger is dan gedacht.',
    exam: 'Escalatiecriteria en contactpersonen staan vooraf in het plan.',
  },
  {
    term: 'Chain of Custody',
    domain: 'domain_4_incident_management',
    plain: 'Vastleggen wie bewijsmateriaal wanneer in handen had, zodat het bruikbaar blijft voor juridische stappen.',
    exam: 'Belangrijk als een incident mogelijk tot een rechtszaak of aangifte leidt.',
  },
  {
    term: 'BCP vs DRP',
    domain: 'domain_4_incident_management',
    plain: 'BCP (Business Continuity Plan) = hoe de hele organisatie blijft functioneren bij een verstoring. DRP (Disaster Recovery Plan) = hoe je de IT-systemen herstelt.',
    exam: 'DRP is een onderdeel van het bredere BCP.',
  },
  {
    term: 'Hot / Warm / Cold Site',
    domain: 'domain_4_incident_management',
    plain: 'Uitwijklocaties. Hot = direct inzetbaar, volledig ingericht (duur). Warm = deels ingericht. Cold = alleen ruimte en stroom (goedkoop, traag).',
    exam: 'Kies op basis van RTO en kosten: lage RTO = hot site.',
  },
  {
    term: 'Tabletop Exercise',
    domain: 'domain_4_incident_management',
    plain: 'Een oefening aan tafel waarbij het team een incidentscenario doorloopt zonder systemen echt te raken.',
    exam: 'Goedkope, veilige manier om het plan en de rolverdeling te testen.',
  },

  // ---------------- Examenstrategie ----------------
  {
    term: 'FIRST / BEST / MOST / PRIMARY',
    domain: 'all',
    plain: 'Sleutelwoorden in examenvragen. Vaak zijn meerdere antwoorden "goed", maar er is er één die het eerst, het best of het belangrijkst is.',
    exam: 'Lees de vraag twee keer en onderstreep het sleutelwoord. Bij FIRST: wat komt in het proces als eerste? Vaak is dat begrijpen, beoordelen of het plan volgen, niet een technische actie.',
  },
  {
    term: 'Denk als manager, niet als techneut',
    domain: 'all',
    plain: 'CISM test of je beslist als security manager: vanuit business, risico en governance.',
    exam: 'Foute antwoorden zijn vaak technische fixes (firewall aanpassen, patch installeren) zonder risk assessment of goedkeuring van management.',
  },
];

export const GLOSSARY_DOMAIN_LABEL: Record<GlossaryTerm['domain'], string> = {
  domain_1_governance: 'D1 Governance',
  domain_2_risk_management: 'D2 Risk Management',
  domain_3_security_program: 'D3 Security Program',
  domain_4_incident_management: 'D4 Incident Management',
  all: 'Examenstrategie',
};
