import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
const p=await import('../lib/api-equivalent-pricing.js');
function client(){let registration;vm.runInNewContext(fs.readFileSync(new URL('../lib/client.js',import.meta.url),'utf8'),{window:{__ModuleLoader__:{load(x){registration=x}}},console,setTimeout,clearTimeout,setInterval,clearInterval});return registration.factory(id=>id==='react'?{createElement:(...args)=>args,Fragment:'fragment',useState:()=>[null,()=>{}],useEffect:()=>{},useMemo:fn=>fn(),useRef:()=>({current:null})}:{Tooltip:()=>null}).__testBilling;}
test('shipped browser codec and session merge preserve timed amounts through the actual formatter',()=>{
 const ui=client(),cfg=p.defaultApiEquivalentConfig();
 const summary=p.timedDeepseekEstimate([{provider:'bharatcode',model:'deepseek-v4.1-flash',pricedAtMs:Date.parse('2026-11-06T01:00:00Z'),buckets:{input:1000000,output:0,cacheRead:0}}],cfg);
 const raw={input:1000000,output:0,cacheRead:0,cacheWrite:0,calls:1,cost:0,deepseekPricing:summary,byProviderModel:{'bharatcode:deepseek-v4.1-flash':{input:1000000,output:0,cacheRead:0,cacheWrite:0,calls:1,cost:0}}};
 const decoded=ui.decodeUsage(raw,'own');assert.equal(decoded.deepseekPricing?.peak.calls,1);
 const merged=ui.mergeSessionUsage(null,{own:decoded,subagents:decoded,subagentCount:1},true,{includeSubagentCost:true});assert.equal(merged.deepseekPricing?.peak.calls,2);
 const text=p.formatApiEquivalent(p.estimateApiEquivalent(merged,cfg));assert.match(text,/\$0\.60*(?:[^0-9]|$)/);assert.match(p.formatDeepseekUsage(merged.deepseekPricing),/peak.*2 calls/i);
});
test('strict host wire schema preserves the optional timing summary',async()=>{
 const {sessionCostSchema}=await import('../lib/typert.host.js');const cfg=p.defaultApiEquivalentConfig();const raw={id:'parent',input:0,output:0,cacheRead:0,cacheWrite:0,calls:0,cost:0,deepseekPricing:p.timedDeepseekEstimate([],cfg)};
 const parsed=sessionCostSchema.parse({own:raw,subagents:raw,subagentCount:0,found:true});assert.equal(parsed.own.deepseekPricing?.complete,true);
});
