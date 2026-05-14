// ── Backend (FastAPI) response shape ─────────────────────────────────────────

export interface WorkerOut {
  id: string;
  upload_id: string;
  full_name: string;
  bank_account: string;
  bank_code: string;
  salary: number;
  grade: string;
  department?: string;
  trust_score: number;
  status: "verified" | "review" | "blocked" | "pending" | "paid" | "failed";
  reason_codes: string[];
}

// ── Frontend domain types ─────────────────────────────────────────────────────

export type Status = "verified" | "review" | "blocked";

export interface Worker {
  id: string;
  name: string;
  department: string;
  salary: number;
  score: number;
  status: Status;
  reasons: { label: string; severity: "high" | "medium" }[];
}

export interface AuditEvent {
  id: string;
  upload_id: string;
  worker_id: string;
  event: string;
  detail: Record<string, unknown>;
  created_at: string;
}
