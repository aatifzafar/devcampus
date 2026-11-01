// Uploaded files (faculty materials, question papers, student submissions).
// Stored by the backend: bytes in backend/uploads, details in PostgreSQL.
import { apiFetch } from './session';

// Save a File/Blob under an id. Returns the id.
export async function saveFile(id, file, name = file.name) {
  await apiFetch(`/files/${encodeURIComponent(id)}`, {
    method: 'POST',
    raw: file,
    headers: { 'Content-Type': file.type || 'application/octet-stream', 'X-File-Name': encodeURIComponent(name || 'file') },
  });
  return id;
}

// { blob, name, type, size } or null.
export async function getFile(id) {
  if (!id) return null;
  try {
    const res = await apiFetch(`/files/${encodeURIComponent(id)}`, { blob: true });
    const blob = await res.blob();
    const name = decodeURIComponent(res.headers.get('X-File-Name') || 'file');
    return { blob, name, type: blob.type, size: blob.size };
  } catch {
    return null;
  }
}

export async function deleteFile(id) {
  try {
    await apiFetch(`/files/${encodeURIComponent(id)}`, { method: 'DELETE' });
  } catch {
    /* ignore */
  }
}

// Save a blob to the user's Downloads folder.
export function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}

// How the browser can show a file inside the page, if at all.
export function previewKind(type = '', name = '') {
  const ext = name.split('.').pop().toLowerCase();
  if (type === 'application/pdf' || ext === 'pdf') return 'pdf';
  if (type.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
  if (type.startsWith('video/') || ['mp4', 'webm', 'mov', 'm4v'].includes(ext)) return 'video';
  if (type.startsWith('audio/') || ['mp3', 'wav', 'm4a', 'ogg'].includes(ext)) return 'audio';
  if (type.startsWith('text/') || ['txt', 'md', 'csv', 'java', 'c', 'cpp', 'py', 'js', 'sql', 'json', 'html', 'xml'].includes(ext)) return 'text';
  return null;
}

export const fmtSize = (bytes = 0) => (bytes > 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);
