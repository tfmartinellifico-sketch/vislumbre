import type { LandmarkPoint } from "./faceLandmarks";

/** Zonas educativas — posição vem de landmarks, nunca UV fixo da foto. */
export type CautionZoneDef = {
  id: string;
  label: string;
  landmarks: number[];
  /** Raio relativo à distância interocular. */
  radiusFaceRatio: number;
  note: string;
};

export const CAUTION_ZONE_DEFS: CautionZoneDef[] = [
  {
    id: "glabela",
    label: "Glabela",
    landmarks: [9, 8, 168],
    radiusFaceRatio: 0.22,
    note: "Área de atenção em injetáveis — avaliação individual obrigatória.",
  },
  {
    id: "nariz",
    label: "Dorso nasal",
    landmarks: [6, 197, 195],
    radiusFaceRatio: 0.18,
    note: "Região de alto cuidado. Não tratar mapa genérico como mapa vascular.",
  },
  {
    id: "sulco_risco_l",
    label: "Sulco / asa",
    landmarks: [98, 97],
    radiusFaceRatio: 0.15,
    note: "Discussão de risco e técnica — não substitui ultrassom nem exame.",
  },
  {
    id: "sulco_risco_r",
    label: "Sulco / asa",
    landmarks: [327, 326],
    radiusFaceRatio: 0.15,
    note: "Discussão de risco e técnica — não substitui ultrassom nem exame.",
  },
  {
    id: "temple_l",
    label: "Têmpora",
    landmarks: [54, 21, 162],
    radiusFaceRatio: 0.18,
    note: "Zona sensível. Conteúdo educativo, não anatomia vascular.",
  },
  {
    id: "temple_r",
    label: "Têmpora",
    landmarks: [284, 251, 389],
    radiusFaceRatio: 0.18,
    note: "Zona sensível. Conteúdo educativo, não anatomia vascular.",
  },
];

export type CautionZoneScreen = {
  id: string;
  label: string;
  x: number;
  y: number;
  r: number;
};

function avg(
  face: LandmarkPoint[],
  indices: number[],
): LandmarkPoint | null {
  let x = 0;
  let y = 0;
  let n = 0;
  for (const i of indices) {
    const p = face[i];
    if (!p) continue;
    x += p.x;
    y += p.y;
    n += 1;
  }
  if (!n) return null;
  return { x: x / n, y: y / n };
}

/** Posições em pixels do canvas, ancoradas no rosto detectado. */
export function cautionZonesOnFace(
  face: LandmarkPoint[],
  canvasW: number,
  canvasH: number,
): CautionZoneScreen[] {
  const eyeL = face[33];
  const eyeR = face[263];
  const iod =
    eyeL && eyeR
      ? Math.hypot((eyeL.x - eyeR.x) * canvasW, (eyeL.y - eyeR.y) * canvasH)
      : canvasW * 0.2;

  const out: CautionZoneScreen[] = [];
  for (const zone of CAUTION_ZONE_DEFS) {
    const c = avg(face, zone.landmarks);
    if (!c) continue;
    out.push({
      id: zone.id,
      label: zone.label,
      x: c.x * canvasW,
      y: c.y * canvasH,
      r: Math.max(14, iod * zone.radiusFaceRatio),
    });
  }
  return out;
}
