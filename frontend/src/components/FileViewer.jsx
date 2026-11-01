// Shows a real file inside the page: PDF, image, video, audio or text.
// Other types (Word, PowerPoint, ZIP) can't be shown by the browser, so we
// say so and offer the download.
import React, { useEffect, useState } from 'react';
import { Download, FileText, LoaderCircle } from 'lucide-react';
import { downloadBlob, fmtSize, previewKind } from '../utils/files';

export default function FileViewer({ file, loading = false, missing = 'This file is no longer available.', className = 'h-[65vh]' }) {
  const [url, setUrl] = useState(null);
  const [text, setText] = useState(null);
  const kind = file ? previewKind(file.type, file.name) : null;

  useEffect(() => {
    if (!file?.blob) return undefined;
    const u = URL.createObjectURL(file.blob);
    setUrl(u);
    setText(null);
    if (kind === 'text') file.blob.text().then((t) => setText(t.slice(0, 200000)));
    return () => URL.revokeObjectURL(u);
  }, [file, kind]);

  const box = `w-full rounded-2xl bg-zinc-100 flex items-center justify-center text-center p-6 ${className}`;
  if (loading) return <div className={box}><LoaderCircle className="w-8 h-8 text-zinc-400 animate-spin" /></div>;
  if (!file) return <div className={box}><p className="text-zinc-600">{missing}</p></div>;
  if (!url) return <div className={box} />;

  if (kind === 'pdf') return <iframe title={file.name} src={url} className={`w-full rounded-2xl border border-zinc-200 bg-white ${className}`} />;
  if (kind === 'image') return <div className={`${box} !p-2 overflow-auto`}><img src={url} alt={file.name} className="max-w-full max-h-full object-contain" /></div>;
  if (kind === 'video') return <video src={url} controls className={`w-full rounded-2xl bg-black ${className}`} />;
  if (kind === 'audio') return <div className={box}><audio src={url} controls className="w-full max-w-md" /></div>;
  if (kind === 'text') return <pre className={`w-full rounded-2xl bg-zinc-950 text-zinc-100 text-[13px] leading-relaxed p-5 overflow-auto text-left ${className}`}>{text ?? ''}</pre>;
  return (
    <div className={box}>
      <div>
        <FileText className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
        <p className="text-zinc-800 font-medium">{file.name}</p>
        <p className="text-sm text-zinc-500 mb-4">{fmtSize(file.size)} · this file type opens in its own app, not in the browser.</p>
        <button onClick={() => downloadBlob(file.blob, file.name)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#6D3FC0] text-white text-sm font-medium hover:bg-[#5B32A6]">
          <Download className="w-4 h-4" />Download to open
        </button>
      </div>
    </div>
  );
}

// Load a stored file by id (IndexedDB) for the viewer.
export function useStoredFile(id) {
  const [state, setState] = useState({ loading: Boolean(id), file: null });
  useEffect(() => {
    let alive = true;
    if (!id) { setState({ loading: false, file: null }); return undefined; }
    setState({ loading: true, file: null });
    import('../utils/files').then(({ getFile }) => getFile(id)).then((f) => alive && setState({ loading: false, file: f }));
    return () => { alive = false; };
  }, [id]);
  return state;
}
