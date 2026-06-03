import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Library as LibraryIcon,
  UploadCloud,
  FileText,
  X,
  Check,
  BookOpen,
} from "lucide-react";
import GlassCard from "@/components/liquid/GlassCard.jsx";
import { validateFile, formatBytes } from "@/lib/documentsApi.js";
import { cn } from "@/lib/cn.js";

const ACCENT = "#06b6d4";

export default function Library() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [dragOver, setDragOver] = useState(false);
  const [staged, setStaged] = useState(null); // { file, error }

  const stageFile = (file) => {
    const error = validateFile(file);
    setStaged({ file, error });
  };

  const onPick = (e) => {
    const file = e.target.files?.[0];
    if (file) stageFile(file);
    e.target.value = "";
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) stageFile(file);
  };

  const confirmOpen = () => {
    if (!staged?.file || staged.error) return;

    const file = staged.file;
    const ext = file.name.toLowerCase().endsWith(".pdf") ? "pdf" : "docx";
    const tempUrl = URL.createObjectURL(file);

    navigate("/library/read", {
      state: {
        doc: {
          id: `local-${Date.now()}`,
          title: file.name.replace(/\.(pdf|docx)$/i, ""),
          ext,
          size: file.size,
          fileUrl: tempUrl,
          localOnly: true,
        },
      },
    });

    setStaged(null);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <GlassCard interactive={false} iris className="relative overflow-hidden rounded-[2rem] p-6 sm:p-9">
        <div className="relative max-w-3xl">
          <div
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]"
            style={{ color: ACCENT, textShadow: `0 0 12px ${ACCENT}99` }}
          >
            <LibraryIcon className="h-4 w-4" /> The Library
          </div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl lit-text">
            Read anything, beautifully
          </h1>
          <p className="mt-3 text-muted">
            Upload a PDF or Word document and read it instantly in the same liquid-glass atmosphere.
            Nothing is uploaded to a backend, and nothing is saved.
          </p>
        </div>
      </GlassCard>

      <div className="mt-8">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx"
          className="hidden"
          onChange={onPick}
        />

        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={cn(
            "glass glass-interactive relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl px-6 py-12 text-center transition-all",
            dragOver && "scale-[1.01] ring-2 ring-[color:rgb(var(--ring))]",
          )}
        >
          <span
            className="glass-orb grid h-16 w-16 place-items-center"
            style={{ color: ACCENT, boxShadow: `inset 0 0 18px ${ACCENT}44, 0 0 18px ${ACCENT}33` }}
          >
            <UploadCloud className="h-7 w-7" style={{ filter: `drop-shadow(0 0 6px ${ACCENT})` }} />
          </span>
          <div>
            <p className="text-base font-semibold lit-text">
              Drop a PDF or .docx here, or click to browse
            </p>
            <p className="mt-1 text-sm text-muted">Up to 200 MB · opens locally in your browser</p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {staged && (
          <motion.div
            className="fixed inset-0 z-[60] grid place-items-center bg-black/50 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setStaged(null)}
          >
            <motion.div
              className="glass animate-iris w-full max-w-md rounded-3xl p-6"
              initial={{ scale: 0.94, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 12 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-3">
                <span className="glass-orb grid h-12 w-12 shrink-0 place-items-center" style={{ color: ACCENT }}>
                  <FileText className="h-6 w-6" />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold lit-text" title={staged.file.name}>
                    {staged.file.name}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">{formatBytes(staged.file.size)}</p>
                </div>

                <button
                  onClick={() => setStaged(null)}
                  className="glass-orb grid h-8 w-8 place-items-center text-muted hover:text-[color:rgb(var(--text))]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {staged.error ? (
                <p className="mt-4 rounded-xl bg-red-500/15 px-3 py-2 text-sm text-red-400">
                  {staged.error}
                </p>
              ) : (
                <p className="mt-4 text-sm text-muted">
                  Ready to open. This file stays in-browser only for the current session.
                </p>
              )}

              <div className="mt-6 flex items-center justify-end gap-2">
                <button onClick={() => setStaged(null)} className="btn-ghost">
                  Cancel
                </button>
                <button
                  onClick={confirmOpen}
                  disabled={!!staged.error}
                  className="btn-primary disabled:opacity-50"
                  style={{ background: ACCENT }}
                >
                  <Check className="h-4 w-4" /> Open in Reader
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <GlassCard interactive={false} className="mt-8 rounded-2xl p-4 text-sm text-muted">
        <p className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-cyan-400" />
          Stateless mode: if the reader page is refreshed, re-upload the file.
        </p>
      </GlassCard>
    </div>
  );
}
