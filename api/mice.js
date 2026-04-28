export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  const apiKey = process.env.MICE_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Geen API key' });
  const path = req.query.path || '/events';
  const query = new URLSearchParams(req.query);
  query.delete('path');
  const url = `https://app.miceoperations.com/api/v1${path}?${query}`;
  try {
    const r = await fetch(url, { headers: { 'X-Authorization': `Basic ${apiKey}`, 'Accept': 'application/json' } });
    res.status(r.status).json(await r.json());
  } catch(e) { res.status(500).json({ error: e.message }); }
}
