import type { Status, Worker } from "@/types";

export type { Status, Worker };

export const WORKERS: Worker[] = [
  // Verified (12)
  { id: "OG-10428", name: "Adebayo Oladele", department: "Health", salary: 185000, score: 96, status: "verified", reasons: [] },
  { id: "OG-10431", name: "Ngozi Okonkwo", department: "Education", salary: 142000, score: 94, status: "verified", reasons: [] },
  { id: "OG-10455", name: "Ibrahim Suleiman", department: "Public Works", salary: 210000, score: 91, status: "verified", reasons: [] },
  { id: "OG-10472", name: "Funmilayo Adeyemi", department: "Finance", salary: 320000, score: 98, status: "verified", reasons: [] },
  { id: "OG-10489", name: "Chukwuemeka Eze", department: "Agriculture", salary: 128000, score: 88, status: "verified", reasons: [] },
  { id: "OG-10501", name: "Aisha Mohammed", department: "Health", salary: 165000, score: 92, status: "verified", reasons: [] },
  { id: "OG-10518", name: "Olusegun Bakare", department: "Education", salary: 98000, score: 85, status: "verified", reasons: [] },
  { id: "OG-10524", name: "Hauwa Yusuf", department: "Finance", salary: 245000, score: 90, status: "verified", reasons: [] },
  { id: "OG-10537", name: "Tunde Afolabi", department: "Public Works", salary: 178000, score: 87, status: "verified", reasons: [] },
  { id: "OG-10549", name: "Chiamaka Nwosu", department: "Health", salary: 152000, score: 93, status: "verified", reasons: [] },
  { id: "OG-10562", name: "Musa Abdullahi", department: "Agriculture", salary: 112000, score: 78, status: "verified", reasons: [] },
  { id: "OG-10578", name: "Yetunde Akinola", department: "Education", salary: 138000, score: 82, status: "verified", reasons: [] },
  // Review (5)
  { id: "OG-10593", name: "Emeka Onyekachi", department: "Public Works", salary: 295000, score: 68, status: "review",
    reasons: [{ label: "Salary Exceeds Grade Level", severity: "medium" }, { label: "Recent Bank Account Change", severity: "medium" }] },
  { id: "OG-10604", name: "Fatima Bello", department: "Finance", salary: 188000, score: 61, status: "review",
    reasons: [{ label: "Irregular Attendance Pattern", severity: "medium" }, { label: "Address Mismatch on File", severity: "medium" }] },
  { id: "OG-10617", name: "Olamide Sanni", department: "Health", salary: 245000, score: 55, status: "review",
    reasons: [{ label: "Salary Exceeds Grade Level", severity: "medium" }, { label: "Missing Tax ID", severity: "medium" }] },
  { id: "OG-10629", name: "Sani Garba", department: "Agriculture", salary: 155000, score: 72, status: "review",
    reasons: [{ label: "Recent Bank Account Change", severity: "medium" }] },
  { id: "OG-10642", name: "Bisi Ogundimu", department: "Education", salary: 198000, score: 64, status: "review",
    reasons: [{ label: "Salary Exceeds Grade Level", severity: "medium" }, { label: "Irregular Attendance Pattern", severity: "medium" }] },
  // Blocked (3)
  { id: "OG-10658", name: "Kunle Adeniyi", department: "Public Works", salary: 425000, score: 22, status: "blocked",
    reasons: [{ label: "Duplicate BVN Detected", severity: "high" }, { label: "No Attendance — 3+ Months", severity: "high" }, { label: "Salary Exceeds Grade Level", severity: "high" }] },
  { id: "OG-10671", name: "Amaka Ifeanyi", department: "Finance", salary: 388000, score: 35, status: "blocked",
    reasons: [{ label: "Duplicate BVN Detected", severity: "high" }, { label: "Ghost Worker Pattern Match", severity: "high" }] },
  { id: "OG-10684", name: "Yakubu Danladi", department: "Health", salary: 412000, score: 18, status: "blocked",
    reasons: [{ label: "No Attendance — 3+ Months", severity: "high" }, { label: "Duplicate Account Number", severity: "high" }, { label: "Ghost Worker Pattern Match", severity: "high" }] },
];

export const formatNaira = (n: number) => "₦" + n.toLocaleString("en-NG");

export const departmentAverages = (() => {
  const groups: Record<string, { sumSalary: number; sumScore: number; n: number }> = {};
  for (const w of WORKERS) {
    const g = (groups[w.department] ||= { sumSalary: 0, sumScore: 0, n: 0 });
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
})();
