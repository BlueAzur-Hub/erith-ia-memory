# Seven Heaven — suivi public BTC : 2026-11-24T14:00:16Z

**Statut : DEGRADED_OR_UNVERIFIED** — lecture seule, couverture partielle documentée, aucune exécution réelle.

Fenêtre UTC : 2026-11-23T14:00:16Z au 2026-11-24T14:00:16Z.

## Santé et provenance

- **OKX Spot BTC-USDC 1H** : 23 bougies clôturées dans cette fenêtre ; dernière bougie 2026-11-24T13:00:00Z ; source fraîche : OUI.
- **Liquidations dérivées** : 29 messages observés dans les archives ; 6 fenêtres de connexion par fournisseur (les périodes sans connexion sont inconnues, **pas des liquidations nulles**).
- **Actualités de l'Interface** : 18 événements BTC ; relevé source 2026-11-24T11:39:58.202414+00:00.

| Source dérivés | Messages observés | Fenêtres de connexion |
|---|---:|---:|
| bybit | 3 | 2 |
| binance | 13 | 2 |
| okx | 13 | 2 |

## Interprétation autorisée

Ce rapport constate des **coïncidences temporelles** quand des données sont présentes. Il ne déduit aucune vente Spot d’une liquidation sur dérivés et ne prouve **aucune causalité** des articles.

Les montants OKX en contrats ne sont pas convertis en USDT sans multiplicateur vérifié. Les messages Bybit/Binance ne constituent pas un total mondial.

## Dernières heures Spot archivées

| UTC | Ouverture (USDC) | Clôture (USDC) | Volume Spot BTC | Messages de liquidations observés | Couverture |
|---|---:|---:|---:|---:|---|
| 2026-11-24T02:00:00Z | 61041.1 | 60009.8 | 60.55918815 | 4 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-24T03:00:00Z | 60011.8 | 60274.7 | 50.01645715 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-24T04:00:00Z | 60262.9 | 60317.8 | 14.44152977 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-24T05:00:00Z | 60317.8 | 60564.9 | 19.43809044 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-24T06:00:00Z | 60563.8 | 60405.3 | 22.13842408 | 2 | SAMPLED_WITH_GAPS |
| 2026-11-24T07:00:00Z | 60400 | 60372 | 21.45664472 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-24T08:00:00Z | 60358.9 | 60188.7 | 54.39999704 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-24T09:00:00Z | 60190.1 | 59912.1 | 74.63966518 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-24T10:00:00Z | 59915 | 59719 | 47.66211256 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-24T11:00:00Z | 59719 | 60353.6 | 62.81731642 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-24T12:00:00Z | 60354.8 | 60415.6 | 40.05795371 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-24T13:00:00Z | 60396.9 | 59949 | 52.57134399 | 0 | NO_DOCUMENTED_OBSERVATION |

## Étude de stratégie — structure EMA 5/13/34 (observation, pas backtest)

- Source : OKX Spot BTC-USDC 1H ; 71 bougies consécutives du 2026-11-21T15:00:00Z au 2026-11-24T13:00:00Z.
- Dernière clôture : 59949.0 USDC/BTC ; EMA 5 : 60142.18 ; EMA 13 : 60365.16 ; EMA 34 : 60704.65 USDC.
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
