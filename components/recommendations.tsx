"use client";
import { ArrowUpRight, BookOpen } from "lucide-react";
import type { Answer } from "@/lib/history";
import { recommendationsFor } from "@/lib/recommendations";

export default function Recommendations({ answers }: { answers: Answer[] }) {
  const recommendations = recommendationsFor(answers);
  return <section className="report-section" aria-label="LeetCode practice recommendations">
    <span className="mini-label">YOUR NEXT PRACTICE</span><h3>LeetCode for your coding gaps.</h3>
    {recommendations.length ? <><p className="recommendation-intro">These problems match patterns your coding answers could strengthen. Start with the easier question in each topic, then try the next one.</p><div className="recommendation-list">{recommendations.map(problem => <a key={problem.url} href={problem.url} target="_blank" rel="noopener noreferrer" className="recommendation-card"><span className="recommendation-icon"><BookOpen size={18}/></span><span className="recommendation-copy"><strong>{problem.title}</strong><small>{problem.topic} · {problem.difficulty}</small><small>{problem.reason}</small></span><ArrowUpRight size={18}/></a>)}</div></> : <p className="recommendation-intro">No coding pattern gap was identified in this session. Try the coding question again to get targeted practice links.</p>}
  </section>;
}
