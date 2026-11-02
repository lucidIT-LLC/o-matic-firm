#!/usr/bin/env node
// build-m365-packages.mjs — zip each Microsoft 365 Copilot app into dist/.
// dist/ is gitignored. This does not upload, publish, or contact a tenant.
//
// Usage: node scripts/build-m365-packages.mjs [marketplace-root]
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve(process.argv[2] || ".");
const mkt = JSON.parse(readFileSync(join(root, ".claude-plugin", "marketplace.json"), "utf8"));
const pluginDir = mkt.plugins[0].source.replace(/^\.\//, "");
const plugin = JSON.parse(readFileSync(join(root, pluginDir, ".claude-plugin", "plugin.json"), "utf8"));
const version = plugin.version || "1.0.0";
const rolesPath = join(root, pluginDir, "adapters/m365/roles.json");
if (!existsSync(rolesPath)) {
  console.error(`NO ROLES: ${rolesPath} is missing`);
  process.exit(2);
}
const roles = JSON.parse(readFileSync(rolesPath, "utf8"));
const dist = join(root, "dist/m365");
const stagingRoot = join(root, "dist/staging");
rmSync(stagingRoot, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

const copySkill = (stage, folder) => {
  const name = folder.replace(/^\.\/skills\//, "").replace(/\/$/, "");
  const src = join(root, pluginDir, "skills", name);
  if (!existsSync(src)) {
    console.error(`MISSING SKILL: ${pluginDir}/skills/${name}`);
    process.exit(1);
  }
  cpSync(src, join(stage, "skills", name), { recursive: true });
};

const catalog = [];
for (const [id, cfg] of Object.entries(roles.agents || {})) {
  const pkg = join(root, pluginDir, "adapters/m365", id, "appPackage");
  const manifestPath = join(pkg, "manifest.json");
  if (!existsSync(manifestPath)) {
    console.error(`MISSING PACKAGE: ${manifestPath}`);
    process.exit(1);
  }
  const stage = join(stagingRoot, id);
  mkdirSync(stage, { recursive: true });
  for (const name of ["manifest.json", "declarativeAgent.json", "instructions.txt", "ai-plugin.json", "mcp-tools.json", "color.png", "outline.png"]) {
    const src = join(pkg, name);
    if (existsSync(src)) cpSync(src, join(stage, name));
  }
  const da = JSON.parse(readFileSync(join(pkg, "declarativeAgent.json"), "utf8"));
  for (const skill of da.agent_skills || []) copySkill(stage, skill.folder);
  const zipName = `${plugin.name}-${id}-${version}.zip`;
  const zipPath = join(dist, zipName);
  rmSync(zipPath, { force: true });
  const zipped = spawnSync("zip", ["-r", "-X", "-q", zipPath, "."], { cwd: stage });
  if (zipped.status !== 0) {
    console.error(zipped.stderr?.toString() || `zip failed for ${id}`);
    process.exit(zipped.status || 1);
  }
  const bytes = readFileSync(zipPath);
  const sha = createHash("sha256").update(bytes).digest("hex");
  const pending = JSON.parse(readFileSync(join(root, pluginDir, "adapters/m365", id, "ICON-PENDING.json"), "utf8"));
  catalog.push({ id, version, zip: `dist/m365/${zipName}`, bytes: bytes.length, sha256: sha, tools: cfg.tools || [], pending: pending.pending || [] });
  const iconNote = pending.pending?.length ? `icon-pending: ${pending.pending.join(", ")}` : "icons ready";
  console.log(`zip:  ${zipName}  ${bytes.length} bytes  ${iconNote}`);
  console.log(`sha:  ${sha}`);
}

const lines = ["# Microsoft 365 Copilot zips", "", "Built locally. Not committed. Not uploaded.", ""];
for (const row of catalog) {
  lines.push(`- ${row.zip}`);
  lines.push(`  - version: ${row.version}`);
  lines.push(`  - bytes: ${row.bytes}`);
  lines.push(`  - sha256: ${row.sha256}`);
  lines.push(`  - tools: ${row.tools.length ? row.tools.join(", ") : "none"}`);
  lines.push(`  - icon-pending: ${row.pending.length ? row.pending.join(", ") : "none"}`);
}
writeFileSync(join(dist, "CATALOG.md"), lines.join("\n") + "\n");
console.log(`\ndone — ${catalog.length} package(s) in dist/m365/`);
rmSync(stagingRoot, { recursive: true, force: true });
