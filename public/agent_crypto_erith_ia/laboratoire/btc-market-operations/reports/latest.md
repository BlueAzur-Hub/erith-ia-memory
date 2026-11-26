# Seven Heaven — suivi public BTC : 2026-11-26T02:57:07Z

**Statut : DEGRADED_OR_UNVERIFIED** — lecture seule, couverture partielle documentée, aucune exécution réelle.

Fenêtre UTC : 2026-11-25T02:57:07Z au 2026-11-26T02:57:07Z.

## Santé et provenance

- **OKX Spot BTC-USDC 1H** : 23 bougies clôturées dans cette fenêtre ; dernière bougie 2026-11-26T01:00:00Z ; source fraîche : OUI.
- **Liquidations dérivées** : 5 messages observés dans les archives ; 9 fenêtres de connexion par fournisseur (les périodes sans connexion sont inconnues, **pas des liquidations nulles**).
- **Actualités de l'Interface** : 13 événements BTC ; relevé source 2026-11-25T23:48:35.245242+00:00.

| Source dérivés | Messages observés | Fenêtres de connexion |
|---|---:|---:|
| bybit | 0 | 3 |
| binance | 5 | 3 |
| okx | 0 | 3 |

## Interprétation autorisée

Ce rapport constate des **coïncidences temporelles** quand des données sont présentes. Il ne déduit aucune vente Spot d’une liquidation sur dérivés et ne prouve **aucune causalité** des articles.

Les montants OKX en contrats ne sont pas convertis en USDT sans multiplicateur vérifié. Les messages Bybit/Binance ne constituent pas un total mondial.

## Dernières heures Spot archivées

| UTC | Ouverture (USDC) | Clôture (USDC) | Volume Spot BTC | Messages de liquidations observés | Couverture |
|---|---:|---:|---:|---:|---|
| 2026-11-25T14:00:00Z | 58002.1 | 58158.6 | 156.21847508 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-25T15:00:00Z | 58159.5 | 58273.9 | 55.50130545 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-25T16:00:00Z | 58271.9 | 58543.9 | 29.26468547 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-25T17:00:00Z | 58525.9 | 59553 | 55.84430311 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-25T18:00:00Z | 59543.8 | 59681 | 30.1894549 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-25T19:00:00Z | 59658.9 | 59823.3 | 25.3754594 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-25T20:00:00Z | 59829.7 | 60202.6 | 27.39628321 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-25T21:00:00Z | 60202.4 | 60180 | 18.23933908 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-25T22:00:00Z | 60177.9 | 60040.4 | 8.16796767 | 3 | SAMPLED_WITH_GAPS |
| 2026-11-25T23:00:00Z | 60037.6 | 60385.8 | 13.03415907 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-26T00:00:00Z | 60389.7 | 60438 | 142.94550799 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-26T01:00:00Z | 60455.3 | 60787.9 | 103.59838262 | 0 | NO_DOCUMENTED_OBSERVATION |

## Étude de stratégie — structure EMA 5/13/34 (observation, pas backtest)

- Source : OKX Spot BTC-USDC 1H ; 71 bougies consécutives du 2026-11-23T03:00:00Z au 2026-11-26T01:00:00Z.
- Dernière clôture : 60787.9 USDC/BTC ; EMA 5 : 60383.66 ; EMA 13 : 59870.02 ; EMA 34 : 59720.89 USDC.
- Structure horaire observée : **ALIGNEMENT_HAUSSIER_HORAIRE**.
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
