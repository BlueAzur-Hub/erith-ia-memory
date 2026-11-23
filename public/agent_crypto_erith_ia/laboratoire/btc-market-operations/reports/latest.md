# Seven Heaven — suivi public BTC : 2026-11-23T15:00:55Z

**Statut : DEGRADED_OR_UNVERIFIED** — lecture seule, couverture partielle documentée, aucune exécution réelle.

Fenêtre UTC : 2026-11-22T15:00:55Z au 2026-11-23T15:00:55Z.

## Santé et provenance

- **OKX Spot BTC-USDC 1H** : 23 bougies clôturées dans cette fenêtre ; dernière bougie 2026-11-23T14:00:00Z ; source fraîche : OUI.
- **Liquidations dérivées** : 17 messages observés dans les archives ; 12 fenêtres de connexion par fournisseur (les périodes sans connexion sont inconnues, **pas des liquidations nulles**).
- **Actualités de l'Interface** : 12 événements BTC ; relevé source 2026-11-23T13:42:45.967159+00:00.

| Source dérivés | Messages observés | Fenêtres de connexion |
|---|---:|---:|
| bybit | 3 | 4 |
| binance | 13 | 4 |
| okx | 1 | 4 |

## Interprétation autorisée

Ce rapport constate des **coïncidences temporelles** quand des données sont présentes. Il ne déduit aucune vente Spot d’une liquidation sur dérivés et ne prouve **aucune causalité** des articles.

Les montants OKX en contrats ne sont pas convertis en USDT sans multiplicateur vérifié. Les messages Bybit/Binance ne constituent pas un total mondial.

## Dernières heures Spot archivées

| UTC | Ouverture (USDC) | Clôture (USDC) | Volume Spot BTC | Messages de liquidations observés | Couverture |
|---|---:|---:|---:|---:|---|
| 2026-11-23T03:00:00Z | 60510.8 | 61203.6 | 31.1143714 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-23T04:00:00Z | 61205.9 | 61180.1 | 12.13954138 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-23T05:00:00Z | 61148.5 | 61603.2 | 16.32118919 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-23T06:00:00Z | 61607.9 | 61392.4 | 18.16342823 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-23T07:00:00Z | 61396.2 | 61381.4 | 19.78413846 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-23T08:00:00Z | 61396.2 | 61443.8 | 70.30241498 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-23T09:00:00Z | 61451.1 | 61367.2 | 151.87105887 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-23T10:00:00Z | 61367.3 | 61355.9 | 12.54797496 | 2 | SAMPLED_WITH_GAPS |
| 2026-11-23T11:00:00Z | 61356.9 | 61361.9 | 21.40636182 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-23T12:00:00Z | 61370.5 | 61269.3 | 16.82794306 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-23T13:00:00Z | 61249.8 | 63811.4 | 182.9696863 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-23T14:00:00Z | 63788.6 | 62858.2 | 409.95098594 | 0 | NO_DOCUMENTED_OBSERVATION |

## Étude de stratégie — structure EMA 5/13/34 (observation, pas backtest)

- Source : OKX Spot BTC-USDC 1H ; 71 bougies consécutives du 2026-11-20T16:00:00Z au 2026-11-23T14:00:00Z.
- Dernière clôture : 62858.2 USDC/BTC ; EMA 5 : 62390.61 ; EMA 13 : 61780.12 ; EMA 34 : 61018.23 USDC.
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
