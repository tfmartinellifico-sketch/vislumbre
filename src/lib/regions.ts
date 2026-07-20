export type RegionId =
  | "malar"
  | "sulco"
  | "mento"
  | "mandibula"
  | "labios"
  | "olheira"
  | "temple";

export type ScenarioId = "conservador" | "moderado" | "nao_indicado";

export type Mark = {
  id: string;
  region: RegionId;
  x: number;
  y: number;
  intensity: number;
};

export const REGIONS: { id: RegionId; label: string; hint: string }[] = [
  { id: "malar", label: "Malar", hint: "Projeção e suporte do terço médio" },
  { id: "olheira", label: "Olheira", hint: "Transição entre órbita e malar" },
  { id: "sulco", label: "Sulco", hint: "Sombra do sulco nasogeniano" },
  { id: "labios", label: "Lábios", hint: "Contorno e plenitude" },
  { id: "mandibula", label: "Mandíbula", hint: "Linha e definição do contorno" },
  { id: "mento", label: "Mento", hint: "Projeção do queixo no perfil" },
  { id: "temple", label: "Têmpora", hint: "Volume lateral do terço superior" },
];

export const SCENARIOS: {
  id: ScenarioId;
  label: string;
  description: string;
  multiplier: number;
  tone: "sea" | "sand" | "warn";
}[] = [
  {
    id: "conservador",
    label: "Discreto",
    description: "Mudança sutil. Ideal para mostrar naturalidade e contenção.",
    multiplier: 0.45,
    tone: "sea",
  },
  {
    id: "moderado",
    label: "Equilibrado",
    description: "Alteração perceptível, ainda no terreno da conversa responsável.",
    multiplier: 0.85,
    tone: "sand",
  },
  {
    id: "nao_indicado",
    label: "Exagerado",
    description:
      "Propositadamente excessivo — para mostrar o que não se busca nesta consulta.",
    multiplier: 1.55,
    tone: "warn",
  },
];

export { DISCLAIMER_FULL as DISCLAIMER } from "./copy";
