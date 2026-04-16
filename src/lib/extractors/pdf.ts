import { PDFParse } from "pdf-parse";
// @ts-ignore - pdfjs-dist might not be a direct dependency but is available via pdf-parse
import { GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf.mjs";

import { createRequire } from "module";
const require = createRequire(import.meta.url);

try {
  // Use the local worker from node_modules since it's now externalized
  GlobalWorkerOptions.workerSrc = require.resolve("pdfjs-dist/legacy/build/pdf.worker.mjs");
} catch {
  // Fallback to CDN if resolution fails
  GlobalWorkerOptions.workerSrc =
    "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.296/legacy/build/pdf.worker.min.mjs";
}

export async function extractTextFromPDF(
  buffer: Buffer
): Promise<{ text: string; pageCount: number }> {
  const pdfParse = new PDFParse({ data: buffer });
  const data = await pdfParse.getText();
  return {
    text: data.text,
    pageCount: data.total,
  };
}
