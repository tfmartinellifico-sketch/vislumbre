"use client";

import Link from "next/link";
import { ILLUSTRATION } from "@/lib/ethicalRender";

export function EthicsStrip() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sea/15 bg-sea/[0.06] px-4 py-2 text-[11px] text-ink-soft">
      <span>
        <strong className="text-sea-deep">{ILLUSTRATION.watermark}</strong>
        {" · "}
        Ilustração para conversa — não é preview de resultado
      </span>
      <Link
        href="/diferenca"
        className="shrink-0 text-sea-deep underline-offset-2 hover:underline"
      >
        Entenda a diferença
      </Link>
    </div>
  );
}
