# Seven Heaven — suivi public BTC : 2026-11-13T06:58:56Z

**Statut : DEGRADED_OR_UNVERIFIED** — lecture seule, couverture partielle documentée, aucune exécution réelle.

Fenêtre UTC : 2026-11-12T06:58:56Z au 2026-11-13T06:58:56Z.

## Santé et provenance

- **OKX Spot BTC-USDC 1H** : 23 bougies clôturées dans cette fenêtre ; dernière bougie 2026-11-13T05:00:00Z ; source fraîche : OUI.
- **Liquidations dérivées** : 6 messages observés dans les archives ; 9 fenêtres de connexion par fournisseur (les périodes sans connexion sont inconnues, **pas des liquidations nulles**).
- **Actualités de l'Interface** : 9 événements BTC ; relevé source 2026-11-13T03:38:41.384403+00:00.

| Source dérivés | Messages observés | Fenêtres de connexion |
|---|---:|---:|
| bybit | 0 | 3 |
| binance | 2 | 3 |
| okx | 4 | 3 |

## Interprétation autorisée

Ce rapport constate des **coïncidences temporelles** quand des données sont présentes. Il ne déduit aucune vente Spot d’une liquidation sur dérivés et ne prouve **aucune causalité** des articles.

Les montants OKX en contrats ne sont pas convertis en USDT sans multiplicateur vérifié. Les messages Bybit/Binance ne constituent pas un total mondial.

## Dernières heures Spot archivées

| UTC | Ouverture (USDC) | Clôture (USDC) | Volume Spot BTC | Messages de liquidations observés | Couverture |
|---|---:|---:|---:|---:|---|
| 2026-11-12T18:00:00Z | 71850 | 71708.1 | 27.22666061 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-12T19:00:00Z | 71708.1 | 71628.1 | 30.99106893 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-12T20:00:00Z | 71628.1 | 71383.6 | 92.50227312 | 0 | SAMPLED_WITH_GAPS |
| 2026-11-12T21:00:00Z | 71384.1 | 71493.2 | 40.90542975 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-12T22:00:00Z | 71490 | 71349.7 | 25.22005977 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-12T23:00:00Z | 71347.3 | 71393.7 | 33.92060063 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-13T00:00:00Z | 71393.7 | 71079 | 145.53740065 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-13T01:00:00Z | 71069.7 | 70884.2 | 28.4965853 | 1 | SAMPLED_WITH_GAPS |
| 2026-11-13T02:00:00Z | 70885.5 | 70190 | 227.79182117 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-13T03:00:00Z | 70180.5 | 68905.8 | 242.72496929 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-13T04:00:00Z | 68907.5 | 68532.6 | 61.87436891 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-13T05:00:00Z | 68527.6 | 68094.9 | 226.9295786 | 0 | NO_DOCUMENTED_OBSERVATION |

## Étude de stratégie — structure EMA 5/13/34 (observation, pas backtest)

- Source : OKX Spot BTC-USDC 1H ; 71 bougies consécutives du 2026-11-10T07:00:00Z au 2026-11-13T05:00:00Z.
- Dernière clôture : 68094.9 USDC/BTC ; EMA 5 : 69130.85 ; EMA 13 : 70344.27 ; EMA 34 : 71745.08 USDC.
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
