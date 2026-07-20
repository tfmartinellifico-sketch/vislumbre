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
    coach: "Carregue a foto frontal (ou a face educativa) para continuar.",
    checklist: ["Foto frontal carregada", "Luz frontal e enquadramento estáveis"],
    /** Tailwind token classes for active step */
    tone: {
      chip: "bg-[#2f5f58] text-paper",
      bar: "bg-[#2f5f58]",
      soft: "bg-[#2f5f58]/15 text-[#1c3d39]",
      accent: "text-[#2f5f58]",
      border: "border-[#2f5f58]/35",
    },
  },
  {
    id: "marcar",
    label: "Análise",
    title: "Análise e planejamento",
    subtitle:
      "Marque as regiões do plano. Use roteiro pré-definido ou marcação livre. Vetores opcionais para refinamento.",
    coach: "Aplique um roteiro ou marque ao menos uma região no rosto.",
    checklist: ["Uma ou mais regiões marcadas", "Opcional: vetores e medidas"],
    tone: {
      chip: "bg-[#4a7c74] text-paper",
      bar: "bg-[#4a7c74]",
      soft: "bg-[#4a7c74]/15 text-[#1c3d39]",
      accent: "text-[#4a7c74]",
      border: "border-[#4a7c74]/35",
    },
  },
  {
    id: "cenarios",
    label: "Cenários",
    title: "Cenários de intensidade",
    subtitle:
      "Compare abordagem conservadora, intermediária e exagerada — esta última para explicitar limites.",
    coach: "Revise os três cenários e destaque o exagero quando fizer sentido.",
    checklist: ["Cenário ativo selecionado", "Exagero apresentado se pertinente"],
    tone: {
      chip: "bg-[#a68968] text-paper",
      bar: "bg-[#a68968]",
      soft: "bg-[#a68968]/18 text-[#5c4a32]",
      accent: "text-[#8a6f4e]",
      border: "border-[#a68968]/40",
    },
  },
  {
    id: "ar",
    label: "Ao vivo",
    title: "Visualização ao vivo",
    subtitle:
      "Sobreponha o mapa à câmera. Recurso ilustrativo — não substitui avaliação nem documenta desfecho.",
    coach: "Alinhe o rosto na moldura e mostre os volumes ao vivo.",
    checklist: ["Câmera liberada", "Rosto alinhado na moldura"],
    tone: {
      chip: "bg-[#6b9a90] text-paper",
      bar: "bg-[#6b9a90]",
      soft: "bg-[#6b9a90]/18 text-[#1c3d39]",
      accent: "text-[#3d6b63]",
      border: "border-[#6b9a90]/40",
    },
  },
  {
    id: "kit",
    label: "Kit",
    title: "Kit na mesa",
    subtitle:
      "Com o Kit Contorno, tangibilize volumes na mesma lógica da tela. Sem kit, o fluxo digital segue normalmente.",
    coach: "Se tiver o kit, use as peças; senão, avance com o fluxo digital.",
    checklist: ["Peças alinhadas às regiões (se houver kit)"],
    tone: {
      chip: "bg-[#5a6a68] text-paper",
      bar: "bg-[#5a6a68]",
      soft: "bg-[#5a6a68]/15 text-[#2a3836]",
      accent: "text-[#3d4a48]",
      border: "border-[#5a6a68]/35",
    },
  },
  {
    id: "exportar",
    label: "Registro",
    title: "Registro da sessão",
    subtitle:
      "Gere PDF e salve metadados no histórico da clínica, com os avisos obrigatórios.",
    coach: "Confirme os avisos e exporte o PDF para o histórico.",
    checklist: ["Avisos aceitos", "PDF gerado e sessão salva"],
    tone: {
      chip: "bg-[#1c3d39] text-paper",
      bar: "bg-[#1c3d39]",
      soft: "bg-[#1c3d39]/12 text-[#1c3d39]",
      accent: "text-[#1c3d39]",
      border: "border-[#1c3d39]/30",
    },
  },
] as const;

export type StepId = (typeof STEPS_UI)[number]["id"];

/** Pode avançar a partir da etapa atual? */
export function canLeaveStep(
  stepId: StepId,
  ctx: { hasFrontImage: boolean; markCount: number },
): boolean {
  if (stepId === "foto") return ctx.hasFrontImage;
  if (stepId === "marcar") return ctx.markCount > 0;
  return true;
}

/** Pode ir para o índice alvo (só passos já liberados em sequência)? */
export function canJumpToStep(
  targetIndex: number,
  ctx: { hasFrontImage: boolean; markCount: number },
): boolean {
  if (targetIndex <= 0) return true;
  for (let i = 0; i < targetIndex; i++) {
    const id = STEPS_UI[i].id;
    if (!canLeaveStep(id, ctx)) return false;
  }
  return true;
}
