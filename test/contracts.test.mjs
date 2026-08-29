import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const r = p => readFile(new URL("../" + p, import.meta.url), "utf8");

test("custom zero price removed", async () =>
  assert.doesNotMatch(await r("public/app.js"), /'custom':\{label/));

test("CSV normalizes ranges", async () =>
  assert.match(await r("public/app.js"), /Math\.min\(n\(x\.low\),n\(x\.high\)\)/));

test("share import bounded", async () => {
  const s = await r("public/app.js");
  assert.match(s, /bytes\.length>12000/);
  assert.match(s, /raw\[k\]\.length>50/);
});

test("strict CSP", async () =>
  assert.doesNotMatch(await r("vercel.json"), /unsafe-inline/));

test("rate catalog carries a check date and a staleness policy", async () => {
  const s = await r("public/app.js");
  assert.match(s, /const RATE_CHECKED='\d{4}-\d{2}-\d{2}'/);
  assert.match(s, /RATE_AGING=30, RATE_STALE=90/);
  // every catalog entry is dated
  const entries = [...s.matchAll(/'gpt-5\.6-[a-z]+':\{[^}]*\}/g)].map(m => m[0]);
  assert.equal(entries.length, 3);
  for (const e of entries) assert.match(e, /checked:'\d{4}-\d{2}-\d{2}'/, e);
});

test("rate overrides are sanitized on import, not trusted", async () => {
  const s = await r("public/app.js");
  assert.match(s, /y\.rateOverride=\(o&&typeof o==='object'\)/);
  assert.match(s, /o\.on===true/);
});

test("no runtime request to a pricing API or analytics endpoint", async () => {
  const s = await r("public/app.js");
  assert.doesNotMatch(s, /\bfetch\s*\(/);
  assert.doesNotMatch(s, /new\s+(XMLHttpRequest|WebSocket|EventSource)\s*\(/);
  assert.doesNotMatch(s, /sendBeacon\s*\(/);
});

test("sensitivity decomposes the stated range and says so", async () => {
  const s = await r("public/app.js");
  assert.match(s, /function sensitivity\(t\)/);
  assert.match(s, /exactly the width of the year-one range/);
});

test("the completion meter can still reach values below 100%", async () => {
  const css = await r("public/styles.css");
  assert.match(css, /\.completion i\[role=progressbar\]\{min-width:0\}/);
  assert.match(await r("public/app.js"), /completionBar'\)\.style\.width=score\+'%'/);
});
