import { NextRequest, NextResponse } from "next/server";
import { analyzeFile } from "@/lib/services/file-analyzer";
import { analyzeResume } from "@/lib/services/ai-analyzer";
import type { AnalyzeResponse } from "@/types";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(request: NextRequest): Promise<NextResponse<AnalyzeResponse>> {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: "File size exceeds 10MB limit" },
        { status: 400 }
      );
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
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
