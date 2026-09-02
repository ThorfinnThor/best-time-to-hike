# Geometry intake — batch 1

Status: **staging-only; no candidate is active**  
Retrieved: 2026-09-02  
Provider: OpenStreetMap via Nominatim, licence ODbL 1.0 with attribution

The Luna importer queried each batch-1 candidate with a throttled Nominatim request and retained the complete response under `generated/intermediate/geometry-osm-batch-1.json`. The staging response is not consumed by the public build. Hashes below bind the source response to the recorded OSM relation and query result.

## Polygon relations found

| Candidate | OSM relation | OSM classification | Geometry | Response SHA-256 |
| --- | ---: | --- | --- | --- |
| zermatt | 1685406 | boundary / administrative | Polygon | `186ce7c45548dc6578f7b2cc3ec4ae77178ede51c856beee582819df84b86067` |
| grindelwald | 1682457 | boundary / administrative | Polygon | `1078c769d28eed96365c147bc279c8d8220677cf9504de89ddd42c500c58d560` |
| innsbruck | 4835169 | boundary / administrative | Polygon | `1df5054024d54ff628054d9288d2abaec56581382bcd420608f04678c8615fbd` |
| kitzbuhel | 2127484 | place / region | Polygon | `65b5497f2ac7234b57eaec1cb09aada27d7c4ab1de4aac68e150c8c75b33db0c` |
| ordino | 2804758 | boundary / administrative | Polygon | `1a7b8dbb838371b8a08779a3ea5d45048b9b94bc662471f99ed821a5a87c0dd3` |
| gavarnie | 2322151 | boundary / administrative | Polygon | `52933de786f344516234c7357bba8ff3826c9c8bfb5f636f7a8274ae63643f43` |
| benasque | 348023 | boundary / administrative | Polygon | `98a6432baf2412dcd90c33ba83159c4af438e4f580b21ae502dc5babbe4d9ed3` |
| lake-district | 287917 | boundary / protected_area | Polygon | `a6174461fc267c2f6a83f37610ec171e720b0449b7cb306fa8274285e6f5b44f` |
| snowdonia | 287245 | boundary / protected_area | Polygon | `4b91edb05668a5180624802161f5e3079609006ae9df6ddacceaaa86bb58aedb` |
| jotunheimen | 8512564 | natural / mountain_range | Polygon | `77b13b24175bf36cc6dc7143bae6bdbf3e1d76b773bc6219eefd2db0a1e9c522` |
| rila | 1417776 | boundary / national_park | MultiPolygon | `6a11f762fc340c1693594ae4197e043e9bf68269a4823dad0c6290ecf6416be0` |
| triglav | 2868142 | boundary / national_park | Polygon | `971fa33f4f2ba8329d55f47b803a63312c9aae4a307156971b53ff607e0f63a5` |
| durmitor | 10241242 | boundary / national_park | Polygon | `78ccc85fd69a0633e199f6fbcf908488918281344bf655acf6e95dc032717fed` |

## Unresolved candidates

`scottish-highlands` returns only mountain-range points for the broad search term. `lofoten` returns unrelated points and no polygon relation. Neither is converted into a bounding box or synthetic polygon. A named park/trail-sector replacement requires an explicit catalogue decision before activation.

## Next gate

For each of the 13 polygon relations, Luna must still capture intended hiking scope, excluded water/urban/glacier classes and elevation-band rationale, then run DEM and sampling staging. The geometry/elevation release gate remains `approved: false`. Sol is only needed for the two unresolved catalogue definitions or anomalous DEM/mask results.
