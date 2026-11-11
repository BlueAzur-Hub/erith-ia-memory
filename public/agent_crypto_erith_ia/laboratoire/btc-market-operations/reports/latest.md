# Seven Heaven — suivi public BTC : 2026-11-11T02:00:38Z

**Statut : OPERATIONAL_PARTIAL_COVERAGE** — lecture seule, couverture partielle documentée, aucune exécution réelle.

Fenêtre UTC : 2026-11-10T02:00:38Z au 2026-11-11T02:00:38Z.

## Santé et provenance

- **OKX Spot BTC-USDC 1H** : 23 bougies clôturées dans cette fenêtre ; dernière bougie 2026-11-11T01:00:00Z ; source fraîche : OUI.
- **Liquidations dérivées** : 1297 messages observés dans les archives ; 12 fenêtres de connexion par fournisseur (les périodes sans connexion sont inconnues, **pas des liquidations nulles**).
- **Actualités de l'Interface** : 14 événements BTC ; relevé source 2026-11-10T22:34:02.735375+00:00.

| Source dérivés | Messages observés | Fenêtres de connexion |
|---|---:|---:|
| bybit | 1041 | 4 |
| binance | 160 | 4 |
| okx | 96 | 4 |

## Interprétation autorisée

Ce rapport constate des **coïncidences temporelles** quand des données sont présentes. Il ne déduit aucune vente Spot d’une liquidation sur dérivés et ne prouve **aucune causalité** des articles.

Les montants OKX en contrats ne sont pas convertis en USDT sans multiplicateur vérifié. Les messages Bybit/Binance ne constituent pas un total mondial.

## Dernières heures Spot archivées

| UTC | Ouverture (USDC) | Clôture (USDC) | Volume Spot BTC | Messages de liquidations observés | Couverture |
|---|---:|---:|---:|---:|---|
| 2026-11-10T14:00:00Z | 73671.6 | 74336.5 | 47.59983469 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-10T15:00:00Z | 74337 | 73152.8 | 236.49627083 | 1277 | SAMPLED_WITH_GAPS |
| 2026-11-10T16:00:00Z | 73150 | 72830.3 | 127.55348552 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-10T17:00:00Z | 72823 | 73229.5 | 70.78115218 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-10T18:00:00Z | 73239.7 | 73425.7 | 52.02001434 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-10T19:00:00Z | 73425.6 | 73407.4 | 40.85959311 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-10T20:00:00Z | 73407.5 | 73718.1 | 52.40878255 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-10T21:00:00Z | 73718 | 73788.3 | 33.43318524 | 0 | SAMPLED_WITH_GAPS |
| 2026-11-10T22:00:00Z | 73788.4 | 73633.4 | 21.14782441 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-10T23:00:00Z | 73631.2 | 73722.5 | 24.10751607 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-11T00:00:00Z | 73725.3 | 73468.6 | 36.26159202 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-11T01:00:00Z | 73468.7 | 73529 | 24.1362485 | 20 | SAMPLED_WITH_GAPS |

## Étude de stratégie — structure EMA 5/13/34 (observation, pas backtest)

- Source : OKX Spot BTC-USDC 1H ; 71 bougies consécutives du 2026-11-08T03:00:00Z au 2026-11-11T01:00:00Z.
- Dernière clôture : 73529.0 USDC/BTC ; EMA 5 : 73570.16 ; EMA 13 : 73686.28 ; EMA 34 : 74131.87 USDC.
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
