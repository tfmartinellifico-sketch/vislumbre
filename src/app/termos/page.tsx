import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

export default function TermosPage() {
  return (
    <div className="atmosphere min-h-screen px-5 py-16 md:px-12">
      <div className="mx-auto max-w-2xl">
        <Logo href="/" size="md" />
        <h1 className="display mt-10 text-4xl">Termos de uso</h1>
        <p className="mt-2 text-xs text-ink-soft">
          Versão operacional v0.2 — rascunho para piloto. Validar com assessoria
          jurídica antes de uso comercial amplo. Última atualização: julho/2026.
        </p>
        <div className="mt-8 space-y-4 text-sm leading-relaxed text-ink-soft">
          <p>
            <strong className="text-ink">1. Objeto.</strong> O Vislumbre é uma
            ferramenta de comunicação visual para profissionais de saúde/estética
            habilitados alinharem expectativa com a paciente. Não é dispositivo
            médico, não realiza diagnóstico, predição clínica nem garantia de
            resultado estético.
          </p>
          <p>
            <strong className="text-ink">2. Responsabilidade profissional.</strong>{" "}
            O usuário é responsável pela conduta clínica, consentimento informado,
            registros no prontuário e pelas alegações feitas ao paciente. É
            vedado usar o Vislumbre para publicidade enganosa, promessa de
            resultado ou substituição do exame clínico.
          </p>
          <p>
            <strong className="text-ink">3. Contas e planos.</strong> Contas de
            clínica podem operar em trial, plano pago ou piloto. O acesso à
            ferramenta pode ser bloqueado se o trial expirar, a assinatura falhar
            ou a conta for suspensa por abuso, inadimplência ou violação destes
            termos. Limites de assentos (usuários) são aplicados nos convites.
          </p>
          <p>
            <strong className="text-ink">4. Pagamentos.</strong> Assinaturas
            processadas por provedor de pagamento (ex.: Stripe) seguem os termos
            do provedor. Ativação manual pelo operador Vislumbre também pode
            ocorrer em fase de piloto.
          </p>
          <p>
            <strong className="text-ink">5. Dados e imagens.</strong> Fotos
            faciais, por padrão, permanecem no dispositivo. O usuário pode optar
            por guardar fotos só neste aparelho para reabrir/exportar ZIP, sob
            sua responsabilidade e consentimento da paciente. Metadados de
            consulta (rótulos, notas, marcações, preferência, índice) podem ser
            sincronizados se houver conta na nuvem — sem fotos.
          </p>
          <p>
            <strong className="text-ink">6. Exportação e exclusão.</strong> O
            usuário pode exportar histórico (JSON/CSV/ZIP) e solicitar exclusão
            da conta em /clinica. Leads do site destinam-se apenas a retorno
            comercial.
          </p>
          <p>
            <strong className="text-ink">7. Disponibilidade.</strong> O serviço é
            oferecido “como está” no piloto, podendo haver interrupções,
            mudanças de funcionalidade ou de preços mediante aviso razoável.
          </p>
          <p>
            <strong className="text-ink">8. Contato.</strong> Dúvidas sobre estes
            termos: use o formulário do site ou o suporte na área da clínica.
          </p>
          <Link href="/privacidade" className="text-sea-deep underline">
            Política de privacidade
          </Link>
        </div>
      </div>
    </div>
  );
}
