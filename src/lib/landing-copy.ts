/** Textos do site — público: clínicas e profissionais (lead B2B). */

export const SITE_COPY = {
  brand: {
    tagline: "Clareza antes da decisão.",
    subtitle:
      "Plataforma de apoio à consulta de estética facial para clínicas e profissionais habilitados.",
  },

  hero: {
    lead:
      "O Vislumbre organiza a consulta em que se discutem possibilidades, limites e expectativas — com registro fotográfico, cenários de volume, visualização ao vivo e documento de apoio. Não simula resultado nem substitui o exame clínico.",
    ctaPrimary: "Solicitar demonstração",
    ctaSecondary: "Como funciona o AR",
    bullets: [
      "Acesso liberado pela equipe Vislumbre",
      "Imagens permanecem no aparelho",
      "PDF e histórico para documentação",
    ],
  },

  proposta: {
    eyebrow: "Para a clínica",
    title: "Menos retrabalho por expectativa desalinhada.",
    titleAccent: "Mais consulta estruturada.",
    body:
      "Simuladores de “resultado final” alimentam promessas difíceis de cumprir. O Vislumbre foi desenhado para o profissional conduzir a consulta com linguagem visual ética: mostrar alternativas, explicitar limites e registrar o que foi apresentado — reforçando que a imagem é ilustrativa.",
  },

  organizacao: {
    eyebrow: "Estrutura",
    title: "Site institucional e ferramenta de consulta",
    intro:
      "Este site apresenta a solução, o posicionamento e os canais comerciais. A ferramenta é o ambiente de trabalho da equipe durante a consulta.",
    site: {
      label: "Apresentação",
      title: "Site",
      body:
        "Proposta de valor, kit físico, diferenciação frente a simuladores, termos e contato comercial para clínicas interessadas em piloto ou assinatura.",
    },
    tool: {
      label: "Operação",
      title: "Ferramenta",
      body:
        "Fluxo completo na mesa: registro, análise por regiões, cenários, visualização ao vivo, apoio do kit e exportação do registro da sessão.",
      cta: "Solicitar demonstração",
    },
  },

  fluxo: {
    eyebrow: "Fluxo na consulta",
    title: "Da captura ao registro documentado",
    steps: [
      {
        n: "01",
        t: "Registro",
        d: "Foto frontal com orientação de enquadramento. Perfil opcional quando a projeção é relevante para o plano.",
      },
      {
        n: "02",
        t: "Cenários",
        d: "Três intensidades na mesma base: conservadora, intermediária e exagerada — a última para explicitar o que a clínica não busca.",
      },
      {
        n: "03",
        t: "Documentação",
        d: "Modo apresentação, kit tátil (se disponível) e PDF com avisos — material de apoio ao consentimento e ao prontuário.",
      },
    ],
  },

  kit: {
    eyebrow: "Complemento opcional",
    title: "Kit Contorno na mesa",
    body:
      "Base neutra e peças de volume para tangibilizar regiões discutidas na tela. Integrado ao mesmo roteiro da ferramenta digital; indicado para clínicas que priorizam apoio tátil na consulta.",
    link: "Especificação de fabricação",
  },

  contato: {
    eyebrow: "Contato comercial",
    title: "Solicitar piloto ou demonstração",
    body:
      "Preencha o formulário comercial abaixo ou use a página de demonstração. A equipe Vislumbre avalia o pedido e libera o acesso.",
    benefits: [
      "Ambiente de demonstração sob liberação admin",
      "Painel da clínica: histórico, exportação e suporte",
      "Onboarding para o fluxo na consulta",
    ],
  },

  ctaFinal: {
    title: "Solicite o ambiente de demonstração",
    body:
      "Informe nome, e-mail e empresa. Após a liberação, você recebe o convite para entrar na ferramenta com face educativa e percorrer o fluxo completo.",
    button: "Solicitar demonstração",
  },

  footer:
    "Ferramenta ilustrativa para consulta · não constitui garantia de resultado",

  nav: {
    proposta: "Solução",
    ar: "AR na consulta",
    status: "Disponibilidade",
    trial: "Área do cliente",
    tool: "Demonstração",
  },
} as const;

export const AR_COPY = {
  eyebrow: "Recurso da ferramenta",
  title: "Visualização ao vivo na consulta",
  intro:
    "O módulo de realidade aumentada projeta, sobre a imagem da câmera, os mesmos volumes definidos na análise estática. Trata-se de ilustração em tempo real para apoiar a explicação do profissional — não de simulação de procedimento ou predição de desfecho.",
  steps: [
    {
      n: "1",
      t: "Mapa na foto",
      d: "Na etapa de análise, o profissional marca regiões (malar, sulco, mento, mandíbula). Esse mapa orienta a sobreposição ao vivo.",
    },
    {
      n: "2",
      t: "Câmera orientada",
      d: "Na etapa ao vivo, o dispositivo reconhece o rosto e exibe volumes suaves nas regiões marcadas, com aviso permanente de caráter ilustrativo.",
    },
    {
      n: "3",
      t: "Cenário ajustável",
      d: "É possível alternar intensidades (discreta, equilibrada, exagerada) durante a consulta, mantendo coerência com os cenários da foto.",
    },
  ],
  xrNote: {
    title: "Headsets XR (opcional)",
    body:
      "Em dispositivos compatíveis, o mesmo princípio pode ser exibido em visão imersiva. O modo smartphone permanece o canal principal recomendado.",
  },
  is: [
    "Ilustração do plano discutido na consulta",
    "Comparação de intensidade na mesa",
    "Apoio à comunicação transparente com o paciente",
  ],
  isNot: [
    "Simulador de injeção ou cirurgia",
    "Predição do resultado clínico",
    "Substituto do exame físico",
  ],
  cta: "Solicitar demonstração",
  diagramCaption: "Modo ao vivo · intensidade equilibrada · caráter ilustrativo",
  diagramFooter:
    "O sistema localiza o rosto, alinha as regiões marcadas e desenha volumes suaves — coerentes com a foto, em movimento.",
} as const;

export const ROADMAP_COPY = {
  eyebrow: "Disponibilidade",
  title: "O que já está em produção",
  intro:
    "Funcionalidades ativas para clínicas em piloto e assinatura. Itens de hardware e escala comercial seguem cronograma separado.",
  items: [
    { label: "Ferramenta de consulta completa", status: "done" as const, note: "Registro, cenários, AR e PDF" },
    { label: "Conta clínica e painel administrativo", status: "done" as const, note: "Trial, equipe, leads e métricas" },
    { label: "Convites por e-mail e limite de assentos", status: "done" as const, note: "Gestão de profissionais da clínica" },
    { label: "Controle de acesso (trial e suspensão)", status: "done" as const, note: "Conformidade com plano contratado" },
    { label: "Exportação para prontuário", status: "done" as const, note: "JSON, CSV, pacote texto e ZIP opcional" },
    { label: "Assinatura online", status: "done" as const, note: "Checkout e ativação automática" },
    { label: "Kit físico fabricado", status: "next" as const, note: "Especificação pronta · produção em parceria" },
  ],
  links: "Material para sala de espera · Área administrativa",
} as const;

export const LEAD_FORM = {
  successTitle: "Solicitação recebida",
  successBody:
    "A equipe Vislumbre entrará em contato para demonstração, piloto ou ativação da clínica.",
  placeholder:
    "Ex.: clínica com 3 profissionais, interesse em piloto de 30 dias…",
  submit: "Solicitar contato",
  submitBusy: "Enviando…",
  privacy: "Dados utilizados exclusivamente para retorno comercial.",
  errorUnavailable:
    "Formulário indisponível no momento. Utilize o e-mail de contato informado no site.",
  errorSend: "Não foi possível enviar. Tente novamente em instantes.",
} as const;

export const DIFERENCA_COPY = {
  hero: {
    title: "Posicionado para a consulta.",
    accent: "Não para simular o resultado.",
    body:
      "Ferramentas fotorealistas de “preview” ocupam outro segmento. O Vislumbre atende clínicas que precisam estruturar a conversa sobre possibilidades e limites — com registro e linguagem visual que não induzem garantia de desfecho.",
  },
  pillars: [
    {
      t: "Linguagem ilustrativa",
      d: "Volumes tracejados e suaves — indicam direção de conversa, não pele tratada.",
    },
    {
      t: "Limites explícitos",
      d: "O cenário exagerado existe para documentar o que a clínica não propõe.",
    },
    {
      t: "Registro para a prática",
      d: "Checklist, preferência registrada e PDF com avisos — apoio ao consentimento informado.",
    },
  ],
  compareIntro:
    "Referência frente a simuladores de resultado típicos do mercado.",
  clinic: {
    title: "Benefícios para a operação da clínica",
    items: [
      "Consulta com alternativas visíveis e cenário de exagero documentado",
      "Registro do que foi apresentado e discutido",
      "Reforço sistemático de que a imagem não é garantia",
      "Kit físico opcional alinhado ao mesmo roteiro digital",
    ],
  },
} as const;

export const ENTRAR_COPY = {
  title: "Área do cliente",
  inviteIntro: (clinic: string, email: string) =>
    `Convite para ${clinic}. Autentique-se com o e-mail ${email} para vincular sua conta.`,
  defaultIntro:
    "Entrada para clínicas e profissionais com acesso já liberado. Se ainda não tem conta, solicite a demonstração ou aguarde o convite enviado pela equipe Vislumbre.",
  inviteButton: "Aceitar convite e vincular conta",
  pendingTitle: "Aguardando liberação",
  pendingBody:
    "Sua conta está autenticada, mas ainda não há clínica vinculada. Solicite o ambiente de demonstração ou aceite o convite recebido por e-mail.",
  pendingCta: "Solicitar demonstração",
} as const;

export const DEMO_COPY = {
  eyebrow: "Ambiente de demonstração",
  title: "Conheça o Vislumbre antes de contratar",
  intro:
    "O ambiente de demonstração é liberado sob demanda para clínicas e profissionais interessados. Você solicita o acesso; a equipe Vislumbre avalia e envia o convite por e-mail.",
  points: [
    "Acesso supervisionado à ferramenta de consulta (registro, cenários, ao vivo e exportação).",
    "Não substitui a área do cliente: planos, equipe e billing ficam no painel após contratação.",
    "Imagens de pacientes permanecem no aparelho; o ambiente demo usa faces educativas.",
  ],
  formTitle: "Solicitar acesso à demonstração",
  formIntro:
    "Informe nome, e-mail profissional e empresa. Após a liberação no painel admin, você recebe o convite para criar a senha.",
  formSubmit: "Enviar solicitação",
  formBusy: "Enviando…",
  formErrorUnavailable: "Formulário indisponível no momento. Contate o suporte.",
  formErrorSend: "Não foi possível enviar. Tente novamente.",
  successTitle: "Solicitação recebida",
  successBody:
    "A equipe Vislumbre analisará o pedido e liberará o ambiente de demonstração. Você receberá um e-mail com o link de acesso.",
  privacy: "Usamos estes dados apenas para liberar o acesso e contato comercial.",
  form: {
    errorUnavailable: "Formulário indisponível no momento. Contate o suporte.",
    errorSend: "Não foi possível enviar. Tente novamente.",
  },
} as const;

export const HERO_VISUAL = {
  caption: "Anotação de consulta · perfil",
  note: "Regiões e marcações em linguagem ilustrativa — não é resultado clínico.",
} as const;
