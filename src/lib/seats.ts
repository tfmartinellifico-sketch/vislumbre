/** Lógica pura de assentos — testável sem Firebase. */

export function canInviteMember(input: {
  seats: number;
  memberCount: number;
  pendingInviteCount: number;
  emailAlreadyMember: boolean;
}) {
  if (input.emailAlreadyMember) {
    return { ok: false as const, reason: "Este e-mail já é membro da clínica." };
  }
  const used = input.memberCount + input.pendingInviteCount;
  if (used >= input.seats) {
    return {
      ok: false as const,
      reason: `Limite de ${input.seats} assentos atingido (${input.memberCount} membros + ${input.pendingInviteCount} convite(s) pendente(s)).`,
    };
  }
  return { ok: true as const, remaining: input.seats - used - 1 };
}

export function canAcceptInvite(input: {
  seats: number;
  memberCount: number;
  alreadyMember: boolean;
}) {
  if (input.alreadyMember) return { ok: true as const };
  if (input.memberCount >= input.seats) {
    return {
      ok: false as const,
      reason: `Clínica sem assentos livres (limite ${input.seats}).`,
    };
  }
  return { ok: true as const };
}
