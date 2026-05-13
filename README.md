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
│   └── sentinel-data.ts      # Dummy worker data + formatNaira helper
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

The app currently uses hardcoded dummy data in [lib/sentinel-data.ts](lib/sentinel-data.ts). To connect to the real backend:

1. Set `NEXT_PUBLIC_API_URL` in your `.env.local`:
   ```
   NEXT_PUBLIC_API_URL=https://api.sentinel.yourdomain.com
   ```

2. Replace the `WORKERS` constant in [lib/sentinel-data.ts](lib/sentinel-data.ts) with a TanStack Query fetch:
   ```ts
   // lib/api.ts
   export async function fetchPayrollRun(runId: string) {
     const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payroll/${runId}/workers`);
     if (!res.ok) throw new Error("Failed to fetch payroll run");
     return res.json() as Promise<Worker[]>;
   }
   ```

3. Use it in [app/page.tsx](app/page.tsx) with `useQuery`:
   ```ts
   const { data: workers } = useQuery({
     queryKey: ["payroll", runId],
     queryFn: () => fetchPayrollRun(runId),
   });
   ```

### Expected API Response Shape

```json
[
  {
    "id": "OG-10428",
    "name": "Adebayo Oladele",
    "department": "Health",
    "salary": 185000,
    "score": 96,
    "status": "verified",
    "reasons": []
  }
]
```

The full type definition is in [types/index.ts](types/index.ts).

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
