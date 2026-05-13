// ── Backend (FastAPI) response shape ─────────────────────────────────────────
// Mapping: full_name → name, trust_score → score, grade → department,
//          "pending" → "review", reason_codes[] → reasons[{label, severity}]

export interface WorkerOut {
  id: string;
  upload_id: string;
  full_name: string;
  bank_account: string;
  bank_code: string;
  salary: number;
  grade: string;
  trust_score: number;
  status: "verified" | "blocked" | "pending";
  reason_codes: string[];
}

// ── Frontend domain type ──────────────────────────────────────────────────────

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
