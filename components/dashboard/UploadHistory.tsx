"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchUploadHistory, type UploadHistoryItem } from "@/lib/api";

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function UploadHistory({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [items, setItems] = useState<UploadHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetchUploadHistory()
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/20 z-40"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-0 top-0 h-screen w-full sm:w-[520px] z-50 overflow-y-auto"
            style={{
              background: "#FFFFFF",
              borderLeft: "1px solid rgba(255,106,0,0.18)",
              boxShadow: "-28px 0 70px rgba(255,106,0,0.12)",
            }}
          >
            <div className="p-7">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.14em] text-slate-500 font-semibold">
                    Upload history
                  </div>
                  <h2 className="text-3xl font-display font-semibold text-slate-950 mt-2">
                    Payroll uploads
                  </h2>
                  <p className="text-slate-600 text-sm mt-3 max-w-xl">
                    Review recent payroll uploads, row counts, and timestamps with clean card summaries.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="h-11 w-11 rounded-2xl flex items-center justify-center transition hover:bg-slate-100 text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="rounded-3xl bg-white border border-primary/20 p-4 shadow-sm">
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-500 font-medium">
                    Total uploads
                  </div>
                  <div className="mt-3 text-3xl font-semibold text-slate-950">
                    {items.length.toLocaleString()}
                  </div>
                </div>
                <div className="rounded-3xl bg-white border border-primary/20 p-4 shadow-sm">
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-500 font-medium">
                    Latest upload
                  </div>
                  <div className="mt-3 text-3xl font-semibold text-slate-950">
                    {items[0]?.row_count.toLocaleString() ?? "—"}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">workers</div>
                </div>
              </div>

              {loading ? (
                <div className="glass p-8 text-center text-slate-500 text-sm bg-primary/10 border border-primary/20">
                  Loading history...
                </div>
              ) : items.length === 0 ? (
                <div className="glass p-8 text-center text-slate-500 text-sm bg-primary/10 border border-primary/20">
                  No uploads found.
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-slate-950 truncate">
                            {item.filename}
                          </div>
                          <div className="mt-2 text-xs text-slate-500 text-mono tracking-[0.08em]">
                            {item.row_count.toLocaleString()} workers processed
                          </div>
                        </div>
                        <span className="inline-flex items-center rounded-full bg-secondary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-secondary">
                          Completed
                        </span>
                      </div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm text-slate-600">
                        <div className="rounded-2xl bg-primary/10 p-3 border border-primary/20">
                          <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                            Upload date
                          </div>
                          <div className="mt-2 text-slate-950 text-mono">
                            {formatDate(item.created_at)}
                          </div>
                        </div>
                        <div className="rounded-2xl bg-primary/10 p-3 border border-primary/20">
                          <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                            File name
                          </div>
                          <div className="mt-2 text-slate-950 text-mono truncate">
                            {item.filename}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
