import type { Question } from './types';

/**
 * Eigen oefenvragen in ISACA-stijl (geen officiële ISACA-vragen).
 * Per optie staat uitgelegd waarom die het (meest) juist of een valkuil is.
 */
export const D3_D4: Question[] = [
  // ================ Domein 3: Information Security Program ================
  {
    id: 'd3-01',
    domain: 'domain_3_security_program',
    topic: 'Metrics & KPIs',
    keyword: 'MOST',
    question:
      'De raad van bestuur wil weten of het securityprogramma waarde oplevert. Welke metric is daarvoor het MEEST geschikt?',
    options: [
      { text: 'Het aantal geblokkeerde aanvallen door de firewall per maand', why: 'Een technische, operationele metric. Het bestuur kan hier geen zakelijke conclusie uit trekken.', error_type: 'technical_reflex' },
      { text: 'Het aantal geïnstalleerde patches', why: 'Activiteit, geen resultaat. Zegt niets over de bijdrage aan bedrijfsdoelen.', error_type: 'technical_reflex' },
      { text: 'De mate waarin risico\'s op kritieke bedrijfsprocessen binnen de risk appetite blijven', why: 'Juist. Metrics voor het bestuur koppelen security aan bedrijfsdoelen en risk appetite. Dat is waar het bestuur over beslist.' },
      { text: 'Het percentage medewerkers dat de awareness-training heeft geopend', why: 'Meet deelname, niet effect. En het is geen metric op bestuursniveau.', error_type: 'definition_knowledge' },
    ],
    correct: 2,
  },
  {
    id: 'd3-02',
    domain: 'domain_3_security_program',
    topic: 'Third-Party Risk',
    keyword: 'FIRST',
    question:
      'De organisatie wil klantgegevens laten verwerken door een nieuwe cloudleverancier. Wat moet de information security manager als EERSTE doen?',
    options: [
      { text: 'Een risicobeoordeling van de leverancier en de dienst uitvoeren', why: 'Juist. Eerst begrijp je het risico (due diligence). Pas daarna weet je welke contracteisen en controls nodig zijn.' },
      { text: 'Een penetratietest op de omgeving van de leverancier laten doen', why: 'Technische reflex. Bovendien heb je hier meestal geen toestemming voor en weet je nog niet wat je zoekt.', error_type: 'technical_reflex' },
      { text: 'Security-eisen opnemen in het contract', why: 'Belangrijk, maar je weet pas welke eisen nodig zijn na de risicobeoordeling. Let op het woord EERSTE.', error_type: 'misread_keyword' },
      { text: 'De leverancier vragen om een ISO 27001-certificaat', why: 'Een certificaat is één bron van zekerheid, maar vervangt geen eigen risicobeoordeling van deze specifieke dienst.', error_type: 'definition_knowledge' },
    ],
    correct: 0,
  },
  {
    id: 'd3-03',
    domain: 'domain_3_security_program',
    topic: 'Third-Party Risk',
    keyword: 'BEST',
    question:
      'Hoe kan de organisatie het BESTE zorgen dat een outsourcingpartner zich blijvend aan de afgesproken securityeisen houdt?',
    options: [
      { text: 'De partner vertrouwen omdat hij gecertificeerd is', why: 'Vertrouwen zonder verificatie. Certificering is een momentopname.', error_type: 'definition_knowledge' },
      { text: 'Zelf de firewallregels van de partner beheren', why: 'Technische reflex. Je neemt het werk over in plaats van het te sturen.', error_type: 'technical_reflex' },
      { text: 'Een eenmalige audit bij de start van het contract', why: 'Eenmalig is niet blijvend. Let op het woord "blijvend" in de vraag.', error_type: 'misread_keyword' },
      { text: 'Right-to-audit en periodieke rapportage (SLA\'s, metrics) in het contract vastleggen', why: 'Juist. Je blijft verantwoordelijk voor het risico (accountability gaat niet over), dus je borgt doorlopend toezicht via het contract.' },
    ],
    correct: 3,
  },
  {
    id: 'd3-04',
    domain: 'domain_3_security_program',
    topic: 'Security Awareness',
    keyword: 'BEST',
    question: 'Wat is de BESTE manier om de effectiviteit van een security-awarenessprogramma te meten?',
    options: [
      { text: 'Het aantal gegeven trainingen tellen', why: 'Activiteit, geen effect.', error_type: 'definition_knowledge' },
      { text: 'Gedragsverandering meten, bijvoorbeeld het klik- en meldpercentage bij phishingsimulaties over tijd', why: 'Juist. Awareness is geslaagd als het gedrag verandert. Een trend in phishing-meldingen laat dat zien.' },
      { text: 'Medewerkers een tevredenheidsenquête laten invullen', why: 'Tevredenheid zegt niets over veiliger gedrag.', error_type: 'definition_knowledge' },
      { text: 'Een e-mailfilter installeren dat phishing tegenhoudt', why: 'Een technische control, geen meting van awareness.', error_type: 'technical_reflex' },
    ],
    correct: 1,
  },
  {
    id: 'd3-05',
    domain: 'domain_3_security_program',
    topic: 'Control Selection',
    keyword: 'PRIMARY',
    question: 'Wat is de PRIMAIRE factor bij het kiezen van een nieuwe security control?',
    options: [
      { text: 'Of de control de nieuwste technologie gebruikt', why: 'Technologie is een middel, geen doel.', error_type: 'technical_reflex' },
      { text: 'Wat vergelijkbare organisaties gebruiken', why: 'Benchmarking helpt, maar jouw risico\'s en context bepalen de keuze.', error_type: 'definition_knowledge' },
      { text: 'Of de kosten in verhouding staan tot de risicoreductie (kosten-baten)', why: 'Juist. ISACA-denken: een control is zinvol als de kosten niet hoger zijn dan het risico dat hij wegneemt.' },
      { text: 'Hoe snel de control te implementeren is', why: 'Snelheid is een praktisch punt, geen primaire factor.', error_type: 'misread_keyword' },
    ],
    correct: 2,
  },
  {
    id: 'd3-06',
    domain: 'domain_3_security_program',
    topic: 'Program Resources',
    keyword: 'BEST',
    question:
      'De information security manager heeft extra budget nodig voor het programma. Hoe kan het verzoek het BESTE worden onderbouwd?',
    options: [
      { text: 'Met een business case die laat zien welk risico wordt verlaagd en wat dat de organisatie oplevert', why: 'Juist. Het management beslist op basis van risico en waarde. Een business case spreekt hun taal.' },
      { text: 'Met een lijst van alle gevonden kwetsbaarheden', why: 'Technische taal. Het management kan hier geen prioriteit uit halen.', error_type: 'technical_reflex' },
      { text: 'Met nieuwsartikelen over recente hacks bij andere bedrijven', why: 'Angst (FUD) is geen onderbouwing en werkt maar kort.', error_type: 'definition_knowledge' },
      { text: 'Door te wijzen op het budget van vorig jaar', why: 'Historie zegt niets over de huidige risico\'s.', error_type: 'other' },
    ],
    correct: 0,
  },
  {
    id: 'd3-07',
    domain: 'domain_3_security_program',
    topic: 'Metrics & KPIs',
    keyword: 'MOST',
    question: 'Welk kenmerk maakt een security-metric het MEEST waardevol?',
    options: [
      { text: 'Hij is volledig geautomatiseerd te verzamelen', why: 'Handig, maar een makkelijk te meten getal kan nog steeds nutteloos zijn.', error_type: 'technical_reflex' },
      { text: 'Hij bevat zoveel mogelijk technische details', why: 'Te veel details maken een metric juist minder bruikbaar voor beslissingen.', error_type: 'technical_reflex' },
      { text: 'Hij wordt elke dag ververst', why: 'Frequentie is geen doel op zich.', error_type: 'misread_keyword' },
      { text: 'Hij ondersteunt een beslissing van de ontvanger en is gekoppeld aan een doel', why: 'Juist. Een goede metric is relevant voor wie hem leest en helpt een beslissing nemen.' },
    ],
    correct: 3,
  },
  {
    id: 'd3-08',
    domain: 'domain_3_security_program',
    topic: 'Security in Change / Projects',
    keyword: 'BEST',
    question: 'Wanneer kan security het BESTE worden meegenomen in een nieuw IT-project?',
    options: [
      { text: 'Na de go-live, via een pentest', why: 'Achteraf repareren is duur en soms onmogelijk.', error_type: 'technical_reflex' },
      { text: 'Vanaf de start, bij het vastleggen van de requirements', why: 'Juist. Security by design is goedkoper en effectiever dan achteraf toevoegen.' },
      { text: 'Tijdens de testfase', why: 'Te laat om ontwerpkeuzes nog goedkoop te veranderen.', error_type: 'misread_keyword' },
      { text: 'Alleen als het project persoonsgegevens verwerkt', why: 'Elk project kan risico\'s introduceren, niet alleen bij privacy.', error_type: 'definition_knowledge' },
    ],
    correct: 1,
  },
  {
    id: 'd3-09',
    domain: 'domain_3_security_program',
    topic: 'Compliance vs Security',
    keyword: 'PRIMARY',
    question:
      'Een organisatie voldoet aan alle eisen van de toezichthouder. Wat is voor de information security manager PRIMAIR de volgende zorg?',
    options: [
      { text: 'Niets, compliance betekent dat de organisatie veilig is', why: 'Compliance is een minimumeis, geen garantie dat de eigen risico\'s zijn afgedekt.', error_type: 'definition_knowledge' },
      { text: 'Meer firewalls plaatsen', why: 'Technische reflex zonder risicoanalyse.', error_type: 'technical_reflex' },
      { text: 'Of de resterende bedrijfsrisico\'s binnen de risk appetite vallen', why: 'Juist. Security draait om het beheersen van bedrijfsrisico, niet alleen om afvinken van regels.' },
      { text: 'Een externe certificering aanvragen', why: 'Nog meer compliance lost de onderliggende vraag niet op.', error_type: 'other' },
    ],
    correct: 2,
  },
  {
    id: 'd3-10',
    domain: 'domain_3_security_program',
    topic: 'Program Roadmap',
    keyword: 'FIRST',
    question:
      'Bij het opzetten van een securityprogramma is het gewenste niveau (target state) bepaald. Wat is de volgende stap die als EERSTE nodig is?',
    options: [
      { text: 'Tools aanschaffen die bij de target state passen', why: 'Je weet nog niet wat er ontbreekt.', error_type: 'technical_reflex' },
      { text: 'Medewerkers trainen', why: 'Mogelijk onderdeel van het plan, maar eerst moet je weten waar de gaten zitten.', error_type: 'misread_keyword' },
      { text: 'De KPI\'s voor het programma publiceren', why: 'Metrics volgen uit het plan, niet andersom.', error_type: 'definition_knowledge' },
      { text: 'De huidige situatie vaststellen en een gap-analyse maken', why: 'Juist. Pas als je het verschil tussen current en target state kent, kun je een roadmap maken.' },
    ],
    correct: 3,
  },

  // ===================== Domein 4: Incident Management =====================
  {
    id: 'd4-01',
    domain: 'domain_4_incident_management',
    topic: 'Containment vs Eradication order',
    keyword: 'FIRST',
    question:
      'Ransomware is gevonden op drie servers en verspreidt zich mogelijk verder. Wat moet het incident response team als EERSTE doen?',
    options: [
      { text: 'De malware van de servers verwijderen', why: 'Dat is eradication. Eerst stop je de verspreiding (containment), anders blijf je dweilen met de kraan open.', error_type: 'definition_knowledge' },
      { text: 'De getroffen servers isoleren van het netwerk', why: 'Juist. Containment komt vóór eradication en recovery: beperk eerst de schade.' },
      { text: 'De back-ups terugzetten', why: 'Recovery is een latere stap. Herstel nu en de back-up raakt ook besmet.', error_type: 'misread_keyword' },
      { text: 'De pers informeren', why: 'Communicatie loopt via het plan en de juiste rollen, en is niet de eerste actie.', error_type: 'other' },
    ],
    correct: 1,
  },
  {
    id: 'd4-02',
    domain: 'domain_4_incident_management',
    topic: 'Post-Incident Review',
    keyword: 'PRIMARY',
    question: 'Wat is het PRIMAIRE doel van een post-incident review (lessons learned)?',
    options: [
      { text: 'Vaststellen welke medewerker de fout heeft gemaakt', why: 'Een schuldvraag maakt mensen terughoudend met melden. Het doel is leren.', error_type: 'other' },
      { text: 'Het incident formeel afsluiten in het ticketsysteem', why: 'Administratie, niet het doel.', error_type: 'misread_keyword' },
      { text: 'Het incident response plan en de controls verbeteren', why: 'Juist. Lessons learned voeden het verbeteren van de response en het voorkomen van herhaling.' },
      { text: 'De technische oorzaak in detail documenteren', why: 'Root cause hoort erbij, maar is een middel om te verbeteren, geen doel op zich.', error_type: 'technical_reflex' },
    ],
    correct: 2,
  },
  {
    id: 'd4-03',
    domain: 'domain_4_incident_management',
    topic: 'Incident Response Plan',
    keyword: 'MOST',
    question: 'Wat is het MEEST belangrijke onderdeel van een incident response plan?',
    options: [
      { text: 'Duidelijke rollen, verantwoordelijkheden en escalatiepaden', why: 'Juist. In een crisis moet iedereen weten wie beslist en wie wat doet.' },
      { text: 'Een lijst met forensische tools', why: 'Handig, maar zonder rollen weet niemand wie ze inzet.', error_type: 'technical_reflex' },
      { text: 'De netwerktekening van de organisatie', why: 'Ondersteunende informatie, geen kern van het plan.', error_type: 'technical_reflex' },
      { text: 'Een standaard persbericht', why: 'Onderdeel van communicatie, maar niet het belangrijkste.', error_type: 'misread_keyword' },
    ],
    correct: 0,
  },
  {
    id: 'd4-04',
    domain: 'domain_4_incident_management',
    topic: 'Incident Classification',
    keyword: 'FIRST',
    question: 'Er komt een melding binnen van een mogelijk beveiligingsincident. Wat gebeurt er als EERSTE?',
    options: [
      { text: 'Direct alle systemen afsluiten', why: 'Overreactie zonder te weten wat er speelt. Dit kan meer schade doen dan het incident.', error_type: 'technical_reflex' },
      { text: 'Het bestuur informeren', why: 'Escalatie hangt af van de ernst. Die moet je eerst vaststellen.', error_type: 'misread_keyword' },
      { text: 'De oorzaak opsporen', why: 'Root-cause-analyse komt later.', error_type: 'definition_knowledge' },
      { text: 'De melding beoordelen en classificeren (triage) op ernst en impact', why: 'Juist. Eerst bepaal je of het echt een incident is en hoe ernstig, zodat de juiste respons volgt.' },
    ],
    correct: 3,
  },
  {
    id: 'd4-05',
    domain: 'domain_4_incident_management',
    topic: 'BCP vs DRP',
    keyword: 'PRIMARY',
    question: 'Wat is het PRIMAIRE verschil tussen een business continuity plan (BCP) en een disaster recovery plan (DRP)?',
    options: [
      { text: 'Een BCP gaat alleen over IT, een DRP over de hele organisatie', why: 'Precies andersom.', error_type: 'definition_knowledge' },
      { text: 'Een BCP houdt de kritieke bedrijfsprocessen draaiende, een DRP herstelt de IT-omgeving', why: 'Juist. Het DRP is een onderdeel dat het BCP ondersteunt.' },
      { text: 'Er is geen verschil, het zijn synoniemen', why: 'Ze hangen samen maar hebben een andere scope.', error_type: 'definition_knowledge' },
      { text: 'Een DRP wordt alleen gebruikt bij natuurrampen', why: 'Een DRP geldt voor elke verstoring van IT, ook bijvoorbeeld ransomware.', error_type: 'misread_keyword' },
    ],
    correct: 1,
  },
  {
    id: 'd4-06',
    domain: 'domain_4_incident_management',
    topic: 'Evidence Handling',
    keyword: 'BEST',
    question:
      'Bij een incident is mogelijk strafrechtelijk bewijs aanwezig op een laptop. Wat is de BESTE aanpak?',
    options: [
      { text: 'De laptop direct opnieuw installeren zodat de medewerker verder kan', why: 'Je vernietigt het bewijs.', error_type: 'technical_reflex' },
      { text: 'Zelf de bestanden doorzoeken om snel te zien wat er is gebeurd', why: 'Daarmee verander je het bewijs en breek je de chain of custody.', error_type: 'technical_reflex' },
      { text: 'Het bewijs veiligstellen volgens forensische procedures en de chain of custody vastleggen', why: 'Juist. Alleen zo blijft het bewijs bruikbaar in een juridisch traject.' },
      { text: 'De laptop uitzetten en in een kast leggen', why: 'Uitzetten kan vluchtig bewijs (geheugen) wissen, en zonder registratie is er geen chain of custody.', error_type: 'definition_knowledge' },
    ],
    correct: 2,
  },
  {
    id: 'd4-07',
    domain: 'domain_4_incident_management',
    topic: 'Plan Testing',
    keyword: 'BEST',
    question: 'Wat is de BESTE manier om te bevestigen dat het incident response plan werkt?',
    options: [
      { text: 'Het plan laten goedkeuren door het management', why: 'Goedkeuring zegt niets over werking in de praktijk.', error_type: 'definition_knowledge' },
      { text: 'Wachten op een echt incident', why: 'Dan ontdek je de gaten op het slechtst mogelijke moment.', error_type: 'other' },
      { text: 'Het plan door een consultant laten herschrijven', why: 'Herschrijven is geen test.', error_type: 'misread_keyword' },
      { text: 'Regelmatig oefenen, bijvoorbeeld met tabletop-oefeningen en simulaties', why: 'Juist. Testen laat zien of rollen, contacten en stappen kloppen, en levert verbeterpunten op.' },
    ],
    correct: 3,
  },
  {
    id: 'd4-08',
    domain: 'domain_4_incident_management',
    topic: 'Escalation & Communication',
    keyword: 'MOST',
    question:
      'Een datalek met persoonsgegevens is bevestigd. Wat is voor de information security manager het MEEST belangrijk om te regelen?',
    options: [
      { text: 'Tijdige escalatie naar het management en melding binnen de wettelijke termijn', why: 'Juist. Bij persoonsgegevens gelden meldplichten (zoals de AVG: 72 uur). Het management beslist over de bedrijfsimpact.' },
      { text: 'Alle logbestanden zelf analyseren voordat iemand wordt ingelicht', why: 'Je verliest kostbare tijd en mist mogelijk de wettelijke termijn.', error_type: 'technical_reflex' },
      { text: 'Het lek stilhouden tot de oorzaak bekend is', why: 'Dit kan in strijd zijn met de wet en schaadt het vertrouwen.', error_type: 'other' },
      { text: 'Direct alle wachtwoorden in de organisatie resetten', why: 'Een mogelijke maatregel, maar niet het belangrijkste en niet zonder analyse.', error_type: 'technical_reflex' },
    ],
    correct: 0,
  },
  {
    id: 'd4-09',
    domain: 'domain_4_incident_management',
    topic: 'BIA metrics (RTO/RPO)',
    keyword: 'PRIMARY',
    question: 'Op welke basis worden de herstelprioriteiten in een incident- of continuïteitsplan PRIMAIR bepaald?',
    options: [
      { text: 'De leeftijd van de systemen', why: 'Technische eigenschap, geen bedrijfsimpact.', error_type: 'technical_reflex' },
      { text: 'De voorkeur van de IT-afdeling', why: 'IT bepaalt niet de bedrijfsprioriteiten. Dat doen de proceseigenaren.', error_type: 'definition_knowledge' },
      { text: 'De uitkomsten van de business impact analysis (BIA)', why: 'Juist. De BIA bepaalt welke processen kritiek zijn en welke RTO/RPO daarbij horen.' },
      { text: 'De volgorde waarin systemen zijn aangeschaft', why: 'Geen relatie met bedrijfsimpact.', error_type: 'other' },
    ],
    correct: 2,
  },
  {
    id: 'd4-10',
    domain: 'domain_4_incident_management',
    topic: 'Recovery',
    keyword: 'FIRST',
    question:
      'De aanvaller is uit het netwerk verwijderd (eradication is afgerond). Wat moet er als EERSTE gebeuren voordat systemen weer in productie gaan?',
    options: [
      { text: 'Een persbericht uitsturen dat alles is opgelost', why: 'Te vroeg. Je weet nog niet of het herstel veilig is.', error_type: 'other' },
      { text: 'Controleren dat de systemen schoon zijn en de gebruikte kwetsbaarheid is gedicht', why: 'Juist. Pas na validatie herstel je naar productie, anders wordt je opnieuw getroffen.' },
      { text: 'De post-incident review houden', why: 'Die komt na het herstel. Let op de volgorde.', error_type: 'misread_keyword' },
      { text: 'Nieuwe hardware bestellen', why: 'Niet nodig zonder analyse, en geen eerste stap.', error_type: 'technical_reflex' },
    ],
    correct: 1,
  },
];
