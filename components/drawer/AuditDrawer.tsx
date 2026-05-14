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
    return { label: "Payment Confirmed", color: "#00E5A0", pillLabel: "Confirmed" };
  }
  switch (event) {
    case "TRANSFER_INITIATED":
      return { label: "Payment Initiated", color: "#00E5A0", pillLabel: "Initiated" };
    case "PAYMENT_BLOCKED":
      return { label: "Blocked", color: "#FF4C6E", pillLabel: "Blocked" };
    case "TRANSFER_FAILED":
      return { label: "Failed", color: "#FFB628", pillLabel: "Failed" };
    default:
      return { label: event, color: "#8892a4", pillLabel: event };
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

              {loading ? (
                <div className="glass p-8 flex items-center justify-center gap-3 text-text-tertiary text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading audit log...
                </div>
              ) : events.length === 0 ? (
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
                          <tr key={e.id} className="border-t border-white/[0.04]">
                            <td className="px-4 py-3 text-mono text-[11px] text-text-secondary">
                              {e.created_at.replace("T", " ").slice(0, 19)}
                            </td>
                            <td className="py-3 text-text-primary text-xs">{d.label}</td>
                            <td className="py-3 text-mono text-[10px] text-text-tertiary">
                              {e.worker_id.slice(0, 12)}
                            </td>
                            <td className="py-3 text-right text-mono text-xs text-text-primary">
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
