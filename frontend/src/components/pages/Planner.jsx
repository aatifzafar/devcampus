import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, ClipboardCheck, Flag, ListTodo, Plus, Trash2, Upload, PartyPopper } from 'lucide-react';
import { ALL_TESTS, ASSIGNMENTS, PROJECT } from '../../data/appData';
import { registeredEvents } from '../../data/eventsData';
import { Button, Card, CardTitle, Chips, Empty, Pill, SubjectTag, fmtTime, inputClass, useStoredState } from './ui';

const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const dateKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const fromKey = (k) => {
  const [y, m, d] = k.split('-').map(Number);
  return new Date(y, m - 1, d, 23, 59);
};

const useTodos = () =>
  useStoredState('alliance-todos', [
    { id: 1, text: 'Revise normalisation for DBMS mid-term', date: dateKey(new Date(Date.now() + 86400000)), priority: 'high', done: false },
    { id: 2, text: 'Read Unit 4 TOC notes', date: dateKey(new Date()), priority: 'normal', done: false },
    { id: 3, text: 'Book lab slot for mini project demo', date: '', priority: 'normal', done: false },
    { id: 4, text: 'Finish Java lab record 5', date: dateKey(new Date(Date.now() - 6 * 86400000)), priority: 'normal', done: true },
  ]);

function useEvents(todos) {
  return useMemo(() => {
    const ev = [];
    ALL_TESTS.forEach((t) => ev.push({ date: t.start, kind: 'test', title: t.title, code: t.code, time: fmtTime(t.start) }));
    ASSIGNMENTS.filter((a) => a.status === 'pending').forEach((a) => ev.push({ date: a.due, kind: 'due', title: a.title, code: a.code, time: fmtTime(a.due) }));
    PROJECT.milestones.filter((m) => m.status !== 'done').forEach((m) => ev.push({ date: m.due, kind: 'due', title: `Project: ${m.title}`, code: PROJECT.code }));
    const y = new Date().getFullYear();
    ev.push({ date: new Date(y, 10, 1), kind: 'holiday', title: 'Kannada Rajyotsava (holiday)' });
    todos.filter((t) => t.date && !t.done).forEach((t) => ev.push({ date: fromKey(t.date), kind: 'todo', title: t.text }));
    registeredEvents().forEach((e) => ev.push({ date: e.start, kind: 'event', title: e.title, time: fmtTime(e.start) }));
    return ev;
  }, [todos]);
}

const KIND = {
  test: { label: 'Test', dot: 'bg-sky-500', icon: ClipboardCheck, tone: 'blue' },
  due: { label: 'Due', dot: 'bg-orange-500', icon: Upload, tone: 'orange' },
  holiday: { label: 'Holiday', dot: 'bg-emerald-500', icon: PartyPopper, tone: 'green' },
  todo: { label: 'To-do', dot: 'bg-[#6D3FC0]', icon: ListTodo, tone: 'violet' },
  event: { label: 'Event', dot: 'bg-pink-500', icon: PartyPopper, tone: 'red' },
};

export function PlannerCalendar({ onNavigate }) {
  const [todos] = useTodos();
  const events = useEvents(todos);
  const today = new Date();
  const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState(today);

  const first = (month.getDay() + 6) % 7; // Monday first
  const daysIn = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = Array.from({ length: Math.ceil((first + daysIn) / 7) * 7 }, (_, i) => {
    const day = i - first + 1;
    return day >= 1 && day <= daysIn ? new Date(month.getFullYear(), month.getMonth(), day) : null;
  });
  const on = (d) => events.filter((e) => sameDay(e.date, d));
  const selectedEvents = on(selected);
  const shift = (n) => setMonth(new Date(month.getFullYear(), month.getMonth() + n, 1));

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-5">
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-semibold text-zinc-900">{month.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</h3>
          <button onClick={() => { setMonth(new Date(today.getFullYear(), today.getMonth(), 1)); setSelected(today); }} className="ml-3 text-sm text-[#6D3FC0] hover:underline">Today</button>
          <button onClick={() => shift(-1)} className="ml-auto w-9 h-9 rounded-full hover:bg-zinc-100 flex items-center justify-center" aria-label="Previous month"><ChevronLeft className="w-5 h-5" /></button>
          <button onClick={() => shift(1)} className="w-9 h-9 rounded-full hover:bg-zinc-100 flex items-center justify-center" aria-label="Next month"><ChevronRight className="w-5 h-5" /></button>
        </div>
        <div className="grid grid-cols-7 text-xs text-zinc-500 mb-1">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => <div key={d} className="px-2 py-1">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            if (!d) return <div key={i} className="h-20 sm:h-24" />;
            const ev = on(d);
            const isSel = sameDay(d, selected);
            const isToday = sameDay(d, today);
            return (
              <button
                key={i}
                onClick={() => setSelected(d)}
                className={`h-20 sm:h-24 rounded-xl p-1.5 text-left flex flex-col border transition-colors ${isSel ? 'border-[#6D3FC0] bg-[#F7F5FD]' : 'border-transparent hover:bg-zinc-50'}`}
              >
                <span className={`text-sm w-7 h-7 rounded-full flex items-center justify-center ${isToday ? 'bg-[#6D3FC0] text-white font-semibold' : 'text-zinc-700'}`}>{d.getDate()}</span>
                <span className="mt-auto space-y-0.5 w-full hidden sm:block">
                  {ev.slice(0, 2).map((e, j) => (
                    <span key={j} className="flex items-center gap-1 text-[11px] text-zinc-600 truncate">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${KIND[e.kind].dot}`} />
                      <span className="truncate">{e.title}</span>
                    </span>
                  ))}
                  {ev.length > 2 && <span className="text-[11px] text-zinc-400">+{ev.length - 2} more</span>}
                </span>
                <span className="mt-auto flex gap-0.5 sm:hidden">{ev.map((e, j) => <span key={j} className={`w-1.5 h-1.5 rounded-full ${KIND[e.kind].dot}`} />)}</span>
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-4 mt-4 text-xs text-zinc-500">
          {Object.entries(KIND).map(([k, v]) => <span key={k} className="flex items-center gap-1.5"><span className={`w-2 h-2 rounded-full ${v.dot}`} />{v.label}</span>)}
        </div>
      </Card>
      <Card className="lg:sticky lg:top-4 self-start">
        <CardTitle hint={`${selectedEvents.length} item${selectedEvents.length === 1 ? '' : 's'}`}>
          {selected.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </CardTitle>
        {selectedEvents.length === 0 ? (
          <Empty title="Nothing planned" text="Add a to-do for this day under My to-dos." />
        ) : (
          <ul className="space-y-3">
            {selectedEvents.map((e, i) => {
              const K = KIND[e.kind];
              const Icon = K.icon;
              return (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-9 h-9 rounded-xl bg-zinc-100 text-zinc-600 flex items-center justify-center shrink-0"><Icon className="w-4 h-4" /></span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-900">{e.title}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Pill tone={K.tone}>{K.label}{e.time ? ` · ${e.time}` : ''}</Pill>
                      {e.code && <SubjectTag code={e.code} />}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <Button className="w-full mt-5" onClick={() => onNavigate('planner-todos')}><Plus className="w-4 h-4" />Add a to-do</Button>
      </Card>
    </div>
  );
}

export function PlannerTodos() {
  const [todos, setTodos] = useTodos();
  const [text, setText] = useState('');
  const [date, setDate] = useState('');
  const [priority, setPriority] = useState('normal');
  const [filter, setFilter] = useState('open');

  const add = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setTodos((l) => [{ id: Date.now(), text: text.trim(), date, priority, done: false }, ...l]);
    setText('');
    setDate('');
    setPriority('normal');
  };
  const toggle = (id) => setTodos((l) => l.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const remove = (id) => setTodos((l) => l.filter((t) => t.id !== id));

  const todayKey = dateKey(new Date());
  const open = todos.filter((t) => !t.done);
  const groups = filter === 'done'
    ? [['Done', todos.filter((t) => t.done)]]
    : [
        ['Overdue', open.filter((t) => t.date && t.date < todayKey)],
        ['Today', open.filter((t) => t.date === todayKey)],
        ['Upcoming', open.filter((t) => t.date > todayKey).sort((a, b) => a.date.localeCompare(b.date))],
        ['Any time', open.filter((t) => !t.date)],
      ];

  return (
    <div className="max-w-3xl space-y-5">
      <Card>
        <form onSubmit={add} className="flex flex-col sm:flex-row gap-2">
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="What do you need to do?" className={`${inputClass} flex-1`} />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={`${inputClass} sm:!w-40`} aria-label="Due date" />
          <select value={priority} onChange={(e) => setPriority(e.target.value)} className={`${inputClass} sm:!w-32`} aria-label="Priority">
            <option value="normal">Normal</option>
            <option value="high">Important</option>
          </select>
          <Button variant="primary" type="submit" disabled={!text.trim()}><Plus className="w-4 h-4" />Add</Button>
        </form>
      </Card>
      <Chips value={filter} onChange={setFilter} options={[{ id: 'open', label: 'To do', count: open.length }, { id: 'done', label: 'Done', count: todos.length - open.length }]} />
      {groups.every(([, l]) => l.length === 0) ? (
        <Card><Empty icon={ListTodo} title={filter === 'done' ? 'Nothing done yet' : 'Your list is clear'} /></Card>
      ) : (
        groups.filter(([, l]) => l.length).map(([label, list]) => (
          <div key={label}>
            <p className={`text-sm font-semibold mb-2 ${label === 'Overdue' ? 'text-red-600' : 'text-zinc-900'}`}>{label}</p>
            <Card className="!p-0 overflow-hidden">
              <ul className="divide-y divide-zinc-100">
                {list.map((t) => (
                  <li key={t.id} className="flex items-center gap-3 px-5 py-3.5 group">
                    <input type="checkbox" checked={t.done} onChange={() => toggle(t.id)} className="w-5 h-5 accent-[#6D3FC0] shrink-0" aria-label={`Mark ${t.text} done`} />
                    <div className="min-w-0 flex-1">
                      <p className={`text-[15px] ${t.done ? 'line-through text-zinc-400' : 'text-zinc-900'}`}>{t.text}</p>
                      {t.date && <p className="text-xs text-zinc-500">{fromKey(t.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</p>}
                    </div>
                    {t.priority === 'high' && !t.done && <Pill tone="red"><Flag className="w-3 h-3" />Important</Pill>}
                    <button onClick={() => remove(t.id)} className="text-zinc-300 hover:text-red-500 sm:opacity-0 group-hover:opacity-100" aria-label="Delete"><Trash2 className="w-4 h-4" /></button>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        ))
      )}
    </div>
  );
}
