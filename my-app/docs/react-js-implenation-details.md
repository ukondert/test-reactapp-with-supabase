# ReactJS Implementierungsdetails

## Projektübersicht

Dieses Vite-React-Projekt ist als einfache React-Anwendung konfiguriert, die Supabase zur Backend-Anbindung verwendet. Die wichtigsten Bereiche sind:

- `package.json` für Abhängigkeiten und npm-Skripte
- `vite.config.js` für Entwicklungsserver und Build-Settings
- `index.html` als HTML-Einstiegspunkt
- `src/main.jsx` als React-Entry-Point
- `src/App.jsx` als Hauptkomponente
- `src/supabaseClient.js` als zentrale Supabase-Client-Konfiguration
- `src/components/SupabaseHealthCheck.jsx` als Verbindungsprüfung

---

## 1. npm- und Paketkonfiguration (`package.json`)

Wichtige Einträge:

- `react` und `react-dom` in Version `^17.0.2`
- `@supabase/supabase-js` in Version `^2.103.1`
- `vite` als Build-Tool
- `@vitejs/plugin-react` zur Unterstützung von JSX und React-spezifischen Optimierungen

Skripte:

- `npm run dev` startet den Vite-Entwicklungsserver
- `npm run build` erzeugt den Produktions-Build
- `npm run serve` startet eine Vorschau auf dem erzeugten Build

---

## 2. Vite-Konfiguration (`vite.config.js`)

Die Datei enthält die Basis-Konfiguration für Vite:

- `plugins: [react()]` aktiviert das React-Plugin
- `server.port: 3000` legt den lokalen Entwicklungsport fest
- `build.outDir: 'dist'` definiert den Ausgabepfad für den Produktions-Build

Damit kann die App mit `npm run dev` unter `http://localhost:3000/` ausgeführt werden.

---

## 3. HTML-Einstiegspunkt (`index.html`)

Die Startseite enthält das Root-Element für React:

```html
<div id="root"></div>
<script type="module" src="/src/main.jsx"></script>
```

`/src/main.jsx` wird als Modul geladen, und React rendert die Anwendung in das Element mit der ID `root`.

---

## 4. React-Entry-Point (`src/main.jsx`)

Diese Datei ist der Einstieg für React und führt das Rendern der App aus:

```js
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
```

Wichtige Punkte:

- `React.StrictMode` hilft bei der Erkennung von potenziellen Problemen während der Entwicklung
- `index.css` wird global importiert
- `App` ist die Hauptkomponente

---

## 5. Hauptkomponente (`src/App.jsx`)

`App.jsx` organisiert die Anzeige der Anwendung:

```js
import React from 'react';
import './App.css';
import SupabaseHealthCheck from './components/SupabaseHealthCheck';

function App() {
  return (
    <div className="App">
      <h1>Welcome to the Digital School Library</h1>
      <SupabaseHealthCheck />
    </div>
  );
}

export default App;
```

Diese Komponente:

- importiert eigenes Styling aus `App.css`
- enthält eine Überschrift
- bindet die `SupabaseHealthCheck`-Komponente zur Verbindungsanzeige ein

---

## 6. Supabase-Client-Konfiguration (`src/supabaseClient.js`)

Der Supabase-Client wird zentral erstellt, damit alle Komponenten denselben Client nutzen:

```js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
```

Wichtige Details:

- `createClient(url, anonKey)` erzeugt den Supabase-Client
- `import.meta.env` ist die Vite-API für Umgebungsvariablen
- `VITE_SUPABASE_ANON_KEY` ist korrekt als öffentlich verfügbare Variable mit `VITE_`-Präfix definiert

Hinweis: In Vite werden nur Variablen mit dem Präfix `VITE_` standardmäßig an den Browser weitergegeben. Wenn `SUPABASE_URL` so verwendet wird, kann diese Variable im Browser nicht automatisch verfügbar sein. Es ist üblicher, auch hier `VITE_SUPABASE_URL` zu verwenden.

---

## 7. API-First HealthCheck (`/api/v1/health`)

Statt Supabase direkt aus der UI-Komponente aufzurufen, läuft der Check jetzt über eine klar definierte REST-Schnittstelle:

- `GET /api/v1/health`

Die UI nutzt dafür eine dedizierte API-Schicht:

- `src/api/endpoints.js` enthält die versionierten Endpunkte
- `src/api/healthApi.js` führt den Request aus
- `src/components/SupabaseHealthCheck.jsx` zeigt nur noch das Ergebnis an

Beispiel aus der Komponente:

```js
import React, { useEffect, useState } from 'react';
import { getHealthStatus } from '../api/healthApi';

const SupabaseHealthCheck = () => {
    const [status, setStatus] = useState('Verbindung wird geprüft...');

    useEffect(() => {
        const checkConnection = async () => {
            try {
        const result = await getHealthStatus();
        setStatus('✅ API erreichbar (HTTP ' + result.statusCode + ')');
            } catch (e) {
                setStatus('❌ Fehler: ' + e.message);
            }
        };

        checkConnection();
    }, []);

    return (
        <div>
            <h2>{status}</h2>
        </div>
    );
};

export default SupabaseHealthCheck;
```

### Detaillierte Implementierung

- `import React, { useEffect, useState } from 'react';`
  - `useState` verwaltet den Statustext, der dem Nutzer angezeigt wird.
  - `useEffect` sorgt dafür, dass die Verbindung nur einmal beim ersten Render geprüft wird.
- `import { getHealthStatus } from '../api/healthApi';`
  - Die Komponente kennt nur den REST-Endpunkt, nicht Supabase-Interna.
  - Dadurch bleibt die UI vom konkreten Backend entkoppelt.
- `const [status, setStatus] = useState('Verbindung wird geprüft...');`
  - Initialisiert den Text mit einer Ladeanzeige.
- `useEffect(() => { ... }, []);`
  - Das leere Dependency-Array `[]` stellt sicher, dass die Effektroutine nur beim ersten Laden läuft.
  - Dadurch wird kein erneutes Abrufen bei jedem Render ausgelöst.
- `const checkConnection = async () => { ... };`
  - Die Funktion ruft `getHealthStatus()` auf.
  - Diese Funktion sendet `GET /api/v1/health` und wertet den HTTP-Status aus.
- `try { ... } catch (e) { ... }`
  - Fehler werden abgefangen und als lesbare Nachricht angezeigt.
  - Dadurch bleibt die Komponente stabil, selbst wenn Netzwerk- oder Konfigurationsfehler auftreten.
- `setStatus('✅ API erreichbar (HTTP ... )');`
  - Bei erfolgreichem API-Request wird der HTTP-Status angezeigt.
- Render-Ausgabe:
  - Die Komponente zeigt den aktuellen Status in einem `<h2>`-Element an.
  - Das ist eine einfache und direkte Rückmeldung für den Anwender.

Ablauf:

1. Komponente mountet
2. `useEffect` wird einmal ausgeführt
3. `GET /api/v1/health` wird aufgerufen
4. Status wird in der Komponente angezeigt

### Routing auf Supabase im Dev-Setup

In `vite.config.js` wird der API-Endpunkt auf Supabase gemappt:

- `/api/v1/health` -> `${VITE_SUPABASE_URL}/auth/v1/health`

Dadurch bleibt der Client-Code stabil, auch wenn sich die konkrete Upstream-URL später ändert.

---

## 8. Umgebungsvariablen und Dateien

Typische `.env`-Einträge für dieses Projekt:

```env
VITE_SUPABASE_URL=https://zbvxaikeofiejnsershm.supabase.co
VITE_SUPABASE_ANON_KEY=DEIN_ANON_KEY
```

Die `.env`-Datei sollte im Projektstamm liegen und normalerweise nicht in Git committet werden.

---

## 9. Wichtige Implementierungsaspekte

- React wird mit der klassischen `ReactDOM.render`-API verwendet, nicht mit der neuen `createRoot`-API.
- Das Styling wird über `index.css` und `App.css` eingebunden.
- Der Supabase-Client wird einmal zentral erstellt und exportiert, um Wiederverwendung zu ermöglichen.
- Die Verbindungsprüfung nutzt `auth.getSession()` aus Supabase v2.
- `useEffect([])` stellt sicher, dass die Prüfung nur einmal beim Laden läuft.

---

## 10. Verbesserungsmöglichkeiten

- `SUPABASE_URL` sollte als `VITE_SUPABASE_URL` definiert werden, damit Vite die Variable browserseitig verfügbar macht.
- `SupabaseHealthCheck` könnte optional `loading`/`error`-Zustände sauberer abbilden.
- Ein konfigurierter `.env.example`-Eintrag für die URL und den Key wäre hilfreich.

---

## 11. Fazit

Die App ist ein klassisches Vite-React-Projekt, bei dem React das Frontend rendert und Supabase über den offiziellen JS-Client angebunden wird. Die Verbindung wird zentral in `supabaseClient.js` konfiguriert und in einer Gesundheitscheck-Komponente validiert.
