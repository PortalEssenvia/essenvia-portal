import jsPDF from "jspdf";

export type ExportRow = Record<string, string | number>;

function toCsv(headers: string[], rows: ExportRow[]): string {
  const esc = (v: unknown) => {
    const s = String(v ?? "");
    return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers.join(";"), ...rows.map((r) => headers.map((h) => esc(r[h])).join(";"))].join("\n");
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function downloadCsv(filename: string, headers: string[], rows: ExportRow[]) {
  // BOM para o Excel reconhecer acentuação
  download(new Blob(["\uFEFF" + toCsv(headers, rows)], { type: "text/csv;charset=utf-8" }), filename);
}

export type PdfTable = { title: string; headers: string[]; rows: ExportRow[] };

export function downloadPdf(filename: string, docTitle: string, subtitle: string, tables: PdfTable[]) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 40;
  let y = margin;

  const newPageIfNeeded = (h: number) => {
    if (y + h > pageH - margin) {
      doc.addPage();
      y = margin;
    }
  };

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(docTitle, margin, y);
  y += 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(110);
  doc.text(subtitle, margin, y);
  doc.setTextColor(0);
  y += 24;

  tables.forEach((t) => {
    newPageIfNeeded(60);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(t.title, margin, y);
    y += 14;

    const colW = (pageW - margin * 2) / t.headers.length;
    const drawHeader = () => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      t.headers.forEach((h, i) => doc.text(String(h), margin + i * colW, y, { maxWidth: colW - 4 }));
      y += 6;
      doc.setDrawColor(200);
      doc.line(margin, y, pageW - margin, y);
      y += 10;
    };
    drawHeader();

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    if (t.rows.length === 0) {
      doc.setTextColor(130);
      doc.text("Sem dados no período.", margin, y);
      doc.setTextColor(0);
      y += 16;
    }
    t.rows.forEach((r) => {
      newPageIfNeeded(20);
      if (y === margin) drawHeader();
      t.headers.forEach((h, i) =>
        doc.text(String(r[h] ?? ""), margin + i * colW, y, { maxWidth: colW - 4 })
      );
      y += 14;
    });
    y += 16;
  });

  doc.save(filename);
}
