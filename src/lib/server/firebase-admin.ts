import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function parseServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw?.trim()) return null;
  try {
    return JSON.parse(raw) as {
      project_id: string;
      client_email: string;
      private_key: string;
    };
  } catch {
    return null;
  }
}

export function getAdminApp(): App | null {
  const existing = getApps()[0];
  if (existing) return existing;
  const sa = parseServiceAccount();
  if (!sa) return null;
  return initializeApp({
    credential: cert({
      projectId: sa.project_id,
      clientEmail: sa.client_email,
      privateKey: sa.private_key.replace(/\\n/g, "\n"),
    }),
  });
}

export function getAdminDb() {
  const app = getAdminApp();
  if (!app) return null;
  return getFirestore(app);
}

export function getAdminAuth() {
  const app = getAdminApp();
  if (!app) return null;
  return getAuth(app);
}

export function serverAdminEmails() {
  const raw =
    process.env.ADMIN_EMAILS ?? process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isServerAdminEmail(email: string | null | undefined) {
  if (!email) return false;
  return serverAdminEmails().includes(email.toLowerCase());
}
