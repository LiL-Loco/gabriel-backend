require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const logger  = require('./services/logger');

// ── Services starten ────────────────────────────────────────────────────────
require('./services/reviewsSync');

// ── Express Setup ────────────────────────────────────────────────────────────
const app  = express();
const PORT = process.env.PORT || 3000;

// CORS: Nur Shopify-Domain + lokale Entwicklung erlauben
const allowedOrigins = [
  process.env.ALLOWED_ORIGIN,        // z.B. https://gabriel-uhren.myshopify.com
  'https://gabriel-uhren.myshopify.com',
  'https://www.g-abriel.de',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Kein Origin (z.B. direkte Aufrufe / curl) → erlauben
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    logger.warn(`[cors] Geblockt: ${origin}`);
    callback(new Error('Not allowed by CORS'));
  },
}));

// ── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', ts: new Date().toISOString() });
});

// ── Reviews JSON ─────────────────────────────────────────────────────────────
// reviews.json mit 1-Tag Browser-Cache ausliefern
app.use('/reviews.json', (req, res, next) => {
  res.setHeader('Cache-Control', 'public, max-age=86400'); // 24h
  next();
});
app.use('/reviews.json', express.static(path.join(__dirname, 'public')));

// Wenn noch kein Cache vorhanden → 503 statt leeres JSON
app.get('/reviews.json', (req, res) => {
  res.status(503).json({ error: 'Reviews noch nicht gecacht — bitte kurz warten' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  logger.info(`[server] Gabriel Backend läuft auf Port ${PORT}`);
});
