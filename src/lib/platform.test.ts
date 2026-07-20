import { describe, expect, it } from "vitest";
import { canAcceptInvite, canInviteMember } from "./seats";
import { isClinicAccessAllowed, trialEndDate, type Clinic } from "./platform-types";
import { computePilotMetrics } from "./metrics";

function clinic(partial: Partial<Clinic>): Clinic {
  return {
    id: "c1",
    name: "Teste",
    city: "SP",
    ownerEmail: "a@b.com",
    ownerId: null,
    status: "trial",
    plan: "trial",
    seats: 3,
    trialEndsAt: trialEndDate(),
    notes: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...partial,
  };
}

describe("seats", () => {
  it("bloqueia convite além do limite", () => {
    const r = canInviteMember({
      seats: 2,
      memberCount: 1,
      pendingInviteCount: 1,
      emailAlreadyMember: false,
    });
    expect(r.ok).toBe(false);
  });

  it("bloqueia e-mail já membro", () => {
    const r = canInviteMember({
      seats: 5,
      memberCount: 1,
      pendingInviteCount: 0,
      emailAlreadyMember: true,
    });
    expect(r.ok).toBe(false);
  });

  it("permite aceitar se há assento", () => {
    expect(
      canAcceptInvite({ seats: 3, memberCount: 2, alreadyMember: false }).ok,
    ).toBe(true);
  });
});

describe("isClinicAccessAllowed", () => {
  it("bloqueia suspensa", () => {
    expect(isClinicAccessAllowed(clinic({ status: "suspended" }))).toBe(false);
  });

  it("bloqueia trial vencido", () => {
    expect(
      isClinicAccessAllowed(
        clinic({
          status: "trial",
          trialEndsAt: new Date(Date.now() - 86400000).toISOString(),
        }),
      ),
    ).toBe(false);
  });

  it("libera active", () => {
    expect(isClinicAccessAllowed(clinic({ status: "active", trialEndsAt: null }))).toBe(
      true,
    );
  });
});

describe("computePilotMetrics", () => {
  it("conta exports da semana e trials a vencer", () => {
    const now = new Date("2026-07-20T12:00:00Z");
    const m = computePilotMetrics(
      [
        clinic({
          id: "t1",
          name: "A",
          status: "trial",
          trialEndsAt: new Date("2026-07-22T12:00:00Z").toISOString(),
        }),
        clinic({ id: "a1", status: "active", trialEndsAt: null }),
      ],
      [
        {
          id: "1",
          type: "consulta_export",
          userId: "u",
          clinicId: "a1",
          createdAt: "2026-07-20T10:00:00Z",
        },
        {
          id: "2",
          type: "page_lead",
          userId: null,
          clinicId: null,
          createdAt: "2026-07-20T11:00:00Z",
        },
      ],
      now,
    );
    expect(m.consultationsThisWeek).toBe(1);
    expect(m.leadsThisWeek).toBe(1);
    expect(m.activeClinics).toBe(1);
    expect(m.trialsExpiringSoon).toHaveLength(1);
  });
});
