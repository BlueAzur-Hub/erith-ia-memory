# Seven Heaven — suivi public BTC : 2026-11-14T10:42:30Z

**Statut : DEGRADED_OR_UNVERIFIED** — lecture seule, couverture partielle documentée, aucune exécution réelle.

Fenêtre UTC : 2026-11-13T10:42:30Z au 2026-11-14T10:42:30Z.

## Santé et provenance

- **OKX Spot BTC-USDC 1H** : 23 bougies clôturées dans cette fenêtre ; dernière bougie 2026-11-14T09:00:00Z ; source fraîche : OUI.
- **Liquidations dérivées** : 22 messages observés dans les archives ; 9 fenêtres de connexion par fournisseur (les périodes sans connexion sont inconnues, **pas des liquidations nulles**).
- **Actualités de l'Interface** : 15 événements BTC ; relevé source 2026-11-14T07:04:34.409895+00:00.

| Source dérivés | Messages observés | Fenêtres de connexion |
|---|---:|---:|
| bybit | 8 | 3 |
| binance | 14 | 3 |
| okx | 0 | 3 |

## Interprétation autorisée

Ce rapport constate des **coïncidences temporelles** quand des données sont présentes. Il ne déduit aucune vente Spot d’une liquidation sur dérivés et ne prouve **aucune causalité** des articles.

Les montants OKX en contrats ne sont pas convertis en USDT sans multiplicateur vérifié. Les messages Bybit/Binance ne constituent pas un total mondial.

## Dernières heures Spot archivées

| UTC | Ouverture (USDC) | Clôture (USDC) | Volume Spot BTC | Messages de liquidations observés | Couverture |
|---|---:|---:|---:|---:|---|
| 2026-11-13T22:00:00Z | 68338.4 | 68206.6 | 30.6634946 | 5 | SAMPLED_WITH_GAPS |
| 2026-11-13T23:00:00Z | 68200 | 68243 | 43.2303058 | 12 | SAMPLED_WITH_GAPS |
| 2026-11-14T00:00:00Z | 68264.9 | 68280.4 | 24.29141864 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-14T01:00:00Z | 68285.1 | 68237.5 | 8.64474937 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-14T02:00:00Z | 68237.4 | 67637.8 | 137.9175933 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-14T03:00:00Z | 67633.8 | 66705.8 | 97.02218572 | 2 | SAMPLED_WITH_GAPS |
| 2026-11-14T04:00:00Z | 66705.2 | 67034 | 52.77928323 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-14T05:00:00Z | 67038.9 | 67193.5 | 22.23860119 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-14T06:00:00Z | 67193.9 | 67330.4 | 27.88197399 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-14T07:00:00Z | 67329.2 | 67121.1 | 46.13339878 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-14T08:00:00Z | 67123.1 | 66956.8 | 33.33859189 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-14T09:00:00Z | 66949.7 | 67374 | 23.08902497 | 0 | NO_DOCUMENTED_OBSERVATION |

## Étude de stratégie — structure EMA 5/13/34 (observation, pas backtest)

- Source : OKX Spot BTC-USDC 1H ; 71 bougies consécutives du 2026-11-11T11:00:00Z au 2026-11-14T09:00:00Z.
- Dernière clôture : 67374.0 USDC/BTC ; EMA 5 : 67236.07 ; EMA 13 : 67601.77 ; EMA 34 : 68758.3 USDC.
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
