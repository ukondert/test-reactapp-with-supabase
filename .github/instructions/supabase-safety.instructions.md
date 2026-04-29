---
description: "Use when: editing Supabase Edge Functions or SQL DB functions; enforce strict safety, invariants, and contract compatibility"
applyTo: "supabase/functions/**/*.ts,supabase/functions/**/*.js,supabase/db-functions/**/*.sql"
---
# Supabase Function And SQL Safety Rules

## Intent
- Keep command handling safe, deterministic, and backward compatible.
- Preserve domain invariants in database functions.
- Prevent security regressions and credential leaks.

## Scope
- Edge Functions in [supabase/functions](supabase/functions)
- SQL DB functions in [supabase/db-functions](supabase/db-functions)

## Required References
- Architecture context: [README.md](README.md)
- DDD + flow details: [my-app/docs/ddd-edge-functions.md](my-app/docs/ddd-edge-functions.md)
- Current aggregate handler: [supabase/functions/library-aggregate/index.ts](supabase/functions/library-aggregate/index.ts)

## Edge Function Safety Rules
- Do not expose service role secrets to frontend code; server-only use for `SUPABASE_SERVICE_ROLE_KEY`.
- Fail fast when required environment variables are missing.
- Validate request method and JSON body before business logic.
- Validate `aggregate`, `action`, and required payload fields explicitly.
- Return stable and meaningful HTTP codes (`400` invalid input, `404` missing resource, `409` invariant conflict, `500` unexpected error).
- Keep response payloads structured and JSON-only for API calls.
- Preserve existing command contract unless a coordinated frontend + backend update is included in the same change.

## SQL Function Safety Rules
- Keep business invariants in SQL, not only in UI/Edge Function checks.
- Prefer atomic operations and row-level locks where counters/state can race (`FOR UPDATE` when needed).
- Avoid dynamic SQL unless strictly necessary; if necessary, sanitize inputs and document why.
- Keep function outputs machine-readable and consistent with Edge Function expectations.
- Preserve `SECURITY DEFINER` behavior intentionally; do not change security mode casually.
- Avoid destructive schema changes in routine function edits.

## Contract Compatibility Rules
- The command payload shape must stay compatible:
  - `aggregate`
  - `action`
  - `payload`
- If action names, RPC function names, or payload keys change, update all linked layers in one PR:
  - Edge function routing
  - Frontend command caller and endpoint mapping
  - SQL function signatures and result contract

## Change Checklist
- Verify no credentials or tokens are added to tracked files.
- Verify aggregate action mapping still resolves correctly.
- Verify SQL changes preserve invariants (max loans, duplicate prevention, availability checks).
- Verify error messages are actionable and returned with matching status codes.
- If behavior changed, update docs with concise diffs in:
  - [README.md](../../README.md)
  - [my-app/docs/ddd-edge-functions.md](../../my-app/docs/ddd-edge-functions.md)
- If new environment variables are required, document them and fail gracefully if missing.