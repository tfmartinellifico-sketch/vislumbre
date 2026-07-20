/** Textos das áreas logadas e ferramenta — tom profissional B2B. */

export const APP_COPY = {
  tool: {
    blocked: {
      loading: "Verificando acesso…",
      noAuth: {
        title: "Acesso restrito a clínicas",
        body:
          "A ferramenta Vislumbre é exclusiva para profissionais com conta e clínica ativa. Entre ou solicite trial para continuar.",
        cta: "Entrar ou solicitar trial",
      },
      noClinic: {
        title: "Clínica não vinculada",
        body:
          "Sua conta está autenticada, mas ainda não há clínica associada. Abra um trial ou aceite um convite da equipe.",
        cta: "Configurar clínica",
      },
      license: {
        title: "Licença inativa",
        body:
          "O acesso desta clínica está suspenso ou o período de trial encerrou. A ferramenta permanece indisponível até reativação do plano.",
        plan: "Gerenciar plano",
        contact: "Contato comercial",
      },
      unavailable: {
        title: "Acesso indisponível",
        body:
          "Não foi possível validar a licença no momento. Tente novamente ou contate o suporte.",
        contact: "Contato comercial",
      },
    },
    presentMode: "Modo apresentação",
    resetSession: "Nova sessão",
    demoFace: "Carregar face educativa",
    patientLabel: "Identificação interna (iniciais ou código)",
    kitTitle: "Kit Contorno na consulta",
    kitBody:
      "Utilize as peças físicas conforme o roteiro ao lado. Na ausência do kit, o fluxo digital cobre a mesma lógica de regiões e intensidades.",
    exportAck:
      "Registro de que a ilustração foi apresentada como demonstração, sem garantia de resultado.",
    patientAck:
      "Registro de que foi explicado ao paciente que a imagem não representa o desfecho clínico.",
    photoLocal:
      "Armazenar imagens neste dispositivo para reabertura ou exportação ZIP. Não são sincronizadas na nuvem.",
    shortcuts: "Atalhos: N avançar · B voltar · P modo apresentação",
    ethicsLink: "Ver diferenciação",
  },

  onboarding: {
    eyebrow: "Orientação",
    title: "Fluxo de trabalho na consulta",
    steps: [
      { t: "Registro", d: "Captura frontal e, se necessário, perfil para discussão de projeção." },
      { t: "Análise", d: "Marcação de regiões ou aplicação de roteiro pré-definido." },
      { t: "Cenários", d: "Comparação entre intensidade conservadora, intermediária e exagerada." },
      { t: "Ao vivo", d: "Sobreposição dos volumes na câmera, com caráter ilustrativo." },
      { t: "Kit", d: "Apoio tátil opcional com as mesmas regiões da tela." },
      { t: "Registro final", d: "PDF e histórico com metadados e avisos legais." },
    ],
    warn:
      "As ilustrações não devem ser apresentadas como garantia de resultado. O cenário exagerado documenta limites terapêuticos.",
    cta: "Iniciar sessão",
  },

  ethicsStrip:
    "Ilustração para apoio à consulta — não constitui preview de resultado",

  arExplainer: {
    title: "Funcionamento do módulo ao vivo",
    steps: [
      "As regiões marcadas na análise definem os volumes sobrepostos na câmera.",
      "O dispositivo reconhece o rosto e alinha os volumes em tempo real.",
      "Altere a intensidade (discreta, equilibrada, exagerada) mantendo caráter ilustrativo.",
    ],
    warn:
      "Recurso não preditivo. Apoia a explicação do plano já discutido na foto e nos cenários estáticos.",
  },

  clinica: {
    navAccount: "Área do cliente",
    navTool: "Ferramenta",
    title: "Painel da clínica",
    intro:
      "Gestão de perfil profissional, histórico de sessões, exportação documental, equipe, plano contratado e suporte. Imagens faciais permanecem no dispositivo de origem.",
    access: "Autenticação",
    noAccount:
      "Entre com a conta liberada pela Vislumbre para acessar o painel e a ferramenta.",
    noAccountLink: "Ir para área do cliente",
    noAccountDemo: "Ainda não tem acesso? Solicite a demonstração",
    demoBanner:
      "Ambiente de demonstração — acesso supervisionado para avaliação da ferramenta.",
    plan: "Plano contratado",
    planSuspended:
      "Licença inativa ou trial encerrado. Regularize a assinatura ou contate o suporte.",
    noClinic: "Nenhuma clínica vinculada a esta conta.",
    noClinicBody:
      "Aguarde a liberação do admin ou aceite o convite recebido por e-mail.",
    noClinicLink: "Solicitar demonstração",
    openTool: "Abrir ferramenta",
    profile: "Profissional responsável",
    history: "Histórico de sessões",
    historyNote:
      "Metadados sincronizados na nuvem; imagens somente no aparelho.",
    team: "Profissionais da clínica",
    teamNote:
      "Convites consomem assentos do plano, incluindo convites pendentes.",
    support: "Suporte técnico",
    deleteAccount: "Exclusão de conta",
    deleteAccountBody:
      "Remove perfil, histórico na nuvem e vínculo com a clínica. Operação irreversível. Imagens locais devem ser apagadas no dispositivo.",
    zipConsent:
      "Declaro autorização para exportar imagens armazenadas neste aparelho, sob responsabilidade da clínica (LGPD).",
  },

  account: {
    unconfiguredTitle: "Autenticação indisponível",
    unconfiguredBody:
      "Configure as variáveis Firebase conforme a documentação técnica para habilitar contas de clínica.",
    connected: "Conta autenticada",
    syncNote:
      "Perfil e metadados de sessão sincronizados. Fotografias permanecem neste dispositivo.",
    login: "Entrar",
    signup: "Criar conta",
    submitLogin: "Autenticar",
    submitSignup: "Registrar conta",
    forgot: "Recuperar senha",
  },

  admin: {
    intro:
      "Gestão comercial e operacional: leads, clínicas, licenças, tickets e indicadores de uso do piloto.",
  },
} as const;
