# Seven Heaven — suivi public BTC : 2026-11-17T22:30:33Z

**Statut : DEGRADED_OR_UNVERIFIED** — lecture seule, couverture partielle documentée, aucune exécution réelle.

Fenêtre UTC : 2026-11-16T22:30:33Z au 2026-11-17T22:30:33Z.

## Santé et provenance

- **OKX Spot BTC-USDC 1H** : 23 bougies clôturées dans cette fenêtre ; dernière bougie 2026-11-17T21:00:00Z ; source fraîche : OUI.
- **Liquidations dérivées** : 4 messages observés dans les archives ; 9 fenêtres de connexion par fournisseur (les périodes sans connexion sont inconnues, **pas des liquidations nulles**).
- **Actualités de l'Interface** : 8 événements BTC ; relevé source 2026-11-17T13:55:30.436539+00:00.

| Source dérivés | Messages observés | Fenêtres de connexion |
|---|---:|---:|
| bybit | 1 | 3 |
| binance | 3 | 3 |
| okx | 0 | 3 |

## Interprétation autorisée

Ce rapport constate des **coïncidences temporelles** quand des données sont présentes. Il ne déduit aucune vente Spot d’une liquidation sur dérivés et ne prouve **aucune causalité** des articles.

Les montants OKX en contrats ne sont pas convertis en USDT sans multiplicateur vérifié. Les messages Bybit/Binance ne constituent pas un total mondial.

## Dernières heures Spot archivées

| UTC | Ouverture (USDC) | Clôture (USDC) | Volume Spot BTC | Messages de liquidations observés | Couverture |
|---|---:|---:|---:|---:|---|
| 2026-11-17T10:00:00Z | 64314 | 64048.9 | 49.46288391 | 4 | SAMPLED_WITH_GAPS |
| 2026-11-17T11:00:00Z | 64049.6 | 64945.5 | 34.09808189 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-17T12:00:00Z | 64952.6 | 65015.3 | 18.20915371 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-17T13:00:00Z | 65017 | 65107.9 | 22.87514829 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-17T14:00:00Z | 65094.6 | 64967.7 | 66.33674772 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-17T15:00:00Z | 64963.9 | 64064.3 | 83.84880701 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-17T16:00:00Z | 64052.8 | 63692.7 | 58.82658624 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-17T17:00:00Z | 63688.9 | 63774.5 | 47.70453528 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-17T18:00:00Z | 63775.7 | 63713.4 | 15.40816714 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-17T19:00:00Z | 63705.4 | 63695.9 | 32.38276997 | 0 | SAMPLED_WITH_GAPS |
| 2026-11-17T20:00:00Z | 63696 | 63922.8 | 27.68451438 | 0 | SAMPLED_WITH_GAPS |
| 2026-11-17T21:00:00Z | 63938.3 | 64308.8 | 75.23180407 | 0 | NO_DOCUMENTED_OBSERVATION |

## Étude de stratégie — structure EMA 5/13/34 (observation, pas backtest)

- Source : OKX Spot BTC-USDC 1H ; 71 bougies consécutives du 2026-11-14T23:00:00Z au 2026-11-17T21:00:00Z.
- Dernière clôture : 64308.8 USDC/BTC ; EMA 5 : 64037.45 ; EMA 13 : 64203.84 ; EMA 34 : 64457.0 USDC.
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
