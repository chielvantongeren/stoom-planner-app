// api/mice.js — proxy naar MICE Operations. De API-sleutel blijft server-side.
//
// Toegang loopt via de project-brede Basic Auth in middleware.js. Er stond hier
// eerder `Access-Control-Allow-Origin: *` zonder enige controle, waardoor elke
// willekeurige site en elke bezoeker de complete eventlijst kon opvragen. Die
// wildcard is weg: dit endpoint is alleen bedoeld voor de planner zelf, en die
// draait op hetzelfde domein.

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Alleen GET' });

  const apiKey = process.env.MICE_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Geen API key' });

  const path = req.query.path || '/events';

  // Alleen lezen, en alleen paden binnen de API — geen doorgeefluik naar
  // willekeurige adressen.
  if (!/^\/[a-z0-9/_-]*$/i.test(path)) {
    return res.status(400).json({ error: 'Ongeldig pad' });
  }

  const query = new URLSearchParams(req.query);
  query.delete('path');

  // Adres en header bewust ongewijzigd gelaten: dit werkt hier al. (Ter info:
  // stoom-dashboard praat met api.miceoperations.com en de header Authorization.
  // Dat verschil is een opruimklus, geen onderdeel van deze beveiligingsfix.)
  const url = `https://app.miceoperations.com/api/v1${path}?${query}`;
  try {
    const r = await fetch(url, {
      headers: { 'X-Authorization': `Basic ${apiKey}`, 'Accept': 'application/json' },
    });
    res.setHeader('Cache-Control', 'no-store');
    res.status(r.status).json(await r.json());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
