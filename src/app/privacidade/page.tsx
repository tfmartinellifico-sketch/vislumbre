import Link from "next/link";

export default function PrivacidadePage() {
  return (
    <div className="atmosphere min-h-screen px-5 py-16 md:px-12">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="display text-2xl text-ink">
          Vislumbre
        </Link>
        <h1 className="display mt-10 text-4xl">Privacidade (rascunho)</h1>
        <p className="mt-2 text-xs text-ink-soft">
          Modelo inicial alinhado à LGPD — revisar com DPO/advogado.
        </p>
        <div className="mt-8 space-y-4 text-sm leading-relaxed text-ink-soft">
          <p>
            Imagens faciais podem ser dados pessoais sensíveis. O profissional
            deve obter base legal adequada (em regra, consentimento específico)
            antes de capturar ou armazenar a imagem do paciente.
          </p>
          <p>
            No MVP local, a foto processada na consulta permanece no navegador do
            dispositivo, salvo exportação voluntária (PDF) pelo usuário.
          </p>
          <p>
            Finalidade: apoio educativo à consulta. Não vendemos dados. Direitos
            do titular (acesso, correção, exclusão) devem ser atendidos pelo
            controlador da clínica quando houver armazenamento.
          </p>
        </div>
      </div>
    </div>
  );
}
