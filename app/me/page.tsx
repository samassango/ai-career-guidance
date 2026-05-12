"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  ArrowRight,
  History,
  Heart,
  Download,
  Shield,
  Sparkles,
  BarChart3,
  BookOpen,
  TrendingUp,
  Clock,
} from "lucide-react";
import { getRecommendationHistory } from "@/app/actions/historyActions";
import { getSavedCareers } from "@/app/actions/savedCareerActions";

export default function DashboardPage() {
  const [historyCount, setHistoryCount] = useState<number | null>(null);
  const [savedCount, setSavedCount] = useState<number | null>(null);
  const [lastAssessment, setLastAssessment] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [historyResult, savedResult] = await Promise.all([
        getRecommendationHistory(),
        getSavedCareers(),
      ]);

      const history = historyResult.data || [];
      setHistoryCount(history.length);
      setSavedCount((savedResult.data || []).length);

      if (history.length > 0) {
        setLastAssessment(history[0]);
      }

      setLoading(false);
    })();
  }, []);

  const topCareers = lastAssessment
    ? (lastAssessment.ai_response?.data?.recommendations || []).slice(0, 3)
    : [];

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-ZA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="min-h-[75vh]">
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Welcome back!</h1>
            <p className="text-sm text-muted-foreground">
              Your AI-powered career guidance dashboard
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {/* Start Assessment CTA */}
        <Link
          href="/me/assessment"
          className="group relative bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-xl p-6 card-shadow hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 sm:col-span-2 lg:col-span-1"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <GraduationCap className="h-8 w-8 mb-3" />
            <h3 className="text-lg font-bold mb-1">Start Assessment</h3>
            <p className="text-sm opacity-80 mb-4">
              Upload your academic results and discover your ideal career path.
            </p>
            <div className="flex items-center gap-1 text-sm font-medium">
              Get Started <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>

        {/* History Card */}
        <Link
          href="/me/history"
          className="bg-card rounded-xl p-6 card-shadow hover:card-shadow-hover transition-all duration-300 hover:-translate-y-0.5 group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <History className="h-5 w-5 text-blue-500" />
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <h3 className="font-semibold mb-0.5">Assessment History</h3>
          <p className="text-sm text-muted-foreground">
            {loading ? (
              <span className="inline-block w-16 h-4 bg-muted animate-pulse rounded" />
            ) : historyCount === 0 ? (
              "No assessments yet"
            ) : (
              <>{historyCount} past assessment{historyCount !== 1 ? "s" : ""}</>
            )}
          </p>
        </Link>

        {/* Saved Careers Card */}
        <Link
          href="/me/saved"
          className="bg-card rounded-xl p-6 card-shadow hover:card-shadow-hover transition-all duration-300 hover:-translate-y-0.5 group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-lg bg-rose-500/10 flex items-center justify-center">
              <Heart className="h-5 w-5 text-rose-500" />
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <h3 className="font-semibold mb-0.5">Saved Careers</h3>
          <p className="text-sm text-muted-foreground">
            {loading ? (
              <span className="inline-block w-16 h-4 bg-muted animate-pulse rounded" />
            ) : savedCount === 0 ? (
              "No saved careers"
            ) : (
              <>{savedCount} saved career{savedCount !== 1 ? "s" : ""}</>
            )}
          </p>
        </Link>
      </div>

      {/* Latest Assessment Summary */}
      {!loading && lastAssessment && (
        <div className="bg-card rounded-xl p-6 card-shadow mb-8">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <h3 className="font-semibold">Latest Assessment</h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDate(lastAssessment.created_at)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {lastAssessment.overall_confidence > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  <Shield className="h-3.5 w-3.5" />
                  {lastAssessment.overall_confidence}% Confidence
                </div>
              )}
              <Link
                href="/me/history"
                className="text-sm text-primary hover:underline font-medium"
              >
                View All
              </Link>
            </div>
          </div>

          {/* Top Career Recommendations */}
          {topCareers.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-3">
              {topCareers.map((career: any, i: number) => {
                const score = career.matchScore ?? career.confidence ?? 0;
                const scoreColor =
                  score >= 80 ? "text-emerald-500" :
                  score >= 60 ? "text-amber-500" :
                  "text-red-400";
                const scoreBg =
                  score >= 80 ? "bg-emerald-500/10" :
                  score >= 60 ? "bg-amber-500/10" :
                  "bg-red-400/10";

                return (
                  <div
                    key={i}
                    className="bg-muted/40 rounded-lg p-4 border border-border/50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground font-medium">
                        #{i + 1} Match
                      </span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${scoreBg} ${scoreColor}`}>
                        {score}%
                      </span>
                    </div>
                    <h4 className="font-semibold text-sm mb-1 line-clamp-1">{career.career}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">{career.reason}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Features / What You Can Do */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-4">Explore</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: BookOpen,
              title: "Academic Analysis",
              desc: "Upload your results for AI analysis",
              href: "/me/assessment",
              color: "bg-blue-500/10 text-blue-500",
            },
            {
              icon: TrendingUp,
              title: "Career Insights",
              desc: "View salary & demand data",
              href: "/me/history",
              color: "bg-emerald-500/10 text-emerald-500",
            },
            {
              icon: Download,
              title: "Download Reports",
              desc: "Get PDF career reports",
              href: "/me/assessment",
              color: "bg-violet-500/10 text-violet-500",
            },
            {
              icon: Shield,
              title: "Privacy & POPIA",
              desc: "How we protect your data",
              href: "/privacy",
              color: "bg-amber-500/10 text-amber-500",
            },
          ].map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="flex items-start gap-3 bg-card rounded-lg p-4 border border-border/50 hover:border-border hover:bg-muted/30 transition-all group"
            >
              <div className={`h-9 w-9 rounded-lg ${item.color} flex items-center justify-center shrink-0`}>
                <item.icon className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-medium group-hover:text-primary transition-colors">
                  {item.title}
                </h4>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}