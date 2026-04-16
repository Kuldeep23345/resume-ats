export interface ExtractedText {
  text: string;
  pageCount?: number;
  metadata?: {
    fileName: string;
    fileType: string;
    fileSize: number;
  };
}

export interface ResumeAnalysis {
  role: string;
  level: string;
  score: number;
  techStack: string[];
  strengths: string[];
  weaknesses: string[];
  missingKeywords: string[];
  suggestions: string[];
  advice: string;
}

export interface AnalyzeResponse {
  success: boolean;
  data?: ResumeAnalysis;
  error?: string;
}

export type FileType = "pdf" | "docx";
