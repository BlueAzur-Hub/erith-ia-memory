# Seven Heaven — suivi public BTC : 2026-11-27T05:12:55Z

**Statut : DEGRADED_OR_UNVERIFIED** — lecture seule, couverture partielle documentée, aucune exécution réelle.

Fenêtre UTC : 2026-11-26T05:12:55Z au 2026-11-27T05:12:55Z.

## Santé et provenance

- **OKX Spot BTC-USDC 1H** : 23 bougies clôturées dans cette fenêtre ; dernière bougie 2026-11-27T04:00:00Z ; source fraîche : OUI.
- **Liquidations dérivées** : 12 messages observés dans les archives ; 6 fenêtres de connexion par fournisseur (les périodes sans connexion sont inconnues, **pas des liquidations nulles**).
- **Actualités de l'Interface** : 13 événements BTC ; relevé source 2026-11-27T00:05:33.692484+00:00.

| Source dérivés | Messages observés | Fenêtres de connexion |
|---|---:|---:|
| bybit | 2 | 2 |
| binance | 8 | 2 |
| okx | 2 | 2 |

## Interprétation autorisée

Ce rapport constate des **coïncidences temporelles** quand des données sont présentes. Il ne déduit aucune vente Spot d’une liquidation sur dérivés et ne prouve **aucune causalité** des articles.

Les montants OKX en contrats ne sont pas convertis en USDT sans multiplicateur vérifié. Les messages Bybit/Binance ne constituent pas un total mondial.

## Dernières heures Spot archivées

| UTC | Ouverture (USDC) | Clôture (USDC) | Volume Spot BTC | Messages de liquidations observés | Couverture |
|---|---:|---:|---:|---:|---|
| 2026-11-26T17:00:00Z | 60460 | 60463.2 | 16.92207591 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-26T18:00:00Z | 60465.2 | 60413.5 | 7.3895617 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-26T19:00:00Z | 60407.2 | 60626.9 | 7.22623296 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-26T20:00:00Z | 60639.6 | 60697.3 | 11.1153429 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-26T21:00:00Z | 60701.3 | 60755.4 | 8.05831345 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-26T22:00:00Z | 60750.8 | 60478.3 | 51.78466483 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-26T23:00:00Z | 60482.8 | 60509.6 | 6.62583868 | 0 | SAMPLED_WITH_GAPS |
| 2026-11-27T00:00:00Z | 60501.9 | 60625.2 | 4.81903861 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-27T01:00:00Z | 60628.9 | 60656.8 | 6.12310822 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-27T02:00:00Z | 60662.7 | 61279.7 | 41.97552814 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-27T03:00:00Z | 61253.4 | 61343.8 | 9.20573895 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-27T04:00:00Z | 61343.8 | 61344.1 | 5.02254161 | 0 | NO_DOCUMENTED_OBSERVATION |

## Étude de stratégie — structure EMA 5/13/34 (observation, pas backtest)

- Source : OKX Spot BTC-USDC 1H ; 71 bougies consécutives du 2026-11-24T06:00:00Z au 2026-11-27T04:00:00Z.
- Dernière clôture : 61344.1 USDC/BTC ; EMA 5 : 61116.6 ; EMA 13 : 60860.3 ; EMA 34 : 60549.57 USDC.
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
