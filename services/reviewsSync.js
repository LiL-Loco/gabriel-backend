// Google Maps Reviews Sync via SerpAPI
// Docs: https://serpapi.com/google-maps-reviews-api
// Cacht Ergebnis nach public/reviews.json — wird statisch an Shopify-Frontend ausgeliefert
//
// Data ID einmalig ermitteln:
// https://serpapi.com/search.json?engine=google_maps&q=Gabriel+Feine+Uhren+%26+Juwelen+K%C3%B6ln&api_key=DEIN_KEY
// → JSON: local_results[0].data_id kopieren → als GABRIEL_DATA_ID in Railway env setzen

const fetch  = require('node-fetch');
const fs     = require('fs');
const path   = require('path');
const cron   = require('node-cron');
const logger = require('./logger');

const DATA_ID    = process.env.GABRIEL_DATA_ID;
const SERP_KEY   = process.env.SERPAPI_KEY;
const CACHE_FILE = path.resolve('./public/reviews.json');

async function syncReviews() {
  if (!DATA_ID || !SERP_KEY) {
    logger.warn('[reviews] GABRIEL_DATA_ID oder SERPAPI_KEY fehlt — sync übersprungen');
    return;
  }

  try {
    const params = new URLSearchParams({
      engine:  'google_maps_reviews',
      data_id: DATA_ID,
      hl:      'de',
      sort_by: 'newestFirst',
      api_key: SERP_KEY,
    });

    logger.info('[reviews] Starte Sync von SerpAPI...');
    const data = await fetch(
      `https://serpapi.com/search.json?${params}`
    ).then(r => r.json());

    if (data.error) throw new Error(data.error);

    const payload = {
      place:   data.place_info?.title   || 'Gabriel Feine Uhren & Juwelen',
      rating:  data.place_info?.rating  || null,
      total:   data.place_info?.reviews || null,
      reviews: (data.reviews || []).map(r => ({
        id:       r.review_id,
        author:   r.user?.name,
        avatar:   r.user?.thumbnail,
        guide:    r.user?.local_guide || false,
        rating:   r.rating,
        date:     r.date,
        iso_date: r.iso_date,
        text:     r.extracted_snippet?.original || r.snippet,
      })),
      synced_at: new Date().toISOString(),
    };

    fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
    fs.writeFileSync(CACHE_FILE, JSON.stringify(payload, null, 2));
    logger.info(`[reviews] ${payload.reviews.length} Reviews gecacht — Bewertung: ${payload.rating} ⭐`);

  } catch (err) {
    logger.error('[reviews] Sync fehlgeschlagen:', err.message);
    // Silent fail — alter Cache bleibt, Shopify zeigt weiterhin letzte Daten
  }
}

// Jeden Montag 04:00 Uhr
cron.schedule('0 4 * * 1', () => {
  logger.info('[reviews] Cron: Wöchentlicher Sync gestartet');
  syncReviews();
});

// Beim Server-Start einmal ausführen
syncReviews();

module.exports = { syncReviews };
