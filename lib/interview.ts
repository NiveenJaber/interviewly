export type Phase = "behavioral" | "technical";
export const codingGaps = ["arrays-hashmaps", "two-pointers", "sliding-window", "stacks", "binary-search", "trees", "graphs", "dynamic-programming"] as const;
export type CodingGap = typeof codingGaps[number];
export type Question = { id: string; phase: Phase; question: string; focus: string; duration: number; codingTopic?: CodingGap };
export type Feedback = { score: number; strengths: string[]; improvements: string[]; summary: string; tip: string; gapTags?: CodingGap[] };
const clean = (s: string) => s.replace(/\s+/g, " ").trim();
export function extractRole(job: string) { const heading = clean(job.split(/\r?\n|:/)[0] || ""); return heading.length >= 5 && heading.length <= 60 ? heading : "this role"; }
export function fallbackQuestions(job: string, resume: string): Question[] {
  const role = extractRole(job);
  const resumeHint = resume.split(/[\n.!]/).map(clean).find(x => x.length > 28 && x.length < 140) || "a project from your resume";
  return [
    { id: "b1", phase: "behavioral", question: `Tell me about yourself and what draws you to ${role}.`, focus: "Motivation and career story", duration: 120 },
    { id: "b2", phase: "behavioral", question: `Your resume mentions “${resumeHint}”. What challenge came up in that work, what did you do, and what changed?`, focus: "Problem solving and impact", duration: 150 },
    { id: "b3", phase: "behavioral", question: "Tell me about a time you received difficult feedback or disagreed with a teammate. How did you respond?", focus: "Collaboration and growth", duration: 150 },
    { id: "t1", phase: "technical", question: `Which technical skills from your experience are most relevant to ${role}, and how have you applied them?`, focus: "Relevant technical depth", duration: 180 },
    { id: "t2", phase: "technical", question: "Describe the architecture of a project you built. What tradeoffs did you make, and why?", focus: "Architecture and decisions", duration: 180 },
    { id: "t3", phase: "technical", question: "Given an array of numbers and a target value, how would you find two numbers that add up to the target? Explain your data structure, time complexity, and edge cases.", focus: "Coding and complexity", duration: 180, codingTopic: "arrays-hashmaps" },
  ];
}
export function fallbackFeedback(question: string, answer: string, codingTopic?: CodingGap): Feedback {
  const words = clean(answer).split(" ").filter(Boolean);
  const concrete = /\b(built|led|created|improved|reduced|increased|measured|shipped|designed|tested|resolved|implemented)\b/i.test(answer);
  const metric = /\b\d+[\d,.]*\s*(%|percent|hours?|days?|users?|clients?|ms|seconds?|people)?\b/i.test(answer);
  const reflective = /\b(learned|next time|in hindsight|would improve|feedback|result|outcome)\b/i.test(answer);
  const hasStructure = /\b(map|dictionary|hash table|hashmap|object)\b/i.test(answer);
  const hasComplexity = /\b(?:o\s*\([^)]*\)|linear\b|quadratic\b|time complexity\b)/i.test(answer);
  let score = Math.min(92, Math.max(25, 35 + Math.min(30, words.length / 3) + (concrete ? 12 : 0) + (metric ? 8 : 0) + (reflective ? 7 : 0)));
  score = Math.round(score);
  if (codingTopic) score = Math.max(20, Math.min(92, score + (hasStructure ? 7 : -12) + (hasComplexity ? 7 : -12)));
  const strengths = codingTopic ? [hasStructure ? "You named a useful data structure." : "You attempted the coding problem directly.", ...(hasComplexity ? ["You discussed complexity."] : [])] : [words.length >= 35 ? "You gave enough context to understand your thinking." : "You started addressing the question directly.", ...(concrete ? ["You described specific actions you took."] : []), ...(reflective ? ["You included an outcome or reflection."] : [])];
  const improvements = codingTopic ? [] : [words.length < 45 ? "Add a concrete example with the situation, your action, and the result." : "Tighten your answer around the most relevant example.", ...(!metric ? ["Quantify the impact where you can."] : []), ...(!concrete ? ["Use clear action verbs to explain what you personally did."] : [])];
  if (codingTopic) {
    if (!hasStructure) improvements.unshift("Name the data structure you would use and explain why it fits.");
    if (!hasComplexity) improvements.unshift("State the time and space complexity of your solution.");
    if (!improvements.length) improvements.push("Walk through an edge case and explain how you would test it.");
  }
  return { score, strengths, improvements, summary: codingTopic ? "Your coding explanation needs a clear approach, complexity, and edge cases." : `Your answer to “${question}” ${words.length < 45 ? "needs more detail to show your experience" : "shows a useful foundation"}.`, tip: codingTopic ? "Start with a simple solution, then explain how to improve it." : "Try the STAR structure: situation, task, action, result.", gapTags: codingTopic && (!hasStructure || !hasComplexity) ? [codingTopic] : [] };
}
