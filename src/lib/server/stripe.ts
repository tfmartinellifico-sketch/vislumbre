import Stripe from "stripe";
import { publicAppUrl } from "@/lib/site";

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

export function stripePriceId(plan: "mensal" | "anual") {
  if (plan === "anual") return process.env.STRIPE_PRICE_ANUAL ?? "";
  return process.env.STRIPE_PRICE_MENSAL ?? "";
}

export function appBaseUrl() {
  return publicAppUrl();
}
