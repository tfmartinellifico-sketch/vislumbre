import type { Mark, ScenarioId } from "./regions";
import type { Vector } from "./planning";

const KEYS = {
  profile: "vislumbre.profile.v1",
  history: "vislumbre.history.v1",
  onboarding: "vislumbre.onboarding.v1",
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

export function loadHistory(): SavedConsulta[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEYS.history);
    if (!raw) return [];
    const list = JSON.parse(raw) as SavedConsulta[];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function saveConsulta(entry: SavedConsulta) {
  const list = loadHistory();
  const next = [entry, ...list].slice(0, 40);
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
