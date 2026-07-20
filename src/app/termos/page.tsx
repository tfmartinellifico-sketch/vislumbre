import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

export default function TermosPage() {
  return (
    <div className="atmosphere min-h-screen px-5 py-16 md:px-12">
      <div className="mx-auto max-w-2xl">
        <Logo href="/" size="md" />
        <h1 className="display mt-10 text-4xl">Termos de uso</h1>
        <p className="mt-2 text-xs text-ink-soft">
          Versão operacional — validar com assessoria jurídica antes de uso
          comercial amplo.
        </p>
        <div className="mt-8 space-y-4 text-sm leading-relaxed text-ink-soft">
          <p>
            O Vislumbre é uma ferramenta de comunicação visual para
            profissionais de saúde/estética habilitados. Não constitui dispositivo
            de predição clínica, diagnóstico ou garantia de resultado.
          </p>
          <p>
            O profissional é responsável pela conduta clínica, pelo consentimento
            informado e pelas alegações feitas ao paciente. É vedado usar o
            Vislumbre para publicidade enganosa ou promessa de resultado.
          </p>
          <p>
            Contas de clínica podem operar em trial ou plano ativo. O
            administrador Vislumbre pode suspender acesso em caso de abuso ou
            inadimplência.
          </p>
          <p>
            Fotos faciais, por padrão, permanecem no dispositivo do usuário. Metadados
            de consulta (rótulos, notas, marcações) podem ser sincronizados se o
            usuário ativar conta na nuvem.
          </p>
          <p>
            O usuário pode exportar seu histórico e solicitar exclusão da conta
            em /clinica. Leads enviados pelo site são usados apenas para retorno
            comercial.
          </p>
          <Link href="/privacidade" className="text-sea-deep underline">
            Política de privacidade
          </Link>
        </div>
      </div>
    </div>
  );
}
