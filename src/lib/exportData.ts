"use client";

import JSZip from "jszip";
import type { SavedConsulta } from "./storage";
import { preferenceLabel, type PatientPreference } from "./alignment";
import { stripMediaFields } from "./storage";

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function dataUrlToBlob(dataUrl: string) {
  const [meta, b64] = dataUrl.split(",");
  const mime = /data:([^;]+)/.exec(meta)?.[1] ?? "application/octet-stream";
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return { blob: new Blob([bytes], { type: mime }), ext: mime.includes("png") ? "png" : "jpg" };
}

export function exportHistoryJson(history: SavedConsulta[], includeMedia = false) {
  const consultations = includeMedia
    ? history
    : history.map((h) => stripMediaFields(h));
  const payload = {
    exportedAt: new Date().toISOString(),
    product: "Vislumbre",
    note: includeMedia
      ? "Export com mídia local. Trate como dado sensível (LGPD)."
      : "Export sem fotos/assinatura. Fotos permanecem apenas no aparelho de origem.",
    count: history.length,
    consultations,
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
    "preference",
    "alignmentScore",
    "patientAck",
    "showedExaggerated",
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
      csvEscape(preferenceLabel((h.preference as PatientPreference | null) ?? null)),
      h.alignmentScore ?? "",
      h.patientAck ? "sim" : "nao",
      h.showedExaggerated ? "sim" : "nao",
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
        `Preferência: ${preferenceLabel((h.preference as PatientPreference | null) ?? null)}\n` +
        `Índice alinhamento: ${h.alignmentScore ?? "—"}\n` +
        `Confirmação paciente: ${h.patientAck ? "sim" : "não"}\n` +
        `Cenário exagerado mostrado: ${h.showedExaggerated ? "sim" : "não"}\n` +
        `Marcações: ${h.marks.length}\n` +
        `Tópicos: ${h.topics.join(", ") || "—"}\n` +
        `Notas: ${h.notes || "—"}\n`,
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
  downloadBlob(`vislumbre-transferencia-${Date.now()}.txt`, blob);
}

/**
 * ZIP com JSON (sem blobs embutidos) + pastas de fotos quando existirem no histórico local.
 * Exige consentimento explícito na UI.
 */
export async function exportHistoryZipWithPhotos(history: SavedConsulta[]) {
  const zip = new JSZip();
  const safeHistory = history.map((h) => stripMediaFields(h));
  zip.file(
    "historico.json",
    JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        product: "Vislumbre",
        note: "Pacote com fotos locais. Consentimento explícito exigido na exportação.",
        consultations: safeHistory,
      },
      null,
      2,
    ),
  );

  const fotos = zip.folder("fotos");
  let photoCount = 0;
  for (const h of history) {
    const folderName = `${h.id}_${(h.patientLabel || "paciente").replace(/[^\w\-]+/g, "_").slice(0, 40)}`;
    if (h.photoFrontDataUrl) {
      const { blob, ext } = dataUrlToBlob(h.photoFrontDataUrl);
      fotos?.file(`${folderName}/frente.${ext}`, blob);
      photoCount += 1;
    }
    if (h.photoProfileDataUrl) {
      const { blob, ext } = dataUrlToBlob(h.photoProfileDataUrl);
      fotos?.file(`${folderName}/perfil.${ext}`, blob);
      photoCount += 1;
    }
    if (h.signatureDataUrl) {
      const { blob, ext } = dataUrlToBlob(h.signatureDataUrl);
      fotos?.file(`${folderName}/assinatura.${ext}`, blob);
    }
  }

  const out = await zip.generateAsync({ type: "blob" });
  downloadBlob(`vislumbre-historico-fotos-${Date.now()}.zip`, out);
  return { photoCount, consultations: history.length };
}
