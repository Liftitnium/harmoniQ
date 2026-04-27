import { GoogleGenerativeAI } from "@google/generative-ai";
import { validateServerEnv } from "@/lib/env";

let _instance: GoogleGenerativeAI | null = null;

export function getGemini() {
  if (!_instance) {
    validateServerEnv();
    const key = process.env.GEMINI_API_KEY!;
    _instance = new GoogleGenerativeAI(key);
  }
  return _instance;
}

export const GEMINI_MODEL = "gemini-2.0-flash";

export const GENERATION_CONFIG = {
  temperature: 0.7,
  maxOutputTokens: 8192,
} as const;
