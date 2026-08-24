# Compliance posture — o-MATIC Firm

## The short version

**This repository makes no compliance claim.** It distributes Markdown
instruction files. It processes no data, stores nothing, transmits nothing, and
enforces nothing.

That is accuracy, not modesty. Compliance properties belong to the system that
handles data — the **O-Matic Server** and the **O-Matic Factory** on it.

- No PHI, no PII, no customer data — and it cannot receive any.
- No credentials, and no way to obtain one.
- Cannot open a connection. There is no code to do it.
- Installing a pack changes what a model reads. It does not change what any
  system can reach.

**The trust boundary is the O-Matic Server**, not this repository.

## Where the real claims live, and their ceiling

Compliance status is tracked in the System 5 compliance register, which records a
**truth status** per control — MISSING / DESIGNED / BUILT / LIVE / EVIDENCED /
ASSESSED — with the evidence that advanced it. Public language is capped by that
status:

| Truth status | What may be said publicly |
|---|---|
| MISSING / DESIGNED / BUILT | **Nothing.** |
| LIVE | The specific measured mechanism, nothing more. |
| EVIDENCED | The "designed to support HIPAA Security Rule safeguards" formulation. |
| ASSESSED | Only what the assessment letter permits, quoted. |

**Forbidden at every rung:** "HIPAA certified" (no such certification exists),
"HITRUST certified" before a validated assessment, and "compliant" as an
unqualified adjective.

Ask for the current register rather than inferring status from any document,
including this one.
