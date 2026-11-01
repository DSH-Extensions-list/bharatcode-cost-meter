import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import { defaultConfig, applyConfigPatch, sanitizeConfig } from '../lib/store.js'
import { defaultApiEquivalentConfig } from '../lib/api-equivalent-pricing.js'

function loadClient(name, reactOverrides = {}) {
  let contribution
  const react = { createElement: (type, props, ...children) => ({ type, props: props ?? {}, children }), Fragment: 'fragment', useState: initial => [typeof initial === 'function' ? initial() : initial, () => {}], useEffect: () => {}, useRef: () => ({ current: null }), ...reactOverrides }
  const sandbox = { window: { __ModuleLoader__: { load(value) { contribution = value } } }, document: { querySelector: () => null, createElement: () => ({ remove() {}, dataset: {}, style: {} }), head: { appendChild() {}, append() {} } } }
  vm.runInNewContext(readFileSync(new URL('../lib/' + name, import.meta.url), 'utf8'), sandbox)
  return contribution.factory(name => name === 'react' ? react : {})
}
test('actual shipped client shows explicit estimate while actual subscription resolver stays unpriced', () => {
  const api = loadClient('client.js').__testBilling
  const config = defaultConfig()
  const usage = { byProviderModel: { 'codex:gpt-6.1-sol': { input: 1_000_000, output: 100_000, reasoning: 50_000 } } }
  assert.equal(api.resolveClientPrice('codex', 'gpt-6.1-sol', config).priced, false)
  assert.match(api.estimatedUsageAmount(0, usage, config), /API-equivalent.*\$3(?:\.0+)? .*not billed/)
  config.prices.apiEquivalent.enabled = false
  assert.equal(api.estimatedUsageAmount(0, usage, config), 'price unavailable')
})
test('live pricing patch and persistence preserve explicit estimates without mutating actual prices', () => {
  const config = defaultConfig(), actualBefore = structuredClone(config.prices.providers)
  const estimates = defaultApiEquivalentConfig()
  delete estimates.bindings['codex:gpt-6-astra']
  estimates.rates['custom:route-model'] = { input: 0.5, cachedInput: 0.1, output: 2 }
  estimates.bindings['bharatcode:qwen-3.8-27b'] = 'custom:route-model'
  const patched = applyConfigPatch(config, { prices: { apiEquivalent: estimates } })
  assert.deepEqual(patched.errors, [])
  assert.deepEqual(patched.config.prices.providers, actualBefore)
  assert.equal(patched.config.prices.apiEquivalent.bindings['codex:gpt-6-astra'], undefined)
  assert.deepEqual(sanitizeConfig(patched.config).prices.apiEquivalent, estimates)
  assert.equal(config.prices.apiEquivalent.bindings['bharatcode:qwen-3.8-27b'], undefined)
  assert.ok(applyConfigPatch(config, { prices: { apiEquivalent: { ...estimates, rates: { bad: { input: -1 } } } } }).errors.length > 0)
})
test('the existing catalogue UI exposes a separate estimate editor using the normal draft/save flow', async () => {
  const client = loadClient('client.pricing.js')
  const view = await client.mount({ get: key => key === 'remote' ? { $mount: async () => () => {} } : {}, effect() {} })
  const draft = defaultConfig()
  let changed
  const props = { mode: 'catalog', state: { config: draft }, draft, setDraft: value => { changed = value }, locale: 'en' }
  const catalogue = view(props)
  const editor = catalogue.children[0]
  const rendered = editor.type(editor.props)
  assert.equal(rendered.type, 'details')
  const label = rendered.children.find(child => child?.type === 'label')
  label.children[0].props.onChange({ target: { checked: false } })
  assert.equal(changed.prices.apiEquivalent.enabled, false)
  assert.deepEqual(changed.prices.providers, draft.prices.providers)
  assert.ok(rendered.children.some(child => child?.type === 'textarea' && child.props['aria-label'].includes('model rates')))
})

test('the host strict wire codec preserves estimate settings for the browser', async () => {
  const { TYPERT } = await import('../lib/typert.host.js')
  const schema = TYPERT.invocations.find(row => row.method === 'getState').result.schema.shape.config.shape.prices.unwrap()
  const prices = defaultConfig().prices
  assert.deepEqual(schema.parse(prices).apiEquivalent, prices.apiEquivalent)
})


test('real browser decode and session aggregation preserve model calls for the long-context estimate warning', () => {
  const api = loadClient('client.js').__testBilling
  const key = 'antigravity:gemini-2.5-pro'
  const row = { input: 150_000, output: 10_000, cacheRead: 0, cacheWrite: 0, calls: 1, cost: 0 }
  const decode = () => api.decodeUsage({ ...row, byProviderModel: { [key]: { ...row } } }, 'fixture')
  const own = decode(), subagents = decode()
  assert.equal(own.byProviderModel[key].calls, 1)
  const config = defaultConfig()
  const combined = api.mergeSessionUsage(undefined, { own, subagents, subagentCount: 1 }, true, config)
  assert.equal(combined.byProviderModel[key].calls, 2)
  assert.match(api.estimatedUsageAmount(0, combined, config), /aggregate tier estimate/)
})

test('malformed optional estimate notes are rejected before changing config or breaking the host wire', async () => {
  const { TYPERT } = await import('../lib/typert.host.js')
  const schema = TYPERT.invocations.find(row => row.method === 'getState').result.schema.shape.config.shape.prices.unwrap()
  const config = defaultConfig(), before = structuredClone(config)
  for (const unpricedModels of [null, [], 'notes', { 'provider:model': 17 }, { 'provider:model': null }]) {
    const bad = { ...config.prices.apiEquivalent, unpricedModels }
    const result = applyConfigPatch(config, { prices: { apiEquivalent: bad } })
    assert.ok(result.errors.length > 0)
    assert.deepEqual(config, before)
    assert.equal(schema.safeParse(result.config.prices).success, true)
  }
  const noNotes = { ...config.prices.apiEquivalent }
  delete noNotes.unpricedModels
  const valid = applyConfigPatch(config, { prices: { apiEquivalent: noNotes } })
  assert.deepEqual(valid.errors, [])
  assert.equal(schema.safeParse(valid.config.prices).success, true)
})


test('the actual browser editor retains its draft and reports malformed optional notes', async () => {
  const draft = defaultConfig()
  const before = structuredClone(draft)
  const bad = { ...draft.prices.apiEquivalent, unpricedModels: null }
  let hook = 0, error = '', changed = false
  const client = loadClient('client.pricing.js', { useState: () => hook++ === 0 ? [JSON.stringify(bad), () => {}] : [error, value => { error = value }] })
  const view = await client.mount({ get: key => key === 'remote' ? { $mount: async () => () => {} } : {}, effect() {} })
  const catalogue = view({ mode: 'catalog', state: { config: draft }, draft, setDraft: () => { changed = true }, locale: 'en' })
  const editor = catalogue.children[0]
  const rendered = editor.type(editor.props)
  rendered.children.find(child => child?.type === 'button').props.onClick()
  assert.equal(changed, false)
  assert.deepEqual(draft, before)
  assert.match(error, /Use enabled:boolean/)
  hook = 0
  const retried = editor.type(editor.props)
  assert.equal(retried.children.find(child => child?.props?.role === 'alert').children[0], error)
})
