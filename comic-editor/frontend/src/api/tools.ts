import { apiRequest } from "./client";

export async function smudgePage(pageImageBase64: string) {
  return apiRequest("/tools/smudge", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      image: pageImageBase64,
    }),
  });
}

export async function applyToneToPage(
  pageImageBase64: string,
  tone: string
) {
  return apiRequest("/tools/tone", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      image: pageImageBase64,
      tone,
    }),
  });
}

export async function fillColorInPage(
  pageImageBase64: string,
  x: number,
  y: number,
  color: string
) {
  return apiRequest("/tools/color-fill", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      image: pageImageBase64,
      point: { x, y },
      color,
    }),
  });
}


