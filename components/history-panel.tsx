"use client";
import { ArrowRight, Clock3, Trash2 } from "lucide-react";
import type { SavedSession } from "@/lib/history";

type Props = { sessions: SavedSession[]; enabled: boolean; onToggle: (enabled: boolean) => void; onOpen: (session: SavedSession) => void; onDelete: (id: string) => void };

export default function HistoryPanel({ sessions, enabled, onToggle, onOpen, onDelete }: Props) {
  return <section className="history-panel" aria-label="Practice history">
    <div className="history-head"><div><span className="mini-label">YOUR PRACTICE HISTORY</span><h2>See your progress.</h2><p>Completed sessions can be saved on this device. Your resume is never stored here.</p></div><label className="history-save"><input type="checkbox" checked={enabled} onChange={event => onToggle(event.target.checked)}/> Save future sessions</label></div>
    {sessions.length ? <div className="history-list">{sessions.map(session => <div className="history-row" key={session.id}><span className="history-icon"><Clock3 size={18}/></span><div><strong>{new Date(session.completedAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}</strong><small>{session.answers.length} answers · average {session.score}/100</small></div><button className="history-open" onClick={() => onOpen(session)}>View report <ArrowRight size={16}/></button><button className="history-delete" aria-label="Delete saved session" title="Delete saved session" onClick={() => onDelete(session.id)}><Trash2 size={16}/></button></div>)}</div> : <p className="history-empty">No completed sessions saved yet. Turn on saving, finish an interview, and your report will appear here.</p>}
  </section>;
}
