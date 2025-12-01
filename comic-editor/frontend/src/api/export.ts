import { apiRequest } from "./client";
import type { Page } from "../types";

export async function exportComicBook(
  outputPath: string,
  pages: Page[]
) {
  return apiRequest("/comic/export", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      path: outputPath,
      pages,
    }),
  });
}
