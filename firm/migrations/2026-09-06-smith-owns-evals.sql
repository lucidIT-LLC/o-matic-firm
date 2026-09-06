-- Firm 1.3.0 — decision #416: Smith succeeds Rimmer in the evaluation lane.
--
-- APPLYING THIS IS DATA'S (decision #415). Carver ships the file; Data runs it.
--
-- BACKGROUND ON THE DIGESTS. For Firm roles there is no separate contract
-- document: contract_digest is the sha256 of that role's own SKILL.md. Verified
-- against git history — smith's recorded f69f6b85… is exactly
-- `git show 803ae72:firm/skills/smith-critic/SKILL.md | shasum -a 256`. This
-- release edits both shipped skills, so both digests move. Verify before
-- applying:
--   shasum -a 256 firm/skills/smith-critic/SKILL.md
--   shasum -a 256 firm/skills/jake-coach/SKILL.md
--
-- NOT TOUCHED: l1_deployment_state, l2_deployment_state, platform_adapters,
-- evidence_status. Deployment state is measured, not shipped, and no Firm role
-- has a conformance eval that has ever been executed — nothing in this release
-- raises the evidence bar and nothing in it may imply that it did.

UPDATE factory.agent_runtime_contracts
   SET contract_digest = 'sha256:78a203ffa2891685feb9f99c8a120f24d9e99345c02dd92b499725fddacbf8a5',
       updated_at = now()
 WHERE tenant_id = 'omatic' AND agent_name = 'smith';

UPDATE factory.agent_runtime_contracts
   SET contract_digest = 'sha256:344063bff253905a40c82f2ae194ed44c810af98fe80d8db79e68c19a00c9e45',
       updated_at = now()
 WHERE tenant_id = 'omatic' AND agent_name = 'jake';

-- THE RIMMER ROW IS DELIBERATELY LEFT ALONE, and this comment is the handoff.
--
-- factory.agent_runtime_contracts still carries agent_name = 'rimmer' with
-- l1_deployment_state = 'ready' and l2_deployment_state = 'not_deployed', two
-- days after his retirement. Firm 1.3.0 completes step 4 of the retirement —
-- the pack no longer ships skills/rimmer-evals, so no host offers him — but the
-- database row is step 2/3 work and is not Carver's to write.
--
-- It is not written here as a guess either. There is no verified allowed value
-- for a retired deployment state on this column, and decision #416 records that
-- factory.agent_state has no successor column at all: "retirement expressed by
-- convention rather than by constraint, with nothing stopping the next writer
-- from ignoring it." Inventing an enum value to make the row look tidy would be
-- the same defect one layer down.
--
-- Owner: Data under #415, with the successor semantics from #416. Candidate,
-- for Data to validate against the actual constraint before running anything:
--
--   DELETE FROM factory.agent_runtime_contracts
--    WHERE tenant_id = 'omatic' AND agent_name = 'rimmer';
--
-- Readback:
-- SELECT agent_name, canonical_contract_version, contract_digest,
--        l1_deployment_state, l2_deployment_state, evidence_status
--   FROM factory.agent_runtime_contracts
--  WHERE tenant_id = 'omatic'
--    AND agent_name IN ('smith','jake','rimmer')
--  ORDER BY agent_name;
