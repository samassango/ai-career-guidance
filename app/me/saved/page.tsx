"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/app-components/ui/badge";
import {
  ArrowLeft,
  Heart,
  DollarSign,
  TrendingUp,
  GraduationCap,
  Trash2,
  Calendar,
  Download,
  AlertCircle,
} from "lucide-react";
import { getSavedCareers, unsaveCareer } from "@/app/actions/savedCareerActions";
import LoadingIndicator from "@/components/ui/loadingIndicator";
import Link from "next/link";
import { generateSavedCareerReport } from "@/lib/generateSavedCareerReport";

interface SavedCareer {
  id: string;
  career_name: string;
  pathway: string | null;
  salary_range: string | null;
  demand: string | null;
  education_paths: string | null;
  reason: string | null;
  confidence_score: number | null;
  created_at: string;
}

const confidenceColor = (score: number) =>
  score >= 80 ? "text-emerald-500" :
  score >= 60 ? "text-amber-500" :
  "text-red-400";

const confidenceBg = (score: number) =>
  score >= 80 ? "from-emerald-500/10 to-emerald-500/5" :
  score >= 60 ? "from-amber-500/10 to-amber-500/5" :
  "from-red-400/10 to-red-400/5";

const confidenceRing = (score: number) =>
  score >= 80 ? "border-emerald-500/30" :
  score >= 60 ? "border-amber-500/30" :
  "border-red-400/30";

const demandBadge = (d: string | null) => {
  if (!d) return null;
  const lower = d.toLowerCase();
  if (lower.startsWith("high")) return { label: "High Demand", cls: "bg-emerald-500/10 text-emerald-600" };
  if (lower.startsWith("growing")) return { label: "Growing Demand", cls: "bg-blue-500/10 text-blue-600" };
  return { label: d.split(".")[0] + " Demand", cls: "bg-secondary text-secondary-foreground" };
};

export default function SavedCareersPage() {
  const [careers, setCareers] = useState<SavedCareer[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const result = await getSavedCareers();
      setCareers(result.data as SavedCareer[]);
      setLoading(false);
    })();
  }, []);

  const handleRemove = async (careerName: string) => {
    setRemoving(careerName);
    const result = await unsaveCareer(careerName);
    if (!result.error) {
      setCareers((prev) => prev.filter((c) => c.career_name !== careerName));
    }
    setRemoving(null);
    setConfirmDelete(null);
  };

  const handleDownload = (career: SavedCareer) => {
    generateSavedCareerReport(career);
  };

  const handleDownloadAll = () => {
    careers.forEach((career) => {
      generateSavedCareerReport(career);
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-ZA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingIndicator message="Loading your saved careers..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/me"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Heart className="h-6 w-6 text-rose-500 fill-rose-500" />
                <h1 className="text-2xl font-bold">Saved Careers</h1>
              </div>
              <p className="text-muted-foreground">
                Careers you&apos;re interested in, saved for later reference.
              </p>
            </div>
            {careers.length > 1 && (
              <button
                onClick={handleDownloadAll}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors"
              >
                <Download className="h-4 w-4" />
                Download All
              </button>
            )}
          </div>
        </div>

        {/* Empty State */}
        {careers.length === 0 && (
          <div className="bg-card rounded-xl p-12 card-shadow text-center">
            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No saved careers yet</h3>
            <p className="text-muted-foreground text-sm mb-6">
              When you find a career recommendation you&apos;re interested in, click the
              heart icon to save it here.
            </p>
            <Link
              href="/me/assessment"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Take Assessment
            </Link>
          </div>
        )}

        {/* Saved Careers Grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          {careers.map((career, index) => {
            const demand = demandBadge(career.demand);
            const score = career.confidence_score || 0;
            const isConfirming = confirmDelete === career.career_name;

            return (
              <div
                key={career.id}
                className="bg-card rounded-xl p-5 card-shadow hover:card-shadow-hover transition-all duration-300 animate-fade-up relative"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Delete confirmation overlay */}
                {isConfirming && (
                  <div className="absolute inset-0 bg-card/95 backdrop-blur-sm rounded-xl z-10 flex flex-col items-center justify-center p-6">
                    <AlertCircle className="h-8 w-8 text-red-500 mb-3" />
                    <p className="text-sm font-medium text-center mb-1">
                      Remove this career?
                    </p>
                    <p className="text-xs text-muted-foreground text-center mb-4">
                      &quot;{career.career_name}&quot; will be permanently removed.
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRemove(career.career_name)}
                        disabled={removing === career.career_name}
                        className="px-4 py-1.5 text-sm font-medium rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                      >
                        {removing === career.career_name ? "Removing..." : "Remove"}
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="px-4 py-1.5 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="absolute top-4 right-4 flex items-center gap-1">
                  <button
                    onClick={() => handleDownload(career)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                    title="Download career report"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setConfirmDelete(career.career_name)}
                    disabled={removing === career.career_name}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all"
                    title="Remove from saved"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                  {score > 0 && (
                    <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-full border-2 ${confidenceRing(score)} bg-gradient-to-br ${confidenceBg(score)} shrink-0`}>
                      <span className={`text-sm font-bold leading-none ${confidenceColor(score)}`}>
                        {score}%
                      </span>
                      <span className="text-[8px] text-muted-foreground mt-0.5">Conf.</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base leading-tight mb-1 pr-16">
                      {career.career_name}
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      {demand && (
                        <Badge className={`text-xs ${demand.cls}`}>{demand.label}</Badge>
                      )}
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(career.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Reason */}
                {career.reason && (
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    {career.reason}
                  </p>
                )}

                {/* Details */}
                <div className="space-y-2 text-xs">
                  {career.salary_range && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <DollarSign className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{career.salary_range}</span>
                    </div>
                  )}
                  {career.pathway && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <TrendingUp className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{career.pathway}</span>
                    </div>
                  )}
                  {career.education_paths && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <GraduationCap className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{career.education_paths}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
