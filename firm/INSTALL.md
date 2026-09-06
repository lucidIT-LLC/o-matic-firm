# Install o-MATIC Firm

The Firm is retained expertise as skills only: Smith and Jake. This pack ships
no MCP server and stores no credential. Configure the target host's o-MATIC
Server MCP pairing separately.

- **Claude / Claude Code:** install `firm/` as a plugin. For named subagents,
  point the host at `adapters/claude/agents/`. Each file loads the shared
  adapter core by relative path, which resolves while the directory stays in
  place inside the pack. A host that requires agents at a fixed location outside
  the pack must rewrite that reference on deployment — and must not pin a
  version-numbered plugin-cache path, which the next update breaks silently.
- **Codex:** install `firm/` as a plugin.
- **Copilot:** copy `adapters/copilot/.github/` into the target workspace. It is
  self-contained — its adapter core travels with it under `.github/omatic/` — so
  the Firm pack does **not** need to be checked out alongside. Install `skills/`
  alongside as well for full canonical role depth rather than the governance
  boundary alone.

L2 is off until `factory.agent_runtime_contracts` records a registered,
evaluated deployment. No file in this pack grants it, and no Firm role has a
conformance eval that has ever been executed.

**Rimmer is not here.** He was retired 2026-09-04 and decision #416 named Smith
his successor; `skills/rimmer-evals` was removed in 1.3.0. His evaluation lane
is `firm:smith-evals`.

## Verify before you ship a change

```
node scripts/check-paths.mjs                    # every relative reference resolves
node scripts/sync-copilot-payload.mjs --check   # vendored Copilot copy not drifted
claude plugin validate .
```
