# OraclePatchProposalV2

## Purpose
Proposal-only AI patch envelope for VT_E1. Never auto-applies.

## Shape
```json
{
  "proposalId": "oracle_patch_xxx",
  "domain": "fx|timeline|remotion-bridge|performance|ux|integrations",
  "targetIds": ["masterplan-id-or-101plus"],
  "manualApplyPolicy": "required",
  "determinism": {
    "seedStrategy": "projectId+clipId",
    "nondeterministicOps": []
  },
  "changes": [
    {
      "type": "patch",
      "path": "string",
      "summary": "string",
      "risk": "low|medium|high"
    }
  ],
  "acceptanceTests": [
    "parity smoke start/mid/end",
    "preflight diagnostics",
    "export contract validation"
  ],
  "status": "proposed"
}
```

## Guardrails
- Must include acceptance tests.
- Must include determinism strategy.
- Must remain in `proposed` state until explicit human apply.
