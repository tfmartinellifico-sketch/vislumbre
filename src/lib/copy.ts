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
    label: "Captura",
    title: "Captura",
    subtitle:
      "Preferência: scan do Sense (OBJ/PLY). Foto frontal continua como alternativa.",
    coach: "Importe o scan 3D do Sense ou uma foto frontal para continuar.",
    checklist: ["Scan Sense ou foto frontal", "Arquivo legível para a mesa"],
    tone: {
      chip: "bg-[#2f5f58] text-paper",
      bar: "bg-[#2f5f58]",
      soft: "bg-[#2f5f58]/15 text-[#1c3d39]",
      accent: "text-[#2f5f58]",
      border: "border-[#2f5f58]/35",
    },
  },
  {
    id: "mesa",
    label: "Mesa",
    title: "Mesa 3D",
    subtitle:
      "Malha do Sense (ou foto) para a conversa. Roteiro, intensidade e giro.",
    coach: "Aplique um roteiro e gire o modelo. Ajuste o cenário com a paciente.",
    checklist: ["Roteiro ou marcas no rosto", "Cenário escolhido na mesa"],
    tone: {
      chip: "bg-[#4a7c74] text-paper",
      bar: "bg-[#4a7c74]",
      soft: "bg-[#4a7c74]/15 text-[#1c3d39]",
      accent: "text-[#4a7c74]",
      border: "border-[#4a7c74]/35",
    },
  },
  {
    id: "exportar",
    label: "Registro",
    title: "Registro da sessão",
    subtitle: "Avisos obrigatórios, PDF e histórico da clínica.",
    coach: "Confirme os avisos e exporte o PDF.",
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
  ctx: { hasFrontImage: boolean; hasScan: boolean; markCount: number },
): boolean {
  if (stepId === "foto") return ctx.hasFrontImage || ctx.hasScan;
  if (stepId === "mesa") return ctx.markCount > 0;
  return true;
}

/** Pode ir para o índice alvo (só passos já liberados em sequência)? */
export function canJumpToStep(
  targetIndex: number,
  ctx: { hasFrontImage: boolean; hasScan: boolean; markCount: number },
): boolean {
  if (targetIndex <= 0) return true;
  for (let i = 0; i < targetIndex; i++) {
    const id = STEPS_UI[i].id;
    if (!canLeaveStep(id, ctx)) return false;
  }
  return true;
}
