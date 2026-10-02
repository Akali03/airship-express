"use client";

import { useState } from "react";
import { FileSpreadsheet, Printer, FileText, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import { autoTable } from "jspdf-autotable";
import type { Report } from "../../services/report.service";
import AirshipExpressLogo from "../../../../public/images/airship.png";


async function loadImage(url: string) {
  const blob = await (await fetch(url)).blob();
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
  const { width, height } = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
  return { dataUrl, width, height };
}

export default function ExportButtons({
  report,
  csvUrl,
}: {
  report: Report;
  csvUrl: string;
}) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

 async function downloadPdf() {
    setGenerating(true);
    setError(null);

    try {
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      let cursorY = 48;

      const logo = await loadImage(AirshipExpressLogo.src);
      const logoH = 30;
      const logoW = (logo.width / logo.height) * logoH;
      doc.addImage(logo.dataUrl, "PNG", (pageWidth - logoW) / 2, 28, logoW, logoH);
      cursorY = 28 + logoH + 26; // push everything below the logo

      // Header rule in the Airship accent, so the file matches the app.
      doc.setDrawColor(255, 77, 155);
      doc.setLineWidth(2);
      doc.line(40, cursorY - 14, pageWidth - 40, cursorY - 14);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.text(report.title, 40, cursorY);

      cursorY += 15;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(110);
      doc.text(
        `Airship Express · Generated Report ${new Date(report.generatedAt).toLocaleString("en-PH", {
          dateStyle: "medium",
          timeStyle: "short",
        })}`,
        40,
        cursorY
      );
      cursorY += 12;
      doc.text(report.description, 40, cursorY, { maxWidth: pageWidth - 80 });

      cursorY += 16;
      doc.setTextColor(20);

      // KPI band
      const columns = report.kpis.length;
      const kpiWidth = (pageWidth - 80) / columns;
      const kpiHeight = 40;
      report.kpis.forEach((kpi, i) => {
        const x = 40 + i * kpiWidth;
        doc.setDrawColor(248, 248, 250);       
        doc.setFillColor(248, 248, 250);    
        doc.roundedRect(x, cursorY, kpiWidth - 6, kpiHeight, 4, 4, "FD");

        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(20);
        doc.text(String(kpi.value), x + 8, cursorY + 16);

        doc.setFontSize(6.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(110);
        doc.text(kpi.label.toUpperCase(), x + 8, cursorY + 30, {
          maxWidth: kpiWidth - 18,
        });
      });
      cursorY += kpiHeight + 18;

      if (report.isDevData) {
        doc.setFontSize(7.5);
        doc.setTextColor(180, 83, 9);
        doc.text(
          "Shipment rows are development data.",
          40,
          cursorY
        );
        cursorY += 14;
        doc.setTextColor(20);
      }

      // One table per block, each starting on a fresh page when it will not fit.
      //
      // jspdf-autotable v5 removed `doc.lastAutoTable` and does NOT pass
      // `finalY` to didDrawPage — reading either left cursorY undefined and
      // aborted the export. The hook exposes `cursor.y`, the bottom edge of
      // the table just drawn, which is the position the next block starts at.
      for (const block of report.blocks) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(20);
        doc.text(block.title, 40, cursorY);
        cursorY += 6;

        const head = [block.columns.map((c) => c.label)];
        const body = block.rows.map((row) =>
          block.columns.map((c) =>
            row[c.key] === null || row[c.key] === undefined
              ? ""
              : String(row[c.key])
          )
        );

        // A block with no rows still renders its header, so the PDF keeps the
        // report's shape instead of silently skipping a section.
        const safeBody =
          body.length > 0
            ? body
            : [block.columns.map(() => "—")];

        let tableBottom = cursorY;
        autoTable(doc, {
          startY: cursorY,
          head,
          body: safeBody,
          margin: { left: 40, right: 40 },
          styles: { font: "helvetica", fontSize: 7.5, cellPadding: 4, textColor: [30, 30, 30] },
          headStyles: { fillColor: [255, 241, 247], textColor: [0, 0, 0], font: "helvetica", fontStyle: "bold", fontSize: 7.5 },
          alternateRowStyles: { fillColor: [247, 247, 250] },
          didDrawPage: (hook) => {
            tableBottom = hook.cursor?.y ?? tableBottom;
          },
        });

        // Fall back to a measured offset if the hook gave us nothing, so a
        // multi-block report can never stack block two on top of block one.
        cursorY = Number.isFinite(tableBottom) ? tableBottom + 18 : cursorY + 80;

        // A new block always starts on a fresh page so a table is never split
        // awkwardly across the footer.
        const pageHeight = doc.internal.pageSize.getHeight();
        if (
          cursorY > pageHeight - 80 &&
          block !== report.blocks[report.blocks.length - 1]
        ) {
          doc.addPage();
          cursorY = 48;
        }
      }

      // Footer with page numbers
      const pageCount = doc.getNumberOfPages();
      for (let page = 1; page <= pageCount; page++) {
        doc.setPage(page);
        const pageHeight = doc.internal.pageSize.getHeight();
        doc.setFontSize(7);
        doc.setTextColor(140);
        doc.text(
          `CRBC Analytics · ${report.title}`,
          40,
          pageHeight - 20
        );
        doc.text(
          `Page ${page} of ${pageCount}`,
          pageWidth - 40,
          pageHeight - 20,
          { align: "right" }
        );
      }

      doc.save(`${report.type}-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (e) {
      console.error("PDF generation failed:", e);
      setError("Could not generate the PDF. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  const btn =
    "inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-line/50 hover:text-foreground";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={downloadPdf}
        disabled={generating}
        className={btn}
      >
        {generating ? (
          <Loader2 size={13} className="animate-spin" />
        ) : (
          <FileText size={13} />
        )}
        Export PDF
      </button>

      <a href={csvUrl} download className={btn}>
        <FileSpreadsheet size={13} />
        Export CSV
      </a>

      <button
        type="button"
        onClick={() => window.print()}
        className={btn}
      >
        <Printer size={13} />
        Print
      </button>

      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}