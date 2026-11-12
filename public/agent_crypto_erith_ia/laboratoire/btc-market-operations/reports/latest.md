# Seven Heaven — suivi public BTC : 2026-11-12T23:43:28Z

**Statut : DEGRADED_OR_UNVERIFIED** — lecture seule, couverture partielle documentée, aucune exécution réelle.

Fenêtre UTC : 2026-11-11T23:43:28Z au 2026-11-12T23:43:28Z.

## Santé et provenance

- **OKX Spot BTC-USDC 1H** : 23 bougies clôturées dans cette fenêtre ; dernière bougie 2026-11-12T22:00:00Z ; source fraîche : OUI.
- **Liquidations dérivées** : 1 messages observés dans les archives ; 9 fenêtres de connexion par fournisseur (les périodes sans connexion sont inconnues, **pas des liquidations nulles**).
- **Actualités de l'Interface** : 10 événements BTC ; relevé source 2026-11-12T22:53:00.636310+00:00.

| Source dérivés | Messages observés | Fenêtres de connexion |
|---|---:|---:|
| bybit | 0 | 3 |
| binance | 1 | 3 |
| okx | 0 | 3 |

## Interprétation autorisée

Ce rapport constate des **coïncidences temporelles** quand des données sont présentes. Il ne déduit aucune vente Spot d’une liquidation sur dérivés et ne prouve **aucune causalité** des articles.

Les montants OKX en contrats ne sont pas convertis en USDT sans multiplicateur vérifié. Les messages Bybit/Binance ne constituent pas un total mondial.

## Dernières heures Spot archivées

| UTC | Ouverture (USDC) | Clôture (USDC) | Volume Spot BTC | Messages de liquidations observés | Couverture |
|---|---:|---:|---:|---:|---|
| 2026-11-12T11:00:00Z | 73389.3 | 72886.7 | 63.44479842 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-12T12:00:00Z | 72876.3 | 72846.6 | 43.35582906 | 1 | SAMPLED_WITH_GAPS |
| 2026-11-12T13:00:00Z | 72841.1 | 72444.4 | 127.09437554 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-12T14:00:00Z | 72440.7 | 71579 | 235.63106283 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-12T15:00:00Z | 71579 | 71659.8 | 121.6213126 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-12T16:00:00Z | 71636.3 | 71701.2 | 62.9748488 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-12T17:00:00Z | 71704.7 | 71853.9 | 37.26898737 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-12T18:00:00Z | 71850 | 71708.1 | 27.22666061 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-12T19:00:00Z | 71708.1 | 71628.1 | 30.99106893 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-12T20:00:00Z | 71628.1 | 71383.6 | 92.50227312 | 0 | SAMPLED_WITH_GAPS |
| 2026-11-12T21:00:00Z | 71384.1 | 71493.2 | 40.90542975 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-12T22:00:00Z | 71490 | 71349.7 | 25.22005977 | 0 | NO_DOCUMENTED_OBSERVATION |

## Étude de stratégie — structure EMA 5/13/34 (observation, pas backtest)

- Source : OKX Spot BTC-USDC 1H ; 71 bougies consécutives du 2026-11-10T00:00:00Z au 2026-11-12T22:00:00Z.
- Dernière clôture : 71349.7 USDC/BTC ; EMA 5 : 71519.64 ; EMA 13 : 71986.93 ; EMA 34 : 72799.02 USDC.
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
