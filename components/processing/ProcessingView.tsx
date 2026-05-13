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
      className="glass p-10 relative overflow-hidden"
    >
      <div className="flex items-center gap-3 mb-8">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: "rgba(0,229,160,0.1)" }}
        >
          <Cpu className="w-5 h-5 text-primary" />
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.14em] text-text-tertiary">
            AI Engine Active
          </div>
          <div className="text-text-primary font-display">
            Sentinel Risk Model {RISK_MODEL_VERSION}
          </div>
        </div>
      </div>

      <div
        className="relative h-48 rounded-xl overflow-hidden mb-8"
        style={{
          background: "rgba(0,0,0,0.4)",
          border: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <div className="absolute inset-0 p-4 text-mono text-[11px] leading-[20px] text-text-tertiary opacity-60 columns-2 gap-8">
          {[...SAMPLE_LINES, ...SAMPLE_LINES].map((l, i) => (
            <div
              key={i}
              className="whitespace-nowrap overflow-hidden"
              style={{ opacity: 0.3 + (i % 5) * 0.1 }}
            >
              {l}
            </div>
          ))}
        </div>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, rgba(13,17,23,0.4) 0%, transparent 30%, transparent 70%, rgba(13,17,23,0.4) 100%)",
          }}
        />
        <div
          className="absolute top-0 bottom-0 w-32 scan-line"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(0,229,160,0.5), transparent)",
            boxShadow: "0 0 40px rgba(0,229,160,0.6)",
          }}
        />
      </div>

      <div className="flex items-end justify-between mb-3">
        <div>
          <div className="text-xs uppercase tracking-[0.14em] text-text-tertiary mb-1">
            Scoring Records
          </div>
          <div className="text-mono text-3xl text-text-primary">
            <span className="text-primary text-glow-teal">{count.toLocaleString()}</span>
            <span className="text-text-tertiary"> / {total.toLocaleString()}</span>
          </div>
        </div>
        <div className="text-mono text-sm text-text-secondary">{pct.toFixed(1)}%</div>
      </div>

      <div
        className="h-1.5 rounded-full overflow-hidden"
        style={{ background: "rgba(255,255,255,0.05)" }}
      >
        <div
          className="h-full rounded-full transition-[width] duration-150"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg, #00b87f, #00E5A0)",
            boxShadow: "0 0 12px rgba(0,229,160,0.6)",
          }}
        />
      </div>
    </motion.div>
  );
}
