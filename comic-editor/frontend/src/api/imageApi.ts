import { apiRequest } from "./client";

export async function sendKeywordsAndComicBookSketch(keywords: string, comicBookSketchBase64?: string) {
  return apiRequest("/image/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      keywords,
      comicBookSketch: comicBookSketchBase64 || null,
    }),
  });
}
