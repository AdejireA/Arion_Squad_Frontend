"use client";

import type { Worker } from "@/types";
import { formatNaira } from "@/lib/sentinel-data";

interface DeptRow {
  department: string;
  total: number;
  blocked: number;
  review: number;
  atRisk: number;
}

function buildRows(workers: Worker[]): DeptRow[] {
  const map = new Map<string, DeptRow>();
  for (const w of workers) {
    const row = map.get(w.department) ?? {
      department: w.department,
      total: 0,
      blocked: 0,
      review: 0,
      atRisk: 0,
    };
    row.total += 1;
    if (w.status === "blocked") { row.blocked += 1; row.atRisk += w.salary; }
    if (w.status === "review") { row.review += 1; row.atRisk += w.salary; }
    map.set(w.department, row);
  }
  return Array.from(map.values()).sort((a, b) => b.blocked - a.blocked);
}

export function DepartmentSummary({ workers }: { workers: Worker[] }) {
  const rows = buildRows(workers);
  if (rows.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-xs uppercase tracking-[0.14em] text-text-tertiary font-medium mb-3">
        Department Risk Summary
      </h2>
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: "1px solid rgba(255,255,255,0.04)" }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr
              className="text-[10px] uppercase tracking-[0.14em] text-text-tertiary text-left"
              style={{ background: "rgba(255,255,255,0.02)" }}
            >
              <th className="px-4 py-3 font-medium">Department</th>
              <th className="px-4 py-3 font-medium text-right">Workers</th>
              <th className="px-4 py-3 font-medium text-right">Blocked</th>
              <th className="px-4 py-3 font-medium text-right">Review</th>
              <th className="px-4 py-3 font-medium text-right">Salary at Risk</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.department}
                className="border-t"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  borderColor: "rgba(255,255,255,0.04)",
                }}
              >
                <td className="px-4 py-3 text-text-primary font-medium">{r.department}</td>
                <td className="px-4 py-3 text-right text-mono text-text-secondary">{r.total}</td>
                <td className="px-4 py-3 text-right text-mono font-medium" style={{ color: r.blocked ? "#FF4C6E" : "inherit" }}>
                  {r.blocked || <span className="text-text-tertiary">—</span>}
                </td>
                <td className="px-4 py-3 text-right text-mono font-medium" style={{ color: r.review ? "#FFB628" : "inherit" }}>
                  {r.review || <span className="text-text-tertiary">—</span>}
                </td>
                <td className="px-4 py-3 text-right text-mono text-text-primary">
                  {r.atRisk > 0 ? formatNaira(r.atRisk) : <span className="text-text-tertiary">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
