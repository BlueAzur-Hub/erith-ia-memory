# Seven Heaven — suivi public BTC : 2026-11-16T20:35:56Z

**Statut : OPERATIONAL_PARTIAL_COVERAGE** — lecture seule, couverture partielle documentée, aucune exécution réelle.

Fenêtre UTC : 2026-11-15T20:35:56Z au 2026-11-16T20:35:56Z.

## Santé et provenance

- **OKX Spot BTC-USDC 1H** : 23 bougies clôturées dans cette fenêtre ; dernière bougie 2026-11-16T19:00:00Z ; source fraîche : OUI.
- **Liquidations dérivées** : 41 messages observés dans les archives ; 12 fenêtres de connexion par fournisseur (les périodes sans connexion sont inconnues, **pas des liquidations nulles**).
- **Actualités de l'Interface** : 7 événements BTC ; relevé source 2026-11-16T12:06:58.867794+00:00.

| Source dérivés | Messages observés | Fenêtres de connexion |
|---|---:|---:|
| bybit | 7 | 4 |
| binance | 22 | 4 |
| okx | 12 | 4 |

## Interprétation autorisée

Ce rapport constate des **coïncidences temporelles** quand des données sont présentes. Il ne déduit aucune vente Spot d’une liquidation sur dérivés et ne prouve **aucune causalité** des articles.

Les montants OKX en contrats ne sont pas convertis en USDT sans multiplicateur vérifié. Les messages Bybit/Binance ne constituent pas un total mondial.

## Dernières heures Spot archivées

| UTC | Ouverture (USDC) | Clôture (USDC) | Volume Spot BTC | Messages de liquidations observés | Couverture |
|---|---:|---:|---:|---:|---|
| 2026-11-16T08:00:00Z | 64934.3 | 64415.2 | 37.72069018 | 24 | SAMPLED_WITH_GAPS |
| 2026-11-16T09:00:00Z | 64415.3 | 64285.1 | 33.85211654 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-16T10:00:00Z | 64301.2 | 64528.1 | 22.41907742 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-16T11:00:00Z | 64539.9 | 64394.3 | 21.02746882 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-16T12:00:00Z | 64394.8 | 64114.3 | 47.40112889 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-16T13:00:00Z | 64104.8 | 64134 | 83.42003084 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-16T14:00:00Z | 64134 | 65122.2 | 147.82156172 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-16T15:00:00Z | 65131.5 | 64428 | 139.69420167 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-16T16:00:00Z | 64417.1 | 64877.1 | 33.5674469 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-16T17:00:00Z | 64873.2 | 64856.4 | 39.45015961 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-16T18:00:00Z | 64847.1 | 64997.2 | 79.36534081 | 7 | SAMPLED_WITH_GAPS |
| 2026-11-16T19:00:00Z | 65000 | 65019.3 | 28.13713056 | 0 | NO_DOCUMENTED_OBSERVATION |

## Étude de stratégie — structure EMA 5/13/34 (observation, pas backtest)

- Source : OKX Spot BTC-USDC 1H ; 71 bougies consécutives du 2026-11-13T21:00:00Z au 2026-11-16T19:00:00Z.
- Dernière clôture : 65019.3 USDC/BTC ; EMA 5 : 64877.56 ; EMA 13 : 64746.68 ; EMA 34 : 64913.56 USDC.
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
