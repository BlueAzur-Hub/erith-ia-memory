# Seven Heaven — suivi public BTC : 2026-11-20T21:21:35Z

**Statut : DEGRADED_OR_UNVERIFIED** — lecture seule, couverture partielle documentée, aucune exécution réelle.

Fenêtre UTC : 2026-11-19T21:21:35Z au 2026-11-20T21:21:35Z.

## Santé et provenance

- **OKX Spot BTC-USDC 1H** : 23 bougies clôturées dans cette fenêtre ; dernière bougie 2026-11-20T20:00:00Z ; source fraîche : OUI.
- **Liquidations dérivées** : 40 messages observés dans les archives ; 9 fenêtres de connexion par fournisseur (les périodes sans connexion sont inconnues, **pas des liquidations nulles**).
- **Actualités de l'Interface** : 13 événements BTC ; relevé source 2026-11-20T18:02:43.181828+00:00.

| Source dérivés | Messages observés | Fenêtres de connexion |
|---|---:|---:|
| bybit | 7 | 3 |
| binance | 25 | 3 |
| okx | 8 | 3 |

## Interprétation autorisée

Ce rapport constate des **coïncidences temporelles** quand des données sont présentes. Il ne déduit aucune vente Spot d’une liquidation sur dérivés et ne prouve **aucune causalité** des articles.

Les montants OKX en contrats ne sont pas convertis en USDT sans multiplicateur vérifié. Les messages Bybit/Binance ne constituent pas un total mondial.

## Dernières heures Spot archivées

| UTC | Ouverture (USDC) | Clôture (USDC) | Volume Spot BTC | Messages de liquidations observés | Couverture |
|---|---:|---:|---:|---:|---|
| 2026-11-20T09:00:00Z | 61789.2 | 61590.8 | 20.96869249 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-20T10:00:00Z | 61593 | 62009.6 | 72.29603981 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-20T11:00:00Z | 61992.8 | 61750.8 | 36.0650799 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-20T12:00:00Z | 61742.2 | 61510.6 | 34.64423307 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-20T13:00:00Z | 61508.3 | 61827.3 | 46.38547215 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-20T14:00:00Z | 61824.3 | 61712.9 | 90.62271463 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-20T15:00:00Z | 61715.4 | 59429.7 | 435.26575793 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-20T16:00:00Z | 59411.3 | 59488.8 | 294.65639222 | 3 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-20T17:00:00Z | 59465.6 | 59095.8 | 128.11781963 | 27 | SAMPLED_WITH_GAPS |
| 2026-11-20T18:00:00Z | 59096.6 | 58348.2 | 229.20350609 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-20T19:00:00Z | 58341.2 | 58493.1 | 224.17120995 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-20T20:00:00Z | 58460.8 | 58376.8 | 164.9470837 | 0 | NO_DOCUMENTED_OBSERVATION |

## Étude de stratégie — structure EMA 5/13/34 (observation, pas backtest)

- Source : OKX Spot BTC-USDC 1H ; 71 bougies consécutives du 2026-11-17T22:00:00Z au 2026-11-20T20:00:00Z.
- Dernière clôture : 58376.8 USDC/BTC ; EMA 5 : 58883.94 ; EMA 13 : 59985.38 ; EMA 34 : 61301.91 USDC.
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
