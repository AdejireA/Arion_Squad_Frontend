"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
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
      .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to load history"))
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
            className="fixed inset-0 bg-black/50 z-40"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-0 top-0 h-screen w-full sm:w-[480px] z-50 overflow-y-auto"
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
                    Past Uploads
                  </div>
                  <h2 className="text-2xl text-text-primary mt-1">Upload History</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/5 text-text-secondary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-text-secondary text-sm mt-2 mb-6">
                All payroll files processed by Sentinel.
              </p>

              {loading ? (
                <div className="glass p-8 text-center text-text-tertiary text-sm">
                  Loading history...
                </div>
              ) : items.length === 0 ? (
                <div className="glass p-8 text-center text-text-tertiary text-sm">
                  No uploads found.
                </div>
              ) : (
                <div className="space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-4 rounded-xl"
                      style={{
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(255,255,255,0.04)",
                      }}
                    >
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: "rgba(0,229,160,0.08)" }}
                      >
                        <FileText className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-text-primary font-medium truncate">
                          {item.filename}
                        </div>
                        <div className="text-xs text-text-tertiary text-mono mt-0.5">
                          {item.row_count.toLocaleString()} workers
                        </div>
                      </div>
                      <div className="text-xs text-text-tertiary text-mono text-right shrink-0">
                        {formatDate(item.created_at)}
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
