import { NextRequest, NextResponse } from "next/server";
import { analyzeResume } from "@/lib/services/ai-analyzer";
import { extractTextFromDOCX } from "@/lib/extractors/docx";
import type { AnalyzeResponse } from "@/types";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function jsonError(message: string, status: number = 400): NextResponse<AnalyzeResponse> {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function POST(request: NextRequest): Promise<NextResponse<AnalyzeResponse>> {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return jsonError("GROQ_API_KEY not configured.", 500);
    }

    const contentType = request.headers.get("content-type") || "";

    let text: string;

    if (contentType.includes("application/json")) {
      const body = await request.json();
      text = body.text;
      if (!text || typeof text !== "string") {
        return jsonError("No text provided", 400);
      }
    } else {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      const providedText = formData.get("text") as string | null;

      if (providedText) {
        text = providedText;
      } else if (file) {
        if (file.size > MAX_FILE_SIZE) {
          return jsonError("File size exceeds 10MB limit", 400);
        }

        const fileName = file.name.toLowerCase();
        if (fileName.endsWith(".pdf")) {
          return jsonError("PDF files must have text extracted client-side. Pass 'text' field instead.", 400);
        }

        if (fileName.endsWith(".docx")) {
          const buffer = Buffer.from(await file.arrayBuffer());
          const { text: extractedText } = await extractTextFromDOCX(buffer);
          text = extractedText;
        } else {
          return jsonError("Unsupported file type. Use PDF (text pre-extracted) or DOCX.", 400);
        }
      } else {
        return jsonError("No file or text provided", 400);
      }
    }

    const analysis = await analyzeResume(text);

    return NextResponse.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error("Analysis error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return jsonError(errorMessage, 500);
  }
}
