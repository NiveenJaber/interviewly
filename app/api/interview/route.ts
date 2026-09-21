import { NextRequest, NextResponse } from "next/server";
import { fallbackFeedback, fallbackQuestions, type Feedback, type Question } from "@/lib/interview";
export const runtime = "nodejs";
async function askAI(system: string, user: string) {
  if (!process.env.OPENAI_API_KEY) return null;
  const response = await fetch("https://api.openai.com/v1/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }, body: JSON.stringify({ model: process.env.OPENAI_MODEL || "gpt-4o-mini", temperature: 0.5, response_format: { type: "json_object" }, messages: [{ role: "system", content: system }, { role: "user", content: user }] }), signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`AI request failed: ${response.status}`);
  const data = await response.json();
  return JSON.parse(data.choices?.[0]?.message?.content || "{}");
}
export async function POST(request: NextRequest) {
  try {
    const input = await request.json();
    if (input.action === "questions") {
      const job = String(input.job || "").slice(0, 12000), resume = String(input.resume || "").slice(0, 12000);
      if (!job.trim() || !resume.trim()) return NextResponse.json({ error: "Add both a job description and resume." }, { status: 400 });
      let questions: Question[] = fallbackQuestions(job, resume);
      try {
        const ai = await askAI("Return JSON with a questions array. Create exactly 3 behavioral and 3 technical interview questions tailored to the job and resume. Each object must have id, phase (behavioral or technical), question, focus, duration in seconds. Questions should be specific, fair, and concise. Do not invent resume facts.", `JOB DESCRIPTION:\n${job}\n\nRESUME:\n${resume}`);
        if (Array.isArray(ai?.questions) && ai.questions.length === 6 && ai.questions.filter((q: Question) => q.phase === "behavioral").length === 3 && ai.questions.filter((q: Question) => q.phase === "technical").length === 3 && ai.questions.every((q: Question) => q.question)) questions = ai.questions.sort((a: Question, b: Question) => a.phase === b.phase ? 0 : a.phase === "behavioral" ? -1 : 1).map((q: Question, i: number) => ({ id: String(i + 1), phase: q.phase, question: String(q.question), focus: String(q.focus || "Interview response"), duration: Math.min(300, Math.max(60, Number(q.duration) || 150)) }));
      } catch (error) { console.error("Question generation failed; using local questions", error); }
      return NextResponse.json({ questions, mode: process.env.OPENAI_API_KEY ? "ai" : "local" });
    }
    if (input.action === "feedback") {
      const question = String(input.question || "").slice(0, 1000), answer = String(input.answer || "").slice(0, 12000);
      if (!answer.trim()) return NextResponse.json({ error: "Answer the question first." }, { status: 400 });
      let feedback: Feedback = fallbackFeedback(question, answer);
      try {
        const ai = await askAI("You are a constructive interview coach. Return JSON with score (integer 0-100), strengths (array of 1-3 short specific strings), improvements (array of 1-3 short actionable strings), summary (one sentence), tip (one short sentence). Judge only the supplied answer, never infer unstated experience. Be honest and supportive.", `JOB DESCRIPTION:\n${String(input.job || "").slice(0, 8000)}\n\nRESUME:\n${String(input.resume || "").slice(0, 8000)}\n\nQUESTION:\n${question}\n\nANSWER:\n${answer}`);
        if (ai && Number.isFinite(Number(ai.score)) && Array.isArray(ai.strengths) && Array.isArray(ai.improvements)) feedback = { score: Math.min(100, Math.max(0, Math.round(Number(ai.score)))), strengths: ai.strengths.map(String).slice(0, 3), improvements: ai.improvements.map(String).slice(0, 3), summary: String(ai.summary || "Review your answer below."), tip: String(ai.tip || "Practice with a specific example.") };
      } catch (error) { console.error("Feedback generation failed; using local feedback", error); }
      return NextResponse.json({ feedback, mode: process.env.OPENAI_API_KEY ? "ai" : "local" });
    }
    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
}
