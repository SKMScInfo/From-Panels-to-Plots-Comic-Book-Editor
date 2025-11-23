export async function sendStoryAndSketch(story: string, sketchBase64?: string) {
  const res = await fetch("http://localhost:8000/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      story,
      sketch: sketchBase64 || null,
    }),
  });

  return res.json();
}
