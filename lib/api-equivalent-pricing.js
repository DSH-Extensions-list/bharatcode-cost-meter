/** Separate display estimates. Never used to populate cost/apiCost or quota debits. */
export function defaultApiEquivalentConfig() {
  const openai = 'https://developers.openai.com/api/docs/pricing'
  const google = 'https://ai.google.dev/gemini-api/docs/pricing'
  const anthropic = 'https://platform.claude.com/docs/en/about-claude/pricing'
  const rate = (input, cachedInput, output, sourceUrl, extra = {}) => ({ input, cachedInput, output, sourceUrl, checkedAt: '2026-11-01', ...extra })
  return {
    enabled: true,
    bindings: {
      'codex:gpt-6.1-sol': 'openai:gpt-6.1-sol', 'codex:gpt-6-astra': 'openai:gpt-6-astra',
      'codex:gpt-6.1-terra': 'openai:gpt-6.1-terra', 'codex:gpt-6-luna': 'openai:gpt-6-luna',
      'codex:gpt-5.6-sol': 'openai:gpt-5.6-sol',
      'antigravity:gemini-3.8-flash-tiered': 'google:gemini-3.8-flash',
      'antigravity:gemini-3.5-flash-lite': 'google:gemini-3.5-flash-lite',
      'antigravity:gemini-2.5-flash': 'google:gemini-2.5-flash',
      'antigravity:gemini-2.5-flash-thinking': 'google:gemini-2.5-flash',
      'antigravity:gemini-2.5-flash-lite': 'google:gemini-2.5-flash-lite',
      'antigravity:gemini-3.1-flash-lite': 'google:gemini-3.1-flash-lite',
      'antigravity:gemini-2.5-pro': 'google:gemini-2.5-pro',
      'antigravity:claude-sonnet-4-6': 'anthropic:claude-sonnet-4-6',
      'antigravity:claude-opus-4-6-thinking': 'anthropic:claude-opus-4-6',
      'mistral:mistral-large-4-0': 'mistral:mistral-large-4',
      'mistral:zai-glm-5-3': 'mistral:zai-glm-5-3',
      'mistral:zai-glm-latest': 'mistral:zai-glm-5-3',
      'mistral:zai-glm-5-3-flash': 'mistral:zai-glm-5-3-flash',
      'mistral:codestral-2508': 'mistral:codestral-2508',
      'mistral:codestral-latest': 'mistral:codestral-2508',
      'mistral:ministral-14b-2512': 'mistral:ministral-14b-2512',
      'mistral:ministral-14b-latest': 'mistral:ministral-14b-2512',
      'mistral:ministral-8b-2512': 'mistral:ministral-8b-2512',
      'mistral:ministral-8b-latest': 'mistral:ministral-8b-2512',
      'mistral:ministral-3b-2512': 'mistral:ministral-3b-2512',
      'mistral:ministral-3b-latest': 'mistral:ministral-3b-2512',
      'mistral:mistral-large-4': 'mistral:mistral-large-4',
      'bharatcode:deepseek-v4.1-flash': 'deepseek:deepseek-flash',
      'deepseek-official:deepseek-flash': 'deepseek:deepseek-flash',
      'deepseek-account:deepseek-flash': 'deepseek:deepseek-flash',
      'deepseek-official:deepseek-v4-pro': 'deepseek:deepseek-v4-pro',
      'deepseek-account:deepseek-v4-pro': 'deepseek:deepseek-v4-pro',
    },
    unpricedModels: {
      "bharatcode:qwen-3.8-27b": "No verified exact-model rate or confirmed public API alias. Add an explicit rate and binding to estimate this model.",
      "muse:muse-wonder-1.0": "No verified exact-model rate or confirmed public API alias. Add an explicit rate and binding to estimate this model.",
      "muse:muse-spark-1.3": "No verified exact-model rate or confirmed public API alias. Add an explicit rate and binding to estimate this model.",
      "muse:muse-spark-1.2": "No verified exact-model rate or confirmed public API alias. Add an explicit rate and binding to estimate this model.",
      "mistral:mistral-code-latest": "No verified exact-model rate or confirmed public API alias. Add an explicit rate and binding to estimate this model.",
      "mistral:mistral-code-fim-latest": "No verified exact-model rate or confirmed public API alias. Add an explicit rate and binding to estimate this model.",
      "mistral:glm-5-2": "No verified exact-model rate or confirmed public API alias. Add an explicit rate and binding to estimate this model.",
      "mistral:zai-glm-5-2": "No verified exact-model rate or confirmed public API alias. Add an explicit rate and binding to estimate this model.",
      "mistral:zai-glm-5": "No verified exact-model rate or confirmed public API alias. Add an explicit rate and binding to estimate this model.",
      "mistral:labs-leanstral-1-5-1": "No verified exact-model rate or confirmed public API alias. Add an explicit rate and binding to estimate this model.",
      "mistral:labs-leanstral-1-5": "No verified exact-model rate or confirmed public API alias. Add an explicit rate and binding to estimate this model.",
      "mistral:mistral-large-2512": "No verified exact-model rate or confirmed public API alias. Add an explicit rate and binding to estimate this model.",
      "mistral:mistral-large-latest": "No verified exact-model rate or confirmed public API alias. Add an explicit rate and binding to estimate this model.",
      "mistral:mistral-medium-latest": "No verified exact-model rate or confirmed public API alias. Add an explicit rate and binding to estimate this model.",
      "mistral:mistral-medium": "No verified exact-model rate or confirmed public API alias. Add an explicit rate and binding to estimate this model.",
      "mistral:mistral-medium-3-5": "No verified exact-model rate or confirmed public API alias. Add an explicit rate and binding to estimate this model.",
      "mistral:mistral-medium-3.5": "No verified exact-model rate or confirmed public API alias. Add an explicit rate and binding to estimate this model.",
      "mistral:mistral-medium-3": "No verified exact-model rate or confirmed public API alias. Add an explicit rate and binding to estimate this model.",
      "mistral:mistral-medium-2604": "No verified exact-model rate or confirmed public API alias. Add an explicit rate and binding to estimate this model.",
      "mistral:mistral-vibe-cli-latest": "No verified exact-model rate or confirmed public API alias. Add an explicit rate and binding to estimate this model.",
      "mistral:mistral-vibe-cli-with-tools": "No verified exact-model rate or confirmed public API alias. Add an explicit rate and binding to estimate this model.",
      "mistral:magistral-medium-latest": "No verified exact-model rate or confirmed public API alias. Add an explicit rate and binding to estimate this model.",
      "mistral:mistral-small-2603": "No verified exact-model rate or confirmed public API alias. Add an explicit rate and binding to estimate this model.",
      "mistral:mistral-small-latest": "No verified exact-model rate or confirmed public API alias. Add an explicit rate and binding to estimate this model.",
      "mistral:mistral-vibe-cli-fast": "No verified exact-model rate or confirmed public API alias. Add an explicit rate and binding to estimate this model.",
      "mistral:magistral-small-latest": "No verified exact-model rate or confirmed public API alias. Add an explicit rate and binding to estimate this model.",
      "mistral:voxtral-small-2507": "No verified exact-model rate or confirmed public API alias. Add an explicit rate and binding to estimate this model.",
      "mistral:voxtral-small-latest": "No verified exact-model rate or confirmed public API alias. Add an explicit rate and binding to estimate this model.",
      "codex:gpt-6-sol": "No verified exact-model rate or confirmed public API alias. Add an explicit rate and binding to estimate this model.",
      "codex:gpt-5.6-terra": "No verified exact-model rate or confirmed public API alias. Add an explicit rate and binding to estimate this model.",
      "codex:gpt-5.6-luna": "No verified exact-model rate or confirmed public API alias. Add an explicit rate and binding to estimate this model.",
      "codex:gpt-daybreak-blue-latest": "No verified exact-model rate or confirmed public API alias. Add an explicit rate and binding to estimate this model.",
      "antigravity:chat_20706": "No verified exact-model rate or confirmed public API alias. Add an explicit rate and binding to estimate this model.",
      "antigravity:gpt-oss-120b-medium": "No verified exact-model rate or confirmed public API alias. Add an explicit rate and binding to estimate this model.",
      "antigravity:tab_jump_flash_lite_preview": "No verified exact-model rate or confirmed public API alias. Add an explicit rate and binding to estimate this model.",
      "antigravity:tab_flash_lite_preview": "No verified exact-model rate or confirmed public API alias. Add an explicit rate and binding to estimate this model.",
      "antigravity:chat_23310": "No verified exact-model rate or confirmed public API alias. Add an explicit rate and binding to estimate this model.",
      "antigravity:gemini-3-flash": "No verified exact-model rate or confirmed public API alias. Add an explicit rate and binding to estimate this model.",
      "antigravity:gemini-3.1-flash-image": "No verified exact-model rate or confirmed public API alias. Add an explicit rate and binding to estimate this model."
},
    rates: {
      'openai:gpt-6.1-sol': rate(2, 0.1, 10, openai, { cacheWrite: 2.5, basis: 'Configured standard API equivalent; matches retrieved official standard table.' }),
      'openai:gpt-6-astra': rate(10, 1, 50, openai, { cacheWrite: 12.5 }),
      'openai:gpt-6.1-terra': rate(1, 0.05, 5, openai, { cacheWrite: 1.25 }),
      'openai:gpt-6-luna': rate(0.1, 0.01, 0.5, openai, { cacheWrite: 0.125 }),
      'openai:gpt-5.6-sol': rate(4, 0.4, 20, openai, { cacheWrite: 5 }),
      'google:gemini-3.8-flash': rate(0.75, 0.075, 3.75, google, { validBefore: '2027-01-01T00:00:00Z', basis: 'Text/image/video promotion through 2026-12-31; excludes cache storage.' }),
      'google:gemini-3.5-flash-lite': rate(0.3, 0.03, 2.5, google),
      'google:gemini-2.5-flash': rate(0.3, 0.03, 2.5, google),
      'google:gemini-2.5-flash-lite': rate(0.1, 0.01, 0.4, google),
      'google:gemini-3.1-flash-lite': rate(0.25, 0.025, 1.5, google),
      'google:gemini-2.5-pro': rate(1.25, 0.125, 10, google, { longContext: { aboveInputTokens: 200_000, input: 2.5, cachedInput: 0.25, output: 15 } }),
      'anthropic:claude-sonnet-4-6': rate(3, 0.3, 15, anthropic, { cacheWrite: 3.75 }),
      'anthropic:claude-opus-4-6': rate(5, 0.5, 25, anthropic, { cacheWrite: 6.25 }),
      'mistral:ministral-14b-2512': rate(0.2, 0.02, 0.2, 'https://docs.mistral.ai/inference/pricing'),
      'mistral:ministral-8b-2512': rate(0.15, 0.015, 0.15, 'https://docs.mistral.ai/inference/pricing'),
      'mistral:ministral-3b-2512': rate(0.1, 0.01, 0.1, 'https://docs.mistral.ai/inference/pricing'),
      'mistral:codestral-2508': rate(0.3, 0.03, 0.9, 'https://docs.mistral.ai/inference/pricing'),
      'mistral:zai-glm-5-3': rate(1.4, 0.14, 4.4, 'https://docs.mistral.ai/inference/pricing'),
      'mistral:zai-glm-5-3-flash': rate(0.15, 0.03, 0.5, 'https://docs.mistral.ai/inference/pricing'),
      'mistral:mistral-large-4': rate(0.7, 0.07, 2.1, 'https://docs.mistral.ai/inference/pricing'),
      'deepseek:deepseek-flash': rate(0.15, 0.003, 0.6, 'https://api-docs.deepseek.com/quick_start/pricing', { basis: 'Off-peak direct API equivalent; gateway charges may differ.' }),
      'deepseek:deepseek-v4-pro': rate(0.66, 0.022, 1.98, 'https://api-docs.deepseek.com/quick_start/pricing', { basis: 'Off-peak direct API equivalent; gateway charges may differ.' }),
    },
  }
}

export function validateApiEquivalentConfig(config) {
  const object = value => value !== null && typeof value === 'object' && !Array.isArray(value)
  const number = value => typeof value === 'number' && Number.isFinite(value) && value >= 0
  const validRate = value => object(value) && number(value.input) && number(value.output)
    && ['cachedInput', 'cacheWrite'].every(key => value[key] === undefined || number(value[key]))
  if (!object(config) || typeof config.enabled !== 'boolean' || !object(config.bindings) || !object(config.rates)) return false
  if (config.unpricedModels !== undefined && (!object(config.unpricedModels) || Object.values(config.unpricedModels).some(value => typeof value !== 'string'))) return false
  if (Object.keys(config.rates).length > 2000 || Object.keys(config.bindings).length > 2000) return false
  if (!Object.values(config.rates).every(value => validRate(value)
    && (value.validBefore === undefined || typeof value.validBefore === 'string' && Number.isFinite(Date.parse(value.validBefore)))
    && (value.longContext === undefined || validRate(value.longContext) && number(value.longContext.aboveInputTokens)))) return false
  return Object.entries(config.bindings).every(([key, target]) => key.length <= 512 && key.indexOf(':') > 0 && typeof target === 'string' && Object.hasOwn(config.rates, target))
}

/** Input/cache buckets are disjoint; output already includes reasoning. USD / 1M. */
export function estimateApiEquivalent(usage, config, now = Date.now()) {
  if (config?.enabled !== true) return null
  if (!validateApiEquivalentConfig(config)) return { usd: 0, complete: false, approximate: true, missing: ['invalid estimate settings'] }
  const timed = usage?.deepseekPricing
  let usd = timed?.usd ?? 0, approximate = false, represented = 0
  const missing = []
  const amount = value => typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : 0
  for (const [key, bucket] of Object.entries(usage?.byProviderModel ?? {})) {
    const input = amount(bucket.input), cachedInput = amount(bucket.cacheRead), cacheWrite = amount(bucket.cacheWrite), output = amount(bucket.output)
    represented += input + cachedInput + cacheWrite + output
    if (input + cachedInput + cacheWrite + output === 0) continue
    if (deepseekRateKey(key, config)) {
      if (!timed) missing.push(key + ' (timing unavailable)')
      continue
    }
    const base = config.rates[config.bindings[key]]
    if (!base || base.validBefore && now >= Date.parse(base.validBefore)) { missing.push(key); continue }
    // Aggregated session data cannot recover per-call tier crossings. Disclose
    // that approximation instead of representing this as recorded spend.
    if (base.longContext && amount(bucket.calls) > 1) approximate = true
    const rate = base.longContext && input + cachedInput + cacheWrite > base.longContext.aboveInputTokens ? { ...base, ...base.longContext } : base
    usd += (input * rate.input + cachedInput * (rate.cachedInput ?? rate.input) + cacheWrite * (rate.cacheWrite ?? rate.input) + output * rate.output) / 1_000_000
  }
  if (amount(usage?.input) + amount(usage?.output) + amount(usage?.cacheRead) + amount(usage?.cacheWrite) > represented) missing.push('usage without route/model breakdown')
  if (timed && !timed.complete) missing.push('DeepSeek timing/rate unavailable (' + timed.unknownCalls + ' calls)')
  return { usd, complete: missing.length === 0, approximate, missing: missing.sort(), ...(timed ? { deepseekPricing: timed } : {}) }
}

export function formatApiEquivalent(estimate, money = value => '$' + value.toFixed(4)) {
  if (estimate === null) return ''
  if (!estimate.complete && estimate.usd === 0) return 'API-equivalent price unavailable (not billed)'
  return 'API-equivalent ≈ ' + money(estimate.usd) + (estimate.complete ? '' : ' + unpriced usage') + (estimate.approximate ? ' · aggregate tier estimate' : '') + ' (not billed)'
}

/** Official Beijing schedule; timestamps are request starts, never the viewing clock. */
export function deepseekPhaseAt(atMs) {
  if (!Number.isFinite(atMs) || atMs <= 0 || atMs < Date.parse('2026-08-16T16:00:00Z')) return null
  const date = new Date(atMs + 8 * 3600000)
  if (!Number.isFinite(date.getTime())) return null
  const day = date.toISOString().slice(0, 10)
  const holidays = ['2026-09-25','2026-09-26','2026-09-27','2026-10-01','2026-10-02','2026-10-03','2026-10-04','2026-10-05','2026-10-06','2026-10-07']
  if (atMs >= Date.parse('2026-08-22T16:00:00Z') && (date.getUTCDay() === 0 || date.getUTCDay() === 6) || holidays.includes(day)) return 'offPeak'
  const hour = date.getUTCHours()
  return hour >= 9 && hour < 12 || hour >= 14 && hour < 18 ? 'peak' : 'offPeak'
}

export function deepseekRateKey(route, config) {
  const bound = config?.bindings?.[route]
  if (['deepseek:deepseek-flash','deepseek:deepseek-v4-pro'].includes(bound)) return bound
  if (/^deepseek-(?:official|account):(?:deepseek-flash|deepseek-v4-flash|deepseek-v4-flash-vision-exp)$/.test(route)) return 'deepseek:deepseek-flash'
  if (/^deepseek-(?:official|account):deepseek-v4-pro$/.test(route)) return 'deepseek:deepseek-v4-pro'
  return null
}

export function timedDeepseekEstimate(samples, config) {
  const empty = () => ({ usd: 0, calls: 0, tokens: 0, input: 0, cacheRead: 0, cacheWrite: 0, output: 0 })
  const summary = { usd: 0, complete: true, unknownCalls: 0, peak: empty(), offPeak: empty() }
  for (const sample of samples ?? []) {
    if (sample.seed) continue
    const key = deepseekRateKey(`${sample.provider}:${sample.model}`, config)
    if (!key) continue
    const phase = deepseekPhaseAt(sample.pricedAtMs ?? sample.atMs), rate = config?.rates?.[key]
    if (!phase || !rate || !['input','output'].every(k => Number.isFinite(rate[k]) && rate[k] >= 0)) { summary.complete = false; summary.unknownCalls++; continue }
    const b = sample.buckets ?? {}, row = summary[phase]
    const amount = k => Number.isFinite(b[k]) && b[k] > 0 ? b[k] : 0
    const factor = phase === 'peak' ? 2 : 1
    const usd = factor * (amount('input') * rate.input + amount('cacheRead') * (rate.cachedInput ?? rate.input) + amount('cacheWrite') * (rate.cacheWrite ?? rate.input) + amount('output') * rate.output) / 1e6
    row.usd += usd; row.calls++
    for (const k of ['input','cacheRead','cacheWrite','output']) { row[k] += amount(k); row.tokens += amount(k) }
    summary.usd += usd
  }
  return summary
}

export function decodeDeepseekPricing(value) {
  if (value === undefined) return undefined
  const number = n => typeof n === 'number' && Number.isFinite(n) && n >= 0
  if (!value || typeof value.complete !== 'boolean' || !number(value.usd) || !number(value.unknownCalls)) throw new Error('Invalid DeepSeek timing summary')
  const result = { usd: value.usd, complete: value.complete, unknownCalls: value.unknownCalls }
  for (const phase of ['peak','offPeak']) {
    const row = value[phase]
    if (!row || !['usd','calls','tokens','input','cacheRead','cacheWrite','output'].every(k => number(row[k]))) throw new Error('Invalid DeepSeek timing bucket')
    result[phase] = Object.fromEntries(['usd','calls','tokens','input','cacheRead','cacheWrite','output'].map(k => [k,row[k]]))
  }
  return result
}

export function mergeDeepseekPricing(a, b) {
  if (!a) return b
  if (!b) return a
  const result = { usd: a.usd+b.usd, complete: a.complete && b.complete, unknownCalls: a.unknownCalls+b.unknownCalls }
  for (const phase of ['peak','offPeak']) result[phase] = Object.fromEntries(Object.keys(a[phase]).map(k => [k,a[phase][k]+b[phase][k]]))
  return result
}

export function formatDeepseekUsage(timed, money = value => '$' + value.toFixed(4)) {
  if (!timed || !timed.peak.calls && !timed.offPeak.calls && timed.complete) return ''
  const compact = n => n >= 1e9 ? (n/1e9).toFixed(2)+'B' : n >= 1e6 ? (n/1e6).toFixed(2)+'M' : n >= 1e3 ? (n/1e3).toFixed(1)+'k' : String(n)
  return 'DeepSeek · ' + ['peak','offPeak'].map(phase => (phase === 'peak' ? 'Peak ' : 'Off-peak ') + money(timed[phase].usd) + ' · ' + timed[phase].calls + ' calls · ' + compact(timed[phase].tokens) + ' tokens').join(' | ') + (timed.complete ? '' : ' · timing incomplete')
}
