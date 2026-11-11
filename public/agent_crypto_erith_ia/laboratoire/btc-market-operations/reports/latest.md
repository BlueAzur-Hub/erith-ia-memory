# Seven Heaven — suivi public BTC : 2026-11-11T17:57:46Z

**Statut : OPERATIONAL_PARTIAL_COVERAGE** — lecture seule, couverture partielle documentée, aucune exécution réelle.

Fenêtre UTC : 2026-11-10T17:57:46Z au 2026-11-11T17:57:46Z.

## Santé et provenance

- **OKX Spot BTC-USDC 1H** : 23 bougies clôturées dans cette fenêtre ; dernière bougie 2026-11-11T16:00:00Z ; source fraîche : OUI.
- **Liquidations dérivées** : 54 messages observés dans les archives ; 12 fenêtres de connexion par fournisseur (les périodes sans connexion sont inconnues, **pas des liquidations nulles**).
- **Actualités de l'Interface** : 5 événements BTC ; relevé source 2026-11-11T09:53:07.774296+00:00.

| Source dérivés | Messages observés | Fenêtres de connexion |
|---|---:|---:|
| bybit | 16 | 4 |
| binance | 24 | 4 |
| okx | 14 | 4 |

## Interprétation autorisée

Ce rapport constate des **coïncidences temporelles** quand des données sont présentes. Il ne déduit aucune vente Spot d’une liquidation sur dérivés et ne prouve **aucune causalité** des articles.

Les montants OKX en contrats ne sont pas convertis en USDT sans multiplicateur vérifié. Les messages Bybit/Binance ne constituent pas un total mondial.

## Dernières heures Spot archivées

| UTC | Ouverture (USDC) | Clôture (USDC) | Volume Spot BTC | Messages de liquidations observés | Couverture |
|---|---:|---:|---:|---:|---|
| 2026-11-11T05:00:00Z | 73665.3 | 73848.7 | 9.91893486 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-11T06:00:00Z | 73860.8 | 73550.1 | 22.84302577 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-11T07:00:00Z | 73546.9 | 74021.9 | 19.49047048 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-11T08:00:00Z | 74019 | 73662.5 | 14.31187565 | 31 | SAMPLED_WITH_GAPS |
| 2026-11-11T09:00:00Z | 73664.2 | 73733.7 | 13.16433518 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-11T10:00:00Z | 73733.8 | 73998.9 | 18.771844 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-11T11:00:00Z | 74004.9 | 73943.7 | 9.93141152 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-11T12:00:00Z | 73957 | 73840.3 | 18.81775631 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-11T13:00:00Z | 73840.3 | 73738 | 16.03861129 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-11T14:00:00Z | 73741.7 | 73507.1 | 37.09719502 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-11T15:00:00Z | 73528.1 | 73928.4 | 33.21275943 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-11T16:00:00Z | 73928.1 | 74202.6 | 24.66498543 | 3 | SAMPLED_WITH_GAPS |

## Étude de stratégie — structure EMA 5/13/34 (observation, pas backtest)

- Source : OKX Spot BTC-USDC 1H ; 71 bougies consécutives du 2026-11-08T18:00:00Z au 2026-11-11T16:00:00Z.
- Dernière clôture : 74202.6 USDC/BTC ; EMA 5 : 73924.23 ; EMA 13 : 73833.02 ; EMA 34 : 73921.0 USDC.
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
