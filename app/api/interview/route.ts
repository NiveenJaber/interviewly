import { NextRequest, NextResponse } from "next/server";
import { askAI, type AIMode } from "@/lib/ai";
import { codingGaps, fallbackFeedback, fallbackQuestions, type CodingGap, type Feedback, type Question } from "@/lib/interview";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const input = await request.json();
    if (input.action === "questions") {
      const job = String(input.job || "").slice(0, 12000);
      const resume = String(input.resume || "").slice(0, 12000);
      if (!job.trim() || !resume.trim()) return NextResponse.json({ error: "Add both a job description and resume." }, { status: 400 });
      let questions: Question[] = fallbackQuestions(job, resume);
      let mode: AIMode = "local";
      try {
        const result = await askAI(`Return JSON with a questions array. Create exactly 3 behavioral and 3 technical interview questions tailored to the job and resume. Each object must have id, phase (behavioral or technical), question, focus, duration in seconds. Two technical questions should assess role knowledge or architecture. One technical question must be a concrete algorithmic coding question; give that question a codingTopic from this list: ${codingGaps.join(", ")}. Other questions should omit codingTopic. Questions should be specific, fair, and concise. Do not invent resume facts.`, `JOB DESCRIPTION:\n${job}\n\nRESUME:\n${resume}`);
        const generated = result.data?.questions;
        if (Array.isArray(generated) && generated.length === 6 && generated.filter((q: Question) => q.phase === "behavioral").length === 3 && generated.filter((q: Question) => q.phase === "technical").length === 3 && generated.filter((q: Question) => q.phase === "technical" && codingGaps.includes(q.codingTopic as CodingGap)).length === 1 && generated.every((q: Question) => typeof q.question === "string" && q.question.trim())) {
          questions = generated.sort((a: Question, b: Question) => a.phase === b.phase ? 0 : a.phase === "behavioral" ? -1 : 1).map((q: Question, i: number) => ({ id: String(i + 1), phase: q.phase, question: q.question.slice(0, 500), focus: String(q.focus || "Interview response").slice(0, 100), duration: Math.min(300, Math.max(60, Number(q.duration) || 150)), codingTopic: codingGaps.includes(q.codingTopic as CodingGap) ? q.codingTopic : undefined }));
          mode = result.mode;
        }
      } catch (error) { console.error("Question generation failed; using local questions", error); }
      return NextResponse.json({ questions, mode });
    }

    if (input.action === "feedback") {
      const question = String(input.question || "").slice(0, 1000);
      const answer = String(input.answer || "").slice(0, 12000);
      if (!question.trim() || !answer.trim()) return NextResponse.json({ error: "Answer the question first." }, { status: 400 });
      const codingTopic = codingGaps.includes(input.codingTopic) ? input.codingTopic as CodingGap : undefined;
      let feedback: Feedback = fallbackFeedback(question, answer, codingTopic);
      let mode: AIMode = "local";
      try {
        const result = await askAI(`You are a constructive interview coach. Return JSON with score (integer 0-100), strengths (array of 1-3 short specific strings), improvements (array of 1-3 short actionable strings), summary (one sentence), tip (one short sentence), and gapTags (array). Allowed gapTags: ${codingGaps.join(", ")}. Only return gapTags for an algorithmic coding question when the answer actually shows a weakness in that pattern. For behavioral or non-coding technical questions return []. Judge only the supplied answer, never infer unstated experience. Be honest and supportive. Explain concrete strengths and improvements for this answer instead of generic praise.`, `JOB DESCRIPTION:\n${String(input.job || "").slice(0, 8000)}\n\nRESUME:\n${String(input.resume || "").slice(0, 8000)}\n\nPHASE:\n${input.phase === "technical" ? "technical" : "behavioral"}\n\nCODING TOPIC:\n${codingTopic || "none"}\n\nQUESTION:\n${question}\n\nANSWER:\n${answer}`);
        const ai = result.data;
        if (ai && Number.isFinite(Number(ai.score)) && Array.isArray(ai.strengths) && Array.isArray(ai.improvements) && ai.strengths.length && ai.improvements.length) {
          feedback = { score: Math.min(100, Math.max(0, Math.round(Number(ai.score)))), strengths: ai.strengths.map(String).slice(0, 3), improvements: ai.improvements.map(String).slice(0, 3), summary: String(ai.summary || "Review your answer below."), tip: String(ai.tip || "Practice with a specific example."), gapTags: codingTopic && Array.isArray(ai.gapTags) ? ai.gapTags.filter((tag: unknown): tag is CodingGap => codingGaps.includes(tag as CodingGap)).slice(0, 2) : [] };
          mode = result.mode;
        }
      } catch (error) { console.error("Feedback generation failed; using local feedback", error); }
      return NextResponse.json({ feedback, mode });
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
}
