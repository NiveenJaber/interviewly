export type Phase = "behavioral" | "technical";
export const codingGaps = ["arrays-hashmaps", "two-pointers", "sliding-window", "stacks", "binary-search", "trees", "graphs", "dynamic-programming"] as const;
export type CodingGap = typeof codingGaps[number];
export type Question = { id: string; phase: Phase; question: string; focus: string; duration: number; codingTopic?: CodingGap };
export type Feedback = { score: number; strengths: string[]; improvements: string[]; summary: string; tip: string; gapTags?: CodingGap[] };
