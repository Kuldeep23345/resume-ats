"use client";

import { useEffect, useState } from "react";
import { FileText, Sparkles, TrendingUp, Target, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface LoadingStateProps {
  phase?: "extracting" | "analyzing";
}

export function LoadingState({ phase = "analyzing" }: LoadingStateProps) {
  const [progress, setProgress] = useState(0);
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
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const steps = [
    { icon: FileText, text: "Extracting text from resume..." },
    { icon: Sparkles, text: "Analyzing resume content..." },
    { icon: TrendingUp, text: "Evaluating ATS compatibility..." },
    { icon: Target, text: "Generating insights..." },
  ];

  const extractingOffset = phase === "extracting" ? 0 : 1;
  const currentStep = Math.min(Math.floor(elapsedTime / 3) + extractingOffset, steps.length - 1);

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <Card className="w-full max-w-3xl overflow-hidden shadow-2xl border-2 border-zinc-900/20">
      <CardContent className="pt-8 pb-6">
        <div className="flex flex-col items-center justify-center space-y-6 py-8">
          <div className="relative">
            <svg className="h-40 w-40 -rotate-90">
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-zinc-200 dark:text-zinc-700"
              />
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke="url(#zincGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-linear"
              />
              <defs>
                <linearGradient id="zincGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#27272a" />
                  <stop offset="100%" stopColor="#18181b" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-zinc-800 dark:text-zinc-100">{Math.round(progress)}%</span>
              <span className="text-xs text-muted-foreground">Analyzing</span>
            </div>
          </div>
          
          <div className="text-center space-y-1">
            <h3 className="text-xl font-semibold">
              Analyzing Your Resume
            </h3>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4" />
              <span>Time: {formatTime(elapsedTime)}</span>
            </div>
          </div>

          <div className="w-full max-w-md space-y-2">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                  index === currentStep 
                    ? "bg-zinc-100 dark:bg-zinc-800 border border-zinc-800/30" 
                    : index < currentStep 
                      ? "bg-emerald-50 dark:bg-emerald-950/20"
                      : "bg-muted/50"
                }`}
              >
                {index < currentStep ? (
                  <div className="h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center">
                    <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : (
                  <step.icon className={`h-5 w-5 ${index === currentStep ? "text-zinc-800 animate-pulse" : "text-muted-foreground"}`} />
                )}
                <span className={`text-sm ${index <= currentStep ? "font-medium" : "text-muted-foreground"}`}>
                  {step.text}
                </span>
              </div>
            ))}
          </div>

          <div className="text-xs text-muted-foreground text-center bg-zinc-100 dark:bg-zinc-800 px-4 py-2 rounded-full">
            {elapsedTime < 15 
              ? "Please wait while we analyze your resume..." 
              : "Almost done! Processing your resume..."}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}