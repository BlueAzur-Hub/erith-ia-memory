# Seven Heaven — suivi public BTC : 2026-11-19T13:36:04Z

**Statut : DEGRADED_OR_UNVERIFIED** — lecture seule, couverture partielle documentée, aucune exécution réelle.

Fenêtre UTC : 2026-11-18T13:36:04Z au 2026-11-19T13:36:04Z.

## Santé et provenance

- **OKX Spot BTC-USDC 1H** : 23 bougies clôturées dans cette fenêtre ; dernière bougie 2026-11-19T12:00:00Z ; source fraîche : OUI.
- **Liquidations dérivées** : 40 messages observés dans les archives ; 9 fenêtres de connexion par fournisseur (les périodes sans connexion sont inconnues, **pas des liquidations nulles**).
- **Actualités de l'Interface** : 10 événements BTC ; relevé source 2026-11-19T10:48:32.411215+00:00.

| Source dérivés | Messages observés | Fenêtres de connexion |
|---|---:|---:|
| bybit | 11 | 3 |
| binance | 15 | 3 |
| okx | 14 | 3 |

## Interprétation autorisée

Ce rapport constate des **coïncidences temporelles** quand des données sont présentes. Il ne déduit aucune vente Spot d’une liquidation sur dérivés et ne prouve **aucune causalité** des articles.

Les montants OKX en contrats ne sont pas convertis en USDT sans multiplicateur vérifié. Les messages Bybit/Binance ne constituent pas un total mondial.

## Dernières heures Spot archivées

| UTC | Ouverture (USDC) | Clôture (USDC) | Volume Spot BTC | Messages de liquidations observés | Couverture |
|---|---:|---:|---:|---:|---|
| 2026-11-19T01:00:00Z | 63125.3 | 62796.6 | 22.69284515 | 22 | SAMPLED_WITH_GAPS |
| 2026-11-19T02:00:00Z | 62786.1 | 62549.4 | 16.73406494 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-19T03:00:00Z | 62551.5 | 63147.7 | 15.23115295 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-19T04:00:00Z | 63158.7 | 63533.7 | 22.50077738 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-19T05:00:00Z | 63525.2 | 63308.3 | 18.37407321 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-19T06:00:00Z | 63290.4 | 63698.1 | 16.27309029 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-19T07:00:00Z | 63698.4 | 63687.6 | 23.03379409 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-19T08:00:00Z | 63671.3 | 63688.8 | 16.8989894 | 4 | SAMPLED_WITH_GAPS |
| 2026-11-19T09:00:00Z | 63673.3 | 63801.7 | 21.63149177 | 0 | SAMPLED_WITH_GAPS |
| 2026-11-19T10:00:00Z | 63806.7 | 63737.1 | 12.78201754 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-19T11:00:00Z | 63737.1 | 63892 | 14.49725916 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-19T12:00:00Z | 63903.7 | 63818.6 | 23.47466731 | 0 | NO_DOCUMENTED_OBSERVATION |

## Étude de stratégie — structure EMA 5/13/34 (observation, pas backtest)

- Source : OKX Spot BTC-USDC 1H ; 71 bougies consécutives du 2026-11-16T14:00:00Z au 2026-11-19T12:00:00Z.
- Dernière clôture : 63818.6 USDC/BTC ; EMA 5 : 63764.92 ; EMA 13 : 63547.96 ; EMA 34 : 63613.35 USDC.
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
