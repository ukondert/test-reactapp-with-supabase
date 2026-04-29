# AGENTS.md

Project-specific instructions for AI coding agents working in this repository.

## Scope
- Application code lives in [my-app](my-app).
- Supabase Edge/DB function code and deployment scripts live in [supabase](supabase).
- Primary architecture and setup docs are in [README.md](README.md) and [my-app/docs](my-app/docs).

## Start Here
- Read [README.md](README.md) first for setup and architecture context.
- For DDD + Edge Function flow, use [my-app/docs/ddd-edge-functions.md](my-app/docs/ddd-edge-functions.md).
- For React/Vite implementation notes, use [my-app/docs/react-js-implenation-details.md](my-app/docs/react-js-implenation-details.md).
- For Supabase wiring and health checks, use [my-app/docs/implementation-details.md](my-app/docs/implementation-details.md).

## Working Directory And Commands
Run app commands from [my-app](my-app):

```bash
npm install
npm run dev
npm run build
npm run serve
npm run deploy:functions
npm run deploy:functions:ps
npm run deploy:db-function -- <sql-file-name> <project-ref>
npm run deploy:db-functions
npm run deploy:db-function:ps -- -SqlFile <sql-file-name> -ProjectRef <project-ref>
npm run deploy:db-functions:ps
```

Notes:
- There are currently no test/lint scripts in [my-app/package.json](my-app/package.json).
- `npm run dev` starts Vite on port `3000`.

## Architecture And Boundaries
- Frontend command flow:
  1. UI and state in [my-app/src/features/library](my-app/src/features/library)
  2. API call through [my-app/src/core/api/aggregateCommandApi.js](my-app/src/core/api/aggregateCommandApi.js)
  3. Vite proxy in [my-app/vite.config.js](my-app/vite.config.js)
  4. Edge Function handler in [supabase/functions/library-aggregate/index.ts](supabase/functions/library-aggregate/index.ts)
  5. DB RPC functions in [supabase/db-functions](supabase/db-functions)
- Keep smart/dumb split: container logic in `containers`, rendering in `components`.
- Keep feature exports through feature barrel files (for example [my-app/src/features/library/index.js](my-app/src/features/library/index.js)).

## Required Command Payload Contract
When calling aggregate commands, keep this shape:

```json
{
  "aggregate": "Book",
  "action": "BorrowBook|ReturnBook",
  "payload": {
    "bookId": "<uuid>",
    "borrowerId": "<uuid>"
  }
}
```

- Frontend endpoint constants are in [my-app/src/core/api/endpoints.js](my-app/src/core/api/endpoints.js).
- Edge routing by `aggregate` and `action` is in [supabase/functions/library-aggregate/index.ts](supabase/functions/library-aggregate/index.ts).

## Environment And Security Guardrails
- Frontend requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (see [README.md](README.md)).
- Edge Function requires `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in function runtime.
- Never expose `service_role` keys in frontend code.
- Keep secrets out of Git; use `.env`/`.access_token` locally and only commit examples/docs.

## Data Integrity Rules To Preserve
When touching borrowing/returning flows, preserve invariants in DB functions:
- Max 3 active loans per borrower.
- No duplicate active loan for same `(book_id, borrower_id)`.
- Lock book row before checking available copies (`FOR UPDATE`).

Reference: [supabase/db-functions/borrow_book.sql](supabase/db-functions/borrow_book.sql), [supabase/db-functions/return_book.sql](supabase/db-functions/return_book.sql).

## Editing Guidelines For This Repo
- Prefer minimal, targeted changes; do not restructure directories unless requested.
- Keep API paths stable (`/api/v1/health`, `/api/v1/aggregate`) unless coordinated with both frontend and Edge Function.
- If adding behavior, update the most relevant docs in [my-app/docs](my-app/docs) instead of duplicating long explanations in multiple places.
- Use relative Markdown links in documentation.

## Existing AI Assets
Reuse these prompts/templates before creating new variants:
- Prompts: [.github/prompts](.github/prompts)
- Templates: [.github/templates](.github/templates)

## Suggested Next Customizations
Consider adding these if usage grows:
- `.github/instructions/supabase.instructions.md` for strict SQL + Edge Function conventions.
- `.github/instructions/react-feature.instructions.md` for feature module and container/presentational patterns.
- `.github/skills/validate-command-flow/SKILL.md` to automate end-to-end checks of command payload, proxy route, edge routing, and RPC signatures.
