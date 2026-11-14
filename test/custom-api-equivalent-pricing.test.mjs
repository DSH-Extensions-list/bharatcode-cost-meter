import test from 'node:test'
import assert from 'node:assert/strict'
import { defaultApiEquivalentConfig, estimateApiEquivalent, validateApiEquivalentConfig, formatApiEquivalent } from '../lib/api-equivalent-pricing.js'
import { providerPriceEntryFor } from '../lib/pricing.js'

test('subscription spend remains unpriced while explicit configured equivalents can be estimated', () => {
  const config = defaultApiEquivalentConfig()
  const usage = { byProviderModel: { 'codex:gpt-6.1-sol': { input: 100_000, cacheRead: 200_000, output: 10_000, reasoning: 9_000 } } }
  const before = structuredClone(usage)
  assert.equal(providerPriceEntryFor('codex', 'gpt-6.1-sol', { providers: { openai: { models: { 'gpt-6.1-sol': { input: 2, output: 10 } } } } }).priced, false)
  const estimate = estimateApiEquivalent(usage, config)
  assert.ok(Math.abs(estimate.usd - 0.32) < 1e-12)
  assert.equal(estimate.complete, true)
  assert.deepEqual(usage, before)
  assert.match(formatApiEquivalent(estimate), /API-equivalent.*not billed/)
})
test('cache write uses its explicit rate; output already includes reasoning', () => {
  const config = defaultApiEquivalentConfig()
  const result = estimateApiEquivalent({ byProviderModel: { 'codex:gpt-6.1-sol': { input: 1_000_000, cacheRead: 1_000_000, cacheWrite: 1_000_000, output: 1_000_000, reasoning: 999_999 } } }, config)
  assert.equal(result.usd, 14.6)
})
test('unknown route models never inherit a similar model rate', () => {
  const config = defaultApiEquivalentConfig()
  const result = estimateApiEquivalent({ byProviderModel: { 'codex:gpt-6-sol': { input: 10 }, 'antigravity:chat_20706': { output: 20 } } }, config)
  assert.equal(result.usd, 0)
  assert.deepEqual(result.missing, ['antigravity:chat_20706', 'codex:gpt-6-sol'])
  assert.match(formatApiEquivalent(result), /price unavailable/)
})
test('partial estimates disclose missing usage and disabled mode returns no estimate', () => {
  const config = defaultApiEquivalentConfig()
  const result = estimateApiEquivalent({ byProviderModel: { 'codex:gpt-6.1-sol': { input: 1_000_000 }, 'muse:unknown': { output: 1 } } }, config)
  assert.equal(result.complete, false)
  assert.match(formatApiEquivalent(result), /unpriced usage/)
  assert.equal(estimateApiEquivalent({}, { ...config, enabled: false }), null)
})
test('Gemini tiers are selected from disjoint per-call input including cached input', () => {
  const config = defaultApiEquivalentConfig()
  const result = estimateApiEquivalent({ byProviderModel: { 'antigravity:gemini-2.5-pro': { input: 100_000, cacheRead: 100_001, output: 100_000 } } }, config)
  assert.ok(Math.abs(result.usd - (0.25 + 0.02500025 + 1.5)) < 1e-12)
})
test('aggregate tier ambiguity is visibly estimated rather than treated as a bill', () => {
  const config = defaultApiEquivalentConfig()
  const result = estimateApiEquivalent({ byProviderModel: { 'antigravity:gemini-2.5-pro': { input: 400_000, calls: 10 } } }, config)
  assert.equal(result.approximate, true)
})
test('validate explicit zero rates but reject negative, nonfinite, incomplete rates and malformed bindings', () => {
  const config = defaultApiEquivalentConfig()
  assert.equal(validateApiEquivalentConfig(config), true)
  assert.equal(validateApiEquivalentConfig({ enabled: true, bindings: { 'local:test': 'custom:free' }, rates: { 'custom:free': { input: 0, cachedInput: 0, output: 0 } } }), true)
  for (const invalid of [-1, NaN, Infinity, '2']) {
    assert.equal(validateApiEquivalentConfig({ ...config, rates: { bad: { input: invalid, output: 1 } } }), false)
  }
  assert.equal(validateApiEquivalentConfig({ ...config, rates: { bad: { input: 1 } } }), false)
  assert.equal(validateApiEquivalentConfig({ ...config, bindings: { 'bad': 'openai:gpt-6.1-sol' } }), false)
})

test('dated promotional rates expire instead of silently persisting old rates', () => {
  const result = estimateApiEquivalent({ byProviderModel: { 'antigravity:gemini-3.8-flash-tiered': { input: 100 } } }, defaultApiEquivalentConfig(), Date.parse('2027-01-01T00:00:00Z'))
  assert.equal(result.complete, false)
  assert.equal(result.usd, 0)
})

test('default route coverage is exact and unknown catalogue models remain explicitly identified', () => {
  const config = defaultApiEquivalentConfig()
  assert.equal(Object.keys(config.bindings).length, 32)
  assert.equal(Object.keys(config.unpricedModels).length, 39)
  for (const key of Object.keys(config.bindings)) assert.equal(config.unpricedModels[key], undefined)
  assert.match(config.unpricedModels['bharatcode:qwen-3.8-27b'], /No verified/)
  assert.equal(config.bindings['mistral:codestral-latest'], 'mistral:codestral-2508')
})

test('usage totals missing a route breakdown remain visibly incomplete', () => {
  const result = estimateApiEquivalent({ input: 1_000, output: 100, byProviderModel: { 'codex:gpt-6.1-sol': { input: 500, output: 100 } } }, defaultApiEquivalentConfig())
  assert.equal(result.complete, false)
  assert.ok(result.missing.includes('usage without route/model breakdown'))
})
