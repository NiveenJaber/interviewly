import type { Feedback, Question } from "./interview";

export type Answer = { question: Question; text: string; feedback: Feedback };
export type SavedSession = { id: string; completedAt: string; answers: Answer[]; score: number };
const HISTORY_KEY = "interviewly-history-v1";
const SETTING_KEY = "interviewly-save-history-v1";

export function loadHistory(): SavedSession[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is SavedSession => !!item && typeof item.id === "string" && typeof item.completedAt === "string" && Array.isArray(item.answers) && typeof item.score === "number").slice(0, 20);
  } catch { return []; }
}

export function historyEnabled() {
  try { return localStorage.getItem(SETTING_KEY) === "true"; } catch { return false; }
}

export function setHistoryEnabled(enabled: boolean) {
  try { localStorage.setItem(SETTING_KEY, String(enabled)); return true; } catch { return false; }
}

export function writeHistory(sessions: SavedSession[]) {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(sessions.slice(0, 20))); return true; } catch { return false; }
}
