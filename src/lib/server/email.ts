import { Resend } from "resend";
import { publicAppUrl, SITE_NAME } from "@/lib/site";

const SEA = "#245750";
const SEA_DEEP = "#143833";
const SEA_SOFT = "#6b9a90";
const SAND = "#cbb89a";
const PAPER = "#fafcfb";
const INK = "#121a19";
const INK_SOFT = "#5a6a68";
const BORDER = "#e2e8e6";

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

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function emailShell(input: {
  preheader: string;
  title: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
  footerNote?: string;
}) {
  const cta =
    input.ctaLabel && input.ctaUrl
      ? `
      <tr>
        <td style="padding:28px 0 8px;">
          <a href="${escapeHtml(input.ctaUrl)}"
             style="display:inline-block;background:${SEA_DEEP};color:#ffffff;text-decoration:none;font-family:Georgia,'Times New Roman',serif;font-size:15px;letter-spacing:0.02em;padding:14px 28px;border-radius:999px;">
            ${escapeHtml(input.ctaLabel)}
          </a>
        </td>
      </tr>`
      : "";

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(input.title)}</title>
</head>
<body style="margin:0;padding:0;background:#eef3f1;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
    ${escapeHtml(input.preheader)}
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef3f1;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:100%;max-width:560px;background:${PAPER};border-radius:20px;overflow:hidden;border:1px solid ${BORDER};">
          <tr>
            <td style="background:linear-gradient(165deg,${SEA_DEEP} 0%,${SEA} 100%);padding:28px 32px;">
              <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:26px;color:#ffffff;letter-spacing:-0.02em;">
                ${SITE_NAME}
              </p>
              <p style="margin:8px 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:${SAND};">
                Clareza antes da decisão
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 32px 40px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:${INK};">
              <h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:26px;line-height:1.25;font-weight:normal;color:${SEA_DEEP};">
                ${escapeHtml(input.title)}
              </h1>
              ${input.bodyHtml}
              ${cta}
              ${
                input.ctaUrl
                  ? `<p style="margin:18px 0 0;font-size:12px;line-height:1.6;color:${INK_SOFT};word-break:break-all;">
                      Se o botão não abrir: <a href="${escapeHtml(input.ctaUrl)}" style="color:${SEA};">${escapeHtml(input.ctaUrl)}</a>
                    </p>`
                  : ""
              }
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 28px;border-top:1px solid ${BORDER};background:#f4f7f6;">
              <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:12px;line-height:1.6;color:${INK_SOFT};">
                ${escapeHtml(input.footerNote ?? `${SITE_NAME} · ferramenta ilustrativa para consulta · não constitui garantia de resultado`)}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function detailRow(label: string, value: string) {
  return `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid ${BORDER};font-size:12px;color:${INK_SOFT};width:34%;vertical-align:top;">
        ${escapeHtml(label)}
      </td>
      <td style="padding:10px 0;border-bottom:1px solid ${BORDER};font-size:14px;color:${INK};vertical-align:top;">
        ${escapeHtml(value || "—")}
      </td>
    </tr>`;
}

async function sendResend(input: {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
}) {
  const resend = resendClient();
  if (!resend) {
    return { sent: false as const, reason: "RESEND_API_KEY ausente" };
  }
  const { data, error } = await resend.emails.send({
    from: emailFrom(),
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
  });
  if (error) {
    console.error("[email]", error);
    return { sent: false as const, reason: error.message };
  }
  return { sent: true as const, id: data?.id };
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
  const to = notifyAdminEmail();
  if (!to) {
    return { sent: false as const, reason: "E-mail admin ausente" };
  }

  const adminUrl = `${publicAppUrl()}/admin`;
  const subject = `Novo lead Vislumbre — ${input.name}`;
  const text = [
    `Novo lead (${input.source})`,
    `Nome: ${input.name}`,
    `E-mail: ${input.email}`,
    `Telefone: ${input.phone || "—"}`,
    `Clínica: ${input.clinic || "—"}`,
    `Cidade: ${input.city || "—"}`,
    `Mensagem: ${input.message || "—"}`,
    input.leadId ? `ID: ${input.leadId}` : "",
    `Abrir painel: ${adminUrl}`,
  ]
    .filter(Boolean)
    .join("\n");

  const html = emailShell({
    preheader: `${input.name} solicitou contato · ${input.clinic || input.source}`,
    title: "Novo lead recebido",
    bodyHtml: `
      <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:${INK_SOFT};">
        Um interessado acabou de enviar dados pelo site. Revise e libere demo ou cliente no painel.
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 4px;">
        ${detailRow("Nome", input.name)}
        ${detailRow("E-mail", input.email)}
        ${detailRow("Telefone", input.phone)}
        ${detailRow("Clínica / empresa", input.clinic)}
        ${detailRow("Cidade", input.city)}
        ${detailRow("Origem", input.source)}
        ${input.message ? detailRow("Mensagem", input.message) : ""}
      </table>
    `,
    ctaLabel: "Abrir painel admin",
    ctaUrl: adminUrl,
    footerNote: "Notificação interna Vislumbre · não responder a este e-mail",
  });

  return sendResend({ to, subject, html, text });
}

export async function sendInviteEmail(input: {
  to: string;
  clinicName: string;
  inviteUrl: string;
  role: string;
  environment?: "demo" | "client";
}) {
  const isDemo = input.environment === "demo";
  const subject = isDemo
    ? `Sua demonstração Vislumbre — ${input.clinicName}`
    : `Seu acesso ao Vislumbre — ${input.clinicName}`;

  const text = isDemo
    ? [
        `Olá,`,
        ``,
        `Sua demonstração do Vislumbre para ${input.clinicName} está liberada.`,
        ``,
        `Abra o link, crie sua senha e entre na ferramenta:`,
        input.inviteUrl,
        ``,
        `Este acesso é só para avaliação — não inclui o painel completo da clínica.`,
        ``,
        `Se não solicitou este acesso, ignore este e-mail.`,
      ].join("\n")
    : [
        `Olá,`,
        ``,
        `Seu acesso à clínica ${input.clinicName} no Vislumbre está liberado.`,
        ``,
        `Abra o link, crie sua senha e entre:`,
        input.inviteUrl,
        ``,
        `Se não solicitou este acesso, ignore este e-mail.`,
      ].join("\n");

  const html = emailShell({
    preheader: isDemo
      ? `Acesse a demonstração de ${input.clinicName}`
      : `Ative seu acesso à clínica ${input.clinicName}`,
    title: isDemo ? "Sua demonstração está pronta" : "Seu acesso está liberado",
    bodyHtml: isDemo
      ? `
        <p style="margin:0 0 16px;font-size:15px;line-height:1.75;color:${INK_SOFT};">
          Olá. Liberamos a demonstração do Vislumbre para
          <strong style="color:${INK};">${escapeHtml(input.clinicName)}</strong>.
        </p>
        <p style="margin:0 0 8px;font-size:15px;line-height:1.75;color:${INK_SOFT};">
          Em um único passo você cria a senha e entra na ferramenta de consulta —
          registro, cenários, visualização ao vivo e exportação.
        </p>
        <p style="margin:20px 0 0;padding:14px 16px;background:#f0f5f3;border-left:3px solid ${SEA_SOFT};font-size:13px;line-height:1.65;color:${INK_SOFT};">
          Este acesso é apenas para avaliação. O painel completo da clínica
          (equipe, plano e histórico) fica disponível após a contratação.
        </p>
      `
      : `
        <p style="margin:0 0 16px;font-size:15px;line-height:1.75;color:${INK_SOFT};">
          Olá. Seu acesso à clínica
          <strong style="color:${INK};">${escapeHtml(input.clinicName)}</strong>
          no Vislumbre está liberado.
        </p>
        <p style="margin:0;font-size:15px;line-height:1.75;color:${INK_SOFT};">
          Crie sua senha no link abaixo para abrir o painel e a ferramenta de consulta.
        </p>
      `,
    ctaLabel: isDemo ? "Ativar demonstração" : "Ativar meu acesso",
    ctaUrl: input.inviteUrl,
  });

  return sendResend({ to: input.to, subject, html, text });
}

export async function sendDemoRejectionEmail(input: {
  to: string;
  name: string;
  company?: string;
}) {
  const subject = "Atualização sobre seu pedido de demonstração — Vislumbre";
  const firstName = input.name.trim().split(/\s+/)[0] || "olá";
  const text = [
    `Olá, ${firstName}.`,
    ``,
    `Obrigado pelo interesse no Vislumbre${input.company ? ` (${input.company})` : ""}.`,
    ``,
    `Neste momento não foi possível liberar o acesso de demonstração para este pedido.`,
    `Se quiser, responda este e-mail ou fale conosco pelo site para entendermos melhor o momento da clínica.`,
    ``,
    `${publicAppUrl()}`,
    ``,
    `Equipe Vislumbre`,
  ].join("\n");

  const html = emailShell({
    preheader: "Atualização sobre seu pedido de demonstração",
    title: "Sobre o seu pedido",
    bodyHtml: `
      <p style="margin:0 0 16px;font-size:15px;line-height:1.75;color:${INK_SOFT};">
        Olá, <strong style="color:${INK};">${escapeHtml(firstName)}</strong>.
      </p>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.75;color:${INK_SOFT};">
        Obrigado pelo interesse no Vislumbre${
          input.company
            ? ` para <strong style="color:${INK};">${escapeHtml(input.company)}</strong>`
            : ""
        }.
      </p>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.75;color:${INK_SOFT};">
        Neste momento não foi possível liberar o acesso de demonstração para este pedido.
      </p>
      <p style="margin:0;font-size:15px;line-height:1.75;color:${INK_SOFT};">
        Se fizer sentido retomar a conversa, responda este e-mail ou fale conosco pelo site —
        teremos prazer em entender o momento da clínica.
      </p>
    `,
    ctaLabel: "Ver o site",
    ctaUrl: publicAppUrl(),
  });

  return sendResend({ to: input.to, subject, html, text });
}
