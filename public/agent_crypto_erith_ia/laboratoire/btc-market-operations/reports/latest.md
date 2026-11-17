# Seven Heaven — suivi public BTC : 2026-11-17T13:40:23Z

**Statut : DEGRADED_OR_UNVERIFIED** — lecture seule, couverture partielle documentée, aucune exécution réelle.

Fenêtre UTC : 2026-11-16T13:40:23Z au 2026-11-17T13:40:23Z.

## Santé et provenance

- **OKX Spot BTC-USDC 1H** : 23 bougies clôturées dans cette fenêtre ; dernière bougie 2026-11-17T12:00:00Z ; source fraîche : OUI.
- **Liquidations dérivées** : 11 messages observés dans les archives ; 9 fenêtres de connexion par fournisseur (les périodes sans connexion sont inconnues, **pas des liquidations nulles**).
- **Actualités de l'Interface** : 7 événements BTC ; relevé source 2026-11-17T04:48:40.859969+00:00.

| Source dérivés | Messages observés | Fenêtres de connexion |
|---|---:|---:|
| bybit | 2 | 3 |
| binance | 9 | 3 |
| okx | 0 | 3 |

## Interprétation autorisée

Ce rapport constate des **coïncidences temporelles** quand des données sont présentes. Il ne déduit aucune vente Spot d’une liquidation sur dérivés et ne prouve **aucune causalité** des articles.

Les montants OKX en contrats ne sont pas convertis en USDT sans multiplicateur vérifié. Les messages Bybit/Binance ne constituent pas un total mondial.

## Dernières heures Spot archivées

| UTC | Ouverture (USDC) | Clôture (USDC) | Volume Spot BTC | Messages de liquidations observés | Couverture |
|---|---:|---:|---:|---:|---|
| 2026-11-17T01:00:00Z | 64582.9 | 64701.1 | 22.16090157 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-17T02:00:00Z | 64689.1 | 64457.6 | 13.10573632 | 0 | SAMPLED_WITH_GAPS |
| 2026-11-17T03:00:00Z | 64457.8 | 65005.5 | 19.33148254 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-17T04:00:00Z | 65012.7 | 64993.2 | 12.28648525 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-17T05:00:00Z | 64992.4 | 64757.6 | 32.92047778 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-17T06:00:00Z | 64753 | 64510.5 | 40.13469811 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-17T07:00:00Z | 64507.1 | 64700 | 20.29935562 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-17T08:00:00Z | 64688.4 | 64286.9 | 42.17587578 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-17T09:00:00Z | 64289.2 | 64312.5 | 35.66632406 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-17T10:00:00Z | 64314 | 64048.9 | 49.46288391 | 4 | SAMPLED_WITH_GAPS |
| 2026-11-17T11:00:00Z | 64049.6 | 64945.5 | 34.09808189 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-17T12:00:00Z | 64952.6 | 65015.3 | 18.20915371 | 0 | NO_DOCUMENTED_OBSERVATION |

## Étude de stratégie — structure EMA 5/13/34 (observation, pas backtest)

- Source : OKX Spot BTC-USDC 1H ; 71 bougies consécutives du 2026-11-14T14:00:00Z au 2026-11-17T12:00:00Z.
- Dernière clôture : 65015.3 USDC/BTC ; EMA 5 : 64699.7 ; EMA 13 : 64672.25 ; EMA 34 : 64720.1 USDC.
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
