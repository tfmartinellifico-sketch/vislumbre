"use client";

import type { SavedConsulta } from "./storage";

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportHistoryJson(history: SavedConsulta[]) {
  const payload = {
    exportedAt: new Date().toISOString(),
    product: "Vislumbre",
    note: "Export sem fotos. Fotos permanecem apenas no aparelho de origem.",
    count: history.length,
    consultations: history,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  downloadBlob(`vislumbre-historico-${Date.now()}.json`, blob);
}

export function exportHistoryCsv(history: SavedConsulta[]) {
  const header = [
    "id",
    "createdAt",
    "patientLabel",
    "professionalLabel",
    "scenario",
    "marks",
    "vectors",
    "topics",
    "hasPhoto",
    "notes",
  ];
  const rows = history.map((h) =>
    [
      h.id,
      h.createdAt,
      csvEscape(h.patientLabel),
      csvEscape(h.professionalLabel),
      h.scenario,
      h.marks.length,
      h.vectors.length,
      h.topics.join(";"),
      h.hasPhoto ? "sim" : "nao",
      csvEscape(h.notes),
    ].join(","),
  );
  const csv = [header.join(","), ...rows].join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
  downloadBlob(`vislumbre-historico-${Date.now()}.csv`, blob);
}

function csvEscape(v: string) {
  const s = String(v ?? "").replace(/"/g, '""');
  return `"${s}"`;
}

/** Pacote texto para a clínica transferir ao prontuário (sem fotos). */
export function exportTransferPack(history: SavedConsulta[], clinicName: string) {
  const lines = [
    `Vislumbre — pacote de transferência`,
    `Clínica: ${clinicName || "—"}`,
    `Exportado em: ${new Date().toLocaleString("pt-BR")}`,
    `Registros: ${history.length}`,
    `Observação: este pacote NÃO inclui fotos faciais.`,
    ``,
    ...history.map(
      (h, i) =>
        `--- ${i + 1}. ${h.patientLabel || "sem rótulo"} (${h.createdAt}) ---\n` +
        `Profissional: ${h.professionalLabel}\n` +
        `Cenário: ${h.scenario}\n` +
        `Marcações: ${h.marks.length}\n` +
        `Tópicos: ${h.topics.join(", ") || "—"}\n` +
        `Notas: ${h.notes || "—"}\n`,
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
  downloadBlob(`vislumbre-transferencia-${Date.now()}.txt`, blob);
}
