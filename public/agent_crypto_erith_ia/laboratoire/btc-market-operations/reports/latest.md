# Seven Heaven — suivi public BTC : 2026-11-22T00:30:55Z

**Statut : OPERATIONAL_PARTIAL_COVERAGE** — lecture seule, couverture partielle documentée, aucune exécution réelle.

Fenêtre UTC : 2026-11-21T00:30:55Z au 2026-11-22T00:30:55Z.

## Santé et provenance

- **OKX Spot BTC-USDC 1H** : 23 bougies clôturées dans cette fenêtre ; dernière bougie 2026-11-21T23:00:00Z ; source fraîche : OUI.
- **Liquidations dérivées** : 262 messages observés dans les archives ; 12 fenêtres de connexion par fournisseur (les périodes sans connexion sont inconnues, **pas des liquidations nulles**).
- **Actualités de l'Interface** : 4 événements BTC ; relevé source 2026-11-21T21:13:54.788292+00:00.

| Source dérivés | Messages observés | Fenêtres de connexion |
|---|---:|---:|
| bybit | 165 | 4 |
| binance | 61 | 4 |
| okx | 36 | 4 |

## Interprétation autorisée

Ce rapport constate des **coïncidences temporelles** quand des données sont présentes. Il ne déduit aucune vente Spot d’une liquidation sur dérivés et ne prouve **aucune causalité** des articles.

Les montants OKX en contrats ne sont pas convertis en USDT sans multiplicateur vérifié. Les messages Bybit/Binance ne constituent pas un total mondial.

## Dernières heures Spot archivées

| UTC | Ouverture (USDC) | Clôture (USDC) | Volume Spot BTC | Messages de liquidations observés | Couverture |
|---|---:|---:|---:|---:|---|
| 2026-11-21T12:00:00Z | 58127.6 | 58775.2 | 104.19315137 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-21T13:00:00Z | 58769.3 | 60467.5 | 168.41579292 | 197 | SAMPLED_WITH_GAPS |
| 2026-11-21T14:00:00Z | 60487.8 | 60245.4 | 104.35028726 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-21T15:00:00Z | 60242.4 | 59844.7 | 54.82948701 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-21T16:00:00Z | 59832.5 | 59959.1 | 19.0686708 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-21T17:00:00Z | 59960 | 59982.6 | 23.64782583 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-21T18:00:00Z | 59982.6 | 60052.1 | 17.4177483 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-21T19:00:00Z | 60055.9 | 60233.9 | 26.33817285 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-21T20:00:00Z | 60229.6 | 60334 | 13.15918517 | 1 | SAMPLED_WITH_GAPS |
| 2026-11-21T21:00:00Z | 60336.7 | 60355 | 14.38195413 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-21T22:00:00Z | 60361.2 | 60038.5 | 10.76614414 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-21T23:00:00Z | 60045.7 | 60101.1 | 24.78430927 | 0 | NO_DOCUMENTED_OBSERVATION |

## Étude de stratégie — structure EMA 5/13/34 (observation, pas backtest)

- Source : OKX Spot BTC-USDC 1H ; 71 bougies consécutives du 2026-11-19T01:00:00Z au 2026-11-21T23:00:00Z.
- Dernière clôture : 60101.1 USDC/BTC ; EMA 5 : 60125.82 ; EMA 13 : 59775.38 ; EMA 34 : 59695.38 USDC.
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
