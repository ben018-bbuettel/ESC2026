# 🎤 ESC 2025 Tipp-App

Familien-Tipp-Spiel für den Eurovision Song Contest 2025 in Basel.

## Was die App kann

- **Tippen**: Jeder gibt seinen Namen ein und tippt die Platzierungen aller 26 ESC-Finalisten in drei Gruppen (Top 10, Plätze 11–18, Plätze 19–26)
- **Rangliste**: Alle Teilnehmer sehen live wer schon getippt hat
- **Admin**: Nach dem Finale trägst du die echten Ergebnisse ein
- **Sieger**: Die App berechnet automatisch wer am nächsten lag

## Punktesystem

- Exakter Treffer (Platz genau richtig) = **10 Punkte**
- 1 Platz daneben = 9 Punkte
- 2 Plätze daneben = 8 Punkte
- ... und so weiter (Minimum 0 Punkte)

---

## Setup-Anleitung

### Schritt 1: Supabase einrichten (kostenlos)

1. Gehe zu [supabase.com](https://supabase.com) und erstelle ein kostenloses Konto
2. Klicke auf **"New Project"** und erstelle ein Projekt (z.B. "esc-tipp-2025")
3. Warte bis das Projekt bereit ist (ca. 1 Minute)
4. Gehe zu **SQL Editor** (linke Sidebar)
5. Kopiere den gesamten Inhalt von `supabase-schema.sql` und führe ihn aus (Run-Button)
6. Gehe zu **Settings → API** und kopiere:
   - **Project URL** (sieht aus wie `https://xxxx.supabase.co`)
   - **anon public** Key

### Schritt 2: GitHub Repository erstellen

1. Gehe zu [github.com](https://github.com) und erstelle ein neues Repository (z.B. "esc-tipp-app")
2. Lade alle Dateien aus diesem Ordner hoch (oder nutze `git push`)

### Schritt 3: Netlify einrichten (kostenlos)

1. Gehe zu [netlify.com](https://netlify.com) und erstelle ein kostenloses Konto
2. Klicke auf **"Add new site" → "Import an existing project"**
3. Verbinde dein GitHub-Konto und wähle das Repository aus
4. Build-Einstellungen werden automatisch erkannt:
   - Build command: `npm run build`
   - Publish directory: `build`
5. Klicke auf **"Show advanced"** → **"New variable"** und füge hinzu:
   - `REACT_APP_SUPABASE_URL` = deine Supabase Project URL
   - `REACT_APP_SUPABASE_ANON_KEY` = dein Supabase anon Key
6. Klicke **"Deploy site"**
7. Nach 2–3 Minuten bekommst du eine URL wie `https://dein-app-name.netlify.app`

### Schritt 4: URL teilen

Teile die Netlify-URL mit deiner Familie und Freunden – fertig! 🎉

---

## So wird der Abend gespielt

1. **Vor dem Finale**: Alle rufen die App-URL auf und tippen ihre Platzierungen
2. **Während des Finales**: Entspannen und anfeuern 🎤
3. **Nach dem Finale**: Du öffnest `/admin` und trägst die echten Ergebnisse ein
4. **Siegerehrung**: Die Rangliste zeigt sofort wer gewonnen hat!

---

## Technischer Stack

- **Frontend**: React 18
- **Datenbank**: Supabase (PostgreSQL)
- **Hosting**: Netlify
- **Kosten**: Kostenlos für privaten Gebrauch
