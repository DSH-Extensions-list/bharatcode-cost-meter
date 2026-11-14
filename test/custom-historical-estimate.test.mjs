import test from 'node:test';import assert from 'node:assert/strict';
const pricing=await import('../lib/api-equivalent-pricing.js');
const module=await import('../lib/historical-estimate.js').catch(()=>({}));
const cfg=pricing.defaultApiEquivalentConfig();
const sample=(provider,model,time,input=1000000)=>({provider,model,pricedAtMs:Date.parse(time),atMs:Date.parse(time),buckets:{input,output:0,cacheRead:0,cacheWrite:0,reasoning:0},cost:0});
test('all-session total uses each call time, includes descendants once and preserves unknown prices',()=>{
 assert.equal(typeof module.historicalEstimateFromSamples,'function');
 const scope=[{id:'one',title:'One',archived:false},{id:'two',title:'Two',archived:true}];
 const groups=[{id:'one',owner:'one',samples:[sample('codex','gpt-6.1-sol','2026-11-06T01:00:00Z')]},{id:'child',owner:'one',samples:[sample('bharatcode','deepseek-v4.1-flash','2026-11-06T01:00:00Z'),sample('bharatcode','deepseek-v4.1-flash','2026-11-07T01:00:00Z')]},{id:'child',owner:'one',samples:[sample('bharatcode','deepseek-v4.1-flash','2026-11-06T01:00:00Z')]},{id:'two',owner:'two',samples:[sample('muse','muse-spark-1.3','2026-11-06T01:00:00Z')]}];
 const result=module.historicalEstimateFromSamples(groups,scope,cfg,Date.parse('2026-11-06T12:00:00Z'));
 assert.equal(result.sessionCount,2);assert.equal(result.archivedCount,1);assert.equal(result.descendantCount,1);assert.equal(result.calls,4);assert.equal(result.tokens,4000000);assert.ok(Math.abs(result.knownUsd-2.45)<1e-10);assert.equal(result.missingCalls,1);assert.equal(result.complete,false);assert.equal(result.deepseekPricing.peak.calls,1);assert.equal(result.deepseekPricing.offPeak.calls,1);assert.ok(Math.abs(result.sessions[0].knownUsd-2.45)<1e-10);
});
test('inherited samples are excluded while fixed search fees are included once',()=>{
 assert.equal(typeof module.historicalEstimateFromSamples,'function');
 const seed={...sample('codex','gpt-6-astra','2026-11-06T01:00:00Z'),seed:true};const fee={...sample('deepseek-official','deepseek-search-api','2026-11-06T01:00:00Z',0),requestFee:{requests:1,rateCny:.005},cost:.00075};
 const result=module.historicalEstimateFromSamples([{id:'one',owner:'one',samples:[seed,fee]}],[{id:'one',title:'One',archived:false}],cfg,Date.now());assert.equal(result.calls,1);assert.equal(result.knownUsd,.00075);assert.equal(result.complete,true);
});

test('historical summary survives the strict host schema and browser decoder',async()=>{
 const {historicalEstimateSchema}=await import('../lib/typert.host.js');const {decodeHistoricalEstimate}=await import('../custom/historical-estimate.js');
 const value=module.historicalEstimateFromSamples([{id:'one',owner:'one',samples:[sample('bharatcode','deepseek-v4.1-flash','2026-11-06T01:00:00Z')]}],[{id:'one',title:'One',archived:false}],cfg,Date.now());
 const wire=historicalEstimateSchema.parse(value);assert.equal(decodeHistoricalEstimate(wire).knownUsd,.3);assert.throws(()=>decodeHistoricalEstimate({...wire,knownUsd:-1}),/Invalid/);
});
