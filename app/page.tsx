"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { Users, AlertTriangle, Banknote, ShieldCheck, ShieldOff } from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { UploadZone } from "@/components/upload/UploadZone";
import { StatCard } from "@/components/dashboard/StatCard";
import { DepartmentSummary } from "@/components/dashboard/DepartmentSummary";
import { DashboardHome } from "@/components/dashboard/DashboardHome";
import { ProcessingView } from "@/components/processing/ProcessingView";
import { ResultsTable } from "@/components/table/ResultsTable";
import { WorkerDrawer } from "@/components/drawer/WorkerDrawer";
import { PaymentModal } from "@/components/modal/PaymentModal";
import { AuditDrawer } from "@/components/drawer/AuditDrawer";
import { UploadHistory } from "@/components/dashboard/UploadHistory";
import { PayrollView } from "@/components/payroll/PayrollView";
import { formatNaira, departmentAverages } from "@/lib/sentinel-data";
import { uploadPayroll, fetchWorkers, patchWorkerStatus } from "@/lib/api";
import type { Worker } from "@/types";
import { APP_VERSION, OFFICE_LOCATION } from "@/constants";

type Phase = "dashboard" | "empty" | "processing" | "results" | "payroll";

const SESSION_KEY = "sentinel_session";

function loadSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      phase: parsed.phase as Phase,
      workers: parsed.workers as Worker[],
      uploadId: parsed.uploadId as string,
      rowCount: parsed.rowCount as number,
      decided: new Map<string, "approve" | "block">(parsed.decided ?? []),
    };
  } catch {
    return null;
  }
}

export default function Page() {
  // Always start with server-safe defaults to avoid SSR/client hydration mismatch.
  // sessionStorage is read in a useEffect after mount.
  const [phase, setPhase] = useState<Phase>("dashboard");
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [uploadId, setUploadId] = useState<string>("");
  const [rowCount, setRowCount] = useState<number>(1200);
  const [animDone, setAnimDone] = useState(false);
  const [apiFetched, setApiFetched] = useState(false);
  const [selected, setSelected] = useState<Worker | null>(null);
  const [decided, setDecided] = useState<Map<string, "approve" | "block">>(new Map());
  const [payOpen, setPayOpen] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  // Restore persisted session after mount (runs only on client)
  useEffect(() => {
    const saved = loadSession();
    if (!saved) return;
    setPhase(saved.phase === "processing" ? "results" : saved.phase);
    setWorkers(saved.workers);
    setUploadId(saved.uploadId);
    setRowCount(saved.rowCount);
    setDecided(saved.decided);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (phase === "processing" && animDone && apiFetched) {
      setPhase("results");
    }
  }, [animDone, apiFetched, phase]);

  // Persist session whenever we have worker data; normalize "processing" → "results"
  useEffect(() => {
    if (workers.length === 0) return;
    try {
      sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          phase: phase === "processing" ? "results" : phase,
          workers,
          uploadId,
          rowCount,
          decided: Array.from(decided.entries()),
        }),
      );
    } catch {
      // sessionStorage quota exceeded — silently skip
    }
  }, [phase, workers, uploadId, rowCount, decided]);

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

  const hasData = workers.length > 0;

  const verified = effective.filter((w) => w.status === "verified");
  const heldList = effective.filter((w) => w.status === "review");
  const blockedList = effective.filter((w) => w.status === "blocked");
  const payrollReady = verified.reduce((s, w) => s + w.salary, 0);
  const amountProtected = blockedList.reduce((s, w) => s + w.salary, 0);

  async function handleUpload(file: File, clientRowCount: number) {
    sessionStorage.removeItem(SESSION_KEY);
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
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar
        onAuditClick={() => setAuditOpen(true)}
        onUploadClick={() => setPhase("empty")}
        onHistoryClick={() => setPhase("payroll")}
        onDashboardClick={() => setPhase("dashboard")}
        onVerificationsClick={() => setPhase(hasData ? "results" : "empty")}
        activeLabel={
          phase === "dashboard"  ? "Dashboard"
          : phase === "empty"   ? "Uploads"
          : phase === "processing" ? "Uploads"
          : phase === "payroll" ? "History"
          : "Verifications"
        }
      />

      <main className="md:pl-[72px] pb-20 md:pb-0">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 py-6 md:py-8">
          <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 md:mb-10">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-display font-bold text-2xl tracking-[0.04em] text-text-primary">
                SENTINEL
              </h1>
              <span className="px-3 py-1 rounded-full text-[10px] font-mono text-secondary bg-secondary/10 border border-secondary/20">
                {APP_VERSION}
              </span>
            </div>
            <div className="flex items-center gap-3 text-text-secondary text-sm flex-wrap">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/10 border border-secondary/15 text-secondary">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                <span className="text-mono text-xs">SYSTEM ONLINE</span>
              </div>
              <div className="text-mono text-xs text-text-tertiary hidden sm:block">
                {OFFICE_LOCATION}
              </div>
            </div>
          </header>

          <AnimatePresence mode="wait">
            {phase === "dashboard" && (
              <motion.div key="dashboard" exit={{ opacity: 0, y: -10 }} className="mb-8">
                <DashboardHome
                  onNewUpload={() => setPhase("empty")}
                  onViewResults={() => setPhase("results")}
                  hasResults={hasData}
                />
              </motion.div>
            )}
            {phase === "payroll" && (
              <motion.div key="payroll" exit={{ opacity: 0, y: -10 }} className="mb-8">
                <PayrollView
                  workers={effective}
                  uploadId={uploadId}
                  onProcessPayroll={() => setPayOpen(true)}
                  onNewUpload={() => setPhase("empty")}
                />
              </motion.div>
            )}
            {phase === "empty" && (
              <motion.div key="empty" exit={{ opacity: 0, y: -10 }} className="mb-8">
                <div className="text-center mb-8">
                  <p className="text-text-secondary text-sm">
                    AI-Powered Payroll Integrity for the Public Sector
                  </p>
                </div>
                <UploadZone onUpload={handleUpload} />
              </motion.div>
            )}
            {phase === "processing" && (
              <motion.div key="processing" exit={{ opacity: 0, y: -10 }} className="mb-8">
                <ProcessingView total={rowCount} onDone={() => setAnimDone(true)} />
              </motion.div>
            )}
          </AnimatePresence>

          {phase !== "dashboard" && phase !== "payroll" && (
            <>
              <div
                className={`grid gap-3 sm:gap-4 mb-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${hasData ? "xl:grid-cols-5" : ""}`}
              >
                <StatCard
                  label="Total Workers"
                  value={hasData ? totalWorkers : null}
                  icon={<Users className="w-4 h-4" />}
                  delay={0}
                />
                <StatCard
                  label="Flagged Workers"
                  value={hasData ? flagged : null}
                  tone="danger"
                  icon={<AlertTriangle className="w-4 h-4" />}
                  delay={0.08}
                />
                <StatCard
                  label="Total Payroll"
                  value={hasData ? totalPayroll : null}
                  format={formatNaira}
                  icon={<Banknote className="w-4 h-4" />}
                  delay={0.16}
                />
                {hasData && (
                  <StatCard
                    label="Payroll Ready"
                    value={payrollReady}
                    format={formatNaira}
                    tone="primary"
                    icon={<ShieldCheck className="w-4 h-4" />}
                    delay={0.24}
                  />
                )}
                {hasData && (
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

              {hasData && <DepartmentSummary workers={effective} />}
            </>
          )}

          <div data-section="results" />
          {hasData && phase !== "dashboard" && phase !== "payroll" && (
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
      <UploadHistory open={historyOpen} onClose={() => setHistoryOpen(false)} />
    </div>
  );
}
