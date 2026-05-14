"use client";

import { AlertTriangle, FileWarning, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
  onReset: () => void;
}

export function ErrorState({ error, onRetry, onReset }: ErrorStateProps) {
  return (
    <section className="w-full">
      <Card className="mx-auto w-full max-w-4xl border-red-200 bg-white/[0.92] py-0 shadow-[0_26px_90px_rgba(127,29,29,0.12)] backdrop-blur">
        <CardContent className="px-0">
          <div className="grid gap-0 xl:grid-cols-[280px_1fr]">
            <div className="flex items-center justify-center border-b border-red-200 bg-[linear-gradient(145deg,#4c1722_0%,#7f1d1d_52%,var(--premium-aubergine)_100%)] p-6 text-white sm:p-8 xl:border-b-0 xl:border-r">
              <div className="flex size-24 items-center justify-center rounded-lg bg-white/15">
                <AlertTriangle className="size-11" />
              </div>
            </div>

            <div className="p-5 sm:p-7">
              <div className="mb-5 inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
                <FileWarning className="size-3.5" />
                Analysis stopped
              </div>

              <h2 className="text-2xl font-semibold text-[var(--premium-ink)]">
                The resume could not be analyzed.
              </h2>
              <p className="mt-3 max-w-xl rounded-lg border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800">
                {error}
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={onRetry}
                  variant="outline"
                  className="h-10 justify-center gap-2 border-black/10 bg-white text-[var(--premium-ink)] hover:bg-red-50"
                >
                  <RefreshCw className="size-4" />
                  Try Again
                </Button>
                <Button
                  onClick={onReset}
                  className="h-10 justify-center gap-2 bg-[linear-gradient(135deg,var(--premium-panel),var(--premium-aubergine))] text-white hover:brightness-110"
                >
                  <Home className="size-4" />
                  Upload New Resume
                </Button>
              </div>

              <div className="mt-6 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                <div className="rounded-lg border border-black/10 bg-white p-3">
                  Use PDF or DOCX files under 10MB.
                </div>
                <div className="rounded-lg border border-black/10 bg-white p-3">
                  Make sure the resume has selectable text.
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
