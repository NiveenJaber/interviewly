import { codingGaps, type CodingGap, type Feedback, type Question } from "./interview";

const object = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object" && !Array.isArray(value);
const text = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;
const topic = (value: unknown): value is CodingGap => codingGaps.includes(value as CodingGap);

export function parseQuestions(value: unknown): Question[] | null {
  if (!Array.isArray(value) || value.length !== 6) return null;
  if (!value.every(q => object(q) && text(q.question) && q.question.length <= 4000 && text(q.focus) && (q.phase === "behavioral" || q.phase === "technical") && (q.codingTopic == null || (q.phase === "technical" && topic(q.codingTopic))))) return null;
  if (value.filter(q => q.phase === "behavioral").length !== 3 || value.filter(q => topic(q.codingTopic)).length !== 1) return null;
  if (new Set(value.map(q => q.question.trim().toLowerCase())).size !== 6) return null;
  return [...value].sort((a, b) => a.phase === b.phase ? 0 : a.phase === "behavioral" ? -1 : 1).map((q, i) => ({
    id: String(i + 1), phase: q.phase, question: q.question.trim(), focus: q.focus.trim().slice(0, 100),
    duration: typeof q.duration === "number" && Number.isFinite(q.duration) ? Math.min(300, Math.max(60, Math.round(q.duration))) : 150,
    ...(topic(q.codingTopic) ? { codingTopic: q.codingTopic } : {}),
  }));
}

export function parseFeedback(value: unknown, codingTopic?: CodingGap): Feedback | null {
  if (!object(value) || typeof value.score !== "number" || !Number.isFinite(value.score) || value.score < 0 || value.score > 100) return null;
  if (!Array.isArray(value.strengths) || !Array.isArray(value.improvements) || !value.strengths.length || !value.improvements.length || !value.strengths.every(text) || !value.improvements.every(text) || !text(value.summary) || !text(value.tip)) return null;
  return {
    score: Math.round(value.score), strengths: value.strengths.slice(0, 3).map(s => s.trim()), improvements: value.improvements.slice(0, 3).map(s => s.trim()),
    summary: value.summary.trim(), tip: value.tip.trim(),
    gapTags: codingTopic && Array.isArray(value.gapTags) ? [...new Set(value.gapTags.filter(topic))].slice(0, 2) : [],
  };
}
