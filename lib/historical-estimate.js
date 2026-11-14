/** Explicitly scoped retrospective estimates; regular ledger charges are never changed. */
import {readFile,writeFile,rename,stat} from 'node:fs/promises'
import {randomUUID,createHash} from 'node:crypto'
import {sessionUsageRecords} from './turn-cost.js'
import {readSessionHeaders,subagentIds} from './session-tree.js'
import {nativeSearchRecordsFor} from './native-search-history.js'
import {billionRecordsFor} from './billion-context-history.js'
import {replaySessionRecords} from './backfill.js'
import {estimateApiEquivalent,timedDeepseekEstimate,mergeDeepseekPricing} from './api-equivalent-pricing.js'
import {historicalEstimateSchema} from './typert.host.js'

const fingerprint=config=>createHash('sha256').update(JSON.stringify(config)).digest('hex')
const pathOf=ledger=>ledger.path+'.historical-estimate.json'
const countTokens=b=>['input','cacheRead','cacheWrite','output'].reduce((n,k)=>n+(b[k]??0),0)
export function historicalEstimateFromSamples(groups,scope,config,now=Date.now(),errors=[]) {
 const rows=new Map(scope.map(s=>[s.id,{...s,calls:0,tokens:0,knownUsd:0,missingCalls:0,deepseekPricing:timedDeepseekEstimate([],config)}]))
 const result={generatedAt:now,sessionCount:scope.length,archivedCount:scope.filter(s=>s.archived).length,descendantCount:0,calls:0,tokens:0,knownUsd:0,recordedApiUsd:0,missingCalls:0,complete:false,stalePrices:false,pricingFingerprint:fingerprint(config),deepseekPricing:timedDeepseekEstimate([],config),errors:[...errors],sessions:[]}
 const seen=new Set()
 for(const group of groups){
  if(seen.has(group.id)||!rows.has(group.owner))continue
  seen.add(group.id);if(group.id!==group.owner)result.descendantCount++
  const own=(group.samples??[]).filter(s=>!s.seed),row=rows.get(group.owner),timed=timedDeepseekEstimate(own,config)
  row.deepseekPricing=mergeDeepseekPricing(row.deepseekPricing,timed);result.deepseekPricing=mergeDeepseekPricing(result.deepseekPricing,timed)
  for(const s of own){
   const route=s.provider+':'+s.model,b=s.buckets??{},tokens=countTokens(b)
   const estimate=s.requestFee?{complete:true,usd:s.cost}:estimateApiEquivalent({input:b.input??0,output:b.output??0,cacheRead:b.cacheRead??0,cacheWrite:b.cacheWrite??0,byProviderModel:{[route]:{...b,calls:1}},deepseekPricing:timedDeepseekEstimate([s],config)},config,s.pricedAtMs??s.atMs)
   for(const target of [result,row]){target.calls++;target.tokens+=tokens;if(estimate?.complete)target.knownUsd+=estimate.usd;else target.missingCalls++}
   result.recordedApiUsd+=s.apiCost??s.cost??0
  }
 }
 result.sessions=[...rows.values()].sort((a,b)=>b.knownUsd-a.knownUsd||a.id.localeCompare(b.id))
 result.complete=result.missingCalls===0&&errors.length===0
 return result
}
async function stored(ledger){
 try{if((await stat(pathOf(ledger))).size>2*1024*1024)throw Error('Oversize history estimate');const value=JSON.parse(await readFile(pathOf(ledger),'utf8'));if(value.version!==1||!Array.isArray(value.scope)||value.scope.length>500||value.scope.some(s=>typeof s.id!=='string'||s.id.length>512||typeof s.title!=='string'||typeof s.archived!=='boolean')||new Set(value.scope.map(s=>s.id)).size!==value.scope.length)throw Error('Invalid historical scope');return value}catch(error){if(error.code==='ENOENT')return null;throw error}
}
export async function getHistoricalEstimate(ledger){
 const value=await stored(ledger);if(!value?.summary)return null
 const summary=historicalEstimateSchema.parse(value.summary)
 return {...summary,stalePrices:summary.pricingFingerprint!==fingerprint(ledger.config.prices.apiEquivalent)}
}
const pending=new Map()
export async function recalculateHistoricalEstimate(ledger,ctx){
 if(pending.has(ledger.path))return pending.get(ledger.path)
 const task=(async()=>{
  const saved=await stored(ledger);if(!saved?.scope?.length)throw Error('No historical session scope has been selected')
  const headers=await readSessionHeaders(ctx),groups=[],errors=[],seen=new Set()
  for(const root of saved.scope){
   const ids=[root.id,...subagentIds(root.id,headers)]
   for(const id of ids){if(seen.has(id))continue;seen.add(id)
    try{
     const records=await sessionUsageRecords(ctx,id,ledger.path);if(!records.length)errors.push('History unavailable for '+id)
     const combined=[...(records.length?records:[{type:'session',id,createdAt:0}]),...await nativeSearchRecordsFor(ledger.path,id),...await billionRecordsFor(ledger.path,id)]
     const {samples}=replaySessionRecords(combined,ledger.config,null,true)
     groups.push({id,owner:root.id,samples:samples.map(s=>({seed:s.seed,provider:s.provider,model:s.model,pricedAtMs:s.pricedAtMs,atMs:s.atMs,buckets:s.buckets,requestFee:s.requestFee,cost:s.cost,apiCost:s.apiCost}))})
    }catch{errors.push('Could not reconstruct history for '+id)}
   }
  }
  const summary=historicalEstimateSchema.parse(historicalEstimateFromSamples(groups,saved.scope,ledger.config.prices.apiEquivalent,Date.now(),errors))
  const temporary=pathOf(ledger)+'.'+randomUUID()+'.tmp'
  await writeFile(temporary,JSON.stringify({version:1,scope:saved.scope,summary},null,2),{mode:0o600,flag:'wx'});await rename(temporary,pathOf(ledger))
  return summary
 })();pending.set(ledger.path,task)
 try{return await task}finally{pending.delete(ledger.path)}
}
