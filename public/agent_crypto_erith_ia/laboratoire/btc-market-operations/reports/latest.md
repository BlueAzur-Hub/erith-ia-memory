# Seven Heaven — suivi public BTC : 2026-11-25T19:28:17Z

**Statut : DEGRADED_OR_UNVERIFIED** — lecture seule, couverture partielle documentée, aucune exécution réelle.

Fenêtre UTC : 2026-11-24T19:28:17Z au 2026-11-25T19:28:17Z.

## Santé et provenance

- **OKX Spot BTC-USDC 1H** : 23 bougies clôturées dans cette fenêtre ; dernière bougie 2026-11-25T18:00:00Z ; source fraîche : OUI.
- **Liquidations dérivées** : 11 messages observés dans les archives ; 6 fenêtres de connexion par fournisseur (les périodes sans connexion sont inconnues, **pas des liquidations nulles**).
- **Actualités de l'Interface** : 10 événements BTC ; relevé source 2026-11-25T15:00:39.790558+00:00.

| Source dérivés | Messages observés | Fenêtres de connexion |
|---|---:|---:|
| bybit | 1 | 2 |
| binance | 7 | 2 |
| okx | 3 | 2 |

## Interprétation autorisée

Ce rapport constate des **coïncidences temporelles** quand des données sont présentes. Il ne déduit aucune vente Spot d’une liquidation sur dérivés et ne prouve **aucune causalité** des articles.

Les montants OKX en contrats ne sont pas convertis en USDT sans multiplicateur vérifié. Les messages Bybit/Binance ne constituent pas un total mondial.

## Dernières heures Spot archivées

| UTC | Ouverture (USDC) | Clôture (USDC) | Volume Spot BTC | Messages de liquidations observés | Couverture |
|---|---:|---:|---:|---:|---|
| 2026-11-25T07:00:00Z | 59155.9 | 58671.5 | 83.0345471 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-25T08:00:00Z | 58673.9 | 59360.7 | 31.6862 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-25T09:00:00Z | 59362.1 | 59013.3 | 15.52210606 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-25T10:00:00Z | 59013.2 | 58834.7 | 16.77507894 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-25T11:00:00Z | 58834.9 | 58571.3 | 78.0159761 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-25T12:00:00Z | 58557.2 | 58673.6 | 14.81049325 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-25T13:00:00Z | 58684.1 | 58004.8 | 97.71397899 | 2 | SAMPLED_WITH_GAPS |
| 2026-11-25T14:00:00Z | 58002.1 | 58158.6 | 156.21847508 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-25T15:00:00Z | 58159.5 | 58273.9 | 55.50130545 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-25T16:00:00Z | 58271.9 | 58543.9 | 29.26468547 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-25T17:00:00Z | 58525.9 | 59553 | 55.84430311 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-25T18:00:00Z | 59543.8 | 59681 | 30.1894549 | 0 | NO_DOCUMENTED_OBSERVATION |

## Étude de stratégie — structure EMA 5/13/34 (observation, pas backtest)

- Source : OKX Spot BTC-USDC 1H ; 71 bougies consécutives du 2026-11-22T20:00:00Z au 2026-11-25T18:00:00Z.
- Dernière clôture : 59681.0 USDC/BTC ; EMA 5 : 59094.01 ; EMA 13 : 58948.15 ; EMA 34 : 59389.69 USDC.
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
