import type { Color } from "../components/ColourWheel";
import type { ToneSelection } from "../components/ToneWheel";
import type { Page } from "../types";
import { apiRequest } from "./client";

export async function smudgePage(pageImageBase64: Page) {
  return apiRequest("/tools/smudge", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      page: pageImageBase64,
    }),
  });
}

export async function applyToneToPage(
  pageImageBase64: Page,
  tone: ToneSelection
) {
  return apiRequest("/tools/tone", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      page: pageImageBase64,
      tone,
    }),
  });
}

export async function fillColorInPage(
  pageImageBase64: Page,
  x: number,
  y: number,
  color: Color
) {
  return apiRequest("/tools/color-fill", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      page: pageImageBase64,
      point: { x, y },
      color,
    }),
  });
}


