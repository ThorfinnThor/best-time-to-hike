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
  const workflow=readFileSync('.github/workflows/observation-validity-global.yml','utf8');
  assert.match(workflow,/workflow_dispatch/);
  assert.match(workflow,/BTH_VALIDITY_SCOPE: all/);
  assert.match(workflow,/BTH_VALIDITY_REQUIRE_ALL: '1'/);
  assert.match(workflow,/actions\/cache\/restore@v4/);
  assert.doesNotMatch(workflow,/CDSAPI_KEY|download_era5|fetch-era5/);
});
