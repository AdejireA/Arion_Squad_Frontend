import type { Worker } from "@/types";

export const formatNaira = (n: number) => "₦" + n.toLocaleString("en-NG");

export function departmentAverages(
  workers: Worker[],
): Record<string, { salary: number; score: number }> {
  const groups: Record<string, { sumSalary: number; sumScore: number; n: number }> = {};
  for (const w of workers) {
    const g = (groups[w.department] ??= { sumSalary: 0, sumScore: 0, n: 0 });
    g.sumSalary += w.salary;
    g.sumScore += w.score;
    g.n += 1;
  }
  const out: Record<string, { salary: number; score: number }> = {};
  for (const k in groups) {
    out[k] = {
      salary: Math.round(groups[k].sumSalary / groups[k].n),
      score: Math.round(groups[k].sumScore / groups[k].n),
    };
  }
  return out;
}
