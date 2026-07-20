import { Resend } from "resend";
import { publicAppUrl } from "@/lib/site";

function resendClient() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export function emailFrom() {
  return process.env.EMAIL_FROM ?? "Vislumbre <onboarding@resend.dev>";
}

export function notifyAdminEmail() {
  return (
    process.env.ADMIN_NOTIFY_EMAIL ??
    process.env.ADMIN_EMAILS?.split(",")[0]?.trim() ??
    process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(",")[0]?.trim() ??
    ""
  );
}

export async function sendLeadNotification(input: {
  name: string;
  email: string;
  phone: string;
  clinic: string;
  city: string;
  message: string;
  source: string;
  leadId?: string;
}) {
  const resend = resendClient();
  const to = notifyAdminEmail();
  if (!resend || !to) {
    return { sent: false as const, reason: "RESEND_API_KEY ou e-mail admin ausente" };
  }
  await resend.emails.send({
    from: emailFrom(),
    to,
    subject: `Novo lead Vislumbre — ${input.name}`,
    text: [
      `Lead novo (${input.source})`,
      `Nome: ${input.name}`,
      `E-mail: ${input.email}`,
      `Telefone: ${input.phone || "—"}`,
      `Clínica: ${input.clinic || "—"}`,
      `Cidade: ${input.city || "—"}`,
      `Mensagem: ${input.message || "—"}`,
      input.leadId ? `ID: ${input.leadId}` : "",
      `Admin: ${publicAppUrl()}/admin`,
    ]
      .filter(Boolean)
      .join("\n"),
  });
  return { sent: true as const };
}

export async function sendInviteEmail(input: {
  to: string;
  clinicName: string;
  inviteUrl: string;
  role: string;
}) {
  const resend = resendClient();
  if (!resend) {
    return { sent: false as const, reason: "RESEND_API_KEY ausente" };
  }
  await resend.emails.send({
    from: emailFrom(),
    to: input.to,
    subject: `Seu acesso ao Vislumbre — ${input.clinicName}`,
    text: [
      `Olá,`,
      ``,
      `Seu acesso à clínica ${input.clinicName} no Vislumbre está liberado.`,
      ``,
      `1. Abra o link abaixo`,
      `2. Crie sua senha (ou entre, se já tiver conta) com este e-mail`,
      `3. Aceite o convite na tela`,
      `4. Use a ferramenta em ${publicAppUrl()}/consulta e o painel em ${publicAppUrl()}/clinica`,
      ``,
      input.inviteUrl,
      ``,
      `Se não solicitou este acesso, ignore este e-mail.`,
    ].join("\n"),
  });
  return { sent: true as const };
}
