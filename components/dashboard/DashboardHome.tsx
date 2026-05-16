"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Upload, ArrowRight, FileText, TrendingUp, Users, ShieldCheck, Clock } from "lucide-react";
import { fetchUploadHistory, type UploadHistoryItem } from "@/lib/api";
import { formatNaira } from "@/lib/sentinel-data";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

interface Props {
  onNewUpload: () => void;
  onViewResults: () => void;
  hasResults: boolean;
}

export function DashboardHome({ onNewUpload, onViewResults, hasResults }: Props) {
  const [history, setHistory] = useState<UploadHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUploadHistory()
      .then(setHistory)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalWorkers = history.reduce((s, h) => s + h.row_count, 0);
  const latestUpload = history[0];
  const avgWorkers = history.length ? Math.round(totalWorkers / history.length) : 0;

  const summaryCards = [
    {
      label: "Total Uploads",
      value: loading ? "—" : history.length.toLocaleString(),
      icon: FileText,
      sub: "all time",
    },
    {
      label: "Workers Processed",
      value: loading ? "—" : totalWorkers.toLocaleString(),
      icon: Users,
      sub: "cumulative",
    },
    {
      label: "Avg Batch Size",
      value: loading ? "—" : avgWorkers.toLocaleString(),
      icon: TrendingUp,
      sub: "per upload",
    },
    {
      label: "Last Upload",
      value: loading ? "—" : latestUpload ? timeAgo(latestUpload.created_at) : "Never",
      icon: Clock,
      sub: latestUpload ? formatDate(latestUpload.created_at) : "no uploads yet",
    },
  ];

  return (
    <div>
      {/* Summary stat tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {summaryCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
            className="glass p-5 bg-slate-50 border border-slate-200"
          >
            <div className="flex items-start justify-between mb-4">
              <span className="text-[10px] uppercase tracking-[0.14em] text-text-tertiary font-medium">
                {card.label}
              </span>
              <card.icon className="w-4 h-4 text-text-tertiary" />
            </div>
            <div className="text-2xl font-semibold text-mono text-text-primary">{card.value}</div>
            <div className="text-[11px] text-text-tertiary mt-1">{card.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Action strip */}
      <div className="flex flex-wrap gap-3 mb-10">
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.28 }}
          onClick={onNewUpload}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary text-white text-sm font-medium hover:bg-secondary/90 transition-colors"
        >
          <Upload className="w-4 h-4" />
          New Upload
        </motion.button>

        {hasResults && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.36 }}
            onClick={onViewResults}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-secondary/30 text-secondary text-sm font-medium hover:bg-secondary/5 transition-colors"
          >
            <ShieldCheck className="w-4 h-4" />
            View Latest Results
            <ArrowRight className="w-3.5 h-3.5" />
          </motion.button>
        )}
      </div>

      {/* Recent uploads */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.32 }}
      >
        <h2 className="text-xs uppercase tracking-[0.14em] text-text-tertiary font-medium mb-3">
          Recent Uploads
        </h2>

        {loading && (
          <div className="glass bg-slate-50 border border-slate-200 p-8 text-center text-text-tertiary text-sm">
            Loading history…
          </div>
        )}

        {!loading && history.length === 0 && (
          <div className="glass bg-slate-50 border border-slate-200 p-12 text-center">
            <Upload className="w-8 h-8 text-text-tertiary mx-auto mb-3 opacity-40" />
            <p className="text-text-secondary text-sm font-medium">No uploads yet</p>
            <p className="text-text-tertiary text-xs mt-1">
              Upload your first payroll file to get started.
            </p>
            <button
              onClick={onNewUpload}
              className="mt-5 px-4 py-2 rounded-lg bg-secondary text-white text-sm font-medium hover:bg-secondary/90 transition-colors"
            >
              Upload payroll
            </button>
          </div>
        )}

        {!loading && history.length > 0 && (
          <div className="space-y-3">
            {history.slice(0, 8).map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.36 + i * 0.04 }}
                className="glass bg-slate-50 border border-slate-200 px-5 py-4 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-secondary" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-text-primary truncate">
                      {item.filename}
                    </div>
                    <div className="text-xs text-text-tertiary mt-0.5 text-mono">
                      {item.row_count.toLocaleString()} workers · {formatDate(item.created_at)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="hidden sm:block text-xs text-text-tertiary">{timeAgo(item.created_at)}</span>
                  <span className="inline-flex items-center rounded-full bg-secondary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary">
                    Done
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
