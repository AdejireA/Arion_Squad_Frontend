# Sentinel — AI Payroll Integrity Frontend

AI-powered payroll fraud detection dashboard for state government HR officers. Detects ghost workers, duplicate BVNs, salary anomalies, and attendance irregularities before payroll is disbursed.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org) (App Router) |
| Language | TypeScript 5.8 |
| Styling | Tailwind CSS v4 + custom design tokens |
| UI Components | [shadcn/ui](https://ui.shadcn.com) (Radix UI primitives) |
| Animations | [Framer Motion](https://www.framer.com/motion/) |
| Data Fetching | [TanStack Query v5](https://tanstack.com/query) |
| Icons | [Lucide React](https://lucide.dev) |
| Forms | React Hook Form + Zod |
| Fonts | Space Grotesk · Inter · JetBrains Mono (Google Fonts) |
| Notifications | [Sonner](https://sonner.emilkowal.ski) (toast) |

---

## Folder Structure

```
sentinel-frontend/
├── app/                      # Next.js App Router
│   ├── layout.tsx            # Root layout + metadata
│   ├── page.tsx              # Main dashboard page
│   ├── globals.css           # Global styles + Tailwind theme
│   └── icon.svg              # SVG favicon
├── components/
│   ├── dashboard/            # Sidebar, StatCard
│   ├── table/                # ResultsTable (worker list)
│   ├── drawer/               # WorkerDrawer, AuditDrawer
│   ├── modal/                # PaymentModal
│   ├── upload/               # UploadZone (CSV/XLSX drop)
│   ├── processing/           # ProcessingView (AI scan animation)
│   ├── providers.tsx         # TanStack Query client wrapper
│   └── ui/                   # shadcn/ui base components (46 total)
├── hooks/
│   ├── use-count-up.ts       # Animated number counter
│   └── use-mobile.tsx        # Responsive breakpoint hook
├── lib/
│   ├── utils.ts              # cn() Tailwind class utility
│   ├── api.ts                # API client (uploadPayroll, fetchWorkers, field mapping)
│   └── sentinel-data.ts      # Fallback dummy workers + formatNaira helper
├── types/
│   └── index.ts              # Worker, Status types
├── constants/
│   └── index.ts              # App-wide constants (timing, labels, limits)
├── public/                   # Static assets
├── next.config.ts
├── postcss.config.mjs        # Tailwind v4 PostCSS setup
├── tailwind.config            # (config-in-CSS via @theme in globals.css)
├── tsconfig.json
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 20+ or Bun 1.x
- npm / yarn / pnpm / bun

### Install dependencies

```bash
npm install
# or
bun install
```

### Run the development server

```bash
npm run dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build for production

```bash
npm run build
npm start
```

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

| Variable | Description | Required |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the Sentinel backend API | Yes |
| `NEXT_PUBLIC_APP_ENV` | `development` \| `staging` \| `production` | No |

---

## Connecting to the Backend API

Set `NEXT_PUBLIC_API_URL` in `.env.local` to enable live data. Without it the app falls back to the dummy workers in [lib/sentinel-data.ts](lib/sentinel-data.ts).

```
NEXT_PUBLIC_API_URL=https://api.sentinel.yourdomain.com
```

All API logic lives in [lib/api.ts](lib/api.ts).

### Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/upload` | Upload a payroll CSV/XLSX file |
| `GET` | `/workers?upload_id=<id>` | Fetch scored workers for an upload |

### Upload request

`multipart/form-data` with a single field `file`.

### Upload response

```json
{ "upload_id": "abc123", "row_count": 1200, "scored": 1195, "blocked": 3 }
```

### Workers response

```json
{
  "upload_id": "abc123",
  "workers": [
    {
      "id": "OG-10428",
      "upload_id": "abc123",
      "full_name": "Adebayo Oladele",
      "bank_account": "0123456789",
      "bank_code": "058",
      "salary": 185000,
      "grade": "Health",
      "trust_score": 96,
      "status": "verified",
      "reason_codes": []
    }
  ]
}
```

### Field mapping (backend → frontend)

| Backend | Frontend | Notes |
|---|---|---|
| `full_name` | `name` | |
| `trust_score` | `score` | |
| `grade` | `department` | |
| `"pending"` | `"review"` | status normalisation |
| `reason_codes[]` | `reasons[{label, severity}]` | humanised in `lib/api.ts` |

The full type definitions are in [types/index.ts](types/index.ts).

---

## Design System

The app uses a dark-first design system defined entirely in CSS variables inside [app/globals.css](app/globals.css):

| Token | Value | Usage |
|---|---|---|
| `--primary` | `#00E5A0` | Teal — verified, success, actions |
| `--destructive` | `#FF4C6E` | Red — blocked, high risk |
| `--caution` | `#FFB628` | Gold — under review, warnings |
| `--base` | `#06080F` | Page background |
| `--surface` | `#161B26` | Card / panel background |

Custom utility classes: `.glass`, `.glass-strong`, `.glow-teal`, `.text-glow-*`, `.ambient-teal`.

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |
