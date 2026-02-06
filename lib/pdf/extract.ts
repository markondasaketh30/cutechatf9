/**
 * PDF Text Extraction Utility
 *
 * For quiz generation, we send PDFs directly to AI models that support them
 * (Claude, Gemini) which can read PDFs natively. This utility provides
 * helpers for fetching PDF content as base64 for the AI SDK.
 */

export async function fetchPdfAsBase64(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch PDF: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  return base64;
}

export async function fetchPdfAsDataUrl(url: string): Promise<string> {
  const base64 = await fetchPdfAsBase64(url);
  return `data:application/pdf;base64,${base64}`;
}

export function isValidPdfUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return (
      parsedUrl.protocol === "http:" ||
      parsedUrl.protocol === "https:" ||
      parsedUrl.protocol === "data:"
    );
  } catch {
    return false;
  }
}
