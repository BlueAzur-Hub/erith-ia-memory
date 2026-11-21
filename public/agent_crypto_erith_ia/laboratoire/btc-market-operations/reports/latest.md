# Seven Heaven — suivi public BTC : 2026-11-21T02:39:30Z

**Statut : DEGRADED_OR_UNVERIFIED** — lecture seule, couverture partielle documentée, aucune exécution réelle.

Fenêtre UTC : 2026-11-20T02:39:30Z au 2026-11-21T02:39:30Z.

## Santé et provenance

- **OKX Spot BTC-USDC 1H** : 23 bougies clôturées dans cette fenêtre ; dernière bougie 2026-11-21T01:00:00Z ; source fraîche : OUI.
- **Liquidations dérivées** : 40 messages observés dans les archives ; 9 fenêtres de connexion par fournisseur (les périodes sans connexion sont inconnues, **pas des liquidations nulles**).
- **Actualités de l'Interface** : 14 événements BTC ; relevé source 2026-11-21T00:19:50.883746+00:00.

| Source dérivés | Messages observés | Fenêtres de connexion |
|---|---:|---:|
| bybit | 8 | 3 |
| binance | 24 | 3 |
| okx | 8 | 3 |

## Interprétation autorisée

Ce rapport constate des **coïncidences temporelles** quand des données sont présentes. Il ne déduit aucune vente Spot d’une liquidation sur dérivés et ne prouve **aucune causalité** des articles.

Les montants OKX en contrats ne sont pas convertis en USDT sans multiplicateur vérifié. Les messages Bybit/Binance ne constituent pas un total mondial.

## Dernières heures Spot archivées

| UTC | Ouverture (USDC) | Clôture (USDC) | Volume Spot BTC | Messages de liquidations observés | Couverture |
|---|---:|---:|---:|---:|---|
| 2026-11-20T14:00:00Z | 61824.3 | 61712.9 | 90.62271463 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-20T15:00:00Z | 61715.4 | 59429.7 | 435.26575793 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-20T16:00:00Z | 59411.3 | 59488.8 | 294.65639222 | 3 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-20T17:00:00Z | 59465.6 | 59095.8 | 128.11781963 | 27 | SAMPLED_WITH_GAPS |
| 2026-11-20T18:00:00Z | 59096.6 | 58348.2 | 229.20350609 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-20T19:00:00Z | 58341.2 | 58493.1 | 224.17120995 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-20T20:00:00Z | 58460.8 | 58376.8 | 164.9470837 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-20T21:00:00Z | 58364.3 | 58914 | 144.33993089 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-20T22:00:00Z | 58922 | 59046.7 | 64.92819624 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-20T23:00:00Z | 59045.5 | 58816.5 | 78.27662629 | 6 | SAMPLED_WITH_GAPS |
| 2026-11-21T00:00:00Z | 58811.7 | 58911.9 | 48.51069321 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-21T01:00:00Z | 58911.8 | 58924 | 22.00500417 | 0 | NO_DOCUMENTED_OBSERVATION |

## Étude de stratégie — structure EMA 5/13/34 (observation, pas backtest)

- Source : OKX Spot BTC-USDC 1H ; 71 bougies consécutives du 2026-11-18T03:00:00Z au 2026-11-21T01:00:00Z.
- Dernière clôture : 58924.0 USDC/BTC ; EMA 5 : 58911.57 ; EMA 13 : 59412.59 ; EMA 34 : 60679.15 USDC.
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
