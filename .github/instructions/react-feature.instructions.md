---
description: "Use when: editing React feature modules; enforce smart/dumb split, barrel exports, and feature boundary rules"
applyTo: "my-app/src/features/**/*.js,my-app/src/features/**/*.jsx,my-app/src/components/**/*.js,my-app/src/components/**/*.jsx,my-app/src/core/api/**/*.js,my-app/src/App.jsx,my-app/src/main.jsx"
---
# React Feature Module Conventions

## Intent
- Keep frontend code modular, predictable, and easy to maintain.
- Preserve container/presentational separation.
- Enforce feature boundaries and stable public exports.

## Canonical References
- Project overview: [README.md](../../README.md)
- React implementation details: [my-app/docs/react-js-implenation-details.md](../../my-app/docs/react-js-implenation-details.md)
- DDD + command flow: [my-app/docs/ddd-edge-functions.md](../../my-app/docs/ddd-edge-functions.md)
- Existing feature example: [my-app/src/features/library](../../my-app/src/features/library)

## Feature Structure Rules
- Keep code grouped by feature under [my-app/src/features](../../my-app/src/features).
- Within a feature, use role-based folders where applicable:
  - `containers` for stateful logic and orchestration
  - `components` for presentational UI
  - `store` for domain state and command creators
- Avoid cross-feature imports of internal files; consume feature APIs via the feature barrel file.

## Smart/Dumb Split Rules
- Containers:
  - Own state, side effects, API calls, and command execution flow.
  - Map domain/app data into view props.
  - Handle async errors and loading states.
- Presentational components:
  - Receive data and handlers via props.
  - Avoid direct API calls and business orchestration.
  - Stay reusable and focused on rendering.

## Barrel Export Rules
- Each feature must expose a clear public API through its `index.js`.
- Import from feature root where possible instead of deep internal paths.
- When adding/removing public components, update the feature barrel in the same change.

## Boundary Rules
- UI and feature layers must call backend through [my-app/src/core/api](../../my-app/src/core/api) abstractions.
- Keep endpoint constants centralized in [my-app/src/core/api/endpoints.js](../../my-app/src/core/api/endpoints.js).
- Preserve the aggregate command contract shape used by feature commands:
  - `aggregate`
  - `action`
  - `payload`
- Keep API paths stable (`/api/v1/health`, `/api/v1/aggregate`) unless coordinated with Edge Function updates.

## State And Side-Effect Rules
- Keep side effects inside containers/hooks, not presentational components.
- Keep render logic pure and derived from props/state.
- Prefer explicit, minimal props over passing large mutable objects.

## Change Checklist
- Smart/dumb split preserved (no API calls in dumb components).
- Feature public exports updated in `index.js` when needed.
- No new deep imports across feature internals.
- Any command shape or endpoint change is coordinated with:
  - [my-app/src/core/api/aggregateCommandApi.js](../../my-app/src/core/api/aggregateCommandApi.js)
  - [my-app/vite.config.js](../../my-app/vite.config.js)
  - [supabase/functions/library-aggregate/index.ts](../../supabase/functions/library-aggregate/index.ts)
- Relevant docs updated when conventions or flow change.
