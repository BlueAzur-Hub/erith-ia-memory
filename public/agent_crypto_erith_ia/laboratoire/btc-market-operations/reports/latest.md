# Seven Heaven — suivi public BTC : 2026-11-15T21:56:17Z

**Statut : OPERATIONAL_PARTIAL_COVERAGE** — lecture seule, couverture partielle documentée, aucune exécution réelle.

Fenêtre UTC : 2026-11-14T21:56:17Z au 2026-11-15T21:56:17Z.

## Santé et provenance

- **OKX Spot BTC-USDC 1H** : 23 bougies clôturées dans cette fenêtre ; dernière bougie 2026-11-15T20:00:00Z ; source fraîche : OUI.
- **Liquidations dérivées** : 236 messages observés dans les archives ; 12 fenêtres de connexion par fournisseur (les périodes sans connexion sont inconnues, **pas des liquidations nulles**).
- **Actualités de l'Interface** : 2 événements BTC ; relevé source 2026-11-15T18:00:41.903911+00:00.

| Source dérivés | Messages observés | Fenêtres de connexion |
|---|---:|---:|
| bybit | 137 | 4 |
| binance | 45 | 4 |
| okx | 54 | 4 |

## Interprétation autorisée

Ce rapport constate des **coïncidences temporelles** quand des données sont présentes. Il ne déduit aucune vente Spot d’une liquidation sur dérivés et ne prouve **aucune causalité** des articles.

Les montants OKX en contrats ne sont pas convertis en USDT sans multiplicateur vérifié. Les messages Bybit/Binance ne constituent pas un total mondial.

## Dernières heures Spot archivées

| UTC | Ouverture (USDC) | Clôture (USDC) | Volume Spot BTC | Messages de liquidations observés | Couverture |
|---|---:|---:|---:|---:|---|
| 2026-11-15T09:00:00Z | 65187.4 | 65319.9 | 139.13452119 | 1 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-15T10:00:00Z | 65323.3 | 65570.4 | 44.96092383 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-15T11:00:00Z | 65570.4 | 65324.9 | 40.24181053 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-15T12:00:00Z | 65333.3 | 65486.2 | 42.76692274 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-15T13:00:00Z | 65475.9 | 65440 | 48.89941126 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-15T14:00:00Z | 65414.2 | 64736.3 | 65.59794983 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-15T15:00:00Z | 64750.5 | 64732.6 | 35.53179261 | 2 | SAMPLED_WITH_GAPS |
| 2026-11-15T16:00:00Z | 64727.4 | 64685 | 51.67824137 | 0 | SAMPLED_WITH_GAPS |
| 2026-11-15T17:00:00Z | 64691.4 | 64543.4 | 50.1360421 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-15T18:00:00Z | 64543.5 | 64716 | 29.55683834 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-15T19:00:00Z | 64716 | 64930 | 34.72991835 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-15T20:00:00Z | 64930.1 | 65116.9 | 21.33655413 | 0 | NO_DOCUMENTED_OBSERVATION |

## Étude de stratégie — structure EMA 5/13/34 (observation, pas backtest)

- Source : OKX Spot BTC-USDC 1H ; 71 bougies consécutives du 2026-11-12T22:00:00Z au 2026-11-15T20:00:00Z.
- Dernière clôture : 65116.9 USDC/BTC ; EMA 5 : 64915.25 ; EMA 13 : 64907.6 ; EMA 34 : 65401.44 USDC.
- Structure horaire observée : **STRUCTURE_HORAIRE_MIXTE**.
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
