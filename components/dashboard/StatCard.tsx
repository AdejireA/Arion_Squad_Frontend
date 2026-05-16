"use client";

import { motion } from "framer-motion";
import { useCountUp } from "@/hooks/use-count-up";
import { COUNT_UP_DURATION_MS } from "@/constants";
import type { ReactNode } from "react";

interface Props {
  label: string;
  value: number | null;
  format?: (n: number) => string;
  tone?: "default" | "danger" | "primary";
  icon?: ReactNode;
  delay?: number;
}

export function StatCard({
  label,
  value,
  format = (n) => n.toLocaleString(),
  tone = "default",
  icon,
  delay = 0,
}: Props) {
  const animated = useCountUp(value ?? 0, COUNT_UP_DURATION_MS, value !== null);
  const colorClass =
    tone === "danger"
      ? "text-destructive"
      : tone === "primary"
        ? "text-secondary"
        : "text-text-primary";
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className="glass p-7 relative overflow-hidden bg-slate-50 border border-slate-200"
    >
      <div className="flex items-start justify-between mb-6">
        <span className="text-xs uppercase tracking-[0.14em] text-text-tertiary font-medium">
          {label}
        </span>
        {icon && <div className="text-text-tertiary">{icon}</div>}
      </div>
      <div className={`text-mono font-semibold break-all leading-tight min-w-0 ${value === null ? "text-text-tertiary" : colorClass} ${
        String(format(animated ?? 0)).length > 12 ? "text-lg" : String(format(animated ?? 0)).length >= 10 ? "text-2xl" : "text-4xl"
      }`}>
        {value === null ? "—" : format(animated)}
      </div>
    </motion.div>
  );
}
