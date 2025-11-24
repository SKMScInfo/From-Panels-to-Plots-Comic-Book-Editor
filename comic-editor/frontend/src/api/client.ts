export const API_URL = "http://localhost:8000";

export async function apiRequest(endpoint: string, options: RequestInit) {
  const res = await fetch(`${API_URL}${endpoint}`, options);
  return res.json();
}
