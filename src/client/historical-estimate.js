/** A visible, scoped total using the host's persisted canonical replay. */
export function createHistoricalEstimateCard(React) {
 const {createElement:el,useState,useEffect}=React
 return function HistoricalEstimateCard({api}) {
  const [summary,setSummary]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState('')
  const load=async recalculate=>{
   setBusy(true);setError('')
   try{const value=await api[recalculate?'recalculateHistoricalEstimate':'getHistoricalEstimate']();setSummary(value);if(recalculate)window.dispatchEvent(new Event('cost-meter/history-estimate-updated'))}
   catch(e){setError(e?.message??'Historical total unavailable')}
   finally{setBusy(false)}
  }
  useEffect(()=>{let alive=true;const refresh=()=>api.getHistoricalEstimate().then(value=>{if(alive)setSummary(previous=>!previous||!value||value.generatedAt>=previous.generatedAt?value:previous)},e=>{if(alive)setError(e?.message??'Historical total unavailable')});refresh();window.addEventListener('cost-meter/history-estimate-updated',refresh);return()=>{alive=false;window.removeEventListener('cost-meter/history-estimate-updated',refresh)}},[api])
  if(!summary&&!error)return null
  const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',minimumFractionDigits:2,maximumFractionDigits:2}).format(n)
  const known=summary?money(summary.knownUsd):'Unavailable'
  const time=summary?new Date(summary.generatedAt).toLocaleString('en-IN',{timeZone:'Asia/Kolkata'}):''
  return el('section',{'aria-label':'Historical session cost total',className:'cm-card',style:{marginBottom:16}},
   el('h3',{className:'cm-h'},'Historical API-equivalent cost'),
   el('div',{className:'cm-card-value cm-num','data-cm-historical-total':true},known),
   summary?.missingCalls?el('div',{style:{marginBottom:4}},`+ ${summary.missingCalls} unpriced calls`):null,
   summary?el('div',null,`${summary.sessionCount} sessions · ${summary.archivedCount} archived · ${summary.descendantCount} subagents included`):null,
   summary?el('div',null,`${summary.calls.toLocaleString('en-US')} calls · ${summary.tokens.toLocaleString('en-US')} tokens`):null,
   summary?el('div',{style:{opacity:.7,fontSize:10,marginTop:4}},`Recalculated ${time} IST`):null,
   summary?.stalePrices?el('p',{role:'status'},'Rates changed. Recalculate to update this total.'):null,
   summary?.errors?.length?el('p',{role:'alert'},`${summary.errors.length} session histories could not be fully read.`):null,
   el('button',{className:'cm-btn',type:'button',disabled:busy,onClick:()=>load(true),style:{marginTop:8}},busy?'Recalculating…':`Recalculate${summary?' '+summary.sessionCount+' sessions':''}`),
   error?el('p',{role:'alert'},error):null,
   summary?el('details',{style:{marginTop:8}},el('summary',null,'DeepSeek timing and session breakdown'),
    el('p',null,`Peak ${money(summary.deepseekPricing.peak.usd)} · ${summary.deepseekPricing.peak.calls.toLocaleString('en-US')} calls`),
    el('p',null,`Off-peak ${money(summary.deepseekPricing.offPeak.usd)} · ${summary.deepseekPricing.offPeak.calls.toLocaleString('en-US')} calls`),
    el('p',null,`Recorded API-tariff amount: ${money(summary.recordedApiUsd)} (separate from the equivalent estimate).`),
    el('div',{style:{maxHeight:320,overflow:'auto'}},el('table',{style:{width:'100%',fontSize:11}},el('thead',null,el('tr',null,...['Session','USD'].map(h=>el('th',{key:h,style:{textAlign:'left'}},h)))),el('tbody',null,...summary.sessions.map(s=>el('tr',{key:s.id},
     el('td',{title:s.title+' · '+s.id,style:{maxWidth:150,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}},s.title+(s.archived?' (archived)':'')),
     el('td',null,s.missingCalls&&s.knownUsd===0?'Unpriced':money(s.knownUsd)+(s.missingCalls?' + unpriced':''))))))),
    el('p',{style:{opacity:.7}},'Reference API value, not a subscription invoice. DeepSeek uses each recorded request time; BharatCode uses the direct-model equivalent.')):null)
 }
}

export function decodeHistoricalEstimate(value) {
 if(value===null)return null
 const n=x=>typeof x==='number'&&Number.isFinite(x)&&x>=0
 if(!value||!['generatedAt','sessionCount','archivedCount','descendantCount','calls','tokens','knownUsd','recordedApiUsd','missingCalls'].every(k=>n(value[k]))||typeof value.complete!=='boolean'||typeof value.stalePrices!=='boolean'||!Array.isArray(value.sessions)||!Array.isArray(value.errors)||value.sessions.length!==value.sessionCount)throw Error('Invalid historical cost total')
 for(const s of value.sessions)if(typeof s.id!=='string'||typeof s.title!=='string'||typeof s.archived!=='boolean'||!['calls','tokens','knownUsd','missingCalls'].every(k=>n(s[k])))throw Error('Invalid historical session cost')
 return value
}
