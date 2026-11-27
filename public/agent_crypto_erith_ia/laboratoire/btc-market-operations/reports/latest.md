# Seven Heaven — suivi public BTC : 2026-11-27T15:23:09Z

**Statut : DEGRADED_OR_UNVERIFIED** — lecture seule, couverture partielle documentée, aucune exécution réelle.

Fenêtre UTC : 2026-11-26T15:23:09Z au 2026-11-27T15:23:09Z.

## Santé et provenance

- **OKX Spot BTC-USDC 1H** : 23 bougies clôturées dans cette fenêtre ; dernière bougie 2026-11-27T14:00:00Z ; source fraîche : OUI.
- **Liquidations dérivées** : 94 messages observés dans les archives ; 6 fenêtres de connexion par fournisseur (les périodes sans connexion sont inconnues, **pas des liquidations nulles**).
- **Actualités de l'Interface** : 5 événements BTC ; relevé source 2026-11-27T09:08:42.733682+00:00.

| Source dérivés | Messages observés | Fenêtres de connexion |
|---|---:|---:|
| bybit | 67 | 2 |
| binance | 16 | 2 |
| okx | 11 | 2 |

## Interprétation autorisée

Ce rapport constate des **coïncidences temporelles** quand des données sont présentes. Il ne déduit aucune vente Spot d’une liquidation sur dérivés et ne prouve **aucune causalité** des articles.

Les montants OKX en contrats ne sont pas convertis en USDT sans multiplicateur vérifié. Les messages Bybit/Binance ne constituent pas un total mondial.

## Dernières heures Spot archivées

| UTC | Ouverture (USDC) | Clôture (USDC) | Volume Spot BTC | Messages de liquidations observés | Couverture |
|---|---:|---:|---:|---:|---|
| 2026-11-27T03:00:00Z | 61253.4 | 61343.8 | 9.20573895 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-27T04:00:00Z | 61343.8 | 61344.1 | 5.02254161 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-27T05:00:00Z | 61347.7 | 61699.5 | 19.70437169 | 93 | SAMPLED_WITH_GAPS |
| 2026-11-27T06:00:00Z | 61700.2 | 61643.2 | 30.05738095 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-27T07:00:00Z | 61639.1 | 61597.9 | 18.48064618 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-27T08:00:00Z | 61593.5 | 61665 | 28.36435295 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-27T09:00:00Z | 61662.6 | 61569 | 10.39406772 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-27T10:00:00Z | 61554.8 | 61592 | 13.56084897 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-27T11:00:00Z | 61587 | 61588.1 | 14.7971284 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-27T12:00:00Z | 61583.2 | 61564 | 20.82648638 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-27T13:00:00Z | 61563.5 | 61404.9 | 20.72310375 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-27T14:00:00Z | 61400 | 59148.4 | 114.96776012 | 0 | NO_DOCUMENTED_OBSERVATION |

## Étude de stratégie — structure EMA 5/13/34 (observation, pas backtest)

- Source : OKX Spot BTC-USDC 1H ; 71 bougies consécutives du 2026-11-24T16:00:00Z au 2026-11-27T14:00:00Z.
- Dernière clôture : 59148.4 USDC/BTC ; EMA 5 : 60725.95 ; EMA 13 : 61068.96 ; EMA 34 : 60833.89 USDC.
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
