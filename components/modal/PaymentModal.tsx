"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Check, ArrowRight } from "lucide-react";
import type { Worker } from "@/types";
import { formatNaira } from "@/lib/sentinel-data";
import { PAYMENT_STEP_DELAY_MS } from "@/constants";

interface Props {
  open: boolean;
  workers: Worker[];
  toPay: Worker[];
  held: Worker[];
  blocked: Worker[];
  onClose: () => void;
  onComplete: () => void;
  onViewAudit: () => void;
}

export function PaymentModal({
  open,
  toPay,
  held,
  blocked,
  onClose,
  onComplete,
  onViewAudit,
}: Props) {
  const [stage, setStage] = useState<"confirm" | "paying" | "done">("confirm");
  const [paidIdx, setPaidIdx] = useState(0);

  useEffect(() => {
    if (!open) {
      setStage("confirm");
      setPaidIdx(0);
    }
  }, [open]);

  useEffect(() => {
    if (stage !== "paying") return;
    if (paidIdx >= toPay.length) {
      setTimeout(() => setStage("done"), 600);
      return;
    }
    const t = setTimeout(() => setPaidIdx((i) => i + 1), PAYMENT_STEP_DELAY_MS);
    return () => clearTimeout(t);
  }, [stage, paidIdx, toPay.length]);

  const total = toPay.reduce((s, w) => s + w.salary, 0);
  const heldTotal = held.reduce((s, w) => s + w.salary, 0);
  const blockedTotal = blocked.reduce((s, w) => s + w.salary, 0);
  const pct = toPay.length ? (paidIdx / toPay.length) * 100 : 100;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: "rgba(6,8,15,0.7)", backdropFilter: "blur(8px)" }}
        >
          <motion.div
            initial={{ scale: 0.96, y: 10, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="glass-strong w-[560px] max-h-[80vh] overflow-hidden flex flex-col"
          >
            {stage === "confirm" && (
              <div className="p-7">
                <div className="text-xs uppercase tracking-[0.14em] text-text-tertiary mb-2">
                  Confirm Payment Run
                </div>
                <h2 className="text-2xl text-text-primary mb-6">Process State Payroll</h2>
                <div className="space-y-2 mb-7">
                  <SummaryRow
                    label="Verified — Ready to Pay"
                    count={toPay.length}
                    amount={total}
                    color="#00E5A0"
                  />
                  <SummaryRow
                    label="Under Review — Held"
                    count={held.length}
                    amount={heldTotal}
                    color="#FFB628"
                  />
                  <SummaryRow
                    label="Blocked — Will Not Pay"
                    count={blocked.length}
                    amount={blockedTotal}
                    color="#FF4C6E"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 h-11 rounded-lg text-sm font-medium text-text-secondary hover:bg-white/5 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setStage("paying")}
                    className="flex-1 h-11 rounded-lg text-sm font-medium text-[#06080F] glow-teal"
                    style={{ background: "linear-gradient(135deg,#00E5A0,#00b87f)" }}
                  >
                    Confirm & Pay
                  </button>
                </div>
              </div>
            )}

            {stage === "paying" && (
              <div className="p-7 flex flex-col min-h-0">
                <div className="text-xs uppercase tracking-[0.14em] text-text-tertiary mb-2">
                  Disbursing Payments
                </div>
                <div className="flex items-baseline gap-3 mb-5">
                  <div className="text-mono text-3xl text-primary text-glow-teal">{paidIdx}</div>
                  <div className="text-text-tertiary text-mono">/ {toPay.length} workers</div>
                </div>
                <div
                  className="h-1.5 rounded-full overflow-hidden mb-5"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                >
                  <div
                    className="h-full rounded-full transition-[width] duration-200"
                    style={{
                      width: `${pct}%`,
                      background: "linear-gradient(90deg,#00b87f,#00E5A0)",
                      boxShadow: "0 0 12px rgba(0,229,160,0.6)",
                    }}
                  />
                </div>
                <div
                  className="flex-1 overflow-y-auto space-y-1.5 text-sm pr-2"
                  style={{ maxHeight: 280 }}
                >
                  {toPay.slice(0, paidIdx).reverse().map((w) => (
                    <motion.div
                      key={w.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-3 p-2.5 rounded-lg"
                      style={{ background: "rgba(0,229,160,0.04)" }}
                    >
                      <Check className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-text-primary text-sm">Paying {w.name}</span>
                      <span className="ml-auto text-mono text-text-secondary text-xs">
                        {formatNaira(w.salary)}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {stage === "done" && (
              <div className="p-10 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-5"
                  style={{
                    background: "rgba(0,229,160,0.1)",
                    border: "2px solid rgba(0,229,160,0.4)",
                    boxShadow: "0 0 60px rgba(0,229,160,0.4)",
                  }}
                >
                  <Check className="w-10 h-10 text-primary" strokeWidth={3} />
                </motion.div>
                <h2 className="text-2xl text-text-primary mb-2">Payroll Complete</h2>
                <p className="text-text-secondary text-sm mb-6">
                  {toPay.length} workers paid · {formatNaira(total)} disbursed
                </p>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <MiniStat label="Paid" value={toPay.length} color="#00E5A0" />
                  <MiniStat label="Held" value={held.length} color="#FFB628" />
                  <MiniStat label="Blocked" value={blocked.length} color="#FF4C6E" />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      onComplete();
                      onClose();
                    }}
                    className="flex-1 h-11 rounded-lg text-sm text-text-secondary hover:bg-white/5"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      onComplete();
                      onViewAudit();
                      onClose();
                    }}
                    className="flex-1 h-11 rounded-lg text-sm font-medium text-primary flex items-center justify-center gap-2"
                    style={{
                      background: "rgba(0,229,160,0.08)",
                      border: "1px solid rgba(0,229,160,0.3)",
                    }}
                  >
                    View Audit Log <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SummaryRow({
  label,
  count,
  amount,
  color,
}: {
  label: string;
  count: number;
  amount: number;
  color: string;
}) {
  return (
    <div
      className="flex items-center gap-3 p-3.5 rounded-lg"
      style={{ background: "rgba(255,255,255,0.02)", borderLeft: `3px solid ${color}` }}
    >
      <div className="flex-1">
        <div className="text-xs text-text-tertiary uppercase tracking-wider mb-0.5">{label}</div>
        <div className="text-mono text-sm" style={{ color }}>
          {count} {count === 1 ? "worker" : "workers"}
        </div>
      </div>
      <div className="text-mono text-sm text-text-primary">{formatNaira(amount)}</div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div
      className="p-3 rounded-lg"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.04)",
      }}
    >
      <div className="text-mono text-xl" style={{ color }}>
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-wider text-text-tertiary mt-1">{label}</div>
    </div>
  );
}
