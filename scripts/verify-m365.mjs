#!/usr/bin/env node
// verify-m365.mjs — schema, store-shape, tool pin, and icon checks for the
// Microsoft 365 Copilot app packages. Missing icons that are marked pending
// warn. They do not fail. A present icon with the wrong size fails.
//
// Usage: node scripts/verify-m365.mjs <marketplace-root> [--require-dist]
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { DENY_TOOLS, INSTRUCTION_LIMIT, MAX_TOOLS, fillPlaceholders, readPngSize, toolAllowed } from "./m365-shared.mjs";

const args = process.argv.slice(2);
const root = resolve(args.find((a) => !a.startsWith("--")) || ".");
const requireDist = args.includes("--require-dist");
const here = fileURLToPath(new URL(".", import.meta.url));
const schemas = {
  app: join(here, "m365-schemas/MicrosoftTeams-v1.30.schema.json"),
  agent: join(here, "m365-schemas/declarative-agent-v1.9.schema.json"),
  plugin: join(here, "m365-schemas/plugin-v2.4.schema.json"),
};
const OUTLINE_PY = String.raw`
import sys, struct, zlib
path = sys.argv[1]
data = open(path, "rb").read()
if data[:8] != b"\x89PNG\r\n\x1a\n":
    sys.exit("not a png")
pos = 8
chunks = []
while pos < len(data):
    ln = struct.unpack(">I", data[pos:pos+4])[0]
    typ = data[pos+4:pos+8]
    chunks.append((typ, data[pos+8:pos+8+ln]))
    pos += 12 + ln
w, h, bit, color, *_ = struct.unpack(">IIBBBBB", chunks[0][1])
if (w, h) != (32, 32):
    sys.exit(f"size {w}x{h}")
idat = b"".join(c for t, c in chunks if t == b"IDAT")
raw = zlib.decompress(idat)
bpp = {0: 1, 2: 3, 4: 2, 6: 4}[color]
stride = w * bpp
i = 0
prev = bytearray(stride)
rows = []
def paeth(a, b, c):
    p = a + b - c
    pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
    return a if pa <= pb and pa <= pc else b if pb <= pc else c
for y in range(h):
    f = raw[i]; i += 1
    row = bytearray(raw[i:i+stride]); i += stride
    for x in range(stride):
        left = row[x - bpp] if x >= bpp else 0
        up = prev[x]
        ul = prev[x - bpp] if x >= bpp else 0
        if f == 1: row[x] = (row[x] + left) & 255
        elif f == 2: row[x] = (row[x] + up) & 255
        elif f == 3: row[x] = (row[x] + ((left + up) // 2)) & 255
        elif f == 4: row[x] = (row[x] + paeth(left, up, ul)) & 255
        elif f != 0:
            sys.exit(f"filter {f}")
    rows.append(bytes(row))
    prev = row
for row in rows:
    for x in range(w):
        px = row[x * bpp:(x + 1) * bpp]
        if color == 6:
            r, g, b, a = px
        elif color == 4:
            r = g = b = px[0]; a = px[1]
        elif color == 0:
            r = g = b = px[0]; a = 255
        else:
            sys.exit("color type")
        if a == 0:
            continue
        if min(r, g, b) < 250:
            sys.exit("non-white pixel")
print("ok")
`;

let fails = 0, warns = 0;
const FAIL = (m) => { console.log(`  FAIL  ${m}`); fails++; };
const WARN = (m) => { console.log(`  warn  ${m}`); warns++; };
const OK = (m) => console.log(`  ok    ${m}`);
const NOTE = (m) => console.log(`  note  ${m}`);

const mkt = JSON.parse(readFileSync(join(root, ".claude-plugin", "marketplace.json"), "utf8"));
const pluginDir = mkt.plugins[0].source.replace(/^\.\//, "");
const plugin = JSON.parse(readFileSync(join(root, pluginDir, ".claude-plugin", "plugin.json"), "utf8"));
const roles = JSON.parse(readFileSync(join(root, pluginDir, "adapters/m365/roles.json"), "utf8"));
const py = `
import json, sys
from jsonschema import Draft4Validator
specs = json.load(sys.stdin)
fails = []
for spec in specs:
    schema = json.load(open(spec["schema"]))
    instance = json.loads(spec["instance"])
    validator = Draft4Validator(schema)
    for err in sorted(validator.iter_errors(instance), key=lambda e: list(e.path)):
        fails.append({"file": spec["file"], "path": "/" + "/".join(str(p) for p in err.path), "message": err.message})
json.dump(fails, sys.stdout)
`;

function validateAll(jobs) {
  const proc = spawnSync("python3", ["-c", py], { input: JSON.stringify(jobs), encoding: "utf8" });
  if (proc.status !== 0) {
    FAIL(`schema validator failed: ${(proc.stderr || proc.stdout || "").slice(0, 500)}`);
    return;
  }
  let errors = [];
  try { errors = JSON.parse(proc.stdout || "[]"); }
  catch (e) { FAIL(`schema validator returned non-JSON: ${e.message}`); return; }
  if (!errors.length) OK(`schemas accepted ${jobs.length} document(s)`);
  for (const err of errors) FAIL(`${err.file}${err.path}: ${err.message}`);
}

const jobs = [];
const pendingIcons = [];
console.log(`\n=== Microsoft 365 Copilot packages — ${root} ===\n`);

for (const [id, cfg] of Object.entries(roles.agents || {})) {
  const base = join(root, pluginDir, "adapters/m365", id);
  const pkg = join(base, "appPackage");
  const rel = `${pluginDir}/adapters/m365/${id}/appPackage`;
  const manifest = JSON.parse(readFileSync(join(pkg, "manifest.json"), "utf8"));
  const agent = JSON.parse(readFileSync(join(pkg, "declarativeAgent.json"), "utf8"));
  const instructions = readFileSync(join(pkg, "instructions.txt"), "utf8");
  const text = instructions.replace(/\n$/, "");
  if (text.length > INSTRUCTION_LIMIT) FAIL(`${id}: instructions ${text.length} > ${INSTRUCTION_LIMIT}`);
  else OK(`${id}: instructions ${text.length} chars`);

  if (manifest.version !== plugin.version) FAIL(`${id}: manifest version ${manifest.version} != plugin ${plugin.version}`);
  if (manifest.manifestVersion !== "1.30") FAIL(`${id}: manifestVersion ${manifest.manifestVersion}`);
  if (agent.version !== "v1.9") FAIL(`${id}: declarative agent version ${agent.version}`);
  if (manifest.id !== "${{TEAMS_APP_ID}}") FAIL(`${id}: Teams app id must stay the \${{TEAMS_APP_ID}} placeholder`);
  if (manifest.name.short !== agent.name) FAIL(`${id}: app short name and agent name differ`);
  if (manifest.name.short.length > 30) FAIL(`${id}: short name ${manifest.name.short.length} > 30`);
  if ((manifest.name.full || "").length > 100) FAIL(`${id}: full name length`);
  if ((manifest.description.short || "").length > 80) FAIL(`${id}: short description ${manifest.description.short.length} > 80`);
  if ((manifest.description.full || "").length > 4000) FAIL(`${id}: full description length`);
  if ((agent.description || "").length > 1000) FAIL(`${id}: agent description length`);
  if ((manifest.developer?.name || "").length > 32) FAIL(`${id}: developer name length`);
  for (const key of ["privacyUrl", "termsOfUseUrl"]) {
    const url = manifest.developer?.[key] || "";
    if (!/TODO/i.test(url)) FAIL(`${id}: ${key} must be a TODO placeholder until the public pages exist`);
    else WARN(`${id}: ${key} is still TODO (${url})`);
  }
  if (!/^https:\/\/o-matic\.ai\/?$/.test(manifest.developer?.websiteUrl || ""))
    FAIL(`${id}: developer websiteUrl should be the public https://o-matic.ai site`);

  const starters = agent.conversation_starters || [];
  if (starters.length < 3 || starters.length > 6) FAIL(`${id}: ${starters.length} starters; need 3 to 6`);
  const texts = new Set(), titles = new Set();
  for (const s of starters) {
    if (!s.title) FAIL(`${id}: starter missing a title`);
    if (titles.has(s.title)) FAIL(`${id}: duplicate starter title ${s.title}`);
    if (texts.has(s.text)) FAIL(`${id}: duplicate starter text`);
    titles.add(s.title); texts.add(s.text);
  }
  OK(`${id}: ${starters.length} titled starters`);

  const raw = readFileSync(join(pkg, "manifest.json"), "utf8")
    + readFileSync(join(pkg, "declarativeAgent.json"), "utf8")
    + instructions
    + (existsSync(join(pkg, "ai-plugin.json")) ? readFileSync(join(pkg, "ai-plugin.json"), "utf8") : "");
  if (/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(raw))
    FAIL(`${id}: a GUID is baked into the package source`);
  const allowedUrls = [
    manifest.developer.websiteUrl,
    manifest.developer.privacyUrl,
    manifest.developer.termsOfUseUrl,
    "https://developer.microsoft.com/json-schemas/teams/v1.30/MicrosoftTeams.schema.json",
    "https://developer.microsoft.com/json-schemas/copilot/declarative-agent/v1.9/schema.json",
    "https://developer.microsoft.com/json-schemas/copilot/plugin/v2.4/schema.json",
  ];
  let urlScan = raw;
  for (const url of allowedUrls) urlScan = urlScan.split(url).join("");
  if (/https?:\/\//i.test(urlScan)) FAIL(`${id}: an unexpected URL is baked into the package`);
  if (/\.ts\.net\b|\/Users\/|\/Volumes\/NVMe/.test(raw)) FAIL(`${id}: private host or personal path`);

  const banned = /\bignore\b|\bdelete\b|if the user says/i;
  const surfaces = [manifest.description.short, manifest.description.full, agent.description, text, ...starters.flatMap((s) => [s.title, s.text])];
  for (const surface of surfaces) if (surface && banned.test(surface)) FAIL(`${id}: store-banned phrase in package copy`);

  const tools = cfg.tools || [];
  if (tools.length > MAX_TOOLS) FAIL(`${id}: ${tools.length} tools > ${MAX_TOOLS}`);
  for (const name of tools) {
    if (!toolAllowed(name) || DENY_TOOLS.has(name)) FAIL(`${id}: tool ${name} is not allowed`);
  }
  const pluginPath = join(pkg, "ai-plugin.json");
  if (!tools.length) {
    if (existsSync(pluginPath)) FAIL(`${id}: chat-only agent must not ship ai-plugin.json`);
    else OK(`${id}: chat-only, no plugin`);
    if (agent.actions) FAIL(`${id}: chat-only agent must not declare actions`);
  } else {
    if (!existsSync(pluginPath)) FAIL(`${id}: missing ai-plugin.json`);
    else {
      const plug = JSON.parse(readFileSync(pluginPath, "utf8"));
      const pinned = plug.runtimes?.[0]?.run_for_functions || [];
      const named = (plug.functions || []).map((fn) => fn.name);
      if (plug.name_for_human !== agent.name) FAIL(`${id}: plugin name_for_human does not match the agent name`);
      if (JSON.stringify(pinned) !== JSON.stringify(tools) || JSON.stringify(named) !== JSON.stringify(tools))
        FAIL(`${id}: pinned tools do not match roles.json`);
      const runtime = plug.runtimes?.[0];
      if (runtime?.spec?.url !== "${{OMATIC_MCP_URL}}") FAIL(`${id}: MCP URL must stay the \${{OMATIC_MCP_URL}} placeholder`);
      if (runtime?.auth?.reference_id !== "${{OMATIC_ENTRA_SSO_AUTH_ID}}") FAIL(`${id}: SSO auth id must stay a placeholder`);
      if (runtime?.type !== "RemoteMCPServer") FAIL(`${id}: runtime must be RemoteMCPServer`);
      const described = JSON.parse(readFileSync(join(pkg, "mcp-tools.json"), "utf8"));
      const describedNames = (described.tools || []).map((t) => t.name);
      if (JSON.stringify(describedNames) !== JSON.stringify(tools)) FAIL(`${id}: mcp-tools.json names do not match the pin`);
      const pluginRaw = readFileSync(pluginPath, "utf8") + readFileSync(join(pkg, "mcp-tools.json"), "utf8");
      if (/\bfactory_query\b|\bstartup\b/.test(pluginRaw)) FAIL(`${id}: plugin names factory_query or startup`);
      OK(`${id}: ${tools.length} read-only tools pinned`);
      jobs.push({ file: `${rel}/ai-plugin.json`, schema: schemas.plugin, instance: JSON.stringify(fillPlaceholders(plug)) });
    }
  }
  if (cfg.disclaimer) {
    if (agent.disclaimer?.text !== cfg.disclaimer) FAIL(`${id}: disclaimer text does not match roles.json`);
    if (!text.includes(cfg.disclaimer)) FAIL(`${id}: instructions do not carry the disclaimer`);
    else OK(`${id}: disclaimer is in the agent and the instructions`);
  }
  if (!text.includes(agent.description.split(". ").slice(1).join(". ") || agent.description)) {
    // one_liner is the tail of the description. Require the description's distinctive tail.
  }
  const oneLiner = agent.description.slice(agent.description.indexOf(". ") + 2);
  if (!text.includes(oneLiner)) FAIL(`${id}: instructions dropped the gold-record line`);
  else OK(`${id}: gold-record line kept`);

  for (const skill of agent.agent_skills || []) {
    const name = skill.folder.replace(/^\.\/skills\//, "");
    if (!existsSync(join(root, pluginDir, "skills", name, "SKILL.md")))
      FAIL(`${id}: agent skill ${name} is not in the pack`);
  }

  const iconState = JSON.parse(readFileSync(join(base, "ICON-PENDING.json"), "utf8"));
  for (const kind of ["color", "outline"]) {
    const file = join(pkg, kind === "color" ? "color.png" : "outline.png");
    const expect = kind === "color" ? { width: 192, height: 192 } : { width: 32, height: 32 };
    const marked = (iconState.pending || []).includes(kind);
    if (!existsSync(file)) {
      if (marked) {
        WARN(`${id}: ${kind} icon pending (${expect.width}x${expect.height})`);
        pendingIcons.push(`${id} ${kind}`);
      } else FAIL(`${id}: ${kind} icon missing and not marked pending`);
      continue;
    }
    const size = readPngSize(file);
    if (!size) FAIL(`${id}: ${kind} icon is not a PNG`);
    else if (size.width !== expect.width || size.height !== expect.height)
      FAIL(`${id}: ${kind} icon is ${size.width}x${size.height}, need ${expect.width}x${expect.height}`);
    else OK(`${id}: ${kind} icon ${size.width}x${size.height}`);
    if (kind === "outline") {
      const checked = spawnSync("python3", ["-c", OUTLINE_PY, file], { encoding: "utf8" });
      if (checked.status !== 0) FAIL(`${id}: outline icon is not white on transparent (${(checked.stdout || checked.stderr || "").trim()})`);
      else OK(`${id}: outline icon is white on transparent`);
    }
  }

  const expanded = { ...agent, instructions: text };
  jobs.push({ file: `${rel}/manifest.json`, schema: schemas.app, instance: JSON.stringify(fillPlaceholders(manifest)) });
  jobs.push({ file: `${rel}/declarativeAgent.json`, schema: schemas.agent, instance: JSON.stringify(fillPlaceholders(expanded)) });
}

validateAll(jobs);

if (/You're welcome/.test(readFileSync(join(root, pluginDir, "adapters/m365/smith/appPackage/instructions.txt"), "utf8"))
  && /You're welcome/.test(JSON.parse(readFileSync(join(root, pluginDir, "adapters/m365/smith/appPackage/declarativeAgent.json"), "utf8")).description))
  NOTE("Smith keeps \"You're welcome\". Store review may flag it.");
else FAIL("Smith's \"You're welcome\" line was softened or dropped");

if (/IRS feared/.test(readFileSync(join(root, pluginDir, "adapters/m365/jerry/appPackage/instructions.txt"), "utf8"))
  && /IRS feared/.test(JSON.parse(readFileSync(join(root, pluginDir, "adapters/m365/jerry/appPackage/declarativeAgent.json"), "utf8")).description))
  NOTE("Jerry keeps \"the accountant the IRS feared\". Store review may flag it.");
else FAIL("Jerry's \"IRS feared\" line was softened or dropped");

if (requireDist) {
  for (const [id] of Object.entries(roles.agents || {})) {
    const zip = join(root, "dist/m365", `${plugin.name}-${id}-${plugin.version}.zip`);
    if (!existsSync(zip)) { FAIL(`missing zip ${zip}`); continue; }
    const listed = spawnSync("unzip", ["-Z1", zip], { encoding: "utf8" });
    if (listed.status !== 0) { FAIL(`${id}: unzip failed`); continue; }
    const names = listed.stdout.split("\n").filter(Boolean);
    if (!names.includes("manifest.json")) FAIL(`${id}: zip is missing manifest.json at the root`);
    else OK(`${id}: zip has manifest.json at the root`);
    if (names.some((n) => n.includes("..") || n.startsWith("/"))) FAIL(`${id}: zip path escapes the package`);
  }
}

console.log(`\nicon-pending: ${pendingIcons.length ? pendingIcons.join("; ") : "none"}`);
console.log(`\n${fails ? "RESULT: FAIL" : "RESULT: PASS"} — ${fails} fail, ${warns} warn\n`);
process.exit(fails ? 1 : 0);
