# DDD mit Supabase Edge Functions

## Konzept

Bei Domain-Driven Design (DDD) trennt man das Frontend von der Geschäftslogik.
In dieser App sollen Aggregate-Aktionen und Invarianten-Prüfungen nicht im Browser, sondern in Supabase Edge Functions stattfinden.

### Warum dieser Ansatz?

- Die UI sendet nur Kommandos (Commands).
- Edge Functions sind der Orchestrator für Aggregate-Logik.
- Invarianten werden zentral in der Funktion geprüft, nicht verteilt im Client.
- Dadurch bleibt die Domäne robust gegenüber Manipulation und inkonsistentem Zustand.

## Architektur

1. **Commands** werden im Frontend definiert.
2. Das Frontend ruft eine stabile API an: `/api/v1/aggregate`.
3. Der lokale Dev-Server mappt diesen Aufruf auf die Edge Function `/functions/v1/library-aggregate`.
4. Die Edge Function führt die Aggregate-Aktion aus und prüft Invarianten.
5. Änderungen werden in Supabase persistiert (z. B. über Postgres-Tabellen).

## Beispiel-Domain: Book-Aggregate

In `src/domain/aggregates/bookAggregate.js` steht die Domänenbeschreibung:

- `BorrowBook`
- `ReturnBook`
- Invarianten wie `available copies > 0`

Das Frontend erzeugt Command-Objekte mit `aggregate`, `action` und `payload`.

## Clientseitige Command-API

`src/api/aggregateCommandApi.js` sendet das Command an `/api/v1/aggregate`.

Beispiel:

```js
import { createBorrowBookCommand } from '../domain/commands/bookCommands';
import { invokeAggregateCommand } from '../api/aggregateCommandApi';

const command = createBorrowBookCommand({
  bookId: 'book-123',
  borrowerId: 'user-456',
});

await invokeAggregateCommand(command);
```

## Edge Function: Aggregate-Handler

Die Edge Function lebt in `supabase/functions/library-aggregate/index.ts`.
Sie macht:

- Command-Parsing
- Aggregate-Routing
- Invariantenprüfung
- Persistenz über Supabase

### Vorteil

Die Geschäftslogik bleibt auf der Server-Seite. Änderungen am Aggregate werden kontrolliert und auditierbar.

## Vite-Proxy

In `vite.config.js` wird eine zusätzliche Proxy-Regel für den Aggregate-Endpunkt eingerichtet:

- `/api/v1/aggregate` -> `/functions/v1/library-aggregate`

Die UI muss nur einen stabilen API-Contract kennen.

## Nächste Schritte

- Definiere weitere Aggregate-Aktionen für deine Domäne.
- Erweitere die Edge Function mit weiteren Command-Typen.
- Verwende `service_role`- oder publishable Keys und prüfe die richtigen Header in Produktion.
