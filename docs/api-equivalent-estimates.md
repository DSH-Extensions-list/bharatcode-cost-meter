# Session API-equivalent estimates

The session line can show `API-equivalent ≈ $… (not billed)` instead of an unavailable token-price display. This estimates what the recorded token usage would cost at explicitly configured model API rates. It does not convert a ChatGPT/Codex, Antigravity, Muse, or other subscription into actual API charges. Recorded `cost`, `apiCost`, quota accounting, reconciliation and budgets retain their existing behavior.

Open **Cost settings → Prices → mounted price catalogue → API-equivalent estimates**. The estimate checkbox and JSON editor use the existing draft and Save flow. `prices.apiEquivalent.enabled` enables the separate display. `bindings` maps exact `provider:model` route IDs to exact entries in `rates`; `unpricedModels` lists the configured catalogue IDs for which no safe default rate was established. Add a verified or explicitly user-configured rate and a binding to cover another model. Unknown models show “price unavailable” or “+ unpriced usage”; no fuzzy model substitution is used.

Rates are **USD per 1,000,000 tokens**. `input` means uncached input. `cachedInput` prices the separate cache-read bucket; `cacheWrite` prices the separate cache-write bucket and defaults to uncached input when absent. `output` includes reasoning tokens, so the reasoning counter is not charged again. A separate reasoning surcharge is not inferred. A `longContext` tier can specify `aboveInputTokens` and its full input/output rates. Because session buckets aggregate calls, a tiered estimate spanning several calls is explicitly labeled “aggregate tier estimate”; it cannot recover each original request's tier boundary.

Example custom rates (illustrative only; enter the actual route's tariff):

```json
{
  "enabled": true,
  "bindings": {"your-provider:your-model": "custom:your-model"},
  "rates": {"custom:your-model": {"input": 2, "cachedInput": 0.1, "cacheWrite": 2.5, "output": 10}}
}
```

The source defaults verified on 2026-11-01 cover OpenAI Sol 6.1, Astra 6, Terra 6.1, Luna 6 and Sol 5.6; selected Gemini text models and Claude 4.6 models under explicit Antigravity aliases; exact Mistral Large 4, Codestral 2508, Ministral 3 and Z.ai GLM 5.3 models with documented aliases; and direct DeepSeek Flash/Pro API equivalents. BharatCode Flash uses a **DeepSeek direct off-peak equivalent**, not an assertion about BharatCode billing. Its Qwen rate remains unknown. Gemini 3.8 promotional rates expire on 2027-01-01 and then become unpriced until updated.

The remaining catalogue IDs, including ambiguous internal Google IDs, older GPT aliases, Muse and unverified Mistral aliases, have no guessed default. Current coverage and sources are recorded in `docs/pricing-coverage.json`. OpenAI's configured Sol 6.1 rate matches the retrieved official standard rate; the existing ledger's configuration was used only to establish the earlier defect and was not copied or published.

Sources:

- https://developers.openai.com/api/docs/pricing
- https://ai.google.dev/gemini-api/docs/pricing
- https://platform.claude.com/docs/en/about-claude/pricing
- https://api-docs.deepseek.com/quick_start/pricing
- https://docs.mistral.ai/inference/pricing

These are text-token API equivalents. Audio, generated images, tools/search, cache storage time, priority/fast/batch service tiers, regional surcharges, subscription allocation and gateway discounts are excluded. Cache-write defaults use OpenAI's 30-minute write or Anthropic's 5-minute write where configured; the usage buckets do not identify the actual retention option. Review the source and actual provider tariff before relying on an estimate.

This repository started as the preserved installed English package mirror, not a complete upstream source checkout. `lib/api-equivalent-pricing.js` and `src/client/api-equivalent-settings.js` are the readable new implementation. `node scripts/build-api-equivalent.mjs` reproducibly injects these additions into narrow, checked seams of the preserved client bundles, without replacing earlier English customizations. It rejects changed seams and bundles above the existing 262,144-byte bound. The original full upstream build/verification scripts were absent from the mirror and have not been recreated. The included `node --test test/*.test.mjs` suite exercises the estimator, real shipped browser factory, editor draft flow, config patch/sanitization and strict host wire codec.

No running profile, live price table, ledger, worker, or model session was modified while preparing this release. Once the updated package is loaded during a separately authorized installation, pricing-only edits use the existing live `costMeter.updateConfig` path and do not require a profile reload. Historical actual amounts are not repriced by this estimate display.

Coverage at preparation: 32 exact configured route IDs priced through 22 canonical API-equivalent rates; 39 route IDs explicitly lack an established rate/alias. Mistral exact identifiers and supported latest aliases were cross-checked against the official model-card links on its pricing page. The JSON inventory is a preparation snapshot; after adding your own binding, its older unpricedModels note can be removed.
