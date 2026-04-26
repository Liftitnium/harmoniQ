import { GoogleGenerativeAI } from "@google/generative-ai";

let _instance: GoogleGenerativeAI | null = null;

export function getGemini() {
  if (!_instance) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("GEMINI_API_KEY is not set");
    _instance = new GoogleGenerativeAI(key);
  }
  return _instance;
}

export const GEMINI_MODEL = "gemini-2.0-flash";

export const GENERATION_CONFIG = {
  temperature: 0.7,
  maxOutputTokens: 8192,
} as const;
