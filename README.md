# gabriel-reviews-sync

Wöchentlicher Google Reviews Sync für **Gabriel Feine Uhren & Juwelen**.

GitHub Actions ruft jeden Montag um 04:00 UTC die SerpAPI ab und committet das Ergebnis nach `public/reviews.json`.
Shopify liest die Datei direkt als statische Raw-GitHub-URL — **kein Server, keine Kosten**.

---

## Shopify Theme URL

```
https://raw.githubusercontent.com/LiL-Loco/gabriel-backend/master/public/reviews.json
```

Diese URL im Shopify Theme Editor unter **Google Bewertungen → Proxy URL** eintragen.

---

## GitHub Secrets einrichten

Unter **Settings → Secrets and variables → Actions** folgende Secrets anlegen:

| Secret | Beschreibung |
|---|---|
| `SERPAPI_KEY` | API-Key von serpapi.com |
| `GABRIEL_DATA_ID` | Google Maps Data ID (siehe unten) |

### Data ID einmalig ermitteln

```
https://serpapi.com/search.json?engine=google_maps&q=Gabriel+Feine+Uhren+%26+Juwelen+Köln&api_key=DEIN_KEY
```

Im JSON-Ergebnis: `local_results[0].data_id` kopieren → als `GABRIEL_DATA_ID` Secret setzen.

---

## Manuell ausführen

Unter **Actions → Sync Google Reviews → Run workflow** kann der Sync jederzeit manuell gestartet werden.

## Lokal testen

```bash
SERPAPI_KEY=xxx GABRIEL_DATA_ID=yyy node scripts/syncOnce.js
```
