# Seven Heaven — suivi public BTC : 2026-11-20T03:37:18Z

**Statut : DEGRADED_OR_UNVERIFIED** — lecture seule, couverture partielle documentée, aucune exécution réelle.

Fenêtre UTC : 2026-11-19T03:37:18Z au 2026-11-20T03:37:18Z.

## Santé et provenance

- **OKX Spot BTC-USDC 1H** : 23 bougies clôturées dans cette fenêtre ; dernière bougie 2026-11-20T02:00:00Z ; source fraîche : OUI.
- **Liquidations dérivées** : 57 messages observés dans les archives ; 9 fenêtres de connexion par fournisseur (les périodes sans connexion sont inconnues, **pas des liquidations nulles**).
- **Actualités de l'Interface** : 12 événements BTC ; relevé source 2026-11-20T01:27:45.867522+00:00.

| Source dérivés | Messages observés | Fenêtres de connexion |
|---|---:|---:|
| bybit | 13 | 3 |
| binance | 18 | 3 |
| okx | 26 | 3 |

## Interprétation autorisée

Ce rapport constate des **coïncidences temporelles** quand des données sont présentes. Il ne déduit aucune vente Spot d’une liquidation sur dérivés et ne prouve **aucune causalité** des articles.

Les montants OKX en contrats ne sont pas convertis en USDT sans multiplicateur vérifié. Les messages Bybit/Binance ne constituent pas un total mondial.

## Dernières heures Spot archivées

| UTC | Ouverture (USDC) | Clôture (USDC) | Volume Spot BTC | Messages de liquidations observés | Couverture |
|---|---:|---:|---:|---:|---|
| 2026-11-19T15:00:00Z | 63494 | 63053.6 | 105.49430422 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-19T16:00:00Z | 63046 | 62722.8 | 43.78738694 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-19T17:00:00Z | 62713.5 | 62688.9 | 85.88605142 | 12 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-19T18:00:00Z | 62688.8 | 62832.8 | 32.69299821 | 35 | SAMPLED_WITH_GAPS |
| 2026-11-19T19:00:00Z | 62831.9 | 62299.2 | 39.87944268 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-19T20:00:00Z | 62300.1 | 62062 | 136.63837864 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-19T21:00:00Z | 62067 | 61482.9 | 93.65831292 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-19T22:00:00Z | 61491.1 | 62108.3 | 42.5488609 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-19T23:00:00Z | 62105.8 | 61924.3 | 30.44890008 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-20T00:00:00Z | 61914.6 | 62079.8 | 19.49110427 | 1 | SAMPLED_WITH_GAPS |
| 2026-11-20T01:00:00Z | 62095.3 | 61513.6 | 52.09297902 | 5 | SAMPLED_WITH_GAPS |
| 2026-11-20T02:00:00Z | 61518.6 | 62209.8 | 28.24606025 | 0 | NO_DOCUMENTED_OBSERVATION |

## Étude de stratégie — structure EMA 5/13/34 (observation, pas backtest)

- Source : OKX Spot BTC-USDC 1H ; 71 bougies consécutives du 2026-11-17T04:00:00Z au 2026-11-20T02:00:00Z.
- Dernière clôture : 62209.8 USDC/BTC ; EMA 5 : 61996.62 ; EMA 13 : 62323.95 ; EMA 34 : 62886.03 USDC.
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
