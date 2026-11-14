# DeepSeek Harness 0.2.2-rc.3 compatibility

Version 1.9.39-english.20261114.rc3.1 retains the English BharatCode fork, explicit API-equivalent estimates, request-start peak/off-peak pricing, and all-session historical totals. The RC3 chain slot now supplies its required identity selector, matching upstream's 1.9.41 startup fix. The build preserves this selector in its source bundle base.

Upstream dsh-cost-meter 1.9.65 was discovered on 2026-11-14. This custom package is still based on 1.9.39; later upstream features and fixes are not represented as merged. Replacing the bundles with 1.9.65 would lose the local timed-pricing and historical RPC/UI additions. Porting that overlay is a separate migration.

Verification: build, 30 tests using the built 0.2.2-rc.3 checkout, including actual browser formatter/codec, schema roundtrips, synthetic session histories, and real RC3 SlotCore registration. Run `DSH_SOURCE=/path/to/built/harness npm test`. No private audit fixtures are shipped.
