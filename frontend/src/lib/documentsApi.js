/**
 * Client for the QuantWala document-library backend.
 *
 * The library is the one part of the app that genuinely needs a server (files
 * must persist + be deletable), so it talks to the optional FastAPI backend.
 * For production (for example GitHub Pages), set VITE_API_BASE to your hosted
 * backend URL in the build environment.
 */
const configuredBase = (import.meta.env.VITE_API_BASE || "").trim();
const fallbackBase = import.meta.env.DEV ? "http://localhost:8000" : "";
const API_BASE = (configuredBase || fallbackBase).replace(/\/$/, "");

export const hasApiBase = API_BASE.length > 0;

export const apiBase = API_BASE;

function requireApiBase() {
  if (hasApiBase) return;
  throw new Error(
    "Library server is not configured. Set VITE_API_BASE to your hosted backend URL and redeploy.",
  );
}

/** URL that streams the raw file bytes (consumed by pdf.js / mammoth). */
export function fileUrl(id) {
  return `${API_BASE}/api/documents/${id}/file`;
}

async function asJson(res) {
  let body = null;
  try {
    body = await res.json();
  } catch {
    /* non-JSON error body */
  }
  if (!res.ok) {
    const detail = body?.detail || `Request failed (${res.status})`;
    throw new Error(detail);
  }
  return body;
}

/** Quick reachability probe so the UI can guide the user to start the server. */
export async function checkHealth() {
  if (!hasApiBase) {
    return { ok: false, reason: "missing_api_base" };
  }
  try {
    const res = await fetch(`${API_BASE}/api/health`, { method: "GET" });
    if (!res.ok) return { ok: false };
    const data = await res.json();
    return { ok: true, ...data };
  } catch {
    return { ok: false };
  }
}

export async function listDocuments() {
  requireApiBase();
  const res = await fetch(`${API_BASE}/api/documents`);
  const data = await asJson(res);
  return data.documents || [];
}

export async function getDocument(id) {
  requireApiBase();
  const res = await fetch(`${API_BASE}/api/documents/${id}`);
  return asJson(res);
}

export async function renameDocument(id, title) {
  requireApiBase();
  const res = await fetch(`${API_BASE}/api/documents/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  return asJson(res);
}

export async function deleteDocument(id) {
  requireApiBase();
  const res = await fetch(`${API_BASE}/api/documents/${id}`, { method: "DELETE" });
  return asJson(res);
}

/**
 * Upload via XHR so we can surface real progress (fetch has no upload progress).
 * Resolves with the new document's metadata.
 */
export function uploadDocument(file, onProgress) {
  if (!hasApiBase) {
    return Promise.reject(
      new Error(
        "Library server is not configured. Set VITE_API_BASE to your hosted backend URL and redeploy.",
      ),
    );
  }
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE}/api/documents`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = () => {
      let body = null;
      try {
        body = JSON.parse(xhr.responseText);
      } catch {
        /* ignore */
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(body);
      } else {
        reject(new Error(body?.detail || `Upload failed (${xhr.status})`));
      }
    };
    xhr.onerror = () =>
      reject(new Error("Could not reach the server. Is the backend running?"));
    xhr.send(form);
  });
}

const ACCEPTED = [".pdf", ".docx"];

/** Returns null if valid, else a human error string. */
export function validateFile(file) {
  if (!file) return "No file selected.";
  const name = file.name.toLowerCase();
  if (!ACCEPTED.some((ext) => name.endsWith(ext))) {
    return "Only PDF and Word (.docx) files are supported.";
  }
  if (file.size > 200 * 1024 * 1024) {
    return "File is larger than the 200 MB limit.";
  }
  return null;
}

export function formatBytes(bytes = 0) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i ? 1 : 0)} ${units[i]}`;
}
