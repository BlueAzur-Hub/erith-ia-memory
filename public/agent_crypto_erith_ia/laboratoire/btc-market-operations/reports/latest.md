# Seven Heaven — suivi public BTC : 2026-11-27T23:39:00Z

**Statut : DEGRADED_OR_UNVERIFIED** — lecture seule, couverture partielle documentée, aucune exécution réelle.

Fenêtre UTC : 2026-11-26T23:39:00Z au 2026-11-27T23:39:00Z.

## Santé et provenance

- **OKX Spot BTC-USDC 1H** : 23 bougies clôturées dans cette fenêtre ; dernière bougie 2026-11-27T22:00:00Z ; source fraîche : OUI.
- **Liquidations dérivées** : 109 messages observés dans les archives ; 6 fenêtres de connexion par fournisseur (les périodes sans connexion sont inconnues, **pas des liquidations nulles**).
- **Actualités de l'Interface** : 9 événements BTC ; relevé source 2026-11-27T19:13:01.283941+00:00.

| Source dérivés | Messages observés | Fenêtres de connexion |
|---|---:|---:|
| bybit | 68 | 2 |
| binance | 24 | 2 |
| okx | 17 | 2 |

## Interprétation autorisée

Ce rapport constate des **coïncidences temporelles** quand des données sont présentes. Il ne déduit aucune vente Spot d’une liquidation sur dérivés et ne prouve **aucune causalité** des articles.

Les montants OKX en contrats ne sont pas convertis en USDT sans multiplicateur vérifié. Les messages Bybit/Binance ne constituent pas un total mondial.

## Dernières heures Spot archivées

| UTC | Ouverture (USDC) | Clôture (USDC) | Volume Spot BTC | Messages de liquidations observés | Couverture |
|---|---:|---:|---:|---:|---|
| 2026-11-27T11:00:00Z | 61587 | 61588.1 | 14.7971284 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-27T12:00:00Z | 61583.2 | 61564 | 20.82648638 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-27T13:00:00Z | 61563.5 | 61404.9 | 20.72310375 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-27T14:00:00Z | 61400 | 59148.4 | 114.96776012 | 1 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-27T15:00:00Z | 59166.6 | 60070.1 | 95.83689759 | 14 | SAMPLED_WITH_GAPS |
| 2026-11-27T16:00:00Z | 60050.4 | 59914.3 | 47.42894506 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-27T17:00:00Z | 59901.6 | 59901.6 | 34.88209255 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-27T18:00:00Z | 59877 | 59852.9 | 16.14400786 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-27T19:00:00Z | 59869.6 | 59863.1 | 54.82831858 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-27T20:00:00Z | 59858.5 | 59751.8 | 9.54514735 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-27T21:00:00Z | 59768.9 | 59747.9 | 4.59116657 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-27T22:00:00Z | 59738.6 | 59708.7 | 7.71039839 | 0 | NO_DOCUMENTED_OBSERVATION |

## Étude de stratégie — structure EMA 5/13/34 (observation, pas backtest)

- Source : OKX Spot BTC-USDC 1H ; 71 bougies consécutives du 2026-11-25T00:00:00Z au 2026-11-27T22:00:00Z.
- Dernière clôture : 59708.7 USDC/BTC ; EMA 5 : 59809.77 ; EMA 13 : 60181.3 ; EMA 34 : 60429.89 USDC.
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
