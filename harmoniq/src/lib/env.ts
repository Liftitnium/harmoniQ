const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

const serverRequired = ["GEMINI_API_KEY"] as const;

export function validateEnv() {
  const missing: string[] = [];

  for (const key of required) {
    if (!process.env[key]) missing.push(key);
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map((k) => `  - ${k}`).join("\n")}\n\nCopy .env.local.example to .env.local and fill in all values.`,
    );
  }
}

export function validateServerEnv() {
  validateEnv();

  const missing: string[] = [];

  for (const key of serverRequired) {
    if (!process.env[key]) missing.push(key);
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing server-side environment variables:\n${missing.map((k) => `  - ${k}`).join("\n")}\n\nThese must be set in your deployment environment (not prefixed with NEXT_PUBLIC_).`,
    );
  }
}

export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}
