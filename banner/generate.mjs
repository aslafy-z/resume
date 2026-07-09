#!/usr/bin/env node
// Renders the LinkedIn cover image as a topographic map of real GitHub activity.
//
// Three years of contributions are laid out as YEARS stacked blocks of WEEKS x 7
// weekdays, smoothed into a continuous surface, then traced with marching squares.
// The vertical axis is weekday-within-block and carries no physical meaning; the
// surface is a portrait of activity, not a chart to be read back.
//
// The wordmark ships as baked outlines so rendering never depends on a font being
// installed.

import { writeFileSync } from "node:fs";

const W = 1584;
const H = 396;

const BG = "#0b0b0c";
const MARK = "#9c9c9f";
const MINOR = "#35353b";
const MAJOR = "#6f6f73";

// The profile photo sits over the lower-left of the cover on desktop; contours are
// faded out beneath it so the two never collide.
const PHOTO_CX = 208;
const PHOTO_CY = 357;
const QUIET_R = 178;
const QUIET_FADE = 340;

// A softer clearing behind the wordmark keeps it legible against dense linework.
const MARK_CX = 1448;
const MARK_CY = 350;
const MARK_RX = 200;
const MARK_RY = 52;

const WORDMARK_WIDTH = 169.5;
const WORDMARK_PATH = "M1.70 0.00V-1.54L8.36 -8.96H1.92V-10.32H10.10V-8.78L3.44 -1.36H10.30V0.00Z M27.40 0.00Q26.46 0.00 26.06 -0.48Q25.66 -0.96 25.56 -1.68H25.46Q25.12 -0.78 24.37 -0.27Q23.62 0.24 22.36 0.24Q20.74 0.24 19.78 -0.60Q18.82 -1.44 18.82 -2.90Q18.82 -4.34 19.87 -5.12Q20.92 -5.90 23.26 -5.90H25.46V-6.92Q25.46 -8.06 24.82 -8.63Q24.18 -9.20 23.00 -9.20Q21.96 -9.20 21.30 -8.79Q20.64 -8.38 20.24 -7.68L19.16 -8.48Q19.36 -8.88 19.70 -9.26Q20.04 -9.64 20.54 -9.93Q21.04 -10.22 21.68 -10.39Q22.32 -10.56 23.10 -10.56Q24.92 -10.56 25.99 -9.64Q27.06 -8.72 27.06 -7.08V-1.40H28.50V0.00ZM22.64 -1.10Q23.26 -1.10 23.77 -1.25Q24.28 -1.40 24.66 -1.65Q25.04 -1.90 25.25 -2.25Q25.46 -2.60 25.46 -3.00V-4.70H23.26Q21.82 -4.70 21.16 -4.30Q20.50 -3.90 20.50 -3.14V-2.72Q20.50 -1.92 21.07 -1.51Q21.64 -1.10 22.64 -1.10Z M43.50 -1.68H43.42Q42.42 0.24 40.24 0.24Q38.34 0.24 37.27 -1.18Q36.20 -2.60 36.20 -5.16Q36.20 -7.72 37.27 -9.14Q38.34 -10.56 40.24 -10.56Q42.42 -10.56 43.42 -8.64H43.50V-14.80H45.10V0.00H43.50ZM40.86 -1.18Q41.40 -1.18 41.88 -1.32Q42.36 -1.46 42.72 -1.73Q43.08 -2.00 43.29 -2.39Q43.50 -2.78 43.50 -3.30V-7.02Q43.50 -7.54 43.29 -7.93Q43.08 -8.32 42.72 -8.59Q42.36 -8.86 41.88 -9.00Q41.40 -9.14 40.86 -9.14Q39.46 -9.14 38.69 -8.29Q37.92 -7.44 37.92 -6.04V-4.28Q37.92 -2.88 38.69 -2.03Q39.46 -1.18 40.86 -1.18Z M54.60 -14.80H56.20V-5.46H56.28L58.08 -7.16L61.52 -10.32H63.48L59.20 -6.28L63.98 0.00H62.00L57.98 -5.36L56.20 -3.74V0.00H54.60Z M76.64 -12.60Q75.94 -12.60 75.66 -12.89Q75.38 -13.18 75.38 -13.62V-13.94Q75.38 -14.38 75.66 -14.67Q75.94 -14.96 76.64 -14.96Q77.34 -14.96 77.62 -14.67Q77.90 -14.38 77.90 -13.94V-13.62Q77.90 -13.18 77.62 -12.89Q77.34 -12.60 76.64 -12.60ZM72.12 -1.36H75.84V-8.96H72.12V-10.32H77.44V-1.36H80.92V0.00H72.12Z M93.68 0.24Q92.56 0.24 91.67 -0.14Q90.78 -0.52 90.15 -1.23Q89.52 -1.94 89.18 -2.93Q88.84 -3.92 88.84 -5.14Q88.84 -6.38 89.19 -7.38Q89.54 -8.38 90.16 -9.09Q90.78 -9.80 91.65 -10.18Q92.52 -10.56 93.58 -10.56Q94.62 -10.56 95.47 -10.18Q96.32 -9.80 96.92 -9.13Q97.52 -8.46 97.84 -7.54Q98.16 -6.62 98.16 -5.52V-4.76H90.52V-4.28Q90.52 -3.60 90.74 -3.02Q90.96 -2.44 91.37 -2.02Q91.78 -1.60 92.37 -1.37Q92.96 -1.14 93.68 -1.14Q94.72 -1.14 95.48 -1.62Q96.24 -2.10 96.64 -2.94L97.82 -2.14Q97.36 -1.10 96.29 -0.43Q95.22 0.24 93.68 0.24ZM93.58 -9.24Q92.92 -9.24 92.36 -9.00Q91.80 -8.76 91.39 -8.34Q90.98 -7.92 90.75 -7.35Q90.52 -6.78 90.52 -6.10V-5.96H96.44V-6.18Q96.44 -6.86 96.23 -7.42Q96.02 -7.98 95.65 -8.39Q95.28 -8.80 94.75 -9.02Q94.22 -9.24 93.58 -9.24Z M106.60 -1.36H110.20V-13.44H106.60V-14.80H111.80V-1.36H115.40V0.00H106.60Z M128.50 0.18Q127.68 0.18 127.35 -0.16Q127.02 -0.50 127.02 -1.02V-1.38Q127.02 -1.90 127.35 -2.24Q127.68 -2.58 128.50 -2.58Q129.32 -2.58 129.65 -2.24Q129.98 -1.90 129.98 -1.38V-1.02Q129.98 -0.50 129.65 -0.16Q129.32 0.18 128.50 0.18Z M141.66 -1.36H145.14V-8.96H141.46V-10.32H145.14V-12.44Q145.14 -13.48 145.69 -14.14Q146.24 -14.80 147.42 -14.80H150.88V-13.44H146.74V-10.32H150.88V-8.96H146.74V-1.36H150.42V0.00H141.66Z M159.04 -1.36H162.06V-8.96H159.04V-10.32H163.66V-7.72H163.76Q164.08 -8.94 164.97 -9.63Q165.86 -10.32 167.24 -10.32H168.68V-8.72H166.74Q165.36 -8.72 164.51 -7.92Q163.66 -7.12 163.66 -5.82V-1.36H167.66V0.00H159.04Z";

const USER = process.env.GITHUB_USER ?? "aslafy-z";
const YEARS = Number(process.env.BANNER_YEARS ?? 3);
const WEEKS = 52;
const SCALE = 10;
const SIGMA = Number(process.env.BANNER_SIGMA ?? 5);
const LEVELS = Number(process.env.BANNER_LEVELS ?? 28);

const DAY = 86400000;
const iso = (t) => new Date(t).toISOString().slice(0, 10);

// GitHub only exposes bucketed levels (0-4) on the public profile, not raw counts.
async function fetchLevels(user, fromYear, toYear) {
  const levels = new Map();
  for (let y = fromYear; y <= toYear; y++) {
    const url = `https://github.com/users/${user}/contributions?from=${y}-01-01&to=${y}-12-31`;
    const res = await fetch(url, { headers: { Accept: "text/html" } });
    if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
    const html = await res.text();
    const re = /data-date="(\d{4}-\d{2}-\d{2})"[^>]*data-level="(\d)"/g;
    let m;
    let n = 0;
    while ((m = re.exec(html)) !== null) {
      levels.set(m[1], Number(m[2]));
      n++;
    }
    if (n === 0) throw new Error(`no contribution cells parsed from ${url}`);
  }
  return levels;
}

function heightField(levels, endTs) {
  const days = YEARS * WEEKS * 7;
  const startTs = endTs - (days - 1) * DAY;
  const rows = YEARS * 7;
  const m = Array.from({ length: rows }, () => new Float64Array(WEEKS));
  let active = 0;
  for (let i = 0; i < days; i++) {
    const lv = levels.get(iso(startTs + i * DAY)) ?? 0;
    if (lv > 0) active++;
    const block = Math.floor(i / (WEEKS * 7));
    const rem = i % (WEEKS * 7);
    m[block * 7 + (rem % 7)][Math.floor(rem / 7)] = lv;
  }
  console.error(`  window ${iso(startTs)} -> ${iso(endTs)}, ${active}/${days} active days`);
  return m;
}

const reflect = (i, n) => {
  while (i < 0 || i >= n) {
    if (i < 0) i = -i;
    if (i >= n) i = 2 * (n - 1) - i;
  }
  return i;
};

function blur(field, ny, nx, sigma) {
  const r = Math.round(sigma * 3);
  const k = new Float64Array(2 * r + 1);
  let sum = 0;
  for (let i = -r; i <= r; i++) {
    k[i + r] = Math.exp(-0.5 * (i / sigma) ** 2);
    sum += k[i + r];
  }
  for (let i = 0; i < k.length; i++) k[i] /= sum;

  const tmp = new Float64Array(ny * nx);
  for (let y = 0; y < ny; y++)
    for (let x = 0; x < nx; x++) {
      let acc = 0;
      for (let i = -r; i <= r; i++) acc += k[i + r] * field[y * nx + reflect(x + i, nx)];
      tmp[y * nx + x] = acc;
    }

  const out = new Float64Array(ny * nx);
  for (let y = 0; y < ny; y++)
    for (let x = 0; x < nx; x++) {
      let acc = 0;
      for (let i = -r; i <= r; i++) acc += k[i + r] * tmp[reflect(y + i, ny) * nx + x];
      out[y * nx + x] = acc;
    }
  return out;
}

function surface(m) {
  const ny = m.length * SCALE;
  const nx = WEEKS * SCALE;
  const up = new Float64Array(ny * nx);
  for (let y = 0; y < ny; y++)
    for (let x = 0; x < nx; x++)
      up[y * nx + x] = m[Math.floor(y / SCALE)][Math.floor(x / SCALE)];

  const f = blur(up, ny, nx, SIGMA);
  let lo = Infinity;
  let hi = -Infinity;
  for (const v of f) {
    if (v < lo) lo = v;
    if (v > hi) hi = v;
  }
  for (let i = 0; i < f.length; i++) f[i] = (f[i] - lo) / (hi - lo);
  return { f, ny, nx };
}

// Segment lookup for the 16 marching-squares corner configurations.
const CASES = [
  [], [[3, 0]], [[0, 1]], [[3, 1]], [[1, 2]], [[3, 0], [1, 2]], [[0, 2]], [[3, 2]],
  [[3, 2]], [[0, 2]], [[3, 2], [0, 1]], [[1, 2]], [[3, 1]], [[0, 1]], [[3, 0]], [],
];

function contour({ f, ny, nx }, lv) {
  const sx = W / (nx - 1);
  const sy = H / (ny - 1);
  const out = [];
  for (let j = 0; j < ny - 1; j++) {
    for (let i = 0; i < nx - 1; i++) {
      const a = f[j * nx + i];
      const b = f[j * nx + i + 1];
      const c = f[(j + 1) * nx + i + 1];
      const d = f[(j + 1) * nx + i];
      const idx = (a > lv) | ((b > lv) << 1) | ((c > lv) << 2) | ((d > lv) << 3);
      const segs = CASES[idx];
      if (segs.length === 0) continue;

      const t = (u, v) => (v === u ? 0 : (lv - u) / (v - u));
      const pts = [
        [i + t(a, b), j],
        [i + 1, j + t(b, c)],
        [i + t(d, c), j + 1],
        [i, j + t(a, d)],
      ];
      for (const [p, q] of segs) {
        const [px, py] = pts[p];
        const [qx, qy] = pts[q];
        out.push(`M${(px * sx).toFixed(1)} ${(py * sy).toFixed(1)}L${(qx * sx).toFixed(1)} ${(qy * sy).toFixed(1)}`);
      }
    }
  }
  return out;
}

function svg(surf) {
  const layers = [];
  for (let li = 1; li < LEVELS; li++) {
    const segs = contour(surf, li / LEVELS);
    if (segs.length === 0) continue;
    const major = li % 5 === 0;
    layers.push(
      `<path d="${segs.join("")}" fill="none" stroke="${major ? MAJOR : MINOR}" ` +
        `stroke-width="${major ? 1.7 : 0.95}" stroke-linecap="round"/>`,
    );
  }

  const inner = (QUIET_R / QUIET_FADE).toFixed(4);
  const wmX = W - 56 - WORDMARK_WIDTH;
  const wmY = H - 36;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <radialGradient id="quiet" gradientUnits="userSpaceOnUse" cx="${PHOTO_CX}" cy="${PHOTO_CY}" r="${QUIET_FADE}">
    <stop offset="0" stop-color="#000"/>
    <stop offset="${inner}" stop-color="#000"/>
    <stop offset="1" stop-color="#fff"/>
  </radialGradient>
  <radialGradient id="markclear" gradientUnits="userSpaceOnUse" cx="${MARK_CX}" cy="${MARK_CY}" r="1"
    gradientTransform="translate(${MARK_CX} ${MARK_CY}) scale(${MARK_RX} ${MARK_RY}) translate(${-MARK_CX} ${-MARK_CY})">
    <stop offset="0" stop-color="#000"/>
    <stop offset="0.45" stop-color="#0d0d0d"/>
    <stop offset="1" stop-color="#fff"/>
  </radialGradient>
  <mask id="clear">
    <rect width="${W}" height="${H}" fill="#fff"/>
    <circle cx="${PHOTO_CX}" cy="${PHOTO_CY}" r="${QUIET_FADE}" fill="url(#quiet)"/>
    <ellipse cx="${MARK_CX}" cy="${MARK_CY}" rx="${MARK_RX}" ry="${MARK_RY}" fill="url(#markclear)"/>
  </mask>
  <path id="wm" d="${WORDMARK_PATH}"/>
</defs>
<rect width="${W}" height="${H}" fill="${BG}"/>
<g mask="url(#clear)">${layers.join("")}</g>
<g transform="translate(${wmX} ${wmY})">
  <use href="#wm" fill="none" stroke="${BG}" stroke-width="7" stroke-linejoin="round"/>
  <use href="#wm" fill="${MARK}"/>
</g>
</svg>`;
}

const out = process.argv[2] ?? "banner/linkedin-banner.svg";
const now = new Date();
const midnight = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
const end = midnight - new Date(midnight).getUTCDay() * DAY + 6 * DAY;
const start = end - (YEARS * WEEKS * 7 - 1) * DAY;

console.error(`generating cover for ${USER} (sigma=${SIGMA}, levels=${LEVELS})`);
const levels = await fetchLevels(USER, new Date(start).getUTCFullYear(), new Date(end).getUTCFullYear());
const doc = svg(surface(heightField(levels, end)));
writeFileSync(out, doc);
console.error(`wrote ${out} (${doc.length} bytes)`);
