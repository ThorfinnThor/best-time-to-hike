# Destination expansion batch 4 — scientific intake

Status: **planning-only; no destination is published by this decision alone**  
Reviewer: SOL-assisted scientific intake  
Target: 20 new destinations, taking the catalogue from 315 to 335 only after every source and release gate passes.

## Selection rule

The batch adds clearly named hiking areas that are not already present in the catalogue. The representative coordinate is a documented trail hub, trailhead or central walking area, not a claim that one point describes the whole park. Public output must retain the existing wording: **one selected representative model-grid cell; not a whole-region or route-specific average**.

Coordinates are intake coordinates. ERA5-Land resolves them to its nearest 0.1-degree cell. A candidate is withheld when that cell fails land fraction, source completeness, model-elevation, persistent-snow, independent-climate or recommendation gates. No threshold may be relaxed to reach the target count.

## Candidate evidence

| ID | Representative hiking scope | Primary trail evidence |
| --- | --- | --- |
| `acadia` | Jordan Pond / Mount Desert Island trail network | [US National Park Service: Acadia hiking](https://www.nps.gov/acad/planyourvisit/hiking.htm) |
| `yellowstone` | Canyon hiking area | [US National Park Service: Yellowstone hiking](https://www.nps.gov/yell/planyourvisit/hiking.htm) |
| `joshua-tree` | Ryan Mountain trail area | [US National Park Service: Joshua Tree hiking](https://www.nps.gov/jotr/planyourvisit/hiking.htm) |
| `sedona` | Brins Mesa / Red Rock trail network | [US Forest Service: Red Rock trails guide](https://www.fs.usda.gov/sites/nfs/files/legacy-media/coconino/Red%20Rock%20Recreation%20Guide%202024.pdf) |
| `big-bend` | Chisos Basin trailhead network | [US National Park Service: Big Bend mountain hikes](https://www.nps.gov/bibe/planyourvisit/mountain_hikes.htm) |
| `sao-miguel` | Inland section of the Praia–Lagoa do Fogo trail | [Trails of the Azores: PR02SMI](https://trails.visitazores.com/en/trails-azores/sao-miguel/lagoa-do-fogo) |
| `ordesa-monte-perdido` | Pradera de Ordesa trail network | [Government of Aragón: Ordesa and Monte Perdido](https://www.aragon.es/-/parque-nacional-de-ordesa-y-monte-perdido) |
| `la-gomera` | Garajonay walking network | [Canary Islands Government: Garajonay routes](https://www.gobiernodecanarias.org/parquesnacionales/garajonay/visita/rutas_miradores_y_areas_recreativas/rutas/) |
| `nikko` | Senjōgahara / Oku-Nikkō hiking area | [Japan Ministry of the Environment: Nikkō National Park map](https://www.env.go.jp/park/common/data/10_nikko_map_e.pdf) |
| `mount-batur` | Batur caldera and ascent area | [Indonesia Travel: Batur Geopark](https://www.indonesia.travel/id/id/destination/bali-nusa-tenggara/bali/geopark-batur) |
| `horton-plains` | Horton Plains public trail network | [Sri Lanka Central Province Tourism: hiking and trekking](https://tourism.cp.gov.lk/en/hiking-n-trekking) |
| `mount-pulag` | Ambangeg approach / ranger-station area | [Philippines DENR: Mount Pulag context](https://denr.gov.ph/wp-content/uploads/2023/07/DENR_News_Alerts_May_052022_Thursday_opt.pdf) |
| `reunion` | Cilaos / Piton des Neiges approach | [Réunion official tourism: nature and hiking](https://en.reunion.fr/discover/intensely-nature/) |
| `fish-river-canyon` | Hobas trailhead / canyon hike | [Namibia Tourism Board: hiking](https://visitnamibia.com.na/hiking/) |
| `tsitsikamma` | Storms River forest and coastal trails | [SANParks: Garden Route hikes and trails](https://www.sanparks.org/parks/garden-route/what-to-do/activities/hikes-walks-trails) |
| `queenstown-new-zealand` | Ben Lomond / Queenstown trail network | [New Zealand DOC: Ben Lomond Track](https://www.doc.govt.nz/parks-and-recreation/places-to-go/otago/places/queenstown-area/things-to-do/ben-lomond-track/) |
| `great-ocean-walk` | Blanket Bay section of the Great Ocean Walk | [Parks Victoria: full Great Ocean Walk](https://www.parks.vic.gov.au/places-to-see/parks/great-otway-national-park/things-to-do/great-ocean-walk/the-whole-eight-days) |
| `machu-picchu` | Inca Trail near Wiñay Wayna / Machu Picchu | [Peruvian Ministry of Culture: Camino Inka](https://www.machupicchu.gob.pe/camino-inka/) |
| `el-bolson` | Río Azul mountain circuit network | [El Bolsón municipal tourism: mountain map](https://www.turismoelbolson.gob.ar/mapa-digital) |
| `chapada-dos-guimaraes` | Véu de Noiva / national-park walking area | [ICMBio: Chapada dos Guimarães National Park](https://www.gov.br/icmbio/pt-br/assuntos/unidade-de-conservacao/unidades-de-biomas/cerrado/lista-de-ucs/parna-da-chapada-dos-guimaraes) |

## Required release sequence

1. Resolve model elevation and land fraction for exactly these 20 cells.
2. Download and aggregate complete ERA5-Land 1991–2025 hourly observations in CI.
3. Apply persistent-snow, glacier, component and recommendation gates without exceptions.
4. Refresh the independent NASA POWER diagnostic and place any new precipitation disagreement under a public recommendation hold.
5. Extend the scientific evidence scope only for candidates whose coordinate, source-hash, observation-count and public-provenance chains pass.
6. Run the complete deterministic build, tests, science audit and deployment-budget guard before committing or deploying.

The official trail pages establish that these are real hiking destinations and explain the selected walking scope. They do **not** validate ERA5-Land, current trail conditions, route safety or a whole-region climate claim.
