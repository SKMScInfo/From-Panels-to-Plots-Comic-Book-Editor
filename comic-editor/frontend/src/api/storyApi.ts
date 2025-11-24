import { apiRequest } from "./client";

export async function sendStoryAndFortuneSketch(story: string, fortuneSketchBase64?: string) {
  return apiRequest("/story/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      story,
      fortuneSketch: fortuneSketchBase64 || null,
    }),
  });
}
