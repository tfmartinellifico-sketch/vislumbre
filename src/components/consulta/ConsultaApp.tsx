"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaceCanvas, type DrawMode } from "./FaceCanvas";
import { ArPreview } from "./ArPreview";
import { GlassesAr } from "./GlassesAr";
import { ScenarioCompare } from "./ScenarioCompare";
import { DualAngleView } from "./DualAngleView";
import { MorphCompare } from "./MorphCompare";
import { KitGuide } from "./KitGuide";
import { Onboarding } from "./Onboarding";
import { PresentMode } from "./PresentMode";
import { CaptureGuide } from "./CaptureGuide";
import { GuidedCapture } from "./GuidedCapture";
import { ArExplainer } from "./ArExplainer";
import { EthicsStrip } from "./EthicsStrip";
import { RegionGlossary } from "./RegionGlossary";
import { AlignmentMeter } from "./AlignmentMeter";
import { PreferenceCapture } from "./PreferenceCapture";
import { SignaturePad } from "./SignaturePad";
import { PhotoQualityHint } from "./PhotoQualityHint";
import { Logo } from "@/components/brand/Logo";
import {
  alignmentScore,
  preferenceLabel,
  type PatientPreference,
} from "@/lib/alignment";
import {
  DISCLAIMER,
  REGIONS,
  SCENARIOS,
  type Mark,
  type RegionId,
  type ScenarioId,
} from "@/lib/regions";
import { STEPS_UI, canJumpToStep, canLeaveStep, type StepId } from "@/lib/copy";
import { exportConsultaPdf } from "@/lib/exportPdf";
import {
  createDemoFaceDataUrl,
  createDemoProfileDataUrl,
} from "@/lib/demoFace";
import {
  SCRIPT_LINES,
  TOPIC_CHECKS,
  type Measure,
  type Vector,
} from "@/lib/planning";
import {
  marksFromTemplate,
  PROCEDURE_TEMPLATES,
} from "@/lib/templates";
import {
  consumeReopenConsulta,
  hasSeenOnboarding,
  loadProfile,
  markOnboardingSeen,
  saveConsulta,
  type SavedConsulta,
} from "@/lib/storage";
import { currentUser, observeUser, saveCloudConsulta } from "@/lib/firebase-cloud";
import { isFirebaseConfigured } from "@/lib/firebase";
import { loadClinic, loadMyClinicId, logUsage } from "@/lib/platform";
import {
  resolveToolAccess,
  type Clinic,
  type ToolAccessReason,
} from "@/lib/platform-types";
import { APP_COPY } from "@/lib/app-copy";

type ArDevice = "phone" | "glasses";
type AccessGate = ToolAccessReason;

export function ConsultaApp() {
  const [step, setStep] = useState<StepId>("foto");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [profileUrl, setProfileUrl] = useState<string | null>(null);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [vectors, setVectors] = useState<Vector[]>([]);
  const [measures, setMeasures] = useState<Measure[]>([]);
  const [activeRegion, setActiveRegion] = useState<RegionId>("malar");
  const [intensity, setIntensity] = useState(0.55);
  const [drawMode, setDrawMode] = useState<DrawMode>("mark");
  const [scenario, setScenario] = useState<ScenarioId>("conservador");
  const [patientLabel, setPatientLabel] = useState("");
  const [professionalLabel, setProfessionalLabel] = useState("");
  const [notes, setNotes] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [scriptIndex, setScriptIndex] = useState(0);
  const [accepted, setAccepted] = useState(false);
  const [patientAck, setPatientAck] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [arDevice, setArDevice] = useState<ArDevice>("phone");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [present, setPresent] = useState(false);
  const [presentCompare, setPresentCompare] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);
  const [cenarioView, setCenarioView] = useState<"triplo" | "dual" | "morph">(
    "triplo",
  );
  const [showCautionZones, setShowCautionZones] = useState(false);
  const [preference, setPreference] = useState<PatientPreference | null>(null);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [showedExaggerated, setShowedExaggerated] = useState(false);
  const [clinicAccess, setClinicAccess] = useState<Clinic | null>(null);
  const [accessGate, setAccessGate] = useState<AccessGate>("loading");
  const [keepPhotosLocal, setKeepPhotosLocal] = useState(false);

  function selectScenario(id: ScenarioId) {
    setScenario(id);
    if (id === "nao_indicado") setShowedExaggerated(true);
  }

  const stepIndex = STEPS_UI.findIndex((s) => s.id === step);
  const stepMeta = STEPS_UI[stepIndex];
  const stepGateCtx = {
    hasFrontImage: Boolean(imageUrl),
    markCount: marks.length,
  };
  const canContinue = canLeaveStep(step, stepGateCtx);
  const progressPct = Math.round(((stepIndex + 1) / STEPS_UI.length) * 100);
  const scenarioMeta = useMemo(
    () => SCENARIOS.find((s) => s.id === scenario),
    [scenario],
  );

  const alignmentScoreValue = useMemo(
    () =>
      alignmentScore({
        topics,
        topicTotal: TOPIC_CHECKS.length,
        hasMarks: marks.length > 0,
        showedExaggerated,
        patientAck,
        preference,
        accepted,
      }),
    [
      topics,
      marks.length,
      showedExaggerated,
      patientAck,
      preference,
      accepted,
    ],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const profile = loadProfile();
      if (profile.name || profile.registry) {
        setProfessionalLabel(
          [profile.name, profile.registry, profile.clinic]
            .filter(Boolean)
            .join(" · "),
        );
      }
      if (!hasSeenOnboarding()) setShowOnboarding(true);

      const reopened = consumeReopenConsulta();
      if (reopened) {
        setPatientLabel(reopened.patientLabel);
        setProfessionalLabel(reopened.professionalLabel);
        setScenario(reopened.scenario);
        setMarks(reopened.marks);
        setVectors(reopened.vectors);
        setNotes(reopened.notes);
        setTopics(reopened.topics);
        setPreference(reopened.preference);
        setPatientAck(reopened.patientAck);
        setShowedExaggerated(reopened.showedExaggerated);
        if (reopened.signatureDataUrl) setSignatureUrl(reopened.signatureDataUrl);
        if (reopened.photoFrontDataUrl) setImageUrl(reopened.photoFrontDataUrl);
        if (reopened.photoProfileDataUrl) setProfileUrl(reopened.photoProfileDataUrl);
        setStep(reopened.marks.length ? "marcar" : "foto");
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setAccessGate("unavailable");
      return;
    }

    return observeUser((user) => {
      void (async () => {
        if (!user) {
          setClinicAccess(null);
          setAccessGate("no_auth");
          return;
        }
        try {
          const id = await loadMyClinicId();
          if (!id) {
            setClinicAccess(null);
            setAccessGate("no_clinic");
            return;
          }
          const c = await loadClinic(id);
          setClinicAccess(c);
          const reason = resolveToolAccess({
            firebaseConfigured: true,
            userId: user.uid,
            clinic: c,
          });
          setAccessGate(reason === "ok" ? "ok" : reason);
        } catch {
          setAccessGate("unavailable");
        }
      })();
    });
  }, []);

  function onFile(file: File | null, target: "front" | "profile" = "front") {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result);
      if (target === "front") setImageUrl(url);
      else setProfileUrl(url);
    };
    reader.readAsDataURL(file);
  }

  async function loadDemo() {
    const [front, profile] = await Promise.all([
      createDemoFaceDataUrl(),
      createDemoProfileDataUrl(),
    ]);
    setImageUrl(front);
    setProfileUrl(profile);
    setPatientLabel((v) => v || "DEMO");
  }

  function undoLast() {
    if (drawMode === "vector" && vectors.length) {
      setVectors((v) => v.slice(0, -1));
      return;
    }
    if (drawMode === "measure" && measures.length) {
      setMeasures((m) => m.slice(0, -1));
      return;
    }
    setMarks((m) => m.slice(0, -1));
  }

  async function handleExport() {
    if (!accepted) return;
    setExporting(true);
    try {
      await exportConsultaPdf({
        patientLabel,
        professionalLabel,
        scenario,
        marks,
        notes,
        photoDataUrl: imageUrl,
        topics,
        vectorCount: vectors.length,
        preferenceLabel: preferenceLabel(preference),
        patientAck,
        signatureDataUrl: signatureUrl,
        alignmentScore: alignmentScoreValue,
      });
      const entry: SavedConsulta = {
        id: `${Date.now()}`,
        createdAt: new Date().toISOString(),
        patientLabel,
        professionalLabel,
        scenario,
        marks,
        vectors,
        notes,
        topics,
        hasPhoto: Boolean(imageUrl),
        preference,
        alignmentScore: alignmentScoreValue,
        patientAck,
        showedExaggerated,
        signatureDataUrl: signatureUrl,
        photoFrontDataUrl: keepPhotosLocal ? imageUrl : null,
        photoProfileDataUrl: keepPhotosLocal ? profileUrl : null,
      };
      saveConsulta(entry);
      if (currentUser()) {
        await saveCloudConsulta(entry);
        const clinicId = await loadMyClinicId();
        await logUsage({
          type: "consulta_export",
          userId: currentUser()?.uid ?? null,
          clinicId,
          meta: entry.id,
        });
      }
      setSavedFlash(true);
      window.setTimeout(() => setSavedFlash(false), 2500);
    } finally {
      setExporting(false);
    }
  }

  function goNext() {
    if (!canLeaveStep(step, stepGateCtx)) return;
    setStep(STEPS_UI[Math.min(stepIndex + 1, STEPS_UI.length - 1)].id);
  }

  function goPrev() {
    setStep(STEPS_UI[Math.max(stepIndex - 1, 0)].id);
  }

  function tryJumpTo(targetId: StepId) {
    const targetIndex = STEPS_UI.findIndex((s) => s.id === targetId);
    if (targetIndex < 0) return;
    if (targetIndex <= stepIndex || canJumpToStep(targetIndex, stepGateCtx)) {
      setStep(targetId);
    }
  }

  function toggleTopic(id: string) {
    setTopics((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  }

  function applyTemplate(id: string) {
    const tpl = PROCEDURE_TEMPLATES.find((t) => t.id === id);
    if (!tpl) return;
    setMarks(marksFromTemplate(tpl));
    setActiveTemplate(id);
    setNotes((prev) => prev || tpl.suggestedNotes);
    setStep("marcar");
  }

  function resetSession() {
    setStep("foto");
    setImageUrl(null);
    setProfileUrl(null);
    setMarks([]);
    setVectors([]);
    setMeasures([]);
    setScenario("conservador");
    setPatientLabel("");
    setNotes("");
    setTopics([]);
    setAccepted(false);
    setPatientAck(false);
    setActiveTemplate(null);
    setPresent(false);
    setCenarioView("triplo");
    setPreference(null);
    setSignatureUrl(null);
    setShowedExaggerated(false);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (e.key === "n" || e.key === "N") {
        setStep((current) => {
          const idx = STEPS_UI.findIndex((s) => s.id === current);
          const currentId = STEPS_UI[idx].id;
          if (
            !canLeaveStep(currentId, {
              hasFrontImage: Boolean(imageUrl),
              markCount: marks.length,
            })
          ) {
            return current;
          }
          return STEPS_UI[Math.min(idx + 1, STEPS_UI.length - 1)].id;
        });
      }
      if (e.key === "b" || e.key === "B") {
        setStep((current) => {
          const idx = STEPS_UI.findIndex((s) => s.id === current);
          return STEPS_UI[Math.max(idx - 1, 0)].id;
        });
      }
      if ((e.key === "p" || e.key === "P") && imageUrl) {
        setPresentCompare(step === "cenarios");
        setPresent(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [imageUrl, step, marks.length]);

  const planningInteractive = step === "marcar";
  const templateLabel =
    PROCEDURE_TEMPLATES.find((t) => t.id === activeTemplate)?.label ?? null;

  if (accessGate === "loading") {
    return (
      <div className="grain atmosphere flex min-h-screen items-center justify-center px-5">
        <p className="text-[14px] text-ink-soft">{APP_COPY.tool.blocked.loading}</p>
      </div>
    );
  }

  if (accessGate !== "ok") {
    const blocked = APP_COPY.tool.blocked;
    const copy =
      accessGate === "no_auth"
        ? blocked.noAuth
        : accessGate === "no_clinic"
          ? blocked.noClinic
          : accessGate === "unavailable"
            ? blocked.unavailable
            : blocked.license;

    return (
      <div className="grain atmosphere flex min-h-screen flex-col items-center justify-center px-5 text-center">
        <Logo href="/" size="md" />
        <h1 className="display mt-8 text-3xl text-ink">{copy.title}</h1>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-soft">
          {copy.body}
        </p>
        {accessGate === "license" && clinicAccess && (
          <p className="mt-2 text-[13px] text-ink-soft">
            {clinicAccess.name} · {clinicAccess.status}
            {clinicAccess.trialEndsAt
              ? ` · trial até ${new Date(clinicAccess.trialEndsAt).toLocaleDateString("pt-BR")}`
              : ""}
          </p>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {accessGate === "no_auth" && (
            <Link href="/entrar" className="btn-primary">
              {blocked.noAuth.cta}
            </Link>
          )}
          {accessGate === "no_clinic" && (
            <Link href="/entrar" className="btn-primary">
              {blocked.noClinic.cta}
            </Link>
          )}
          {accessGate === "license" && (
            <>
              <Link href="/clinica" className="btn-primary">
                {blocked.license.plan}
              </Link>
              <Link
                href="/#contato"
                className="rounded-full border border-ink/15 px-5 py-2.5 text-[13px]"
              >
                {blocked.license.contact}
              </Link>
            </>
          )}
          {accessGate === "unavailable" && (
            <Link
              href="/#contato"
              className="btn-primary"
            >
              {blocked.unavailable.contact}
            </Link>
          )}
          <Link
            href="/"
            className="rounded-full border border-ink/15 px-5 py-2.5 text-[13px]"
          >
            Voltar ao site
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grain atmosphere min-h-screen">
      {showOnboarding && (
        <Onboarding
          onClose={() => {
            markOnboardingSeen();
            setShowOnboarding(false);
          }}
        />
      )}

      {present && imageUrl && (
        <PresentMode
          imageUrl={imageUrl}
          profileUrl={profileUrl}
          marks={marks}
          scenario={scenario}
          onScenario={selectScenario}
          onClose={() => setPresent(false)}
          compare={presentCompare && cenarioView !== "dual"}
          dual={presentCompare && cenarioView === "dual"}
          preference={preference}
          onPreference={setPreference}
        />
      )}

      <header className="sticky top-0 z-30 border-b border-ink/10 bg-paper/92 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 md:px-6">
          <div className="flex min-w-0 items-center gap-4">
            <Link
              href="/"
              className="shrink-0 text-[12px] text-ink-soft hover:text-ink"
            >
              ← Site
            </Link>
            <Logo href="/consulta" size="sm" />
            {clinicAccess?.environment === "demo" && (
              <span className="hidden rounded-full border border-sand/50 bg-sand/20 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.14em] text-ink sm:inline">
                Demonstração
              </span>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={resetSession}
              className="hidden rounded-lg px-3 py-2 text-[12px] text-ink-soft hover:bg-fog sm:inline"
            >
              Nova sessão
            </button>
            <button
              type="button"
              disabled={!imageUrl}
              onClick={() => {
                setPresentCompare(step === "cenarios");
                setPresent(true);
              }}
              className="btn-primary !py-2 !px-3.5 disabled:opacity-30"
            >
              Modo apresentação
            </button>
          </div>
        </div>

        <div className="border-t border-ink/8">
          <div className="mx-auto max-w-6xl px-4 pt-2 md:px-6">
            <div className="h-1.5 overflow-hidden rounded-full bg-ink/8">
              <div
                className={`h-full rounded-full transition-all duration-500 ${stepMeta.tone.bar}`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="mt-1.5 text-[10px] uppercase tracking-[0.16em] text-ink-soft">
              Etapa {stepIndex + 1} de {STEPS_UI.length} · {progressPct}%
            </p>
          </div>
          <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2.5 md:px-6">
            {STEPS_UI.map((s, i) => {
              const reachable =
                i <= stepIndex || canJumpToStep(i, stepGateCtx);
              const active = s.id === step;
              const done = i < stepIndex;
              return (
                <button
                  key={s.id}
                  type="button"
                  disabled={!reachable}
                  onClick={() => tryJumpTo(s.id)}
                  className={`shrink-0 rounded-lg px-3 py-1.5 text-[12px] transition disabled:cursor-not-allowed disabled:opacity-35 ${
                    active
                      ? s.tone.chip
                      : done
                        ? s.tone.soft
                        : "text-ink-soft"
                  }`}
                >
                  <span className="opacity-70">{i + 1}</span> {s.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <EthicsStrip />

      <main className="mx-auto grid max-w-6xl gap-8 px-4 py-8 md:grid-cols-[1.15fr_0.85fr] md:px-6 md:py-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${step}-${arDevice}-${cenarioView}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {step === "cenarios" && imageUrl ? (
              cenarioView === "dual" ? (
                <DualAngleView
                  frontUrl={imageUrl}
                  profileUrl={profileUrl}
                  marks={marks}
                  scenario={scenario}
                />
              ) : cenarioView === "morph" ? (
                <MorphCompare imageUrl={imageUrl} marks={marks} />
              ) : (
                <ScenarioCompare
                  imageUrl={imageUrl}
                  marks={marks}
                  active={scenario}
                  onSelect={selectScenario}
                />
              )
            ) : step === "ar" ? (
              arDevice === "glasses" ? (
                <GlassesAr marks={marks} scenario={scenario} />
              ) : (
                <ArPreview marks={marks} scenario={scenario} />
              )
            ) : step === "kit" ? (
              <div className="panel p-6 md:p-8">
                <p className="text-[11px] uppercase tracking-[0.22em] text-sea">
                  Apoio tátil
                </p>
                <h2 className="display mt-2 text-3xl tracking-tight text-ink">
                  {APP_COPY.tool.kitTitle}
                </h2>
                <p className="mt-3 max-w-lg text-[14px] leading-relaxed text-ink-soft">
                  {APP_COPY.tool.kitBody}
                </p>
                <div className="mt-6 md:hidden">
                  <KitGuide />
                </div>
              </div>
            ) : (
              <FaceCanvas
                imageUrl={imageUrl}
                marks={marks}
                vectors={vectors}
                measures={measures}
                activeRegion={activeRegion}
                intensity={intensity}
                scenario={scenario}
                drawMode={drawMode}
                showCautionZones={showCautionZones && step === "marcar"}
                onAddMark={(partial) =>
                  setMarks((prev) => [
                    ...prev,
                    { ...partial, id: `${Date.now()}-${prev.length}` },
                  ])
                }
                onAddVector={(partial) =>
                  setVectors((prev) => [
                    ...prev,
                    {
                      ...partial,
                      id: `${Date.now()}-v${prev.length}`,
                      label: "vetor",
                    },
                  ])
                }
                onAddMeasure={(partial) =>
                  setMeasures((prev) => [
                    ...prev,
                    { ...partial, id: `${Date.now()}-m${prev.length}` },
                  ])
                }
                interactive={planningInteractive}
              />
            )}

            {profileUrl && step === "foto" && (
              <div
                role="img"
                aria-label="Foto de perfil de apoio"
                className="max-h-40 min-h-28 rounded-xl border border-ink/10 bg-cover bg-center"
                style={{ backgroundImage: `url(${profileUrl})` }}
              />
            )}

            <div className="panel px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-sea">
                  Frase para a mesa
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setScriptIndex((i) => (i + 1) % SCRIPT_LINES.length)
                  }
                  className="text-[12px] text-sea-deep hover:underline"
                >
                  Próxima
                </button>
              </div>
              <p className="mt-2 text-[13px] leading-relaxed text-ink">
                “{SCRIPT_LINES[scriptIndex]}”
              </p>
            </div>

            <p className="rounded-xl border border-warn/25 bg-warn/[0.05] px-3.5 py-2.5 text-[11px] leading-relaxed text-warn">
              {DISCLAIMER}
            </p>
          </motion.div>
        </AnimatePresence>

        <aside className="space-y-5">
          <div className={`mb-1 rounded-xl border ${stepMeta.tone.border} bg-paper p-4`}>
            <p className={`text-[11px] uppercase tracking-[0.2em] ${stepMeta.tone.accent}`}>
              Etapa {stepIndex + 1} de {STEPS_UI.length}
            </p>
            <h1 className="display mt-1 text-[1.75rem] leading-tight tracking-tight text-ink">
              {stepMeta.title}
            </h1>
            <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
              {stepMeta.subtitle}
            </p>
            <p className={`mt-4 rounded-lg px-3 py-2.5 text-[13px] font-medium leading-relaxed ${stepMeta.tone.soft}`}>
              Agora: {stepMeta.coach}
            </p>
            <ul className="mt-3 space-y-1.5 text-[12px] text-ink-soft">
              {stepMeta.checklist.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className={stepMeta.tone.accent}>·</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {step === "foto" && (
            <Panel>
              <CaptureGuide
                hasFront={Boolean(imageUrl)}
                hasProfile={Boolean(profileUrl)}
              />
              <GuidedCapture
                hasFront={Boolean(imageUrl)}
                hasProfile={Boolean(profileUrl)}
                onCapture={(dataUrl, angle) => {
                  if (angle === "front") setImageUrl(dataUrl);
                  else setProfileUrl(dataUrl);
                }}
              />
              <div className="relative flex items-center gap-3 py-1">
                <div className="h-px flex-1 bg-ink/10" />
                <span className="text-[10px] uppercase tracking-[0.16em] text-ink-soft">
                  ou
                </span>
                <div className="h-px flex-1 bg-ink/10" />
              </div>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-ink/20 bg-fog/80 px-4 py-7 text-center transition hover:border-sea/45 hover:bg-sea/[0.04]">
                <span className="text-[14px] text-ink">
                  {imageUrl ? "Trocar foto frontal (arquivo)" : "Enviar do arquivo"}
                </span>
                <span className="mt-1 text-[12px] text-ink-soft">
                  JPG ou PNG · permanece neste aparelho
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onFile(e.target.files?.[0] ?? null, "front")}
                />
              </label>
              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-ink/10 px-3.5 py-3 text-[12px] text-ink-soft hover:border-sea/35">
                <span>
                  {profileUrl
                    ? "Trocar perfil (arquivo)"
                    : "Perfil do arquivo (opcional)"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="max-w-[9rem] text-[10px]"
                  onChange={(e) =>
                    onFile(e.target.files?.[0] ?? null, "profile")
                  }
                />
              </label>
              <button
                type="button"
                onClick={loadDemo}
                className="w-full rounded-xl border border-sea/30 bg-sea/[0.06] px-4 py-3 text-[13px] text-sea-deep transition hover:bg-sea/10"
              >
                {APP_COPY.tool.demoFace}
              </button>
              <PhotoQualityHint imageUrl={imageUrl} />
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label={APP_COPY.tool.patientLabel}
                  value={patientLabel}
                  onChange={setPatientLabel}
                  placeholder="Iniciais ou código"
                />
                <Field
                  label="Profissional"
                  value={professionalLabel}
                  onChange={setProfessionalLabel}
                  placeholder="Nome / registro"
                />
              </div>
            </Panel>
          )}

          {step === "marcar" && (
            <Panel>
              <div>
                <p className="mb-2 text-[12px] font-medium text-ink">
                  Roteiros prontos
                </p>
                <div className="flex flex-wrap gap-2">
                  {PROCEDURE_TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      title={tpl.description}
                      onClick={() => applyTemplate(tpl.id)}
                      className={`rounded-lg px-2.5 py-1.5 text-[11px] ${
                        activeTemplate === tpl.id
                          ? "bg-sea-deep text-paper"
                          : "border border-ink/10 text-ink-soft hover:border-sea/40"
                      }`}
                    >
                      {tpl.label}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-ink-soft">
                  Mapas genéricos para iniciar. Ajuste sempre na foto real.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {(
                  [
                    ["mark", "Volume"],
                    ["vector", "Vetor"],
                    ["measure", "Medida"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setDrawMode(id)}
                    className={`rounded-lg px-2 py-2 text-[11px] ${
                      drawMode === id
                        ? "bg-sea text-paper"
                        : "border border-ink/10 text-ink-soft"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {drawMode === "mark" && (
                <>
                  <div className="flex flex-wrap gap-2">
                    {REGIONS.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        title={r.hint}
                        onClick={() => setActiveRegion(r.id)}
                        className={`rounded-lg px-3 py-1.5 text-[12px] transition ${
                          activeRegion === r.id
                            ? "bg-sea text-paper"
                            : "border border-ink/10 bg-paper text-ink-soft hover:border-sea/30"
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                  <label className="block text-[12px] text-ink-soft">
                    Intensidade sugerida: {Math.round(intensity * 100)}%
                    <input
                      type="range"
                      min={0.2}
                      max={1}
                      step={0.05}
                      value={intensity}
                      onChange={(e) => setIntensity(Number(e.target.value))}
                      className="mt-2 w-full accent-sea"
                    />
                  </label>
                </>
              )}

              {drawMode === "vector" && (
                <p className="text-[12px] leading-relaxed text-ink-soft">
                  Arraste na foto: do ponto de entrada ao destino do volume.
                </p>
              )}
              {drawMode === "measure" && (
                <p className="text-[12px] leading-relaxed text-ink-soft">
                  Arraste para uma distância relativa na foto — referência
                  visual, não medida clínica em milímetros.
                </p>
              )}

              <label className="flex items-start gap-2 text-[12px] leading-relaxed text-ink-soft">
                <input
                  type="checkbox"
                  checked={showCautionZones}
                  onChange={(e) => setShowCautionZones(e.target.checked)}
                  className="mt-0.5 accent-warn"
                />
                Mostrar zonas de atenção (mapa genérico — não é anatomia desta
                paciente)
              </label>

              <div className="flex flex-wrap items-center justify-between gap-2 text-[12px] text-ink-soft">
                <span>
                  {marks.length} vol · {vectors.length} vet · {measures.length}{" "}
                  med
                </span>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={undoLast}
                    className="text-sea-deep hover:underline"
                  >
                    Desfazer
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMarks([]);
                      setVectors([]);
                      setMeasures([]);
                    }}
                    className="hover:underline"
                  >
                    Limpar
                  </button>
                </div>
              </div>
              <RegionGlossary activeRegion={activeRegion} />
            </Panel>
          )}

          {step === "cenarios" && (
            <Panel>
              <div className="grid grid-cols-3 gap-1.5">
                {(
                  [
                    ["triplo", "3 cenários"],
                    ["dual", "Frontal/perfil"],
                    ["morph", "Intensidade"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setCenarioView(id)}
                    className={`rounded-lg px-2 py-2 text-[11px] ${
                      cenarioView === id
                        ? "bg-sea-deep text-paper"
                        : "border border-ink/10 text-ink-soft"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                {SCENARIOS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => selectScenario(s.id)}
                    className={`w-full rounded-xl border px-3.5 py-3 text-left text-[12px] ${
                      scenario === s.id
                        ? s.tone === "warn"
                          ? "border-warn bg-warn/10"
                          : "border-sea bg-sea/10"
                        : "border-ink/10"
                    }`}
                  >
                    <span className="font-medium text-ink">{s.label}</span>
                    <span className="mt-1 block leading-relaxed text-ink-soft">
                      {s.description}
                    </span>
                  </button>
                ))}
              </div>
              {scenarioMeta && (
                <p className="text-[12px] text-ink-soft">
                  Em destaque:{" "}
                  <strong className="text-ink">{scenarioMeta.label}</strong>
                </p>
              )}
              <button
                type="button"
                disabled={!imageUrl}
                onClick={() => {
                  setPresentCompare(true);
                  setPresent(true);
                }}
                className="w-full rounded-xl border border-ink/12 px-4 py-2.5 text-[13px] text-ink hover:bg-fog disabled:opacity-30"
              >
                Apresentar na tela cheia
              </button>
              <PreferenceCapture value={preference} onChange={setPreference} />
            </Panel>
          )}

          {step === "ar" && (
            <Panel>
              <ArExplainer />
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setArDevice("phone")}
                  className={`rounded-xl px-3 py-2.5 text-[12px] ${
                    arDevice === "phone"
                      ? "bg-sea-deep text-paper"
                      : "border border-ink/10 text-ink-soft"
                  }`}
                >
                  Celular
                </button>
                <button
                  type="button"
                  onClick={() => setArDevice("glasses")}
                  className={`rounded-xl px-3 py-2.5 text-[12px] ${
                    arDevice === "glasses"
                      ? "bg-sea-deep text-paper"
                      : "border border-ink/10 text-ink-soft"
                  }`}
                >
                  Óculos XR
                </button>
              </div>
              <p className="text-[12px] leading-relaxed text-ink-soft">
                {arDevice === "phone"
                  ? "A câmera do celular sobrepõe as marcas ao rosto. Use em ambiente bem iluminado."
                  : "Para óculos compatíveis com WebXR. Em aparelhos sem suporte, a ferramenta avisa."}
              </p>
              <div className="flex flex-wrap gap-2">
                {SCENARIOS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => selectScenario(s.id)}
                    className={`rounded-lg px-3 py-1.5 text-[12px] ${
                      scenario === s.id
                        ? "bg-sea-deep text-paper"
                        : "border border-ink/10 text-ink-soft"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </Panel>
          )}

          {step === "kit" && (
            <Panel>
              <div className="hidden md:block">
                <KitGuide />
              </div>
              <div className="md:hidden">
                <p className="text-[13px] text-ink-soft">
                  O roteiro completo está acima, nesta etapa.
                </p>
              </div>
              <Link
                href="/kit"
                className="inline-block text-[12px] text-sea-deep hover:underline"
              >
                Página completa do kit →
              </Link>
            </Panel>
          )}

          {step === "exportar" && (
            <Panel>
              <AlignmentMeter
                topics={topics}
                hasMarks={marks.length > 0}
                showedExaggerated={showedExaggerated}
                patientAck={patientAck}
                preference={preference}
                accepted={accepted}
              />
              <div className="rounded-xl border border-ink/10 bg-fog/70 px-3.5 py-3.5 text-[12px] text-ink-soft">
                <p className="font-medium text-ink">Resumo da sessão</p>
                <ul className="mt-2.5 space-y-1.5">
                  <li>Paciente: {patientLabel || "—"}</li>
                  <li>Roteiro: {templateLabel || "marcação livre"}</li>
                  <li>
                    Marcações: {marks.length} · Vetores: {vectors.length} ·
                    Medidas: {measures.length}
                  </li>
                  <li>Cenário: {scenarioMeta?.label}</li>
                  <li>Preferência: {preferenceLabel(preference)}</li>
                  <li>Perfil anexado: {profileUrl ? "sim" : "não"}</li>
                  <li>
                    Checklist: {topics.length}/{TOPIC_CHECKS.length}
                  </li>
                </ul>
              </div>
              <PreferenceCapture value={preference} onChange={setPreference} />
              <label className="block text-[12px] text-ink-soft">
                Notas da conversa
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="mt-2 w-full rounded-xl border border-ink/15 bg-paper px-3 py-2.5 text-[13px] text-ink outline-none focus:border-sea"
                  placeholder="Limites, dúvidas, próximos passos…"
                />
              </label>

              <div className="space-y-2.5">
                <p className="text-[12px] font-medium text-ink">
                  Checklist da conversa
                </p>
                {TOPIC_CHECKS.map((t) => (
                  <label
                    key={t.id}
                    className="flex items-start gap-2 text-[12px] leading-relaxed text-ink-soft"
                  >
                    <input
                      type="checkbox"
                      checked={topics.includes(t.id)}
                      onChange={() => toggleTopic(t.id)}
                      className="mt-0.5 accent-sea"
                    />
                    {t.label}
                  </label>
                ))}
              </div>

              <label className="flex items-start gap-2 text-[12px] leading-relaxed text-ink-soft">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                  className="mt-0.5 accent-sea"
                />
                {APP_COPY.tool.exportAck}
              </label>
              <label className="flex items-start gap-2 text-[12px] leading-relaxed text-ink-soft">
                <input
                  type="checkbox"
                  checked={patientAck}
                  onChange={(e) => setPatientAck(e.target.checked)}
                  className="mt-0.5 accent-sea"
                />
                {APP_COPY.tool.patientAck}
              </label>
              <label className="flex items-start gap-2 text-[12px] leading-relaxed text-ink-soft">
                <input
                  type="checkbox"
                  checked={keepPhotosLocal}
                  onChange={(e) => setKeepPhotosLocal(e.target.checked)}
                  className="mt-0.5 accent-sea"
                />
                {APP_COPY.tool.photoLocal}
              </label>

              <SignaturePad onChange={setSignatureUrl} />

              <button
                type="button"
                disabled={!accepted || exporting}
                onClick={handleExport}
                className="btn-primary w-full !py-3 disabled:opacity-40"
              >
                {exporting ? "Gerando…" : "Baixar PDF e salvar no histórico"}
              </button>
              {savedFlash && (
                <p className="text-[12px] text-sea-deep">
                  Salvo{" "}
                  {currentUser()
                    ? "neste aparelho e na nuvem"
                    : "neste aparelho"}
                  . Veja em{" "}
                  <Link href="/clinica" className="underline">
                    Clínica
                  </Link>
                  .
                </p>
              )}
            </Panel>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={goPrev}
              disabled={stepIndex === 0}
              className="btn-ghost flex-1 disabled:opacity-30"
            >
              Voltar
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={
                stepIndex === STEPS_UI.length - 1 || !canContinue
              }
              className="btn-primary flex-1 disabled:opacity-30"
            >
              Continuar
            </button>
          </div>
          <p className="text-center text-[10px] text-ink-soft/80">
            {APP_COPY.tool.shortcuts}
          </p>
        </aside>
      </main>
    </div>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return <div className="panel space-y-4 p-5 md:p-6">{children}</div>;
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block text-[12px] text-ink-soft">
      {label}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-xl border border-ink/15 bg-paper px-3 py-2.5 text-[13px] text-ink outline-none focus:border-sea"
      />
    </label>
  );
}
