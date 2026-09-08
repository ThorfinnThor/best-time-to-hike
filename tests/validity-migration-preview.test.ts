import test from 'node:test';
import assert from 'node:assert/strict';
import decision from '../data-config/methodology/validity-migration-decision-v1.json';
import scope from '../data-config/methodology/validity-comparison-scope-v1.json';
import {readFileSync} from 'node:fs';

test('approved migration and cache comparison cover the same ten unique destinations',()=>{
  assert.equal(new Set(decision.scope).size,10);
  assert.deepEqual([...decision.scope].sort(),[...scope.destinations].sort());
  assert.deepEqual(Object.keys(decision.evidence.reportSha256).sort(),[...decision.scope].sort());
  assert.deepEqual(Object.keys(decision.evidence.scientificCoreSha256).sort(),[...decision.scope].sort());
  assert.equal(decision.productionReleaseApproval,false);
  assert.equal(decision.overrideExistingReleaseGates,false);
});

test('preview builder creates its ignored report directory explicitly',()=>{
  const source=readFileSync('scripts/validate/build-validity-migration-preview.ts','utf8');
  assert.match(source,/mkdirSync\(dirname\(output\),\{recursive:true\}\)/);
  assert.match(source,/full evidence report hash mismatch/);
  assert.match(source,/scientific evidence core hash mismatch/);
  assert.match(source,/requires one published representative band/);
});
