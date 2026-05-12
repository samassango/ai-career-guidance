"use client";

import { Button } from "@/components/app-components/ui/button";
import { Badge } from "@/components/app-components/ui/badge";
import { Progress } from "@/components/app-components/ui/progress";
import {
  ArrowLeft,
  TrendingUp,
  DollarSign,
  GraduationCap,
  Briefcase,
  Star,
  BarChart3,
  BookOpen,
  RefreshCw,
  Shield,
  Download,
  AlertCircle,
  Loader2,
} from "lucide-react";
import type { AssessmentData } from "./AssessmentFlow";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import { useEffect, useRef, useState } from "react";
import { getRecommendations } from "@/app/actions/actions";
import { addRecommendations, clearRecommendations } from "@/lib/store/slices/recommendationSlice";
import { clearAccademicRecord } from "@/lib/store/slices/academicSlice";
import { clearAssessment } from "@/lib/store/slices/assessmentSlice";
import LoadingIndicator from "../ui/loadingIndicator";
import { saveRecommendationHistory } from "@/app/actions/historyActions";
import FeedbackCard from "./FeedbackCard";
import SaveCareerButton from "./SaveCareerButton";
import { getSavedCareerNames } from "@/app/actions/savedCareerActions";
import { generateRecommendationReport } from "@/lib/generateReport";

interface CareerRecommendation {
  title: string;
  matchScore: number;
  description: string;
  salaryRange: string;
  demand: "High" | "Medium" | "Growing";
  demandTrend: string;
  education: string[];
  keySkills: string[];
  category: string;
}

interface ResultsDashboardProps {
  assessmentData: AssessmentData;
  onBack: () => void;
  onRetake: () => void;
}


const demandColor = (d: string) => {
  switch (d) {
    case "High": return "bg-success/10 text-success";
    case "Growing": return "bg-accent/20 text-accent-foreground";
    default: return "bg-secondary text-secondary-foreground";
  }
};

const ResultsDashboard = ({ assessmentData, onBack, onRetake }: ResultsDashboardProps) => {
  const [recommendationsObject, setRecommendationsObject] = useState<any[]>([]);
  const [summary, setSummary] = useState<string>();
  const [overallConfidence, setOverallConfidence] = useState<number>(0);
  const [savedHistoryId, setSavedHistoryId] = useState<string | null>(null);
  const [savedCareerNames, setSavedCareerNames] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const hasSaved = useRef(false);

  const dispatch = useDispatch()
  const assessment = useSelector((state: RootState) => state.assessment);
  const recommendationsNew = useSelector((state: RootState) => state.recommendations);
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const reccomendationData = await loadRecommendations(assessmentData);
      } catch (err) {
        // Error is handled inside loadRecommendations
      } finally {
        setIsLoading(false);
      }
    })();
  }, [retryCount])

  // Load saved career names on mount
  useEffect(() => {
    getSavedCareerNames().then((result) => {
      if (result.data) {
        setSavedCareerNames(result.data as string[]);
      }
    });
  }, []);

  useEffect(() => {
    if (recommendationsNew.recommendations && recommendationsNew.recommendations.data ) {
      const { data: {
        insights: { summary },
        recommendations
      } } = recommendationsNew.recommendations
      if (Array.isArray(recommendations)) {
        setRecommendationsObject(recommendations);
        // Compute overall confidence as the average of all matchScores
        const scores = recommendations
          .map((r: any) => r.matchScore ?? r.confidence)
          .filter((s: any) => typeof s === "number");
        if (scores.length > 0) {
          setOverallConfidence(Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length));
        }
      }
      if (summary) {
        setSummary(summary);
      }
    }

  }, [recommendationsNew])

  // Auto-save to Supabase once recommendations are ready
  useEffect(() => {
    if (recommendationsObject.length > 0 && overallConfidence > 0 && !hasSaved.current) {
      hasSaved.current = true;
      saveRecommendationHistory({
        academicResults: assessmentData.subjects,
        skills: assessmentData.skills,
        interests: assessmentData.interests,
        personalityTraits: assessmentData.personalityTraits,
        aiResponse: recommendationsNew.recommendations,
        overallConfidence,
      }).then((result) => {
        if (result.error) {
          console.error("Failed to save recommendation history:", result.error);
          hasSaved.current = false; // Allow retry
        } else {
          console.log("Recommendation history saved successfully");
          if (result.data?.id) {
            setSavedHistoryId(result.data.id);
          }
        }
      });
    }
  }, [recommendationsObject, overallConfidence]);

  const loadRecommendations = async (assessmentData: AssessmentData) => {
    try {
      const recommendations = await getRecommendations({
        subject: assessmentData.subjects,
        skills: assessmentData.skills,
        interests: assessmentData.interests,
        personality: assessmentData.personalityTraits
      });

      if (!recommendations || recommendations.error) {
        throw new Error(
          recommendations?.error || "The AI engine did not return valid recommendations."
        );
      }

      if (!recommendations.data?.recommendations || recommendations.data.recommendations.length === 0) {
        throw new Error(
          "No career recommendations could be generated from your profile. Please try adjusting your skills or interests."
        );
      }

      dispatch(addRecommendations(recommendations));
      return recommendations;
    } catch (err: unknown) {
      console.error("Recommendation error:", err);
      const message =
        err instanceof Error
          ? err.message.includes("fetch")
            ? "Unable to reach the career guidance service. Please check your connection and try again."
            : err.message
          : "We could not generate recommendations right now. Please try again.";
      setError(message);
      throw err;
    }
  }

  const handleRetry = () => {
    setError(null);
    setRetryCount((c) => c + 1);
  };

  const onRetakeAssessment = () => {
    dispatch(clearAccademicRecord())
    dispatch(clearAssessment())
    dispatch(clearRecommendations())
    window.location.reload();
  }

  const handleDownloadReport = () => {
    generateRecommendationReport({
      summary,
      overallConfidence,
      subjects: assessmentData.subjects,
      skills: assessmentData.skills,
      interests: assessmentData.interests,
      personalityTraits: assessmentData.personalityTraits,
      recommendations: recommendationsObject,
    });
  };

  console.log({ assessment, recommendationsNew })
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </button>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">Your Career Recommendations</h1>
              <p className="text-muted-foreground">
                Based on your academic profile, skills, interests, and personality traits.
              </p>
            </div>
            {!isLoading && !error && (
              <div className="flex items-center gap-2">
                {recommendationsObject.length > 0 && (
                  <Button variant="outline" onClick={handleDownloadReport}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Report
                  </Button>
                )}
                <Button variant="outline" onClick={onRetakeAssessment}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retake Assessment
                </Button>
              </div>
            )}
          </div>
        </div>
         {/* Loading State */}
         {isLoading && !error && (
           <div className="flex items-center justify-center py-16">
             <div className="bg-card rounded-xl p-10 card-shadow max-w-md w-full text-center">
               <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                 <Loader2 className="h-8 w-8 text-primary animate-spin" />
               </div>
               <h3 className="text-lg font-semibold mb-2">Generating your career recommendations...</h3>
               <p className="text-sm text-muted-foreground mb-6">
                 Our AI is analyzing your academic profile, skills, interests, and personality traits to find your best career matches.
               </p>
               <div className="space-y-2 text-left max-w-xs mx-auto">
                 {[
                   "Analyzing academic profile",
                   "Matching skills & interests",
                   "Calculating career fit scores",
                   "Preparing recommendations",
                 ].map((step, i) => (
                   <div key={step} className="flex items-center gap-2 text-xs text-muted-foreground animate-fade-up" style={{ animationDelay: `${i * 0.3}s` }}>
                     <div className="h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
                     {step}
                   </div>
                 ))}
               </div>
             </div>
           </div>
         )}

         {/* Error State */}
         {error && (
           <div className="flex items-center justify-center py-16">
             <div className="bg-card rounded-xl p-10 card-shadow border border-red-200 dark:border-red-900/30 max-w-md w-full text-center">
               <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-5">
                 <AlertCircle className="h-8 w-8 text-red-500" />
               </div>
               <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
               <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">{error}</p>
               <div className="flex items-center justify-center gap-3">
                 <button
                   onClick={handleRetry}
                   className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                 >
                   <RefreshCw className="h-4 w-4" />
                   Try Again
                 </button>
                 <Button variant="outline" onClick={onRetakeAssessment}>
                   Retake Assessment
                 </Button>
               </div>
               {retryCount > 0 && (
                 <p className="text-xs text-muted-foreground mt-4">
                   Attempt {retryCount + 1} — If the issue persists, try retaking the assessment.
                 </p>
               )}
             </div>
           </div>
         )}

         {/* Summary */}
         {!isLoading && !error && summary && (
           <div className="flex items-center justify-between flex-wrap gap-4 mb-2">
             <div>
               <h1 className="text-2xl font-bold mb-2">Summary</h1>
               <p className="text-muted-foreground text-sm">{summary}</p>
             </div>
           </div>
         )}

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: "Subjects", value: assessment.subjects.length, icon: BookOpen },
            { label: "Skills", value: assessment.skills.length, icon: Star },
            { label: "Interests", value: assessment.interests.length, icon: Briefcase },
            { label: "Matches Found", value: recommendationsObject.length, icon: BarChart3 },
          ].map((stat) => (
            <div key={stat.label} className="bg-card rounded-xl p-4 card-shadow text-center">
              <stat.icon className="h-5 w-5 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
          {/* Overall Confidence Score Card */}
          <div className="bg-card rounded-xl p-4 card-shadow text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10" />
            <div className="relative">
              <Shield className="h-5 w-5 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-primary">{overallConfidence}%</div>
              <div className="text-xs text-muted-foreground">Overall Confidence</div>
              <Progress value={overallConfidence} className="h-1.5 mt-2" />
            </div>
          </div>
        </div>

        {/* Recommendations */}

        <div className="space-y-6">
          {recommendationsObject && recommendationsObject.map((rec, i) => {
            const confidenceScore = rec.matchScore ?? rec.confidence ?? 0;
            const confidenceColor =
              confidenceScore >= 80 ? "text-emerald-500" :
              confidenceScore >= 60 ? "text-amber-500" :
              "text-red-400";
            const confidenceBg =
              confidenceScore >= 80 ? "from-emerald-500/10 to-emerald-500/5" :
              confidenceScore >= 60 ? "from-amber-500/10 to-amber-500/5" :
              "from-red-400/10 to-red-400/5";
            const ringColor =
              confidenceScore >= 80 ? "border-emerald-500/30" :
              confidenceScore >= 60 ? "border-amber-500/30" :
              "border-red-400/30";
            return (
            <div
              key={rec.career}
              className="bg-card rounded-xl p-6 card-shadow hover:card-shadow-hover transition-all duration-300 animate-fade-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <h3 className="text-xl font-bold">{rec.career}</h3>
                    <Badge className={demandColor(rec.jobDemand)}>{rec.jobDemand} Demand</Badge>
                  </div>
                  <p className="text-muted-foreground text-sm">{rec.reason}</p>
                </div>
                {/* Confidence Score Badge */}
                <div className={`flex flex-col items-center justify-center w-20 h-20 rounded-full border-2 ${ringColor} bg-gradient-to-br ${confidenceBg} shrink-0`}>
                  <span className={`text-xl font-bold leading-none ${confidenceColor}`}>{confidenceScore}%</span>
                  <span className="text-[10px] text-muted-foreground mt-0.5 font-medium">Confidence</span>
                </div>
              </div>

              {/* Confidence progress bar */}
              <div className="flex items-center gap-3 mb-4">
                <Progress value={confidenceScore} className="h-2 flex-1" />
                <span className={`text-xs font-semibold ${confidenceColor} whitespace-nowrap`}>
                  {confidenceScore >= 80 ? "High" : confidenceScore >= 60 ? "Moderate" : "Low"} confidence
                </span>
              </div>

              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-start gap-2">
                  <DollarSign className="h-4 w-4 text-success mt-0.5 shrink-0" />
                  <div>
                    <div className="font-medium">Salary Range</div>
                    <div className="text-muted-foreground">{rec.salaryRange}</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <div className="font-medium">Pathway</div>
                    <div className="text-muted-foreground">{rec.pathway}</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <GraduationCap className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                  <div>
                    <div className="font-medium">Education Paths</div>
                    <div className="text-muted-foreground">{rec.requiredQualifications}</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between flex-wrap gap-2">
                <div className="flex flex-wrap gap-2">
                  {rec.matchedData.map((s: any) => (
                    <Badge key={s} variant="secondary" className="text-xs">
                      {s}
                    </Badge>
                  ))}
                </div>
                <SaveCareerButton
                  careerName={rec.career}
                  pathway={rec.pathway}
                  salaryRange={rec.salaryRange}
                  demand={rec.jobDemand}
                  educationPaths={rec.requiredQualifications}
                  reason={rec.reason}
                  confidenceScore={confidenceScore}
                  initialSaved={savedCareerNames.includes(rec.career)}
                />
              </div>

              {/* Feedback */}
              <FeedbackCard historyId={savedHistoryId} careerName={rec.career} />
            </div>
          )})
          }
        </div>

      </div>
    </div>
  );
};

export default ResultsDashboard;
