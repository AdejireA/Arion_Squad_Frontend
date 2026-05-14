import type { Worker, WorkerOut, AuditEvent } from "@/types";

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
  duplicate_bvn: "Duplicate BVN Detected",
  ghost_worker: "Ghost Worker Pattern Match",
  ghost_worker_pattern: "Ghost Worker Pattern Match",
  duplicate_account: "Duplicate Account Number",
  duplicate_account_number: "Duplicate Account Number",
  no_attendance: "No Attendance — 3+ Months",
  no_attendance_3months: "No Attendance — 3+ Months",
  salary_exceeds_grade: "Salary Exceeds Grade Level",
  salary_exceeds_grade_level: "Salary Exceeds Grade Level",
  irregular_attendance: "Irregular Attendance Pattern",
  address_mismatch: "Address Mismatch on File",
  missing_tax_id: "Missing Tax ID",
  recent_bank_change: "Recent Bank Account Change",
  recent_bank_account_change: "Recent Bank Account Change",
};

function humanizeCode(code: string): string {
  const key = code.toLowerCase();
  return CODE_LABELS[key] ?? code.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ── Mapping ───────────────────────────────────────────────────────────────────

export function mapWorker(raw: WorkerOut): Worker {
  const severity = raw.trust_score < 50 ? "high" : "medium";
  return {
    id: raw.id,
    name: raw.full_name,
    department: raw.department ?? raw.grade,
    salary: raw.salary,
    score: raw.trust_score,
    status: raw.status === "pending" ? "review" : raw.status,
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

export async function fetchAuditLog(uploadId: string): Promise<AuditEvent[]> {
  const url = `${BASE}/audit-log?upload_id=${encodeURIComponent(uploadId)}`;
  const res = await fetch(url);
  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText);
    throw new Error(`Failed to fetch audit log (${res.status}): ${detail}`);
  }
  return res.json() as Promise<AuditEvent[]>;
}
