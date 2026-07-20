import type { Clinic } from "./platform-types";
import type { UsageEvent } from "./platform-types";

export type PilotMetrics = {
  consultationsThisWeek: number;
  consultationsPrevWeek: number;
  loginsThisWeek: number;
  leadsThisWeek: number;
  trialsExpiringSoon: Array<{
    id: string;
    name: string;
    trialEndsAt: string;
    daysLeft: number;
  }>;
  activeClinics: number;
  trialClinics: number;
  suspendedClinics: number;
};

function startOfWeek(d = new Date()) {
  const x = new Date(d);
  const day = x.getDay();
  const diff = day === 0 ? 6 : day - 1;
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - diff);
  return x;
}

export function computePilotMetrics(
  clinics: Clinic[],
  usage: UsageEvent[],
  now = new Date(),
): PilotMetrics {
  const weekStart = startOfWeek(now);
  const prevStart = new Date(weekStart);
  prevStart.setDate(prevStart.getDate() - 7);

  const inRange = (iso: string, from: Date, to: Date) => {
    const t = new Date(iso).getTime();
    return t >= from.getTime() && t < to.getTime();
  };

  const thisWeek = usage.filter((u) => inRange(u.createdAt, weekStart, now));
  const prevWeek = usage.filter((u) =>
    inRange(u.createdAt, prevStart, weekStart),
  );

  const trialsExpiringSoon = clinics
    .filter((c) => c.status === "trial" && c.trialEndsAt)
    .map((c) => {
      const ends = new Date(c.trialEndsAt!).getTime();
      const daysLeft = Math.ceil((ends - now.getTime()) / (1000 * 60 * 60 * 24));
      return {
        id: c.id,
        name: c.name,
        trialEndsAt: c.trialEndsAt!,
        daysLeft,
      };
    })
    .filter((c) => c.daysLeft >= 0 && c.daysLeft <= 7)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  return {
    consultationsThisWeek: thisWeek.filter((u) => u.type === "consulta_export")
      .length,
    consultationsPrevWeek: prevWeek.filter((u) => u.type === "consulta_export")
      .length,
    loginsThisWeek: thisWeek.filter((u) => u.type === "login").length,
    leadsThisWeek: thisWeek.filter((u) => u.type === "page_lead").length,
    trialsExpiringSoon,
    activeClinics: clinics.filter((c) => c.status === "active").length,
    trialClinics: clinics.filter((c) => c.status === "trial").length,
    suspendedClinics: clinics.filter(
      (c) => c.status === "suspended" || c.status === "cancelled",
    ).length,
  };
}
