# Beispielprojekt Supabase Projekt mit CDD und DDD Ansatz

## Overview

This project is a small React application built with Vite that connects to Supabase. It demonstrates a library borrowing flow using a Supabase Edge Function for aggregate command handling.

The UI supports:
- command-based borrowing and returning of books
- Supabase health 
- a smart/dumb component separation for the book command form

## Tech Stack

- React 17 (Web)
- React Native 0.79 + Expo SDK 54 (Mobile)
- Vite (Web bundler/dev server)
- Supabase JavaScript client (Web)
- Supabase REST API via `fetch` (Mobile)
- Supabase Edge Functions
- Supabase PL/pgSQL Functions (RPC)
- Shared UI workspace package (`@shared/ui`) for cross-platform components

## Key Features

- `BookCommandFormContainer.jsx`: smart component that manages state and executes commands
- `BookCommandForm.jsx`: presentational component that renders the form
- `supabase/functions/library-aggregate/index.ts`: edge function handling `BorrowBook` and `ReturnBook` aggregate actions
- `src/api/aggregateCommandApi.js`: sends POST requests to the aggregate command endpoint
- `src/supabaseClient.js`: creates the Supabase client from environment variables

## DDD auf Supabase

Die folgende Tabelle zeigt, wie klassische DDD-Schichten (z. B. aus Spring Boot) auf Supabase-Konzepte abgebildet werden:

| Klassischer Layer (Spring Boot) | Supabase Äquivalent | Funktion |
|---|---|---|
| Controller | Edge Function (HTTP Listener) | Nimmt den Request entgegen, validiert das Format (JSON). |
| Application Service | Edge Function Logic | Orchestriert den Ablauf: Lädt Daten, ruft Domänen-Logik auf. |
| Repository (Fetch) | Supabase Client (PostgREST) | `supabase.from('table').select(...)` ersetzt das Repository-Interface. |
| Aggregate Root / Logic | Domain Logic / PL/pgSQL | Die eigentliche Invarianten-Prüfung (im Code oder als DB-Funktion). |
| Persistence (Save) | RPC (Postgres Function) | Garantiert die atomare Speicherung des gesamten Aggregates. |

## Project Structure

```
my-app/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   └── SupabaseHealthCheck.jsx     # shared component
│   ├── core/
│   │   ├── api/
│   │   │   ├── endpoints.js
│   │   │   └── healthApi.js
│   │   └── supabaseClient.js
│   ├── features/
│   │   └── library/
│   │       ├── api/
│   │       │   └── aggregateCommandApi.js
│   │       ├── components/
│   │       │   └── BookCommandForm.jsx    # dumb component
│   │       ├── containers/
│   │       │   └── BookCommandFormContainer.jsx  # smart component
│   │       ├── hooks/
│   │       ├── store/
│   │       │   ├── bookAggregate.js
│   │       │   └── bookCommands.js
│   │       ├── types/
│   │       └── index.js                  # public API of the feature
│   ├── layouts/
│   ├── views/
│   ├── App.jsx
│   └── main.jsx
├── supabase/
│   ├── db-functions/
│   │   ├── borrow_book.sql
│   │   └── return_book.sql
│   ├── functions/
│   │   └── library-aggregate/
│   │       └── index.ts
│   ├── deploy-functions.js
│   ├── deploy-functions.ps1
│   ├── deploy-db-function.js
│   └── deploy-db-function.ps1
├── .env.example
├── package.json
├── vite.config.js
└── README.md
```

## Setup

### 1. Install dependencies

```bash
npm install
```

Install web dependencies from repository root:

```bash
npm run install:web
```

### 2. Configure environment variables

Create a `.env` file in `my-app/` and add:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_public_anon_key
```

If you want to deploy Supabase Edge Functions from this project, also provide:

```env
SUPABASE_PROJECT_REF=your-project-ref
```

### 3. Run locally

```bash
npm run dev:web
```

or from `my-app`:

```bash
cd my-app
npm run dev
```

Open the app at the local URL shown in the terminal.

### 4. Run the mobile app (Expo)

Set the required Expo env variables in `my-mobile-app/.env` first:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
```

Notes:

- `EXPO_PUBLIC_SUPABASE_URL` must be the plain project URL, for example `https://<project-ref>.supabase.co`.
- Do not append paths like `/auth/v1`, `/auth/v1/health`, or `/functions/v1`.
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` is required for the `apikey` and `Authorization` headers used by the mobile health check.

Then start Expo from workspace root:

```bash
npm run install:mobile
npm run dev:mobile
```

## Shared Components: Web + Mobile

This repository now includes a shared UI workspace package:

- `shared/ui`

Current shared component:

- `StatusMessage` used by:
  - `my-app/src/components/SupabaseHealthCheck.jsx`
  - `my-mobile-app/App.js`

How cross-platform rendering works:

- Web implementation: `shared/ui/src/components/StatusMessage/StatusMessage.web.jsx`
- Native implementation: `shared/ui/src/components/StatusMessage/StatusMessage.native.jsx`

This enables one stable import path (`@shared/ui`) while each platform resolves its own UI implementation.

## Reuse Strategies

When sharing between React (web) and React Native, use one of these patterns:

1. Platform file split (`*.web.*`, `*.native.*`) for visual components.
2. Shared pure JS modules (formatters, validators, command builders) for domain logic.
3. Adapter layer per platform for API/network differences while keeping shared feature contracts.

Recommended in this repo:

- Keep feature command flow logic and payload contract stable.
- Move new reusable UI primitives into `shared/ui`.
- Keep orchestration/container logic platform-specific unless runtime constraints are identical.

## Supabase Edge Function

The aggregate command endpoint is designed to accept JSON commands at `/api/v1/aggregate`.

The UI uses the `invokeAggregateCommand` helper and sends the Supabase anon key in both `apikey` and `Authorization` headers.

Example command payload:

```json
{
  "aggregate": "Book",
  "action": "BorrowBook",
  "payload": {
    "bookId": "b1000000-0000-0000-0000-000000000001",
    "borrowerId": "a1000000-0000-0000-0000-000000000002"
  }
}
```

## Deployment

### Build the app

```bash
npm run build
```

### Serve the built app

```bash
npm run serve
```

### Use Supabase CLI via npx

If you do not want to install the Supabase CLI globally, use `npx`:

```bash
npx supabase login
npx supabase projects list
```

This lets you run the CLI from the project without a global install.

### Access Token for deployment

Create `my-app/supabase/.access_token` and add your Supabase access token.

Access tokens are available in the Supabase dashboard at:

- https://supabase.com/dashboard/account/tokens

The file can contain either the raw token or a key/value line like:

```
SUPABASE_ACCESS_TOKEN=your-access-token-here
```

### Deploy Supabase Edge Functions

Deploys all Edge Function folders found under `supabase/functions/`.

```bash
# Node.js
npm run deploy:functions -- <project-ref>

# or with env var
$env:SUPABASE_PROJECT_REF="your-project-ref"
npm run deploy:functions

# PowerShell
npm run deploy:functions:ps -- -ProjectRef your-project-ref
```

### Deploy a Postgres DB Function

Deploys a single SQL file from `supabase/db-functions/` by name.

```bash
# Node.js – file name without .sql extension
npm run deploy:db-function -- borrow_book <project-ref>

# or with env var
$env:SUPABASE_PROJECT_REF="your-project-ref"
npm run deploy:db-function -- borrow_book

# PowerShell
npm run deploy:db-function:ps -- -SqlFile borrow_book -ProjectRef your-project-ref
```

Available DB functions:

| File | Function | Description |
|---|---|---|
| `borrow_book.sql` | `borrow_book(p_book_id, p_borrower_id)` | Validates loan limit (max 3), checks availability, creates loan atomically |
| `return_book.sql` | `return_book(p_book_id, p_borrower_id)` | Closes active loan, restores available copies atomically |

## Notes

- The current package license is `ISC` as defined in `package.json`.
- The UI relies on `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- The project uses a smart/dumb split for command form rendering.

## Contact

For improvements or bug fixes, please open an issue or submit a pull request.