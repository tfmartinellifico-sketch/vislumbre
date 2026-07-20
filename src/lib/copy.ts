/** Textos do produto — ferramenta (tom clínico, uso na mesa). */

export const BRAND = {
  name: "Vislumbre",
  tagline: "Clareza antes da decisão.",
  promise:
    "Apoio visual à consulta sobre o que pode ser discutido — e o que não deve ser prometido.",
};

export const DISCLAIMER_SHORT =
  "Demonstração ilustrativa para a consulta. Não é previsão nem garantia de resultado.";

export const DISCLAIMER_FULL =
  "O Vislumbre oferece demonstração visual para apoiar o diálogo clínico. Não prevê o resultado do procedimento, não substitui avaliação médica e não garante simetria, volume final ou ausência de riscos. O desfecho depende da anatomia, da técnica, do produto, do tempo e da resposta individual. A responsabilidade pela conduta e pelo consentimento permanece com o profissional.";

export const STEPS_UI = [
  {
    id: "foto",
    label: "Registro",
    title: "Registro fotográfico",
    subtitle:
      "Foto frontal bem iluminada como base. Perfil opcional quando a projeção é relevante para o plano.",
  },
  {
    id: "marcar",
    label: "Análise",
    title: "Análise e planejamento",
    subtitle:
      "Marque as regiões do plano. Use roteiro pré-definido ou marcação livre. Vetores opcionais para refinamento.",
  },
  {
    id: "cenarios",
    label: "Cenários",
    title: "Cenários de intensidade",
    subtitle:
      "Compare abordagem conservadora, intermediária e exagerada — esta última para explicitar limites.",
  },
  {
    id: "ar",
    label: "Ao vivo",
    title: "Visualização ao vivo",
    subtitle:
      "Sobreponha o mapa à câmera. Recurso ilustrativo — não substitui avaliação nem documenta desfecho.",
  },
  {
    id: "kit",
    label: "Kit",
    title: "Kit na mesa",
    subtitle:
      "Com o Kit Contorno, tangibilize volumes na mesma lógica da tela. Sem kit, o fluxo digital segue normalmente.",
  },
  {
    id: "exportar",
    label: "Registro",
    title: "Registro da sessão",
    subtitle:
      "Gere PDF e salve metadados no histórico da clínica, com os avisos obrigatórios.",
  },
] as const;
