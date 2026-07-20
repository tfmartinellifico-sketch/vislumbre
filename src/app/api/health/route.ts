import { NextResponse } from "next/server";
import { publicAppUrl, SITE_URL } from "@/lib/site";

/** Smoke test rápido pós-deploy — GET /api/health */
export async function GET() {
  return NextResponse.json({
    ok: true,
    product: "Vislumbre",
    site: SITE_URL,
    appUrl: publicAppUrl(),
    email: Boolean(process.env.RESEND_API_KEY),
    stripe: Boolean(process.env.STRIPE_SECRET_KEY),
    firebaseAdmin: Boolean(process.env.FIREBASE_SERVICE_ACCOUNT),
    timestamp: new Date().toISOString(),
  });
}
