# STOOM Planner

Planningsapp op basis van de gegevens uit MICE Operations. Draait op Vercel.

## Beveiliging

De hele app zit achter HTTP Basic Auth (`middleware.js`). Dat is niet optioneel:
`api/mice.js` haalt met de MICE-sleutel de complete eventlijst op — klantnamen,
contactpersonen, aantallen en prijzen. Zonder slot kan iedereen die het adres
kent die lijst opvragen.

Twee omgevingsvariabelen in Vercel regelen de toegang:

| Naam | Wat |
|---|---|
| `PLANNER_USER` | gebruikersnaam |
| `PLANNER_PASS` | wachtwoord |

Zet ze aan voor **Production en Preview**. Zet ze op *Sensitive*, dan zijn ze na
opslaan niet meer terug te lezen in het dashboard.

**Deze beveiliging sluit fail closed.** Ontbreekt een van beide variabelen, dan
geeft de app iedereen een 503 met de melding dat de beveiliging niet is
ingesteld — in plaats van de deur open te zetten. Dat is bewust anders dan in
`stoom-dashboard`, waar een ontbrekende configuratie het slot juist opent.

Wijzig je een van beide variabelen, dan moet er opnieuw gedeployd worden voordat
het effect heeft.

## MICE-koppeling

`api/mice.js` is een proxy: de API-sleutel (`MICE_API_KEY`) blijft server-side en
komt nooit in de browser. De app praat alleen met `/api/mice`, nooit rechtstreeks
met MICE.

Alleen GET wordt doorgelaten en het `path` wordt gecontroleerd, zodat de proxy
geen doorgeefluik naar willekeurige adressen is.

Let op: deze app gebruikt `app.miceoperations.com` met de header
`X-Authorization`. `stoom-dashboard` en de werkapp in `stoom-apeldoorn` gebruiken
`api.miceoperations.com` met `Authorization`. Beide werken; dat verschil is een
opruimklus die nog openstaat.

## Overige omgevingsvariabelen

| Naam | Wat |
|---|---|
| `MICE_API_KEY` | API-sleutel uit MICE (Setup → Integraties → API keys) |

Supabase draait op een publishable key die in `index.html` staat. Dat mag: die
sleutel hoort in de browser, mits Row Level Security aanstaat op de tabellen.
