import 'server-only';
import { GoogleGenAI } from '@google/genai';

let client: GoogleGenAI | null = null;

/** Lazy client, zodat een build zonder GEMINI_API_KEY niet faalt. */
export function getGemini() {
  if (!client) client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  return client;
}

export const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
