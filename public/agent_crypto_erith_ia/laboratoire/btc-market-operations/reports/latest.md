# Seven Heaven — suivi public BTC : 2026-11-16T02:15:48Z

**Statut : OPERATIONAL_PARTIAL_COVERAGE** — lecture seule, couverture partielle documentée, aucune exécution réelle.

Fenêtre UTC : 2026-11-15T02:15:48Z au 2026-11-16T02:15:48Z.

## Santé et provenance

- **OKX Spot BTC-USDC 1H** : 23 bougies clôturées dans cette fenêtre ; dernière bougie 2026-11-16T01:00:00Z ; source fraîche : OUI.
- **Liquidations dérivées** : 93 messages observés dans les archives ; 12 fenêtres de connexion par fournisseur (les périodes sans connexion sont inconnues, **pas des liquidations nulles**).
- **Actualités de l'Interface** : 3 événements BTC ; relevé source 2026-11-15T23:12:19.804301+00:00.

| Source dérivés | Messages observés | Fenêtres de connexion |
|---|---:|---:|
| bybit | 45 | 4 |
| binance | 20 | 4 |
| okx | 28 | 4 |

## Interprétation autorisée

Ce rapport constate des **coïncidences temporelles** quand des données sont présentes. Il ne déduit aucune vente Spot d’une liquidation sur dérivés et ne prouve **aucune causalité** des articles.

Les montants OKX en contrats ne sont pas convertis en USDT sans multiplicateur vérifié. Les messages Bybit/Binance ne constituent pas un total mondial.

## Dernières heures Spot archivées

| UTC | Ouverture (USDC) | Clôture (USDC) | Volume Spot BTC | Messages de liquidations observés | Couverture |
|---|---:|---:|---:|---:|---|
| 2026-11-15T14:00:00Z | 65414.2 | 64736.3 | 65.59794983 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-15T15:00:00Z | 64750.5 | 64732.6 | 35.53179261 | 2 | SAMPLED_WITH_GAPS |
| 2026-11-15T16:00:00Z | 64727.4 | 64685 | 51.67824137 | 0 | SAMPLED_WITH_GAPS |
| 2026-11-15T17:00:00Z | 64691.4 | 64543.4 | 50.1360421 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-15T18:00:00Z | 64543.5 | 64716 | 29.55683834 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-15T19:00:00Z | 64716 | 64930 | 34.72991835 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-15T20:00:00Z | 64930.1 | 65116.9 | 21.33655413 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-15T21:00:00Z | 65111.1 | 65004.9 | 45.55178161 | 3 | SAMPLED_WITH_GAPS |
| 2026-11-15T22:00:00Z | 65004.8 | 65217.2 | 17.22631774 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-15T23:00:00Z | 65229.6 | 65330.2 | 49.85429267 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-16T00:00:00Z | 65331.5 | 64904 | 41.82033149 | 6 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-16T01:00:00Z | 64915.7 | 64546 | 36.24116358 | 1 | SAMPLED_WITH_GAPS |

## Étude de stratégie — structure EMA 5/13/34 (observation, pas backtest)

- Source : OKX Spot BTC-USDC 1H ; 71 bougies consécutives du 2026-11-13T03:00:00Z au 2026-11-16T01:00:00Z.
- Dernière clôture : 64546.0 USDC/BTC ; EMA 5 : 64886.87 ; EMA 13 : 64935.16 ; EMA 34 : 65279.47 USDC.
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
