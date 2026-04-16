import { PDFParse } from "pdf-parse";
import path from "path";

PDFParse.setWorker(
  path.join(process.cwd(), "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs")
);

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
