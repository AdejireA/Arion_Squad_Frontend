"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { Users, AlertTriangle, Banknote, ShieldCheck, ShieldOff } from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { UploadZone } from "@/components/upload/UploadZone";
import { StatCard } from "@/components/dashboard/StatCard";
import { ProcessingView } from "@/components/processing/ProcessingView";
import { ResultsTable } from "@/components/table/ResultsTable";
import { WorkerDrawer } from "@/components/drawer/WorkerDrawer";
import { PaymentModal } from "@/components/modal/PaymentModal";
import { AuditDrawer } from "@/components/drawer/AuditDrawer";
import { formatNaira, departmentAverages } from "@/lib/sentinel-data";
import { uploadPayroll, fetchWorkers, patchWorkerStatus } from "@/lib/api";
import type { Worker } from "@/types";
import { APP_VERSION, OFFICE_LOCATION } from "@/constants";

type Phase = "empty" | "processing" | "results";

export default function Page() {
  const [phase, setPhase] = useState<Phase>("empty");
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [uploadId, setUploadId] = useState("");
  const [rowCount, setRowCount] = useState(1200);
  const [animDone, setAnimDone] = useState(false);
  const [apiFetched, setApiFetched] = useState(false);
  const [selected, setSelected] = useState<Worker | null>(null);
  const [decided, setDecided] = useState<Map<string, "approve" | "block">>(new Map());
  const [payOpen, setPayOpen] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);

  useEffect(() => {
    if (phase === "processing" && animDone && apiFetched) {
      setPhase("results");
    }
  }, [animDone, apiFetched, phase]);

  const averages = useMemo(() => departmentAverages(workers), [workers]);

  const totalWorkers = workers.length;
  const flagged = workers.filter((w) => w.status !== "verified").length;
  const totalPayroll = workers.reduce((s, w) => s + w.salary, 0);

  const effective = useMemo(
    () =>
      workers.map((w) => {
        const d = decided.get(w.id);
        if (d === "approve") return { ...w, status: "verified" as const };
        if (d === "block") return { ...w, status: "blocked" as const };
        return w;
      }),
    [workers, decided],
  );

  const verified = effective.filter((w) => w.status === "verified");
  const heldList = effective.filter((w) => w.status === "review");
  const blockedList = effective.filter((w) => w.status === "blocked");
  const payrollReady = verified.reduce((s, w) => s + w.salary, 0);
  const amountProtected = blockedList.reduce((s, w) => s + w.salary, 0);

  async function handleUpload(file: File, clientRowCount: number) {
    setPhase("processing");
    setAnimDone(false);
    setApiFetched(false);
    setWorkers([]);
    setDecided(new Map());
    setRowCount(clientRowCount || 1200);

    try {
      const { upload_id, row_count } = await uploadPayroll(file);
      setUploadId(upload_id);
      setRowCount(row_count || clientRowCount || 1200);
      const fetched = await fetchWorkers(upload_id);
      setWorkers(fetched);
      setApiFetched(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed. Please try again.");
      setPhase("empty");
      setAnimDone(false);
      setApiFetched(false);
    }
  }

  const handleAction = (id: string, action: "approve" | "block") => {
    setDecided((prev) => {
      const n = new Map(prev);
      n.set(id, action);
      return n;
    });
    setSelected((prev) =>
      prev ? { ...prev, status: action === "approve" ? "verified" : "blocked" } : prev,
    );
    patchWorkerStatus(id, action === "approve" ? "verified" : "blocked")
      .catch((err) => toast.error(err instanceof Error ? err.message : "Override failed"));
  };

  return (
    <div className="min-h-screen">
      <Sidebar onAuditClick={() => setAuditOpen(true)} onUploadClick={() => setPhase("empty")} />

      <main className="md:pl-[72px] pb-20 md:pb-0">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 py-6 md:py-8">
          <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 md:mb-10">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-display font-bold text-xl md:text-2xl tracking-[0.04em] text-text-primary">
                SENTINEL
              </h1>
              <span
                className="px-2.5 py-1 rounded-full text-[10px] font-mono text-primary"
                style={{
                  background: "rgba(0,229,160,0.08)",
                  border: "1px solid rgba(0,229,160,0.2)",
                }}
              >
                {APP_VERSION}
              </span>
            </div>
            <div className="flex items-center gap-3 text-text-secondary text-sm flex-wrap">
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full bg-primary"
                  style={{ boxShadow: "0 0 8px #00E5A0" }}
                />
                <span className="text-mono text-xs">SYSTEM ONLINE</span>
              </div>
              <div className="text-mono text-xs text-text-tertiary hidden sm:block">
                {OFFICE_LOCATION}
              </div>
            </div>
          </header>

          {phase === "empty" && (
            <div className="text-center mb-10">
              <p className="text-text-secondary text-sm">
                AI-Powered Payroll Integrity for the Public Sector
              </p>
            </div>
          )}

          <AnimatePresence mode="wait">
            {phase === "empty" && (
              <motion.div key="empty" exit={{ opacity: 0, y: -10 }} className="mb-8">
                <UploadZone onUpload={handleUpload} />
              </motion.div>
            )}
            {phase === "processing" && (
              <motion.div key="processing" exit={{ opacity: 0, y: -10 }} className="mb-8">
                <ProcessingView total={rowCount} onDone={() => setAnimDone(true)} />
              </motion.div>
            )}
          </AnimatePresence>

          <div
            className={`grid gap-3 sm:gap-4 mb-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${phase === "results" ? "xl:grid-cols-5" : ""}`}
          >
            <StatCard
              label="Total Workers"
              value={phase === "empty" ? null : totalWorkers}
              icon={<Users className="w-4 h-4" />}
              delay={0}
            />
            <StatCard
              label="Flagged Workers"
              value={phase === "empty" ? null : flagged}
              tone="danger"
              icon={<AlertTriangle className="w-4 h-4" />}
              delay={0.08}
            />
            <StatCard
              label="Total Payroll"
              value={phase === "empty" ? null : totalPayroll}
              format={formatNaira}
              icon={<Banknote className="w-4 h-4" />}
              delay={0.16}
            />
            {phase === "results" && (
              <StatCard
                label="Payroll Ready"
                value={payrollReady}
                format={formatNaira}
                tone="primary"
                icon={<ShieldCheck className="w-4 h-4" />}
                delay={0.24}
              />
            )}
            {phase === "results" && (
              <StatCard
                label="Amount Protected"
                value={amountProtected}
                format={formatNaira}
                tone="danger"
                icon={<ShieldOff className="w-4 h-4" />}
                delay={0.32}
              />
            )}
          </div>

          <div data-section="results" />
          {phase === "results" && (
            <ResultsTable
              workers={effective}
              reviewedIds={new Set(decided.keys())}
              onSelect={setSelected}
              onProcess={() => setPayOpen(true)}
            />
          )}

          <footer className="mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-text-tertiary text-xs">
            <span className="text-mono">SENTINEL · STATE PAYROLL INTEGRITY ENGINE</span>
            <span>Encrypted · Auditable · Immutable</span>
          </footer>
        </div>
      </main>

      <WorkerDrawer
        worker={selected}
        onClose={() => setSelected(null)}
        onAction={handleAction}
        decided={decided}
        averages={averages}
      />
      <PaymentModal
        open={payOpen}
        uploadId={uploadId}
        toPay={verified}
        held={heldList}
        blocked={blockedList}
        onClose={() => setPayOpen(false)}
        onViewAudit={() => setAuditOpen(true)}
      />
      <AuditDrawer open={auditOpen} uploadId={uploadId} onClose={() => setAuditOpen(false)} />
    </div>
  );
}
