import { PDFParse } from "pdf-parse";

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
