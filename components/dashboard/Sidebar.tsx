"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { LayoutDashboard, Upload, ShieldCheck, FileClock, Settings, Clock } from "lucide-react";

const items = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: Upload, label: "Uploads" },
  { icon: ShieldCheck, label: "Verifications" },
  { icon: Clock, label: "History" },
  { icon: FileClock, label: "Audit Log" },
  { icon: Settings, label: "Settings" },
];

export function Sidebar({
  onAuditClick,
  onUploadClick,
  onHistoryClick,
}: {
  onAuditClick: () => void;
  onUploadClick: () => void;
  onHistoryClick: () => void;
}) {
  const [open, setOpen] = useState(false);

  function handleNav(label: string) {
    if (label === "Dashboard") window.scrollTo({ top: 0, behavior: "smooth" });
    else if (label === "Uploads") onUploadClick();
    else if (label === "Verifications")
      document.querySelector("[data-section='results']")?.scrollIntoView({ behavior: "smooth" });
    else if (label === "History") onHistoryClick();
    else if (label === "Audit Log") onAuditClick();
    else if (label === "Settings") toast.info("Settings coming in v2");
  }
  return (
    <>
      {/* Desktop / tablet sidebar */}
      <motion.aside
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        animate={{ width: open ? 236 : 76 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="fixed left-0 top-0 h-screen z-40 overflow-hidden hidden md:flex flex-col"
        style={{
          background: "rgba(8,12,20,0.92)",
          backdropFilter: "blur(22px)",
          borderRight: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div className="h-16 flex items-center px-5 border-b border-white/5">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-primary/15">
            <ShieldCheck className="w-5 h-5 text-primary" strokeWidth={2.5} />
          </div>
          {open && (
            <span className="ml-3 font-display font-semibold tracking-wide text-text-primary">
              Sentinel
            </span>
          )}
        </div>
        <nav className="px-3 mt-4 space-y-1">
          {items.map((it, i) => (
            <button
              key={it.label}
              onClick={() => handleNav(it.label)}
              className="w-full flex items-center h-12 px-3 rounded-xl transition-colors text-text-secondary hover:text-text-primary hover:bg-white/5"
            >
              <it.icon className="w-5 h-5 shrink-0" strokeWidth={1.75} />
              {open && (
                <span className="ml-4 text-sm font-medium whitespace-nowrap">{it.label}</span>
              )}
              {!open && i === 0 && (
                <span className="absolute left-2 w-0.5 h-6 rounded-r bg-primary" />
              )}
            </button>
          ))}
        </nav>
      </motion.aside>

      {/* Mobile bottom nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden flex items-center justify-around h-16 px-2"
        style={{
          background: "rgba(8,12,20,0.94)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {items.map((it, i) => (
          <button
            key={it.label}
            onClick={() => handleNav(it.label)}
            className={`flex flex-col items-center justify-center gap-1 px-2 py-1 rounded-lg transition-colors ${i === 0 ? "text-primary" : "text-text-secondary"}`}
          >
            <it.icon className="w-5 h-5" strokeWidth={1.75} />
            <span className="text-[10px] font-medium">{it.label}</span>
          </button>
        ))}
      </nav>
    </>
  );
}
