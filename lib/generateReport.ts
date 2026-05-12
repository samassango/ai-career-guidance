import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ReportData {
  summary?: string;
  overallConfidence: number;
  subjects: { name: string; percentage: number }[];
  skills: string[];
  interests: string[];
  personalityTraits: string[];
  recommendations: any[];
}

// Color palette
const COLORS = {
  primary: [37, 99, 235] as [number, number, number],       // blue-600
  primaryLight: [219, 234, 254] as [number, number, number], // blue-100
  dark: [30, 30, 30] as [number, number, number],
  gray: [107, 114, 128] as [number, number, number],
  lightGray: [243, 244, 246] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  green: [16, 185, 129] as [number, number, number],
  amber: [245, 158, 11] as [number, number, number],
  red: [239, 68, 68] as [number, number, number],
};

const confidenceColor = (score: number): [number, number, number] =>
  score >= 80 ? COLORS.green : score >= 60 ? COLORS.amber : COLORS.red;

const confidenceLabel = (score: number) =>
  score >= 80 ? "High" : score >= 60 ? "Moderate" : "Low";

export function generateRecommendationReport(data: ReportData) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  const addPageIfNeeded = (requiredSpace: number) => {
    if (y + requiredSpace > doc.internal.pageSize.getHeight() - 25) {
      doc.addPage();
      y = 20;
    }
  };

  // ─── HEADER ───────────────────────────────────────────────
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 45, "F");

  doc.setTextColor(...COLORS.white);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("AI Career Guidance Report", margin, 22);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Generated on ${new Date().toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" })}`,
    margin,
    32
  );

  doc.setFontSize(9);
  doc.text("AI Career Guidance System (ACGS)", margin, 39);

  y = 55;

  // ─── OVERALL CONFIDENCE ────────────────────────────────────
  if (data.overallConfidence > 0) {
    doc.setFillColor(...COLORS.lightGray);
    doc.roundedRect(margin, y, contentWidth, 18, 3, 3, "F");

    doc.setTextColor(...COLORS.dark);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Overall Confidence Score", margin + 6, y + 8);

    const scoreColor = confidenceColor(data.overallConfidence);
    doc.setTextColor(...scoreColor);
    doc.setFontSize(16);
    doc.text(`${data.overallConfidence}%`, pageWidth - margin - 6, y + 9, { align: "right" });

    doc.setFontSize(8);
    doc.text(`(${confidenceLabel(data.overallConfidence)})`, pageWidth - margin - 6, y + 15, { align: "right" });

    y += 25;
  }

  // ─── SUMMARY ──────────────────────────────────────────────
  if (data.summary) {
    addPageIfNeeded(30);
    doc.setTextColor(...COLORS.primary);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Summary", margin, y);
    y += 6;

    doc.setTextColor(...COLORS.gray);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const summaryLines = doc.splitTextToSize(data.summary, contentWidth);
    doc.text(summaryLines, margin, y);
    y += summaryLines.length * 4.5 + 6;
  }

  // ─── ACADEMIC PROFILE ─────────────────────────────────────
  if (data.subjects.length > 0) {
    addPageIfNeeded(20 + data.subjects.length * 8);

    doc.setTextColor(...COLORS.primary);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Academic Profile", margin, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [["Subject", "Score (%)"]],
      body: data.subjects.map((s) => [s.name, `${s.percentage}%`]),
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: COLORS.primary,
        textColor: COLORS.white,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: COLORS.lightGray,
      },
    });

    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // ─── SKILLS, INTERESTS, PERSONALITY ────────────────────────
  const profileSections = [
    { title: "Skills", items: data.skills },
    { title: "Interests", items: data.interests },
    { title: "Personality Traits", items: data.personalityTraits },
  ];

  for (const section of profileSections) {
    if (section.items.length === 0) continue;
    addPageIfNeeded(20);

    doc.setTextColor(...COLORS.primary);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(section.title, margin, y);
    y += 6;

    doc.setTextColor(...COLORS.dark);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");

    // Render as inline chips
    let xOffset = margin;
    for (const item of section.items) {
      const textWidth = doc.getTextWidth(item) + 8;
      if (xOffset + textWidth > pageWidth - margin) {
        xOffset = margin;
        y += 7;
        addPageIfNeeded(10);
      }
      doc.setFillColor(...COLORS.primaryLight);
      doc.roundedRect(xOffset, y - 4, textWidth, 7, 2, 2, "F");
      doc.setTextColor(...COLORS.primary);
      doc.text(item, xOffset + 4, y);
      xOffset += textWidth + 3;
    }
    y += 12;
  }

  // ─── CAREER RECOMMENDATIONS ────────────────────────────────
  if (data.recommendations.length > 0) {
    addPageIfNeeded(20);

    doc.setTextColor(...COLORS.primary);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Career Recommendations", margin, y);
    y += 8;

    for (let i = 0; i < data.recommendations.length; i++) {
      const rec = data.recommendations[i];
      const score = rec.matchScore ?? rec.confidence ?? 0;
      const scoreColor = confidenceColor(score);

      addPageIfNeeded(55);

      // Card background
      doc.setFillColor(...COLORS.lightGray);
      doc.roundedRect(margin, y, contentWidth, 50, 3, 3, "F");

      // Career title
      doc.setTextColor(...COLORS.dark);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`${i + 1}. ${rec.career}`, margin + 5, y + 8);

      // Confidence badge
      doc.setTextColor(...scoreColor);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`${score}%`, pageWidth - margin - 5, y + 8, { align: "right" });

      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.text(`${confidenceLabel(score)} Confidence`, pageWidth - margin - 5, y + 13, { align: "right" });

      // Demand
      if (rec.jobDemand) {
        doc.setTextColor(...COLORS.gray);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        const demandText = String(rec.jobDemand).split(".")[0];
        doc.text(`Demand: ${demandText}`, margin + 5, y + 14);
      }

      // Details grid
      const detailY = y + 20;
      doc.setFontSize(8);

      if (rec.salaryRange) {
        doc.setTextColor(...COLORS.dark);
        doc.setFont("helvetica", "bold");
        doc.text("Salary Range", margin + 5, detailY);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...COLORS.gray);
        const salaryLines = doc.splitTextToSize(rec.salaryRange, contentWidth / 3 - 10);
        doc.text(salaryLines, margin + 5, detailY + 4);
      }

      if (rec.pathway) {
        doc.setTextColor(...COLORS.dark);
        doc.setFont("helvetica", "bold");
        doc.text("Pathway", margin + contentWidth / 3 + 5, detailY);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...COLORS.gray);
        doc.text(rec.pathway, margin + contentWidth / 3 + 5, detailY + 4);
      }

      if (rec.requiredQualifications) {
        doc.setTextColor(...COLORS.dark);
        doc.setFont("helvetica", "bold");
        doc.text("Education", margin + (contentWidth * 2) / 3 + 5, detailY);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...COLORS.gray);
        const eduLines = doc.splitTextToSize(rec.requiredQualifications, contentWidth / 3 - 10);
        doc.text(eduLines, margin + (contentWidth * 2) / 3 + 5, detailY + 4);
      }

      // Reason (below card)
      if (rec.reason) {
        doc.setTextColor(...COLORS.gray);
        doc.setFontSize(8);
        doc.setFont("helvetica", "italic");
        const reasonLines = doc.splitTextToSize(rec.reason, contentWidth - 10);
        const reasonHeight = reasonLines.length * 3.5;
        // Expand card height
        doc.setFillColor(...COLORS.lightGray);
        doc.roundedRect(margin, y, contentWidth, 50 + reasonHeight + 2, 3, 3, "F");
        // Re-draw content that was on top
        // Just add the reason text at the bottom of the card
        doc.text(reasonLines, margin + 5, y + 34);
        y += 50 + reasonHeight + 8;
      } else {
        y += 58;
      }
    }
  }

  // ─── DISCLAIMER ────────────────────────────────────────────
  addPageIfNeeded(30);
  y += 5;

  doc.setDrawColor(...COLORS.amber);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Disclaimer", margin, y);
  y += 5;

  doc.setTextColor(...COLORS.gray);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  const disclaimerText =
    "This report is generated by an AI-based career guidance system and is intended for advisory purposes only. " +
    "The recommendations provided are based on the academic results, skills, interests, and personality traits " +
    "submitted by the user and should not be considered as definitive career decisions. " +
    "Users are strongly encouraged to consult with qualified career counsellors, educators, and industry " +
    "professionals before making any career-related decisions. The AI Career Guidance System (ACGS) does not " +
    "guarantee employment outcomes or the accuracy of salary ranges and job demand projections, as these may " +
    "vary based on location, market conditions, and individual circumstances.";

  const disclaimerLines = doc.splitTextToSize(disclaimerText, contentWidth);
  doc.text(disclaimerLines, margin, y);

  // ─── FOOTER ON EACH PAGE ──────────────────────────────────
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    const pageH = doc.internal.pageSize.getHeight();
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.gray);
    doc.text(
      `AI Career Guidance System — Page ${p} of ${pageCount}`,
      pageWidth / 2,
      pageH - 10,
      { align: "center" }
    );
  }

  // ─── SAVE ─────────────────────────────────────────────────
  const dateStr = new Date().toISOString().split("T")[0];
  doc.save(`ACGS_Career_Report_${dateStr}.pdf`);
}
