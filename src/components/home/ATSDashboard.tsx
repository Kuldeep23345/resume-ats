"use client";

import { CheckCircle, XCircle, AlertCircle, TrendingUp, Lightbulb, Target, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CircularProgress } from "@/components/ui/circular-progress";
import type { ResumeAnalysis } from "@/types";

interface ATSDashboardProps {
  analysis: ResumeAnalysis;
}

export function ATSDashboard({ analysis }: ATSDashboardProps) {
  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-emerald-50 dark:bg-emerald-950/20";
    if (score >= 60) return "bg-amber-50 dark:bg-amber-950/20";
    return "bg-red-50 dark:bg-red-950/20";
  };

  const getScoreProgressColor = (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-amber-500";
    return "bg-red-500";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Average";
    return "Needs Improvement";
  };

  return (
    <div className="space-y-6 w-full">
      <div className="grid gap-6 md:grid-cols-2">
        <Card className={`${getScoreBg(analysis.score)} border-2`}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Target className="h-5 w-5" />
              ATS Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <CircularProgress
                value={analysis.score}
                size={140}
                strokeWidth={12}
                progressColor={getScoreProgressColor(analysis.score)}
                label={getScoreLabel(analysis.score)}
              />
              <div className="text-right ml-4">
                <p className="text-2xl font-bold">{analysis.role}</p>
                <p className="text-sm text-muted-foreground">{analysis.level}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Zap className="h-5 w-5 text-amber-500" />
              Tech Stack
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {analysis.techStack.map((tech, index) => (
                <Badge 
                  key={index} 
                  variant="secondary"
                  className="px-3 py-1 text-sm font-medium"
                >
                  {tech}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-emerald-700 dark:text-emerald-400">
              <CheckCircle className="h-5 w-5" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {analysis.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0" />
                  <span className="text-sm leading-relaxed text-emerald-900 dark:text-emerald-100">
                    {strength}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-red-700 dark:text-red-400">
              <XCircle className="h-5 w-5" />
              Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {analysis.weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-red-500 flex-shrink-0" />
                  <span className="text-sm leading-relaxed text-red-900 dark:text-red-100">
                    {weakness}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-orange-50/50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-orange-700 dark:text-orange-400">
            <AlertCircle className="h-5 w-5" />
            Missing Keywords
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            These keywords are commonly requested but missing from your resume:
          </p>
          <div className="flex flex-wrap gap-2">
            {analysis.missingKeywords.map((keyword, index) => (
              <Badge 
                key={index} 
                variant="outline"
                className="px-3 py-1 text-sm font-medium border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-400"
              >
                {keyword}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-blue-700 dark:text-blue-400">
            <TrendingUp className="h-5 w-5" />
            Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {analysis.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white flex-shrink-0">
                  {index + 1}
                </span>
                <span className="text-sm leading-relaxed text-blue-900 dark:text-blue-100">
                  {suggestion}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/20 dark:to-indigo-950/20 border-violet-200 dark:border-violet-800">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-violet-700 dark:text-violet-400">
            <Lightbulb className="h-5 w-5" />
            Career Advice
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-violet-900 dark:text-violet-100">
            {analysis.advice}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
