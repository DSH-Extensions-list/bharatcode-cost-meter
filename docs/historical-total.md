# Retrospective total in the cost plugin

Settings → Cost → Overview shows a separately labelled historical API-equivalent total for the saved 81-session scope (including 31 archived sessions). Its visible total includes all reconstructed usage in those main sessions and their descendants, without counting any descendant or inherited seed call twice. DeepSeek calls use their request-start peak/off-peak phase. Other models use exact configured API-equivalent reference rates. Fixed search/fetch request fees use recorded tariffs and conversion. The total identifies calls with missing model rates or histories.

The card shows the recalculation time in Asia/Kolkata, included call/token and descendant counts, unpriced calls, and an expandable DeepSeek timing split and per-session table. Recalculate refreshes all saved sessions from canonical metadata. A rate edit marks the saved estimate stale until recalculated. The total is a saved snapshot, not a live spend meter.

The explicit scope and latest result live in the private file `<ledger>.historical-estimate.json`. They are separate from the ordinary charge ledger. The host APIs `getHistoricalEstimate` and `recalculateHistoricalEstimate` read and rebuild the scoped result. The plugin's existing metadata cache is reused. Raw conversation bodies are not written into the estimate file. A temporary file is atomically renamed only after calculation and schema validation; failed recalculation retains the earlier saved result.

The same original 81-session scope remains selected even if unrelated new sessions are subsequently created. Descendants are discovered again at each recalculation. User-directed scope changes can replace the saved scope manifest; reading the summary does not change it.
