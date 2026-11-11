# Seven Heaven — suivi public BTC : 2026-11-11T09:38:33Z

**Statut : OPERATIONAL_PARTIAL_COVERAGE** — lecture seule, couverture partielle documentée, aucune exécution réelle.

Fenêtre UTC : 2026-11-10T09:38:33Z au 2026-11-11T09:38:33Z.

## Santé et provenance

- **OKX Spot BTC-USDC 1H** : 23 bougies clôturées dans cette fenêtre ; dernière bougie 2026-11-11T08:00:00Z ; source fraîche : OUI.
- **Liquidations dérivées** : 1328 messages observés dans les archives ; 15 fenêtres de connexion par fournisseur (les périodes sans connexion sont inconnues, **pas des liquidations nulles**).
- **Actualités de l'Interface** : 11 événements BTC ; relevé source 2026-11-11T02:17:35.469900+00:00.

| Source dérivés | Messages observés | Fenêtres de connexion |
|---|---:|---:|
| bybit | 1054 | 5 |
| binance | 174 | 5 |
| okx | 100 | 5 |

## Interprétation autorisée

Ce rapport constate des **coïncidences temporelles** quand des données sont présentes. Il ne déduit aucune vente Spot d’une liquidation sur dérivés et ne prouve **aucune causalité** des articles.

Les montants OKX en contrats ne sont pas convertis en USDT sans multiplicateur vérifié. Les messages Bybit/Binance ne constituent pas un total mondial.

## Dernières heures Spot archivées

| UTC | Ouverture (USDC) | Clôture (USDC) | Volume Spot BTC | Messages de liquidations observés | Couverture |
|---|---:|---:|---:|---:|---|
| 2026-11-10T21:00:00Z | 73718 | 73788.3 | 33.43318524 | 0 | SAMPLED_WITH_GAPS |
| 2026-11-10T22:00:00Z | 73788.4 | 73633.4 | 21.14782441 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-10T23:00:00Z | 73631.2 | 73722.5 | 24.10751607 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-11T00:00:00Z | 73725.3 | 73468.6 | 36.26159202 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-11T01:00:00Z | 73468.7 | 73529 | 24.1362485 | 20 | SAMPLED_WITH_GAPS |
| 2026-11-11T02:00:00Z | 73529 | 73575.9 | 21.60879003 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-11T03:00:00Z | 73572.3 | 73702.5 | 8.82108238 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-11T04:00:00Z | 73703.1 | 73642.4 | 10.72962563 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-11T05:00:00Z | 73665.3 | 73848.7 | 9.91893486 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-11T06:00:00Z | 73860.8 | 73550.1 | 22.84302577 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-11T07:00:00Z | 73546.9 | 74021.9 | 19.49047048 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-11T08:00:00Z | 74019 | 73662.5 | 14.31187565 | 31 | SAMPLED_WITH_GAPS |

## Étude de stratégie — structure EMA 5/13/34 (observation, pas backtest)

- Source : OKX Spot BTC-USDC 1H ; 71 bougies consécutives du 2026-11-08T10:00:00Z au 2026-11-11T08:00:00Z.
- Dernière clôture : 73662.5 USDC/BTC ; EMA 5 : 73736.6 ; EMA 13 : 73715.76 ; EMA 34 : 73984.88 USDC.
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
