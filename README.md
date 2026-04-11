# Gabriel Backend — Google Reviews Sync Service

Node.js/Express Backend für die Gabriel Feine Uhren & Juwelen Website.

## Was macht dieser Service?

- Holt wöchentlich Google Maps Reviews via [SerpAPI](https://serpapi.com)
- Cached die Ergebnisse in `public/reviews.json`
- Liefert JSON mit CORS-Header an das Shopify-Frontend aus
- Später erweiterbar: Instagram Feed Proxy

## Setup

### 1. Dependencies installieren
```bash
npm install
```

### 2. Environment Variables setzen
```bash
cp .env.example .env
# .env mit echten Werten befüllen
```

### 3. GABRIEL_DATA_ID ermitteln

Einmalig diesen Link im Browser aufrufen (eigenen API Key einsetzen):
```
https://serpapi.com/search.json?engine=google_maps&q=Gabriel+Feine+Uhren+%26+Juwelen+K%C3%B6ln&api_key=DEIN_KEY
```
Im JSON → `local_results[0].data_id` kopieren → in `.env` als `GABRIEL_DATA_ID` eintragen.

### 4. Lokal starten
```bash
npm run dev
```
→ http://localhost:3000/reviews.json

## Railway Deploy

1. GitHub Repo erstellen und pushen
2. Railway → New Project → Deploy from GitHub
3. Environment Variables in Railway setzen:
   - `SERPAPI_KEY` = dein SerpAPI Key
   - `GABRIEL_DATA_ID` = Data ID aus Schritt 3
   - `ALLOWED_ORIGIN` = https://gabriel-uhren.myshopify.com
4. Railway gibt eine URL aus, z.B. `https://gabriel-backend.up.railway.app`
5. Diese URL + `/reviews.json` im Shopify Theme-Editor unter **Instagram Feed → Proxy URL** eintragen

## Endpunkte

| Endpunkt | Beschreibung |
|---|---|
| `GET /health` | Health Check |
| `GET /reviews.json` | Gecachte Google Reviews |

## Sync-Zeitplan

- Einmalig beim Server-Start
- Jeden Montag um 04:00 Uhr automatisch

## SerpAPI Kosten

- Free Plan: 100 Suchanfragen/Monat (= reicht für wöchentlichen Sync problemlos)
- Bezahl-Plan ab $50/Monat für mehr Anfragen
