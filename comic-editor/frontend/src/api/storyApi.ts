import { apiRequest } from "./client";

export async function sendStoryAndSketch(story: string, sketchBase64?: string) {
  return apiRequest("/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      story,
      sketch: sketchBase64 || null,
    }),
  });
}
