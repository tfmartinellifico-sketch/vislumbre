import type { PatientPreference } from "./alignment";
import type { Mark, ScenarioId } from "./regions";
import type { Vector } from "./planning";

const KEYS = {
  profile: "vislumbre.profile.v1",
  history: "vislumbre.history.v1",
  onboarding: "vislumbre.onboarding.v1",
  reopen: "vislumbre.reopen.v1",
} as const;

export type ProfessionalProfile = {
  name: string;
  registry: string;
  clinic: string;
  city: string;
};

export type SavedConsulta = {
  id: string;
  createdAt: string;
  patientLabel: string;
  professionalLabel: string;
  scenario: ScenarioId;
  marks: Mark[];
  vectors: Vector[];
  notes: string;
  topics: string[];
  hasPhoto: boolean;
  /** Preferência registrada na sessão (histórico + export). */
  preference: PatientPreference | null;
  alignmentScore: number | null;
  patientAck: boolean;
  showedExaggerated: boolean;
  /** Assinatura em data URL — só local; strip na nuvem. */
  signatureDataUrl?: string | null;
  /** Fotos opcionais — só neste aparelho, com consentimento. */
  photoFrontDataUrl?: string | null;
  photoProfileDataUrl?: string | null;
};

export function loadProfile(): ProfessionalProfile {
  if (typeof window === "undefined") {
    return { name: "", registry: "", clinic: "", city: "" };
  }
  try {
    const raw = localStorage.getItem(KEYS.profile);
    if (!raw) return { name: "", registry: "", clinic: "", city: "" };
    return { ...{ name: "", registry: "", clinic: "", city: "" }, ...JSON.parse(raw) };
  } catch {
    return { name: "", registry: "", clinic: "", city: "" };
  }
}

export function saveProfile(profile: ProfessionalProfile) {
  localStorage.setItem(KEYS.profile, JSON.stringify(profile));
}

function normalizeConsulta(raw: Partial<SavedConsulta> & { id: string }): SavedConsulta {
  return {
    id: raw.id,
    createdAt: raw.createdAt ?? new Date().toISOString(),
    patientLabel: raw.patientLabel ?? "",
    professionalLabel: raw.professionalLabel ?? "",
    scenario: raw.scenario ?? "conservador",
    marks: Array.isArray(raw.marks) ? raw.marks : [],
    vectors: Array.isArray(raw.vectors) ? raw.vectors : [],
    notes: raw.notes ?? "",
    topics: Array.isArray(raw.topics) ? raw.topics : [],
    hasPhoto: Boolean(raw.hasPhoto),
    preference: raw.preference ?? null,
    alignmentScore: raw.alignmentScore ?? null,
    patientAck: Boolean(raw.patientAck),
    showedExaggerated: Boolean(raw.showedExaggerated),
    signatureDataUrl: raw.signatureDataUrl ?? null,
    photoFrontDataUrl: raw.photoFrontDataUrl ?? null,
    photoProfileDataUrl: raw.photoProfileDataUrl ?? null,
  };
}

export function loadHistory(): SavedConsulta[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEYS.history);
    if (!raw) return [];
    const list = JSON.parse(raw) as Partial<SavedConsulta>[];
    if (!Array.isArray(list)) return [];
    return list
      .filter((c): c is Partial<SavedConsulta> & { id: string } => Boolean(c?.id))
      .map(normalizeConsulta);
  } catch {
    return [];
  }
}

export function saveConsulta(entry: SavedConsulta) {
  const list = loadHistory();
  const next = [normalizeConsulta(entry), ...list].slice(0, 40);
  localStorage.setItem(KEYS.history, JSON.stringify(next));
  return next;
}

export function deleteConsulta(id: string) {
  const next = loadHistory().filter((c) => c.id !== id);
  localStorage.setItem(KEYS.history, JSON.stringify(next));
  return next;
}

export function clearHistory() {
  localStorage.removeItem(KEYS.history);
}

export function hasSeenOnboarding() {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(KEYS.onboarding) === "1";
}

export function markOnboardingSeen() {
  localStorage.setItem(KEYS.onboarding, "1");
}

/** Prepara reabertura na ferramenta (sessionStorage — só nesta aba). */
export function stashReopenConsulta(entry: SavedConsulta) {
  sessionStorage.setItem(KEYS.reopen, JSON.stringify(entry));
}

export function consumeReopenConsulta(): SavedConsulta | null {
  try {
    const raw = sessionStorage.getItem(KEYS.reopen);
    if (!raw) return null;
    sessionStorage.removeItem(KEYS.reopen);
    const parsed = JSON.parse(raw) as Partial<SavedConsulta>;
    if (!parsed?.id) return null;
    return normalizeConsulta(parsed as Partial<SavedConsulta> & { id: string });
  } catch {
    return null;
  }
}

/** Remove blobs de foto/assinatura para sync nuvem / JSON sem mídia. */
export function stripMediaFields(entry: SavedConsulta): SavedConsulta {
  return {
    ...entry,
    signatureDataUrl: null,
    photoFrontDataUrl: null,
    photoProfileDataUrl: null,
  };
}
