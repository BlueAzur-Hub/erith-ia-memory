# Seven Heaven — suivi public BTC : 2026-11-12T00:53:27Z

**Statut : OPERATIONAL_PARTIAL_COVERAGE** — lecture seule, couverture partielle documentée, aucune exécution réelle.

Fenêtre UTC : 2026-11-11T00:53:27Z au 2026-11-12T00:53:27Z.

## Santé et provenance

- **OKX Spot BTC-USDC 1H** : 23 bougies clôturées dans cette fenêtre ; dernière bougie 2026-11-11T23:00:00Z ; source fraîche : OUI.
- **Liquidations dérivées** : 210 messages observés dans les archives ; 12 fenêtres de connexion par fournisseur (les périodes sans connexion sont inconnues, **pas des liquidations nulles**).
- **Actualités de l'Interface** : 11 événements BTC ; relevé source 2026-11-11T18:06:44.316094+00:00.

| Source dérivés | Messages observés | Fenêtres de connexion |
|---|---:|---:|
| bybit | 82 | 4 |
| binance | 81 | 4 |
| okx | 47 | 4 |

## Interprétation autorisée

Ce rapport constate des **coïncidences temporelles** quand des données sont présentes. Il ne déduit aucune vente Spot d’une liquidation sur dérivés et ne prouve **aucune causalité** des articles.

Les montants OKX en contrats ne sont pas convertis en USDT sans multiplicateur vérifié. Les messages Bybit/Binance ne constituent pas un total mondial.

## Dernières heures Spot archivées

| UTC | Ouverture (USDC) | Clôture (USDC) | Volume Spot BTC | Messages de liquidations observés | Couverture |
|---|---:|---:|---:|---:|---|
| 2026-11-11T12:00:00Z | 73957 | 73840.3 | 18.81775631 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-11T13:00:00Z | 73840.3 | 73738 | 16.03861129 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-11T14:00:00Z | 73741.7 | 73507.1 | 37.09719502 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-11T15:00:00Z | 73528.1 | 73928.4 | 33.21275943 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-11T16:00:00Z | 73928.1 | 74202.6 | 24.66498543 | 3 | SAMPLED_WITH_GAPS |
| 2026-11-11T17:00:00Z | 74201 | 74469.2 | 29.94189538 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-11T18:00:00Z | 74460.1 | 74446.1 | 17.21634192 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-11T19:00:00Z | 74436 | 74356.2 | 25.47984861 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-11T20:00:00Z | 74356.2 | 74620 | 25.62679256 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-11T21:00:00Z | 74618.4 | 74324.6 | 36.55567191 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-11T22:00:00Z | 74324.6 | 73878.9 | 21.56968302 | 1 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-11T23:00:00Z | 73879 | 73938.5 | 27.78752321 | 155 | SAMPLED_WITH_GAPS |

## Étude de stratégie — structure EMA 5/13/34 (observation, pas backtest)

- Source : OKX Spot BTC-USDC 1H ; 71 bougies consécutives du 2026-11-09T01:00:00Z au 2026-11-11T23:00:00Z.
- Dernière clôture : 73938.5 USDC/BTC ; EMA 5 : 74114.24 ; EMA 13 : 74093.0 ; EMA 34 : 74034.84 USDC.
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
