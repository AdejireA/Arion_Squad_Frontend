"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import {
  Upload, ArrowRight, FileText, Users, ShieldCheck, Clock, TrendingUp,
} from "lucide-react";
import { fetchUploadHistory, type UploadHistoryItem } from "@/lib/api";

// ── helpers ───────────────────────────────────────────────────────────────────

function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

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

// ── skeleton ──────────────────────────────────────────────────────────────────

function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`animate-pulse rounded bg-slate-200 ${className}`} style={style} />;
}

// ── custom tooltip ────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: {
  active?: boolean; payload?: { value: number }[]; label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="text-text-tertiary mb-0.5">{label}</p>
      <p className="font-semibold text-text-primary">{payload[0].value.toLocaleString()} workers</p>
    </div>
  );
}

// ── component ─────────────────────────────────────────────────────────────────

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
  const largestBatch = history.length ? Math.max(...history.map((h) => h.row_count)) : 0;

  const chartData = [...history].reverse().slice(-12).map((h) => ({
    date: shortDate(h.created_at),
    workers: h.row_count,
    id: h.id,
  }));

  const kpis = [
    {
      label: "Total Uploads",
      value: loading ? null : history.length,
      sub: "all time",
      icon: FileText,
      accent: false,
    },
    {
      label: "Workers Scanned",
      value: loading ? null : totalWorkers,
      sub: "cumulative",
      icon: Users,
      accent: false,
    },
    {
      label: "Largest Batch",
      value: loading ? null : largestBatch,
      sub: "single upload",
      icon: TrendingUp,
      accent: false,
    },
    {
      label: "Last Upload",
      value: loading ? null : latestUpload ? timeAgo(latestUpload.created_at) : "—",
      sub: latestUpload ? fullDate(latestUpload.created_at) : "no uploads yet",
      icon: Clock,
      accent: true,
    },
  ];

  return (
    <div className="space-y-6">

      {/* ── action bar ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-wrap items-center justify-between gap-3"
      >
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Overview</h2>
          <p className="text-xs text-text-tertiary mt-0.5">
            {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex gap-2">
          {hasResults && (
            <button
              onClick={onViewResults}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 text-text-secondary text-sm font-medium hover:border-secondary/40 hover:text-secondary transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Latest Results
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
          <button
            onClick={onNewUpload}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-secondary text-white text-sm font-medium hover:bg-secondary/90 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            New Upload
          </button>
        </div>
      </motion.div>

      {/* ── KPI cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white border border-slate-200 rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] uppercase tracking-[0.14em] text-text-tertiary font-medium">
                {k.label}
              </span>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${k.accent ? "bg-secondary/10" : "bg-slate-100"}`}>
                <k.icon className={`w-3.5 h-3.5 ${k.accent ? "text-secondary" : "text-text-tertiary"}`} />
              </div>
            </div>
            {loading ? (
              <>
                <Skeleton className="h-7 w-20 mb-1.5" />
                <Skeleton className="h-3 w-16" />
              </>
            ) : (
              <>
                <div className={`text-2xl font-semibold text-mono ${k.accent ? "text-secondary" : "text-text-primary"}`}>
                  {typeof k.value === "number" ? k.value.toLocaleString() : k.value ?? "—"}
                </div>
                <div className="text-[11px] text-text-tertiary mt-1">{k.sub}</div>
              </>
            )}
          </motion.div>
        ))}
      </div>

      {/* ── chart + table ──────────────────────────────────────── */}
      <div className="grid lg:grid-cols-5 gap-4">

        {/* chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.28 }}
          className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-sm font-semibold text-text-primary">Upload Activity</p>
              <p className="text-xs text-text-tertiary mt-0.5">Workers per batch · last 12 uploads</p>
            </div>
          </div>

          {loading ? (
            <div className="h-48 flex items-end gap-2 px-2">
              {[65, 40, 80, 55, 70, 45, 90, 60].map((h, i) => (
                <Skeleton key={i} className="flex-1" style={{ height: `${h}%` }} />
              ))}
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-text-tertiary text-sm">
              No data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} barCategoryGap="35%">
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  width={36}
                  tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,106,0,0.06)" }} />
                <Bar dataKey="workers" radius={[4, 4, 0, 0]}>
                  {chartData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={i === chartData.length - 1 ? "#FF6A00" : "#FF6A0033"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* recent uploads */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.34 }}
          className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5"
        >
          <p className="text-sm font-semibold text-text-primary mb-4">Recent Uploads</p>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-2.5 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <Upload className="w-7 h-7 text-slate-300 mb-2" />
              <p className="text-sm text-text-secondary font-medium">No uploads yet</p>
              <button
                onClick={onNewUpload}
                className="mt-3 text-xs text-secondary hover:underline"
              >
                Upload your first payroll →
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              {history.slice(0, 7).map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, delay: 0.38 + i * 0.04 }}
                  className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-secondary/8 flex items-center justify-center shrink-0 group-hover:bg-secondary/15 transition-colors">
                    <FileText className="w-3.5 h-3.5 text-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-text-primary truncate">{item.filename}</p>
                    <p className="text-[10px] text-text-tertiary mt-0.5">
                      {item.row_count.toLocaleString()} workers
                    </p>
                  </div>
                  <span className="text-[10px] text-text-tertiary shrink-0">{timeAgo(item.created_at)}</span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

    </div>
  );
}
