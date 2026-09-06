# o-MATIC Firm — Changelog

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
