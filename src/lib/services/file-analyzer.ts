import { extractTextFromPDF, extractTextFromDOCX } from "@/lib/extractors";
import type { ExtractedText, FileType } from "@/types";

const ALLOWED_MIME_TYPES = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
} as const;

const ALLOWED_EXTENSIONS = {
  pdf: ".pdf",
  docx: ".docx",
} as const;

export function validateFile(
  fileName: string,
  mimeType: string
): { valid: boolean; fileType: FileType | null; error?: string } {
  const extension = fileName.toLowerCase().split(".").pop();

  if (extension === "pdf" && mimeType === ALLOWED_MIME_TYPES.pdf) {
    return { valid: true, fileType: "pdf" };
  }

  if (extension === "docx" && mimeType === ALLOWED_MIME_TYPES.docx) {
    return { valid: true, fileType: "docx" };
  }

  return {
    valid: false,
    fileType: null,
    error: `Invalid file type. Allowed: ${Object.values(ALLOWED_EXTENSIONS).join(", ")}`,
  };
}

export async function analyzeFile(
  buffer: Buffer,
  fileName: string,
  mimeType: string,
  fileSize: number
): Promise<ExtractedText> {
  const validation = validateFile(fileName, mimeType);

  if (!validation.valid || !validation.fileType) {
    throw new Error(validation.error || "Invalid file");
  }

  let text: string;
  let pageCount: number | undefined;

  if (validation.fileType === "pdf") {
    const result = await extractTextFromPDF(buffer);
    text = result.text;
    pageCount = result.pageCount;
  } else if (validation.fileType === "docx") {
    const result = await extractTextFromDOCX(buffer);
    text = result.text;
  } else {
    throw new Error("Unsupported file type");
  }

  return {
    text,
    pageCount,
    metadata: {
      fileName,
      fileType: validation.fileType,
      fileSize,
    },
  };
}
