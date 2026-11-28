# Seven Heaven — suivi public BTC : 2026-11-28T08:09:17Z

**Statut : DEGRADED_OR_UNVERIFIED** — lecture seule, couverture partielle documentée, aucune exécution réelle.

Fenêtre UTC : 2026-11-27T08:09:17Z au 2026-11-28T08:09:17Z.

## Santé et provenance

- **OKX Spot BTC-USDC 1H** : 23 bougies clôturées dans cette fenêtre ; dernière bougie 2026-11-28T07:00:00Z ; source fraîche : OUI.
- **Liquidations dérivées** : 69 messages observés dans les archives ; 9 fenêtres de connexion par fournisseur (les périodes sans connexion sont inconnues, **pas des liquidations nulles**).
- **Actualités de l'Interface** : 10 événements BTC ; relevé source 2026-11-28T02:12:58.579802+00:00.

| Source dérivés | Messages observés | Fenêtres de connexion |
|---|---:|---:|
| bybit | 13 | 3 |
| binance | 32 | 3 |
| okx | 24 | 3 |

## Interprétation autorisée

Ce rapport constate des **coïncidences temporelles** quand des données sont présentes. Il ne déduit aucune vente Spot d’une liquidation sur dérivés et ne prouve **aucune causalité** des articles.

Les montants OKX en contrats ne sont pas convertis en USDT sans multiplicateur vérifié. Les messages Bybit/Binance ne constituent pas un total mondial.

## Dernières heures Spot archivées

| UTC | Ouverture (USDC) | Clôture (USDC) | Volume Spot BTC | Messages de liquidations observés | Couverture |
|---|---:|---:|---:|---:|---|
| 2026-11-27T20:00:00Z | 59858.5 | 59751.8 | 9.54514735 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-27T21:00:00Z | 59768.9 | 59747.9 | 4.59116657 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-27T22:00:00Z | 59738.6 | 59708.7 | 7.71039839 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-27T23:00:00Z | 59700.3 | 59872.1 | 5.82131782 | 3 | SAMPLED_WITH_GAPS |
| 2026-11-28T00:00:00Z | 59872.1 | 59850.2 | 5.80632754 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-28T01:00:00Z | 59850 | 60133 | 7.4768314 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-28T02:00:00Z | 60135.7 | 59920 | 5.55396927 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-28T03:00:00Z | 59912.6 | 59996.9 | 1.00657629 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-28T04:00:00Z | 59964.4 | 59932.8 | 0.93794177 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-28T05:00:00Z | 59930.1 | 59683.8 | 4.60702213 | 47 | SAMPLED_WITH_GAPS |
| 2026-11-28T06:00:00Z | 59680.5 | 59695.9 | 14.20313026 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-28T07:00:00Z | 59684.5 | 59785.6 | 58.18861681 | 0 | NO_DOCUMENTED_OBSERVATION |

## Étude de stratégie — structure EMA 5/13/34 (observation, pas backtest)

- Source : OKX Spot BTC-USDC 1H ; 71 bougies consécutives du 2026-11-25T09:00:00Z au 2026-11-28T07:00:00Z.
- Dernière clôture : 59785.6 USDC/BTC ; EMA 5 : 59798.12 ; EMA 13 : 59927.55 ; EMA 34 : 60194.91 USDC.
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
