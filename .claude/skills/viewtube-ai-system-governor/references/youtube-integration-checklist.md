# ViewTube YouTube / AI integration checklist

## YouTube route

1. Identify the typed server owner and canonical session endpoint.
2. Confirm capability/scope/account/content-owner context server-side.
3. Use typed request/response schemas and shared error mapping.
4. Estimate quota; apply rate limits, payload caps, concurrency limits, provider backoff, and `Retry-After` where relevant.
5. Use idempotency keys for mutations and resumable jobs for upload/reporting/rendering.
6. Preserve remote IDs, exact approved payload/variant, request ID, provider status, and audit event.
7. Distinguish auth required, reconnect required, permission denied, quota, invalid request, no data, and provider failure.
8. Ensure one failed tool call does not globally sign the user out.
9. Never add browser access/refresh-token persistence, direct `googleapis.com` fetches in React, or a generic arbitrary URL proxy.
10. Add contract, integration, and recovery tests before deleting a compatibility path.

## AI / Brain route

1. Define the Brain capability and canonical owner before writing prompts.
2. Resolve bounded context: creator profile, channel, project, evidence, assets, permissions, current surface, and user request.
3. Use the model/capability gateway and structured output schemas.
4. Record prompt/model/template version, references, model/provider, seed when relevant, and policy decisions.
5. Validate output before durable use; retry/self-correct only through bounded, observable paths.
6. Keep proposals separate from applied mutations.
7. Require explicit approval for destructive, publish, external-write, or expensive actions.
8. Send generation requests to Video Director for async media work.
9. Register outputs in Asset Engine/Vault before inserting them into project/editor state.
10. Meter/reserve/settle usage atomically where the product has credits or quotas.
11. Make provenance and creator overrides visible.
12. Feed approved outcomes into learning only with confidence, evidence, and expiration semantics.

## Video quality route

- outline before generation;
- proof frame/shot before full render;
- animatic before expensive final render;
- deterministic preview/final timeline contract;
- continuity/style/reference locks;
- audio, caption, crop, safe-margin, mobile, and accessibility checks;
- final project/package receipt with asset lineage and exact output versions.
