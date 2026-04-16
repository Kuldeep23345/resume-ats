"use client";

import { useCallback, useState, useRef } from "react";
import { Upload, FileText, Zap, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { ATSDashboard } from "./ATSDashboard";
import { LoadingState } from "./LoadingState";
import { ErrorState } from "./ErrorState";
import { extractTextFromPDF } from "@/lib/extractors/client-pdf";
import type { ResumeAnalysis } from "@/types";

type AnalysisState = "idle" | "extracting" | "uploading" | "analyzing" | "success" | "error";

interface AnalyzeResponse {
  success: boolean;
  data?: ResumeAnalysis;
  error?: string;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

export function ResumeAnalyzer() {
  const [state, setState] = useState<AnalysisState>("idle");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((file: File) => {
    if (file) {
      setSelectedFile(file);
      setAnalysis(null);
      setError(null);
    }
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileChange(file);
    },
    [handleFileChange],
  );

  const removeFile = useCallback(() => {
    setSelectedFile(null);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;

    setState("uploading");
    setError(null);
    setIsUploading(true);

    try {
      const isPDF = selectedFile.name.toLowerCase().endsWith(".pdf");
      let text: string;

      if (isPDF) {
        setState("extracting");
        text = await extractTextFromPDF(selectedFile);
        setState("analyzing");

        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });

        const data: AnalyzeResponse = await response.json();
        if (!data.success || !data.data) {
          throw new Error(data.error || "Analysis failed");
        }
        setAnalysis(data.data);
        setState("success");
      } else {
        setState("analyzing");
        const formData = new FormData();
        formData.append("file", selectedFile);

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
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setState("error");
    } finally {
      setIsUploading(false);
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
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  if (state === "analyzing" || state === "uploading" || state === "extracting") {
    return <LoadingState phase={state === "extracting" ? "extracting" : "analyzing"} />;
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
            Analyze Another
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
    <Card className="w-full max-w-3xl overflow-hidden shadow-2xl border-2 border-zinc-900/20">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto h-16 w-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
          <Upload className="h-8 w-8 text-zinc-800 dark:text-zinc-100" />
        </div>
        <CardTitle className="text-3xl font-bold">Upload Your Resume</CardTitle>
        <p className="text-muted-foreground mt-2">
          Get instant AI-powered analysis and improve your chances
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx"
          className="hidden"
          onChange={(e) =>
            e.target.files?.[0] && handleFileChange(e.target.files[0])
          }
        />

        {!selectedFile ? (
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            className={`
              relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
              transition-all duration-200 ease-in-out
              ${
                isDragging
                  ? "border-zinc-800 bg-zinc-100 dark:bg-zinc-800 scale-[1.02]"
                  : "border-zinc-300 dark:border-zinc-600 hover:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              }
            `}
          >
            <div className="flex flex-col items-center gap-3">
              <div
                className={`
                h-14 w-14 rounded-full flex items-center justify-center
                transition-all duration-200
                ${isDragging ? "bg-zinc-800" : "bg-zinc-100 dark:bg-zinc-800"}
              `}
              >
                <Upload
                  className={`h-7 w-7 ${isDragging ? "text-white" : "text-zinc-800"}`}
                />
              </div>
              <div>
                <p className="font-semibold text-lg">
                  {isDragging
                    ? "Drop your file here"
                    : "Drag & drop your resume"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  or{" "}
                  <span className="text-zinc-800 font-medium">
                    click to browse
                  </span>
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                PDF, DOCX up to 10MB
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-4 border-2 border-zinc-800/30 rounded-xl bg-zinc-50 dark:bg-zinc-800/20">
            <div className="h-14 w-14 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0">
              <FileText className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
            <button
              onClick={removeFile}
              className="h-10 w-10 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
            >
              <X className="h-5 w-5 text-zinc-800" />
            </button>
          </div>
        )}

        <Button
          onClick={handleUpload}
          className="w-full h-12 text-lg font-semibold bg-zinc-900 hover:bg-zinc-800 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
          disabled={!selectedFile || isUploading}
          size="lg"
        >
          {isUploading ? (
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          ) : (
            <Zap className="h-5 w-5 mr-2" />
          )}
          {isUploading ? "Analyzing..." : "Analyze Resume"}
        </Button>
      </CardContent>
    </Card>
  );
}
