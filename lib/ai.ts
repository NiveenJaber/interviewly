export type AIMode = "gemini" | "openai" | "local";

export async function askAI(system: string, user: string): Promise<{ data: Record<string, unknown> | null; mode: AIMode }> {
  if (process.env.GEMINI_API_KEY) {
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY },
      body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: `${system}\n\n${user}` }] }], generationConfig: { responseMimeType: "application/json", temperature: 0.4 } }),
      signal: AbortSignal.timeout(25000),
    });
    if (!response.ok) throw new Error(`Gemini request failed: ${response.status}`);
    const result = await response.json();
    const content = result.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || "").join("");
    if (!content) throw new Error("Gemini returned no text");
    return { data: JSON.parse(content), mode: "gemini" };
  }

  if (process.env.OPENAI_API_KEY) {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({ model: process.env.OPENAI_MODEL || "gpt-4o-mini", temperature: 0.5, response_format: { type: "json_object" }, messages: [{ role: "system", content: system }, { role: "user", content: user }] }),
      signal: AbortSignal.timeout(25000),
    });
    if (!response.ok) throw new Error(`OpenAI request failed: ${response.status}`);
    const result = await response.json();
    return { data: JSON.parse(result.choices?.[0]?.message?.content || "{}"), mode: "openai" };
  }

  return { data: null, mode: "local" };
}
