import test from 'node:test';import assert from 'node:assert/strict';
const pricing=await import('../lib/api-equivalent-pricing.js');
const config=pricing.defaultApiEquivalentConfig();
const samples=[['2026-11-06T00:59:59Z',1],['2026-11-06T01:00:00Z',2],['2026-11-06T04:00:00Z',1],['2026-11-06T06:00:00Z',2],['2026-11-06T10:00:00Z',1],['2026-11-07T01:00:00Z',1],['2026-10-01T01:00:00Z',1]];
const sample=(at,provider='bharatcode',model='deepseek-v4.1-flash')=>({provider,model,atMs:Date.parse(at),pricedAtMs:Date.parse(at),buckets:{input:1000000,cacheRead:1000000,cacheWrite:0,output:1000000,reasoning:500000}});
test('published Beijing schedule selects weekday boundaries, weekends and public holidays',()=>{
 assert.equal(typeof pricing.deepseekPhaseAt,'function');for(const [at,m] of samples)assert.equal(pricing.deepseekPhaseAt(Date.parse(at)),m===2?'peak':'offPeak',at);
 assert.equal(pricing.deepseekPhaseAt(NaN),null);assert.equal(pricing.deepseekPhaseAt(0),null);assert.equal(pricing.deepseekPhaseAt(Number.MAX_VALUE),null);
});
test('same usage is valued at request-start time and reasoning is not charged again',()=>{
 assert.equal(typeof pricing.timedDeepseekEstimate,'function');
 const s=sample('2026-11-06T01:00:00Z');s.atMs=Date.parse('2026-11-06T04:01:00Z');
 const summary=pricing.timedDeepseekEstimate([s,sample('2026-11-07T01:00:00Z')],config);
 assert.ok(Math.abs(summary.usd-2.259)<1e-10);assert.equal(summary.peak.calls,1);assert.equal(summary.offPeak.calls,1);assert.equal(summary.peak.tokens,3000000);
 const u={input:2000000,cacheRead:2000000,output:2000000,deepseekPricing:summary,byProviderModel:{'bharatcode:deepseek-v4.1-flash':{input:2000000,cacheRead:2000000,output:2000000,calls:2}}};
 const estimate=pricing.estimateApiEquivalent(u,config);assert.ok(Math.abs(estimate.usd-summary.usd)<1e-10);assert.equal(estimate.complete,true);
 assert.match(pricing.formatDeepseekUsage(estimate.deepseekPricing),/peak.*1 call.*off-peak.*1 call/i);
});
test('missing timing cannot silently fall back to an off-peak price',()=>{
 const estimate=pricing.estimateApiEquivalent({byProviderModel:{'bharatcode:deepseek-v4.1-flash':{input:1000000,calls:1}}},config);
 assert.equal(estimate.complete,false);assert.equal(estimate.usd,0);assert.match(estimate.missing.join(' '),/timing/i);
});
test('merge adds parent and child summaries exactly once while retaining route identities',()=>{
 assert.equal(typeof pricing.mergeDeepseekPricing,'function');
 const one=pricing.timedDeepseekEstimate([sample('2026-11-06T01:00:00Z')],config),two=pricing.timedDeepseekEstimate([sample('2026-11-07T01:00:00Z')],config);
 const sum=pricing.mergeDeepseekPricing(one,two);assert.equal(sum.peak.calls,1);assert.equal(sum.offPeak.calls,1);assert.ok(Math.abs(sum.usd-2.259)<1e-10);
 assert.equal(pricing.mergeDeepseekPricing(one,undefined).usd,one.usd);
});
test('unknown rates and times remain explicitly incomplete and seeds are excluded',()=>{
 assert.equal(typeof pricing.timedDeepseekEstimate,'function');
 const seed={...sample('2026-11-06T01:00:00Z'),seed:true};const bad={...sample('2026-11-06T01:00:00Z'),pricedAtMs:NaN,atMs:NaN};
 const s=pricing.timedDeepseekEstimate([seed,bad],config);assert.equal(s.usd,0);assert.equal(s.unknownCalls,1);assert.equal(s.complete,false);
 const other=pricing.timedDeepseekEstimate([sample('2026-11-06T01:00:00Z','muse','muse-spark-1.3')],config);assert.equal(other.peak.calls,0);assert.equal(other.offPeak.calls,0);
});

test('host reads canonical live usage, excludes copied seed calls and preserves recorded ledger amounts',async()=>{
 const host=await import('../lib/deepseek-session-pricing.js').catch(()=>({}));assert.equal(typeof host.getTimedDeepseekPricing,'function');
 const at=Date.parse('2026-11-06T01:00:00Z');const header={id:'parent',createdAt:at-1000};
 const events=[{type:'step/start',seq:1,time:at,data:{turn:1,step:1}},{type:'request/header',seq:2,time:at,data:{header:{config:{provider:'bharatcode',model:'deepseek-v4.1-flash'}}}},{type:'assistant/message',seq:3,time:at+50,data:{turn:1,step:1,usage:{inputTokens:1000000,outputTokens:1000000,cacheReadTokens:1000000}}}];
 const ctx={get(name){return name==='sessions'?{get(id){return id==='parent'?{header,snapshotEvents(){return events}}:undefined}}:undefined}};
 const ledger={config:{prices:{apiEquivalent:config}},days:{},path:''};
 const s=await host.getTimedDeepseekPricing(ledger,ctx,'parent');assert.equal(s.peak.calls,1);assert.ok(Math.abs(s.usd-1.506)<1e-10);assert.deepEqual(ledger.days,{});
});

test('Pro keeps its own rates, unrelated routes remain unchanged and malformed transport is rejected',()=>{
 const s=sample('2026-11-06T01:00:00Z','deepseek-official','deepseek-v4-pro');const timed=pricing.timedDeepseekEstimate([s],config);assert.ok(Math.abs(timed.usd-5.324)<1e-10);
 const sol={input:1000000,cacheRead:1000000,output:1000000};const estimate=pricing.estimateApiEquivalent({byProviderModel:{'codex:gpt-6.1-sol':sol}},config);assert.equal(estimate.usd,12.1);assert.equal(estimate.complete,true);
 assert.throws(()=>pricing.decodeDeepseekPricing({usd:-1,complete:true}),/Invalid/);
 assert.equal(pricing.deepseekRateKey('unknown:deepseek-flash',config),null);
});
