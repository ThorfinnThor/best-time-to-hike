import test from 'node:test';
import assert from 'node:assert/strict';
import decision from '../data-config/methodology/validity-migration-decision-v1.json';
import scope from '../data-config/methodology/validity-comparison-scope-v1.json';
import destinations from '../data-config/sources/destinations.json';
import {readFileSync,readdirSync} from 'node:fs';

const expansions=readdirSync('data-config/methodology')
  .filter((name)=>/^catalogue-expansion-batch-\d+-review-v1\.json$/.test(name))
  .sort()
  .map((name)=>JSON.parse(readFileSync(`data-config/methodology/${name}`,'utf8')));

test('the migration decision has an exact unique scope and complete evidence hashes',()=>{
  assert.equal(new Set(decision.scope).size,decision.scope.length);
  if(decision.decisionStatus==='approved-for-scoped-provisional-migration') {
    assert.deepEqual([...decision.scope].sort(),[...scope.destinations].sort());
  } else {
    assert.equal(decision.decisionStatus,'approved-for-global-provisional-migration');
    const expansionIds=new Set(expansions.flatMap((expansion)=>expansion.destinations.map((item:any)=>item.destinationId)));
    assert.deepEqual([...decision.scope].sort(),destinations.filter(item=>item.active&&!expansionIds.has(item.id)).map(item=>item.id).sort());
  }
  assert.deepEqual(Object.keys(decision.evidence.reportSha256).sort(),[...decision.scope].sort());
  assert.deepEqual(Object.keys(decision.evidence.scientificCoreSha256).sort(),[...decision.scope].sort());
  assert.equal(decision.productionReleaseApproval,false);
  assert.equal(decision.overrideExistingReleaseGates,false);
});

test('each catalogue expansion has an exact unique scope and pinned source evidence',()=>{
  const reviewedAcrossBatches=new Set<string>();
  for(const expansion of expansions){
    const candidatePath=`data-config/sources/${expansion.batch}.json`;
    const candidateIds=JSON.parse(readFileSync(candidatePath,'utf8')).candidates.map((item:any)=>item.id).sort();
    const reviewedIds=expansion.destinations.map((item:any)=>item.destinationId).sort();
    assert.equal(expansion.decisionStatus,'approved-for-provisional-catalogue-expansion');
    assert.equal(expansion.productionReleaseApproval,false);
    assert.equal(new Set(reviewedIds).size,reviewedIds.length);
    assert.deepEqual(reviewedIds,candidateIds);
    for(const item of expansion.destinations){
      assert.equal(reviewedAcrossBatches.has(item.destinationId),false,`${item.destinationId} is reviewed twice`);
      reviewedAcrossBatches.add(item.destinationId);
      assert.match(item.sourceDownloadSha256,/^[a-f0-9]{64}$/);
      assert.match(item.canonicalObservationSha256,/^[a-f0-9]{64}$/);
      assert.match(item.samplingSnapshotSha256,/^[a-f0-9]{64}$/);
      assert.match(item.externalSourceResponseSha256,/^[a-f0-9]{64}$/);
      assert.ok(item.era5ToIndependentAnnualPrecipitationRatio>=1/expansion.precipitationReviewThresholdRatio);
      assert.ok(item.era5ToIndependentAnnualPrecipitationRatio<=expansion.precipitationReviewThresholdRatio);
    }
  }
});

test('preview builder creates its ignored report directory explicitly',()=>{
  const source=readFileSync('scripts/validate/build-validity-migration-preview.ts','utf8');
  assert.match(source,/mkdirSync\(dirname\(output\),\{recursive:true\}\)/);
  assert.match(source,/full evidence report hash mismatch/);
  assert.match(source,/scientific evidence core hash mismatch/);
  assert.match(source,/requires one published representative band/);
});
