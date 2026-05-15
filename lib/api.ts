import type { Worker, WorkerOut, AuditEvent, Status } from "@/types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ── Raw response shapes ───────────────────────────────────────────────────────

export interface UploadResponse {
  upload_id: string;
  row_count: number;
  scored: number;
  blocked: number;
}

interface WorkersResponse {
  upload_id: string;
  workers: WorkerOut[];
}

export interface ProcessPayrollResponse {
  attempted: number;
  succeeded: number;
  failed: number;
  blocked: number;
}

// ── Reason-code helpers ───────────────────────────────────────────────────────

const CODE_LABELS: Record<string, string> = {
  DUPLICATE_BANK_ACCOUNT: "Duplicate Bank Account",
  DUPLICATE_BVN: "Duplicate BVN Detected",
  MISSING_BVN: "Missing BVN on File",
  SALARY_FAR_ABOVE_GRADE_PEERS: "Salary Exceeds Grade Level",
  SALARY_FAR_BELOW_GRADE_PEERS: "Salary Below Grade Level",
  SUSPICIOUS_NAME: "Suspicious Name Pattern",
  NEAR_DUPLICATE_NAME: "Near-Duplicate Name Detected",
  LOW_ATTENDANCE: "Below Attendance Threshold",
  SQUAD_NAME_MISMATCH: "Bank Account Name Mismatch",
};

function humanizeCode(code: string): string {
  return CODE_LABELS[code] ?? code.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ── Mapping ───────────────────────────────────────────────────────────────────

function normalizeStatus(s: WorkerOut["status"]): Status {
  if (s === "paid" || s === "pending") return "verified";
  if (s === "failed") return "blocked";
  return s as Status;
}

export function mapWorker(raw: WorkerOut): Worker {
  const severity = raw.trust_score < 50 ? "high" : "medium";
  return {
    id: raw.id,
    name: raw.full_name,
    department: raw.department ?? raw.grade,
    salary: raw.salary,
    score: raw.trust_score,
    status: normalizeStatus(raw.status),
    reasons: raw.reason_codes.map((code) => ({
      label: humanizeCode(code),
      severity,
    })),
  };
}

// ── API calls ─────────────────────────────────────────────────────────────────

export async function uploadPayroll(file: File): Promise<UploadResponse> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${BASE}/upload`, { method: "POST", body: form });
  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText);
    throw new Error(`Upload failed (${res.status}): ${detail}`);
  }
  return res.json() as Promise<UploadResponse>;
}

export async function fetchWorkers(uploadId: string): Promise<Worker[]> {
  const url = `${BASE}/workers?upload_id=${encodeURIComponent(uploadId)}`;
  const res = await fetch(url);
  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText);
    throw new Error(`Failed to fetch workers (${res.status}): ${detail}`);
  }
  const data = (await res.json()) as WorkersResponse;
  return data.workers.map(mapWorker);
}

export async function processPayroll(uploadId: string): Promise<ProcessPayrollResponse> {
  const res = await fetch(`${BASE}/payroll/process`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ upload_id: uploadId }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText);
    throw new Error(`Payment processing failed (${res.status}): ${detail}`);
  }
  return res.json() as Promise<ProcessPayrollResponse>;
}

export async function patchWorkerStatus(
  id: string,
  status: "verified" | "blocked",
): Promise<void> {
  const res = await fetch(`${BASE}/workers/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText);
    throw new Error(`Override failed (${res.status}): ${detail}`);
  }
}

export async function fetchAuditLog(uploadId: string): Promise<AuditEvent[]> {
  const url = `${BASE}/audit-log?upload_id=${encodeURIComponent(uploadId)}`;
  const res = await fetch(url);
  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText);
    throw new Error(`Failed to fetch audit log (${res.status}): ${detail}`);
  }
  const data = (await res.json()) as { upload_id: string; events: AuditEvent[] };
  return data.events;
}
