"use client";

import { useCallback, useState } from "react";
import { Upload, Loader2, CheckCircle, XCircle, TrendingUp, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ResumeAnalysis {
  role: string;
  level: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  advice: string;
}

interface AnalyzeResponse {
  success: boolean;
  data?: ResumeAnalysis;
  error?: string;
}

export function FileUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
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

    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);

    try {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsAnalyzing(false);
    }
  }, [selectedFile]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Average";
    return "Needs Improvement";
  };

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Resume Analyzer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="resume">Upload Resume</Label>
          <div className="flex items-center gap-4">
            <Input
              id="resume"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="flex-1"
            />
            <Upload className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            Supported formats: PDF, DOC, DOCX
          </p>
        </div>

        {selectedFile && (
          <div className="p-4 border rounded-lg bg-muted/50">
            <p className="text-sm font-medium">Selected file:</p>
            <p className="text-sm text-muted-foreground">{selectedFile.name}</p>
            <p className="text-xs text-muted-foreground">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        )}

        <Button 
          onClick={handleUpload} 
          className="w-full" 
          disabled={!selectedFile || isAnalyzing}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing Resume...
            </>
          ) : (
            "Analyze Resume"
          )}
        </Button>

        {error && (
          <div className="p-4 border border-destructive rounded-lg bg-destructive/10">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="h-5 w-5 text-destructive" />
              <p className="text-sm font-medium text-destructive">Error</p>
            </div>
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {analysis && (
          <div className="space-y-6">
            <div className="p-6 border rounded-lg bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold">{analysis.role}</h3>
                  <p className="text-lg text-muted-foreground">{analysis.level}</p>
                </div>
                <div className="text-right">
                  <div className={`text-4xl font-bold ${getScoreColor(analysis.score)}`}>
                    {analysis.score}
                  </div>
                  <p className={`text-sm font-medium ${getScoreColor(analysis.score)}`}>
                    {getScoreLabel(analysis.score)}
                  </p>
                </div>
              </div>
              <p className="text-sm leading-relaxed">{analysis.advice}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg bg-green-50/50 dark:bg-green-950/20">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h4 className="font-semibold text-green-700 dark:text-green-400">
                    Strengths
                  </h4>
                </div>
                <ul className="space-y-2">
                  {analysis.strengths.map((strength, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">•</span>
                      <span className="text-green-800 dark:text-green-300">
                        {strength}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 border rounded-lg bg-red-50/50 dark:bg-red-950/20">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <h4 className="font-semibold text-red-700 dark:text-red-400">
                    Areas for Improvement
                  </h4>
                </div>
                <ul className="space-y-2">
                  {analysis.weaknesses.map((weakness, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <span className="text-red-600 mt-0.5">•</span>
                      <span className="text-red-800 dark:text-red-300">
                        {weakness}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-4 border rounded-lg bg-blue-50/50 dark:bg-blue-950/20">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold text-blue-700 dark:text-blue-400">
                  Suggestions
                </h4>
              </div>
              <ul className="space-y-2">
                {analysis.suggestions.map((suggestion, index) => (
                  <li key={index} className="text-sm flex items-start gap-2">
                    <span className="text-blue-600 font-medium">{index + 1}.</span>
                    <span className="text-blue-800 dark:text-blue-300">
                      {suggestion}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
