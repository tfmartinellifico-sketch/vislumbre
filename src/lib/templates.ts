import type { Mark, RegionId } from "./regions";
import type { LandmarkPoint } from "./faceLandmarks";
import {
  regionNormalizedPosition,
  sideFromTemplateX,
} from "./faceLandmarks";

export type ProcedureTemplate = {
  id: string;
  label: string;
  description: string;
  /** x/y só indicam lado (esquerda/direita) e ordem; a posição real vem do rosto. */
  points: { region: RegionId; x: number; y: number; intensity: number }[];
  suggestedNotes: string;
};

export const PROCEDURE_TEMPLATES: ProcedureTemplate[] = [
  {
    id: "malar",
    label: "Terço médio",
    description: "Projeção malar bilateral para conversa sobre suporte e contorno.",
    points: [
      { region: "malar", x: 0.34, y: 0.42, intensity: 0.55 },
      { region: "malar", x: 0.66, y: 0.42, intensity: 0.55 },
    ],
    suggestedNotes:
      "Conversamos sobre projeção do terço médio. Reforcei que o volume final depende da anatomia e da técnica escolhida.",
  },
  {
    id: "sulco",
    label: "Sulco",
    description: "Sombra do sulco nasogeniano — suavização possível versus apagamento irreal.",
    points: [
      { region: "sulco", x: 0.38, y: 0.52, intensity: 0.45 },
      { region: "sulco", x: 0.62, y: 0.52, intensity: 0.45 },
    ],
    suggestedNotes:
      "Sulco tratado como sombra e perda relativa de suporte. Sem promessa de desaparecimento completo.",
  },
  {
    id: "olheira",
    label: "Olheira",
    description: "Transição órbita–malar; conversa cautelosa sobre expectativas.",
    points: [
      { region: "olheira", x: 0.36, y: 0.38, intensity: 0.4 },
      { region: "olheira", x: 0.64, y: 0.38, intensity: 0.4 },
    ],
    suggestedNotes:
      "Região delicada. Abordei limites e o risco de expectativa irrealista com volume excessivo.",
  },
  {
    id: "mandibula_mento",
    label: "Contorno inferior",
    description: "Linha mandibular e mento — leitura de perfil e definição.",
    points: [
      { region: "mandibula", x: 0.28, y: 0.62, intensity: 0.5 },
      { region: "mandibula", x: 0.72, y: 0.62, intensity: 0.5 },
      { region: "mento", x: 0.5, y: 0.72, intensity: 0.5 },
    ],
    suggestedNotes:
      "Contorno inferior discutido com cenários discreto e exagerado para calibrar desejo versus indicação.",
  },
  {
    id: "labios",
    label: "Lábios",
    description: "Contorno e plenitude — prioridade à naturalidade.",
    points: [{ region: "labios", x: 0.5, y: 0.58, intensity: 0.45 }],
    suggestedNotes:
      "Volume labial: priorizei naturalidade e usei o cenário exagerado como referência do que se evita.",
  },
  {
    id: "harmonizacao_basica",
    label: "Panorama",
    description: "Mapa amplo para conversa inicial — não é plano fechado.",
    points: [
      { region: "temple", x: 0.28, y: 0.32, intensity: 0.35 },
      { region: "temple", x: 0.72, y: 0.32, intensity: 0.35 },
      { region: "malar", x: 0.34, y: 0.42, intensity: 0.5 },
      { region: "malar", x: 0.66, y: 0.42, intensity: 0.5 },
      { region: "mento", x: 0.5, y: 0.72, intensity: 0.4 },
    ],
    suggestedNotes:
      "Mapa panorâmico para orientação. O plano definitivo depende da avaliação clínica individual.",
  },
];

/** Fallback sem face detectada — evita crash, mas posições são genéricas. */
export function marksFromTemplate(template: ProcedureTemplate): Mark[] {
  const stamp = Date.now();
  return template.points.map((p, i) => ({
    id: `${stamp}-tpl-${i}`,
    region: p.region,
    x: p.x,
    y: p.y,
    intensity: p.intensity,
  }));
}

/** Roteiro ancorado nos landmarks do rosto da foto. */
export function marksFromTemplateOnFace(
  template: ProcedureTemplate,
  face: LandmarkPoint[],
): Mark[] {
  const stamp = Date.now();
  const marks: Mark[] = [];

  template.points.forEach((p, i) => {
    const side = sideFromTemplateX(p.region, p.x);
    const pos = regionNormalizedPosition(face, p.region, side);
    if (!pos) return;
    marks.push({
      id: `${stamp}-tpl-${i}`,
      region: p.region,
      x: pos.x,
      y: pos.y,
      intensity: p.intensity,
    });
  });

  return marks;
}
