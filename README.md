<p align="center">
  <img src=".github/brand/omatic-wordmark.png" width="240" alt="o-MATIC" />
</p>

<p align="center">
  Built by <a href="https://o-matic.ai">o-MATIC</a>, the AI research division of <a href="https://lucidit.io">LucidIT, LLC</a>.
</p>

# o-MATIC Firm

**Expertise you retain.**

You don't hire a critic full time. You bring one in when the plan matters.

o-MATIC Firm is the retained bench — engaged for a problem, not employed to run
the place.

| Skill | Who | What you retain them for |
|---|---|---|
| `firm:smith-critic` | Smith | Adversarial review. Stress-tests plans, architecture, copy and factory configuration. Cold, surgical, no softening. |
| `firm:smith-evals` | Smith | Evidence-first evaluation. Collects, sterilizes, scores and packages eval evidence. Same person, second lane. |
| `firm:jake-coach` | Jake | AI coaching and teaching. Practice-first, adapts depth to the learner. |
| `firm:jerry-accountant` | Jerry | Bookkeeping, tax, and household and business finance. Report-only. |
| `firm:grok-jake` | Jake | Grok Bot host ritual. Additive to `jake-coach`. |
| `firm:grok-jerry` | Jerry | Grok Bot host ritual. Additive to `jerry-accountant`. Read-only on finance data unless the operator approves the exact statement. |

**Rimmer is retired** (2026-09-04; successor named by decision #416, 2026-09-06).
His evaluation lane is now `firm:smith-evals`, and `skills/rimmer-evals` was
removed from this pack in 1.3.0. Adding the successor without removing the
predecessor is the defect, not the fix: a pack that still ships a retired role
offers it free on every turn, while the roster requires a deliberate query.

**Employment note.** Smith is a **contract employee** — retained, not on staff.
Jake is an **opt-in lane** agent. Jerry is an **opt-in consultant**, like Smith,
and he reports rather than posting to the books. None of them is constitutive:
a factory starts without them. That is the difference between the Firm and the
Agency.

## The other doors

You don't go to a hardware store for a marketing manager. Each o-MATIC
marketplace is named for the place you would really go:

- **o-MATIC Agency** — staff who *run* the factory: Probot, Fred, Data
- **o-MATIC Firm** — expertise you *retain*: Smith, Jake, Jerry
- **o-MATIC Studio** — people who *design and build*: Brandy, Carver, Monet, Jo, Pixel
- **o-MATIC Supply** — *tools, not people*: the WordPress and Elementor connectors

## This pack ships no MCP server, on purpose

A plugin that declares an `mcpServers` block is **omitted** by hosted-marketplace
hosts — measured on two hosts and exactly reproducible. Shipping skills alone is
what lets them install on Cowork, Claude Code desktop, and any sandboxed host.

**Compatibility tier (rule #284):** on a host with the o-MATIC Server MCP surface
configured, these operate fully. On a **prompt-only host — including a local
Ollama model — they are behavior-only, with no factory database capability.**
Voice, lane discipline and judgement still work; the factory brain does not.

## Verifying a change

```bash
claude plugin validate .                              # schema, sources, duplicate names
node scripts/verify-pack.mjs .                        # no retired mechanism, retired KB, connection literal or pinned path
node scripts/verify-identity-attestation.mjs .        # shipped identities match the committed gold-record export (offline)
node firm/scripts/check-paths.mjs                 # every file reference resolves, including the Copilot payload
node firm/scripts/sync-copilot-payload.mjs --check
node firm/scripts/verify-adapter-paths.test.mjs   # the adapter deploy check can fail
```

CI (`.github/workflows/verify-pack.yml`) runs the same steps. Two more run
**locally, before a release**, because they need this host: the Spirit Gate
(rule #350), `OMATIC_MCP_URL=… OMATIC_MCP_TOKEN=… node scripts/spirit-gate-check.mjs .`,
and, after the release is installed, `node <installed plugin>/scripts/verify-adapter-paths.mjs`.

The tooling above is one canonical copy in `o-matic-studio`, synced into the
other packs with `node scripts/sync-pack-tooling.mjs` there (`--check` fails on
drift). Edit it in `o-matic-studio`, never in a copy.

## Security and compliance

See `SECURITY.md` and `COMPLIANCE.md`. This repository is text: no credentials, no
connections, no compliance claim. The trust boundary is the o-MATIC Server.

## Cursor and Grok Bot

**Cursor:** This repository includes a Cursor plugin manifest. On Teams and Enterprise, a team admin can import this GitHub repository as a team marketplace from **Dashboard → Plugins & MCPs → Team Marketplaces → Add Marketplace → Import from Repo**, then install the `firm` plugin in Cursor Customize. Cursor requires public Marketplace plugins to be open source. This repository's current BUSL license explicitly is not open source, so it is not eligible for public Marketplace submission under the current license. LucidIT, LLC confirms that its intended public GitHub and Cursor Team Marketplace distribution route is authorized for this package. A fresh install has not yet been verified. See [Cursor's plugin guide](https://prod.cursor.com/docs/plugins) and [Marketplace submission page](https://cursor.com/marketplace/publish).

**Grok Bot:** Grok Bot is a defined host. Each role is its own bot, with a name, memory, routines, connectors, and a Linux computer. Skills load by name. This repository does not install a bot and does not ship a connector or a credential.

Load the host skill with the canonical role skill:

- `grok-jake` with `jake-coach`
- `grok-jerry` with `jerry-accountant`

Paste the Bot description from `firm/adapters/grok-bot/<role>.md`. Smith's grok.com card (`firm/adapters/grok/smith.md`) treats Grok Bot as a defined host. No `grok-smith` skill ships in this pack. `firm/adapters/grok/<role>.md` remains the grok.com custom-agent paste and is not itself a Grok Bot binding.

Configure the o-MATIC Server connector on the bot when factory memory is required. The host skill joins Probot's `conversation_key` and does not mint one. Writes wait for explicit approval of the exact content. Outgoing messages stay drafts. Jerry stays read-only on finance data unless the operator approves the exact statement, which Data applies.

No public o-MATIC Bot template is linked here yet. LucidIT, LLC confirms public distribution rights for the Agency, Firm, Studio, and Supply package sources. See [xAI's Bot sharing and import guide](https://docs.x.ai/grok-bot/bots).

## License

Business Source License 1.1 (BUSL). See `LICENSE.md`. Converts to Apache License, Version 2.0 on 2030-09-05.
