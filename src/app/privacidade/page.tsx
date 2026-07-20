import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

export default function PrivacidadePage() {
  return (
    <div className="atmosphere min-h-screen px-5 py-16 md:px-12">
      <div className="mx-auto max-w-2xl">
        <Logo href="/" size="md" />
        <h1 className="display mt-10 text-4xl">Privacidade</h1>
        <p className="mt-2 text-xs text-ink-soft">
          Rascunho alinhado à LGPD — revisar com DPO/advogado.
        </p>
        <div className="mt-8 space-y-4 text-sm leading-relaxed text-ink-soft">
          <p>
            <strong className="text-ink">Controlador:</strong> operador do
            Vislumbre (atualize com razão social e contato quando formalizar).
          </p>
          <p>
            <strong className="text-ink">Dados de leads:</strong> nome, e-mail,
            telefone, clínica e mensagem — finalidade de contato comercial.
          </p>
          <p>
            <strong className="text-ink">Dados de conta:</strong> e-mail, perfil
            profissional, vínculo com clínica, histórico de consultas sem foto.
          </p>
          <p>
            <strong className="text-ink">Fotos:</strong> processadas localmente no
            navegador; não são enviadas ao Firebase nesta versão.
          </p>
          <p>
            <strong className="text-ink">Direitos:</strong> acesso, correção,
            exportação e exclusão via /clinica ou contato. Tickets de suporte
            ficam registrados até resolução.
          </p>
          <p>
            Hospedagem: Vercel (aplicação) e Google Firebase (auth/dados de
            conta). Eventos de uso agregados ajudam a melhorar o produto.
          </p>
          <Link href="/termos" className="text-sea-deep underline">
            Termos de uso
          </Link>
        </div>
      </div>
    </div>
  );
}
