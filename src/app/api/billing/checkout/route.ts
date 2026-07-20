import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/server/firebase-admin";
import { appBaseUrl, getStripe, stripePriceId } from "@/lib/server/stripe";

export async function POST(req: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "STRIPE_SECRET_KEY não configurada" },
      { status: 503 },
    );
  }

  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;
  if (!token) {
    return NextResponse.json({ error: "Login necessário" }, { status: 401 });
  }

  const adminAuth = getAdminAuth();
  const db = getAdminDb();
  if (!adminAuth || !db) {
    return NextResponse.json(
      { error: "FIREBASE_SERVICE_ACCOUNT necessário para checkout" },
      { status: 503 },
    );
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    const body = (await req.json()) as {
      clinicId?: string;
      plan?: "mensal" | "anual";
    };
    const clinicId = body.clinicId;
    const plan = body.plan === "anual" ? "anual" : "mensal";
    if (!clinicId) {
      return NextResponse.json({ error: "clinicId obrigatório" }, { status: 400 });
    }

    const price = stripePriceId(plan);
    if (!price) {
      return NextResponse.json(
        { error: `Price ID Stripe ausente (${plan})` },
        { status: 503 },
      );
    }

    const clinicSnap = await db.collection("clinics").doc(clinicId).get();
    if (!clinicSnap.exists) {
      return NextResponse.json({ error: "Clínica não encontrada" }, { status: 404 });
    }
    const clinic = clinicSnap.data()!;
    const memberSnap = await db
      .collection("clinics")
      .doc(clinicId)
      .collection("members")
      .doc(decoded.uid)
      .get();
    if (!memberSnap.exists) {
      return NextResponse.json({ error: "Sem permissão nesta clínica" }, { status: 403 });
    }
    const role = memberSnap.data()?.role;
    if (role !== "owner" && role !== "admin") {
      return NextResponse.json(
        { error: "Só owner/admin podem assinar" },
        { status: 403 },
      );
    }

    let customerId = clinic.stripeCustomerId as string | undefined;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: clinic.ownerEmail || decoded.email || undefined,
        metadata: { clinicId },
      });
      customerId = customer.id;
      await clinicSnap.ref.update({
        stripeCustomerId: customerId,
        updatedAt: new Date().toISOString(),
      });
    }

    const base = appBaseUrl();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price, quantity: 1 }],
      success_url: `${base}/clinica?billing=success`,
      cancel_url: `${base}/clinica?billing=cancel`,
      metadata: { clinicId, plan },
      subscription_data: {
        metadata: { clinicId, plan },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[billing/checkout]", err);
    return NextResponse.json({ error: "Falha no checkout" }, { status: 500 });
  }
}
