/** Domínio canônico do produto — usado em metadata, e-mails e fallbacks server-side. */
export const SITE_DOMAIN = "vislumbre.me";
export const SITE_URL = `https://${SITE_DOMAIN}`;
export const SITE_NAME = "Vislumbre";

/** URL pública efetiva (Vercel env ou domínio canônico). */
export function publicAppUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (process.env.NODE_ENV === "production") return SITE_URL;
  return "http://localhost:3000";
}
