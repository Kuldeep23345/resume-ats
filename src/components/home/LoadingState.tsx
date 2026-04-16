"use client";

import { useEffect, useState } from "react";
import { Loader2, FileText, Sparkles, TrendingUp, Target, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function LoadingState() {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
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

  const currentStep = Math.min(Math.floor(elapsedTime / 3), steps.length - 1);

  return (
    <Card className="w-full max-w-3xl">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center space-y-6 py-12">
          <div className="relative">
            <Loader2 className="h-16 w-16 text-primary animate-spin" />
            <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-primary/20 animate-pulse" />
          </div>
          
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">Analyzing Your Resume</h3>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Time elapsed: {formatTime(elapsedTime)}</span>
            </div>
          </div>

          <div className="w-full max-w-md space-y-3">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                  index === currentStep 
                    ? "bg-primary/10 border border-primary/30" 
                    : index < currentStep 
                      ? "bg-emerald-50 dark:bg-emerald-950/20"
                      : "bg-muted/50"
                }`}
              >
                {index < currentStep ? (
                  <div className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center">
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : (
                  <step.icon className={`h-5 w-5 ${index === currentStep ? "text-primary animate-pulse" : "text-muted-foreground"}`} />
                )}
                <span className={`text-sm ${index <= currentStep ? "font-medium" : "text-muted-foreground"}`}>
                  {step.text}
                </span>
              </div>
            ))}
          </div>

          <div className="text-xs text-muted-foreground text-center">
            {elapsedTime < 10 
              ? "Almost there..." 
              : "This may take a few more seconds depending on the file size"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
