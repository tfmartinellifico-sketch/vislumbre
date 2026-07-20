import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

export default function PrivacidadePage() {
  return (
    <div className="atmosphere min-h-screen px-5 py-16 md:px-12">
      <div className="mx-auto max-w-2xl">
        <Logo href="/" size="md" />
        <h1 className="display mt-10 text-4xl">Privacidade</h1>
        <p className="mt-2 text-xs text-ink-soft">
          Rascunho alinhado à LGPD (v0.2) — revisar com DPO/advogado antes de
          escala comercial. Julho/2026.
        </p>
        <div className="mt-8 space-y-4 text-sm leading-relaxed text-ink-soft">
          <p>
            <strong className="text-ink">Controlador:</strong> operador do
            Vislumbre (atualize com razão social, CNPJ e canal de contato quando
            formalizar).
          </p>
          <p>
            <strong className="text-ink">Bases e finalidades.</strong> Conta e
            operação do serviço (execução de contrato); leads comerciais
            (legítimo interesse / consentimento no formulário); segurança e
            prevenção a abuso; métricas agregadas de uso do piloto.
          </p>
          <p>
            <strong className="text-ink">Dados de leads:</strong> nome, e-mail,
            telefone, clínica, cidade e mensagem — contato comercial e
            notificação interna por e-mail.
          </p>
          <p>
            <strong className="text-ink">Dados de conta:</strong> e-mail, perfil
            profissional, vínculo com clínica, preferência/índice/flags da
            sessão no histórico, tickets de suporte. Pagamentos: dados de
            cobrança ficam com o provedor (Stripe); guardamos IDs de cliente /
            assinatura na clínica.
          </p>
          <p>
            <strong className="text-ink">Fotos:</strong> processadas localmente.
            Não são enviadas ao Firebase. Export ZIP com fotos só ocorre com
            consentimento explícito do profissional no aparelho.
          </p>
          <p>
            <strong className="text-ink">Compartilhamento:</strong> Firebase
            (Google), Vercel (hospedagem), Resend (e-mail) e Stripe (pagamento),
            nos limites necessários ao serviço.
          </p>
          <p>
            <strong className="text-ink">Direitos (LGPD):</strong> acesso,
            correção, portabilidade (export), eliminação (exclusão de conta em
            /clinica) e oposição. Contate o suporte para exercer direitos.
          </p>
          <p>
            <strong className="text-ink">Retenção:</strong> enquanto a conta
            existir; leads até descarte comercial; tickets até resolução e
            prazo operacional; eventos de uso agregados para o piloto.
          </p>
          <Link href="/termos" className="text-sea-deep underline">
            Termos de uso
          </Link>
        </div>
      </div>
    </div>
  );
}
