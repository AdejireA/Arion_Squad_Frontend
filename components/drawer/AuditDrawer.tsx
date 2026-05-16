"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { AuditEvent } from "@/types";
import { fetchAuditLog } from "@/lib/api";
import { formatNaira } from "@/lib/sentinel-data";

function eventDisplay(event: string): { label: string; color: string; pillLabel: string } {
  if (event.startsWith("WEBHOOK_")) {
    return { label: "Payment Confirmed", color: "#FF6A00", pillLabel: "Confirmed" };
  }
  switch (event) {
    case "TRANSFER_INITIATED":
      return { label: "Payment Initiated", color: "#FF6A00", pillLabel: "Initiated" };
    case "PAYMENT_BLOCKED":
      return { label: "Blocked", color: "#D92D20", pillLabel: "Blocked" };
    case "TRANSFER_FAILED":
      return { label: "Failed", color: "#FFB627", pillLabel: "Failed" };
    default:
      return { label: event, color: "#5B6D8A", pillLabel: event };
  }
}

function extractAmount(detail: Record<string, unknown>): number | null {
  if (typeof detail?.amount === "number") return detail.amount;
  const resp = detail?.squad_response as Record<string, unknown> | undefined;
  if (typeof resp?.amount === "number") return resp.amount;
  return null;
}

export function AuditDrawer({
  open,
  uploadId,
  onClose,
}: {
  open: boolean;
  uploadId: string;
  onClose: () => void;
}) {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !uploadId) return;
    setLoading(true);
    fetchAuditLog(uploadId)
      .then(setEvents)
      .catch((err) =>
        toast.error(err instanceof Error ? err.message : "Failed to load audit log"),
      )
      .finally(() => setLoading(false));
  }, [open, uploadId]);

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
            className="fixed right-0 top-0 h-screen w-full sm:w-[640px] z-50 overflow-y-auto"
            style={{
              background: "#FFFFFF",
              borderLeft: "1px solid rgba(255,106,0,0.18)",
              boxShadow: "-28px 0 70px rgba(255,106,0,0.12)",
            }}
          >
            <div className="p-7">
              <div className="flex items-center justify-between mb-1">
                <div>
                      <div className="text-xs uppercase tracking-[0.14em] text-slate-500">
                    Immutable Record
                  </div>
                  <h2 className="text-2xl text-slate-950 mt-1">Audit Log</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-slate-100 text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-slate-600 text-sm mt-2 mb-6">
                Chronological record of all payroll decisions made by Sentinel.
              </p>

              {loading ? (
                <div className="glass p-8 flex items-center justify-center gap-3 text-slate-600 text-sm bg-primary/10 border border-primary/20">
                  <Loader2 className="w-4 h-4 animate-spin text-secondary" />
                  Loading audit log...
                </div>
              ) : events.length === 0 ? (
                <div className="glass p-8 text-center text-slate-600 text-sm bg-primary/10 border border-primary/20">
                  No audit entries yet. Run a payroll to generate records.
                </div>
              ) : (
                <div className="glass overflow-hidden bg-white border border-slate-200">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-[10px] uppercase tracking-[0.14em] text-text-tertiary text-left">
                        <th className="px-4 py-3 font-medium">Timestamp</th>
                        <th className="py-3 font-medium">Action</th>
                        <th className="py-3 font-medium">Worker ID</th>
                        <th className="py-3 font-medium text-right">Amount</th>
                        <th className="py-3 pr-4 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.map((e) => {
                        const d = eventDisplay(e.event);
                        const amount = extractAmount(e.detail);
                        return (
                          <tr key={e.id} className="border-t border-slate-200">
                            <td className="px-4 py-3 text-mono text-[11px] text-slate-500">
                              {e.created_at.replace("T", " ").slice(0, 19)}
                            </td>
                            <td className="py-3 text-slate-950 text-xs">{d.label}</td>
                            <td className="py-3 text-mono text-[10px] text-slate-500">
                              {e.worker_id.slice(0, 12)}
                            </td>
                            <td className="py-3 text-right text-mono text-xs text-slate-950">
                              {amount !== null ? formatNaira(amount) : "—"}
                            </td>
                            <td className="py-3 pr-4">
                              <span
                                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider"
                                style={{
                                  background: `${d.color}15`,
                                  color: d.color,
                                  border: `1px solid ${d.color}40`,
                                }}
                              >
                                <span
                                  className="w-1 h-1 rounded-full"
                                  style={{ background: d.color }}
                                />
                                {d.pillLabel}
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
