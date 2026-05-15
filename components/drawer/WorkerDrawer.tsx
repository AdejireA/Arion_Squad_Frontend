"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, ShieldAlert } from "lucide-react";
import type { Worker } from "@/types";
import { formatNaira } from "@/lib/sentinel-data";

function Gauge({ score, status }: { score: number; status: Worker["status"] }) {
  const color =
    status === "verified" ? "#00E5A0" : status === "review" ? "#FFB628" : "#FF4C6E";
  const r = 80;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  return (
    <div className="relative w-[200px] h-[200px] mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
        <circle
          cx="100"
          cy="100"
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="10"
        />
        <motion.circle
          cx="100"
          cy="100"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          style={{ filter: `drop-shadow(0 0 8px ${color}99)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div
          className="text-mono text-5xl font-medium"
          style={{ color, textShadow: `0 0 24px ${color}66` }}
        >
          {score}
        </div>
        <div className="text-[10px] uppercase tracking-[0.2em] text-text-tertiary mt-1">
          Trust Score
        </div>
      </div>
    </div>
  );
}

export function WorkerDrawer({
  worker,
  onClose,
  onAction,
  decided,
  averages,
}: {
  worker: Worker | null;
  onClose: () => void;
  onAction: (id: string, action: "approve" | "block") => void;
  decided: Map<string, "approve" | "block">;
  averages: Record<string, { salary: number; score: number }>;
}) {
  return (
    <AnimatePresence>
      {worker && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-0 top-0 h-screen w-full sm:w-[480px] z-50 overflow-y-auto"
            style={{
              background: "rgba(13,17,23,0.92)",
              backdropFilter: "blur(32px)",
              borderLeft: "1px solid rgba(255,255,255,0.06)",
              boxShadow: "-40px 0 80px rgba(0,0,0,0.4)",
            }}
          >
            <div className="p-5 sm:p-7 pb-24 sm:pb-7">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl text-text-primary">{worker.name}</h2>
                  <div className="text-text-secondary text-sm mt-1">
                    {worker.department} Department
                  </div>
                  <div className="text-mono text-xs text-text-tertiary mt-1">{worker.id}</div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/5 text-text-secondary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="glass p-6 mb-6">
                <Gauge score={worker.score} status={worker.status} />
                {worker.reasons.length > 0 && (
                  <div className="mt-6">
                    <p className="text-xs uppercase tracking-widest text-text-tertiary mb-3">
                      Score Drivers
                    </p>
                    <div className="space-y-2">
                      {worker.reasons.map((r, i) => {
                        const weight = Math.round(100 / worker.reasons.length);
                        return (
                          <div key={i} className="flex items-center gap-3">
                            <span className="text-xs text-text-secondary w-44 truncate">
                              {r.label}
                            </span>
                            <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${weight}%` }}
                                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                                className="h-full rounded-full"
                                style={{ background: r.severity === "high" ? "#FF4C6E" : "#EF9F27" }}
                              />
                            </div>
                            <span className="text-xs text-mono text-text-tertiary w-8 text-right">
                              {weight}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <h3 className="text-xs uppercase tracking-[0.14em] text-text-tertiary mb-3">
                  Risk Indicators
                </h3>
                {worker.reasons.length === 0 ? (
                  <div className="glass p-4 flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    <span className="text-sm text-text-secondary">
                      No risk indicators detected. Worker passes all integrity checks.
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {worker.reasons.map((r) => {
                      const c = r.severity === "high" ? "#FF4C6E" : "#FFB628";
                      return (
                        <div
                          key={r.label}
                          className="flex items-center gap-3 p-3 rounded-lg"
                          style={{
                            background: "rgba(255,255,255,0.02)",
                            border: "1px solid rgba(255,255,255,0.04)",
                            borderLeftWidth: 3,
                            borderLeftColor: c,
                          }}
                        >
                          <ShieldAlert className="w-4 h-4 shrink-0" style={{ color: c }} />
                          <span className="text-sm text-text-primary">{r.label}</span>
                          <span
                            className="ml-auto text-[10px] uppercase tracking-wider text-mono"
                            style={{ color: c }}
                          >
                            {r.severity}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="mb-6">
                <h3 className="text-xs uppercase tracking-[0.14em] text-text-tertiary mb-3">
                  Worker vs. Department Average
                </h3>
                <Compare
                  label="Monthly Salary"
                  value={worker.salary}
                  avg={averages[worker.department]?.salary ?? 0}
                  format={formatNaira}
                />
                <Compare
                  label="Trust Score"
                  value={worker.score}
                  avg={averages[worker.department]?.score ?? 0}
                  format={(n) => String(n)}
                />
              </div>

              {worker.status !== "verified" && (
                <div className="flex gap-3">
                  {decided.get(worker.id) === "approve" ? (
                    <div
                      className="flex-1 h-11 rounded-lg flex items-center justify-center text-sm text-primary text-mono uppercase tracking-wider"
                      style={{
                        background: "rgba(0,229,160,0.08)",
                        border: "1px solid rgba(0,229,160,0.3)",
                      }}
                    >
                      ✓ Approved
                    </div>
                  ) : decided.get(worker.id) === "block" ? (
                    <div
                      className="flex-1 h-11 rounded-lg flex items-center justify-center text-sm text-destructive text-mono uppercase tracking-wider"
                      style={{
                        background: "rgba(255,76,110,0.08)",
                        border: "1px solid rgba(255,76,110,0.3)",
                      }}
                    >
                      ✕ Blocked
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => onAction(worker.id, "approve")}
                        className="flex-1 h-11 rounded-lg text-sm font-medium text-primary transition hover:bg-primary/10"
                        style={{
                          background: "rgba(0,229,160,0.04)",
                          border: "1px solid rgba(0,229,160,0.4)",
                        }}
                      >
                        Override — Approve
                      </button>
                      <button
                        onClick={() => onAction(worker.id, "block")}
                        className="flex-1 h-11 rounded-lg text-sm font-medium text-white"
                        style={{
                          background: "#FF4C6E",
                          boxShadow: "0 0 24px rgba(255,76,110,0.3)",
                        }}
                      >
                        Confirm Block
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function Compare({
  label,
  value,
  avg,
  format,
}: {
  label: string;
  value: number;
  avg: number;
  format: (n: number) => string;
}) {
  const max = Math.max(value, avg);
  return (
    <div className="glass p-4 mb-2">
      <div className="text-xs text-text-tertiary mb-3">{label}</div>
      <div className="space-y-2">
        <Row name="Worker" value={value} max={max} format={format} accent="#00E5A0" />
        <Row
          name="Dept Avg"
          value={avg}
          max={max}
          format={format}
          accent="rgba(255,255,255,0.2)"
        />
      </div>
    </div>
  );
}

function Row({
  name,
  value,
  max,
  format,
  accent,
}: {
  name: string;
  value: number;
  max: number;
  format: (n: number) => string;
  accent: string;
}) {
  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="w-16 text-text-secondary">{name}</span>
      <div
        className="flex-1 h-1.5 rounded-full overflow-hidden"
        style={{ background: "rgba(255,255,255,0.04)" }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(value / max) * 100}%` }}
          transition={{ duration: 0.8 }}
          className="h-full rounded-full"
          style={{ background: accent }}
        />
      </div>
      <span className="text-mono text-text-primary w-24 text-right">{format(value)}</span>
    </div>
  );
}
