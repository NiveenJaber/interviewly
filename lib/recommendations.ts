import type { Answer } from "./history";
import type { CodingGap } from "./interview";

export type Recommendation = { title: string; url: string; difficulty: "Easy" | "Medium"; topic: string; reason: string };
type Problem = Omit<Recommendation, "topic" | "reason">;

const catalog: Record<CodingGap, { label: string; problems: Problem[] }> = {
  "arrays-hashmaps": { label: "arrays and hash maps", problems: [
    { title: "Contains Duplicate", url: "https://leetcode.com/problems/contains-duplicate/", difficulty: "Easy" },
    { title: "Two Sum", url: "https://leetcode.com/problems/two-sum/", difficulty: "Easy" },
  ] },
  "two-pointers": { label: "two pointers", problems: [
    { title: "Valid Palindrome", url: "https://leetcode.com/problems/valid-palindrome/", difficulty: "Easy" },
    { title: "Two Sum II — Input Array Is Sorted", url: "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/", difficulty: "Medium" },
  ] },
  "sliding-window": { label: "sliding windows", problems: [
    { title: "Longest Substring Without Repeating Characters", url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/", difficulty: "Medium" },
    { title: "Permutation in String", url: "https://leetcode.com/problems/permutation-in-string/", difficulty: "Medium" },
  ] },
  stacks: { label: "stacks", problems: [
    { title: "Valid Parentheses", url: "https://leetcode.com/problems/valid-parentheses/", difficulty: "Easy" },
    { title: "Daily Temperatures", url: "https://leetcode.com/problems/daily-temperatures/", difficulty: "Medium" },
  ] },
  "binary-search": { label: "binary search", problems: [
    { title: "Binary Search", url: "https://leetcode.com/problems/binary-search/", difficulty: "Easy" },
    { title: "Search in Rotated Sorted Array", url: "https://leetcode.com/problems/search-in-rotated-sorted-array/", difficulty: "Medium" },
  ] },
  trees: { label: "trees", problems: [
    { title: "Maximum Depth of Binary Tree", url: "https://leetcode.com/problems/maximum-depth-of-binary-tree/", difficulty: "Easy" },
    { title: "Binary Tree Level Order Traversal", url: "https://leetcode.com/problems/binary-tree-level-order-traversal/", difficulty: "Medium" },
  ] },
  graphs: { label: "graphs", problems: [
    { title: "Number of Islands", url: "https://leetcode.com/problems/number-of-islands/", difficulty: "Medium" },
    { title: "Clone Graph", url: "https://leetcode.com/problems/clone-graph/", difficulty: "Medium" },
  ] },
  "dynamic-programming": { label: "dynamic programming", problems: [
    { title: "Climbing Stairs", url: "https://leetcode.com/problems/climbing-stairs/", difficulty: "Easy" },
    { title: "Coin Change", url: "https://leetcode.com/problems/coin-change/", difficulty: "Medium" },
  ] },
};

export function recommendationsFor(answers: Answer[]): Recommendation[] {
  const gaps = new Map<CodingGap, { score: number; focus: string }>();
  for (const answer of answers) {
    if (answer.question.phase !== "technical" || !answer.question.codingTopic) continue;
    for (const tag of answer.feedback.gapTags || []) {
      if (!(tag in catalog)) continue;
      const previous = gaps.get(tag);
      if (!previous || answer.feedback.score < previous.score) gaps.set(tag, { score: answer.feedback.score, focus: answer.question.focus });
    }
  }
  return [...gaps.entries()].sort((a, b) => a[1].score - b[1].score).flatMap(([tag, evidence]) =>
    catalog[tag].problems.map(problem => ({ ...problem, topic: catalog[tag].label, reason: `Suggested from your ${evidence.focus.toLowerCase()} answer.` })),
  ).slice(0, 4);
}
