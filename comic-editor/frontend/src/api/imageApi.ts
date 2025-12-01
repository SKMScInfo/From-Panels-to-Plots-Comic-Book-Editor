import { apiRequest } from "./client";

export async function generateComicPage(
  sketchBase64: string | null,
  pagePrompt: string,
  currentImageBase64: string | null
) {
  return apiRequest("/image/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sketch: sketchBase64,
      prompt: pagePrompt,
      currentImage: currentImageBase64,
    }),
  });
}

export async function applyChangesGlobally(
  sketchBase64: string | null,
  pagePrompt: string,
  allImages: (string | null)[]
) {
  return apiRequest("/image/generateAll", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sketch: sketchBase64,
      prompt: pagePrompt,
      images: allImages,
    }),
  });
}

