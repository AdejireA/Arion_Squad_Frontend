"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Clock3, Banknote, FileText, Upload, ArrowRight, ChevronRight } from "lucide-react";
import type { Worker } from "@/types";
import { fetchUploadHistory, type UploadHistoryItem } from "@/lib/api";
import { formatNaira } from "@/lib/sentinel-data";

function fullDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-slate-200 ${className}`} />;
}

interface Props {
  workers: Worker[];
  uploadId: string;
  onProcessPayroll: () => void;
  onNewUpload: () => void;
}

const STATUS_CONFIG = {
  verified: { label: "Approved", color: "#16a34a", bg: "bg-green-50", border: "border-green-100", text: "text-green-700", dot: "bg-green-500" },
  review:   { label: "Review",   color: "#d97706", bg: "bg-amber-50",  border: "border-amber-100",  text: "text-amber-700",  dot: "bg-amber-400"  },
  blocked:  { label: "Blocked",  color: "#dc2626", bg: "bg-red-50",    border: "border-red-100",    text: "text-red-700",    dot: "bg-red-500"    },
} as const;

export function PayrollView({ workers, uploadId, onProcessPayroll, onNewUpload }: Props) {
  const [history, setHistory] = useState<UploadHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [activeTab, setActiveTab] = useState<"verified" | "review" | "blocked">("verified");

  useEffect(() => {
    fetchUploadHistory()
      .then(setHistory)
      .catch(() => {})
      .finally(() => setLoadingHistory(false));
  }, []);

  const hasWorkers = workers.length > 0;

  const verified = workers.filter((w) => w.status === "verified");
  const review   = workers.filter((w) => w.status === "review");
  const blocked  = workers.filter((w) => w.status === "blocked");

  const totalPayroll     = workers.reduce((s, w) => s + w.salary, 0);
  const payrollReady     = verified.reduce((s, w) => s + w.salary, 0);
  const amountBlocked    = blocked.reduce((s, w) => s + w.salary, 0);

  const verifiedPct = workers.length ? Math.round((verified.length / workers.length) * 100) : 0;
  const reviewPct   = workers.length ? Math.round((review.length   / workers.length) * 100) : 0;
  const blockedPct  = workers.length ? Math.round((blocked.length  / workers.length) * 100) : 0;

  const tabWorkers = activeTab === "verified" ? verified : activeTab === "review" ? review : blocked;

  return (
    <div className="space-y-6">

      {/* ── header ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-3"
      >
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Payroll Processing</h2>
          <p className="text-xs text-text-tertiary mt-0.5">
            Review payment outcomes and manage payroll runs
          </p>
        </div>
        {hasWorkers && (
          <button
            onClick={onProcessPayroll}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-secondary text-white text-sm font-medium hover:bg-secondary/90 transition-colors"
          >
            <Banknote className="w-3.5 h-3.5" />
            Process Payroll
          </button>
        )}
      </motion.div>

      {/* ── current upload ─────────────────────────────────────── */}
      {hasWorkers ? (
        <>
          {/* summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Ready to Pay",  value: verified.length, sub: formatNaira(payrollReady),  icon: CheckCircle2, color: "text-green-600",  bg: "bg-green-50",  border: "border-green-100" },
              { label: "Blocked",       value: blocked.length,  sub: formatNaira(amountBlocked), icon: XCircle,      color: "text-red-500",    bg: "bg-red-50",    border: "border-red-100"   },
              { label: "Under Review",  value: review.length,   sub: `${review.length} pending`, icon: Clock3,       color: "text-amber-500",  bg: "bg-amber-50",  border: "border-amber-100" },
              { label: "Total Payroll", value: null,            sub: formatNaira(totalPayroll),  icon: Banknote,     color: "text-secondary",  bg: "bg-secondary/8", border: "border-secondary/15" },
            ].map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className={`bg-white border ${card.border} rounded-2xl p-5`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] uppercase tracking-[0.14em] text-text-tertiary font-medium">
                    {card.label}
                  </span>
                  <div className={`w-7 h-7 rounded-lg ${card.bg} flex items-center justify-center`}>
                    <card.icon className={`w-3.5 h-3.5 ${card.color}`} />
                  </div>
                </div>
                {card.value !== null && (
                  <div className="text-2xl font-semibold text-mono text-text-primary mb-0.5">
                    {card.value.toLocaleString()}
                  </div>
                )}
                <div className={`text-xs font-medium ${card.value !== null ? "text-text-tertiary" : `text-lg font-semibold text-mono ${card.color}`}`}>
                  {card.sub}
                </div>
              </motion.div>
            ))}
          </div>

          {/* status breakdown bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.26 }}
            className="bg-white border border-slate-200 rounded-2xl p-5"
          >
            <p className="text-xs font-medium text-text-tertiary uppercase tracking-[0.12em] mb-4">
              Payroll breakdown — {workers.length.toLocaleString()} workers
            </p>
            <div className="flex h-3 rounded-full overflow-hidden gap-px mb-4">
              {verifiedPct > 0 && <div className="bg-green-500 transition-all" style={{ width: `${verifiedPct}%` }} />}
              {reviewPct   > 0 && <div className="bg-amber-400 transition-all" style={{ width: `${reviewPct}%` }}   />}
              {blockedPct  > 0 && <div className="bg-red-500 transition-all"   style={{ width: `${blockedPct}%` }}  />}
            </div>
            <div className="flex flex-wrap gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-text-secondary">
                <span className="w-2 h-2 rounded-full bg-green-500" /> Approved {verifiedPct}% · {verified.length}
              </span>
              <span className="flex items-center gap-1.5 text-text-secondary">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> Review {reviewPct}% · {review.length}
              </span>
              <span className="flex items-center gap-1.5 text-text-secondary">
                <span className="w-2 h-2 rounded-full bg-red-500" /> Blocked {blockedPct}% · {blocked.length}
              </span>
            </div>
          </motion.div>

          {/* worker table with tabs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32 }}
            className="bg-white border border-slate-200 rounded-2xl overflow-hidden"
          >
            {/* tabs */}
            <div className="flex border-b border-slate-100 px-1 pt-1">
              {(["verified", "review", "blocked"] as const).map((tab) => {
                const counts = { verified: verified.length, review: review.length, blocked: blocked.length };
                const cfg = STATUS_CONFIG[tab];
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium rounded-t-lg transition-colors ${
                      activeTab === tab
                        ? "bg-slate-50 text-text-primary border-b-2 border-secondary -mb-px"
                        : "text-text-tertiary hover:text-text-secondary"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                    <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === tab ? cfg.bg + " " + cfg.text : "bg-slate-100 text-text-tertiary"}`}>
                      {counts[tab]}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* table */}
            {tabWorkers.length === 0 ? (
              <div className="py-12 text-center text-text-tertiary text-sm">No workers in this category</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-[0.12em] text-text-tertiary text-left bg-slate-50/60">
                      <th className="px-5 py-3 font-medium">Name</th>
                      <th className="px-4 py-3 font-medium">Department</th>
                      <th className="px-4 py-3 font-medium text-right">Salary</th>
                      <th className="px-4 py-3 font-medium text-right">Trust Score</th>
                      <th className="px-4 py-3 font-medium text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tabWorkers.slice(0, 50).map((w) => {
                      const cfg = STATUS_CONFIG[w.status];
                      return (
                        <tr key={w.id} className="border-t border-slate-100 hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-3 font-medium text-text-primary text-xs">{w.name}</td>
                          <td className="px-4 py-3 text-text-secondary text-xs">{w.department}</td>
                          <td className="px-4 py-3 text-right text-mono text-xs text-text-primary">{formatNaira(w.salary)}</td>
                          <td className="px-4 py-3 text-right text-mono text-xs">
                            <span className={w.score >= 70 ? "text-green-600" : w.score >= 50 ? "text-amber-500" : "text-red-500"}>
                              {w.score}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
                              <span className={`w-1 h-1 rounded-full ${cfg.dot}`} />
                              {cfg.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {tabWorkers.length > 50 && (
                      <tr>
                        <td colSpan={5} className="px-5 py-3 text-xs text-text-tertiary text-center border-t border-slate-100">
                          + {tabWorkers.length - 50} more workers — use Verifications view for full list
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </>
      ) : (
        /* no current session */
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-2xl p-12 text-center"
        >
          <Banknote className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-text-secondary">No active payroll session</p>
          <p className="text-xs text-text-tertiary mt-1 mb-5">Upload a payroll file to see payment outcomes here.</p>
          <button
            onClick={onNewUpload}
            className="flex items-center gap-1.5 mx-auto px-4 py-2 rounded-lg bg-secondary text-white text-sm font-medium hover:bg-secondary/90 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload payroll
          </button>
        </motion.div>
      )}

      {/* ── payroll run history ────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.38 }}
        className="bg-white border border-slate-200 rounded-2xl overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <p className="text-sm font-semibold text-text-primary">Payroll Run History</p>
          <span className="text-xs text-text-tertiary">{loadingHistory ? "…" : `${history.length} runs`}</span>
        </div>

        {loadingHistory ? (
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="px-5 py-4 flex items-center gap-4">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-1/3" />
                  <Skeleton className="h-2.5 w-1/4" />
                </div>
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="py-10 text-center text-text-tertiary text-sm">No payroll runs yet</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {history.map((item, i) => {
              const isCurrent = item.id === uploadId;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.42 + i * 0.04 }}
                  className={`px-5 py-4 flex items-center gap-4 transition-colors ${isCurrent ? "bg-secondary/5" : "hover:bg-slate-50/60"}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isCurrent ? "bg-secondary/15" : "bg-slate-100"}`}>
                    <FileText className={`w-3.5 h-3.5 ${isCurrent ? "text-secondary" : "text-text-tertiary"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium truncate ${isCurrent ? "text-secondary" : "text-text-primary"}`}>
                      {item.filename}
                      {isCurrent && <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider text-secondary">(current)</span>}
                    </p>
                    <p className="text-[10px] text-text-tertiary mt-0.5">
                      {item.row_count.toLocaleString()} workers · {fullDate(item.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-text-tertiary hidden sm:block">{timeAgo(item.created_at)}</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-100 text-[10px] font-semibold uppercase tracking-wide">
                      <span className="w-1 h-1 rounded-full bg-green-500" />
                      Processed
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

    </div>
  );
}
