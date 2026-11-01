// Tiny PDF writer (no dependencies): text documents and slide decks.
//
// makePdf({ title, subtitle, footer, blocks }) -> Blob (application/pdf)
// blocks: { h: 'Heading' } | { p: 'Paragraph' } | { li: 'Bullet' } | { slide: { title, points: [] } } | { pageBreak: true }
// Pass slides: true for a landscape deck (each { slide } block is one page).

const ACCENT = [0.43, 0.25, 0.75]; // #6D3FC0

// Standard PDF fonts only cover Latin-1, so map common typography to ASCII.
const clean = (s = '') =>
  String(s)
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/·/g, '-')
    .replace(/…/g, '...')
    .replace(/→/g, '->')
    .replace(/←/g, '<-')
    .replace(/≥/g, '>=')
    .replace(/≤/g, '<=')
    .replace(/≠/g, '!=')
    .replace(/×/g, 'x')
    .replace(/ⁿ/g, '^n')
    .replace(/ᵐ/g, '^m')
    .replace(/ⁱ/g, '^i')
    .replace(/[⁰¹⁴⁵⁶⁷⁸⁹]/g, (c) => `^${'⁰¹  ⁴⁵⁶⁷⁸⁹'.indexOf(c)}`)
    .replace(/∗/g, '*')
    .replace(/∪/g, ' U ')
    .replace(/∩/g, ' n ')
    .replace(/∈/g, ' in ')
    .replace(/∅/g, 'empty set')
    .replace(/ε/g, 'e')
    .replace(/Σ/g, 'Sigma')
    .replace(/δ/g, 'delta')
    .replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF]/g, '');

const esc = (s) => clean(s).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

// Rough Helvetica widths (fraction of font size), good enough for wrapping.
const charW = (c) => {
  if ('il.,;:|!\'`'.includes(c)) return 0.25;
  if ('ftrIj()[] '.includes(c)) return 0.3;
  if ('mwMW'.includes(c)) return 0.85;
  if (c >= 'A' && c <= 'Z') return 0.68;
  return 0.54;
};
const textW = (s, size) => [...s].reduce((n, c) => n + charW(c), 0) * size;

function wrap(text, size, width) {
  const words = clean(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  words.forEach((w) => {
    const next = line ? `${line} ${w}` : w;
    if (textW(next, size) > width && line) {
      lines.push(line);
      line = w;
    } else line = next;
  });
  if (line) lines.push(line);
  return lines.length ? lines : [''];
}

export function makePdf({ title, subtitle = '', footer = '', blocks = [], slides = false }) {
  const W = slides ? 842 : 595;
  const H = slides ? 595 : 842;
  const M = slides ? 56 : 56;
  const pages = [];
  let ops = [];
  let y = 0;

  const text = (s, x, yy, size, bold = false, color = [0.1, 0.1, 0.12]) =>
    ops.push(`${color.join(' ')} rg BT /${bold ? 'F2' : 'F1'} ${size} Tf 1 0 0 1 ${x.toFixed(1)} ${yy.toFixed(1)} Tm (${esc(s)}) Tj ET`);
  const rect = (x, yy, w, h, color) => ops.push(`${color.join(' ')} rg ${x} ${yy} ${w} ${h} re f`);

  const newPage = () => {
    if (ops.length) pages.push(ops);
    ops = [];
    y = H - M;
    // footer on every page
    if (footer) text(footer, M, 28, 8, false, [0.5, 0.5, 0.55]);
    text(`${pages.length + 1}`, W - M - 10, 28, 8, false, [0.5, 0.5, 0.55]);
  };

  if (slides) {
    // Title slide
    newPage();
    rect(0, 0, W, H, ACCENT);
    wrap(title, 34, W - 2 * M).forEach((l, i) => text(l, M, H / 2 + 20 - i * 42, 34, true, [1, 1, 1]));
    if (subtitle) text(subtitle, M, H / 2 - 50, 16, false, [0.92, 0.9, 1]);
    if (footer) text(footer, M, 28, 8, false, [0.85, 0.82, 0.95]);
    blocks.filter((b) => b.slide).forEach(({ slide }) => {
      newPage();
      rect(0, H - 8, W, 8, ACCENT);
      let yy = H - M - 20;
      wrap(slide.title, 26, W - 2 * M).forEach((l) => { text(l, M, yy, 26, true); yy -= 32; });
      yy -= 16;
      (slide.points || []).forEach((pt) => {
        const lines = wrap(pt, 17, W - 2 * M - 26);
        rect(M, yy + 4, 7, 7, ACCENT);
        lines.forEach((l) => { text(l, M + 22, yy, 17); yy -= 23; });
        yy -= 10;
      });
    });
  } else {
    newPage();
    rect(0, H - 6, W, 6, ACCENT);
    y = H - M - 6;
    wrap(title, 20, W - 2 * M).forEach((l) => { text(l, M, y, 20, true); y -= 25; });
    if (subtitle) { wrap(subtitle, 11, W - 2 * M).forEach((l) => { text(l, M, y, 11, false, [0.42, 0.42, 0.46]); y -= 15; }); }
    y -= 12;
    const need = (h) => { if (y - h < 50) newPage(); };
    blocks.forEach((b) => {
      if (b.pageBreak) { newPage(); return; }
      if (b.h) {
        need(40);
        y -= 8;
        wrap(b.h, 14, W - 2 * M).forEach((l) => { text(l, M, y, 14, true, [0.3, 0.18, 0.54]); y -= 18; });
        y -= 2;
      } else if (b.li) {
        const lines = wrap(b.li, 11, W - 2 * M - 16);
        need(lines.length * 15);
        text('-', M + 3, y, 11);
        lines.forEach((l) => { text(l, M + 16, y, 11); y -= 15; });
        y -= 2;
      } else if (b.p) {
        const lines = wrap(b.p, 11, W - 2 * M);
        need(Math.min(lines.length, 3) * 15);
        lines.forEach((l) => { need(15); text(l, M, y, 11); y -= 15; });
        y -= 6;
      } else if (b.code) {
        String(b.code).split('\n').forEach((l) => { need(13); ops.push(`0.15 0.15 0.18 rg BT /F3 9 Tf 1 0 0 1 ${M} ${y.toFixed(1)} Tm (${esc(l)}) Tj ET`); y -= 12; });
        y -= 8;
      }
    });
  }
  pages.push(ops);

  // Assemble objects.
  const objs = [];
  const add = (s) => { objs.push(s); return objs.length; };
  const catalog = add('');
  const pagesId = add('');
  const f1 = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
  const f2 = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
  const f3 = add('<< /Type /Font /Subtype /Type1 /BaseFont /Courier /Encoding /WinAnsiEncoding >>');
  const kids = pages.map((p) => {
    const stream = p.join('\n');
    const content = add(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
    return add(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 ${f1} 0 R /F2 ${f2} 0 R /F3 ${f3} 0 R >> >> /Contents ${content} 0 R >>`);
  });
  objs[catalog - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
  objs[pagesId - 1] = `<< /Type /Pages /Kids [${kids.map((k) => `${k} 0 R`).join(' ')}] /Count ${kids.length} >>`;
  const info = add(`<< /Title (${esc(title)}) /Producer (Alliance.ai) >>`);

  let out = '%PDF-1.4\n';
  const offsets = [];
  objs.forEach((o, i) => { offsets.push(out.length); out += `${i + 1} 0 obj\n${o}\nendobj\n`; });
  const xref = out.length;
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('')}`;
  out += `trailer\n<< /Size ${objs.length + 1} /Root ${catalog} 0 R /Info ${info} 0 R >>\nstartxref\n${xref}\n%%EOF`;
  const bytes = new Uint8Array(out.length);
  for (let i = 0; i < out.length; i++) bytes[i] = out.charCodeAt(i) & 0xff;
  return new Blob([bytes], { type: 'application/pdf' });
}
