# Seven Heaven — suivi public BTC : 2026-11-15T09:38:37Z

**Statut : OPERATIONAL_PARTIAL_COVERAGE** — lecture seule, couverture partielle documentée, aucune exécution réelle.

Fenêtre UTC : 2026-11-14T09:38:37Z au 2026-11-15T09:38:37Z.

## Santé et provenance

- **OKX Spot BTC-USDC 1H** : 23 bougies clôturées dans cette fenêtre ; dernière bougie 2026-11-15T08:00:00Z ; source fraîche : OUI.
- **Liquidations dérivées** : 250 messages observés dans les archives ; 15 fenêtres de connexion par fournisseur (les périodes sans connexion sont inconnues, **pas des liquidations nulles**).
- **Actualités de l'Interface** : 4 événements BTC ; relevé source 2026-11-15T03:08:37.989611+00:00.

| Source dérivés | Messages observés | Fenêtres de connexion |
|---|---:|---:|
| bybit | 141 | 5 |
| binance | 53 | 5 |
| okx | 56 | 5 |

## Interprétation autorisée

Ce rapport constate des **coïncidences temporelles** quand des données sont présentes. Il ne déduit aucune vente Spot d’une liquidation sur dérivés et ne prouve **aucune causalité** des articles.

Les montants OKX en contrats ne sont pas convertis en USDT sans multiplicateur vérifié. Les messages Bybit/Binance ne constituent pas un total mondial.

## Dernières heures Spot archivées

| UTC | Ouverture (USDC) | Clôture (USDC) | Volume Spot BTC | Messages de liquidations observés | Couverture |
|---|---:|---:|---:|---:|---|
| 2026-11-14T21:00:00Z | 64723.1 | 64432.1 | 322.22121203 | 12 | SAMPLED_WITH_GAPS |
| 2026-11-14T22:00:00Z | 64417.4 | 63518.6 | 252.34784404 | 8 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-14T23:00:00Z | 63508.5 | 64144.8 | 131.28344319 | 3 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-15T00:00:00Z | 64133.4 | 63419.2 | 94.64183446 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-15T01:00:00Z | 63414.4 | 62601.2 | 341.38178854 | 139 | SAMPLED_WITH_GAPS |
| 2026-11-15T02:00:00Z | 62589.9 | 64878.1 | 83.73595642 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-15T03:00:00Z | 64878.1 | 64803.2 | 43.24687053 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-15T04:00:00Z | 64803.7 | 64905.1 | 28.79248964 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-15T05:00:00Z | 64918 | 64495.7 | 34.37232845 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-15T06:00:00Z | 64502.2 | 64436.5 | 36.11518204 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-15T07:00:00Z | 64442.8 | 63986.2 | 132.38674138 | 10 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-15T08:00:00Z | 63976.3 | 65192.5 | 116.94378602 | 70 | SAMPLED_WITH_GAPS |

## Étude de stratégie — structure EMA 5/13/34 (observation, pas backtest)

- Source : OKX Spot BTC-USDC 1H ; 71 bougies consécutives du 2026-11-12T10:00:00Z au 2026-11-15T08:00:00Z.
- Dernière clôture : 65192.5 USDC/BTC ; EMA 5 : 64604.87 ; EMA 13 : 64670.87 ; EMA 34 : 65844.44 USDC.
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
