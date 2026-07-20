/** Zonas educativas genéricas — NÃO representam anatomia do paciente. */
export type CautionZone = {
  id: string;
  label: string;
  x: number;
  y: number;
  r: number;
  note: string;
};

export const CAUTION_ZONES: CautionZone[] = [
  {
    id: "glabela",
    label: "Glabela",
    x: 0.5,
    y: 0.28,
    r: 0.08,
    note: "Área de atenção em injetáveis — avaliação individual obrigatória.",
  },
  {
    id: "nariz",
    label: "Dorso nasal",
    x: 0.5,
    y: 0.48,
    r: 0.07,
    note: "Região de alto cuidado. Não tratar mapa genérico como mapa vascular.",
  },
  {
    id: "sulco_risco",
    label: "Sulco / asa nasal",
    x: 0.38,
    y: 0.52,
    r: 0.06,
    note: "Discussão de risco e técnica — não substitui ultrassom nem exame.",
  },
  {
    id: "temple_risco",
    label: "Têmpora",
    x: 0.22,
    y: 0.34,
    r: 0.07,
    note: "Zona sensível. Conteúdo educativo, não anatomia individual.",
  },
];
