# Seven Heaven — suivi public BTC : 2026-11-20T13:18:03Z

**Statut : DEGRADED_OR_UNVERIFIED** — lecture seule, couverture partielle documentée, aucune exécution réelle.

Fenêtre UTC : 2026-11-19T13:18:03Z au 2026-11-20T13:18:03Z.

## Santé et provenance

- **OKX Spot BTC-USDC 1H** : 23 bougies clôturées dans cette fenêtre ; dernière bougie 2026-11-20T12:00:00Z ; source fraîche : OUI.
- **Liquidations dérivées** : 57 messages observés dans les archives ; 9 fenêtres de connexion par fournisseur (les périodes sans connexion sont inconnues, **pas des liquidations nulles**).
- **Actualités de l'Interface** : 9 événements BTC ; relevé source 2026-11-20T09:13:14.289403+00:00.

| Source dérivés | Messages observés | Fenêtres de connexion |
|---|---:|---:|
| bybit | 12 | 3 |
| binance | 16 | 3 |
| okx | 29 | 3 |

## Interprétation autorisée

Ce rapport constate des **coïncidences temporelles** quand des données sont présentes. Il ne déduit aucune vente Spot d’une liquidation sur dérivés et ne prouve **aucune causalité** des articles.

Les montants OKX en contrats ne sont pas convertis en USDT sans multiplicateur vérifié. Les messages Bybit/Binance ne constituent pas un total mondial.

## Dernières heures Spot archivées

| UTC | Ouverture (USDC) | Clôture (USDC) | Volume Spot BTC | Messages de liquidations observés | Couverture |
|---|---:|---:|---:|---:|---|
| 2026-11-20T01:00:00Z | 62095.3 | 61513.6 | 52.09297902 | 5 | SAMPLED_WITH_GAPS |
| 2026-11-20T02:00:00Z | 61518.6 | 62209.8 | 28.24606025 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-20T03:00:00Z | 62193.2 | 62093.8 | 19.88834592 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-20T04:00:00Z | 62093.8 | 61464.3 | 36.59728267 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-20T05:00:00Z | 61460.4 | 61875.5 | 21.23679701 | 3 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-20T06:00:00Z | 61866.4 | 62014.9 | 12.01154638 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-20T07:00:00Z | 61999.9 | 61819.3 | 67.79132338 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-20T08:00:00Z | 61806.4 | 61782.8 | 28.41087203 | 1 | SAMPLED_WITH_GAPS |
| 2026-11-20T09:00:00Z | 61789.2 | 61590.8 | 20.96869249 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-20T10:00:00Z | 61593 | 62009.6 | 72.29603981 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-20T11:00:00Z | 61992.8 | 61750.8 | 36.0650799 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-20T12:00:00Z | 61742.2 | 61510.6 | 34.64423307 | 0 | NO_DOCUMENTED_OBSERVATION |

## Étude de stratégie — structure EMA 5/13/34 (observation, pas backtest)

- Source : OKX Spot BTC-USDC 1H ; 71 bougies consécutives du 2026-11-17T14:00:00Z au 2026-11-20T12:00:00Z.
- Dernière clôture : 61510.6 USDC/BTC ; EMA 5 : 61712.06 ; EMA 13 : 61880.25 ; EMA 34 : 62414.69 USDC.
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
