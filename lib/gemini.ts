import 'server-only';
import { GoogleGenAI, type GenerateContentParameters } from '@google/genai';

let client: GoogleGenAI | null = null;

/** Lazy client, zodat een build zonder GEMINI_API_KEY niet faalt. */
export function getGemini() {
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY ontbreekt in de Vercel Environment Variables.');
  if (!client) client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return client;
}

/**
 * Modellen in volgorde van voorkeur. `gemini-flash-latest` is Googles alias die
 * altijd naar het actuele Flash-model wijst, zodat de app niet stukgaat als een
 * vaste versie (zoals gemini-2.5-flash) wordt uitgefaseerd.
 */
const MODELS = [...new Set([process.env.GEMINI_MODEL, 'gemini-flash-latest', 'gemini-2.5-flash'].filter(Boolean))] as string[];

const isModelUnavailable = (e: unknown) =>
  /404|not[ _]found|no longer available|is not supported|deprecated/i.test(String((e as Error)?.message ?? e));

/** generateContent met automatische terugval naar het volgende model als een model niet (meer) bestaat. */
export async function generateWithFallback(params: Omit<GenerateContentParameters, 'model'>) {
  let lastError: unknown;
  for (const model of MODELS) {
    try {
      return await getGemini().models.generateContent({ ...params, model });
    } catch (e) {
      lastError = e;
      if (!isModelUnavailable(e)) break;
      console.warn(`Gemini-model ${model} niet beschikbaar, probeer volgende.`);
    }
  }
  throw lastError;
}

/** Vertaalt Gemini-fouten naar een begrijpelijke Nederlandse melding. */
export function describeGeminiError(e: unknown): string {
  const msg = String((e as Error)?.message ?? e);
  if (/GEMINI_API_KEY ontbreekt/.test(msg)) return msg;
  if (/api key not valid|API_KEY_INVALID|permission denied|403/i.test(msg))
    return 'De Gemini API-key is ongeldig. Controleer GEMINI_API_KEY in Vercel en doe een Redeploy.';
  if (/429|quota|rate limit|RESOURCE_EXHAUSTED/i.test(msg))
    return 'Het Gemini-tegoed of de limiet per minuut is bereikt. Wacht even en probeer het opnieuw.';
  if (isModelUnavailable(e)) return 'Het Gemini-model is niet beschikbaar. Stel GEMINI_MODEL in Vercel in op een actueel model.';
  return `Gemini gaf een fout: ${msg.slice(0, 300)}`;
}
