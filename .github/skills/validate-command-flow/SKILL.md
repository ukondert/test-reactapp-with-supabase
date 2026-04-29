---
name: validate-command-flow
description: "Validate aggregate command flow after refactors. Use when checking endpoint constants, Vite proxy mapping, edge action routing, and RPC function name alignment."
argument-hint: "Optional: scope (quick|full) and changed files"
---
# Validate Aggregate Command Flow

## Outcome
Produce a clear pass/fail validation report for aggregate command flow consistency across frontend, proxy, edge routing, and SQL RPC names.

## When To Use
- After refactoring API paths or endpoint constants.
- After changing command creators (`aggregate`, `action`, `payload`).
- After editing Vite proxy config.
- After changing edge function routing or RPC names.
- Before merging PRs that touch frontend command flow or Supabase handlers.

## Project Scope
Validate these files first:
- [my-app/src/core/api/endpoints.js](../../../my-app/src/core/api/endpoints.js)
- [my-app/src/core/api/aggregateCommandApi.js](../../../my-app/src/core/api/aggregateCommandApi.js)
- [my-app/src/features/library/store/bookCommands.js](../../../my-app/src/features/library/store/bookCommands.js)
- [my-app/vite.config.js](../../../my-app/vite.config.js)
- [supabase/functions/library-aggregate/index.ts](../../../supabase/functions/library-aggregate/index.ts)
- [supabase/db-functions/borrow_book.sql](../../../supabase/db-functions/borrow_book.sql)
- [supabase/db-functions/return_book.sql](../../../supabase/db-functions/return_book.sql)

## Procedure
1. Identify source-of-truth values.
- Extract frontend aggregate endpoint constant from endpoints.js.
- Extract command contract from command creators: `aggregate`, `action`, payload keys.
- Extract proxy rewrite path from vite.config.js.
- Extract edge function supported `aggregate` and `action` branches.
- Extract edge RPC names and confirm SQL files define matching function names.

2. Validate endpoint alignment.
- Check aggregateCommandApi uses API_ENDPOINTS.AGGREGATE_COMMAND, not a hardcoded path.
- Check API_ENDPOINTS.AGGREGATE_COMMAND matches Vite proxy route key.
- Check proxy rewrite for aggregate points to the deployed edge function path.

3. Validate command contract alignment.
- Check command creators send the same `aggregate` and `action` names that edge routing expects.
- Check payload field names from command creators are the names consumed by edge handlers.

4. Validate RPC alignment.
- Check each routed edge action calls the intended Supabase RPC name.
- Check each RPC name exists as `CREATE OR REPLACE FUNCTION <name>` in SQL files.

5. Validate status-code semantics.
- Ensure edge handler uses stable error classes:
  - 400 invalid request/unsupported contract
  - 404 missing resource
  - 409 domain conflict (where applicable)
  - 500 runtime/infrastructure errors

6. Produce a validation report.
- Output a table with each check and status: PASS, FAIL, or WARNING.
- For each FAIL, include exact file path and smallest safe fix.

## Decision Logic
- If endpoint constants and proxy route mismatch:
  - Prefer [my-app/src/core/api/endpoints.js](../../../my-app/src/core/api/endpoints.js) as frontend source of truth.
  - Update proxy route key and any hardcoded frontend call sites to match.
- If command actions mismatch edge routing:
  - If refactor intent changed action names, update edge and frontend in same change.
  - If not intentional, revert to previously supported action names.
- If edge RPC name and SQL function name mismatch:
  - Prefer SQL function names already deployed unless migration is explicitly part of the PR.
  - Otherwise update SQL and edge together and note migration impact.
- If only docs are stale:
  - Keep behavior unchanged and update docs only.

## Completion Criteria
Validation is complete only when all are true:
- Endpoint constant, API usage, and proxy route are aligned.
- Command creators and edge routing agree on `aggregate` and `action`.
- Edge RPC names match SQL function definitions.
- No unresolved FAIL items remain in report.

## Recommended Output Format
Use this table format in the final report:

| Check | Status | Evidence | Fix Needed |
|---|---|---|---|
| Endpoint constant vs API call | PASS/FAIL/WARNING | file + key line | yes/no |
| Endpoint constant vs Vite proxy | PASS/FAIL/WARNING | file + route key | yes/no |
| Action routing alignment | PASS/FAIL/WARNING | file + action names | yes/no |
| RPC name alignment | PASS/FAIL/WARNING | file + rpc/function names | yes/no |
| Status code semantics | PASS/FAIL/WARNING | file + code branches | yes/no |

## Guardrails
- Make minimal, targeted fixes only.
- Do not rename public command keys casually (`aggregate`, `action`, `payload`).
- Do not alter API paths without coordinated frontend + edge updates.
- Do not change SQL function names without coordinated edge updates.
- Keep security-sensitive env usage server-only for service role keys.
