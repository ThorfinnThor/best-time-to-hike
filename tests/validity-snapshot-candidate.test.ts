import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

test('snapshot candidate builder is bounded, hash-gated and never writes public data',()=>{
  const source=readFileSync('scripts/validate/build-validity-snapshot-candidates.ts','utf8');
  assert.match(source,/generated\/intermediate\/validity-migration-candidates/);
  assert.match(source,/full evidence report hash mismatch/);
  assert.match(source,/scientific evidence core hash mismatch/);
  assert.match(source,/--apply-reviewed/);
  assert.match(source,/data-snapshots\/climate\/\$\{destination.slug\}\.json/);
  assert.doesNotMatch(source,/writeFileSync\([^\n]*data-snapshots/);
  assert.doesNotMatch(source,/temperatureUtilitySamplesC/);
});

test('global cache recomputation is sharded, cache-only and fail-closed',()=>{
  const workflow=readFileSync('.github/workflows/observation-validity-pilot.yml','utf8');
  assert.match(workflow,/workflow_dispatch/);
  assert.match(workflow,/options: \[pilot, global\]/);
  assert.match(workflow,/BTH_VALIDITY_SCOPE:/);
  assert.match(workflow,/inputs\.scope == 'global'/);
  assert.match(workflow,/actions\/cache\/restore@v4/);
  assert.doesNotMatch(workflow,/CDSAPI_KEY|download_era5|fetch-era5/);
});

test('global migration review requires all 315 exact cached sources and keeps production locked',()=>{
  const source=readFileSync('scripts/validate/review-global-validity-migration.ts','utf8');
  assert.match(source,/destinations\.length!==315/);
  assert.match(source,/reports\.size!==destinations\.length\|\|sources\.size!==destinations\.length/);
  assert.match(source,/source\.cacheSha256!==source\.publishedCanonicalSha256/);
  assert.match(source,/source\.publishedCanonicalSha256!==download\?\.canonicalObservation\?\.sha256/);
  assert.match(source,/month\.scoringInputsAvailable!==true/);
  assert.match(source,/productionReleaseApproval:false/);
  assert.match(source,/not independent expert certification/);
});
