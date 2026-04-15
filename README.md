# Digital School Library

## Overview

This project is a small React application built with Vite that connects to Supabase. It demonstrates a library borrowing flow using a Supabase Edge Function for aggregate command handling.

The UI supports:
- command-based borrowing and returning of books
- Supabase health checks
- a smart/dumb component separation for the book command form

## Tech Stack

- React 17
- Vite
- Supabase JavaScript client
- Supabase Edge Functions

## Key Features

- `BookCommandFormContainer.jsx`: smart component that manages state and executes commands
- `BookCommandForm.jsx`: presentational component that renders the form
- `supabase/functions/library-aggregate/index.ts`: edge function handling `BorrowBook` and `ReturnBook` aggregate actions
- `src/api/aggregateCommandApi.js`: sends POST requests to the aggregate command endpoint
- `src/supabaseClient.js`: creates the Supabase client from environment variables

## Project Structure

```
my-app/
├── public/
├── src/
│   ├── api/
│   │   ├── aggregateCommandApi.js
│   │   └── endpoints.js
│   ├── components/
│   │   ├── BookCommandForm.jsx
│   │   ├── BookCommandFormContainer.jsx
│   │   └── SupabaseHealthCheck.jsx
│   ├── domain/
│   │   └── commands/
│   │       └── bookCommands.js
│   ├── App.jsx
│   ├── main.jsx
│   └── supabaseClient.js
├── supabase/
│   ├── deploy-functions.js
│   └── functions/
│       └── library-aggregate/
│           └── index.ts
├── .env.example
├── package.json
├── vite.config.js
└── README.md
```

## Setup

### 1. Install dependencies

```bash
cd my-app
npm install
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
npm run dev
```

Open the app at the local URL shown in the terminal.

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

### Deploy Supabase Edge Functions

```bash
npm run deploy:functions -- <project-ref>
```

or with env var:

```bash
SUPABASE_PROJECT_REF=your-project-ref npm run deploy:functions
```

## Notes

- The current package license is `ISC` as defined in `package.json`.
- The UI relies on `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- The project uses a smart/dumb split for command form rendering.

## Contact

For improvements or bug fixes, please open an issue or submit a pull request.