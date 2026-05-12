import jsPDF from "jspdf";

interface SavedCareerData {
  career_name: string;
  pathway: string | null;
  salary_range: string | null;
  demand: string | null;
  education_paths: string | null;
  reason: string | null;
  confidence_score: number | null;
  created_at: string;
}

const COLORS = {
  primary: [37, 99, 235] as [number, number, number],
  primaryLight: [219, 234, 254] as [number, number, number],
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

export function generateSavedCareerReport(career: SavedCareerData) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  // ─── HEADER ───────────────────────────────────────────────
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 45, "F");

  doc.setTextColor(...COLORS.white);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Saved Career Report", margin, 22);

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

  // ─── CAREER TITLE ─────────────────────────────────────────
  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(career.career_name, margin, y);
  y += 8;

  // Saved date
  const savedDate = new Date(career.created_at).toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  doc.setTextColor(...COLORS.gray);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Saved on ${savedDate}`, margin, y);
  y += 12;

  // ─── CONFIDENCE SCORE ──────────────────────────────────────
  if (career.confidence_score && career.confidence_score > 0) {
    doc.setFillColor(...COLORS.lightGray);
    doc.roundedRect(margin, y, contentWidth, 18, 3, 3, "F");

    doc.setTextColor(...COLORS.dark);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Confidence Score", margin + 6, y + 8);

    const scoreColor = confidenceColor(career.confidence_score);
    doc.setTextColor(...scoreColor);
    doc.setFontSize(16);
    doc.text(`${career.confidence_score}%`, pageWidth - margin - 6, y + 9, { align: "right" });

    doc.setFontSize(8);
    doc.text(`(${confidenceLabel(career.confidence_score)})`, pageWidth - margin - 6, y + 15, { align: "right" });

    y += 25;
  }

  // ─── REASON / WHY THIS CAREER ──────────────────────────────
  if (career.reason) {
    doc.setTextColor(...COLORS.primary);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Why This Career Was Recommended", margin, y);
    y += 6;

    doc.setTextColor(...COLORS.gray);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const reasonLines = doc.splitTextToSize(career.reason, contentWidth);
    doc.text(reasonLines, margin, y);
    y += reasonLines.length * 4.5 + 8;
  }

  // ─── CAREER DETAILS ────────────────────────────────────────
  const details: { label: string; value: string }[] = [];

  if (career.salary_range) details.push({ label: "Salary Range", value: career.salary_range });
  if (career.demand) details.push({ label: "Job Market Demand", value: career.demand });
  if (career.pathway) details.push({ label: "Career Pathway", value: career.pathway });
  if (career.education_paths) details.push({ label: "Education & Qualifications", value: career.education_paths });

  if (details.length > 0) {
    doc.setTextColor(...COLORS.primary);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Career Details", margin, y);
    y += 8;

    for (const detail of details) {
      doc.setFillColor(...COLORS.lightGray);
      const valueLines = doc.splitTextToSize(detail.value, contentWidth - 12);
      const blockHeight = 10 + valueLines.length * 4;
      doc.roundedRect(margin, y, contentWidth, blockHeight, 2, 2, "F");

      doc.setTextColor(...COLORS.dark);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(detail.label, margin + 6, y + 6);

      doc.setTextColor(...COLORS.gray);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(valueLines, margin + 6, y + 12);

      y += blockHeight + 4;
    }
  }

  // ─── DISCLAIMER ────────────────────────────────────────────
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
    "professionals before making any career-related decisions.";

  const disclaimerLines = doc.splitTextToSize(disclaimerText, contentWidth);
  doc.text(disclaimerLines, margin, y);

  // ─── FOOTER ────────────────────────────────────────────────
  const pageH = doc.internal.pageSize.getHeight();
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.gray);
  doc.text(
    "AI Career Guidance System — Saved Career Report",
    pageWidth / 2,
    pageH - 10,
    { align: "center" }
  );

  // ─── SAVE ─────────────────────────────────────────────────
  const safeName = career.career_name.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 30);
  doc.save(`ACGS_${safeName}_Report.pdf`);
}
