# Seven Heaven — suivi public BTC : 2026-11-14T02:32:02Z

**Statut : DEGRADED_OR_UNVERIFIED** — lecture seule, couverture partielle documentée, aucune exécution réelle.

Fenêtre UTC : 2026-11-13T02:32:02Z au 2026-11-14T02:32:02Z.

## Santé et provenance

- **OKX Spot BTC-USDC 1H** : 23 bougies clôturées dans cette fenêtre ; dernière bougie 2026-11-14T01:00:00Z ; source fraîche : OUI.
- **Liquidations dérivées** : 21 messages observés dans les archives ; 9 fenêtres de connexion par fournisseur (les périodes sans connexion sont inconnues, **pas des liquidations nulles**).
- **Actualités de l'Interface** : 21 événements BTC ; relevé source 2026-11-13T23:56:23.597621+00:00.

| Source dérivés | Messages observés | Fenêtres de connexion |
|---|---:|---:|
| bybit | 8 | 3 |
| binance | 13 | 3 |
| okx | 0 | 3 |

## Interprétation autorisée

Ce rapport constate des **coïncidences temporelles** quand des données sont présentes. Il ne déduit aucune vente Spot d’une liquidation sur dérivés et ne prouve **aucune causalité** des articles.

Les montants OKX en contrats ne sont pas convertis en USDT sans multiplicateur vérifié. Les messages Bybit/Binance ne constituent pas un total mondial.

## Dernières heures Spot archivées

| UTC | Ouverture (USDC) | Clôture (USDC) | Volume Spot BTC | Messages de liquidations observés | Couverture |
|---|---:|---:|---:|---:|---|
| 2026-11-13T14:00:00Z | 69513.3 | 68960.9 | 126.75353672 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-13T15:00:00Z | 68959.6 | 68854.5 | 181.2399499 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-13T16:00:00Z | 68854.4 | 68662.1 | 88.76534954 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-13T17:00:00Z | 68662.1 | 68903.6 | 55.55035147 | 3 | SAMPLED_WITH_GAPS |
| 2026-11-13T18:00:00Z | 68903.4 | 68942.3 | 26.53501314 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-13T19:00:00Z | 68945.9 | 69008.7 | 16.60228964 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-13T20:00:00Z | 69018 | 68868.2 | 19.82008479 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-13T21:00:00Z | 68863.2 | 68340.8 | 45.38891389 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-13T22:00:00Z | 68338.4 | 68206.6 | 30.6634946 | 5 | SAMPLED_WITH_GAPS |
| 2026-11-13T23:00:00Z | 68200 | 68243 | 43.2303058 | 12 | SAMPLED_WITH_GAPS |
| 2026-11-14T00:00:00Z | 68264.9 | 68280.4 | 24.29141864 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-14T01:00:00Z | 68285.1 | 68237.5 | 8.64474937 | 0 | NO_DOCUMENTED_OBSERVATION |

## Étude de stratégie — structure EMA 5/13/34 (observation, pas backtest)

- Source : OKX Spot BTC-USDC 1H ; 71 bougies consécutives du 2026-11-11T03:00:00Z au 2026-11-14T01:00:00Z.
- Dernière clôture : 68237.5 USDC/BTC ; EMA 5 : 68342.14 ; EMA 13 : 68646.53 ; EMA 34 : 69659.2 USDC.
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
