# Seven Heaven — suivi public BTC : 2026-11-10T21:52:18Z

**Statut : OPERATIONAL_PARTIAL_COVERAGE** — lecture seule, couverture partielle documentée, aucune exécution réelle.

Fenêtre UTC : 2026-11-09T21:52:18Z au 2026-11-10T21:52:18Z.

## Santé et provenance

- **OKX Spot BTC-USDC 1H** : 23 bougies clôturées dans cette fenêtre ; dernière bougie 2026-11-10T20:00:00Z ; source fraîche : OUI.
- **Liquidations dérivées** : 1277 messages observés dans les archives ; 9 fenêtres de connexion par fournisseur (les périodes sans connexion sont inconnues, **pas des liquidations nulles**).
- **Actualités de l'Interface** : 12 événements BTC ; relevé source 2026-11-10T17:20:02.062581+00:00.

| Source dérivés | Messages observés | Fenêtres de connexion |
|---|---:|---:|
| bybit | 1039 | 3 |
| binance | 151 | 3 |
| okx | 87 | 3 |

## Interprétation autorisée

Ce rapport constate des **coïncidences temporelles** quand des données sont présentes. Il ne déduit aucune vente Spot d’une liquidation sur dérivés et ne prouve **aucune causalité** des articles.

Les montants OKX en contrats ne sont pas convertis en USDT sans multiplicateur vérifié. Les messages Bybit/Binance ne constituent pas un total mondial.

## Dernières heures Spot archivées

| UTC | Ouverture (USDC) | Clôture (USDC) | Volume Spot BTC | Messages de liquidations observés | Couverture |
|---|---:|---:|---:|---:|---|
| 2026-11-10T09:00:00Z | 74648.4 | 74439 | 30.83258595 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-10T10:00:00Z | 74431.7 | 74157 | 20.98295035 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-10T11:00:00Z | 74149.7 | 74353.7 | 34.1235545 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-10T12:00:00Z | 74344.7 | 74329.9 | 13.67210178 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-10T13:00:00Z | 74313.4 | 73679.9 | 114.17539267 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-10T14:00:00Z | 73671.6 | 74336.5 | 47.59983469 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-10T15:00:00Z | 74337 | 73152.8 | 236.49627083 | 1277 | SAMPLED_WITH_GAPS |
| 2026-11-10T16:00:00Z | 73150 | 72830.3 | 127.55348552 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-10T17:00:00Z | 72823 | 73229.5 | 70.78115218 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-10T18:00:00Z | 73239.7 | 73425.7 | 52.02001434 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-10T19:00:00Z | 73425.6 | 73407.4 | 40.85959311 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-10T20:00:00Z | 73407.5 | 73718.1 | 52.40878255 | 0 | NO_DOCUMENTED_OBSERVATION |

## Étude de stratégie — structure EMA 5/13/34 (observation, pas backtest)

- Source : OKX Spot BTC-USDC 1H ; 71 bougies consécutives du 2026-11-07T22:00:00Z au 2026-11-10T20:00:00Z.
- Dernière clôture : 73718.1 USDC/BTC ; EMA 5 : 73517.87 ; EMA 13 : 73777.52 ; EMA 34 : 74296.79 USDC.
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
