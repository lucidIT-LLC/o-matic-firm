# Firm Copilot handoff — 2026-11-03

## PR heads

- PR #10: branch `cursor/m365-copilot-packages-1a98`, base `main`. Source-only Microsoft 365 Copilot packages for Smith, Jake, and Jerry (pack 1.7.0).
- PR #14: branch `cursor/m365-icon-brandy-fix-e58a`, base `cursor/m365-copilot-packages-1a98`. Icon admit + outline wiring. Stacked on PR #10.

## Done

- PR #10 supplies source-only Copilot packages with read-only / chat-only tool scopes. Nothing uploaded or deployed.
- PR #14 admits package icons under `firm/assets/m365/`, wires `outline_icon` for all three roles, ships `appPackage/outline.png`, and clears ICON-PENDING (`pending: []`).
- Foundry `brand_assets` #63–#68 registered for the six M365 PNGs (operator-approved admit 2026-11-03). Does not supersede Affinity SVG masters #30/#60.
- `verify-m365` reports `icon-pending: none` after admit.

## Still blocking public upload

- Privacy and terms URLs remain TODO placeholders in `firm/adapters/m365/roles.json`, app manifests, and env samples.
- Entra SSO is incomplete; `OMATIC_ENTRA_SSO_AUTH_ID` is blank. Read-only Copilot database login and token-store registration are outstanding. Do not upload or deploy yet.
- Affinity ART masters on the Mac ART tree were not mounted in the Cloud Agent host at admit time. Package icons are admitted exports; a later Affinity refresh can supersede them if needed.

## Next steps

1. Merge PR #10, then PR #14 (or merge the stack once both are green).
2. Replace privacy/terms placeholders with public Agent Store pages.
3. Complete Entra SSO and the read-only Copilot DB login before any tenant upload.

## Branch safety

PR #14 changes the host-adapter generator also used by PR #10. Keep the stack ordered: packages branch first, icon admit on top. Re-run `build-host-adapters.mjs . --check` and `verify-m365.mjs` after any generator edit.
