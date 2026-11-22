# Seven Heaven — suivi public BTC : 2026-11-22T08:15:23Z

**Statut : OPERATIONAL_PARTIAL_COVERAGE** — lecture seule, couverture partielle documentée, aucune exécution réelle.

Fenêtre UTC : 2026-11-21T08:15:23Z au 2026-11-22T08:15:23Z.

## Santé et provenance

- **OKX Spot BTC-USDC 1H** : 23 bougies clôturées dans cette fenêtre ; dernière bougie 2026-11-22T07:00:00Z ; source fraîche : OUI.
- **Liquidations dérivées** : 203 messages observés dans les archives ; 12 fenêtres de connexion par fournisseur (les périodes sans connexion sont inconnues, **pas des liquidations nulles**).
- **Actualités de l'Interface** : 3 événements BTC ; relevé source 2026-11-22T01:40:19.335411+00:00.

| Source dérivés | Messages observés | Fenêtres de connexion |
|---|---:|---:|
| bybit | 144 | 4 |
| binance | 38 | 4 |
| okx | 21 | 4 |

## Interprétation autorisée

Ce rapport constate des **coïncidences temporelles** quand des données sont présentes. Il ne déduit aucune vente Spot d’une liquidation sur dérivés et ne prouve **aucune causalité** des articles.

Les montants OKX en contrats ne sont pas convertis en USDT sans multiplicateur vérifié. Les messages Bybit/Binance ne constituent pas un total mondial.

## Dernières heures Spot archivées

| UTC | Ouverture (USDC) | Clôture (USDC) | Volume Spot BTC | Messages de liquidations observés | Couverture |
|---|---:|---:|---:|---:|---|
| 2026-11-21T20:00:00Z | 60229.6 | 60334 | 13.15918517 | 1 | SAMPLED_WITH_GAPS |
| 2026-11-21T21:00:00Z | 60336.7 | 60355 | 14.38195413 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-21T22:00:00Z | 60361.2 | 60038.5 | 10.76614414 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-21T23:00:00Z | 60045.7 | 60101.1 | 24.78430927 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-22T00:00:00Z | 60105.1 | 60104.2 | 7.3640744 | 2 | SAMPLED_WITH_GAPS |
| 2026-11-22T01:00:00Z | 60083 | 60000.3 | 7.18722862 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-22T02:00:00Z | 60003.2 | 59369.7 | 45.09841686 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-22T03:00:00Z | 59369.8 | 59230.3 | 31.73715764 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-22T04:00:00Z | 59242.6 | 59200.4 | 20.68554469 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-22T05:00:00Z | 59190.6 | 58802.7 | 46.19323533 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-22T06:00:00Z | 58807.4 | 59037.9 | 18.80145917 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-22T07:00:00Z | 59036.5 | 59067.1 | 18.00377874 | 1 | SAMPLED_WITH_GAPS |

## Étude de stratégie — structure EMA 5/13/34 (observation, pas backtest)

- Source : OKX Spot BTC-USDC 1H ; 71 bougies consécutives du 2026-11-19T09:00:00Z au 2026-11-22T07:00:00Z.
- Dernière clôture : 59067.1 USDC/BTC ; EMA 5 : 59147.49 ; EMA 13 : 59389.99 ; EMA 34 : 59574.26 USDC.
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
