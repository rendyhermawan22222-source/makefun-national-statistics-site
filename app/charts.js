// charts.js — small inline-SVG chart builders. No library, no network: every
// chart is drawn from the data in data.js as an SVG string, with axes, values
// and labels so the figure is readable in a screenshot as well as on screen.

const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

const PALETTE = ['#0f766e', '#b45309', '#1d4ed8', '#be185d', '#4d7c0f', '#7c3aed', '#0369a1', '#a16207'];

// Vertical bar chart. values: [{label, value}], unit shown on the axis.
export function barChart(values, { height = 220, unit = '', format = (v) => String(v) } = {}) {
  const w = 640;
  const h = height;
  const padL = 44;
  const padB = 34;
  const padT = 14;
  const max = Math.max(...values.map((v) => Math.abs(v.value)), 1);
  const min = Math.min(0, ...values.map((v) => v.value));
  const range = max - min;
  const plotH = h - padT - padB;
  const plotW = w - padL - 12;
  const bw = Math.min(64, (plotW / values.length) * 0.62);
  const step = plotW / values.length;
  const y = (v) => padT + plotH - ((v - min) / range) * plotH;
  const zeroY = y(0);
  const grid = [0, 0.5, 1].map((f) => {
    const gv = min + range * f;
    return `<line x1="${padL}" y1="${y(gv)}" x2="${w - 12}" y2="${y(gv)}" stroke="#e2e8f0" stroke-width="1"/><text x="${padL - 6}" y="${y(gv) + 4}" text-anchor="end" font-size="11" fill="#64748b">${esc(format(gv))}</text>`;
  }).join('');
  const bars = values.map((v, i) => {
    const x = padL + i * step + (step - bw) / 2;
    const top = Math.min(y(v.value), zeroY);
    const bh = Math.abs(y(v.value) - zeroY);
    const col = v.value < 0 ? '#b91c1c' : PALETTE[i % PALETTE.length];
    return `<rect x="${x.toFixed(1)}" y="${top.toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(bh, 1).toFixed(1)}" rx="3" fill="${col}"><title>${esc(v.label)}: ${esc(format(v.value))} ${esc(unit)}</title></rect><text x="${(x + bw / 2).toFixed(1)}" y="${(top - 5).toFixed(1)}" text-anchor="middle" font-size="11" font-weight="600" fill="#0f172a">${esc(format(v.value))}</text><text x="${(x + bw / 2).toFixed(1)}" y="${h - 12}" text-anchor="middle" font-size="11" fill="#475569">${esc(v.label)}</text>`;
  }).join('');
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" role="img" aria-label="Bar chart">${grid}<line x1="${padL}" y1="${zeroY}" x2="${w - 12}" y2="${zeroY}" stroke="#94a3b8" stroke-width="1"/>${bars}</svg>`;
}

// Line chart over years. points: [{label (year), value}].
export function lineChart(points, { height = 220, format = (v) => String(v) } = {}) {
  const w = 640;
  const h = height;
  const padL = 48;
  const padB = 30;
  const padT = 18;
  const vals = points.map((p) => p.value);
  let min = Math.min(...vals);
  let max = Math.max(...vals);
  if (max - min < 1e-9) { max += 1; min -= 1; }
  const pad = (max - min) * 0.12;
  min -= pad;
  max += pad;
  const plotW = w - padL - 16;
  const plotH = h - padT - padB;
  const x = (i) => padL + (i / (points.length - 1)) * plotW;
  const y = (v) => padT + plotH - ((v - min) / (max - min)) * plotH;
  const grid = [0, 0.5, 1].map((f) => {
    const gv = min + (max - min) * f;
    return `<line x1="${padL}" y1="${y(gv)}" x2="${w - 16}" y2="${y(gv)}" stroke="#e2e8f0" stroke-width="1"/><text x="${padL - 6}" y="${y(gv) + 4}" text-anchor="end" font-size="11" fill="#64748b">${esc(format(gv))}</text>`;
  }).join('');
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ');
  const dots = points.map((p, i) => `<circle cx="${x(i).toFixed(1)}" cy="${y(p.value).toFixed(1)}" r="4.5" fill="#0f766e" stroke="#fff" stroke-width="2"><title>${esc(p.label)}: ${esc(format(p.value))}</title></circle><text x="${x(i).toFixed(1)}" y="${(y(p.value) - 10).toFixed(1)}" text-anchor="middle" font-size="11" font-weight="600" fill="#0f172a">${esc(format(p.value))}</text><text x="${x(i).toFixed(1)}" y="${h - 10}" text-anchor="middle" font-size="11" fill="#475569">${esc(p.label)}</text>`).join('');
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" role="img" aria-label="Line chart">${grid}<path d="${path}" fill="none" stroke="#0f766e" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>${dots}</svg>`;
}

// Horizontal bar chart for ranked lists (sectors, CPI groups, provinces).
export function hbarChart(values, { format = (v) => v + '%', maxLabel = 34 } = {}) {
  const rowH = 30;
  const w = 640;
  const h = values.length * rowH + 12;
  const padL = 190;
  const max = Math.max(...values.map((v) => v.value), 1);
  const rows = values.map((v, i) => {
    const y = 6 + i * rowH;
    const bw = ((w - padL - 64) * v.value) / max;
    const label = v.label.length > maxLabel ? v.label.slice(0, maxLabel - 1) + '…' : v.label;
    return `<text x="${padL - 8}" y="${y + 15}" text-anchor="end" font-size="12" fill="#334155">${esc(label)}</text><rect x="${padL}" y="${y + 3}" width="${Math.max(bw, 2).toFixed(1)}" height="16" rx="3" fill="${PALETTE[i % PALETTE.length]}"><title>${esc(v.label)}: ${esc(format(v.value))}</title></rect><text x="${(padL + bw + 6).toFixed(1)}" y="${y + 15}" font-size="12" font-weight="600" fill="#0f172a">${esc(format(v.value))}</text>`;
  }).join('');
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" role="img" aria-label="Horizontal bar chart">${rows}</svg>`;
}

// Donut chart with a centre label and a legend list.
export function donutChart(values, { size = 220, centre = '' } = {}) {
  const r = 84;
  const cx = 110;
  const cy = 110;
  const total = values.reduce((s, v) => s + v.value, 0) || 1;
  let angle = -Math.PI / 2;
  const slices = values.map((v, i) => {
    const frac = v.value / total;
    const a0 = angle;
    const a1 = angle + frac * Math.PI * 2;
    angle = a1;
    const large = frac > 0.5 ? 1 : 0;
    const x0 = cx + r * Math.cos(a0);
    const y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy + r * Math.sin(a1);
    const col = PALETTE[i % PALETTE.length];
    if (frac >= 0.999) return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${col}"/>`;
    return `<path d="M${cx},${cy} L${x0.toFixed(1)},${y0.toFixed(1)} A${r},${r} 0 ${large} 1 ${x1.toFixed(1)},${y1.toFixed(1)} Z" fill="${col}"><title>${esc(v.label)}: ${esc(v.value)}%</title></path>`;
  }).join('');
  const hole = `<circle cx="${cx}" cy="${cy}" r="52" fill="#ffffff"/>`;
  const legend = values.map((v, i) => `<li><span class="swatch" style="background:${PALETTE[i % PALETTE.length]}"></span>${esc(v.label)} — <strong>${esc(v.value)}%</strong></li>`).join('');
  return `<div class="donut-wrap"><svg viewBox="0 0 220 220" width="${size}" height="${size}" role="img" aria-label="Donut chart">${slices}${hole}<text x="${cx}" y="${cy - 4}" text-anchor="middle" font-size="15" font-weight="700" fill="#0f172a">${esc(centre)}</text><text x="${cx}" y="${cy + 16}" text-anchor="middle" font-size="11" fill="#64748b">of population</text></svg><ul class="legend">${legend}</ul></div>`;
}
