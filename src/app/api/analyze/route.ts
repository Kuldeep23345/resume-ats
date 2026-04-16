import { NextRequest, NextResponse } from "next/server";
import { analyzeResume } from "@/lib/services/ai-analyzer";
import { extractTextFromDOCX } from "@/lib/extractors/docx";
import type { AnalyzeResponse } from "@/types";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function jsonError(status: number, message: string): NextResponse<AnalyzeResponse> {
  return NextResponse.json(
    { success: false, error: message },
    {
      status,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

export async function POST(request: NextRequest): Promise<NextResponse<AnalyzeResponse>> {
  try {
    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      return jsonError(500, "NVIDIA_API_KEY not configured. Please set the NVIDIA_API_KEY environment variable.");
    }

    const contentType = request.headers.get("content-type") || "";

    let text: string;

    if (contentType.includes("application/json")) {
      const body = await request.json();
      text = body.text;
      if (!text || typeof text !== "string") {
        return jsonError(400, "No text provided");
      }
    } else {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      const providedText = formData.get("text") as string | null;

      if (providedText && typeof providedText === "string") {
        text = providedText;
      } else if (file) {
        if (file.size > MAX_FILE_SIZE) {
          return jsonError(400, "File size exceeds 10MB limit");
        }

        const fileName = file.name.toLowerCase();
        if (fileName.endsWith(".pdf")) {
          return jsonError(400, "PDF files must have text extracted client-side. Pass 'text' field instead.");
        }

        if (fileName.endsWith(".docx")) {
          const buffer = Buffer.from(await file.arrayBuffer());
          const result = await extractTextFromDOCX(buffer);
          text = result.text;
        } else {
          return jsonError(400, "Unsupported file type. Use PDF (text pre-extracted) or DOCX.");
        }
      } else {
        return jsonError(400, "No file or text provided");
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
    return jsonError(500, errorMessage);
  }
}
