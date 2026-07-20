"use client";

import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { useCallback, useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { FirebaseAccount } from "./FirebaseAccount";
import {
  clearCloudHistory,
  deleteCloudConsulta,
  loadCloudHistory,
  loadCloudProfile,
  migrateLocalData,
  saveCloudProfile,
} from "@/lib/firebase-cloud";
import {
  clearHistory,
  deleteConsulta,
  loadHistory,
  loadProfile,
  saveProfile,
  type ProfessionalProfile,
  type SavedConsulta,
} from "@/lib/storage";
import { SCENARIOS } from "@/lib/regions";

export function ClinicaPanel() {
  const [profile, setProfile] = useState<ProfessionalProfile>({
    name: "",
    registry: "",
    clinic: "",
    city: "",
  });
  const [history, setHistory] = useState<SavedConsulta[]>([]);
  const [savedMsg, setSavedMsg] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [cloudBusy, setCloudBusy] = useState(false);
  const [cloudMessage, setCloudMessage] = useState("");
  const [showCloudLater, setShowCloudLater] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setProfile(loadProfile());
      setHistory(loadHistory());
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const handleUserChange = useCallback(async (next: User | null) => {
    setUser(next);
    if (!next) return;
    setCloudBusy(true);
    try {
      const [cloudProfile, cloudHistory] = await Promise.all([
        loadCloudProfile(),
        loadCloudHistory(),
      ]);
      if (cloudProfile) {
        setProfile(cloudProfile);
        saveProfile(cloudProfile);
      }
      if (cloudHistory.length) {
        const local = loadHistory();
        const merged = mergeHistory(local, cloudHistory);
        setHistory(merged);
        merged.forEach((entry) => {
          const existing = loadHistory().some((item) => item.id === entry.id);
          if (!existing) {
            // Mantém o cache local compatível sem duplicar itens já existentes.
            local.push(entry);
          }
        });
        localStorage.setItem(
          "vislumbre.history.v1",
          JSON.stringify(merged.slice(0, 40)),
        );
      }
      setCloudMessage("Dados da nuvem carregados.");
    } catch {
      setCloudMessage("Não foi possível carregar a nuvem. O modo local segue ativo.");
    } finally {
      setCloudBusy(false);
    }
  }, []);

  async function persist() {
    saveProfile(profile);
    if (user) {
      setCloudBusy(true);
      try {
        await saveCloudProfile(profile);
        setCloudMessage("Perfil sincronizado com o Firebase.");
      } catch {
        setCloudMessage("Perfil salvo localmente; falha ao sincronizar.");
      } finally {
        setCloudBusy(false);
      }
    }
    setSavedMsg(true);
    window.setTimeout(() => setSavedMsg(false), 1800);
  }

  async function migrate() {
    setCloudBusy(true);
    try {
      await migrateLocalData(loadProfile(), loadHistory());
      setCloudMessage("Dados locais enviados ao Firebase.");
    } catch {
      setCloudMessage("Falha na migração. Nenhum dado local foi perdido.");
    } finally {
      setCloudBusy(false);
    }
  }

  async function removeOne(id: string) {
    setHistory(deleteConsulta(id));
    if (user) {
      try {
        await deleteCloudConsulta(id);
      } catch {
        setCloudMessage("Excluído localmente, mas a nuvem não respondeu.");
      }
    }
  }

  async function removeAll() {
    clearHistory();
    setHistory([]);
    if (user) {
      try {
        await clearCloudHistory();
      } catch {
        setCloudMessage("Histórico local limpo; falha ao limpar a nuvem.");
      }
    }
  }

  return (
    <div className="grain atmosphere min-h-screen">
      <header className="border-b border-ink/8 bg-paper/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
          <Logo href="/" size="md" />
          <div className="flex items-center gap-3 text-[13px]">
            <Link href="/" className="text-ink-soft hover:text-ink">
              Site
            </Link>
            <Link href="/consulta" className="btn-primary !py-2 !px-3.5">
              Abrir ferramenta
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-12 md:py-16">
        <section className="mb-12">
          <p className="text-[11px] uppercase tracking-[0.26em] text-sea">
            Clínica
          </p>
          <h1 className="display mt-3 text-4xl tracking-tight md:text-5xl">
            Perfil e histórico
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-[1.7] text-ink-soft">
            Guarde o nome do profissional e as consultas exportadas. Cadastro na
            nuvem é opcional — a ferramenta funciona sem isso.
          </p>
          <Link href="/consulta" className="btn-primary mt-7">
            Ir para a consulta
          </Link>
        </section>

        <div className="grid gap-10 md:grid-cols-2">
        <section>
          <p className="text-xs uppercase tracking-[0.2em] text-sea">Clínica</p>
          <h2 className="display mt-2 text-4xl">Perfil profissional</h2>
          <p className="mt-2 text-sm text-ink-soft">
            Opcional. Salvo neste navegador e preenche a consulta.
          </p>
          <div className="mt-6 space-y-3">
            {(
              [
                ["name", "Nome"],
                ["registry", "Registro (CRM / outro)"],
                ["clinic", "Clínica"],
                ["city", "Cidade"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="block text-xs text-ink-soft">
                {label}
                <input
                  value={profile[key]}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, [key]: e.target.value }))
                  }
                  className="mt-1 w-full rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-sea"
                />
              </label>
            ))}
            <button
              type="button"
              disabled={cloudBusy}
              onClick={persist}
              className="rounded-md bg-ink px-4 py-2.5 text-sm text-paper disabled:opacity-50"
            >
              Salvar perfil
            </button>
            {savedMsg && (
              <p className="text-xs text-sea">Perfil salvo neste dispositivo.</p>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-sea">Histórico</p>
              <h2 className="display mt-2 text-4xl">Consultas salvas</h2>
            </div>
            {history.length > 0 && (
              <button
                type="button"
                onClick={removeAll}
                className="text-xs text-warn underline-offset-2 hover:underline"
              >
                Limpar tudo
              </button>
            )}
          </div>
          <p className="mt-2 text-sm text-ink-soft">
            {history.length} sessão(ões) guardada(s).{" "}
            {user
              ? "Também sincronizadas na sua conta."
              : "Salvas neste navegador."}
          </p>
          <ul className="mt-6 max-h-[28rem] space-y-3 overflow-y-auto">
            {history.length === 0 && (
              <li className="rounded-xl border border-dashed border-ink/15 px-4 py-8 text-center text-[14px] text-ink-soft">
                Ainda não há registros. Exporte um PDF na ferramenta para
                aparecer aqui.
              </li>
            )}
            {history.map((item) => {
              const scenario = SCENARIOS.find((s) => s.id === item.scenario);
              return (
                <li
                  key={item.id}
                  className="rounded-lg border border-ink/10 bg-paper/90 px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-ink">
                        {item.patientLabel || "Paciente sem rótulo"}
                      </p>
                      <p className="mt-1 text-[11px] text-ink-soft">
                        {new Date(item.createdAt).toLocaleString("pt-BR")} ·{" "}
                        {scenario?.label} · {item.marks.length} marcações ·{" "}
                        {item.topics.length} tópicos
                      </p>
                      {item.notes && (
                        <p className="mt-2 line-clamp-2 text-xs text-ink-soft">
                          {item.notes}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeOne(item.id)}
                      className="text-[11px] text-ink-soft hover:text-warn"
                    >
                      Apagar
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
        </div>

        <section className="mt-14 border-t border-ink/10 pt-8">
          <button
            type="button"
            onClick={() => setShowCloudLater((v) => !v)}
            className="flex w-full items-center justify-between text-left"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">
                Depois
              </p>
              <h2 className="display mt-1 text-2xl text-ink-soft">
                Conta opcional (depois)
              </h2>
            </div>
            <span className="text-xs text-sea">
              {showCloudLater ? "Ocultar" : "Mostrar"}
            </span>
          </button>
          {showCloudLater && (
            <div className="mt-5 grid gap-5 md:grid-cols-[1fr_1.2fr]">
              <p className="text-sm leading-relaxed text-ink-soft">
                Só se quiser o histórico em mais de um aparelho. Fotos da
                paciente não sobem — ficam neste computador ou celular.
              </p>
              <div>
                <FirebaseAccount onUserChange={handleUserChange} />
                {user && (
                  <button
                    type="button"
                    disabled={cloudBusy}
                    onClick={migrate}
                    className="mt-3 rounded-md border border-sea/30 px-3 py-2 text-xs text-sea-deep disabled:opacity-50"
                  >
                    Enviar dados locais para a nuvem
                  </button>
                )}
                {cloudMessage && (
                  <p className="mt-2 text-xs text-sea-deep">{cloudMessage}</p>
                )}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function mergeHistory(local: SavedConsulta[], cloud: SavedConsulta[]) {
  const byId = new Map<string, SavedConsulta>();
  [...local, ...cloud].forEach((entry) => byId.set(entry.id, entry));
  return [...byId.values()]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 40);
}
