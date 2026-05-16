"use client";

import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileText, CheckCircle, AlertCircle, X } from "lucide-react";
import { useRef, useState } from "react";
import Papa from "papaparse";
import { MAX_UPLOAD_SIZE_MB, ACCEPTED_FILE_TYPES } from "@/constants";

const ACCEPTED_MIME = ["text/csv", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-excel"];

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function validate(file: File): string | null {
  const ext = "." + file.name.split(".").pop()?.toLowerCase();
  const validExt = (ACCEPTED_FILE_TYPES as readonly string[]).includes(ext);
  const validMime = ACCEPTED_MIME.includes(file.type) || file.type === "";
  if (!validExt || !validMime) {
    return `Invalid file type. Please upload a ${ACCEPTED_FILE_TYPES.join(" or ")} file.`;
  }
  if (file.size > MAX_UPLOAD_SIZE_MB * 1024 * 1024) {
    return `File too large. Maximum size is ${MAX_UPLOAD_SIZE_MB}MB.`;
  }
  return null;
}

export function UploadZone({ onUpload }: { onUpload: (file: File, rowCount: number) => void }) {
  const [drag, setDrag] = useState(false);
  const [picked, setPicked] = useState<File | null>(null);
  const [rowCount, setRowCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    const err = validate(file);
    if (err) {
      setError(err);
      setPicked(null);
      return;
    }
    setError(null);
    setPicked(file);

    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (ext === ".csv") {
      Papa.parse(file, {
        skipEmptyLines: true,
        complete: (results) => {
          const dataRows = results.data.length > 0 ? results.data.length - 1 : 0;
          setRowCount(Math.max(0, dataRows));
        },
        error: () => setRowCount(0),
      });
    } else {
      setRowCount(0);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDrag(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  function clear(e: React.MouseEvent) {
    e.stopPropagation();
    setPicked(null);
    setError(null);
  }

  return (
    <motion.div layout className="relative">
      <div className="absolute inset-0 ambient-teal blur-2xl pointer-events-none opacity-10" />
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={handleDrop}
        onClick={() => !picked && inputRef.current?.click()}
        className={`relative glass overflow-hidden transition-colors ${picked ? "cursor-default" : "cursor-pointer group"}`}
        style={{ padding: "48px 28px" }}
      >
        <div className={`absolute inset-3 rounded-3xl transition ${drag ? "border border-dashed border-primary/40" : ""}`} />

        <div className="relative flex flex-col items-center text-center">
          <AnimatePresence mode="wait">
            {picked ? (
              /* ── File selected state ── */
              <motion.div
                key="picked"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="flex flex-col items-center"
              >
                <div
                  className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
                  style={{ background: "rgba(0,229,160,0.12)", border: "1px solid rgba(0,229,160,0.22)" }}
                >
                  <CheckCircle className="w-10 h-10 text-primary" strokeWidth={1.5} />
                </div>
                <div className="w-full max-w-[420px] flex items-center gap-3 px-4 py-3 rounded-2xl mb-3 bg-white/5 border border-white/10">
                  <FileText className="w-4 h-4 text-primary shrink-0" />
                  <div className="min-w-0 text-left">
                    <div className="text-sm font-semibold text-text-primary truncate">{picked.name}</div>
                    <div className="text-xs text-text-tertiary text-mono mt-0.5">{formatBytes(picked.size)}</div>
                  </div>
                  <button
                    onClick={clear}
                    className="ml-2 p-1 rounded-full hover:bg-white/10 text-text-tertiary transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); onUpload(picked, rowCount); }}
                  className="h-11 px-8 rounded-full text-sm font-semibold text-[#06080F]"
                  style={{ background: "linear-gradient(135deg, #00E5A0, #00B87F)" }}
                >
                  Analyse payroll
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                  className="mt-3 text-xs text-text-tertiary hover:text-text-primary transition underline-offset-4 hover:underline"
                >
                  Choose a different file
                </button>
              </motion.div>
            ) : (
              /* ── Default / error state ── */
              <motion.div
                key="idle"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="flex flex-col items-center"
              >
                <div
                  className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
                  style={
                    error
                      ? { background: "rgba(255,76,110,0.08)", border: "1px solid rgba(255,76,110,0.2)" }
                      : { background: "rgba(0,229,160,0.08)", border: "1px solid rgba(0,229,160,0.2)" }
                  }
                >
                  {error ? (
                    <AlertCircle className="w-10 h-10 text-destructive" strokeWidth={1.5} />
                  ) : (
                    <UploadCloud className="w-10 h-10 text-primary" strokeWidth={1.5} />
                  )}
                </div>
                <h2 className="text-2xl text-text-primary mb-2 font-semibold">
                  {error ? "Upload failed" : "Upload payroll data"}
                </h2>
                {error ? (
                  <p className="text-destructive text-sm mb-2">{error}</p>
                ) : (
                  <p className="max-w-[420px] text-text-secondary text-sm">
                    Drag and drop your CSV or XLSX file, or browse to select it from your device.
                  </p>
                )}
                <div className="flex items-center gap-2 mt-6 text-text-tertiary text-xs text-mono">
                  <FileText className="w-3.5 h-3.5" />
                  <span>SUPPORTED: .CSV · .XLSX · MAX {MAX_UPLOAD_SIZE_MB}MB</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx"
          className="hidden"
          onChange={handleChange}
        />
      </div>
    </motion.div>
  );
}
