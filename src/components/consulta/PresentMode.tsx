"use client";

import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { FaceCanvas } from "./FaceCanvas";
import { ScenarioCompare } from "./ScenarioCompare";
import { DualAngleView } from "./DualAngleView";
import {
  DISCLAIMER,
  SCENARIOS,
  type Mark,
  type ScenarioId,
} from "@/lib/regions";
import { SCRIPT_LINES } from "@/lib/planning";
import {
  PREFERENCE_OPTIONS,
  type PatientPreference,
} from "@/lib/alignment";

type ViewMode = "single" | "compare" | "dual";

type Props = {
  imageUrl: string;
  profileUrl?: string | null;
  marks: Mark[];
  scenario: ScenarioId;
  onScenario: (id: ScenarioId) => void;
  onClose: () => void;
  compare: boolean;
  dual?: boolean;
  preference?: PatientPreference | null;
  onPreference?: (v: PatientPreference) => void;
};

export function PresentMode({
  imageUrl,
  profileUrl = null,
  marks,
  scenario,
  onScenario,
  onClose,
  compare,
  dual = false,
  preference = null,
  onPreference,
}: Props) {
  const [view, setView] = useState<ViewMode>(() =>
    dual ? "dual" : compare ? "compare" : "single",
  );
  const [scriptIndex, setScriptIndex] = useState(0);
  const [chrome, setChrome] = useState(true);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "h" || e.key === "H") setChrome((c) => !c);
      if (e.key === "1") onScenario("conservador");
      if (e.key === "2") onScenario("moderado");
      if (e.key === "3") onScenario("nao_indicado");
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        const ids = SCENARIOS.map((s) => s.id);
        const idx = ids.indexOf(scenario);
        const next =
          e.key === "ArrowRight"
            ? ids[(idx + 1) % ids.length]
            : ids[(idx - 1 + ids.length) % ids.length];
        onScenario(next);
      }
      if (e.key === "c" || e.key === "C") setView("compare");
      if (e.key === "s" || e.key === "S") setView("single");
      if ((e.key === "d" || e.key === "D") && profileUrl) setView("dual");
      if (e.key === "f" || e.key === "F") {
        setScriptIndex((i) => (i + 1) % SCRIPT_LINES.length);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onScenario, scenario, profileUrl]);

  const meta = SCENARIOS.find((s) => s.id === scenario);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-ink text-paper">
      {chrome && (
        <div className="flex items-center justify-between gap-4 border-b border-paper/10 px-5 py-3.5 md:px-8">
        <div>
          <Logo variant="light" size="md" />
          <p className="mt-1.5 text-[11px] text-mist/70">
            Modo paciente · 1/2/3 cenários · ← → · H esconde barra · Esc sai
          </p>
        </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-paper/25 px-4 py-2 text-[13px] hover:bg-paper/10"
          >
            Encerrar
          </button>
        </div>
      )}

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 overflow-y-auto px-5 py-5 md:px-8 md:py-7">
        {chrome && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {SCENARIOS.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => onScenario(s.id)}
                    className={`rounded-lg px-4 py-2.5 text-[14px] ${
                      scenario === s.id
                        ? s.tone === "warn"
                          ? "bg-warn text-paper"
                          : "bg-sea text-paper"
                        : "border border-paper/20 text-mist"
                    }`}
                  >
                    <span className="mr-1.5 opacity-50">{i + 1}</span>
                    {s.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-1.5">
                {(
                  [
                    ["single", "Único"],
                    ["compare", "Três"],
                    ["dual", "Ângulos"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    disabled={id === "dual" && !profileUrl}
                    onClick={() => setView(id)}
                    className={`rounded-lg px-3 py-2 text-[12px] disabled:opacity-30 ${
                      view === id
                        ? "bg-paper text-ink"
                        : "border border-paper/20 text-mist"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-[15px] leading-relaxed text-mist">
              Agora: <strong className="text-paper">{meta?.label}</strong>
              {meta ? ` — ${meta.description}` : ""}
            </p>
          </>
        )}

        <div className="min-h-0 flex-1">
          {view === "dual" ? (
            <DualAngleView
              frontUrl={imageUrl}
              profileUrl={profileUrl}
              marks={marks}
              scenario={scenario}
            />
          ) : view === "compare" ? (
            <ScenarioCompare
              imageUrl={imageUrl}
              marks={marks}
              active={scenario}
              onSelect={onScenario}
            />
          ) : (
            <div className="mx-auto max-w-xl">
              <FaceCanvas
                imageUrl={imageUrl}
                marks={marks}
                activeRegion="malar"
                intensity={0.5}
                scenario={scenario}
                onAddMark={() => undefined}
                interactive={false}
              />
            </div>
          )}
        </div>

        <div className="rounded-xl border border-paper/12 bg-paper/[0.06] px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] uppercase tracking-[0.18em] text-sand">
              Frase para a mesa
            </p>
            <button
              type="button"
              onClick={() =>
                setScriptIndex((i) => (i + 1) % SCRIPT_LINES.length)
              }
              className="text-[11px] text-mist/80 hover:text-paper"
            >
              Próxima (F)
            </button>
          </div>
          <p className="mt-1.5 text-[14px] leading-relaxed text-mist">
            “{SCRIPT_LINES[scriptIndex]}”
          </p>
        </div>

        {onPreference && (
          <div className="rounded-xl border border-paper/12 bg-paper/[0.06] px-4 py-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-sand">
              Preferência da paciente
            </p>
            <p className="mt-1 text-[12px] text-mist/80">
              Toque na opção que ela verbalizou agora.
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {PREFERENCE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onPreference(opt.id)}
                  className={`rounded-lg px-3 py-2.5 text-left text-[13px] ${
                    preference === opt.id
                      ? "bg-sea text-paper"
                      : "border border-paper/20 text-mist hover:bg-paper/10"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <p className="rounded-xl border border-warn/35 bg-warn/15 px-4 py-3 text-[13px] leading-relaxed text-sand">
          {DISCLAIMER}
        </p>
      </div>

      {!chrome && (
        <button
          type="button"
          onClick={() => setChrome(true)}
          className="absolute right-4 top-4 rounded-lg bg-paper/15 px-3 py-1.5 text-[11px] text-mist backdrop-blur"
        >
          Mostrar controles (H)
        </button>
      )}
    </div>
  );
}
