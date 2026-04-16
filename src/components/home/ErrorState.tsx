"use client";

import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
  onReset: () => void;
}

export function ErrorState({ error, onRetry, onReset }: ErrorStateProps) {
  return (
    <Card className="w-full max-w-3xl border-destructive">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center space-y-6 py-12">
          <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-destructive">
              Analysis Failed
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
              {error}
            </p>
          </div>

          <div className="flex gap-3">
            <Button onClick={onRetry} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
            <Button onClick={onReset} variant="default" className="gap-2">
              <Home className="h-4 w-4" />
              Upload New Resume
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center max-w-md">
            <p className="font-medium mb-1">Common issues:</p>
            <ul className="list-disc list-inside space-y-1 text-left">
              <li>File format not supported (use PDF, DOC, or DOCX)</li>
              <li>File is too large (max 10MB)</li>
              <li>Network connection issues</li>
              <li>Resume text is too short or unclear</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
