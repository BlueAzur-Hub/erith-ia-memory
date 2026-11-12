# Seven Heaven — suivi public BTC : 2026-11-12T17:40:41Z

**Statut : DEGRADED_OR_UNVERIFIED** — lecture seule, couverture partielle documentée, aucune exécution réelle.

Fenêtre UTC : 2026-11-11T17:40:41Z au 2026-11-12T17:40:41Z.

## Santé et provenance

- **OKX Spot BTC-USDC 1H** : 23 bougies clôturées dans cette fenêtre ; dernière bougie 2026-11-12T16:00:00Z ; source fraîche : OUI.
- **Liquidations dérivées** : 157 messages observés dans les archives ; 9 fenêtres de connexion par fournisseur (les périodes sans connexion sont inconnues, **pas des liquidations nulles**).
- **Actualités de l'Interface** : 9 événements BTC ; relevé source 2026-11-12T08:52:29.378966+00:00.

| Source dérivés | Messages observés | Fenêtres de connexion |
|---|---:|---:|
| bybit | 66 | 3 |
| binance | 58 | 3 |
| okx | 33 | 3 |

## Interprétation autorisée

Ce rapport constate des **coïncidences temporelles** quand des données sont présentes. Il ne déduit aucune vente Spot d’une liquidation sur dérivés et ne prouve **aucune causalité** des articles.

Les montants OKX en contrats ne sont pas convertis en USDT sans multiplicateur vérifié. Les messages Bybit/Binance ne constituent pas un total mondial.

## Dernières heures Spot archivées

| UTC | Ouverture (USDC) | Clôture (USDC) | Volume Spot BTC | Messages de liquidations observés | Couverture |
|---|---:|---:|---:|---:|---|
| 2026-11-12T05:00:00Z | 73657.4 | 73510.6 | 9.615828 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-12T06:00:00Z | 73516.7 | 73450.5 | 12.83627707 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-12T07:00:00Z | 73452.7 | 73576.8 | 6.07089971 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-12T08:00:00Z | 73573.4 | 73528.9 | 6.58515637 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-12T09:00:00Z | 73524.8 | 73419.6 | 19.58705076 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-12T10:00:00Z | 73423.5 | 73393.9 | 7.91629321 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-12T11:00:00Z | 73389.3 | 72886.7 | 63.44479842 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-12T12:00:00Z | 72876.3 | 72846.6 | 43.35582906 | 1 | SAMPLED_WITH_GAPS |
| 2026-11-12T13:00:00Z | 72841.1 | 72444.4 | 127.09437554 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-12T14:00:00Z | 72440.7 | 71579 | 235.63106283 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-12T15:00:00Z | 71579 | 71659.8 | 121.6213126 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-12T16:00:00Z | 71636.3 | 71701.2 | 62.9748488 | 0 | NO_DOCUMENTED_OBSERVATION |

## Étude de stratégie — structure EMA 5/13/34 (observation, pas backtest)

- Source : OKX Spot BTC-USDC 1H ; 71 bougies consécutives du 2026-11-09T18:00:00Z au 2026-11-12T16:00:00Z.
- Dernière clôture : 71701.2 USDC/BTC ; EMA 5 : 72030.87 ; EMA 13 : 72686.39 ; EMA 34 : 73339.03 USDC.
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
