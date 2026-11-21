# Seven Heaven — suivi public BTC : 2026-11-21T11:28:49Z

**Statut : DEGRADED_OR_UNVERIFIED** — lecture seule, couverture partielle documentée, aucune exécution réelle.

Fenêtre UTC : 2026-11-20T11:28:49Z au 2026-11-21T11:28:49Z.

## Santé et provenance

- **OKX Spot BTC-USDC 1H** : 23 bougies clôturées dans cette fenêtre ; dernière bougie 2026-11-21T10:00:00Z ; source fraîche : OUI.
- **Liquidations dérivées** : 89 messages observés dans les archives ; 9 fenêtres de connexion par fournisseur (les périodes sans connexion sont inconnues, **pas des liquidations nulles**).
- **Actualités de l'Interface** : 9 événements BTC ; relevé source 2026-11-21T07:44:53.170202+00:00.

| Source dérivés | Messages observés | Fenêtres de connexion |
|---|---:|---:|
| bybit | 29 | 3 |
| binance | 47 | 3 |
| okx | 13 | 3 |

## Interprétation autorisée

Ce rapport constate des **coïncidences temporelles** quand des données sont présentes. Il ne déduit aucune vente Spot d’une liquidation sur dérivés et ne prouve **aucune causalité** des articles.

Les montants OKX en contrats ne sont pas convertis en USDT sans multiplicateur vérifié. Les messages Bybit/Binance ne constituent pas un total mondial.

## Dernières heures Spot archivées

| UTC | Ouverture (USDC) | Clôture (USDC) | Volume Spot BTC | Messages de liquidations observés | Couverture |
|---|---:|---:|---:|---:|---|
| 2026-11-20T23:00:00Z | 59045.5 | 58816.5 | 78.27662629 | 6 | SAMPLED_WITH_GAPS |
| 2026-11-21T00:00:00Z | 58811.7 | 58911.9 | 48.51069321 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-21T01:00:00Z | 58911.8 | 58924 | 22.00500417 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-21T02:00:00Z | 58918.9 | 58503.3 | 27.32844183 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-21T03:00:00Z | 58494.4 | 56664.3 | 227.09477164 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-21T04:00:00Z | 56654.2 | 56220.9 | 206.73725505 | 52 | SAMPLED_WITH_GAPS |
| 2026-11-21T05:00:00Z | 56220.9 | 55709 | 119.27154234 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-21T06:00:00Z | 55722 | 57980.8 | 239.26934073 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-21T07:00:00Z | 57947.7 | 57885 | 121.45873963 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-21T08:00:00Z | 57887.2 | 57692.4 | 110.21822779 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-21T09:00:00Z | 57700.6 | 57927.5 | 37.09201658 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-21T10:00:00Z | 57924.2 | 57854.4 | 31.20773456 | 0 | NO_DOCUMENTED_OBSERVATION |

## Étude de stratégie — structure EMA 5/13/34 (observation, pas backtest)

- Source : OKX Spot BTC-USDC 1H ; 71 bougies consécutives du 2026-11-18T12:00:00Z au 2026-11-21T10:00:00Z.
- Dernière clôture : 57854.4 USDC/BTC ; EMA 5 : 57728.73 ; EMA 13 : 57982.84 ; EMA 34 : 59332.64 USDC.
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
