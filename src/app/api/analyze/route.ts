import { NextRequest, NextResponse } from "next/server";
import { analyzeFile } from "@/lib/services/file-analyzer";
import { analyzeResume } from "@/lib/services/ai-analyzer";
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

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return jsonError(400, "No file provided. Please upload a resume file.");
    }

    if (file.size > MAX_FILE_SIZE) {
      return jsonError(400, "File size exceeds 10MB limit");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const extractedData = await analyzeFile(
      buffer,
      file.name,
      file.type,
      file.size
    );

    const analysis = await analyzeResume(extractedData.text);

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
