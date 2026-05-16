"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Cpu } from "lucide-react";
import { PROCESSING_DURATION_MS, RISK_MODEL_VERSION } from "@/constants";

const SAMPLE_LINES = [
  "OG-10428 ▸ ADEBAYO OLADELE      ▸ HEALTH        ▸ ₦185,000",
  "OG-10431 ▸ NGOZI OKONKWO        ▸ EDUCATION     ▸ ₦142,000",
  "OG-10455 ▸ IBRAHIM SULEIMAN     ▸ PUBLIC WORKS  ▸ ₦210,000",
  "OG-10472 ▸ FUNMILAYO ADEYEMI    ▸ FINANCE       ▸ ₦320,000",
  "OG-10489 ▸ CHUKWUEMEKA EZE      ▸ AGRICULTURE   ▸ ₦128,000",
  "OG-10501 ▸ AISHA MOHAMMED       ▸ HEALTH        ▸ ₦165,000",
  "OG-10518 ▸ OLUSEGUN BAKARE      ▸ EDUCATION     ▸ ₦98,000",
  "OG-10524 ▸ HAUWA YUSUF          ▸ FINANCE       ▸ ₦245,000",
  "OG-10537 ▸ TUNDE AFOLABI        ▸ PUBLIC WORKS  ▸ ₦178,000",
  "OG-10549 ▸ CHIAMAKA NWOSU       ▸ HEALTH        ▸ ₦152,000",
  "OG-10562 ▸ MUSA ABDULLAHI       ▸ AGRICULTURE   ▸ ₦112,000",
  "OG-10578 ▸ YETUNDE AKINOLA      ▸ EDUCATION     ▸ ₦138,000",
];

export function ProcessingView({ total, onDone }: { total: number; onDone: () => void }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / PROCESSING_DURATION_MS);
      setCount(Math.floor(total * (1 - Math.pow(1 - p, 2))));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setTimeout(onDone, 400);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [total, onDone]);

  const pct = (count / total) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="glass p-8 relative overflow-hidden"
    >
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center"
          style={{ background: "rgba(0,229,160,0.12)" }}
        >
          <Cpu className="w-5 h-5 text-primary" />
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-text-tertiary">
            AI Engine Active
          </div>
          <div className="text-text-primary font-display text-lg font-semibold">
            Sentinel Risk Model {RISK_MODEL_VERSION}
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-white/5 border border-white/10 p-5 mb-8">
        <div className="text-xs uppercase tracking-[0.16em] text-text-tertiary mb-3">
          Scoring payroll entries
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <div className="text-sm text-text-secondary">Active sample stream</div>
            <div className="mt-3 text-sm text-text-primary leading-6">
              Processing the latest payroll upload and evaluating entries against fraud risk patterns.
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs uppercase tracking-[0.16em] text-text-tertiary">
              Estimated throughput
            </div>
            <div className="text-2xl font-semibold text-text-primary">{total.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 mb-3 text-sm text-text-tertiary">
        <div>
          <div className="uppercase tracking-[0.16em]">Scored</div>
          <div className="text-text-primary text-2xl font-semibold mt-1">
            <span>{count.toLocaleString()}</span>
            <span className="text-text-tertiary ml-2">/ {total.toLocaleString()}</span>
          </div>
        </div>
        <div className="font-medium text-text-primary">{pct.toFixed(1)}%</div>
      </div>

      <div className="h-3 rounded-full overflow-hidden bg-white/10">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg, #00B87F, #00E5A0)",
          }}
        />
      </div>
    </motion.div>
  );
}
