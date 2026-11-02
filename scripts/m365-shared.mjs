// Shared Microsoft 365 Copilot package rules for the Firm builder, zip step,
// and verify step. Schemas are Microsoft's published drafts, vendored so CI
// can validate offline:
//   declarative agent v1.9 (2026-10-22)
//   https://developer.microsoft.com/json-schemas/copilot/declarative-agent/v1.9/schema.json
//   plugin v2.4 (2026-09-30)
//   https://developer.microsoft.com/json-schemas/copilot/plugin/v2.4/schema.json
//   Teams / Microsoft 365 app manifest v1.30 (2026-08-11)
//   https://developer.microsoft.com/json-schemas/teams/v1.30/MicrosoftTeams.schema.json
import { readFileSync } from "node:fs";

export const MAX_TOOLS = 8;
export const MAX_STARTERS = 6;
export const MIN_STORE_STARTERS = 3;
export const INSTRUCTION_LIMIT = 8000;
export const DISCLAIMER_LIMIT = 500;

// Read-only tools a Copilot package may name. factory_query and startup are
// absent on purpose. DENY wins if a name is ever added here by mistake.
export const READ_ONLY_TOOLS = new Set([
  "connections_list",
  "omatic_guide",
  "search",
  "embed_query",
  "task_relationships",
  "task_duplicate_check",
  "slate_entity_search",
  "slate_entity_verify",
  "slate_canvas_open",
  "slate_scene_observe",
  "slate_asset_get",
  "db_health_snapshot",
  "proposal_vault_list",
  "proposal_vault_get",
  "ocr_result_get",
  "module_status",
  "observability_snapshot",
  "mom_summary",
  "mom_network_inventory",
  "mom_compliance_posture",
  "mom_trends",
  "ladder_status",
  "vision_page_get",
]);

export const DENY_TOOLS = new Set([
  "factory_query",
  "factory_owner_ddl",
  "startup",
  "module_install",
  "module_uninstall",
  "mom_signal_append",
  "retrieval_tune",
  "factory_web_publish",
  "factory_web_rollback",
  "factory_web_status",
  "proposal_vault_put",
  "proposal_vault_delete",
  "proposal_vault_append",
  "proposal_vault_stage",
  "proposal_vault_ingest",
  "proposal_vault_organize",
  "proposal_vault_upload_start",
  "proposal_vault_upload_chunk",
  "proposal_vault_upload_commit",
  "proposal_vault_purge",
  "proposal_vault_restore",
  "proposal_vault_transfer_batch",
  "kernel_session_open",
  "kernel_plan_update",
  "kernel_session_get",
  "kernel_delegate",
  "kernel_return",
  "slate_canvas_create",
  "slate_revision_commit",
  "slate_revision_restore",
  "slate_asset_put",
  "slate_proposal_create",
  "slate_proposal_approve",
  "slate_proposal_reject",
  "work_claim_acquire",
  "work_claim_release",
  "capability_request",
]);

export const TOOL_BLURBS = {
  connections_list: "List the factory connections granted to the signed-in user. Read-only.",
  omatic_guide: "Read the o-MATIC operating guide for a named topic. Read-only.",
  search: "Search factory records the signed-in user is allowed to read. Read-only.",
  embed_query: "Search factory records by meaning. Read-only.",
  task_relationships: "Read relationships between factory tasks. Read-only.",
  task_duplicate_check: "Read whether a task already exists. Read-only.",
  slate_entity_search: "Search Slate entities the signed-in user can read. Read-only.",
  slate_entity_verify: "Read a Slate entity and report whether the record supports a claim. Read-only.",
  slate_canvas_open: "Open a Slate canvas the signed-in user can read. Read-only.",
  slate_scene_observe: "Read the contents of a Slate scene. Read-only.",
  slate_asset_get: "Read one Slate asset the signed-in user can access. Read-only.",
  db_health_snapshot: "Read a database health snapshot for a granted read-only connection. Read-only.",
  proposal_vault_list: "List proposal-vault files in a granted folder. Read-only.",
  proposal_vault_get: "Read one proposal-vault file the signed-in user can access. Read-only.",
  ocr_result_get: "Read an OCR result the signed-in user can access. Read-only.",
  module_status: "Read which optional server modules are configured. Read-only.",
  observability_snapshot: "Read an observability snapshot. Read-only.",
  mom_summary: "Read a monitoring summary. Read-only.",
  mom_network_inventory: "Read a network inventory summary. Read-only.",
  mom_compliance_posture: "Read a compliance posture summary. Read-only.",
  mom_trends: "Read monitoring trends. Read-only.",
  ladder_status: "Read ladder status. Read-only.",
  vision_page_get: "Read one vision page the signed-in user can access. Read-only.",
};

export const PLACEHOLDERS = {
  "${{TEAMS_APP_ID}}": "00000000-0000-4000-8000-000000000001",
  "${{OMATIC_MCP_URL}}": "https://example.com/mcp",
  "${{OMATIC_ENTRA_SSO_AUTH_ID}}": "TODO-entra-sso-auth-config-id",
};

export function fillPlaceholders(value) {
  if (typeof value === "string") {
    let next = value;
    for (const [from, to] of Object.entries(PLACEHOLDERS)) next = next.split(from).join(to);
    return next;
  }
  if (Array.isArray(value)) return value.map(fillPlaceholders);
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = fillPlaceholders(v);
    return out;
  }
  return value;
}

export function toolAllowed(name) {
  return READ_ONLY_TOOLS.has(name) && !DENY_TOOLS.has(name);
}

export function pngSize(buf) {
  if (!buf || buf.length < 24) return null;
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (!buf.subarray(0, 8).equals(sig)) return null;
  if (buf.subarray(12, 16).toString("ascii") !== "IHDR") return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

export function readPngSize(path) {
  try { return pngSize(readFileSync(path)); }
  catch { return null; }
}
