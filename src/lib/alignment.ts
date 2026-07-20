/** Glossário de regiões — linguagem para a paciente na mesa. */
export const REGION_GLOSSARY = [
  {
    id: "malar",
    title: "Terço médio (malar)",
    patient:
      "A área das maçãs do rosto. Conversamos sobre suporte e contorno — não sobre “encher” sem critério.",
  },
  {
    id: "olheira",
    title: "Olheira / transição",
    patient:
      "A sombra entre a órbita e o malar. Região delicada: o objetivo costuma ser suavizar, não apagar.",
  },
  {
    id: "sulco",
    title: "Sulco",
    patient:
      "A linha de sombra do nariz à boca. Pode ser atenuada; desaparecimento completo raramente é realista.",
  },
  {
    id: "labios",
    title: "Lábios",
    patient:
      "Contorno e plenitude. Prioridade à naturalidade — o exagero fica no terceiro cenário, de propósito.",
  },
  {
    id: "mandibula",
    title: "Mandíbula",
    patient:
      "Linha e definição do contorno inferior. Ajuda a ler o perfil junto com o mento.",
  },
  {
    id: "mento",
    title: "Mento (queixo)",
    patient:
      "Projeção do queixo. Muitas vezes a conversa de perfil começa aqui.",
  },
  {
    id: "temple",
    title: "Têmpora",
    patient:
      "Volume lateral do terço superior. Faz parte de um mapa panorâmico, não de um “pacote” automático.",
  },
] as const;

export type PatientPreference =
  | "discreto"
  | "equilibrado"
  | "outro"
  | "ainda_nao";

export const PREFERENCE_OPTIONS: {
  id: PatientPreference;
  label: string;
  hint: string;
}[] = [
  {
    id: "discreto",
    label: "Prefiro o discreto",
    hint: "Mudança sutil",
  },
  {
    id: "equilibrado",
    label: "Prefiro o equilibrado",
    hint: "Perceptível, sem exagero",
  },
  {
    id: "outro",
    label: "Quero outro caminho",
    hint: "Rever plano / adiar",
  },
  {
    id: "ainda_nao",
    label: "Ainda não decidi",
    hint: "Continuar a conversa",
  },
];

export function preferenceLabel(id: PatientPreference | null) {
  if (!id) return "—";
  return PREFERENCE_OPTIONS.find((o) => o.id === id)?.label ?? id;
}

/** Pontuação de alinhamento da conversa (0–100). */
export function alignmentScore(input: {
  topics: string[];
  topicTotal: number;
  hasMarks: boolean;
  showedExaggerated: boolean;
  patientAck: boolean;
  preference: PatientPreference | null;
  accepted: boolean;
}) {
  let pts = 0;
  const max = 100;
  pts += Math.round((input.topics.length / input.topicTotal) * 40);
  if (input.hasMarks) pts += 15;
  if (input.showedExaggerated) pts += 15;
  if (input.patientAck) pts += 15;
  if (input.preference && input.preference !== "ainda_nao") pts += 10;
  if (input.accepted) pts += 5;
  return Math.min(max, pts);
}

export function alignmentBand(score: number) {
  if (score >= 80) return { label: "Conversa bem alinhada", tone: "sea" as const };
  if (score >= 55) return { label: "Bom caminho — complete o checklist", tone: "sand" as const };
  return { label: "Ainda há pontos a cobrir", tone: "warn" as const };
}
