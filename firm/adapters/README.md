# Firm Host Adapters

The Firm is one retained bench: Smith and Jake. `../skills/` holds the canonical
personalities and operating rules, and `ROLE-CORE.md` is the shared adapter core
every host file loads. These files are native host entry points; they never
replace or abridge a role.

**There is no separate Firm contract document.** For Firm roles the canonical
skill *is* the contract — `factory.agent_runtime_contracts.contract_digest` is
the sha256 of that role's own `SKILL.md`. A shipped contract file would be a
second authority to keep in sync, and its digest would not match.

| Host | Entry point | L1 | L2 |
| --- | --- | --- | --- |
| Claude / Claude Code | `claude/agents/` plus `../skills/` | Skills/subagents | SDK or bounded subagent after evaluation |
| Codex | `../.codex-plugin` plus `../skills/` | Plugin skills | Host agent harness after evaluation |
| Copilot | `copilot/.github/agents/` | Custom agents | Host automation after evaluation |

**The Copilot payload is self-contained.** `copilot/.github/` carries its own
generated copy of the adapter core under `copilot/.github/omatic/`, loaded as
`../omatic/<file>`, because that directory is copied into a different workspace
where no relative path back into this pack resolves. Regenerate with
`node ../scripts/sync-copilot-payload.mjs`; `--check` fails on drift.

`node ../scripts/check-paths.mjs` resolves every relative file reference in the
pack and re-resolves the Copilot payload from a scratch workspace. It exits
non-zero on a broken reference. It ships before Firm's first path defect rather
than after one, which is the only difference between this pack and the two that
learned it the other way.

Configure the o-MATIC Server MCP connection in the target host; never copy
credentials or connection names into this repository.

Every adapter is **L1 only** until `factory.agent_runtime_contracts` records a
registered, evaluated deployment. No Firm role has a conformance eval that has
ever been executed; `evidence_status` is `design_verified` for all of them.
