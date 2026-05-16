import type { Worker, WorkerOut, AuditEvent, Status } from "@/types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? "";

function authHeaders(extra?: Record<string, string>): Record<string, string> {
  return { "X-API-Key": API_KEY, ...extra };
}

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

export interface UploadHistoryItem {
  id: string;
  filename: string;
  row_count: number;
  created_at: string;
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
  NAME_MISMATCH_WITH_BANK: "Bank Account Name Mismatch",
  ACCOUNT_NOT_FOUND_IN_BANK: "Account Not Found in Bank",
};

const CODE_TO_FEATURE: Record<string, string> = {
  DUPLICATE_BANK_ACCOUNT: "duplicate_account_count",
  DUPLICATE_BVN: "duplicate_bvn_count",
  MISSING_BVN: "missing_bvn",
  SALARY_FAR_ABOVE_GRADE_PEERS: "salary_vs_grade_median_ratio",
  SALARY_FAR_BELOW_GRADE_PEERS: "salary_vs_grade_median_ratio",
  SUSPICIOUS_NAME: "name_length",
  NEAR_DUPLICATE_NAME: "fuzzy_name_similarity",
  LOW_ATTENDANCE: "attendance_rate",
  SQUAD_NAME_MISMATCH: "duplicate_account_count",
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
  const fallbackWeight = Math.round(100 / (raw.reason_codes.length || 1));
  return {
    id: raw.id,
    name: raw.full_name,
    department: raw.department ?? raw.grade,
    salary: raw.salary,
    score: raw.trust_score,
    status: normalizeStatus(raw.status),
    reasons: raw.reason_codes.map((code) => {
      const featureKey = CODE_TO_FEATURE[code];
      const weight =
        featureKey && raw.feature_weights?.[featureKey] != null
          ? Math.round((raw.feature_weights[featureKey] as number) * 100)
          : fallbackWeight;
      return { label: humanizeCode(code), severity, weight };
    }),
  };
}

// ── API calls ─────────────────────────────────────────────────────────────────

export async function uploadPayroll(file: File): Promise<UploadResponse> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${BASE}/upload`, { method: "POST", headers: authHeaders(), body: form });
  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText);
    throw new Error(`Upload failed (${res.status}): ${detail}`);
  }
  return res.json() as Promise<UploadResponse>;
}

export async function fetchWorkers(uploadId: string): Promise<Worker[]> {
  const url = `${BASE}/workers?upload_id=${encodeURIComponent(uploadId)}`;
  const res = await fetch(url, { headers: authHeaders() });
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
    headers: authHeaders({ "Content-Type": "application/json" }),
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
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText);
    throw new Error(`Override failed (${res.status}): ${detail}`);
  }
}

export async function fetchAuditLog(uploadId: string): Promise<AuditEvent[]> {
  const url = `${BASE}/audit-log?upload_id=${encodeURIComponent(uploadId)}`;
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText);
    throw new Error(`Failed to fetch audit log (${res.status}): ${detail}`);
  }
  const data = (await res.json()) as { upload_id: string; events: AuditEvent[] };
  return data.events;
}

export async function fetchUploadHistory(): Promise<UploadHistoryItem[]> {
  const res = await fetch(`${BASE}/uploads`, { headers: { "X-API-Key": API_KEY } });
  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText);
    throw new Error(`Failed to fetch upload history (${res.status}): ${detail}`);
  }
  const data = (await res.json()) as { uploads: UploadHistoryItem[] };
  return data.uploads;
}
