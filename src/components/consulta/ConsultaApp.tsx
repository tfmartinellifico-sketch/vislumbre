"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FaceCanvas } from "./FaceCanvas";
import { FaceMesh3D } from "./FaceMesh3D";
import { Onboarding } from "./Onboarding";
import { PresentMode } from "./PresentMode";
import { GuidedCapture } from "./GuidedCapture";
import { EthicsStrip } from "./EthicsStrip";
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
  SCENARIOS,
  type Mark,
  type ScenarioId,
} from "@/lib/regions";
import { STEPS_UI, canJumpToStep, canLeaveStep, type StepId } from "@/lib/copy";
import { exportConsultaPdf } from "@/lib/exportPdf";
import {
  createDemoFaceDataUrl,
  createDemoProfileDataUrl,
} from "@/lib/demoFace";
import { SCRIPT_LINES, TOPIC_CHECKS, type Vector } from "@/lib/planning";
import {
  marksFromTemplateOnFace,
  PROCEDURE_TEMPLATES,
} from "@/lib/templates";
import { detectFaceLandmarks } from "@/lib/detectFace";
import type { LandmarkPoint } from "@/lib/faceLandmarks";
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
  isDemoClinic,
  resolveToolAccess,
  type Clinic,
  type ToolAccessReason,
} from "@/lib/platform-types";
import { APP_COPY } from "@/lib/app-copy";

type AccessGate = ToolAccessReason;

export function ConsultaApp() {
  const [step, setStep] = useState<StepId>("foto");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [profileUrl, setProfileUrl] = useState<string | null>(null);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [vectors] = useState<Vector[]>([]);
  const [scenario, setScenario] = useState<ScenarioId>("conservador");
  const [patientLabel, setPatientLabel] = useState("");
  const [professionalLabel, setProfessionalLabel] = useState("");
  const [notes, setNotes] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [scriptIndex, setScriptIndex] = useState(0);
  const [accepted, setAccepted] = useState(false);
  const [patientAck, setPatientAck] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [present, setPresent] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);
  const [faceLandmarks, setFaceLandmarks] = useState<LandmarkPoint[] | null>(
    null,
  );
  const [templateBusy, setTemplateBusy] = useState(false);
  const [templateError, setTemplateError] = useState<string | null>(null);
  const [show2d, setShow2d] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
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
  const stepMeta = STEPS_UI[Math.max(0, stepIndex)];
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
  const templateLabel =
    PROCEDURE_TEMPLATES.find((t) => t.id === activeTemplate)?.label ?? null;

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
        setNotes(reopened.notes);
        setTopics(reopened.topics);
        setPreference(reopened.preference);
        setPatientAck(reopened.patientAck);
        setShowedExaggerated(reopened.showedExaggerated);
        if (reopened.signatureDataUrl) setSignatureUrl(reopened.signatureDataUrl);
        if (reopened.photoFrontDataUrl) setImageUrl(reopened.photoFrontDataUrl);
        if (reopened.photoProfileDataUrl) setProfileUrl(reopened.photoProfileDataUrl);
        setStep(reopened.marks.length ? "mesa" : "foto");
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

  useEffect(() => {
    if (!imageUrl) {
      setFaceLandmarks(null);
      return;
    }
    let cancelled = false;
    detectFaceLandmarks(imageUrl)
      .then((face) => {
        if (!cancelled) setFaceLandmarks(face);
      })
      .catch(() => {
        if (!cancelled) setFaceLandmarks(null);
      });
    return () => {
      cancelled = true;
    };
  }, [imageUrl]);

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

  async function applyTemplate(id: string) {
    const tpl = PROCEDURE_TEMPLATES.find((t) => t.id === id);
    if (!tpl || !imageUrl) {
      setTemplateError("Envie a foto frontal antes de aplicar um roteiro.");
      return;
    }
    setTemplateBusy(true);
    setTemplateError(null);
    try {
      let face = faceLandmarks;
      if (!face) {
        face = await detectFaceLandmarks(imageUrl);
        setFaceLandmarks(face);
      }
      if (!face?.length) {
        setTemplateError(
          "Não encontrei um rosto nítido. Use foto frontal bem iluminada.",
        );
        return;
      }
      const next = marksFromTemplateOnFace(tpl, face);
      if (!next.length) {
        setTemplateError("Não consegui ancorar as regiões neste rosto.");
        return;
      }
      setMarks(next);
      setActiveTemplate(id);
      setNotes((prev) => prev || tpl.suggestedNotes);
    } catch {
      setTemplateError("Falha ao localizar o rosto. Tente novamente.");
    } finally {
      setTemplateBusy(false);
    }
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

  function resetSession() {
    setStep("foto");
    setImageUrl(null);
    setProfileUrl(null);
    setMarks([]);
    setScenario("conservador");
    setPatientLabel("");
    setNotes("");
    setTopics([]);
    setAccepted(false);
    setPatientAck(false);
    setActiveTemplate(null);
    setFaceLandmarks(null);
    setTemplateError(null);
    setPresent(false);
    setShow2d(false);
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
          if (
            !canLeaveStep(STEPS_UI[idx].id, {
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
      if ((e.key === "p" || e.key === "P") && imageUrl) setPresent(true);
      if (e.key === "f" || e.key === "F") {
        setScriptIndex((i) => (i + 1) % SCRIPT_LINES.length);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [imageUrl, marks.length]);

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
              {isDemoClinic(clinicAccess) ? (
                <Link href="/#contato" className="btn-primary">
                  {blocked.license.contact}
                </Link>
              ) : (
                <Link href="/clinica" className="btn-primary">
                  {blocked.license.plan}
                </Link>
              )}
            </>
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

  const show3d = Boolean(faceLandmarks?.length) && !show2d;

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
          compare={false}
          faceLandmarks={faceLandmarks}
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
              onClick={() => setPresent(true)}
              className="btn-primary !px-4 !py-2 text-[12px] disabled:opacity-40"
            >
              Apresentar
            </button>
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-4 pb-3 md:px-6">
          <div className="mb-2 flex items-center justify-between text-[11px] text-ink-soft">
            <span>
              Etapa {stepIndex + 1} de {STEPS_UI.length} · {progressPct}%
            </span>
            <span className="tabular-nums">{progressPct}%</span>
          </div>
          <div className="mb-3 h-1 overflow-hidden rounded-full bg-ink/10">
            <div
              className={`h-full transition-all duration-300 ${stepMeta.tone.bar}`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {STEPS_UI.map((s, i) => {
              const active = s.id === step;
              const unlocked =
                i <= stepIndex || canJumpToStep(i, stepGateCtx);
              return (
                <button
                  key={s.id}
                  type="button"
                  disabled={!unlocked}
                  onClick={() => tryJumpTo(s.id)}
                  className={`rounded-full px-3 py-1.5 text-[12px] transition disabled:opacity-35 ${
                    active
                      ? s.tone.chip
                      : "border border-ink/10 text-ink-soft hover:border-sea/40"
                  }`}
                >
                  {i + 1} {s.label}
                </button>
              );
            })}
          </div>
        </div>
        <EthicsStrip />
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 md:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)] md:px-6 lg:gap-8">
        <section className="space-y-4">
          {step === "foto" && (
            <div className="panel overflow-hidden p-0">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt="Foto frontal"
                  className="block max-h-[70vh] w-full object-contain bg-ink/5"
                />
              ) : (
                <div className="flex min-h-[320px] items-center justify-center px-6 text-center text-[14px] text-ink-soft">
                  Aguardando foto frontal para montar a mesa 3D
                </div>
              )}
            </div>
          )}

          {step === "mesa" && imageUrl && (
            <div className="space-y-3">
              {show3d && faceLandmarks ? (
                <FaceMesh3D
                  imageUrl={imageUrl}
                  faceLandmarks={faceLandmarks}
                  marks={marks}
                  scenario={scenario}
                  autoRotate={autoRotate}
                />
              ) : (
                <FaceCanvas
                  imageUrl={imageUrl}
                  marks={marks}
                  activeRegion="malar"
                  intensity={0.55}
                  scenario={scenario}
                  interactive={show2d}
                  faceLandmarks={faceLandmarks}
                  onAddMark={(partial) =>
                    setMarks((prev) => [
                      ...prev,
                      { ...partial, id: `${Date.now()}-${prev.length}` },
                    ])
                  }
                />
              )}
              <div className="flex flex-wrap gap-3 text-[12px] text-ink-soft">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={show2d || !faceLandmarks?.length}
                    disabled={!faceLandmarks?.length}
                    onChange={(e) => setShow2d(e.target.checked)}
                    className="accent-sea"
                  />
                  {faceLandmarks?.length
                    ? "Ajuste fino 2D"
                    : "3D indisponível — use 2D"}
                </label>
                {show3d && (
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={autoRotate}
                      onChange={(e) => setAutoRotate(e.target.checked)}
                      className="accent-sea"
                    />
                    Auto-rotação
                  </label>
                )}
              </div>
            </div>
          )}

          {step === "exportar" && imageUrl && (
            <div className="space-y-3">
              {faceLandmarks?.length ? (
                <FaceMesh3D
                  imageUrl={imageUrl}
                  faceLandmarks={faceLandmarks}
                  marks={marks}
                  scenario={scenario}
                  autoRotate={false}
                />
              ) : (
                <FaceCanvas
                  imageUrl={imageUrl}
                  marks={marks}
                  activeRegion="malar"
                  intensity={0.55}
                  scenario={scenario}
                  interactive={false}
                  faceLandmarks={faceLandmarks}
                  onAddMark={() => undefined}
                />
              )}
            </div>
          )}

          <div className="panel p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-sea">
              Frase para a mesa
            </p>
            <p className="mt-2 text-[15px] leading-relaxed text-ink">
              “{SCRIPT_LINES[scriptIndex]}”
            </p>
            <button
              type="button"
              onClick={() =>
                setScriptIndex((i) => (i + 1) % SCRIPT_LINES.length)
              }
              className="mt-3 text-[12px] text-sea-deep hover:underline"
            >
              Próxima
            </button>
          </div>
        </section>

        <aside className="space-y-4">
          <Panel>
            <p className={`text-[11px] uppercase tracking-[0.18em] ${stepMeta.tone.accent}`}>
              Etapa {stepIndex + 1} de {STEPS_UI.length}
            </p>
            <h2 className="display mt-1 text-2xl tracking-tight text-ink md:text-3xl">
              {stepMeta.title}
            </h2>
            <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
              {stepMeta.subtitle}
            </p>
            <div
              className={`mt-4 rounded-xl border px-3.5 py-3 text-[13px] leading-relaxed ${stepMeta.tone.border} ${stepMeta.tone.soft}`}
            >
              <span className="font-medium">Agora: </span>
              {stepMeta.coach}
            </div>
            <ul className="mt-3 space-y-1.5 text-[12px] text-ink-soft">
              {stepMeta.checklist.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className={stepMeta.tone.accent}>·</span>
                  {item}
                </li>
              ))}
            </ul>
          </Panel>

          {step === "foto" && (
            <Panel>
              <GuidedCapture
                hasFront={Boolean(imageUrl)}
                hasProfile={Boolean(profileUrl)}
                onCapture={(dataUrl, angle) => {
                  if (angle === "front") setImageUrl(dataUrl);
                  else setProfileUrl(dataUrl);
                }}
              />
              <label className="btn-ghost block cursor-pointer text-center">
                {imageUrl ? "Trocar foto frontal" : "Enviar do arquivo"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onFile(e.target.files?.[0] ?? null, "front")}
                />
              </label>
              <button type="button" onClick={loadDemo} className="btn-ghost w-full">
                Usar face educativa
              </button>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="Paciente (opcional)"
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
              <PhotoQualityHint imageUrl={imageUrl} />
              {imageUrl && (
                <p className="text-[12px] text-ink-soft">
                  {faceLandmarks?.length
                    ? "Rosto detectado — pronto para a mesa 3D."
                    : "Detectando rosto…"}
                </p>
              )}
            </Panel>
          )}

          {step === "mesa" && (
            <Panel>
              <p className="mb-2 text-[12px] font-medium text-ink">Roteiros</p>
              <div className="flex flex-wrap gap-2">
                {PROCEDURE_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    title={tpl.description}
                    disabled={templateBusy || !imageUrl}
                    onClick={() => applyTemplate(tpl.id)}
                    className={`rounded-lg px-2.5 py-1.5 text-[11px] disabled:opacity-50 ${
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
                {templateBusy
                  ? "Alinhando ao rosto…"
                  : "Volumes no 3D · arraste para girar"}
              </p>
              {templateError && (
                <p className="mt-2 text-[12px] text-warn">{templateError}</p>
              )}

              <div className="mt-4">
                <p className="mb-2 text-[12px] font-medium text-ink">Cenário</p>
                <div className="grid gap-2">
                  {SCENARIOS.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => selectScenario(s.id)}
                      className={`rounded-xl border px-3 py-2.5 text-left text-[12px] transition ${
                        scenario === s.id
                          ? "border-sea bg-sea/10 text-ink"
                          : "border-ink/10 text-ink-soft hover:border-sea/30"
                      }`}
                    >
                      <span className="font-medium">{s.label}</span>
                      <span className="mt-0.5 block text-[11px] opacity-80">
                        {s.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-[12px] text-ink-soft">
                {marks.length} volume{marks.length === 1 ? "" : "s"} ·{" "}
                {scenarioMeta?.label}
              </p>
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
                <p className="font-medium text-ink">Resumo</p>
                <ul className="mt-2 space-y-1">
                  <li>Paciente: {patientLabel || "—"}</li>
                  <li>Roteiro: {templateLabel || "—"}</li>
                  <li>Volumes: {marks.length}</li>
                  <li>Cenário: {scenarioMeta?.label}</li>
                </ul>
              </div>
              <PreferenceCapture value={preference} onChange={setPreference} />
              <label className="block text-[12px] text-ink-soft">
                Notas
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="mt-2 w-full rounded-xl border border-ink/15 bg-paper px-3 py-2.5 text-[13px] text-ink outline-none focus:border-sea"
                />
              </label>
              <div className="space-y-2">
                {TOPIC_CHECKS.map((t) => (
                  <label
                    key={t.id}
                    className="flex items-start gap-2 text-[12px] text-ink-soft"
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
              <label className="flex items-start gap-2 text-[12px] text-ink-soft">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                  className="mt-0.5 accent-sea"
                />
                {APP_COPY.tool.exportAck}
              </label>
              <label className="flex items-start gap-2 text-[12px] text-ink-soft">
                <input
                  type="checkbox"
                  checked={patientAck}
                  onChange={(e) => setPatientAck(e.target.checked)}
                  className="mt-0.5 accent-sea"
                />
                {APP_COPY.tool.patientAck}
              </label>
              <label className="flex items-start gap-2 text-[12px] text-ink-soft">
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
                {exporting ? "Gerando…" : "Baixar PDF e salvar"}
              </button>
              {savedFlash && (
                <p className="text-[12px] text-sea-deep">Sessão salva.</p>
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
              disabled={stepIndex === STEPS_UI.length - 1 || !canContinue}
              className="btn-primary flex-1 disabled:opacity-30"
            >
              Continuar
            </button>
          </div>
          <p className="text-center text-[11px] leading-relaxed text-ink-soft/80">
            {DISCLAIMER}
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
