// middleware.js — HTTP Basic Auth over het HELE project (planner + /api-routes).
// Draait op de Vercel Edge runtime. Credentials komen uit env-vars:
//   PLANNER_USER  en  PLANNER_PASS
//
// Waarom dit er is: /api/mice haalt met de MICE-sleutel de complete eventlijst
// op — klantnamen, contactpersonen, aantallen, prijzen. Zonder slot kon
// iedereen die het adres kende die lijst opvragen.
//
// Deze middleware sluit FAIL CLOSED: staan de env-vars niet ingevuld, dan gaat
// er niets naar buiten. Dat is bewust anders dan in stoom-dashboard, waar een
// ontbrekende configuratie het slot juist openzet.

export const config = { matcher: '/:path*' };

function unauthorized() {
  return new Response('Authenticatie vereist.', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="STOOM Planner"' },
  });
}

export default function middleware(request) {
  const user = process.env.PLANNER_USER;
  const pass = process.env.PLANNER_PASS;

  if (!user || !pass) {
    return new Response(
      'Beveiliging is nog niet ingesteld.\n\n' +
      'Zet PLANNER_USER en PLANNER_PASS als environment variables in Vercel ' +
      'en deploy opnieuw. Tot die tijd blijft deze app dicht, zodat er geen ' +
      'klantgegevens naar buiten kunnen.',
      { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
    );
  }

  const header = request.headers.get('authorization') || '';
  if (!header.startsWith('Basic ')) return unauthorized();

  let decoded;
  try {
    decoded = atob(header.slice(6)); // "gebruiker:wachtwoord"
  } catch (_) {
    return unauthorized();
  }

  const idx = decoded.indexOf(':');
  if (idx === -1) return unauthorized();
  if (decoded.slice(0, idx) !== user || decoded.slice(idx + 1) !== pass) return unauthorized();

  return; // juiste inlog -> laat door
}
