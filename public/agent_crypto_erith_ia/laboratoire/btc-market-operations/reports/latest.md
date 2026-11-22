# Seven Heaven — suivi public BTC : 2026-11-22T22:37:48Z

**Statut : OPERATIONAL_PARTIAL_COVERAGE** — lecture seule, couverture partielle documentée, aucune exécution réelle.

Fenêtre UTC : 2026-11-21T22:37:48Z au 2026-11-22T22:37:48Z.

## Santé et provenance

- **OKX Spot BTC-USDC 1H** : 23 bougies clôturées dans cette fenêtre ; dernière bougie 2026-11-22T21:00:00Z ; source fraîche : OUI.
- **Liquidations dérivées** : 20 messages observés dans les archives ; 12 fenêtres de connexion par fournisseur (les périodes sans connexion sont inconnues, **pas des liquidations nulles**).
- **Actualités de l'Interface** : 3 événements BTC ; relevé source 2026-11-22T17:26:46.253477+00:00.

| Source dérivés | Messages observés | Fenêtres de connexion |
|---|---:|---:|
| bybit | 3 | 4 |
| binance | 14 | 4 |
| okx | 3 | 4 |

## Interprétation autorisée

Ce rapport constate des **coïncidences temporelles** quand des données sont présentes. Il ne déduit aucune vente Spot d’une liquidation sur dérivés et ne prouve **aucune causalité** des articles.

Les montants OKX en contrats ne sont pas convertis en USDT sans multiplicateur vérifié. Les messages Bybit/Binance ne constituent pas un total mondial.

## Dernières heures Spot archivées

| UTC | Ouverture (USDC) | Clôture (USDC) | Volume Spot BTC | Messages de liquidations observés | Couverture |
|---|---:|---:|---:|---:|---|
| 2026-11-22T10:00:00Z | 61068.9 | 60792.1 | 39.35336076 | 2 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-22T11:00:00Z | 60783.4 | 60986.4 | 14.64528515 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-22T12:00:00Z | 60977.2 | 60756.6 | 75.37449194 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-22T13:00:00Z | 60770 | 60655.7 | 30.51443132 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-22T14:00:00Z | 60660.2 | 60846.3 | 20.76506376 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-22T15:00:00Z | 60867.6 | 60817.4 | 16.18087757 | 15 | SAMPLED_WITH_GAPS |
| 2026-11-22T16:00:00Z | 60807.6 | 61176.8 | 36.56837923 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-22T17:00:00Z | 61176.8 | 60747.8 | 23.54566434 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-22T18:00:00Z | 60747.8 | 60700 | 19.16560143 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-22T19:00:00Z | 60678 | 60658.3 | 21.03080592 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-22T20:00:00Z | 60658.2 | 60834.7 | 19.49093172 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-22T21:00:00Z | 60834.7 | 60846.3 | 22.85245735 | 0 | SAMPLED_WITH_GAPS |

## Étude de stratégie — structure EMA 5/13/34 (observation, pas backtest)

- Source : OKX Spot BTC-USDC 1H ; 71 bougies consécutives du 2026-11-19T23:00:00Z au 2026-11-22T21:00:00Z.
- Dernière clôture : 60846.3 USDC/BTC ; EMA 5 : 60798.66 ; EMA 13 : 60630.4 ; EMA 34 : 60276.45 USDC.
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
