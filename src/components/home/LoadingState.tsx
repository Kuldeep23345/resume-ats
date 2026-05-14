"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle,
  Clock3,
  FileText,
  SearchCheck,
  Sparkles,
  Target,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface LoadingStateProps {
  phase?: "extracting" | "analyzing";
}

export function LoadingState({ phase = "analyzing" }: LoadingStateProps) {
  const [progress, setProgress] = useState(6);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
      setProgress((prev) => Math.min(prev + 2.5, 95));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  const steps = [
    { icon: FileText, text: "Text extraction" },
    { icon: SearchCheck, text: "ATS structure scan" },
    { icon: Target, text: "Keyword and role fit" },
    { icon: Sparkles, text: "Recommendations" },
  ];

  const extractingOffset = phase === "extracting" ? 0 : 1;
  const currentStep = Math.min(
    Math.floor(elapsedTime / 3) + extractingOffset,
    steps.length - 1,
  );

  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <section className="w-full">
      <Card className="mx-auto w-full max-w-4xl border-black/10 bg-white/[0.92] py-0 shadow-[0_26px_90px_rgba(23,26,23,0.14)] backdrop-blur">
        <CardContent className="px-0">
          <div className="grid gap-0 xl:grid-cols-[280px_1fr]">
            <div className="flex items-center justify-center border-b border-black/10 bg-[linear-gradient(145deg,var(--premium-panel)_0%,var(--premium-panel-soft)_52%,var(--premium-aubergine)_100%)] p-6 text-white sm:p-8 xl:border-b-0 xl:border-r">
              <div className="relative">
                <svg className="size-32 -rotate-90 sm:size-40" viewBox="0 0 160 160">
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="10"
                    className="text-white/10"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="none"
                    stroke="url(#analysis-progress)"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-1000 ease-linear"
                  />
                  <defs>
                    <linearGradient
                      id="analysis-progress"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                  >
                      <stop offset="0%" stopColor="#0f766e" />
                      <stop offset="55%" stopColor="#b99449" />
                      <stop offset="100%" stopColor="#d8c28a" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-semibold sm:text-4xl">
                    {Math.round(progress)}%
                  </span>
                  <span className="mt-1 text-xs font-medium text-white/60">
                    Processing
                  </span>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-7">
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-lg border border-[#d9c38b] bg-[#fbf5e6] px-3 py-1 text-xs font-medium text-[#6f5520]">
                    <Sparkles className="size-3.5" />
                    {phase === "extracting" ? "Reading resume" : "AI review"}
                  </div>
                  <h2 className="text-2xl font-semibold text-[var(--premium-ink)]">
                    {phase === "extracting"
                      ? "Extracting resume text"
                      : "Building your ATS report"}
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                    The report is being assembled with score, keyword coverage,
                    strengths, weak points, and edits.
                  </p>
                </div>

                <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm font-medium text-[var(--premium-ink)] shadow-sm">
                  <Clock3 className="size-4 text-[var(--premium-teal)]" />
                  {formatTime(elapsedTime)}
                </div>
              </div>

              <div className="mb-6 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,var(--premium-teal),var(--premium-gold),#d8c28a)] transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="grid gap-3">
                {steps.map((step, index) => {
                  const isDone = index < currentStep;
                  const isActive = index === currentStep;

                  return (
                    <div
                      key={step.text}
                      className={[
                        "flex items-center gap-3 rounded-lg border p-3 transition-colors",
                        isActive
                          ? "border-primary/30 bg-primary/10"
                          : isDone
                            ? "border-[#d9c38b] bg-[#fbf5e6]"
                            : "border-black/10 bg-white",
                      ].join(" ")}
                    >
                      <div
                        className={[
                          "flex size-9 shrink-0 items-center justify-center rounded-lg",
                          isDone
                            ? "bg-[var(--premium-teal)] text-white"
                            : isActive
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground",
                        ].join(" ")}
                      >
                        {isDone ? (
                          <CheckCircle className="size-4" />
                        ) : (
                          <step.icon className="size-4" />
                        )}
                      </div>
                      <span
                        className={[
                          "text-sm font-medium",
                          isActive || isDone
                            ? "text-[var(--premium-ink)]"
                            : "text-muted-foreground",
                        ].join(" ")}
                      >
                        {step.text}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
