# Copernicus DEM quality-layer access check

Status: **official WBM/quality gate remains open**  
Checked: 2026-09-02

The unsigned AWS Registry of Open Data mirror used by the staging profiler publishes the GLO-30 elevation COGs only. Direct checks for the corresponding `_WBM.tif` object in both the DEM tile directory and a parallel WBM directory returned HTTP 404.

Copernicus describes the Water Body Mask values as 0 no-water, 1 ocean, 2 lake and 3 river. The current Copernicus Data Space collection page states that the newer water-body and land-cover auxiliary layers are catalogued as `COP-DEM_AMP-12-DGED`, but download is restricted to specific eligible CCM categories and requires acceptance of the CCM licence. A CDS Climate Data Store personal access token is not a CDSE/CCM credential.

Sources:

- `https://copernicus-dem-30m.s3.amazonaws.com/readme.html`
- `https://dataspace.copernicus.eu/explore-data/data-collections/copernicus-contributing-missions/collections-description/COP-DEM`
- `https://dataspace.copernicus.eu/sites/default/files/media/files/2024-06/geo1988-copernicusdem-spe-002_producthandbook_i5.0.pdf`
- `https://documentation.dataspace.copernicus.eu/APIs/OData.html`

## Decision

No code may label an OSM, WorldCover or other public mask as Copernicus WBM. Luna may build an explicitly named OSM vector water/glacier/urban staging mask to diagnose material contamination and improve candidate sampling. That supplementary mask does not close the official WBM/EDM/FLM/HEM release finding. Release approval stays false until eligible CDSE access is available or Sol approves a separately validated, versioned replacement methodology.
