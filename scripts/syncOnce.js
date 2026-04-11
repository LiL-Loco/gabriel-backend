// Standalone sync — called by GitHub Actions, writes public/reviews.json
// No server, no cron — just fetch once and exit.

const fetch = require('node-fetch');
const fs    = require('fs');
const path  = require('path');

const DATA_ID  = process.env.GABRIEL_DATA_ID;
const SERP_KEY = process.env.SERPAPI_KEY;
const OUT      = path.resolve('./public/reviews.json');

if (!DATA_ID || !SERP_KEY) {
  console.error('[syncOnce] GABRIEL_DATA_ID oder SERPAPI_KEY fehlt');
  process.exit(1);
}

(async () => {
  try {
    const params = new URLSearchParams({
      engine:  'google_maps_reviews',
      data_id: DATA_ID,
      hl:      'de',
      sort_by: 'newestFirst',
      api_key: SERP_KEY,
    });

    console.log('[syncOnce] Rufe SerpAPI ab...');
    const res  = await fetch(`https://serpapi.com/search.json?${params}`);
    const data = await res.json();

    if (data.error) throw new Error(data.error);

    const payload = {
      place:     data.place_info?.title   || 'Gabriel Feine Uhren & Juwelen',
      rating:    data.place_info?.rating  || null,
      total:     data.place_info?.reviews || null,
      reviews:   (data.reviews || []).map(r => ({
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

    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    fs.writeFileSync(OUT, JSON.stringify(payload, null, 2));
    console.log(`[syncOnce] ✓ ${payload.reviews.length} Reviews gespeichert — Bewertung: ${payload.rating} ⭐`);
  } catch (err) {
    console.error('[syncOnce] Fehler:', err.message);
    process.exit(1);
  }
})();
