"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { LayoutDashboard, Upload, ShieldCheck, FileClock, Settings } from "lucide-react";

const items = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: Upload, label: "Uploads" },
  { icon: ShieldCheck, label: "Verifications" },
  { icon: FileClock, label: "Audit Log" },
  { icon: Settings, label: "Settings" },
];

export function Sidebar({ onAuditClick }: { onAuditClick: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {/* Desktop / tablet sidebar */}
      <motion.aside
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        animate={{ width: open ? 240 : 72 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="fixed left-0 top-0 h-screen z-40 overflow-hidden hidden md:block"
        style={{
          background: "rgba(6,8,15,0.85)",
          backdropFilter: "blur(20px)",
          borderRight: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div className="h-16 flex items-center px-5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#00E5A0,#00b87f)" }}
          >
            <ShieldCheck className="w-5 h-5 text-[#06080F]" strokeWidth={2.5} />
          </div>
          {open && (
            <span className="ml-3 font-display font-bold tracking-wide text-text-primary">
              SENTINEL
            </span>
          )}
        </div>
        <nav className="px-3 mt-4 space-y-1">
          {items.map((it, i) => (
            <button
              key={it.label}
              onClick={() => it.label === "Audit Log" && onAuditClick()}
              className="w-full flex items-center h-11 px-3 rounded-lg hover:bg-white/5 transition-colors text-text-secondary hover:text-text-primary group"
            >
              <it.icon className="w-5 h-5 shrink-0" strokeWidth={1.75} />
              {open && (
                <span className="ml-3 text-sm font-medium whitespace-nowrap">{it.label}</span>
              )}
              {!open && i === 0 && (
                <span className="absolute left-1.5 w-0.5 h-6 rounded-r bg-primary" />
              )}
            </button>
          ))}
        </nav>
      </motion.aside>

      {/* Mobile bottom nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden flex items-center justify-around h-16 px-2"
        style={{
          background: "rgba(6,8,15,0.92)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {items.map((it, i) => (
          <button
            key={it.label}
            onClick={() => it.label === "Audit Log" && onAuditClick()}
            className={`flex flex-col items-center justify-center gap-1 px-3 py-1 rounded-md transition-colors ${i === 0 ? "text-primary" : "text-text-secondary"}`}
          >
            <it.icon className="w-5 h-5" strokeWidth={1.75} />
            <span className="text-[10px] font-medium">{it.label}</span>
          </button>
        ))}
      </nav>
    </>
  );
}
