"use client";

import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { Search, ChevronRight, ArrowRight, Info } from "lucide-react";
import type { Worker, Status } from "@/types";
import { formatNaira } from "@/lib/sentinel-data";

const tabs: { key: "all" | Status; label: string; dot?: string }[] = [
  { key: "all", label: "All" },
  { key: "verified", label: "Verified", dot: "bg-primary" },
  { key: "review", label: "Review", dot: "bg-caution" },
  { key: "blocked", label: "Blocked", dot: "bg-destructive" },
];

function StatusPill({ s }: { s: Status }) {
  const map = {
    verified: { bg: "rgba(0,229,160,0.12)", color: "#00E5A0", label: "Verified" },
    review: { bg: "rgba(255,182,40,0.12)", color: "#FFB628", label: "Review" },
    blocked: { bg: "rgba(255,76,110,0.12)", color: "#FF4C6E", label: "Blocked" },
  }[s];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.18em]"
      style={{ background: map.bg, color: map.color, border: `1px solid ${map.color}22` }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: map.color }}
      />
      {map.label}
    </span>
  );
}

function ScoreCell({
  score,
  status,
  pulse,
}: {
  score: number;
  status: Status;
  pulse: boolean;
}) {
  const cls =
    status === "verified"
      ? "text-primary"
      : status === "review"
        ? "text-caution"
        : "text-destructive";
  return (
    <span
      className={`text-mono text-lg font-semibold ${cls} ${pulse ? "inline-block" : ""}`}
    >
      {score}
    </span>
  );
}

interface Props {
  workers: Worker[];
  reviewedIds: Set<string>;
  onSelect: (w: Worker) => void;
  onProcess: () => void;
}

export function ResultsTable({ workers, reviewedIds, onSelect, onProcess }: Props) {
  const [tab, setTab] = useState<"all" | Status>("all");
  const [q, setQ] = useState("");

  const counts = useMemo(
    () => ({
      all: workers.length,
      verified: workers.filter((w) => w.status === "verified").length,
      review: workers.filter((w) => w.status === "review").length,
      blocked: workers.filter((w) => w.status === "blocked").length,
    }),
    [workers],
  );

  const filtered = useMemo(
    () =>
      workers.filter((w) => {
        if (tab !== "all" && w.status !== tab) return false;
        if (
          q &&
          !`${w.name} ${w.id} ${w.department}`.toLowerCase().includes(q.toLowerCase())
        )
          return false;
        return true;
      }),
    [workers, tab, q],
  );

  const flaggedCount = counts.review + counts.blocked;
  const canProcess = reviewedIds.size > 0 || flaggedCount === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="glass overflow-hidden"
    >
      {/* toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4 p-4 sm:p-5 border-b border-white/5">
        <div
          className="flex items-center gap-2 p-1 rounded-2xl overflow-x-auto"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3.5 h-9 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition ${tab === t.key ? "bg-white/10 text-text-primary" : "text-text-secondary hover:text-text-primary"}`}
            >
              {t.dot && <span className={`w-1.5 h-1.5 rounded-full ${t.dot}`} />}
              {t.label}
              <span className="text-mono text-text-tertiary">{counts[t.key]}</span>
            </button>
          ))}
        </div>
        <div className="flex-1 lg:min-w-[220px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, ID, department"
            className="w-full h-10 pl-10 pr-4 rounded-2xl text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:ring-2 focus:ring-primary/20"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          />
        </div>
        <div className="relative group w-full lg:w-auto">
          <button
            disabled={!canProcess}
            onClick={onProcess}
            className={`h-10 px-5 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold transition w-full lg:w-auto ${canProcess ? "text-primary" : "text-text-tertiary cursor-not-allowed"}`}
            style={{
              background: canProcess ? "rgba(0,229,160,0.12)" : "rgba(255,255,255,0.05)",
              border: `1px solid ${canProcess ? "rgba(0,229,160,0.22)" : "rgba(255,255,255,0.08)"}`,
            }}
          >
            Process payroll <ArrowRight className="w-4 h-4" />
          </button>
          {!canProcess && (
            <div className="absolute right-0 top-full mt-2 w-64 p-3 glass-strong text-xs text-text-secondary opacity-0 group-hover:opacity-100 pointer-events-none transition z-10">
              <Info className="w-3.5 h-3.5 inline mr-1.5 text-caution" />
              Review at least one flagged worker before processing payroll.
            </div>
          )}
        </div>
      </div>

      {/* mobile card list */}
      <div className="sm:hidden divide-y divide-white/[0.04]">
        {filtered.map((w) => (
          <button
            key={w.id}
            onClick={() => onSelect(w)}
            className="w-full text-left p-4 hover:bg-white/[0.04] transition-colors"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="min-w-0">
                <div className="text-text-primary text-sm font-medium truncate">{w.name}</div>
                <div className="text-mono text-[11px] text-text-tertiary mt-0.5">
                  {w.id} · {w.department}
                </div>
              </div>
              <ScoreCell score={w.score} status={w.status} pulse={false} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <StatusPill s={w.status} />
              <span className="text-mono text-sm text-text-primary whitespace-nowrap">
                {formatNaira(w.salary)}
              </span>
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="py-12 text-center text-text-tertiary text-sm">
            No records match your filters.
          </div>
        )}
      </div>

      {/* table (sm and up) */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full min-w-[820px]">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-[0.14em] text-text-tertiary">
              <th className="px-6 py-3 font-medium min-w-[110px]">Worker ID</th>
              <th className="py-3 font-medium min-w-[160px]">Full Name</th>
              <th className="py-3 font-medium min-w-[120px]">Department</th>
              <th className="py-3 font-medium text-right min-w-[140px]">Monthly Salary</th>
              <th className="py-3 font-medium text-right min-w-[110px]">Trust Score</th>
              <th className="py-3 font-medium min-w-[110px]">Status</th>
              <th className="py-3 pr-6 font-medium min-w-[80px]" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((w, i) => (
              <motion.tr
                key={w.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                onClick={() => onSelect(w)}
                className="border-t border-white/[0.04] hover:bg-white/[0.04] cursor-pointer transition-colors group"
                style={{ background: i % 2 ? "rgba(255,255,255,0.01)" : "transparent" }}
              >
                <td className="px-6 py-4 text-mono text-sm text-text-secondary whitespace-nowrap">
                  {w.id}
                </td>
                <td className="py-4 text-text-primary text-sm font-medium whitespace-nowrap">
                  {w.name}
                </td>
                <td className="py-4 text-text-secondary text-sm whitespace-nowrap">
                  {w.department}
                </td>
                <td className="py-4 text-right text-mono text-sm text-text-primary whitespace-nowrap pr-2">
                  {formatNaira(w.salary)}
                </td>
                <td className="py-4 text-right pr-2 whitespace-nowrap">
                  <ScoreCell score={w.score} status={w.status} pulse={i < 8} />
                </td>
                <td className="py-4 whitespace-nowrap">
                  <StatusPill s={w.status} />
                </td>
                <td className="py-4 pr-6 text-right whitespace-nowrap">
                  <span className="inline-flex items-center gap-1 text-xs text-text-tertiary group-hover:text-primary transition">
                    View <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </td>
              </motion.tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-text-tertiary text-sm">
                  No records match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
