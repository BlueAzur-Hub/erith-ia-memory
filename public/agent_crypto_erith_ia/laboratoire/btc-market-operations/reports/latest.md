# Seven Heaven — suivi public BTC : 2026-11-22T16:29:20Z

**Statut : OPERATIONAL_PARTIAL_COVERAGE** — lecture seule, couverture partielle documentée, aucune exécution réelle.

Fenêtre UTC : 2026-11-21T16:29:20Z au 2026-11-22T16:29:20Z.

## Santé et provenance

- **OKX Spot BTC-USDC 1H** : 23 bougies clôturées dans cette fenêtre ; dernière bougie 2026-11-22T15:00:00Z ; source fraîche : OUI.
- **Liquidations dérivées** : 19 messages observés dans les archives ; 12 fenêtres de connexion par fournisseur (les périodes sans connexion sont inconnues, **pas des liquidations nulles**).
- **Actualités de l'Interface** : 1 événements BTC ; relevé source 2026-11-22T08:53:34.236976+00:00.

| Source dérivés | Messages observés | Fenêtres de connexion |
|---|---:|---:|
| bybit | 3 | 4 |
| binance | 15 | 4 |
| okx | 1 | 4 |

## Interprétation autorisée

Ce rapport constate des **coïncidences temporelles** quand des données sont présentes. Il ne déduit aucune vente Spot d’une liquidation sur dérivés et ne prouve **aucune causalité** des articles.

Les montants OKX en contrats ne sont pas convertis en USDT sans multiplicateur vérifié. Les messages Bybit/Binance ne constituent pas un total mondial.

## Dernières heures Spot archivées

| UTC | Ouverture (USDC) | Clôture (USDC) | Volume Spot BTC | Messages de liquidations observés | Couverture |
|---|---:|---:|---:|---:|---|
| 2026-11-22T04:00:00Z | 59242.6 | 59200.4 | 20.68554469 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-22T05:00:00Z | 59190.6 | 58802.7 | 46.19323533 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-22T06:00:00Z | 58807.4 | 59037.9 | 18.80145917 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-22T07:00:00Z | 59036.5 | 59067.1 | 18.00377874 | 1 | SAMPLED_WITH_GAPS |
| 2026-11-22T08:00:00Z | 59067 | 59708.2 | 66.50027591 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-22T09:00:00Z | 59708.2 | 61036.3 | 95.69056012 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-22T10:00:00Z | 61068.9 | 60792.1 | 39.35336076 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-22T11:00:00Z | 60783.4 | 60986.4 | 14.64528515 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-22T12:00:00Z | 60977.2 | 60756.6 | 75.37449194 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-22T13:00:00Z | 60770 | 60655.7 | 30.51443132 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-22T14:00:00Z | 60660.2 | 60846.3 | 20.76506376 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-22T15:00:00Z | 60867.6 | 60817.4 | 16.18087757 | 15 | SAMPLED_WITH_GAPS |

## Étude de stratégie — structure EMA 5/13/34 (observation, pas backtest)

- Source : OKX Spot BTC-USDC 1H ; 71 bougies consécutives du 2026-11-19T17:00:00Z au 2026-11-22T15:00:00Z.
- Dernière clôture : 60817.4 USDC/BTC ; EMA 5 : 60723.49 ; EMA 13 : 60352.49 ; EMA 34 : 60013.81 USDC.
- Structure horaire observée : **ALIGNEMENT_HAUSSIER_HORAIRE**.
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
