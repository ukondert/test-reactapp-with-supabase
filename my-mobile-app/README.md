# my-mobile-app

React-Native-App auf Basis von Expo.

## Setup

1. Abhaengigkeiten im Repository-Root installieren:

```bash
npm install
```

2. Umgebungsvariable in my-mobile-app/.env setzen:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
```

Wichtig:

- `EXPO_PUBLIC_SUPABASE_URL` muss die reine Projekt-URL sein, also z. B. `https://<project-ref>.supabase.co`
- keine angehaengten Pfade wie `/auth/v1`, `/auth/v1/health` oder `/functions/v1`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` ist erforderlich und wird fuer `apikey` sowie `Authorization` Header verwendet
- der Health-Check nutzt denselben `apikey`/`Authorization`-Header wie die Web-App

3. Mobile App starten:

```bash
npm run dev:mobile
```

## Shared Komponenten

Die App verwendet Komponenten aus `@shared/ui`.
Derzeit eingebunden: `StatusMessage`.
