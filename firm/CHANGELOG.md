# o-MATIC Firm — Changelog

## 1.4.6 — 2026-09-30

Skills meet Anthropic's own skill-authoring rules, as a build gate (task #1024).

- Anthropic's guidance ("Skill authoring best practices", platform.claude.com) keeps a SKILL.md body under 500 lines and moves detail into reference files linked one level deep. `scripts/build-host-adapters.mjs` now enforces it: a body over 500 lines, an unlinked or missing reference, a nested reference, or a reference over 100 lines without a "## Contents" fails the build.
- The Gemini CLI copy now carries every file of a skill, reference files included, and each ChatGPT setup lists every reference file as knowledge (up to OpenAI's 20-file limit). Before this, a split skill would have lost its reference files on both hosts.
- `scripts/test-build-host-adapters.mjs` is the builder's own test: 10 checks, 7 of which fail on the previous builder.
- CI was red on the previous release: it still called a test retired in that same release. It now runs the builder test and `build-host-adapters.mjs --check` instead.
- Jake's role guide went from 612 lines to 430: the Surf Log and the operating modes moved, word for word, into `reference/` files named in SKILL.md with the moment to read each. Identity, voice, archetype and the distress override stay in SKILL.md.

## 1.4.5 — 2026-09-30

Every role on every host, built to each vendor's own documentation (task #1024).

- Claude Code agents now ship natively in `firm/agents/` (read by Grok Build as well). The SessionStart hook that copied agent files into `~/.claude/agents` is retired.
- Generated per role by `scripts/build-host-adapters.mjs` from the gold-record export: Codex custom agents (`.toml`), a Gemini CLI extension at the repository root, GitHub Copilot custom agents, Microsoft 365 Copilot declarative agents, ChatGPT GPT instructions with setup, and Grok custom-agent instructions. Vendor limits are enforced at build time.
- Nothing shipped names or looks for a private server: `check-no-private-servers.mjs` scans every text file, and a planted private name fails it.
- L2 is not claimed anywhere yet: it waits for the role conformance eval to pass live on each host.

## 1.4.2 — 2026-09-28

**One root cause, fixed once (tasks #963, #983):** host artifacts were deployed
by hand on one Mac instead of being derived from the pack, so they could not be
restored, shipped to the second Mac, or kept current. Now the pack delivers them.

- **Role adapters deploy themselves.** `hooks/hooks.json` runs
  `scripts/verify-adapter-paths.mjs --hook` on SessionStart: it installs this
  pack's Claude Code agent files into `~/.claude/agents/` when missing, updates
  one that is still exactly what was last deployed, and reports (never
  overwrites) a hand-edited copy. `--deploy` adopts legacy copies, backing them
  up under `~/.claude/state/adapter-backups/` (outside the agents directory,
  which Claude Code scans recursively).
- **No versioned path survives.** Agent templates preload their skills through
  frontmatter `skills:` and reach ROLE-CORE / contracts relative to the preloaded
  skill's base directory. A versioned plugin-cache path in any deployed adapter
  now FAILS on sight, whatever version it names. Fixtures:
  `scripts/verify-adapter-paths.test.mjs` (11 cases, proven able to fail).
- **CI can pass (task #1002).** The Spirit Gate step needed a token for, and a
  route into, a tailnet-only server; it is now the local pre-release step and is
  env-driven with no estate default URL or tenant. CI instead runs
  `scripts/verify-identity-attestation.mjs`: every shipped identity_signature
  must equal the committed gold-record export (`persona-attestation.json`,
  schema 2, from `scripts/persona-attest-export.sql`). Offline, deterministic,
  proven to fail on a planted mismatch.
- **Checks that fail on the class (Smith #1013 RC-2, F9, F11, F12).**
  verify-pack 2.0.0 adds: retired KB cited as current (list exported from
  Commons `kb.documents.status` into `scripts/retired-kb.json`), a connection
  name written as a literal, a private tailnet address, and a version-pinned
  cache path. CI now also runs check-paths, the Copilot payload `--check`, the
  adapter fixtures and any hook fixture suite. One canonical copy of all pack
  tooling lives in o-matic-studio and is synced by `scripts/sync-pack-tooling.mjs`
  (`--check` fails on drift); sync-copilot-payload reads a per-pack
  `adapters/copilot/payload.json` so one script serves every pack.
- **Removed:** `sync-shared.mjs` and `shared/system-5-detection.md` — zero
  consumers; the fragment shipped in three repos and was loaded by nothing
  (Smith #1013 F10). History keeps it.

## 1.3.0 — 2026-09-06

**Rimmer's retirement, completed.**

### 1. The half that matters: the pack stops shipping him

`skills/rimmer-evals` is **removed**.

Rimmer was retired 2026-09-04. Firm 1.2.1 kept shipping him — and was updated
the same day he was retired. The result, measured in session #216: he recurred
**three times in one session** as a routing target. Probot assigned a Key Result
to him. Brandy propagated "Rimmer's lane" from that same field. Smith's own
conformance work named him.

Tim, retired earlier, did **not** recur — because his skill was removed from
this pack.

That is the whole mechanism. The host offers what the pack ships, free, on every
turn; the roster requires a deliberate query. **A cheap wrong source beats an
expensive right one every time, and nobody notices they chose.** Adding a
successor without removing the predecessor leaves two answers on every host and
reproduces the exact failure being closed.

Per decision #416, **a retirement is four steps**: (1) the capability has a named
successor or a stated absence; (2) the authority transfers; (3) open work is
reassigned to an owner who can perform it; (4) **the host surface stops offering
the retired role.** Steps 1–3 are database work. Step 4 is packaging, it is the
step that was skipped for Tim's authority half and for Rimmer entirely, and it
is the only one a session can trip over with nobody looking. This release is
step 4. The four-step definition is now written into `adapters/ROLE-CORE.md`
clause 9 and into `smith-evals` as a thing to check *against what a pack
actually ships*, not against what a decision record says was decided.

Residue cleared with it: `smith-critic`'s pack roster, `jake-coach`'s two
routing lines, `README.md`, both plugin manifests, the Codex `defaultPrompt`
(which literally read "Rimmer, package the eval evidence"), and both marketplace
descriptions. Rimmer is still named where he is named **to forbid the route** —
in the README retirement note, in ROLE-CORE clause 9, and in `smith-evals` — and
nowhere as an available destination.

### 2. The capability lands on Smith

`skills/smith-evals/` — evidence-first evaluation of skills, agents, plugin
packages and factory workflows: intake, evidence collection, validity screening,
two-pass sterilization, scoring, and the evidence-bundle and release-gate output
contracts.

**The roster does not grow.** Decision #416, operator ruling, session #216,
verbatim: *"successor to rimmer is skills for smith. just add as skills to smith
what rimmer could do."* It follows the Tim precedent exactly — an existing role
absorbing a capability rather than a new persona being invented. Evaluation and
criticism are the same discipline pointed at different artifacts: both
adversarial, both evidence-first, both there to find what is wrong rather than
confirm what is hoped. A separate evaluator would carve trigger phrases out of
Smith's territory and force an operator to choose between the critic and the
evaluator, who are the same person.

The counterweight from #416 is carried in the skill rather than dropped: a critic
who also owns the evidence package can grade his own criticism. The mitigation is
that eval evidence is **data** — it lands in `factory.roster_audit_log`, readable
by the operator and any other role — and that a Smith evaluating Smith's work
must declare the conflict in the bundle's collection metadata.

Two rules are stated harder than Rimmer stated them, because Smith demonstrated
both this session: **never raise `evidence_status` on a partial result** (a
10-of-12 run is a 10-of-12 run; recording it as proven is decision #226's
unfalsifiable-success defect), and **a shipped artifact that has never been
exercised is not evidence that it works** — `factory-staleness-audit` sat in four
released agency versions with frontmatter that made it unloadable, and every
manifest listed it as present.

### 3. Firm's first host adapters

The pack shipped **no** `adapters/` directory at all: no Claude, no Codex, no
Copilot entry point, for either role.

- `adapters/claude/agents/smith.md` and `jake.md`
- `adapters/copilot/.github/` — **self-contained**, carrying its own generated
  copy of the adapter core under `.github/omatic/`, loaded as `../omatic/<file>`.
  That directory is copied into a different workspace where no path back into
  this pack resolves, which is how agency shipped a path that resolved nowhere
  and studio shipped one that resolved *inside* the pack and broke only after
  the copy. Firm ships the self-contained model before its first defect rather
  than after one.
- `adapters/ROLE-CORE.md` — the shared core.

**There is no Firm contract document, deliberately, and the reason is measured.**
`contract_digest` for a Firm role is the sha256 of that role's own `SKILL.md`:
smith's recorded `f69f6b85…` is exactly the hash of `smith-critic/SKILL.md` at
commit `803ae72`. The skill *is* the contract. A shipped contract file would be
a second authority to keep in sync and its digest would match nothing.

### 4. Verification that can fail

- `scripts/check-paths.mjs` resolves every relative reference in the pack and
  re-resolves the Copilot payload from a scratch workspace. Proven in both
  directions at release: exit 0 on the shipped tree, exit 1 on a restored broken
  path, in both the pack scan and the scratch-workspace scan.
- `scripts/sync-copilot-payload.mjs --check` exits 1 on vendored drift.
- All three `SKILL.md` files were checked for the frontmatter defect that made
  `factory-staleness-audit` unloadable in every agency version ever installed
  (fence opening at line 1 with prose inside it, `name:` landing at line 22).
  **None found** — all three open the fence at line 1, carry `name:` at line 2,
  and close at line 4.

### 5. Governance carried into every file

- **Decision #413** — Objectives, Key Results, KPIs, and key governance tools are
  operator decisions. This binds Smith hardest: he is the role most often handed
  a rubric, and adjusting a rubric so a red reading comes out green is regrading
  by another name.
- **Decision #415** — database mutations are Data's, under the
  enforces-vs-remembers test. Smith writes `factory.roster_audit_log`, his own
  lane, and routes schema needs to Data.
- **Stop-and-route** — a contract contradiction is a governance defect, not a tie
  for the role to break at runtime, and never license for the thing the stricter
  statement forbids.

### 6. Database work handed to Data, not done here

`migrations/2026-09-06-smith-owns-evals.sql` updates the two moved digests. It
deliberately leaves the `rimmer` row in `factory.agent_runtime_contracts` alone
and hands it to Data with the reasoning: there is no verified allowed value for
a retired deployment state on that column, and #416 itself records that
`factory.agent_state` has no successor column — "retirement expressed by
convention rather than by constraint." Inventing an enum value to make the row
look tidy would be the same defect one layer down.

### Also

- Versions: `.claude-plugin` and `.codex-plugin` both read 1.2.1; the marketplace
  entry read 1.0.4. All three now read **1.3.0**.
- **Not changed, and reported instead:** `.claude-plugin/marketplace.json` still
  declares `"license": "MIT"` while both plugin manifests declare `BUSL-1.1`.
  That is a licensing claim, not a packaging mechanism, and it is the operator's
  to settle. The same mismatch exists in the agency and studio marketplaces.
- **Honesty:** no Firm role has a conformance eval that has ever been executed.
  This pack ships no eval suite at all, and `core-role-conformance.yaml` in the
  Agency pack covers probot, fred and data only. `evidence_status` stays
  `design_verified`. Smith, of all roles, does not get to grade himself green.
