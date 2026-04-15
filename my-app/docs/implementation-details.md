# Supabase Verbindung in der React App

## Überblick

Die App verwendet **Supabase** als Backend-as-a-Service (BaaS).
Die Verbindung wird über den offiziellen JavaScript-Client `@supabase/supabase-js` hergestellt.

---

## 1. Voraussetzungen

| Paket | Version |
|---|---|
| `@supabase/supabase-js` | v2.x |
| `vite` | v5+ |
| `@vitejs/plugin-react` | aktuell |

Installation:
```bash
npm install @supabase/supabase-js
```

---

## 2. Umgebungsvariablen

Die Zugangsdaten werden **nicht** direkt im Code gespeichert, sondern in einer `.env` Datei:

```env
# filepath: .env
VITE_SUPABASE_URL=https://DEIN-PROJEKT.supabase.co
VITE_SUPABASE_ANON_KEY=DEIN-ANON-KEY
```

> ⚠️ Die `.env` Datei **niemals** in Git committen!  
> Füge `.env` zu deiner `.gitignore` hinzu.

Die Werte findest du in deinem Supabase Dashboard unter:  
**Project Settings → API**

---

## 3. Supabase Client (`supabaseClient.js`)

Der Client wird **einmalig** erstellt und in der ganzen App wiederverwendet:

```javascript
// filepath: src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

**Warum `import.meta.env`?**  
Vite injiziert Umgebungsvariablen über `import.meta.env` (nicht `process.env` wie bei Node.js).  
Nur Variablen mit dem Präfix `VITE_` sind im Browser zugänglich.

---

## 4. Verbindung testen

In einer React-Komponente wird die Verbindung mit `auth.getSession()` geprüft:

```javascript
// filepath: src/components/SupabaseHealthCheck.jsx
import { useEffect, useState } from 'react'
import supabase from '../supabaseClient'

function SupabaseHealthCheck() {
  const [status, setStatus] = useState('Verbindung wird geprüft...')

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { error } = await supabase.auth.getSession()
        if (error) {
          setStatus(`❌ Verbindung fehlgeschlagen: ${error.message}`)
        } else {
          setStatus('✅ Supabase verbunden')
        }
      } catch (e) {
        setStatus(`❌ Fehler: ${e.message}`)
      }
    }
    checkConnection()
  }, []) // Leeres Array = wird nur einmal beim Laden ausgeführt

  return <div>{status}</div>
}
```

**Warum `getSession()` und nicht eine Tabelle abfragen?**  
- Funktioniert ohne eigene Datenbanktabellen
- Prüft direkt die API-Verbindung
- Gibt sofortiges Feedback ob URL und Key korrekt sind

---

## 5. Verbindungsablauf (Schritt für Schritt)

```
Browser
  │
  ▼
supabaseClient.js
  │  createClient(URL, ANON_KEY)
  ▼
@supabase/supabase-js
  │  sendet HTTPS-Request an Supabase API
  ▼
Supabase Cloud (supabase.co)
  │  authentifiziert mit ANON_KEY
  ▼
PostgreSQL Datenbank
```

---

## 6. Häufige Fehler

| Fehler | Ursache | Lösung |
|---|---|---|
| `supabase.auth.getSession is not a function` | Alte Supabase v1 installiert | `npm install @supabase/supabase-js@latest` |
| `Could not find table 'public.profiles'` | Tabelle existiert nicht | `getSession()` statt Tabelle abfragen |
| Leere Seite | `index.html` hat falsches Root-Element | `<div id="root">` verwenden |
| `Cannot find module '@vitejs/plugin-react'` | Paket fehlt | `npm install @vitejs/plugin-react --save-dev` |

---

## 7. Sicherheitshinweise

- Der **ANON_KEY** ist öffentlich sichtbar im Browser — das ist normal und gewollt
- Die eigentliche Sicherheit kommt durch **Row Level Security (RLS)** in Supabase
- Den **SERVICE_ROLE_KEY** niemals im Frontend verwenden — nur serverseitig!
