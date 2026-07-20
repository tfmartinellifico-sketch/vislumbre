"use client";

const TIPS = [
  {
    t: "Luz de frente",
    d: "Evite luz de lado ou de cima. O rosto precisa estar iluminado de forma uniforme.",
  },
  {
    t: "Olhar na lente",
    d: "Cabeça ereta, expressão neutra, sem sorriso forçado. Cabelo fora do terço médio.",
  },
  {
    t: "Fundo simples",
    d: "Parede clara ou neutra. Sem outros rostos no enquadramento.",
  },
  {
    t: "Distância estável",
    d: "Enquadre do topo da cabeça até o queixo, com um pouco de margem.",
  },
];

type Props = {
  hasFront: boolean;
  hasProfile: boolean;
};

export function CaptureGuide({ hasFront, hasProfile }: Props) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <StatusChip ok={hasFront} label="Frontal" />
        <StatusChip ok={hasProfile} label="Perfil (opcional)" />
      </div>
      <ul className="space-y-3">
        {TIPS.map((tip) => (
          <li key={tip.t} className="border-l-2 border-sea/35 pl-3">
            <p className="text-[13px] font-medium text-ink">{tip.t}</p>
            <p className="mt-0.5 text-[12px] leading-relaxed text-ink-soft">
              {tip.d}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StatusChip({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div
      className={`rounded-lg px-3 py-2.5 text-[12px] ${
        ok
          ? "bg-sea/10 text-sea-deep"
          : "border border-ink/10 bg-fog/80 text-ink-soft"
      }`}
    >
      <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {ok ? `${label} pronta` : `Aguardando ${label.toLowerCase()}`}
    </div>
  );
}
