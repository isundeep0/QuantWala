import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Library as LibraryIcon,
  UploadCloud,
  FileText,
  Trash2,
  BookOpen,
  Loader2,
  X,
  Check,
  RefreshCw,
  ServerCrash,
  Pencil,
} from "lucide-react";
import GlassCard from "@/components/liquid/GlassCard.jsx";
import {
  listDocuments,
  uploadDocument,
  deleteDocument,
  renameDocument,
  checkHealth,
  validateFile,
  formatBytes,
} from "@/lib/documentsApi.js";
import { cn } from "@/lib/cn.js";

const ACCENT = "#06b6d4";

function timeAgo(ms) {
  if (!ms) return "";
  const d = new Date(ms);
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function extColor(ext) {
  return ext === "pdf" ? "#f43f5e" : "#3b82f6";
}

function DocCard({ doc, onOpen, onDelete, onRename }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(doc.title);
  const color = extColor(doc.ext);

  const commit = async () => {
    setEditing(false);
    const t = title.trim();
    if (t && t !== doc.title) await onRename(doc.id, t);
    else setTitle(doc.title);
  };

  return (
    <GlassCard
      className="group flex h-full flex-col p-4"
      style={{ borderRadius: "1.4rem 1.4rem 2rem 1.4rem", "--glow": `${color}aa` }}
    >
      <div className="flex items-start gap-3">
        <span
          className="glass-orb grid h-11 w-11 shrink-0 place-items-center"
          style={{ color, boxShadow: `inset 0 0 14px ${color}40, 0 0 12px ${color}26` }}
        >
          <FileText className="h-5 w-5" style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
        </span>
        <div className="min-w-0 flex-1">
          {editing ? (
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === "Enter") commit();
                if (e.key === "Escape") {
                  setTitle(doc.title);
                  setEditing(false);
                }
              }}
              className="input w-full py-1 text-sm"
            />
          ) : (
            <h3
              className="line-clamp-2 cursor-text text-sm font-semibold leading-snug lit-text"
              title={doc.title}
              onDoubleClick={() => setEditing(true)}
            >
              {doc.title}
            </h3>
          )}
          <div className="mt-1 flex items-center gap-2 text-[11px] text-faint">
            <span className="uppercase tracking-wide" style={{ color }}>
              {doc.ext}
            </span>
            <span>·</span>
            <span className="font-mono">{formatBytes(doc.size)}</span>
            <span>·</span>
            <span>{timeAgo(doc.uploadedAt)}</span>
          </div>
        </div>
      </div>

      <div
        className="mt-4 flex items-center gap-2 pt-3"
        style={{ borderTop: "1px solid rgb(var(--glass-stroke) / 0.08)" }}
      >
        <button
          onClick={() => onOpen(doc.id)}
          className="btn-primary flex-1 py-1.5 text-sm"
          style={{ background: color }}
        >
          <BookOpen className="h-4 w-4" /> Read
        </button>
        <button
          onClick={() => setEditing(true)}
          className="glass-orb glass-interactive grid h-9 w-9 place-items-center text-muted hover:text-[color:rgb(var(--text))]"
          title="Rename"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={() => onDelete(doc)}
          className="glass-orb glass-interactive grid h-9 w-9 place-items-center text-muted hover:text-red-400"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </GlassCard>
  );
}

export default function Library() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [online, setOnline] = useState(null); // null=checking, true/false
  const [docs, setDocs] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  const [staged, setStaged] = useState(null); // { file, error }
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [toast, setToast] = useState(null);

  const refresh = useCallback(async () => {
    setLoadingList(true);
    const health = await checkHealth();
    setOnline(health.ok);
    if (health.ok) {
      try {
        setDocs(await listDocuments());
      } catch {
        setOnline(false);
      }
    }
    setLoadingList(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

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

  const confirmUpload = async () => {
    if (!staged?.file || staged.error) return;
    setUploading(true);
    setProgress(0);
    try {
      const meta = await uploadDocument(staged.file, setProgress);
      setStaged(null);
      setUploading(false);
      // Straight into the reader — "click OK → load the whole textbook".
      navigate(`/library/${meta.id}`);
    } catch (e) {
      setUploading(false);
      setStaged((s) => ({ ...s, error: e.message }));
    }
  };

  const onDelete = async (doc) => {
    if (!confirm(`Delete “${doc.title}”? This removes it from the server permanently.`)) return;
    try {
      await deleteDocument(doc.id);
      setDocs((d) => d.filter((x) => x.id !== doc.id));
      setToast("Document deleted");
      setTimeout(() => setToast(null), 2200);
    } catch (e) {
      setToast(e.message);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const onRename = async (docId, title) => {
    try {
      const updated = await renameDocument(docId, title);
      setDocs((d) => d.map((x) => (x.id === docId ? { ...x, title: updated.title } : x)));
    } catch {
      /* keep old title */
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Module lens */}
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
            Upload a PDF or Word document and read it inside the same liquid-glass
            atmosphere as the rest of QuantWala. Pages float over the nebula, with
            Paper, Sepia and Night reading modes tuned for long, comfortable sessions.
            Your documents stay on your server — and you can delete them any time.
          </p>
        </div>
      </GlassCard>

      {/* Upload zone */}
      <div className="mt-8">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx"
          className="hidden"
          onChange={onPick}
        />
        <div
          onClick={() => online !== false && fileInputRef.current?.click()}
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
            <p className="mt-1 text-sm text-muted">Up to 200 MB · stays on your server</p>
          </div>
        </div>
      </div>

      {/* Offline notice */}
      {online === false && (
        <GlassCard interactive={false} className="mt-6 flex items-start gap-4 rounded-2xl p-5">
          <span className="glass-orb grid h-11 w-11 shrink-0 place-items-center text-amber-400">
            <ServerCrash className="h-5 w-5" />
          </span>
          <div className="flex-1 text-sm">
            <p className="font-semibold lit-text">The library server isn’t running</p>
            <p className="mt-1 text-muted">
              The Library stores your files on the FastAPI backend. Start it, then reload:
            </p>
            <pre className="mt-2 overflow-x-auto rounded-xl surface-sunken px-3 py-2 font-mono text-xs">
cd backend
python -m venv .venv &amp;&amp; source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
            </pre>
          </div>
          <button onClick={refresh} className="btn-ghost shrink-0">
            <RefreshCw className="h-4 w-4" /> Retry
          </button>
        </GlassCard>
      )}

      {/* Document grid */}
      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold lit-text">
            Your documents{docs.length ? ` · ${docs.length}` : ""}
          </h2>
          {online && (
            <button onClick={refresh} className="btn-ghost py-1.5 text-sm" title="Refresh">
              <RefreshCw className={cn("h-4 w-4", loadingList && "animate-spin")} /> Refresh
            </button>
          )}
        </div>

        {loadingList ? (
          <div className="flex items-center gap-2 py-10 text-muted">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading…
          </div>
        ) : online && docs.length === 0 ? (
          <div
            className="rounded-2xl border border-dashed p-10 text-center text-sm text-faint"
            style={{ borderColor: "rgb(var(--glass-stroke) / 0.15)" }}
          >
            No documents yet. Upload your first textbook above.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {docs.map((doc) => (
              <DocCard
                key={doc.id}
                doc={doc}
                onOpen={(docId) => navigate(`/library/${docId}`)}
                onDelete={onDelete}
                onRename={onRename}
              />
            ))}
          </div>
        )}
      </div>

      {/* Staged-upload confirm modal */}
      <AnimatePresence>
        {staged && (
          <motion.div
            className="fixed inset-0 z-[60] grid place-items-center bg-black/50 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !uploading && setStaged(null)}
          >
            <motion.div
              className="glass animate-iris w-full max-w-md rounded-3xl p-6"
              initial={{ scale: 0.94, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 12 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-3">
                <span
                  className="glass-orb grid h-12 w-12 shrink-0 place-items-center"
                  style={{ color: ACCENT }}
                >
                  <FileText className="h-6 w-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold lit-text" title={staged.file.name}>
                    {staged.file.name}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">{formatBytes(staged.file.size)}</p>
                </div>
                {!uploading && (
                  <button
                    onClick={() => setStaged(null)}
                    className="glass-orb grid h-8 w-8 place-items-center text-muted hover:text-[color:rgb(var(--text))]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {staged.error ? (
                <p className="mt-4 rounded-xl bg-red-500/15 px-3 py-2 text-sm text-red-400">
                  {staged.error}
                </p>
              ) : (
                <p className="mt-4 text-sm text-muted">
                  Ready to open. We’ll upload it to your server and drop you straight
                  into the reader.
                </p>
              )}

              {uploading && (
                <div className="mt-4">
                  <div className="h-2 overflow-hidden rounded-full surface-sunken">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background: `linear-gradient(90deg, ${ACCENT}99, ${ACCENT})`,
                        boxShadow: `0 0 10px ${ACCENT}`,
                      }}
                      animate={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-center font-mono text-xs text-muted">
                    {progress < 100 ? `Uploading ${progress}%` : "Processing…"}
                  </p>
                </div>
              )}

              <div className="mt-6 flex items-center justify-end gap-2">
                {!uploading && (
                  <button onClick={() => setStaged(null)} className="btn-ghost">
                    Cancel
                  </button>
                )}
                <button
                  onClick={confirmUpload}
                  disabled={!!staged.error || uploading}
                  className="btn-primary disabled:opacity-50"
                  style={{ background: ACCENT }}
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  {uploading ? "Opening…" : "OK, open it"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className="glass fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 rounded-full px-4 py-2 text-sm"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
