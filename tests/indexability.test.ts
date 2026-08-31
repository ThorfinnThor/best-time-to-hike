import test from "node:test";
import assert from "node:assert/strict";
import { evaluateIndexability } from "../lib/seo/indexability";
const complete={resultCount:5,dataCompleteness:.99,confidence:90,uniqueInsightCount:3,hasUniqueTitle:true,hasUniqueH1:true,hasCanonical:true,internalLinkCount:4,createsCannibalization:false,containsUnsupportedClaims:false,datasetStatus:"production" as const};
test("production quality page can be indexable",()=>assert.deepEqual(evaluateIndexability(complete),{indexable:true,reasons:[]}));
test("fixture content is always noindex",()=>assert.deepEqual(evaluateIndexability({...complete,datasetStatus:"fixture"}),{indexable:false,reasons:["fixture-dataset"]}));
