import { apiRequest } from "./client";

export async function createNewPage() {
  return apiRequest("/comic/new-page", {
    method: "POST",
  });
}
