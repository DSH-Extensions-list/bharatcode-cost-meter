/** Editor embedded into the existing Prices catalogue; uses its draft/save flow. */
export function createApiEquivalentSettings(React, defaults, validate) {
  const { createElement: el, useState, useEffect } = React
  return function ApiEquivalentSettings({ state, draft, setDraft, locale }) {
    const config = draft?.prices?.apiEquivalent ?? state?.config?.prices?.apiEquivalent ?? defaults()
    const [text, setText] = useState(() => JSON.stringify(config, null, 2))
    const [error, setError] = useState('')
    useEffect(() => { setText(JSON.stringify(config, null, 2)) }, [JSON.stringify(config)])
    const apply = () => {
      try {
        const value = JSON.parse(text)
        if (!validate(value)) throw new Error('Use enabled:boolean, exact provider:model bindings and non-negative input/output rates in USD per million tokens.')
        if (!draft || !setDraft) throw new Error('Wait for the settings draft to load.')
        setDraft({ ...draft, prices: { ...draft.prices, apiEquivalent: value } })
        setError('')
      } catch (caught) { setError(String(caught.message ?? caught)) }
    }
    return el('details', { className: 'cm-api-equivalent-settings', style: { marginBottom: 16 } },
      el('summary', null, locale === 'zh' ? 'API 等价估算（非实际账单）' : 'API-equivalent estimates (not actual charges)'),
      el('p', { className: 'cm-note' }, 'Show a separate session estimate at explicit model rates. Subscription spend, quota, budgets and recorded costs stay unchanged. Unknown models remain unpriced. Input/cache buckets are disjoint; output includes reasoning. Rates are USD per 1,000,000 tokens. Audio, generated images, tools, cache storage, service tiers and regional surcharges are excluded.'),
      el('label', null, el('input', { type: 'checkbox', checked: config.enabled === true, disabled: !draft, onChange: event => setDraft({ ...draft, prices: { ...draft.prices, apiEquivalent: { ...config, enabled: event.target.checked } } }) }), ' Show API-equivalent session estimate'),
      el('p', null, 'Edit exact route bindings and per-model rates below. Apply to draft, then use the settings Save button. No model request or runtime reload is required.'),
      el('textarea', { 'aria-label': 'API-equivalent model rates and bindings (JSON)', value: text, onChange: event => setText(event.target.value), rows: 16, spellCheck: false, style: { width: '100%', boxSizing: 'border-box', fontFamily: 'monospace' } }),
      el('button', { type: 'button', disabled: !draft, onClick: apply }, 'Apply estimate rates to draft'),
      error ? el('p', { role: 'alert' }, error) : null)
  }
}
