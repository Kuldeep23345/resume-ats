"use client";

import { useCallback, useState } from "react";
import { Upload, FileText, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ATSDashboard } from "./ATSDashboard";
import { LoadingState } from "./LoadingState";
import { ErrorState } from "./ErrorState";
import type { ResumeAnalysis } from "@/types";

type AnalysisState = "idle" | "uploading" | "analyzing" | "success" | "error";

interface AnalyzeResponse {
  success: boolean;
  data?: ResumeAnalysis;
  error?: string;
}

export function ResumeAnalyzer() {
  const [state, setState] = useState<AnalysisState>("idle");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setAnalysis(null);
      setError(null);
    }
  }, []);

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;

    setState("uploading");
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      setState("analyzing");

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data: AnalyzeResponse = await response.json();

      if (!data.success || !data.data) {
        throw new Error(data.error || "Analysis failed");
      }

      setAnalysis(data.data);
      setState("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setState("error");
    }
  }, [selectedFile]);

  const handleRetry = useCallback(() => {
    handleUpload();
  }, [handleUpload]);

  const handleReset = useCallback(() => {
    setState("idle");
    setSelectedFile(null);
    setAnalysis(null);
    setError(null);
  }, []);

  if (state === "analyzing" || state === "uploading") {
    return <LoadingState />;
  }

  if (state === "success" && analysis) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Analysis Complete</h2>
            <p className="text-sm text-muted-foreground">
              {selectedFile?.name}
            </p>
          </div>
          <Button onClick={handleReset} variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Analyze Another Resume
          </Button>
        </div>
        <ATSDashboard analysis={analysis} />
      </div>
    );
  }

  if (state === "error") {
    return (
      <ErrorState 
        error={error || "An unknown error occurred"} 
        onRetry={handleRetry}
        onReset={handleReset}
      />
    );
  }

  return (
    <Card className="w-full max-w-3xl overflow-hidden shadow-2xl border-2 border-blue-500/20">
      <div className="h-2 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700" />
      <CardHeader className="text-center pb-2">
        <div className="mx-auto h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
          <Upload className="h-8 w-8 text-blue-600" />
        </div>
        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
          Upload Your Resume
        </CardTitle>
        <p className="text-muted-foreground mt-2">
          Get instant AI-powered analysis and improve your chances
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="relative">
          <Input
            id="resume"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            className="h-32 cursor-pointer transition-all hover:border-blue-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Click or drag file here</p>
          </div>
        </div>

        {selectedFile && (
          <div className="p-4 border-2 border-blue-500/30 rounded-xl bg-blue-50 dark:bg-blue-950/20">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-blue-500 flex items-center justify-center">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium truncate">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
          </div>
        )}

        <Button 
          onClick={handleUpload} 
          className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
          disabled={!selectedFile}
          size="lg"
        >
          <Zap className="h-5 w-5 mr-2" />
          Analyze Resume
        </Button>
        
        <p className="text-center text-xs text-muted-foreground">
          Supports PDF, DOC, DOCX up to 10MB
        </p>
      </CardContent>
    </Card>
  );
}
