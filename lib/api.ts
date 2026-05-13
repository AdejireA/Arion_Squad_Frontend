import type { Worker, WorkerOut } from "@/types";

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

const HIGH_SEVERITY_CODES = new Set([
  "duplicate_bvn",
  "ghost_worker",
  "ghost_worker_pattern",
  "duplicate_account",
  "duplicate_account_number",
  "no_attendance",
  "no_attendance_3months",
]);

function humanizeCode(code: string): string {
  const key = code.toLowerCase();
  return CODE_LABELS[key] ?? code.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function codeSeverity(code: string): "high" | "medium" {
  return HIGH_SEVERITY_CODES.has(code.toLowerCase()) ? "high" : "medium";
}

// ── Mapping ───────────────────────────────────────────────────────────────────

export function mapWorker(raw: WorkerOut): Worker {
  return {
    id: raw.id,
    name: raw.full_name,
    department: raw.grade,
    salary: raw.salary,
    score: raw.trust_score,
    status: raw.status === "pending" ? "review" : raw.status,
    reasons: raw.reason_codes.map((code) => ({
      label: humanizeCode(code),
      severity: codeSeverity(code),
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
