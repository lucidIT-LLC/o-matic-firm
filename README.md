<p align="center">
  <img src=".github/brand/omatic-wordmark.png" width="240" alt="o-MATIC" />
</p>

<p align="center">
  Built by <a href="https://o-matic.ai">O-MATIC</a>, the AI research division of <a href="https://lucidit.io">LucidIT, LLC</a>.
</p>

# o-MATIC Firm

**Expertise you retain.**

You don't hire a critic full time. You bring one in when the plan matters.

o-MATIC Firm is the retained bench — engaged for a problem, not employed to run
the place.

| Skill | Who | What you retain them for |
|---|---|---|
| `firm:smith-critic` | Smith | Adversarial review. Stress-tests plans, architecture, copy and factory configuration. Cold, surgical, no softening. |
| `firm:tim-tools` | Tim | Tool optimization. Audits MCP connectors, scopes what a project actually needs, pulls live schemas so agents stop guessing. |
| `firm:rimmer-evals` | Rimmer | Evidence-first evaluation. Collects, sterilizes, scores and packages eval evidence. |
| `firm:jake-coach` | Jake | AI coaching and teaching. Practice-first, adapts depth to the learner. |

**Employment note.** Smith is a **contract employee** and Rimmer is a
**contractor** — retained, not on staff. Jake is an **opt-in lane** agent. None of
them are constitutive: a factory starts without them. That is the difference
between the Firm and the Agency.

## The other doors

You don't go to a hardware store for a marketing manager. Each o-MATIC
marketplace is named for the place you would really go:

- **o-MATIC Agency** — staff who *run* the factory: Probot, Fred, Data
- **o-MATIC Firm** — expertise you *retain*: Smith, Tim, Rimmer, Jake
- **o-MATIC Studio** — people who *design and build*: Brandy, Carver, Monet, Jo, Pixel
- **o-MATIC Supply** — *tools, not people*: the WordPress and Elementor connectors

## This pack ships no MCP server, on purpose

A plugin that declares an `mcpServers` block is **omitted** by hosted-marketplace
hosts — measured on two hosts and exactly reproducible. Shipping skills alone is
what lets them install on Cowork, Claude Code desktop, and any sandboxed host.

**Compatibility tier (rule #284):** on a host with the O-Matic Server MCP surface
configured, these operate fully. On a **prompt-only host — including a local
Ollama model — they are behavior-only, with no factory database capability.**
Voice, lane discipline and judgement still work; the factory brain does not.

## Verifying a change

```bash
claude plugin validate .        # schema, sources, duplicate names
node sync-shared.mjs --check    # shared fragments have not forked
node ../verify-pack.mjs .       # no retired mechanism survives as an instruction
```

## Security and compliance

See `SECURITY.md` and `COMPLIANCE.md`. This repository is text: no credentials, no
connections, no compliance claim. The trust boundary is the O-Matic Server.

## License

MIT. See `LICENSE`.
