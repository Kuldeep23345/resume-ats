"use client";

import { useCallback, useRef, useState, type DragEvent } from "react";
import {
  ArrowUpRight,
  BadgeCheck,
  FileText,
  Gauge,
  Loader2,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { ATSDashboard } from "./ATSDashboard";
import { LoadingState } from "./LoadingState";
import { ErrorState } from "./ErrorState";
import { extractTextFromPDF } from "@/lib/extractors/client-pdf";
import type { ResumeAnalysis } from "@/types";

type AnalysisState =
  | "idle"
  | "extracting"
  | "uploading"
  | "analyzing"
  | "success"
  | "error";

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
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((file: File) => {
    if (file) {
      setSelectedFile(file);
      setAnalysis(null);
      setError(null);
    }
  }, []);

  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);
      const file = event.dataTransfer.files[0];
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

    setError(null);
    try {
      const isPDF = selectedFile.name.toLowerCase().endsWith(".pdf");
      let response: Response;

      if (isPDF) {
        setState("extracting");
        const text = await extractTextFromPDF(selectedFile);
        setState("analyzing");
        response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
      } else {
        setState("analyzing");
        const formData = new FormData();
        formData.append("file", selectedFile);
        response = await fetch("/api/analyze", {
          method: "POST",
          body: formData,
        });
      }

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
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  if (
    state === "analyzing" ||
    state === "uploading" ||
    state === "extracting"
  ) {
    return (
      <LoadingState
        phase={state === "extracting" ? "extracting" : "analyzing"}
      />
    );
  }

  if (state === "success" && analysis) {
    return (
      <section className="w-full space-y-5">
        <div className="flex flex-col gap-4 rounded-lg border border-black/10 bg-white/90 p-4 shadow-[0_16px_50px_rgba(23,26,23,0.10)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-lg bg-[#f6ecd0] text-[var(--premium-panel)]">
              <BadgeCheck className="size-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-[var(--premium-ink)]">
                Analysis complete
              </h1>
              <p className="max-w-full truncate text-sm text-muted-foreground">
                {selectedFile?.name}
              </p>
            </div>
          </div>
          <Button
            onClick={handleReset}
            variant="outline"
            className="h-10 w-full justify-center gap-2 border-black/10 bg-white/75 text-[var(--premium-ink)] hover:bg-white sm:w-auto"
          >
            <Upload className="size-4" />
            Analyze Another
          </Button>
        </div>
        <ATSDashboard analysis={analysis} />
      </section>
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

  const workflowItems = [
    {
      icon: FileText,
      label: "Document intake",
      value: selectedFile ? "Ready" : "Waiting",
    },
    { icon: ScanLine, label: "ATS parsing", value: "Queued" },
    { icon: Sparkles, label: "AI review", value: "Queued" },
  ];

  return (
    <section className="w-full">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)] xl:items-stretch">
        <Card className="border-black/10 bg-white/[0.92] py-0 shadow-[0_26px_90px_rgba(23,26,23,0.14)] backdrop-blur">
          <CardContent className="px-0">
            <div className="border-b border-black/10 p-5 sm:p-6">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-lg bg-[linear-gradient(145deg,var(--premium-panel),var(--premium-aubergine))] text-white shadow-sm">
                    <FileText className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--premium-ink)]">
                      Resume intake
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PDF and DOCX supported
                    </p>
                  </div>
                </div>
                <div className="hidden rounded-lg border border-[#d9c38b] bg-[#fbf5e6] px-3 py-1 text-xs font-medium text-[#6f5520] sm:block">
                  10MB max
                </div>
              </div>

              <h1 className="max-w-xl text-3xl font-semibold leading-tight text-[var(--premium-ink)] sm:text-4xl">
                Turn a resume into a focused ATS report.
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                Upload a resume to see score, keyword gaps, strengths, and
                practical edits in one workspace.
              </p>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.docx"
                className="hidden"
                onChange={(event) =>
                  event.target.files?.[0] &&
                  handleFileChange(event.target.files[0])
                }
              />

              {!selectedFile ? (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => inputRef.current?.click()}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      inputRef.current?.click();
                    }
                  }}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={onDrop}
                  className={[
                    "group flex cursor-pointer items-center gap-4 rounded-lg border p-4 outline-none transition-all duration-200 focus-visible:ring-3 focus-visible:ring-primary/30",
                    isDragging
                      ? "border-[var(--premium-teal)] bg-[#eaf5f1] shadow-inner"
                      : "border-primary/20 bg-primary/5 hover:border-[var(--premium-teal)] hover:bg-[#eaf5f1]",
                  ].join(" ")}
                >
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-[linear-gradient(145deg,var(--premium-panel),var(--premium-aubergine))] text-white">
                    <Upload className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="truncate font-semibold text-[var(--premium-ink)]">
                      {isDragging ? "Release to upload" : "Select resume file"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      PDF or DOCX
                    </p>
                  </div>
                  <div className="hidden shrink-0 items-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm font-medium text-[var(--premium-ink)] shadow-sm sm:inline-flex">
                    Browse files
                    <ArrowUpRight className="size-4" />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-[linear-gradient(145deg,var(--premium-panel),var(--premium-aubergine))] text-white">
                    <FileText className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-[var(--premium-ink)]">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    aria-label="Remove selected file"
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-black/10 bg-white text-muted-foreground transition-colors hover:text-[var(--premium-ink)] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/30"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              )}

              <Button
                onClick={handleUpload}
                className="h-11 w-full gap-2 rounded-lg bg-[linear-gradient(135deg,var(--premium-panel),var(--premium-aubergine))] text-sm font-semibold text-white shadow-sm hover:brightness-110"
                disabled={!selectedFile || state !== "idle"}
                size="lg"
              >
                {state !== "idle" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Gauge className="size-4" />
                )}
                {state !== "idle" ? "Analyzing" : "Run ATS Analysis"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <aside className="flex flex-col justify-between rounded-lg border border-white/15 bg-[linear-gradient(145deg,var(--premium-panel)_0%,var(--premium-panel-soft)_48%,var(--premium-aubergine)_100%)] p-5 text-white shadow-[0_26px_90px_rgba(23,26,23,0.22)] sm:p-6">
          <div>
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">
                  Review pipeline
                </p>
                <p className="text-xs text-white/60">Live session state</p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-lg bg-white/10">
                <ShieldCheck className="size-5 text-[#f1d58b]" />
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
              {workflowItems.map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg border border-white/10 bg-white/[0.06] p-4"
                >
                  <item.icon className="mb-4 size-5 text-[#f1d58b]" />
                  <p className="text-sm font-medium text-white">
                    {item.label}
                  </p>
                  <p className="mt-1 text-xs text-white/60">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.06] p-4">
            <div className="mb-4 flex items-center justify-between text-xs font-medium text-white/60">
              <span>Report coverage</span>
              <span>4 modules</span>
            </div>
            <div className="space-y-3">
              {["ATS score", "Keyword gaps", "Strength map", "Edit plan"].map(
                (label, index) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="flex size-6 items-center justify-center rounded-full bg-white/10 text-[11px] font-semibold text-[#f1d58b]">
                      {index + 1}
                    </div>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-[linear-gradient(90deg,var(--premium-gold),#d8c28a)]"
                        style={{ width: `${92 - index * 12}%` }}
                      />
                    </div>
                    <span className="w-24 truncate text-right text-xs text-white/70">
                      {label}
                    </span>
                  </div>
                ),
              )}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
