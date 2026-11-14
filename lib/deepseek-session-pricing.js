/** Price-independent canonical source replay; no ledger or conversation writes. */
import { sessionUsageRecords } from './turn-cost.js'
import { nativeSearchRecordsFor } from './native-search-history.js'
import { billionRecordsFor } from './billion-context-history.js'
import { replaySessionRecords } from './backfill.js'
import { sessionCostSource } from './session-cost-source.js'
import { timedDeepseekEstimate } from './api-equivalent-pricing.js'

const caches = new WeakMap()
export async function getTimedDeepseekPricing(ledger, ctx, sessionId) {
  const config = ledger.config?.prices?.apiEquivalent
  if (config?.enabled !== true) return undefined
  const source = await sessionCostSource({ ...ledger, config: { ...ledger.config, includeSubagentCost: false } }, ctx, sessionId)
  const key = JSON.stringify([sessionId, source, config])
  let cache = caches.get(ledger)
  if (!cache) { cache = new Map(); caches.set(ledger, cache) }
  if (!cache.has(key)) {
    const pending = (async () => {
      const records = await sessionUsageRecords(ctx, sessionId, ledger.path)
      if (!records.length) return { ...timedDeepseekEstimate([], config), complete: false }
      const native = await nativeSearchRecordsFor(ledger.path, sessionId)
      const billion = await billionRecordsFor(ledger.path, sessionId)
      const { samples } = replaySessionRecords([...records, ...native, ...billion], ledger.config, null, true)
      return timedDeepseekEstimate(samples, config)
    })()
    cache.set(key, pending)
    pending.catch(() => cache.delete(key))
    while (cache.size > 96) cache.delete(cache.keys().next().value)
  }
  return cache.get(key)
}
