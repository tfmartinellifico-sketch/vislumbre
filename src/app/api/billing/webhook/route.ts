import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getAdminDb } from "@/lib/server/firebase-admin";
import { getStripe } from "@/lib/server/stripe";

export const runtime = "nodejs";

async function activateClinic(
  clinicId: string,
  plan: string,
  subscriptionId: string,
  customerId: string,
) {
  const db = getAdminDb();
  if (!db) return;
  await db.collection("clinics").doc(clinicId).update({
    status: "active",
    environment: "client",
    plan: plan === "anual" ? "anual" : "mensal",
    trialEndsAt: null,
    stripeSubscriptionId: subscriptionId,
    stripeCustomerId: customerId,
    updatedAt: new Date().toISOString(),
  });
}

async function suspendClinic(clinicId: string) {
  const db = getAdminDb();
  if (!db) return;
  await db.collection("clinics").doc(clinicId).update({
    status: "suspended",
    updatedAt: new Date().toISOString(),
  });
}

export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json({ error: "Stripe webhook não configurado" }, { status: 503 });
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Assinatura ausente" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    console.error("[webhook] signature", err);
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const clinicId = session.metadata?.clinicId;
        const plan = session.metadata?.plan ?? "mensal";
        if (clinicId && session.subscription && session.customer) {
          await activateClinic(
            clinicId,
            plan,
            String(session.subscription),
            String(session.customer),
          );
        }
        break;
      }
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const clinicId = sub.metadata?.clinicId;
        if (!clinicId) break;
        if (sub.status === "active" || sub.status === "trialing") {
          await activateClinic(
            clinicId,
            sub.metadata?.plan ?? "mensal",
            sub.id,
            String(sub.customer),
          );
        } else if (
          sub.status === "past_due" ||
          sub.status === "unpaid" ||
          sub.status === "canceled" ||
          sub.status === "incomplete_expired"
        ) {
          await suspendClinic(clinicId);
        }
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const clinicId = sub.metadata?.clinicId;
        if (clinicId) await suspendClinic(clinicId);
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error("[webhook] handler", err);
    return NextResponse.json({ error: "Falha ao processar" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
