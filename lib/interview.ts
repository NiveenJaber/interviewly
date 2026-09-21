export type Phase = "behavioral" | "technical";
export type Question = { id: string; phase: Phase; question: string; focus: string; duration: number };
export type Feedback = { score: number; strengths: string[]; improvements: string[]; summary: string; tip: string };
const clean = (s: string) => s.replace(/\s+/g, " ").trim();
export function extractRole(job: string) { const first = job.split(/[\n.!]/).map(clean).find(x => x.length > 8) || "this role"; return first.slice(0, 80); }
export function fallbackQuestions(job: string, resume: string): Question[] {
  const role = extractRole(job);
  const resumeHint = resume.split(/[\n.!]/).map(clean).find(x => x.length > 28 && x.length < 140) || "a project from your resume";
  return [
    { id: "b1", phase: "behavioral", question: `Tell me about yourself and what draws you to ${role}.`, focus: "Motivation and career story", duration: 120 },
    { id: "b2", phase: "behavioral", question: `Walk me through a challenging situation related to ${resumeHint.toLowerCase()}. What did you do, and what changed?`, focus: "Problem solving and impact", duration: 150 },
    { id: "b3", phase: "behavioral", question: "Tell me about a time you received difficult feedback or disagreed with a teammate. How did you respond?", focus: "Collaboration and growth", duration: 150 },
    { id: "t1", phase: "technical", question: `Which technical skills from your experience are most relevant to ${role}, and how have you applied them?`, focus: "Relevant technical depth", duration: 180 },
    { id: "t2", phase: "technical", question: "Describe the architecture of a project you built. What tradeoffs did you make, and why?", focus: "Architecture and decisions", duration: 180 },
    { id: "t3", phase: "technical", question: "A feature you own becomes slow or unreliable in production. How would you investigate, fix, and verify it?", focus: "Debugging and verification", duration: 180 },
  ];
}
export function fallbackFeedback(question: string, answer: string): Feedback {
  const words = clean(answer).split(" ").filter(Boolean);
  const concrete = /\b(built|led|created|improved|reduced|increased|measured|shipped|designed|tested|resolved|implemented)\b/i.test(answer);
  const metric = /\b\d+[\d,.]*\s*(%|percent|hours?|days?|users?|clients?|ms|seconds?|people)?\b/i.test(answer);
  const reflective = /\b(learned|next time|in hindsight|would improve|feedback|result|outcome)\b/i.test(answer);
  let score = Math.min(92, Math.max(25, 35 + Math.min(30, words.length / 3) + (concrete ? 12 : 0) + (metric ? 8 : 0) + (reflective ? 7 : 0)));
  score = Math.round(score);
  const strengths = [words.length >= 35 ? "You gave enough context to understand your thinking." : "You started addressing the question directly.", ...(concrete ? ["You described specific actions you took."] : []), ...(reflective ? ["You included an outcome or reflection."] : [])];
  const improvements = [words.length < 45 ? "Add a concrete example with the situation, your action, and the result." : "Tighten your answer around the most relevant example.", ...(!metric ? ["Quantify the impact where you can."] : []), ...(!concrete ? ["Use clear action verbs to explain what you personally did."] : [])];
  return { score, strengths, improvements, summary: `Your answer to “${question}” ${words.length < 45 ? "needs more detail to show your experience" : "shows a useful foundation"}.`, tip: "Try the STAR structure: situation, task, action, result." };
}
