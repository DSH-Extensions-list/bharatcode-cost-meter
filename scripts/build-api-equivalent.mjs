/** Reproducible additions to the preserved English package's existing bundles. */
import { readFileSync, writeFileSync } from 'node:fs'
import { transformSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { defaultApiEquivalentConfig, validateApiEquivalentConfig, estimateApiEquivalent, formatApiEquivalent } from '../lib/api-equivalent-pricing.js'
import { createApiEquivalentSettings } from '../src/client/api-equivalent-settings.js'
const root = new URL('../', import.meta.url)
const replaceOnce = (text, before, after) => {
  if (!text.includes(before) || text.indexOf(before) !== text.lastIndexOf(before)) throw new Error('Bundle seam changed: ' + before.slice(0, 80))
  return text.replace(before, () => after)
}
const functions = [defaultApiEquivalentConfig, validateApiEquivalentConfig, estimateApiEquivalent, formatApiEquivalent].map(value => value.toString()).join('\n')
const marker = '/* API_EQUIVALENT_START */'
for (const name of ['client.js', 'client.pricing.js']) {
  const path = fileURLToPath(new URL('lib/' + name, root))
  let source = readFileSync(path, 'utf8')
  if (source.includes(marker)) source = source.replace(/\/\* API_EQUIVALENT_START \*\/[\s\S]*?\/\* API_EQUIVALENT_END \*\//, '')
  const addition = (name === 'client.js' ? [validateApiEquivalentConfig, estimateApiEquivalent, formatApiEquivalent].map(value => value.toString()).join('\n') : functions) + (name === 'client.pricing.js' ? '\n' + createApiEquivalentSettings.toString() + '\nconst ApiEquivalentSettings=createApiEquivalentSettings(le("react"),defaultApiEquivalentConfig,validateApiEquivalentConfig);\n' : '\n')
  const injection = marker + transformSync(addition, { minifyWhitespace: true, minifySyntax: true, minifyIdentifiers: true, target: 'es2020' }).code + '/* API_EQUIVALENT_END */'
  source = replaceOnce(source, name === 'client.js' ? 'factory:Ce=>{' : 'factory:le=>{', (name === 'client.js' ? 'factory:Ce=>{' : 'factory:le=>{') + injection)
  if (name === 'client.js') {
    if (!source.includes('apiEquivalent:e.prices?.apiEquivalent')) source = replaceOnce(source, 'prices:{models:n,', 'prices:{apiEquivalent:e.prices?.apiEquivalent,models:n,')
    const seam = 'function et(e,t,o){'
    const branch = 'if(o?.prices?.apiEquivalent?.enabled===true)return formatApiEquivalent(estimateApiEquivalent(t,o.prices.apiEquivalent),value=>W(value,o));'
    if (!source.includes(seam + branch)) source = replaceOnce(source, seam, seam + branch)
  } else {
    const before = 'u=>u.mode==="matching"?e(Ce,u):e(u.mode==="catalog"?Me:u.mode==="restore"?ue:_e,{...u,rpc:g})'
    const after = 'u=>u.mode==="matching"?e(Ce,u):u.mode==="catalog"?e(be,null,e(ApiEquivalentSettings,u),e(Me,{...u,rpc:g})):e(u.mode==="restore"?ue:_e,{...u,rpc:g})'
    if (!source.includes(after)) source = replaceOnce(source, before, after)
  }
  if (Buffer.byteLength(source) > 262144) throw new Error(name + ' exceeds the DSH STORE single-file bound')
  writeFileSync(path, source)
}
