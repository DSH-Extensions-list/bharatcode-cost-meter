/** Reproducible additions to the preserved English package's existing bundles. */
import { readFileSync, writeFileSync, copyFileSync } from 'node:fs'
import { transformSync, build } from 'esbuild'
import { parse } from 'acorn'
import { fileURLToPath } from 'node:url'
import { defaultApiEquivalentConfig, validateApiEquivalentConfig, estimateApiEquivalent, formatApiEquivalent, deepseekPhaseAt, deepseekRateKey, decodeDeepseekPricing, mergeDeepseekPricing, formatDeepseekUsage } from '../lib/api-equivalent-pricing.js'
import {createHistoricalEstimateCard,decodeHistoricalEstimate} from '../src/client/historical-estimate.js'
import { createApiEquivalentSettings } from '../src/client/api-equivalent-settings.js'
const root = new URL('../', import.meta.url)
const replaceOnce = (text, before, after) => {
  if (!text.includes(before) || text.indexOf(before) !== text.lastIndexOf(before)) throw new Error('Bundle seam changed: ' + before.slice(0, 80))
  return text.replace(before, () => after)
}
const helpers = [decodeHistoricalEstimate,deepseekPhaseAt, deepseekRateKey, decodeDeepseekPricing, mergeDeepseekPricing, formatDeepseekUsage]
const functions = [defaultApiEquivalentConfig, validateApiEquivalentConfig, estimateApiEquivalent, formatApiEquivalent, ...helpers].map(value => value.toString()).join('\n')
const marker = '/* API_EQUIVALENT_START */'
for (const name of ['client.js', 'client.pricing.js']) {
  const path = fileURLToPath(new URL('lib/' + name, root))
  let source = readFileSync(new URL('scripts/bundle-bases/' + name, root), 'utf8')
  if (source.includes(marker)) source = source.replace(/\/\* API_EQUIVALENT_START \*\/[\s\S]*?\/\* API_EQUIVALENT_END \*\//, '')
  const addition = (name === 'client.js' ? [validateApiEquivalentConfig, estimateApiEquivalent, formatApiEquivalent, ...helpers].map(value => value.toString()).join('\n') : functions) + (name === 'client.pricing.js' ? '\n' + createApiEquivalentSettings.toString() + '\nconst ApiEquivalentSettings=createApiEquivalentSettings(le("react"),defaultApiEquivalentConfig,validateApiEquivalentConfig);\n' : '\n')
  const injection = marker + transformSync(addition, { minifyWhitespace: true, minifySyntax: true, minifyIdentifiers: true, target: 'es2020' }).code + '/* API_EQUIVALENT_END */'
  source = replaceOnce(source, name === 'client.js' ? 'factory:Ce=>{' : 'factory:le=>{', (name === 'client.js' ? 'factory:Ce=>{' : 'factory:le=>{') + injection)
  if (name === 'client.js') {
    if (!source.includes('apiEquivalent:e.prices?.apiEquivalent')) source = replaceOnce(source, 'prices:{models:n,', 'prices:{apiEquivalent:e.prices?.apiEquivalent,models:n,')
    if (!source.includes('pt.__testBilling={decodeUsage:Ta,mergeSessionUsage:Ro,')) source = replaceOnce(source, 'pt.__testBilling={', 'pt.__testBilling={decodeUsage:Ta,mergeSessionUsage:Ro,')
    const decodedBuckets = '...Ye(s,["input","output","cacheRead","cacheWrite","reasoning","cost"],l)'
    const decodedBucketsWithCalls = '...Ye(s,["input","output","cacheRead","cacheWrite","reasoning","calls","cost"],l)'
    if (!source.includes(decodedBucketsWithCalls)) source = replaceOnce(source, decodedBuckets, decodedBucketsWithCalls)
    source = replaceOnce(source, 'j={loadBillingStorage:', 'j={loadHistoricalEstimateView:()=>R("history"),getHistoricalEstimate:()=>i("getHistoricalEstimate"),recalculateHistoricalEstimate:()=>i("recalculateHistoricalEstimate"),loadBillingStorage:')
    source = replaceOnce(source, '{method:"getTopSessions",parameters:', '{method:"getHistoricalEstimate",parameters:[],result:he("HistoricalEstimate",Z(decodeHistoricalEstimate))},{method:"recalculateHistoricalEstimate",parameters:[],result:he("HistoricalEstimate",Z(decodeHistoricalEstimate))},{method:"getTopSessions",parameters:')
    source = replaceOnce(source, 'inject:Y},Ys?Vs:Rn,!0)', 'inject:Y},props=>Ys?ve.createElement(ve.Fragment,null,ve.createElement(be,{api:props.api,load:props.api.loadHistoricalEstimateView}),ve.createElement(Vs,props)):ve.createElement(Rn,{...props,showHistoricalEstimate:true}),!0)')
    const overview = 'h==="overview"?a(E,{key:"overview"},'
    source = replaceOnce(source, overview, overview + 'e.showHistoricalEstimate?a(be,{state:n,api:o,load:o.loadHistoricalEstimateView}):null,')
    const decode = 'function Ta(e,t){ue(e,t);const o={...Et(e),'
    const decodeTimed = 'function Ta(e,t){ue(e,t);const o={...Et(e),deepseekPricing:decodeDeepseekPricing(e.deepseekPricing),'
    if (!source.includes(decodeTimed)) source = replaceOnce(source, decode, decodeTimed)
    const merge = 'const l=t.subagents,r={...s};'
    const mergeTimed = 'const l=t.subagents,r={...s,deepseekPricing:mergeDeepseekPricing(s?.deepseekPricing,l?.deepseekPricing)};'
    if (!source.includes(mergeTimed)) source = replaceOnce(source, merge, mergeTimed)
    source = replaceOnce(source, 'pt.__testBilling={decodeUsage:Ta,', 'pt.__testBilling={sessionCostView:Do,decodeUsage:Ta,')
    source = replaceOnce(source, 'className:"cm-root cm-session-cost",title:', 'className:"cm-root cm-session-cost",style:{flexWrap:"wrap"},title:')
    source = replaceOnce(source, 'a("span",{className:"cm-session-detail"},C.slice(k.length)))}const Lo=', 'a("span",{className:"cm-session-detail"},C.slice(k.length)),o.deepseekPricing?a("span",{className:"cm-deepseek-usage",style:{display:"block",flexBasis:"100%",fontSize:11,lineHeight:1.5,whiteSpace:"normal",opacity:0.85}},formatDeepseekUsage(o.deepseekPricing,value=>W(value,n))):null)}const Lo=')
    const title = 'title:[b,f].filter(Boolean).join("; ")'
    const titleTimed = 'title:[b,f,"DeepSeek reference schedule: weekdays 09:00–12:00 / 14:00–18:00 Beijing (06:30–09:30 / 11:30–15:30 IST); weekends and listed Chinese public holidays off-peak. Rates are USD per million tokens; peak is twice the configured off-peak reference. Current period: "+(deepseekPhaseAt(Date.now())==="peak"?"peak":"off-peak")].filter(Boolean).join("; ")'
    if (!source.includes(titleTimed)) source = replaceOnce(source, title, titleTimed)
    const seam = 'function et(e,t,o){'
    const branch = 'if(o?.prices?.apiEquivalent?.enabled===true)return formatApiEquivalent(estimateApiEquivalent(t,o.prices.apiEquivalent),value=>W(value,o));'
    if (!source.includes(seam + branch)) source = replaceOnce(source, seam, seam + branch)
  } else {
    const before = 'u=>u.mode==="matching"?e(Ce,u):e(u.mode==="catalog"?Me:u.mode==="restore"?ue:_e,{...u,rpc:g})'
    const after = 'u=>u.mode==="matching"?e(Ce,u):u.mode==="catalog"?e(be,null,e(ApiEquivalentSettings,u),e(Me,{...u,rpc:g})):e(u.mode==="restore"?ue:_e,{...u,rpc:g})'
    if (!source.includes(after)) source = replaceOnce(source, before, after)
  }
  if (name === 'client.js') source = source.replaceAll('getSessionCost', 'getTimedSessionCost')
  // Pack repeated pieces of the preserved stylesheet. Decode is synchronous and
  // roundtripped here, preserving every CSS character and both UI languages.
  const literals = []
  const visit = node => {
    if (!node || typeof node !== 'object') return
    if (node.type === 'Literal' && typeof node.value === 'string' && node.value.length > 20000) literals.push(node)
    for (const value of Object.values(node)) if (Array.isArray(value)) value.forEach(visit); else if (value && typeof value === 'object') visit(value)
  }
  visit(parse(source, { ecmaVersion: 'latest' }))
  for (const literal of literals.sort((a,b)=>b.start-a.start)) {
    let text = literal.value; const dictionary = []
    if (/[\uE000-\uEFFF]/.test(text)) throw new Error('Stylesheet packing alphabet collision')
    for (let i=0;i<48;i++) {
      const counts = new Map()
      for (const size of [8,12,16,24,32,48]) for (let j=0;j+size<=text.length;j+=2) {
        const part=text.slice(j,j+size);counts.set(part,(counts.get(part)??0)+1)
      }
      const ranked = [...counts].filter(([,n])=>n>1).map(([part,n])=>({part,score:(Buffer.byteLength(part)-3)*(n-1)-8})).sort((a,b)=>b.score-a.score)
      const best=ranked.find(({part})=>(Buffer.byteLength(part)-3)*(text.split(part).length-2)-8>16)
      if(!best)break
      dictionary.push(best.part);text=text.split(best.part).join(String.fromCharCode(57344+i))
    }
    let check=text;for(let i=dictionary.length-1;i>=0;i--)check=check.split(String.fromCharCode(57344+i)).join(dictionary[i])
    if(check!==literal.value)throw new Error('Stylesheet packing roundtrip failed')
    const expression='((t,d)=>{for(let i=d.length-1;i>=0;i--)t=t.split(String.fromCharCode(57344+i)).join(d[i]);return t})('+JSON.stringify(text)+','+JSON.stringify(dictionary)+')'
    if(Buffer.byteLength(expression)<Buffer.byteLength(source.slice(literal.start,literal.end)))source=source.slice(0,literal.start)+expression+source.slice(literal.end)
  }
  source = transformSync(source, { minify: true, charset: 'utf8', target: 'es2020' }).code
  if (Buffer.byteLength(source) > 262144) throw new Error(name + ' exceeds the DSH STORE single-file bound: ' + Buffer.byteLength(source))
  writeFileSync(path, source)
}

// A versioned self-contained host entry permits plugin-only activation without
// reusing Node's cached pre-update host modules or restarting running sessions.
await build({ entryPoints: [fileURLToPath(new URL('lib/bootstrap.js', root))], outfile: fileURLToPath(new URL('lib/bootstrap.timed.js', root)), bundle: true, platform: 'node', format: 'esm', packages: 'external', target: 'node20', legalComments: 'eof' })
copyFileSync(new URL('lib/typert.host.js', root), new URL('lib/typert.timed.js', root))

const historyChunk='window.__ModuleLoader__.load({id:"@arzvaak/bharatcode-cost-meter",chunk:"client.history.js",factory:require=>{'+createHistoricalEstimateCard.toString()+';const Card=createHistoricalEstimateCard(require("react"));return {mount:()=>Card}}});'
writeFileSync(new URL('lib/client.history.js',root),transformSync(historyChunk,{minify:true,charset:'utf8',target:'es2020'}).code)
