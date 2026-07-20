export type Vector = {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
};

export type Measure = {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export const TOPIC_CHECKS = [
  { id: "regioes", label: "Expliquei as regiões que entram na conversa" },
  { id: "limites", label: "Deixei claros os limites do que é possível" },
  { id: "riscos", label: "Mencionei riscos gerais do procedimento" },
  { id: "cenario_nao", label: "Mostrei o cenário exagerado (o que se evita)" },
  { id: "expectativa", label: "Alinhei expectativa sem prometer resultado" },
  { id: "consentimento", label: "Usei isto como apoio ao consentimento informado" },
] as const;

export const SCRIPT_LINES = [
  "O que você vê aqui é uma referência para conversarmos — não o resultado do procedimento.",
  "Primeiro, um caminho mais discreto. Depois, uma opção um pouco mais evidente.",
  "Este terceiro exemplo é exagerado de propósito: é exatamente o que não buscamos.",
  "O resultado real depende do seu rosto, da técnica e do tempo de recuperação.",
  "Nenhuma imagem substitui o exame clínico completo.",
];
