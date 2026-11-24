# Seven Heaven — suivi public BTC : 2026-11-24T23:33:44Z

**Statut : DEGRADED_OR_UNVERIFIED** — lecture seule, couverture partielle documentée, aucune exécution réelle.

Fenêtre UTC : 2026-11-23T23:33:44Z au 2026-11-24T23:33:44Z.

## Santé et provenance

- **OKX Spot BTC-USDC 1H** : 23 bougies clôturées dans cette fenêtre ; dernière bougie 2026-11-24T22:00:00Z ; source fraîche : OUI.
- **Liquidations dérivées** : 9 messages observés dans les archives ; 6 fenêtres de connexion par fournisseur (les périodes sans connexion sont inconnues, **pas des liquidations nulles**).
- **Actualités de l'Interface** : 17 événements BTC ; relevé source 2026-11-24T21:33:35.532508+00:00.

| Source dérivés | Messages observés | Fenêtres de connexion |
|---|---:|---:|
| bybit | 0 | 2 |
| binance | 2 | 2 |
| okx | 7 | 2 |

## Interprétation autorisée

Ce rapport constate des **coïncidences temporelles** quand des données sont présentes. Il ne déduit aucune vente Spot d’une liquidation sur dérivés et ne prouve **aucune causalité** des articles.

Les montants OKX en contrats ne sont pas convertis en USDT sans multiplicateur vérifié. Les messages Bybit/Binance ne constituent pas un total mondial.

## Dernières heures Spot archivées

| UTC | Ouverture (USDC) | Clôture (USDC) | Volume Spot BTC | Messages de liquidations observés | Couverture |
|---|---:|---:|---:|---:|---|
| 2026-11-24T11:00:00Z | 59719 | 60353.6 | 62.81731642 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-24T12:00:00Z | 60354.8 | 60415.6 | 40.05795371 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-24T13:00:00Z | 60396.9 | 59949 | 52.57134399 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-24T14:00:00Z | 59935.3 | 60380.3 | 53.41443665 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-24T15:00:00Z | 60359.9 | 59654.2 | 49.45402165 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-24T16:00:00Z | 59654.1 | 59350.7 | 28.03032095 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-24T17:00:00Z | 59346.4 | 60045.1 | 38.17050623 | 3 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-24T18:00:00Z | 60037.4 | 59815 | 18.13349704 | 0 | SAMPLED_WITH_GAPS |
| 2026-11-24T19:00:00Z | 59812.2 | 59609.3 | 12.91533282 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-24T20:00:00Z | 59618.4 | 59711.4 | 22.19418716 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-24T21:00:00Z | 59694.6 | 59835.1 | 19.96533297 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-24T22:00:00Z | 59824.2 | 59890.1 | 6.89722152 | 0 | NO_DOCUMENTED_OBSERVATION |

## Étude de stratégie — structure EMA 5/13/34 (observation, pas backtest)

- Source : OKX Spot BTC-USDC 1H ; 71 bougies consécutives du 2026-11-22T00:00:00Z au 2026-11-24T22:00:00Z.
- Dernière clôture : 59890.1 USDC/BTC ; EMA 5 : 59818.08 ; EMA 13 : 59940.79 ; EMA 34 : 60322.99 USDC.
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
