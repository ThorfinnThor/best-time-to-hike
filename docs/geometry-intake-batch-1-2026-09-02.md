# Geometry intake — batch 1

Status: **staging-only; no candidate is active**  
Retrieved: 2026-09-02  
Provider: OpenStreetMap via Nominatim, licence ODbL 1.0 with attribution

The Luna importer queried each batch-1 candidate with a throttled Nominatim request and retained the complete response under `generated/intermediate/geometry-osm-batch-1.json`. The staging response is not consumed by the public build. Geometry hashes below bind the exact polygon to the recorded OSM relation independently of response metadata.

## Polygon relations found

| Candidate | OSM relation | OSM classification | Geometry | Geometry SHA-256 |
| --- | ---: | --- | --- | --- |
| zermatt | 1685406 | boundary / administrative | Polygon | `72bb1f22c071af32fe4d64416636d75a1e4f3a75650b6996379c1997892c49a2` |
| grindelwald | 1682457 | boundary / administrative | Polygon | `79f1428e63e181bd30e3b151dd2873c8a5fb1fcea937462e4281f8ca73963fb4` |
| innsbruck | 4835169 | boundary / administrative | Polygon | `60a101a3647f6fea0378f5a47e53aee9c7d655027b3a916658c8fcb0d1f6882b` |
| kitzbuhel | 2127484 | place / region | Polygon | `a83d559c2ccbe859d27d62f594c6af9b0387c1a34d126471cdc56f38076c39ec` |
| ordino | 2804758 | boundary / administrative | Polygon | `47c4e59e92661cfde2e7c5d664d385ebdc08139b3da7bbbcb76c0b56b5fdf063` |
| gavarnie | 2322151 | boundary / administrative | Polygon | `fd927f314117dd42b2d68e4e2b0e00a7305b3f8b3370a230e019bf4d43b5d268` |
| benasque | 348023 | boundary / administrative | Polygon | `e60dbd06c6072d93589a13fe0c3d64d327eef1d9feff1b3d566add0cc9dc9b84` |
| lake-district | 287917 | boundary / protected_area | Polygon | `d659cfeb6fcddac9092ee46d32a9470429b91ffde3c52d8f587901cdbcdb6974` |
| snowdonia | 287245 | boundary / protected_area | Polygon | `d18ad7a11eb578e951382d2cde6a46eaf09ef1cad4bf2d59783836b11687daa7` |
| cairngorms | 9838401 | boundary / protected_area | Polygon | `b62e81fce3bb683988a7685a5982f4330ce9556fa3537c0b22cf06748b46db97` |
| lofotodden | 9672728 | boundary / national_park | Polygon | `c40b9eaa56a5397cc7fc9558312d46bb0c46b07ee0c5d41de1f4ee933baa084d` |
| jotunheimen | 8512564 | natural / mountain_range | Polygon | `054084281384853e40cb5c99098a9281f28e3e06f540644db6704167ca0e2bbb` |
| rila | 1417776 | boundary / national_park | MultiPolygon | `774924716ac5aed7b2f01c9de7268967b84668259c53a68f504e1f1141368fe9` |
| triglav | 2868142 | boundary / national_park | Polygon | `9b377eb0e2e22a1b67ccda077af8347917a51f9e5e73dc2cc6f3a2b29701e77d` |
| durmitor | 10241242 | boundary / national_park | Polygon | `84c6cc4f85d2a897afa7431205b83b29490c6c1608bc8e31b3882a11633b5957` |

## Catalogue resolution

The broad `scottish-highlands` and `lofoten` concepts did not return defensible polygon relations. Sol narrowed them to the official, hiking-relevant `Cairngorms National Park` and `Lofotodden National Park` catalogue entries. This preserves a named travel concept while giving each destination a stable protected-area boundary. No synthetic bounding box is used.

## Next gate

All 15 planned additions now have a sourced polygon relation; unresolved count is zero. Luna must still capture intended hiking scope, excluded water/urban/glacier classes and elevation-band rationale, then run DEM and sampling staging. The geometry/elevation release gate remains `approved: false`. Sol is only needed again for scientific elevation-band decisions or anomalous DEM/mask results.
