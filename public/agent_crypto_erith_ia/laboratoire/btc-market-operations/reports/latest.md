# Seven Heaven — suivi public BTC : 2026-11-18T04:36:34Z

**Statut : DEGRADED_OR_UNVERIFIED** — lecture seule, couverture partielle documentée, aucune exécution réelle.

Fenêtre UTC : 2026-11-17T04:36:34Z au 2026-11-18T04:36:34Z.

## Santé et provenance

- **OKX Spot BTC-USDC 1H** : 23 bougies clôturées dans cette fenêtre ; dernière bougie 2026-11-18T03:00:00Z ; source fraîche : OUI.
- **Liquidations dérivées** : 8 messages observés dans les archives ; 9 fenêtres de connexion par fournisseur (les périodes sans connexion sont inconnues, **pas des liquidations nulles**).
- **Actualités de l'Interface** : 14 événements BTC ; relevé source 2026-11-18T03:54:21.570287+00:00.

| Source dérivés | Messages observés | Fenêtres de connexion |
|---|---:|---:|
| bybit | 1 | 3 |
| binance | 6 | 3 |
| okx | 1 | 3 |

## Interprétation autorisée

Ce rapport constate des **coïncidences temporelles** quand des données sont présentes. Il ne déduit aucune vente Spot d’une liquidation sur dérivés et ne prouve **aucune causalité** des articles.

Les montants OKX en contrats ne sont pas convertis en USDT sans multiplicateur vérifié. Les messages Bybit/Binance ne constituent pas un total mondial.

## Dernières heures Spot archivées

| UTC | Ouverture (USDC) | Clôture (USDC) | Volume Spot BTC | Messages de liquidations observés | Couverture |
|---|---:|---:|---:|---:|---|
| 2026-11-17T16:00:00Z | 64052.8 | 63692.7 | 58.82658624 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-17T17:00:00Z | 63688.9 | 63774.5 | 47.70453528 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-17T18:00:00Z | 63775.7 | 63713.4 | 15.40816714 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-17T19:00:00Z | 63705.4 | 63695.9 | 32.38276997 | 0 | SAMPLED_WITH_GAPS |
| 2026-11-17T20:00:00Z | 63696 | 63922.8 | 27.68451438 | 0 | SAMPLED_WITH_GAPS |
| 2026-11-17T21:00:00Z | 63938.3 | 64308.8 | 75.23180407 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-17T22:00:00Z | 64297.5 | 64670.2 | 50.84161449 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-17T23:00:00Z | 64670.2 | 64887.8 | 83.47958668 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-18T00:00:00Z | 64884.1 | 64732.3 | 8.76456565 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-18T01:00:00Z | 64738 | 64248.9 | 11.34732297 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-18T02:00:00Z | 64248.9 | 64266.3 | 8.59699688 | 4 | SAMPLED_WITH_GAPS |
| 2026-11-18T03:00:00Z | 64267.7 | 64393.8 | 5.79705635 | 0 | NO_DOCUMENTED_OBSERVATION |

## Étude de stratégie — structure EMA 5/13/34 (observation, pas backtest)

- Source : OKX Spot BTC-USDC 1H ; 71 bougies consécutives du 2026-11-15T05:00:00Z au 2026-11-18T03:00:00Z.
- Dernière clôture : 64393.8 USDC/BTC ; EMA 5 : 64390.81 ; EMA 13 : 64374.49 ; EMA 34 : 64491.07 USDC.
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
