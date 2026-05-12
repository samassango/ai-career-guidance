"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/app-components/ui/badge";
import { Progress } from "@/components/app-components/ui/progress";
import {
  ArrowLeft,
  Calendar,
  Shield,
  BookOpen,
  Star,
  Briefcase,
  ChevronDown,
  ChevronUp,
  BarChart3,
  GraduationCap,
  DollarSign,
  TrendingUp,
  Download,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { getRecommendationHistory, deleteRecommendationHistory } from "@/app/actions/historyActions";
import { generateRecommendationReport } from "@/lib/generateReport";
import LoadingIndicator from "@/components/ui/loadingIndicator";
import Link from "next/link";

interface HistoryEntry {
  id: string;
  academic_results: any[];
  skills: string[];
  interests: string[];
  personality_traits: string[];
  ai_response: any;
  overall_confidence: number;
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

const confidenceLabel = (score: number) =>
  score >= 80 ? "High" : score >= 60 ? "Moderate" : "Low";

const demandColor = (d: string) => {
  const lower = d?.toLowerCase() || "";
  if (lower.startsWith("high")) return "bg-emerald-500/10 text-emerald-600";
  if (lower.startsWith("growing")) return "bg-blue-500/10 text-blue-600";
  return "bg-secondary text-secondary-foreground";
};

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const result = await getRecommendationHistory();
      setHistory(result.data as HistoryEntry[]);
      setLoading(false);
    })();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-ZA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRecommendations = (entry: HistoryEntry) => {
    try {
      return entry.ai_response?.data?.recommendations || [];
    } catch {
      return [];
    }
  };

  const getSummary = (entry: HistoryEntry) => {
    try {
      return entry.ai_response?.data?.insights?.summary || "";
    } catch {
      return "";
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleting(id);
    const result = await deleteRecommendationHistory(id);
    if (!result.error) {
      setHistory(prev => prev.filter(entry => entry.id !== id));
      if (expandedId === id) setExpandedId(null);
    }
    setDeleting(null);
    setConfirmDelete(null);
  };

  const handleDownload = (e: React.MouseEvent, entry: HistoryEntry) => {
    e.stopPropagation();
    try {
      const recommendations = getRecommendations(entry) || [];
      const summary = getSummary(entry) || "";
      
      generateRecommendationReport({
        summary,
        overallConfidence: entry.overall_confidence || 0,
        subjects: entry.academic_results || [],
        skills: entry.skills || [],
        interests: entry.interests || [],
        personalityTraits: entry.personality_traits || [],
        recommendations,
      });
    } catch (error) {
      console.error("Failed to generate PDF report:", error);
      alert("There was a problem generating the PDF report. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingIndicator message="Loading your recommendation history..." />
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
            <ArrowLeft className="h-4 w-4" /> Back to Assessment
          </Link>

          <h1 className="text-2xl font-bold mb-2">Recommendation History</h1>
          <p className="text-muted-foreground">
            Review your past career assessments and AI recommendations.
          </p>
        </div>

        {/* Empty State */}
        {history.length === 0 && (
          <div className="bg-card rounded-xl p-12 card-shadow text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No assessments yet</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Complete your first career assessment to see your recommendation history here.
            </p>
            <Link
              href="/me"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Start Assessment
            </Link>
          </div>
        )}

        {/* History List */}
        <div className="space-y-6">
          {history.map((entry, index) => {
            const recommendations = getRecommendations(entry);
            const summary = getSummary(entry);
            const isExpanded = expandedId === entry.id;

            return (
              <div
                key={entry.id}
                className="bg-card rounded-xl card-shadow overflow-hidden animate-fade-up transition-all duration-300"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Session Header */}
                <div
                  className="w-full relative"
                >
                  {/* Delete Confirmation Overlay */}
                  {confirmDelete === entry.id && (
                    <div className="absolute inset-0 bg-card/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-6 border-b">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                        <p className="font-medium text-sm">Delete this history entry?</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => handleDelete(e, entry.id)}
                          disabled={deleting === entry.id}
                          className="px-4 py-1.5 text-sm font-medium rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                        >
                          {deleting === entry.id ? "Deleting..." : "Delete"}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDelete(null);
                          }}
                          className="px-4 py-1.5 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                    className="w-full p-6 text-left hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {formatDate(entry.created_at)}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {recommendations.length} career{recommendations.length !== 1 ? "s" : ""} matched
                        </Badge>
                      </div>

                      {/* Quick Stats */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          {entry.academic_results?.length || 0} subjects
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          {entry.skills?.length || 0} skills
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-3 w-3" />
                          {entry.interests?.length || 0} interests
                        </span>
                      </div>

                      {/* Top Careers Preview (collapsed) */}
                      {!isExpanded && recommendations.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {recommendations.slice(0, 3).map((rec: any, i: number) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {rec.career}
                            </Badge>
                          ))}
                          {recommendations.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{recommendations.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions, Confidence Circle + Expand */}
                    <div className="flex items-center gap-4 shrink-0">
                      {/* Action buttons (desktop/tablet) */}
                      <div className="hidden sm:flex items-center gap-1 border-r pr-4 mr-2">
                        <button
                          onClick={(e) => handleDownload(e, entry)}
                          className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                          title="Download Report"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDelete(entry.id);
                          }}
                          className="p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                          title="Delete History"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-full border-2 ${confidenceRing(entry.overall_confidence)} bg-gradient-to-br ${confidenceBg(entry.overall_confidence)}`}>
                        <span className={`text-lg font-bold leading-none ${confidenceColor(entry.overall_confidence)}`}>
                          {entry.overall_confidence}%
                        </span>
                        <span className="text-[9px] text-muted-foreground mt-0.5 font-medium">
                          Confidence
                        </span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  </div>
                
                {/* Action buttons (mobile) */}
                <div className="flex sm:hidden items-center justify-between px-6 pb-4 border-b border-border/40">
                   <button
                    onClick={(e) => handleDownload(e, entry)}
                    className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Download className="h-3 w-3" />
                    Download
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmDelete(entry.id);
                    }}
                    className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </button>
                </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t px-6 pb-6">
                    {/* Summary */}
                    {summary && (
                      <div className="pt-4 pb-4">
                        <h4 className="text-sm font-semibold mb-1.5">AI Summary</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{summary}</p>
                      </div>
                    )}

                    {/* Input Data */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 border-t">
                      <div>
                        <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                          Subjects
                        </h5>
                        <div className="flex flex-wrap gap-1.5">
                          {entry.academic_results?.map((subj: any, i: number) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {subj.name || subj.module_name} ({subj.percentage}%)
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                          Skills
                        </h5>
                        <div className="flex flex-wrap gap-1.5">
                          {entry.skills?.map((skill: string, i: number) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                          Interests & Traits
                        </h5>
                        <div className="flex flex-wrap gap-1.5">
                          {entry.interests?.map((interest: string, i: number) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {interest}
                            </Badge>
                          ))}
                          {entry.personality_traits?.map((trait: string, i: number) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {trait}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Career Recommendations */}
                    {recommendations.length > 0 && (
                      <div className="pt-4 border-t">
                        <h4 className="text-sm font-semibold mb-3">Career Recommendations</h4>
                        <div className="space-y-3">
                          {recommendations.map((rec: any, i: number) => {
                            const score = rec.matchScore ?? rec.confidence ?? 0;
                            return (
                              <div
                                key={i}
                                className="bg-muted/30 rounded-lg p-4 border border-border/50"
                              >
                                <div className="flex items-start justify-between gap-3 mb-2">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                      <h5 className="font-semibold text-sm">{rec.career}</h5>
                                      {rec.jobDemand && (
                                        <Badge className={`text-xs ${demandColor(rec.jobDemand)}`}>
                                          {rec.jobDemand.split(".")[0]} Demand
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                      {rec.reason}
                                    </p>
                                  </div>
                                  <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-full border-2 ${confidenceRing(score)} bg-gradient-to-br ${confidenceBg(score)} shrink-0`}>
                                    <span className={`text-sm font-bold leading-none ${confidenceColor(score)}`}>
                                      {score}%
                                    </span>
                                    <span className="text-[8px] text-muted-foreground mt-0.5">
                                      Conf.
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3 mb-2">
                                  <Progress value={score} className="h-1.5 flex-1" />
                                  <span className={`text-xs font-medium ${confidenceColor(score)}`}>
                                    {confidenceLabel(score)}
                                  </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                                  {rec.salaryRange && (
                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                      <DollarSign className="h-3 w-3 shrink-0" />
                                      <span className="truncate">{rec.salaryRange}</span>
                                    </div>
                                  )}
                                  {rec.pathway && (
                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                      <TrendingUp className="h-3 w-3 shrink-0" />
                                      <span className="truncate">{rec.pathway}</span>
                                    </div>
                                  )}
                                  {rec.requiredQualifications && (
                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                      <GraduationCap className="h-3 w-3 shrink-0" />
                                      <span className="truncate">{rec.requiredQualifications}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
