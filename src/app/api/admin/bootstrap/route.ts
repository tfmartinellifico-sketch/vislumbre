import { NextResponse } from "next/server";
import {
  getAdminAuth,
  getAdminDb,
  isServerAdminEmail,
} from "@/lib/server/firebase-admin";

/**
 * Bootstrap admin: verifica ID token Firebase + lista ADMIN_EMAILS,
 * grava doc admins/{uid} e custom claim `admin: true` via Admin SDK.
 */
export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;
  if (!token) {
    return NextResponse.json({ error: "Token ausente" }, { status: 401 });
  }

  const adminAuth = getAdminAuth();
  const db = getAdminDb();
  if (!adminAuth || !db) {
    return NextResponse.json(
      {
        error: "FIREBASE_SERVICE_ACCOUNT não configurado",
        fallback: true,
      },
      { status: 503 },
    );
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    const email = decoded.email?.toLowerCase() ?? "";
    if (!isServerAdminEmail(email)) {
      return NextResponse.json({ admin: false }, { status: 403 });
    }

    await db.collection("admins").doc(decoded.uid).set(
      {
        email,
        updatedAt: new Date().toISOString(),
        via: "api/admin/bootstrap",
      },
      { merge: true },
    );

    if (!decoded.admin) {
      await adminAuth.setCustomUserClaims(decoded.uid, { admin: true });
    }

    await db.collection("users").doc(decoded.uid).set(
      {
        email,
        role: "admin",
        clinicId: null,
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );

    return NextResponse.json({ admin: true, claimsUpdated: !decoded.admin });
  } catch (err) {
    console.error("[admin/bootstrap]", err);
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }
}
