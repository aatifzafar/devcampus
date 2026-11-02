// Small shared building blocks for the student pages.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { STATE_EVENT, isSignedIn, isSyncedKey, readSaved, stateGet, stateSet, writeSaved } from '../../utils/session';
import { X } from 'lucide-react';
import { SEMESTERS, CURRENT_SEMESTER } from '../../data/subjectsData';

export const CURRENT_SUBJECTS = SEMESTERS.find((s) => s.number === CURRENT_SEMESTER).subjects;
export const subjectOf = (code) => CURRENT_SUBJECTS.find((s) => s.code === code) || { code, name: code, color: '#71717A' };

export const ACCENT = '#6D3FC0';

/* ---------- dates ---------- */
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const dayDiff = (d) => Math.round((startOfDay(d) - startOfDay(new Date())) / 86400000);
export const fmtTime = (d) => d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
export const fmtDay = (d) => {
  const diff = dayDiff(d);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
};
export const fmtWhen = (d) => `${fmtDay(d)}, ${fmtTime(d)}`;
export const fmtDate = (d) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
export const fromNow = (d) => {
  const ms = d - new Date();
  const mins = Math.round(Math.abs(ms) / 60000);
  const days = Math.abs(dayDiff(d));
  let span;
  if (mins < 60) span = `${mins} min`;
  else if (mins < 1440 && days <= 1) span = `${Math.round(mins / 60)} h`;
  else span = `${days} day${days === 1 ? '' : 's'}`;
  return ms < 0 ? `${span} ago` : `in ${span}`;
};
export const ago = (d) => {
  const mins = Math.round((new Date() - d) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  if (mins < 1440) return `${Math.round(mins / 60)} h ago`;
  const days = Math.round(mins / 1440);
  return days < 30 ? `${days} day${days === 1 ? '' : 's'} ago` : fmtDate(d);
};

/* ---------- state that survives a refresh (per browser) ---------- */
// State saved for the signed-in user.
// - Signed in: kept in PostgreSQL (via /api/state), shared across devices.
// - A few per-tab keys, or when signed out: kept in this browser (localStorage).
// Updates made elsewhere (another tab, another person, the server) flow in.
export const LOCAL_CHANGE = STATE_EVENT;
export function useStoredState(key, initial) {
  const server = isSignedIn() && isSyncedKey(key);
  const read = () => {
    if (server) return stateGet(key, initial);
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  };
  const [value, setValue] = useState(read);
  const dirty = useRef(false);
  const set = useCallback((v) => {
    dirty.current = true;
    setValue(v);
  }, []);

  // Save after a change made here.
  useEffect(() => {
    if (!dirty.current) return;
    dirty.current = false;
    if (server) stateSet(key, value);
    else {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        window.dispatchEvent(new CustomEvent(LOCAL_CHANGE, { detail: key }));
      } catch {
        /* storage unavailable: keep in memory */
      }
    }
  }, [key, value, server]);

  // Take in changes made elsewhere.
  useEffect(() => {
    const sync = (e) => {
      if ((e.key && e.key !== key) || (e.detail && e.detail !== key)) return;
      if (e.type === 'storage' && server) return;
      if (dirty.current) return;
      setValue(read());
    };
    window.addEventListener('storage', sync);
    window.addEventListener(LOCAL_CHANGE, sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener(LOCAL_CHANGE, sync);
    };
  }, [key, server]); // eslint-disable-line react-hooks/exhaustive-deps
  return [value, set];
}

export { readSaved, writeSaved };

/* ---------- components ---------- */
export const Card = ({ children, className = '', ...rest }) => (
  <div className={`glass-card rounded-3xl p-5 sm:p-6 ${className}`} {...rest}>
    {children}
  </div>
);

export const CardTitle = ({ children, hint, action }) => (
  <div className="flex items-start gap-3 mb-4">
    <div className="min-w-0">
      <h3 className="text-base font-semibold text-zinc-900">{children}</h3>
      {hint && <p className="text-sm text-zinc-500">{hint}</p>}
    </div>
    {action && <div className="ml-auto shrink-0">{action}</div>}
  </div>
);

export function Chips({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const id = typeof o === 'string' ? o : o.id;
        const label = typeof o === 'string' ? o : o.label;
        const on = value === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`px-3 py-1.5 rounded-full text-sm transition-all cursor-pointer ${
              on ? 'bg-[#6D3FC0] text-white font-medium shadow-xs' : 'glass-subtle text-zinc-700 hover:text-zinc-900'
            }`}
          >
            {label}
            {o.count !== undefined && <span className={`ml-1.5 text-xs ${on ? 'text-white/80' : 'text-zinc-400'}`}>{o.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

export const SubjectTag = ({ code, subject }) => {
  const s = subject || subjectOf(code);
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-zinc-600 min-w-0 font-medium">
      <span className="w-2 h-2 rounded-full shrink-0 shadow-xs" style={{ background: s.color }} />
      <span className="truncate">{s.name}</span>
    </span>
  );
};

export const Pill = ({ tone = 'zinc', children, className = '' }) => {
  const tones = {
    zinc: 'glass-subtle text-zinc-700',
    violet: 'bg-[#F1EEFB]/90 text-[#4C2E8A] border border-indigo-200/60',
    red: 'bg-red-50/90 text-red-700 border border-red-200/60',
    orange: 'bg-orange-50/90 text-orange-700 border border-orange-200/60',
    amber: 'bg-amber-50/90 text-amber-800 border border-amber-200/60',
    green: 'bg-emerald-50/90 text-emerald-700 border border-emerald-200/60',
    blue: 'bg-sky-50/90 text-sky-700 border border-sky-200/60',
  };
  return <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap shadow-xs ${tones[tone]} ${className}`}>{children}</span>;
};

export const Button = ({ variant = 'secondary', className = '', children, ...rest }) => {
  const styles = {
    primary: 'bg-[#6D3FC0] text-white hover:bg-[#5B32A6] shadow-sm',
    secondary: 'border border-white/80 text-zinc-800 glass-subtle hover:bg-white/85 shadow-xs',
    ghost: 'text-[#6D3FC0] hover:bg-white/60',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
  };
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all disabled:opacity-50 cursor-pointer ${styles[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
};

export function Empty({ icon: Icon, title, text, action }) {
  return (
    <div className="py-12 text-center">
      {Icon && <Icon className="w-9 h-9 text-zinc-300 mx-auto mb-3" />}
      <p className="font-medium text-zinc-900">{title}</p>
      {text && <p className="text-sm text-zinc-500 mt-1 max-w-sm mx-auto">{text}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Modal({ title, subtitle, onClose, children, footer, wide = false }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-end sm:items-center justify-center sm:p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className={`glass-modal w-full ${wide ? 'sm:max-w-3xl' : 'sm:max-w-lg'} max-h-[90vh] rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl`}
      >
        <div className="flex items-start gap-3 p-5 border-b border-white/60">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
            {subtitle && <p className="text-sm text-zinc-500">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="ml-auto w-9 h-9 rounded-full hover:bg-white/70 flex items-center justify-center text-zinc-500 shrink-0 cursor-pointer transition-colors" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto p-5 flex-1">{children}</div>
        {footer && <div className="p-4 border-t border-white/60 flex justify-end gap-2 bg-white/40">{footer}</div>}
      </div>
    </div>
  );
}

export const Stat = ({ label, value, hint, tone }) => (
  <div className="rounded-2xl glass-card px-4 py-3.5">
    <p className="text-xs text-zinc-500">{label}</p>
    <p className={`text-2xl font-semibold ${tone || 'text-zinc-900'}`}>{value}</p>
    {hint && <p className="text-xs text-zinc-500">{hint}</p>}
  </div>
);

// group: for a row of buttons (not a single input), so it isn't wrapped in a <label>.
export const Field = ({ label, children, hint, group = false }) => {
  const Tag = group ? 'div' : 'label';
  return (
    <Tag className="block mb-4" {...(group ? { role: 'group', 'aria-label': label } : {})}>
      <span className="block text-sm font-medium text-zinc-800 mb-1.5">{label}</span>
      {children}
      {hint && <span className="block text-xs text-zinc-500 mt-1">{hint}</span>}
    </Tag>
  );
};

export const inputClass =
  'w-full px-3.5 py-2.5 rounded-xl border border-white/75 bg-white/55 backdrop-blur-md text-sm focus:outline-none focus:bg-white/90 focus:border-[#6D3FC0] focus:ring-2 focus:ring-[#6D3FC0]/15 shadow-xs transition-all';
