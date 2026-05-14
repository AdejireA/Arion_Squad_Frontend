"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Check, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Worker } from "@/types";
import { processPayroll, type ProcessPayrollResponse } from "@/lib/api";
import { formatNaira } from "@/lib/sentinel-data";

interface Props {
  open: boolean;
  uploadId: string;
  toPay: Worker[];
  held: Worker[];
  blocked: Worker[];
  onClose: () => void;
  onViewAudit: () => void;
}

export function PaymentModal({
  open,
  uploadId,
  toPay,
  held,
  blocked,
  onClose,
  onViewAudit,
}: Props) {
  const [stage, setStage] = useState<"confirm" | "paying" | "done">("confirm");
  const [payResult, setPayResult] = useState<ProcessPayrollResponse | null>(null);
  const fired = useRef(false);

  useEffect(() => {
    if (!open) {
      setStage("confirm");
      setPayResult(null);
      fired.current = false;
    }
  }, [open]);

  useEffect(() => {
    if (stage !== "paying") return;
    if (fired.current) return;
    fired.current = true;
    processPayroll(uploadId)
      .then((result) => {
        setPayResult(result);
        setStage("done");
      })
      .catch((err) => {
        toast.error(err instanceof Error ? err.message : "Payment processing failed.");
        setStage("confirm");
      });
  }, [stage, uploadId]);

  const total = toPay.reduce((s, w) => s + w.salary, 0);
  const heldTotal = held.reduce((s, w) => s + w.salary, 0);
  const blockedTotal = blocked.reduce((s, w) => s + w.salary, 0);

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
              <div className="p-10 flex flex-col items-center">
                <div className="text-xs uppercase tracking-[0.14em] text-text-tertiary mb-8">
                  Disbursing Payments
                </div>
                <Loader2 className="w-10 h-10 text-primary animate-spin mb-6" />
                <div className="text-text-secondary text-sm mb-8">
                  Processing {toPay.length} payments...
                </div>
                <div
                  className="w-full h-1.5 rounded-full overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: "linear-gradient(90deg,#00b87f,#00E5A0)",
                      boxShadow: "0 0 12px rgba(0,229,160,0.6)",
                    }}
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                  />
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
                  {payResult?.succeeded ?? toPay.length} workers paid · {formatNaira(total)}{" "}
                  disbursed
                </p>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <MiniStat
                    label="Paid"
                    value={payResult?.succeeded ?? toPay.length}
                    color="#00E5A0"
                  />
                  <MiniStat label="Failed" value={payResult?.failed ?? 0} color="#FFB628" />
                  <MiniStat
                    label="Blocked"
                    value={payResult?.blocked ?? blocked.length}
                    color="#FF4C6E"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 h-11 rounded-lg text-sm text-text-secondary hover:bg-white/5"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
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
