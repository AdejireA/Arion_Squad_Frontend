"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { Worker } from "@/types";
import { formatNaira } from "@/lib/sentinel-data";

interface Entry {
  ts: string;
  action: string;
  workerId: string;
  workerName: string;
  amount: number;
  status: "paid" | "held" | "blocked" | "approved" | "blocked-manual";
}

export function buildAuditEntries(
  paid: Worker[],
  held: Worker[],
  blocked: Worker[],
): Entry[] {
  const now = new Date();
  const fmt = (d: Date) => d.toISOString().replace("T", " ").slice(0, 19);
  let i = 0;
  const out: Entry[] = [];
  paid.forEach((w) =>
    out.push({
      ts: fmt(new Date(now.getTime() - (paid.length - i++) * 1500)),
      action: "Payment Disbursed",
      workerId: w.id,
      workerName: w.name,
      amount: w.salary,
      status: "paid",
    }),
  );
  held.forEach((w) =>
    out.push({
      ts: fmt(new Date(now.getTime() - 60_000 - i++ * 800)),
      action: "Held for Review",
      workerId: w.id,
      workerName: w.name,
      amount: w.salary,
      status: "held",
    }),
  );
  blocked.forEach((w) =>
    out.push({
      ts: fmt(new Date(now.getTime() - 90_000 - i++ * 800)),
      action: "Payment Blocked",
      workerId: w.id,
      workerName: w.name,
      amount: w.salary,
      status: "blocked",
    }),
  );
  return out;
}

const pillStyle: Record<Entry["status"], { c: string; l: string }> = {
  paid: { c: "#00E5A0", l: "Paid" },
  held: { c: "#FFB628", l: "Held" },
  blocked: { c: "#FF4C6E", l: "Blocked" },
  approved: { c: "#00E5A0", l: "Approved" },
  "blocked-manual": { c: "#FF4C6E", l: "Manual Block" },
};

export function AuditDrawer({
  open,
  entries,
  onClose,
}: {
  open: boolean;
  entries: Entry[];
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
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
            className="fixed right-0 top-0 h-screen w-[640px] z-50 overflow-y-auto"
            style={{
              background: "rgba(13,17,23,0.94)",
              backdropFilter: "blur(32px)",
              borderLeft: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="p-7">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <div className="text-xs uppercase tracking-[0.14em] text-text-tertiary">
                    Immutable Record
                  </div>
                  <h2 className="text-2xl text-text-primary mt-1">Audit Log</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/5 text-text-secondary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-text-secondary text-sm mt-2 mb-6">
                Chronological record of all payroll decisions made by Sentinel.
              </p>

              {entries.length === 0 ? (
                <div className="glass p-8 text-center text-text-tertiary text-sm">
                  No audit entries yet. Run a payroll to generate records.
                </div>
              ) : (
                <div className="glass overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-[10px] uppercase tracking-[0.14em] text-text-tertiary text-left">
                        <th className="px-4 py-3 font-medium">Timestamp</th>
                        <th className="py-3 font-medium">Action</th>
                        <th className="py-3 font-medium">Worker</th>
                        <th className="py-3 font-medium text-right">Amount</th>
                        <th className="py-3 pr-4 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((e, i) => {
                        const p = pillStyle[e.status];
                        return (
                          <tr key={i} className="border-t border-white/[0.04]">
                            <td className="px-4 py-3 text-mono text-[11px] text-text-secondary">
                              {e.ts}
                            </td>
                            <td className="py-3 text-text-primary text-xs">{e.action}</td>
                            <td className="py-3 text-text-secondary text-xs">
                              <div>{e.workerName}</div>
                              <div className="text-mono text-text-tertiary text-[10px]">
                                {e.workerId}
                              </div>
                            </td>
                            <td className="py-3 text-right text-mono text-xs text-text-primary">
                              {formatNaira(e.amount)}
                            </td>
                            <td className="py-3 pr-4">
                              <span
                                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider"
                                style={{
                                  background: `${p.c}15`,
                                  color: p.c,
                                  border: `1px solid ${p.c}40`,
                                }}
                              >
                                <span
                                  className="w-1 h-1 rounded-full"
                                  style={{ background: p.c }}
                                />
                                {p.l}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
