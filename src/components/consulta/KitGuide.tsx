"use client";

const STEPS = [
  {
    n: "1",
    t: "Base na mesa",
    d: "Coloque a base entre você e a paciente, à vista de ambos.",
  },
  {
    n: "2",
    t: "Pad da região",
    d: "Escolha a peça da mesma região marcada na tela (malar, sulco, mento…).",
  },
  {
    n: "3",
    t: "Discreto versus exagero",
    d: "Pad fino = ideia sutil. Pad grosso = o que não se busca nesta consulta.",
  },
  {
    n: "4",
    t: "Volte à tela",
    d: "Mostre os cenários no modo paciente e feche com o aviso de que não é o resultado.",
  },
];

export function KitGuide() {
  return (
    <div className="space-y-5">
      <p className="text-[13px] leading-[1.7] text-ink-soft">
        O kit é um apoio tátil de volume — não um manequim de injeção. Use junto
        com a foto na ferramenta.
      </p>
      <ol className="space-y-4">
        {STEPS.map((s) => (
          <li key={s.n} className="border-l-2 border-sea/40 pl-3.5">
            <p className="text-[14px] text-ink">
              <span className="display text-sea-soft">{s.n}.</span> {s.t}
            </p>
            <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">{s.d}</p>
          </li>
        ))}
      </ol>
      <div className="rounded-lg border border-ink/10 bg-fog/80 px-3.5 py-3 text-[12px] leading-relaxed text-ink-soft">
        Sem kit ainda? A ferramenta sozinha já fecha a consulta. O físico entra
        quando a peça estiver na clínica.
      </div>
    </div>
  );
}
