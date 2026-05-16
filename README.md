# Sentinel Frontend

Next.js 14 dashboard for HR officers to upload payroll CSV files, review ML-scored workers, override flagged decisions, and process verified payments through the Squad disbursement API. The backend scores each worker against a fraud and anomaly model and returns trust scores, reason codes, and feature weights that populate the trust gauge and score driver bars.

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Framer Motion

## Setup

1. Clone the repository
2. Run `npm install`
3. Copy `.env.local.example` to `.env.local` and fill in the values
4. Run `npm run dev`

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend base URL |
| `NEXT_PUBLIC_API_KEY` | Yes | Must match `SENTINEL_API_KEY` on the backend |

## Key Components

UploadZone accepts CSV or XLSX payroll files and counts rows client-side before upload. ProcessingView animates a row counter under the Sentinel Risk Model v2.4 label while the backend scores each record. ResultsTable sorts workers into three bands — verified, review, and blocked — with per-band column filtering. WorkerDrawer opens on row click and shows a circular trust score gauge, score driver bars sized by feature weight, risk indicator pills, and a salary comparison against the department average. PaymentModal steps through three stages — summary, paying, and done — and calls the Squad disbursement API for each verified worker. AuditDrawer fetches the transfer event log for a completed upload. DepartmentSummary breaks down blocked, review, and salary-at-risk counts by department. UploadHistory lists all past uploads with filename, row count, and timestamp.

## How It Works

1. HR officer drops a payroll CSV; the frontend counts rows locally and sends the file to the backend.
2. The backend scores each worker against the risk model; the UI holds on the processing screen until both the animation and API response finish.
3. Workers appear in three bands: verified (cleared for payment), review (held for inspection), and blocked (flagged for fraud or anomalies).
4. HR officers can override individual decisions in the WorkerDrawer, then open PaymentModal to disburse verified salaries via Squad.
