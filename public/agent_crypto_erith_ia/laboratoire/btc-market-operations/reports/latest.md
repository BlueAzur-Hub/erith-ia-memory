# Seven Heaven — suivi public BTC : 2026-11-17T04:01:12Z

**Statut : OPERATIONAL_PARTIAL_COVERAGE** — lecture seule, couverture partielle documentée, aucune exécution réelle.

Fenêtre UTC : 2026-11-16T04:01:12Z au 2026-11-17T04:01:12Z.

## Santé et provenance

- **OKX Spot BTC-USDC 1H** : 23 bougies clôturées dans cette fenêtre ; dernière bougie 2026-11-17T03:00:00Z ; source fraîche : OUI.
- **Liquidations dérivées** : 31 messages observés dans les archives ; 9 fenêtres de connexion par fournisseur (les périodes sans connexion sont inconnues, **pas des liquidations nulles**).
- **Actualités de l'Interface** : 14 événements BTC ; relevé source 2026-11-16T22:33:57.015830+00:00.

| Source dérivés | Messages observés | Fenêtres de connexion |
|---|---:|---:|
| bybit | 6 | 3 |
| binance | 19 | 3 |
| okx | 6 | 3 |

## Interprétation autorisée

Ce rapport constate des **coïncidences temporelles** quand des données sont présentes. Il ne déduit aucune vente Spot d’une liquidation sur dérivés et ne prouve **aucune causalité** des articles.

Les montants OKX en contrats ne sont pas convertis en USDT sans multiplicateur vérifié. Les messages Bybit/Binance ne constituent pas un total mondial.

## Dernières heures Spot archivées

| UTC | Ouverture (USDC) | Clôture (USDC) | Volume Spot BTC | Messages de liquidations observés | Couverture |
|---|---:|---:|---:|---:|---|
| 2026-11-16T16:00:00Z | 64417.1 | 64877.1 | 33.5674469 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-16T17:00:00Z | 64873.2 | 64856.4 | 39.45015961 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-16T18:00:00Z | 64847.1 | 64997.2 | 79.36534081 | 7 | SAMPLED_WITH_GAPS |
| 2026-11-16T19:00:00Z | 65000 | 65019.3 | 28.13713056 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-16T20:00:00Z | 65017.5 | 65025.2 | 30.77181506 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-16T21:00:00Z | 65025.2 | 65251.8 | 29.04955301 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-16T22:00:00Z | 65251.8 | 65274.7 | 17.76780225 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-16T23:00:00Z | 65274.6 | 64828.1 | 24.17582774 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-17T00:00:00Z | 64828.3 | 64580.3 | 22.42401344 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-17T01:00:00Z | 64582.9 | 64701.1 | 22.16090157 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-17T02:00:00Z | 64689.1 | 64457.6 | 13.10573632 | 0 | SAMPLED_WITH_GAPS |
| 2026-11-17T03:00:00Z | 64457.8 | 65005.5 | 19.33148254 | 0 | NO_DOCUMENTED_OBSERVATION |

## Étude de stratégie — structure EMA 5/13/34 (observation, pas backtest)

- Source : OKX Spot BTC-USDC 1H ; 71 bougies consécutives du 2026-11-14T05:00:00Z au 2026-11-17T03:00:00Z.
- Dernière clôture : 65005.5 USDC/BTC ; EMA 5 : 64799.39 ; EMA 13 : 64811.84 ; EMA 34 : 64864.81 USDC.
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
