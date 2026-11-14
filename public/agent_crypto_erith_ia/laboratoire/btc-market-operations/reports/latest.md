# Seven Heaven — suivi public BTC : 2026-11-14T21:37:02Z

**Statut : DEGRADED_OR_UNVERIFIED** — lecture seule, couverture partielle documentée, aucune exécution réelle.

Fenêtre UTC : 2026-11-13T21:37:02Z au 2026-11-14T21:37:02Z.

## Santé et provenance

- **OKX Spot BTC-USDC 1H** : 23 bougies clôturées dans cette fenêtre ; dernière bougie 2026-11-14T20:00:00Z ; source fraîche : OUI.
- **Liquidations dérivées** : 25 messages observés dans les archives ; 12 fenêtres de connexion par fournisseur (les périodes sans connexion sont inconnues, **pas des liquidations nulles**).
- **Actualités de l'Interface** : 7 événements BTC ; relevé source 2026-11-14T19:31:01.174615+00:00.

| Source dérivés | Messages observés | Fenêtres de connexion |
|---|---:|---:|
| bybit | 7 | 4 |
| binance | 17 | 4 |
| okx | 1 | 4 |

## Interprétation autorisée

Ce rapport constate des **coïncidences temporelles** quand des données sont présentes. Il ne déduit aucune vente Spot d’une liquidation sur dérivés et ne prouve **aucune causalité** des articles.

Les montants OKX en contrats ne sont pas convertis en USDT sans multiplicateur vérifié. Les messages Bybit/Binance ne constituent pas un total mondial.

## Dernières heures Spot archivées

| UTC | Ouverture (USDC) | Clôture (USDC) | Volume Spot BTC | Messages de liquidations observés | Couverture |
|---|---:|---:|---:|---:|---|
| 2026-11-14T09:00:00Z | 66949.7 | 67374 | 23.08902497 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-14T10:00:00Z | 67361.6 | 67240 | 12.73969435 | 0 | SAMPLED_WITH_GAPS |
| 2026-11-14T11:00:00Z | 67250.9 | 67234.9 | 13.70549599 | 0 | SAMPLED_WITH_GAPS |
| 2026-11-14T12:00:00Z | 67234.8 | 66961.5 | 16.01984131 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-14T13:00:00Z | 66963.4 | 66801.1 | 100.41471361 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-14T14:00:00Z | 66801.1 | 65880.6 | 155.70283984 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-14T15:00:00Z | 65879.7 | 65708.5 | 265.41330984 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-14T16:00:00Z | 65708.6 | 65329.6 | 93.35697975 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-14T17:00:00Z | 65316.3 | 65870 | 66.15583438 | 6 | SAMPLED_WITH_GAPS |
| 2026-11-14T18:00:00Z | 65860 | 65515.9 | 41.12931537 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-14T19:00:00Z | 65523.8 | 65691.9 | 35.81888056 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-14T20:00:00Z | 65700.7 | 64728.1 | 147.50635208 | 0 | NO_DOCUMENTED_OBSERVATION |

## Étude de stratégie — structure EMA 5/13/34 (observation, pas backtest)

- Source : OKX Spot BTC-USDC 1H ; 71 bougies consécutives du 2026-11-11T22:00:00Z au 2026-11-14T20:00:00Z.
- Dernière clôture : 64728.1 USDC/BTC ; EMA 5 : 65422.88 ; EMA 13 : 66095.13 ; EMA 34 : 67461.97 USDC.
- Structure horaire observée : **ALIGNEMENT_BAISSIER_HORAIRE**.
- **Stratégie Swing Trading NON validée** : cet échantillon horaire ne démontre ni rentabilité, ni règles de sortie, ni tenue sur plusieurs jours. Aucun conseil d'achat ou de vente.

## Restrictions

- GitHub cron may be delayed or dropped; no 24/7 claim
- Derivatives subscriptions are partial or venue-sampled; not market totals
- No recorded feed event does not imply no liquidation
- News event timestamp is not proof of a price catalyst
- Exchange original market samples not cryptographically signed
- Spot quote USDC is not derivatives notional USDT
- Not personal financial advice and never an order

Fichiers sources : `../spot-hourly/`, `../../liquidation-monitor/observations/` et `../../../data/news/latest.json`.
