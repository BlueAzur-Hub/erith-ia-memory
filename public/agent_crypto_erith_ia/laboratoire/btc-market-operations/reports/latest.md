# Seven Heaven — suivi public BTC : 2026-11-25T08:54:40Z

**Statut : DEGRADED_OR_UNVERIFIED** — lecture seule, couverture partielle documentée, aucune exécution réelle.

Fenêtre UTC : 2026-11-24T08:54:40Z au 2026-11-25T08:54:40Z.

## Santé et provenance

- **OKX Spot BTC-USDC 1H** : 23 bougies clôturées dans cette fenêtre ; dernière bougie 2026-11-25T07:00:00Z ; source fraîche : OUI.
- **Liquidations dérivées** : 12 messages observés dans les archives ; 6 fenêtres de connexion par fournisseur (les périodes sans connexion sont inconnues, **pas des liquidations nulles**).
- **Actualités de l'Interface** : 15 événements BTC ; relevé source 2026-11-25T04:37:36.507729+00:00.

| Source dérivés | Messages observés | Fenêtres de connexion |
|---|---:|---:|
| bybit | 1 | 2 |
| binance | 5 | 2 |
| okx | 6 | 2 |

## Interprétation autorisée

Ce rapport constate des **coïncidences temporelles** quand des données sont présentes. Il ne déduit aucune vente Spot d’une liquidation sur dérivés et ne prouve **aucune causalité** des articles.

Les montants OKX en contrats ne sont pas convertis en USDT sans multiplicateur vérifié. Les messages Bybit/Binance ne constituent pas un total mondial.

## Dernières heures Spot archivées

| UTC | Ouverture (USDC) | Clôture (USDC) | Volume Spot BTC | Messages de liquidations observés | Couverture |
|---|---:|---:|---:|---:|---|
| 2026-11-24T20:00:00Z | 59618.4 | 59711.4 | 22.19418716 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-24T21:00:00Z | 59694.6 | 59835.1 | 19.96533297 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-24T22:00:00Z | 59824.2 | 59890.1 | 6.89722152 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-24T23:00:00Z | 59903.7 | 59749.2 | 8.66360642 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-25T00:00:00Z | 59749.1 | 59571.4 | 21.47568602 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-25T01:00:00Z | 59589.3 | 59189.7 | 16.02095391 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-25T02:00:00Z | 59199.2 | 59157 | 30.09366991 | 9 | SAMPLED_WITH_GAPS |
| 2026-11-25T03:00:00Z | 59170.6 | 59346.8 | 11.75374668 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-25T04:00:00Z | 59332.1 | 59140.2 | 17.95380099 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-25T05:00:00Z | 59156.3 | 59075.1 | 11.40906028 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-25T06:00:00Z | 59083.9 | 59170.6 | 8.98081443 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-25T07:00:00Z | 59155.9 | 58671.5 | 83.0345471 | 0 | NO_DOCUMENTED_OBSERVATION |

## Étude de stratégie — structure EMA 5/13/34 (observation, pas backtest)

- Source : OKX Spot BTC-USDC 1H ; 71 bougies consécutives du 2026-11-22T09:00:00Z au 2026-11-25T07:00:00Z.
- Dernière clôture : 58671.5 USDC/BTC ; EMA 5 : 59030.83 ; EMA 13 : 59336.24 ; EMA 34 : 59869.07 USDC.
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
