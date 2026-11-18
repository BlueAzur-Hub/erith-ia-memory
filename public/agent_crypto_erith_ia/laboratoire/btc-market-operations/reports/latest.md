# Seven Heaven — suivi public BTC : 2026-11-18T14:21:28Z

**Statut : DEGRADED_OR_UNVERIFIED** — lecture seule, couverture partielle documentée, aucune exécution réelle.

Fenêtre UTC : 2026-11-17T14:21:28Z au 2026-11-18T14:21:28Z.

## Santé et provenance

- **OKX Spot BTC-USDC 1H** : 23 bougies clôturées dans cette fenêtre ; dernière bougie 2026-11-18T13:00:00Z ; source fraîche : OUI.
- **Liquidations dérivées** : 13 messages observés dans les archives ; 9 fenêtres de connexion par fournisseur (les périodes sans connexion sont inconnues, **pas des liquidations nulles**).
- **Actualités de l'Interface** : 11 événements BTC ; relevé source 2026-11-18T13:29:48.172369+00:00.

| Source dérivés | Messages observés | Fenêtres de connexion |
|---|---:|---:|
| bybit | 3 | 3 |
| binance | 9 | 3 |
| okx | 1 | 3 |

## Interprétation autorisée

Ce rapport constate des **coïncidences temporelles** quand des données sont présentes. Il ne déduit aucune vente Spot d’une liquidation sur dérivés et ne prouve **aucune causalité** des articles.

Les montants OKX en contrats ne sont pas convertis en USDT sans multiplicateur vérifié. Les messages Bybit/Binance ne constituent pas un total mondial.

## Dernières heures Spot archivées

| UTC | Ouverture (USDC) | Clôture (USDC) | Volume Spot BTC | Messages de liquidations observés | Couverture |
|---|---:|---:|---:|---:|---|
| 2026-11-18T02:00:00Z | 64248.9 | 64266.3 | 8.59699688 | 4 | SAMPLED_WITH_GAPS |
| 2026-11-18T03:00:00Z | 64267.7 | 64393.8 | 5.79705635 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-18T04:00:00Z | 64390.8 | 64385.3 | 5.25856729 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-18T05:00:00Z | 64359.6 | 64634.1 | 8.94652208 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-18T06:00:00Z | 64613.5 | 64556.5 | 7.3738159 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-18T07:00:00Z | 64556.5 | 64822.7 | 15.49595499 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-18T08:00:00Z | 64816.2 | 64628.7 | 9.18060726 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-18T09:00:00Z | 64633.5 | 64575.6 | 19.04146333 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-18T10:00:00Z | 64583.1 | 64306.4 | 49.65343657 | 9 | SAMPLED_WITH_GAPS |
| 2026-11-18T11:00:00Z | 64302.2 | 64173.6 | 61.22743998 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-18T12:00:00Z | 64181.7 | 64021.7 | 22.61247374 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-18T13:00:00Z | 64019.6 | 63871.7 | 27.58725228 | 0 | NO_DOCUMENTED_OBSERVATION |

## Étude de stratégie — structure EMA 5/13/34 (observation, pas backtest)

- Source : OKX Spot BTC-USDC 1H ; 71 bougies consécutives du 2026-11-15T15:00:00Z au 2026-11-18T13:00:00Z.
- Dernière clôture : 63871.7 USDC/BTC ; EMA 5 : 64136.83 ; EMA 13 : 64309.98 ; EMA 34 : 64424.2 USDC.
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
