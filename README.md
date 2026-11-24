# CISM Mentor & Intel App

Persoonlijke web-app die je van **0 naar 100** brengt voor het ISACA **CISM**-examen:

- **Dashboard** met je readiness-score, afteller naar het examen, de 4 domeinen met voortgangsbalken, zwakke onderwerpen (klik = direct trainen), mindset-meter en blind spots.
- **Mentor-chat** (Gemini) met de volledige Master Prompt: leer-modus, diagnostische coach, en na elk antwoord automatisch bijgewerkte voortgang (`<STATE_UPDATE>`).
- **Wekelijkse intel-briefing**: elke maandag om 07:00 zoekt Gemini (met Google Search) de 3 belangrijkste infosec-ontwikkelingen van de week en koppelt ze aan de CISM-domeinen. Met knop "Overhoor mij over het nieuws van deze week".

Stack: Next.js (App Router, TypeScript) · Supabase (database + inloggen) · Gemini API (`gemini-2.5-flash`) · Vercel (hosting + cron).

---

## Installatie in 6 stappen (± 30 minuten)

Je hebt vier gratis accounts nodig: **GitHub** (heb je al), **Supabase**, **Google AI Studio** en **Vercel**. Je hoeft niets op je eigen computer te installeren.

### Stap 1 · Supabase-project en database

1. Ga naar [supabase.com](https://supabase.com) → **Start your project** → log in met GitHub.
2. **New project**. Naam: `cism-mentor`. Kies een sterk database-wachtwoord (bewaar het). Region: **Central EU (Frankfurt)**. Klik **Create**. Wacht ± 2 minuten.
3. Links in het menu: **SQL Editor** → **New query**.
4. Open in deze repo het bestand [`supabase/schema.sql`](supabase/schema.sql), kopieer de **volledige** inhoud, plak in de editor en klik **Run**. Je moet "Success. No rows returned" zien.
   Dit maakt drie tabellen (`user_cism_state`, `weekly_intel_briefings`, `chat_messages`) met **Row Level Security** aan: je kunt alleen je eigen gegevens zien.
5. Ga naar **Project Settings** (tandwiel) → **API Keys** (of **API**) en noteer:
   - **Project URL** (staat bij *Data API* of bovenaan, `https://xxxx.supabase.co`)
   - **anon / publishable key** → komt in `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role / secret key** → komt in `SUPABASE_SERVICE_ROLE_KEY`. ⚠️ Deze sleutel is **geheim**: deel hem nooit en zet hem nooit in GitHub.

### Stap 2 · Gemini API-key

1. Ga naar [aistudio.google.com](https://aistudio.google.com) en log in met je Google-account.
2. Klik **Get API key** → **Create API key**. Kopieer de sleutel → komt in `GEMINI_API_KEY`.

> Tip: het gratis niveau is genoeg om te starten. Op het gratis niveau mag Google je invoer gebruiken om modellen te verbeteren; zet je liever geen gevoelige werkinformatie in de chat, of koppel een betaalaccount.

### Stap 3 · Cron-geheim verzinnen

Bedenk een lange willekeurige string (minstens 32 tekens), bijvoorbeeld via [een wachtwoordgenerator](https://1password.com/password-generator). Die komt in `CRON_SECRET`. Vercel gebruikt hem om te bewijzen dat de wekelijkse taak echt van Vercel komt.

### Stap 4 · Deploy op Vercel

1. Ga naar [vercel.com](https://vercel.com) → **Sign up** met GitHub.
2. **Add New… → Project** → kies de repo **cism-mentor** → **Import**.
3. Open **Environment Variables** en voeg toe (naam links, waarde rechts):

   | Naam | Waarde |
   |---|---|
   | `GEMINI_API_KEY` | uit stap 2 |
   | `NEXT_PUBLIC_SUPABASE_URL` | Project URL uit stap 1 |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon/publishable key uit stap 1 |
   | `SUPABASE_SERVICE_ROLE_KEY` | service_role/secret key uit stap 1 |
   | `CRON_SECRET` | uit stap 3 |
   | `DEFAULT_USER_ID` | laat nog leeg, vul je in bij stap 6 |

4. Klik **Deploy**. Na ± 1 minuut krijg je een adres zoals `https://cism-mentor-xxxx.vercel.app`. Noteer het.

### Stap 5 · Inloglinks laten werken

1. Terug in Supabase → **Authentication** → **URL Configuration**.
2. **Site URL**: je Vercel-adres, bijv. `https://cism-mentor-xxxx.vercel.app`.
3. **Redirect URLs** → **Add URL**: `https://cism-mentor-xxxx.vercel.app/auth/callback` (en eventueel `http://localhost:3000/auth/callback`).
4. Open je Vercel-adres, vul je e-mailadres in en klik op de link in de mail. Je ziet nu je dashboard; je startstatus (readiness 31, focus D4) wordt automatisch aangemaakt.

### Stap 6 · Afmaken: cron-gebruiker en afsluiten

1. Supabase → **Authentication** → **Users** → klik op jouw gebruiker → kopieer de **User UID**.
2. Vercel → je project → **Settings** → **Environment Variables** → `DEFAULT_USER_ID` = die UID → **Save**.
3. Vercel → **Deployments** → bij de bovenste deployment **⋯ → Redeploy** (nodig zodat de nieuwe variabele actief wordt).
4. **Belangrijk:** Supabase → **Authentication** → **Sign In / Providers** (of **Settings**) → zet **Allow new users to sign up** **uit**. Zo kan niemand anders een account maken en jouw Gemini-tegoed gebruiken.

Klaar! Test de briefing direct met de knop **Genereer nu** in het dashboard, of via Vercel → **Settings → Cron Jobs → Run**.

---

## Hoe het werkt

### Mentor-chat (`/api/chat`)
1. De ingelogde gebruiker wordt uit de **sessie** gehaald (nooit uit de request body).
2. Je huidige state wordt uit Supabase gehaald en onder `<USER_STATE>` aan je bericht toegevoegd, samen met de laatste 20 chatberichten (zodat de mentor weet welke vraag hij stelde).
3. Gemini antwoordt met de Master Prompt ([`lib/master-prompt.ts`](lib/master-prompt.ts)) als `systemInstruction`.
4. Het `<STATE_UPDATE>`-blok wordt eruit geknipt, eventuele ```` ```json ````-fences worden verwijderd en de JSON wordt **gecontroleerd**: scores blijven tussen 0-100, gewichten liggen vast, de readiness wordt server-side herberekend (gewogen 17/20/33/30) en blind spots worden op max. 5 gehouden. Lukt het parsen niet, dan blijft je vorige stand staan en zie je een melding; er gaat nooit voortgang verloren.

### Wekelijkse intel (`/api/weekly-intel`)
- **Automatisch**: Vercel Cron roept elke maandag `0 6 * * 1` (UTC) aan = **07:00 Nederlandse wintertijd**. In de zomertijd wordt dat 08:00; wil je dan 07:00, zet het schema in [`vercel.json`](vercel.json) op `0 5 * * 1`.
- Gemini gebruikt **Google Search grounding** + de Master Prompt, slaat de briefing en bronnen op in `weekly_intel_briefings`, en voegt de 3 onderwerpen toe aan `weekly_intel_log` in je state.
- **Handmatig**: knop **Genereer nu** in het dashboard.

### Startstatus
Staat in [`lib/initial-state.ts`](lib/initial-state.ts) en wordt bij je eerste login automatisch opgeslagen. Wil je opnieuw beginnen: verwijder je rij in Supabase → **Table Editor** → `user_cism_state`; bij de volgende pagina-load wordt de startstatus opnieuw gezet.

---

## Lokaal draaien (optioneel)

Vereist Node.js 22+.

```bash
cp .env.example .env.local   # en vul de waarden in
npm install
npm run dev                  # open http://localhost:3000
```

## Projectstructuur

```
app/
  page.tsx                  dashboard (server: haalt state, briefing, chat op)
  login/page.tsx            inloggen met magic link
  auth/callback/route.ts    afhandeling inloglink
  api/chat/route.ts         mentor + state-update
  api/weekly-intel/route.ts wekelijkse briefing (cron GET, handmatig POST)
components/Dashboard.tsx    het dashboard en de chat
lib/master-prompt.ts        volledige Master System Prompt
lib/initial-state.ts        startstatus
lib/state.ts                STATE_UPDATE parsen, valideren, readiness berekenen
lib/intel.ts                briefing genereren + intel-log bijwerken
supabase/schema.sql         tabellen + Row Level Security
proxy.ts                    sessie verversen, niet-ingelogd → /login
vercel.json                 cron-schema
```
