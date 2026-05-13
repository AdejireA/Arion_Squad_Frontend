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
