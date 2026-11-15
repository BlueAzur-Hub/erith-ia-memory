# Seven Heaven — suivi public BTC : 2026-11-15T02:00:19Z

**Statut : OPERATIONAL_PARTIAL_COVERAGE** — lecture seule, couverture partielle documentée, aucune exécution réelle.

Fenêtre UTC : 2026-11-14T02:00:19Z au 2026-11-15T02:00:19Z.

## Santé et provenance

- **OKX Spot BTC-USDC 1H** : 23 bougies clôturées dans cette fenêtre ; dernière bougie 2026-11-15T01:00:00Z ; source fraîche : OUI.
- **Liquidations dérivées** : 167 messages observés dans les archives ; 15 fenêtres de connexion par fournisseur (les périodes sans connexion sont inconnues, **pas des liquidations nulles**).
- **Actualités de l'Interface** : 6 événements BTC ; relevé source 2026-11-14T23:26:11.761425+00:00.

| Source dérivés | Messages observés | Fenêtres de connexion |
|---|---:|---:|
| bybit | 97 | 5 |
| binance | 40 | 5 |
| okx | 30 | 5 |

## Interprétation autorisée

Ce rapport constate des **coïncidences temporelles** quand des données sont présentes. Il ne déduit aucune vente Spot d’une liquidation sur dérivés et ne prouve **aucune causalité** des articles.

Les montants OKX en contrats ne sont pas convertis en USDT sans multiplicateur vérifié. Les messages Bybit/Binance ne constituent pas un total mondial.

## Dernières heures Spot archivées

| UTC | Ouverture (USDC) | Clôture (USDC) | Volume Spot BTC | Messages de liquidations observés | Couverture |
|---|---:|---:|---:|---:|---|
| 2026-11-14T14:00:00Z | 66801.1 | 65880.6 | 155.70283984 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-14T15:00:00Z | 65879.7 | 65708.5 | 265.41330984 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-14T16:00:00Z | 65708.6 | 65329.6 | 93.35697975 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-14T17:00:00Z | 65316.3 | 65870 | 66.15583438 | 6 | SAMPLED_WITH_GAPS |
| 2026-11-14T18:00:00Z | 65860 | 65515.9 | 41.12931537 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-14T19:00:00Z | 65523.8 | 65691.9 | 35.81888056 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-14T20:00:00Z | 65700.7 | 64728.1 | 147.50635208 | 2 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-14T21:00:00Z | 64723.1 | 64432.1 | 322.22121203 | 12 | SAMPLED_WITH_GAPS |
| 2026-11-14T22:00:00Z | 64417.4 | 63518.6 | 252.34784404 | 8 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-14T23:00:00Z | 63508.5 | 64144.8 | 131.28344319 | 3 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-15T00:00:00Z | 64133.4 | 63419.2 | 94.64183446 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-15T01:00:00Z | 63414.4 | 62601.2 | 341.38178854 | 134 | SAMPLED_WITH_GAPS |

## Étude de stratégie — structure EMA 5/13/34 (observation, pas backtest)

- Source : OKX Spot BTC-USDC 1H ; 71 bougies consécutives du 2026-11-12T03:00:00Z au 2026-11-15T01:00:00Z.
- Dernière clôture : 62601.2 USDC/BTC ; EMA 5 : 63594.4 ; EMA 13 : 64703.63 ; EMA 34 : 66475.52 USDC.
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
