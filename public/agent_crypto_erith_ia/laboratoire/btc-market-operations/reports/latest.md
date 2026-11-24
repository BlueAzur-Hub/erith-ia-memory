# Seven Heaven — suivi public BTC : 2026-11-24T02:25:01Z

**Statut : DEGRADED_OR_UNVERIFIED** — lecture seule, couverture partielle documentée, aucune exécution réelle.

Fenêtre UTC : 2026-11-23T02:25:01Z au 2026-11-24T02:25:01Z.

## Santé et provenance

- **OKX Spot BTC-USDC 1H** : 23 bougies clôturées dans cette fenêtre ; dernière bougie 2026-11-24T01:00:00Z ; source fraîche : OUI.
- **Liquidations dérivées** : 25 messages observés dans les archives ; 6 fenêtres de connexion par fournisseur (les périodes sans connexion sont inconnues, **pas des liquidations nulles**).
- **Actualités de l'Interface** : 21 événements BTC ; relevé source 2026-11-24T01:14:46.307678+00:00.

| Source dérivés | Messages observés | Fenêtres de connexion |
|---|---:|---:|
| bybit | 3 | 2 |
| binance | 13 | 2 |
| okx | 9 | 2 |

## Interprétation autorisée

Ce rapport constate des **coïncidences temporelles** quand des données sont présentes. Il ne déduit aucune vente Spot d’une liquidation sur dérivés et ne prouve **aucune causalité** des articles.

Les montants OKX en contrats ne sont pas convertis en USDT sans multiplicateur vérifié. Les messages Bybit/Binance ne constituent pas un total mondial.

## Dernières heures Spot archivées

| UTC | Ouverture (USDC) | Clôture (USDC) | Volume Spot BTC | Messages de liquidations observés | Couverture |
|---|---:|---:|---:|---:|---|
| 2026-11-23T14:00:00Z | 63788.6 | 62858.2 | 409.95098594 | 7 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-23T15:00:00Z | 62846.7 | 62855.1 | 75.70676843 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-23T16:00:00Z | 62843.7 | 62199.3 | 94.50829285 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-23T17:00:00Z | 62188.9 | 61620.5 | 91.24283137 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-23T18:00:00Z | 61615.7 | 61321.3 | 23.39175967 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-23T19:00:00Z | 61316.3 | 61187.3 | 44.18348991 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-23T20:00:00Z | 61207.5 | 61169 | 28.56448951 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-23T21:00:00Z | 61178.8 | 61271.5 | 22.80916731 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-23T22:00:00Z | 61254.2 | 61185.2 | 14.66905508 | 16 | SAMPLED_WITH_GAPS |
| 2026-11-23T23:00:00Z | 61187 | 61197.2 | 10.59239116 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-24T00:00:00Z | 61191.4 | 61253.7 | 24.79616965 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-24T01:00:00Z | 61235.4 | 61013.6 | 14.23864258 | 0 | NO_DOCUMENTED_OBSERVATION |

## Étude de stratégie — structure EMA 5/13/34 (observation, pas backtest)

- Source : OKX Spot BTC-USDC 1H ; 71 bougies consécutives du 2026-11-21T03:00:00Z au 2026-11-24T01:00:00Z.
- Dernière clôture : 61013.6 USDC/BTC ; EMA 5 : 61190.73 ; EMA 13 : 61397.06 ; EMA 34 : 61185.08 USDC.
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
