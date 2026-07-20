import { jsPDF } from "jspdf";
import { DISCLAIMER, REGIONS, SCENARIOS, type Mark, type ScenarioId } from "./regions";
import { TOPIC_CHECKS } from "./planning";
import { renderAllScenarios } from "./renderScenario";

type ExportInput = {
  patientLabel: string;
  professionalLabel: string;
  scenario: ScenarioId;
  marks: Mark[];
  notes: string;
  photoDataUrl?: string | null;
  topics?: string[];
  vectorCount?: number;
  preferenceLabel?: string;
  patientAck?: boolean;
  signatureDataUrl?: string | null;
  alignmentScore?: number;
};

export async function exportConsultaPdf(input: ExportInput) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const scenario = SCENARIOS.find((s) => s.id === input.scenario);
  const date = new Date().toLocaleString("pt-BR");

  // —— Página 1: capa + resumo ——
  doc.setFillColor(244, 248, 246);
  doc.rect(0, 0, 210, 297, "F");

  doc.setFillColor(20, 56, 51);
  doc.rect(0, 0, 210, 38, "F");
  doc.setTextColor(250, 252, 251);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("Vislumbre", 18, 18);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(203, 184, 154);
  doc.text("Registro da conversa · demonstração sem garantia", 18, 28);

  doc.setTextColor(42, 56, 54);
  doc.setFontSize(11);
  let y = 52;
  doc.text(`Paciente (rótulo): ${input.patientLabel || "—"}`, 18, y);
  y += 7;
  doc.text(`Profissional: ${input.professionalLabel || "—"}`, 18, y);
  y += 7;
  doc.text(`Cenário em destaque: ${scenario?.label ?? "—"}`, 18, y);
  y += 7;
  doc.text(
    `Marcações: ${input.marks.length} · Vetores: ${input.vectorCount ?? 0} · ${date}`,
    18,
    y,
  );
  y += 7;
  doc.text(
    `Preferência verbalizada: ${input.preferenceLabel || "—"}`,
    18,
    y,
  );
  y += 7;
  doc.text(
    `Índice de alinhamento: ${input.alignmentScore ?? "—"} · Confirmação paciente: ${input.patientAck ? "sim" : "não"}`,
    18,
    y,
  );

  y = 95;
  if (input.photoDataUrl) {
    try {
      doc.setFontSize(11);
      doc.setTextColor(18, 26, 25);
      doc.text("Foto de referência", 18, y);
      doc.addImage(input.photoDataUrl, "JPEG", 18, y + 4, 62, 78, undefined, "FAST");
    } catch {
      doc.setFontSize(9);
      doc.text("Foto anexada (export visual limitado).", 18, y + 8);
    }
  }

  doc.setFontSize(12);
  doc.setTextColor(18, 26, 25);
  doc.text("Regiões da conversa", 95, 99);
  doc.setFontSize(10);
  doc.setTextColor(42, 56, 54);
  let ry = 107;
  if (input.marks.length === 0) {
    doc.text("Nenhuma marcação registrada.", 95, ry);
  } else {
    input.marks.forEach((mark, i) => {
      const region = REGIONS.find((r) => r.id === mark.region);
      doc.text(
        `${i + 1}. ${region?.label ?? mark.region} · ${Math.round(mark.intensity * 100)}%`,
        95,
        ry,
      );
      ry += 6.5;
    });
  }

  y = 172;
  doc.setFontSize(12);
  doc.setTextColor(18, 26, 25);
  doc.text("Checklist da conversa", 18, y);
  doc.setFontSize(10);
  doc.setTextColor(42, 56, 54);
  y += 7;
  const topics = input.topics ?? [];
  TOPIC_CHECKS.forEach((t) => {
    const ok = topics.includes(t.id) ? "[x]" : "[ ]";
    doc.text(`${ok} ${t.label}`, 18, y);
    y += 6;
  });

  y += 4;
  doc.setFontSize(12);
  doc.setTextColor(18, 26, 25);
  doc.text("Notas", 18, y);
  doc.setFontSize(10);
  doc.setTextColor(42, 56, 54);
  const notes = doc.splitTextToSize(input.notes || "Sem notas adicionais.", 174);
  doc.text(notes, 18, y + 7);

  let afterNotes = y + 10 + notes.length * 4.5;
  if (input.signatureDataUrl) {
    try {
      doc.setFontSize(10);
      doc.setTextColor(18, 26, 25);
      doc.text("Assinatura da paciente (confirmação da demonstração)", 18, afterNotes);
      doc.addImage(
        input.signatureDataUrl,
        "PNG",
        18,
        afterNotes + 3,
        70,
        20,
        undefined,
        "FAST",
      );
      afterNotes += 28;
    } catch {
      /* assinatura opcional */
    }
  }

  const discY = Math.min(255, afterNotes + 4);
  doc.setDrawColor(154, 77, 46);
  doc.setLineWidth(0.35);
  doc.line(18, discY, 192, discY);
  doc.setFontSize(8);
  doc.setTextColor(154, 77, 46);
  doc.text("AVISO", 18, discY + 6);
  doc.setTextColor(42, 56, 54);
  const disc = doc.splitTextToSize(DISCLAIMER, 174);
  doc.text(disc, 18, discY + 11);

  // —— Página 2: três cenários lado a lado ——
  if (input.photoDataUrl && typeof document !== "undefined") {
    try {
      const strips = await renderAllScenarios(input.photoDataUrl, input.marks, 480);
      doc.addPage();
      doc.setFillColor(244, 248, 246);
      doc.rect(0, 0, 210, 297, "F");

      doc.setFillColor(20, 56, 51);
      doc.rect(0, 0, 210, 28, "F");
      doc.setTextColor(250, 252, 251);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("Cenários apresentados na consulta", 18, 17);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(42, 56, 54);
      doc.text(
        "Comparação educativa. Nenhuma imagem é previsão ou garantia de resultado.",
        18,
        38,
      );

      const colW = 56;
      const gap = 5;
      const startX = 18;
      const imgTop = 46;
      const imgH = 72;

      SCENARIOS.forEach((s, i) => {
        const x = startX + i * (colW + gap);
        const data = strips[s.id];
        try {
          doc.addImage(data, "JPEG", x, imgTop, colW, imgH, undefined, "FAST");
        } catch {
          doc.setDrawColor(200, 200, 200);
          doc.rect(x, imgTop, colW, imgH);
        }
        doc.setFontSize(10);
        doc.setTextColor(18, 26, 25);
        doc.text(s.label, x, imgTop + imgH + 7);
        doc.setFontSize(8);
        doc.setTextColor(42, 56, 54);
        const desc = doc.splitTextToSize(s.description, colW);
        doc.text(desc, x, imgTop + imgH + 13);

        if (s.id === input.scenario) {
          doc.setDrawColor(36, 87, 80);
          doc.setLineWidth(0.6);
          doc.rect(x - 1, imgTop - 1, colW + 2, imgH + 2);
          doc.setFontSize(8);
          doc.setTextColor(36, 87, 80);
          doc.text("Em destaque", x, imgTop - 3);
        }
      });

      doc.setFontSize(9);
      doc.setTextColor(42, 56, 54);
      doc.text(
        "Discreto → equilíbrio → exagero proposital (o que se evita).",
        18,
        175,
      );

      doc.setDrawColor(154, 77, 46);
      doc.line(18, 250, 192, 250);
      doc.setFontSize(8);
      doc.setTextColor(154, 77, 46);
      const disc2 = doc.splitTextToSize(DISCLAIMER, 174);
      doc.text(disc2, 18, 258);
    } catch {
      // Sem página visual se o canvas falhar (SSR / imagem inválida)
    }
  }

  doc.save(`vislumbre-${Date.now()}.pdf`);
}
