# Seven Heaven — suivi public BTC : 2026-11-15T17:17:35Z

**Statut : OPERATIONAL_PARTIAL_COVERAGE** — lecture seule, couverture partielle documentée, aucune exécution réelle.

Fenêtre UTC : 2026-11-14T17:17:35Z au 2026-11-15T17:17:35Z.

## Santé et provenance

- **OKX Spot BTC-USDC 1H** : 23 bougies clôturées dans cette fenêtre ; dernière bougie 2026-11-15T16:00:00Z ; source fraîche : OUI.
- **Liquidations dérivées** : 248 messages observés dans les archives ; 15 fenêtres de connexion par fournisseur (les périodes sans connexion sont inconnues, **pas des liquidations nulles**).
- **Actualités de l'Interface** : 1 événements BTC ; relevé source 2026-11-15T11:32:13.585778+00:00.

| Source dérivés | Messages observés | Fenêtres de connexion |
|---|---:|---:|
| bybit | 141 | 5 |
| binance | 51 | 5 |
| okx | 56 | 5 |

## Interprétation autorisée

Ce rapport constate des **coïncidences temporelles** quand des données sont présentes. Il ne déduit aucune vente Spot d’une liquidation sur dérivés et ne prouve **aucune causalité** des articles.

Les montants OKX en contrats ne sont pas convertis en USDT sans multiplicateur vérifié. Les messages Bybit/Binance ne constituent pas un total mondial.

## Dernières heures Spot archivées

| UTC | Ouverture (USDC) | Clôture (USDC) | Volume Spot BTC | Messages de liquidations observés | Couverture |
|---|---:|---:|---:|---:|---|
| 2026-11-15T05:00:00Z | 64918 | 64495.7 | 34.37232845 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-15T06:00:00Z | 64502.2 | 64436.5 | 36.11518204 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-15T07:00:00Z | 64442.8 | 63986.2 | 132.38674138 | 10 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-15T08:00:00Z | 63976.3 | 65192.5 | 116.94378602 | 70 | SAMPLED_WITH_GAPS |
| 2026-11-15T09:00:00Z | 65187.4 | 65319.9 | 139.13452119 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-15T10:00:00Z | 65323.3 | 65570.4 | 44.96092383 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-15T11:00:00Z | 65570.4 | 65324.9 | 40.24181053 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-15T12:00:00Z | 65333.3 | 65486.2 | 42.76692274 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-15T13:00:00Z | 65475.9 | 65440 | 48.89941126 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-15T14:00:00Z | 65414.2 | 64736.3 | 65.59794983 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-15T15:00:00Z | 64750.5 | 64732.6 | 35.53179261 | 2 | SAMPLED_WITH_GAPS |
| 2026-11-15T16:00:00Z | 64727.4 | 64685 | 51.67824137 | 0 | SAMPLED_WITH_GAPS |

## Étude de stratégie — structure EMA 5/13/34 (observation, pas backtest)

- Source : OKX Spot BTC-USDC 1H ; 71 bougies consécutives du 2026-11-12T18:00:00Z au 2026-11-15T16:00:00Z.
- Dernière clôture : 64685.0 USDC/BTC ; EMA 5 : 64893.76 ; EMA 13 : 64945.12 ; EMA 34 : 65559.49 USDC.
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
