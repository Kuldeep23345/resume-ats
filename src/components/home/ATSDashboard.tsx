"use client";

import {
  AlertCircle,
  BadgeCheck,
  CheckCircle,
  Gauge,
  Layers3,
  Lightbulb,
  Target,
  TrendingUp,
  XCircle,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CircularProgress } from "@/components/ui/circular-progress";
import type { ResumeAnalysis } from "@/types";

interface ATSDashboardProps {
  analysis: ResumeAnalysis;
}

interface InsightListProps {
  title: string;
  icon: LucideIcon;
  items: string[];
  tone: {
    card: string;
    title: string;
    marker: string;
    text: string;
  };
}

function getScoreTone(score: number) {
  if (score >= 80) {
    return {
      label: "Excellent",
      card: "border-[#9dcfc5] bg-[#eaf5f1]/90",
      progress: "text-[var(--premium-teal)]",
      text: "text-[#0f766e]",
      fill: "bg-[var(--premium-teal)]",
    };
  }

  if (score >= 60) {
    return {
      label: "Good",
      card: "border-[#d9c38b] bg-[#fbf5e6]/90",
      progress: "text-[var(--premium-gold)]",
      text: "text-[#6f5520]",
      fill: "bg-[var(--premium-gold)]",
    };
  }

  return {
    label: "Needs work",
    card: "border-red-200 bg-red-50/80",
    progress: "text-red-500",
    text: "text-red-700",
    fill: "bg-red-500",
  };
}

function InsightList({ title, icon: Icon, items, tone }: InsightListProps) {
  const visibleItems = items.length ? items : ["No items returned."];

  return (
    <Card className={`${tone.card} py-0 shadow-sm`}>
      <CardHeader className="border-b border-black/10 p-4">
        <CardTitle
          className={`flex items-center gap-2 text-base ${tone.title}`}
        >
          <Icon className="size-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <ul className="space-y-3">
          {visibleItems.map((item, index) => (
            <li key={index} className="flex items-start gap-3">
              <span
                className={`mt-1.5 size-2 shrink-0 rounded-full ${tone.marker}`}
              />
              <span className={`text-sm leading-6 ${tone.text}`}>{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export function ATSDashboard({ analysis }: ATSDashboardProps) {
  const scoreTone = getScoreTone(analysis.score);
  const normalizedScore = Math.min(Math.max(analysis.score, 0), 100);
  const scoreBands = [
    { label: "Weak", width: "40%", className: "bg-red-400" },
    { label: "Good", width: "30%", className: "bg-[var(--premium-gold)]" },
    { label: "Strong", width: "30%", className: "bg-[var(--premium-teal)]" },
  ];
  const scoreSignals = [
    {
      label: "Strengths",
      value: analysis.strengths.length,
      icon: CheckCircle,
      className: "bg-white/70 text-[#0f5f59]",
    },
    {
      label: "Keyword gaps",
      value: analysis.missingKeywords.length,
      icon: AlertCircle,
      className: "bg-white/70 text-[#6f5520]",
    },
    {
      label: "Skills found",
      value: analysis.techStack.length,
      icon: Layers3,
      className: "bg-white/70 text-[var(--premium-ink)]",
    },
  ];
  const scoreSummary =
    analysis.score >= 80
      ? "Strong foundation. Keep the role keywords and measurable impact visible."
      : analysis.score >= 60
        ? "Good base. Add missing keywords and sharper metrics to move into the strong band."
        : "Needs focused edits. Start with keywords, structure, and quantified achievements.";

  return (
    <div className="w-full space-y-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(260px,0.9fr)_minmax(0,1.1fr)]">
        <Card className={`${scoreTone.card} py-0 shadow-sm`}>
          <CardContent className="p-4 sm:p-5">
            <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:justify-between sm:text-left xl:flex-col xl:items-start 2xl:flex-row 2xl:items-center">
              <CircularProgress
                value={analysis.score}
                size={148}
                strokeWidth={12}
                progressColor={scoreTone.progress}
                label={scoreTone.label}
                className="mx-auto sm:mx-0"
              />
              <div className="min-w-0 space-y-3">
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    ATS score
                  </p>
                  <h2 className="mt-1 text-3xl font-semibold text-[var(--premium-ink)]">
                    {analysis.score}/100
                  </h2>
                  <p className={`text-sm font-medium ${scoreTone.text}`}>
                    {scoreTone.label}
                  </p>
                </div>
                <div className="flex h-2 overflow-hidden rounded-full bg-white/80 ring-1 ring-black/10">
                  {scoreBands.map((band) => (
                    <div
                      key={band.label}
                      className={band.className}
                      style={{ width: band.width }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 border-t border-black/10 pt-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-[var(--premium-ink)]">
                  Score signals
                </p>
                <span className={`text-xs font-semibold ${scoreTone.text}`}>
                  {scoreTone.label} band
                </span>
              </div>

              <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
                {scoreSignals.map((signal) => (
                  <div
                    key={signal.label}
                    className={`rounded-lg border border-black/10 p-3 ${signal.className}`}
                  >
                    <signal.icon className="mb-3 size-4" />
                    <p className="text-2xl font-semibold leading-none">
                      {signal.value}
                    </p>
                    <p className="mt-1 text-xs font-medium text-muted-foreground">
                      {signal.label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-3 rounded-lg border border-black/10 bg-white/70 p-3">
                <div className="mb-2 flex items-center justify-between gap-3 text-xs font-medium text-muted-foreground">
                  <span>Current position</span>
                  <span>{normalizedScore}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-black/10">
                  <div
                    className={`h-full rounded-full ${scoreTone.fill}`}
                    style={{ width: `${normalizedScore}%` }}
                  />
                </div>
                <p className="mt-3 text-sm leading-5 text-[var(--premium-ink)]">
                  {scoreSummary}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-black/10 bg-white/[0.92] py-0 shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-start">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-lg border border-[#d9c38b] bg-[#fbf5e6] px-3 py-1 text-xs font-medium text-[#6f5520]">
                  <Target className="size-3.5" />
                  Role fit
                </div>
                <h2 className="text-2xl font-semibold leading-tight text-[var(--premium-ink)]">
                  {analysis.role}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {analysis.level}
                </p>
              </div>
              <div className="flex w-fit items-center gap-2 rounded-lg border border-black/10 bg-[linear-gradient(135deg,var(--premium-panel),var(--premium-aubergine))] px-3 py-2 text-sm font-medium text-white">
                <Gauge className="size-4 text-[#f1d58b]" />
                ATS ready
              </div>
            </div>

            <div className="mt-5 border-t border-black/10 pt-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--premium-ink)]">
                <Layers3 className="size-4 text-[var(--premium-teal)]" />
                Tech stack detected
              </div>
              <div className="flex flex-wrap gap-2">
                {analysis.techStack.length ? (
                  analysis.techStack.map((tech, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="h-auto min-h-7 max-w-full whitespace-normal rounded-lg border border-black/10 bg-white px-3 text-left text-sm text-[var(--premium-ink)]"
                    >
                      {tech}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">
                    No tech stack detected.
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <InsightList
          title="Strengths"
          icon={CheckCircle}
          items={analysis.strengths}
          tone={{
            card: "border-[#9dcfc5] bg-[#eaf5f1]/90",
            title: "text-[#0f5f59]",
            marker: "bg-[var(--premium-teal)]",
            text: "text-[#123c38]",
          }}
        />

        <InsightList
          title="Areas for improvement"
          icon={XCircle}
          items={analysis.weaknesses}
          tone={{
            card: "border-red-200 bg-red-50/80",
            title: "text-red-800",
            marker: "bg-red-500",
            text: "text-red-950",
          }}
        />
      </div>

      <Card className="border-[#d9c38b] bg-[#fbf5e6]/90 py-0 shadow-sm">
        <CardHeader className="border-b border-black/10 p-4">
          <CardTitle className="flex items-center gap-2 text-base text-[#6f5520]">
            <AlertCircle className="size-4" />
            Missing keywords
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="flex flex-wrap gap-2">
            {analysis.missingKeywords.length ? (
              analysis.missingKeywords.map((keyword, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="h-auto min-h-7 max-w-full whitespace-normal rounded-lg border-[#d9c38b] bg-white/80 px-3 text-left text-sm text-[#6f5520]"
                >
                  {keyword}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-[#6f5520]">
                No missing keywords returned.
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-[#9dcfc5] bg-[#eaf5f1]/90 py-0 shadow-sm">
        <CardHeader className="border-b border-black/10 p-4">
          <CardTitle className="flex items-center gap-2 text-base text-[#0f5f59]">
            <TrendingUp className="size-4" />
            Edit plan
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <ol className="space-y-3">
            {(analysis.suggestions.length
              ? analysis.suggestions
              : ["No suggestions returned."]
            ).map((suggestion, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[var(--premium-teal)] text-xs font-semibold text-white">
                  {index + 1}
                </span>
                <span className="pt-0.5 text-sm leading-6 text-[#123c38]">
                  {suggestion}
                </span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card className="border-black/10 bg-white/[0.92] py-0 shadow-sm">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-start">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-[linear-gradient(135deg,var(--premium-panel),var(--premium-aubergine))] text-white">
              <Lightbulb className="size-5" />
            </div>
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--premium-ink)]">
                <BadgeCheck className="size-4 text-[var(--premium-teal)]" />
                Career advice
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                {analysis.advice}
              </p>
            </div>
            <div className="ml-auto hidden rounded-lg border border-black/10 bg-[#fbf5e6] px-3 py-2 text-xs font-medium text-[var(--premium-ink)] md:flex md:items-center md:gap-2">
              <Zap className="size-3.5 text-[var(--premium-gold)]" />
              Actionable
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
