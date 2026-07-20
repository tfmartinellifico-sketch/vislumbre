"use client";

/** Painel lateral curto — como o AR funciona na consulta */
export function ArExplainer() {
  return (
    <div className="space-y-4 rounded-xl border border-sea/20 bg-sea/[0.04] p-4">
      <p className="text-[12px] font-medium text-ink">Como funciona aqui</p>
      <ol className="space-y-3 text-[12px] leading-relaxed text-ink-soft">
        <li>
          <strong className="text-ink">1.</strong> As regiões que você marcou na
          foto viram pontos de volume na câmera.
        </li>
        <li>
          <strong className="text-ink">2.</strong> O celular reconhece o rosto e
          encaixa esses volumes em tempo real.
        </li>
        <li>
          <strong className="text-ink">3.</strong> Troque o cenário (discreto /
          equilibrado / exagerado) e mostre à paciente — sempre como ideia, nunca
          como promessa.
        </li>
      </ol>
      <p className="text-[11px] leading-relaxed text-warn">
        Não prevê resultado. Serve só para ilustrar o que vocês já conversaram
        na foto e nos cenários.
      </p>
    </div>
  );
}
