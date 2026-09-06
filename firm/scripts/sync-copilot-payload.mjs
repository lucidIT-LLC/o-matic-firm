#!/usr/bin/env node
// sync-copilot-payload.mjs — keep adapters/copilot/.github/omatic/ identical to
// the canonical Firm adapter core. --check exits 1 if the vendored copy drifted.
//
// WHY THIS EXISTS. A Copilot payload is copied into a DIFFERENT workspace. Once
// copied, no relative path back into this pack resolves — under any correction.
// Agency shipped ../../../../ROLE-CORE.md for exactly that reason and it
// resolved nowhere (task #586); studio shipped the sharper version, a path that
// resolved INSIDE the pack and broke only after the copy, which is why a
// pack-only check would have passed it.
//
// So `.github/` is self-contained: what it loads travels with it under
// `.github/omatic/`, referenced as `../omatic/<file>` — a path that resolves
// identically inside this pack and inside the target workspace. Vendored copies
// drift, so they are generated, not hand-written, and this script is the
// control. Firm ships this before its first Copilot defect rather than after.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const pack = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dest = join(pack, "adapters/copilot/.github/omatic");
const check = process.argv.includes("--check");

// [source, vendored name, rewrites applied to the vendored copy]
const FILES = [
  ["adapters/ROLE-CORE.md", "ROLE-CORE.md", [
    ["`../skills/`", "`firm/skills/` in the Firm pack"],
  ]],
];

const BANNER = (src) =>
  `<!-- GENERATED COPY — do not edit. Source: firm/${src}\n` +
  `     Regenerate with: node firm/scripts/sync-copilot-payload.mjs\n` +
  `     This copy exists so adapters/copilot/.github/ stays self-contained when\n` +
  `     it is copied into another workspace. -->\n\n`;

mkdirSync(dest, { recursive: true });
let stale = 0, wrote = 0;
for (const [src, name, rewrites] of FILES) {
  let body = readFileSync(join(pack, src), "utf8");
  for (const [from, to] of rewrites) {
    if (!body.includes(from)) {
      console.error(`SOURCE CHANGED: ${src} no longer contains ${from}`);
      process.exit(2);
    }
    body = body.split(from).join(to);
  }
  const next = BANNER(src) + body;
  const target = join(dest, name);
  const cur = existsSync(target) ? readFileSync(target, "utf8") : null;
  if (cur === next) { console.log(`ok:    ${name}`); continue; }
  stale++;
  if (check) console.log(`STALE: ${name}`);
  else { writeFileSync(target, next); wrote++; console.log(`sync:  ${name}`); }
}
if (check && stale) { console.log(`\n${stale} vendored copy(ies) stale — run without --check`); process.exit(1); }
console.log(check ? "\ncopilot payload in sync" : `\ndone — ${wrote} updated`);
