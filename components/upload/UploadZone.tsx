"use client";

import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileText, CheckCircle, AlertCircle, X } from "lucide-react";
import { useRef, useState } from "react";
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

export function UploadZone({ onUpload }: { onUpload: () => void }) {
  const [drag, setDrag] = useState(false);
  const [picked, setPicked] = useState<File | null>(null);
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
      <div className="absolute inset-0 ambient-teal blur-2xl pointer-events-none" />
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={handleDrop}
        onClick={() => !picked && inputRef.current?.click()}
        className={`relative glass overflow-hidden transition-colors ${picked ? "cursor-default" : "cursor-pointer group"}`}
        style={{ padding: "56px 32px" }}
      >
        <div className={`absolute inset-3 rounded-xl ${drag ? "dashed-border" : ""}`} />

        <div className="relative flex flex-col items-center text-center">
          <AnimatePresence mode="wait">
            {picked ? (
              /* ── File selected state ── */
              <motion.div
                key="picked"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center"
              >
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
                  style={{ background: "rgba(0,229,160,0.10)", border: "1px solid rgba(0,229,160,0.3)" }}
                >
                  <CheckCircle className="w-10 h-10 text-primary" strokeWidth={1.5} />
                </div>
                <div
                  className="flex items-center gap-3 px-4 py-3 rounded-xl mb-3"
                  style={{ background: "rgba(0,229,160,0.06)", border: "1px solid rgba(0,229,160,0.2)" }}
                >
                  <FileText className="w-4 h-4 text-primary shrink-0" />
                  <div className="text-left">
                    <div className="text-sm font-medium text-text-primary truncate max-w-[260px]">
                      {picked.name}
                    </div>
                    <div className="text-xs text-text-tertiary text-mono mt-0.5">
                      {formatBytes(picked.size)}
                    </div>
                  </div>
                  <button
                    onClick={clear}
                    className="ml-2 p-1 rounded-md hover:bg-white/10 text-text-tertiary hover:text-text-primary transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); onUpload(); }}
                  className="h-11 px-8 rounded-lg text-sm font-medium text-[#06080F] glow-teal"
                  style={{ background: "linear-gradient(135deg,#00E5A0,#00b87f)" }}
                >
                  Analyse Payroll
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                  className="mt-3 text-xs text-text-tertiary hover:text-text-secondary transition underline-offset-4 hover:underline"
                >
                  Choose a different file
                </button>
              </motion.div>
            ) : (
              /* ── Default / error state ── */
              <motion.div
                key="idle"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center"
              >
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
                  style={
                    error
                      ? { background: "rgba(255,76,110,0.08)", border: "1px solid rgba(255,76,110,0.2)" }
                      : { background: "rgba(0,229,160,0.08)", border: "1px solid rgba(0,229,160,0.2)" }
                  }
                >
                  {error
                    ? <AlertCircle className="w-10 h-10 text-destructive" strokeWidth={1.5} />
                    : <UploadCloud className="w-10 h-10 text-primary" strokeWidth={1.5} />
                  }
                </div>
                <h2 className="text-2xl text-text-primary mb-2">
                  {error ? "Upload failed" : "Drop your payroll CSV here"}
                </h2>
                {error ? (
                  <p className="text-destructive text-sm mb-2">{error}</p>
                ) : null}
                <p className="text-text-secondary text-sm">
                  or{" "}
                  <span className="text-primary underline-offset-4 hover:underline cursor-pointer">
                    browse files
                  </span>{" "}
                  from your device
                </p>
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
