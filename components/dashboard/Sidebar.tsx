"use client";

import { useEffect, useState } from "react";
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
  onDashboardClick,
  onVerificationsClick,
  activeLabel = "Dashboard",
}: {
  onAuditClick: () => void;
  onUploadClick: () => void;
  onHistoryClick: () => void;
  onDashboardClick?: () => void;
  onVerificationsClick?: () => void;
  activeLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(activeLabel);

  useEffect(() => { setActive(activeLabel); }, [activeLabel]);

  function handleNav(label: string) {
    setActive(label);
    if (label === "Dashboard") {
      onDashboardClick?.();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (label === "Uploads") onUploadClick();
    else if (label === "Verifications") onVerificationsClick?.();
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
          background: "rgba(255,255,255,0.98)",
          borderRight: "1px solid rgba(255,106,0,0.18)",
        }}
      >
        <div className="h-16 flex items-center px-5 border-b border-slate-200">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-secondary/10">
            <ShieldCheck className="w-5 h-5 text-secondary" strokeWidth={2.5} />
          </div>
          {open && (
            <span className="ml-3 font-display font-semibold tracking-wide text-text-primary">
              Sentinel
            </span>
          )}
        </div>
        <nav className="px-3 mt-4 space-y-1">
          {items.map((it) => {
            const isActive = it.label === active;
            return (
              <button
                key={it.label}
                onClick={() => handleNav(it.label)}
                className={`relative w-full flex items-center h-12 px-3 rounded-xl transition-colors ${
                  isActive
                    ? "text-secondary bg-secondary/10"
                    : "text-text-secondary hover:text-secondary hover:bg-secondary/10"
                }`}
              >
                <it.icon className="w-5 h-5 shrink-0" strokeWidth={isActive ? 2.25 : 1.75} />
                {open && (
                  <span className={`ml-4 text-sm whitespace-nowrap ${isActive ? "font-semibold" : "font-medium"}`}>
                    {it.label}
                  </span>
                )}
                {isActive && (
                  <span className="absolute left-0 w-0.5 h-6 rounded-r bg-secondary" />
                )}
              </button>
            );
          })}
        </nav>
      </motion.aside>

      {/* Mobile bottom nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden flex items-center justify-around h-16 px-2"
        style={{
          background: "rgba(255,255,255,0.96)",
          borderTop: "1px solid rgba(255,106,0,0.18)",
        }}
      >
        {items.map((it) => {
          const isActive = it.label === active;
          return (
            <button
              key={it.label}
              onClick={() => handleNav(it.label)}
              className={`flex flex-col items-center justify-center gap-1 px-2 py-1 rounded-lg transition-colors ${
                isActive ? "text-secondary" : "text-text-secondary hover:text-secondary"
              }`}
            >
              <it.icon className="w-5 h-5" strokeWidth={isActive ? 2.25 : 1.75} />
              <span className={`text-[10px] ${isActive ? "font-semibold" : "font-medium"}`}>
                {it.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
