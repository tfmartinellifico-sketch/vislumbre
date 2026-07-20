import Link from "next/link";

export default function TermosPage() {
  return (
    <div className="atmosphere min-h-screen px-5 py-16 md:px-12">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="display text-2xl text-ink">
          Vislumbre
        </Link>
        <h1 className="display mt-10 text-4xl">Termos de uso (rascunho)</h1>
        <p className="mt-2 text-xs text-ink-soft">
          Documento modelo — validar com assessoria jurídica antes de publicar.
        </p>
        <div className="mt-8 space-y-4 text-sm leading-relaxed text-ink-soft">
          <p>
            O Vislumbre é oferecido como ferramenta educativa de comunicação para
            profissionais de saúde/estética habilitados. Não constitui dispositivo
            de predição clínica, diagnóstico ou garantia de resultado.
          </p>
          <p>
            O profissional é integralmente responsável pela conduta clínica, pelo
            consentimento informado e pelas alegações feitas ao paciente.
          </p>
          <p>
            Nesta versão MVP, imagens podem permanecer apenas no dispositivo do
            usuário. Se houver armazenamento em nuvem em versões futuras, será
            informado e sujeito a política de privacidade específica.
          </p>
          <p>
            É vedado usar o Vislumbre para publicidade enganosa, promessa de
            resultado ou substituição de avaliação individual do paciente.
          </p>
        </div>
      </div>
    </div>
  );
}
