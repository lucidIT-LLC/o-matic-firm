#!/usr/bin/env node
// verify-adapter-paths.mjs — task #742. A deployed host adapter
// (~/.claude/agents/<role>.md) is generated from a pack template
// (adapters/claude/agents/<role>.md) by rewriting its relative paths to
// absolute ones pinned to whatever pack version was installed at deploy
// time. Nothing re-runs that rewrite when the pack version bumps, so the
// pin goes stale silently — exactly the defect this checks for.
//
// This is a HOST check, not a portable CI check: it reads
// ~/.claude/plugins/installed_plugins.json and ~/.claude/agents/*.md, neither
// of which exist on a CI runner or a fresh clone. Run it locally after any
// pack release, or from a pre-commit/deploy hook on this host. It does not
// run in verify-pack.mjs or GitHub Actions for that reason, and it is
// estate-wide (it reads whichever marketplace/plugin each deployed adapter
// pins, not only this pack's own) rather than studio-only — the same
// mechanism is shipped identically in o-matic-firm/scripts/.
//
// Exit 1 on any FAIL. Every rule here encodes the defect measured in task #742:
// Jo's deployed adapter loaded studio 1.3.0 paths while 1.9.0 (now 1.10.1+)
// was installed, and studio/1.3.0 itself carried a `.orphaned_at` marker —
// the plugin system already knew the version was retired; the instruction
// file pointing into it did not.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

const home = process.argv[2] || homedir();
const agentsDir = join(home, ".claude", "agents");
const installedPath = join(home, ".claude", "plugins", "installed_plugins.json");
const cacheRoot = join(home, ".claude", "plugins", "cache");

let fails = 0, checks = 0;
const FAIL = (m) => { console.log(`  FAIL  ${m}`); fails++; };
const OK   = (m) => { console.log(`  ok    ${m}`); };

console.log(`\n=== verifying deployed adapter paths under ${agentsDir} ===\n`);

if (!existsSync(installedPath)) {
  FAIL(`${installedPath} not found — cannot resolve installed pack versions`);
  console.log(`\nRESULT: FAIL — 1 fail\n`);
  process.exit(1);
}
if (!existsSync(agentsDir)) {
  OK(`${agentsDir} does not exist on this host — nothing deployed to check`);
  console.log(`\nRESULT: PASS — 0 units checked\n`);
  process.exit(0);
}

const installed = JSON.parse(readFileSync(installedPath, "utf8"));
// installed_plugins.json: { plugins: { "<plugin>@<marketplace>": [{ installPath, version, ... }] } }
// A deployed path looks like .../plugins/cache/<marketplace>/<plugin>/<version>/...
// Build marketplace/plugin -> current version from the installPath, which is
// the field this factory's own tooling treats as ground truth (task #742).
const currentVersion = new Map(); // key: `${marketplace}/${plugin}` -> {version, installPath}
for (const [key, entries] of Object.entries(installed.plugins ?? {})) {
  const [plugin] = key.split("@");
  for (const e of entries) {
    const m = /\/plugins\/cache\/([^/]+)\/([^/]+)\/([^/]+)/.exec(e.installPath ?? "");
    if (!m) continue;
    currentVersion.set(`${m[1]}/${m[2]}`, { version: e.version, installPath: e.installPath });
  }
}

const PIN_RE = /\/plugins\/cache\/([^/]+)\/([^/]+)\/([^/]+)\//g;

for (const f of readdirSync(agentsDir).filter((n) => n.endsWith(".md"))) {
  const p = join(agentsDir, f);
  const txt = readFileSync(p, "utf8");
  const seen = new Set();
  for (const m of txt.matchAll(PIN_RE)) {
    const [, marketplace, plugin, version] = m;
    const key = `${marketplace}/${plugin}`;
    if (seen.has(key + version)) continue;
    seen.add(key + version);
    checks++;
    const cur = currentVersion.get(key);
    if (!cur) {
      FAIL(`${f}: pins ${key}@${version} but that plugin is not in installed_plugins.json at all`);
      continue;
    }
    if (cur.version !== version) {
      FAIL(`${f}: pins ${key}@${version} — installed version is ${cur.version}. Regenerate this adapter from its pack template.`);
      continue;
    }
    const orphanMarker = join(cacheRoot, marketplace, plugin, version, ".orphaned_at");
    if (existsSync(orphanMarker)) {
      FAIL(`${f}: pins ${key}@${version}, which matches installed_plugins.json, but that version's own directory carries .orphaned_at — the plugin system and the installed_plugins.json record disagree with each other`);
      continue;
    }
    OK(`${f}: ${key}@${version} matches installed_plugins.json, not orphaned`);
  }
}

console.log(`\n${fails ? "RESULT: FAIL" : "RESULT: PASS"} — ${checks} pin(s) checked, ${fails} fail\n`);
process.exit(fails ? 1 : 0);
