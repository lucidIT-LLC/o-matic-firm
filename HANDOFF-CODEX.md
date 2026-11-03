# Firm Copilot handoff — 2026-11-03

## PR heads and CI

- PR #10: branch `cursor/m365-copilot-packages-1a98`, head `b57918d9a9287a9f95492e99a40b04c206afbf14`, base `main` at `f967ece37ff8e24b1aa7568c46188f13a6b4a6ef`. Open and mergeable. `verify-pack` run #50 passed on this head; `build-host-adapters.mjs . --check` reported 63 files for 3 roles, 0 out of date; M365 verification passed with 0 failures and 9 warnings.
- PR #14: branch `cursor/m365-icon-brandy-fix-e58a`, head `1dc227ca44edb67d6c5de848f924d9544e05ea21`, base ref `cursor/m365-copilot-packages-1a98` reported at `d8d5ab087b9116e6bfb674a6a25f1edc6ff617a9`. Open and mergeable. `verify-pack` run #49 passed on this head; `build-host-adapters.mjs . --check` reported 60 files for 3 roles, 0 out of date; M365 verification passed with 0 failures and 9 warnings.

## Done

- PR #10 supplies source-only Microsoft 365 Copilot packages for Smith, Jake, and Jerry, with the 1.7.0 pack version and read-only/chat-only tool scopes. Nothing is uploaded or deployed.
- PR #14 adds interim color and outline icon exports and updates the canonical adapter generator to emit `interim_outline` custody metadata and the Brandy HOLD note. The generated-file drift check is green on both current PR heads.

## Half-done and blockers

- Store-final ART masters are indexed in Foundry but were not mounted in the cloud VM. Jake and Jerry lack `brand_assets` master rows. The current assets are interim.
- Brandy allowed the interim commit with conditions; store-final icons still require admission and a Brandy re-gate. `ICON-PENDING` remains for all three roles. On the current PR #10 head, `roles.json` has `outline_icon: null` for Smith, Jake, and Jerry; the outlines are not wired into the app packages.
- Privacy and terms URLs remain TODO placeholders in `firm/adapters/m365/roles.json`, app manifests, and environment samples.
- Entra SSO is not complete; `OMATIC_ENTRA_SSO_AUTH_ID` is blank. The read-only Copilot database login and token-store registration are also outstanding. Do not upload or deploy the packages yet.

## Local-only state (not part of either PR)

- `/Users/lucid/Code/o-matic-firm`: clean checkout on `cursor/jerry-accountant-art-8cc3`, HEAD `ca2f046294506585b859fddf6707c37b88900cc7`; it is not the PR #10 branch.
- `/tmp/o-matic-firm`: local `main` at `fc982f28e4b08950d70f1a0a46cb40402c471ca6`; tracked modification `README.md`; untracked `firm/assets/pets/jake/v2/README.md`, `firm/assets/pets/jake/v2/jake-pet-v2.png`, and `firm/assets/pets/jake/v2/metadata.json`. These pet files are local-only in this checkout; keep them out of the handoff commit.
- The separate `/Users/lucid/Documents/Work/O-Matic` project has unrelated local changes; it was not used or modified for this handoff.

## Exact next three steps

1. Reconcile PR #14 with the current PR #10 branch before merging either. The PR compare results show PR #10 and PR #14 each have a distinct three-commit line from `d8d5ab0`; PR #14 does not contain PR #10's three post-base commits. Re-run both package and generated-file checks after choosing the merge order.
2. Admit/mount the store-final ART masters, add the missing Jake/Jerry `brand_assets` records, and regenerate the final color and outline assets from those masters.
3. Obtain Brandy's final re-gate, wire approved `outline_icon` paths and clear `ICON-PENDING`; replace privacy/terms placeholders and complete Entra SSO plus the read-only database login/token-store setup before any upload.

## Branch safety

PR #14 changes the same host-adapter generator used by PR #10 and is based on an earlier PR #10 commit. Its three commits and PR #10's current three post-base commits are separate lines. Do not rebase, merge, or copy generated outputs between these branches without coordinating the stack and rerunning the checks. Do not commit the local-only pet files listed above.


## Post-write branch check

- The first handoff commit `74f77df99b30c2d50508dbf748932980d401e1fb` adds only this file to the prior PR #10 head `b57918d9a9287a9f95492e99a40b04c206afbf14`. No workflow run for that text-only commit had appeared at the follow-up read.
- After that branch advance, PR #14 still points at `1dc227ca44edb67d6c5de848f924d9544e05ea21` and GitHub now reports `mergeable: false`; its prior run #49 passed at that head. Do not resolve this by rebasing or merging without coordinating the two lines.
- The final note-only update will become the current PR #10 branch tip; the exact final commit SHA is in the handoff response.
