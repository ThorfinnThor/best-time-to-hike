import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

test('snapshot candidate builder is bounded, hash-gated and never writes public data',()=>{
  const source=readFileSync('scripts/validate/build-validity-snapshot-candidates.ts','utf8');
  assert.match(source,/generated\/intermediate\/validity-migration-candidates/);
  assert.match(source,/full evidence report hash mismatch/);
  assert.match(source,/scientific evidence core hash mismatch/);
  assert.doesNotMatch(source,/writeFileSync\([^\n]*data-snapshots/);
  assert.doesNotMatch(source,/temperatureUtilitySamplesC/);
});
