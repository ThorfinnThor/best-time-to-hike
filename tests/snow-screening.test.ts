import test from 'node:test';
import assert from 'node:assert/strict';
import { screenPhysicalSnow } from '../lib/hiking/snow-screening';
test('local snow screen preserves exact 10 m boundary without glacier assertion',()=>{
  assert.equal(screenPhysicalSnow([9.999],Array(12).fill(0)).reviewRequired,false);
  const result=screenPhysicalSnow([10],Array(12).fill(0));
  assert.equal(result.reviewRequired,true);assert.equal(result.glacierClassification,'not-established');assert.equal(result.existingHoldMayBeReleased,false);
});
test('persistent snow and missingness cannot clear holds',()=>{
  assert.equal(screenPhysicalSnow([2],Array(12).fill(1)).reviewRequired,true);
  assert.equal(screenPhysicalSnow([null],Array(12).fill(null)).reviewRequired,true);
  assert.throws(()=>screenPhysicalSnow([-1],Array(12).fill(0)));
  assert.throws(()=>screenPhysicalSnow([1],[0]));
});
