# Seven Heaven — suivi public BTC : 2026-11-26T22:28:11Z

**Statut : DEGRADED_OR_UNVERIFIED** — lecture seule, couverture partielle documentée, aucune exécution réelle.

Fenêtre UTC : 2026-11-25T22:28:11Z au 2026-11-26T22:28:11Z.

## Santé et provenance

- **OKX Spot BTC-USDC 1H** : 23 bougies clôturées dans cette fenêtre ; dernière bougie 2026-11-26T21:00:00Z ; source fraîche : OUI.
- **Liquidations dérivées** : 18 messages observés dans les archives ; 9 fenêtres de connexion par fournisseur (les périodes sans connexion sont inconnues, **pas des liquidations nulles**).
- **Actualités de l'Interface** : 11 événements BTC ; relevé source 2026-11-26T15:50:26.375028+00:00.

| Source dérivés | Messages observés | Fenêtres de connexion |
|---|---:|---:|
| bybit | 3 | 3 |
| binance | 13 | 3 |
| okx | 2 | 3 |

## Interprétation autorisée

Ce rapport constate des **coïncidences temporelles** quand des données sont présentes. Il ne déduit aucune vente Spot d’une liquidation sur dérivés et ne prouve **aucune causalité** des articles.

Les montants OKX en contrats ne sont pas convertis en USDT sans multiplicateur vérifié. Les messages Bybit/Binance ne constituent pas un total mondial.

## Dernières heures Spot archivées

| UTC | Ouverture (USDC) | Clôture (USDC) | Volume Spot BTC | Messages de liquidations observés | Couverture |
|---|---:|---:|---:|---:|---|
| 2026-11-26T10:00:00Z | 60863.6 | 60445.2 | 13.39668833 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-26T11:00:00Z | 60447.9 | 60649.1 | 15.64334327 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-26T12:00:00Z | 60632.8 | 60777 | 11.18802004 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-26T13:00:00Z | 60766.3 | 60798 | 11.55544817 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-26T14:00:00Z | 60808.1 | 60662.1 | 53.3358765 | 12 | SAMPLED_WITH_GAPS |
| 2026-11-26T15:00:00Z | 60662.1 | 60558.3 | 80.27806858 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-26T16:00:00Z | 60573.2 | 60460 | 12.25859805 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-26T17:00:00Z | 60460 | 60463.2 | 16.92207591 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-26T18:00:00Z | 60465.2 | 60413.5 | 7.3895617 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-26T19:00:00Z | 60407.2 | 60626.9 | 7.22623296 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-26T20:00:00Z | 60639.6 | 60697.3 | 11.1153429 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-26T21:00:00Z | 60701.3 | 60755.4 | 8.05831345 | 0 | NO_DOCUMENTED_OBSERVATION |

## Étude de stratégie — structure EMA 5/13/34 (observation, pas backtest)

- Source : OKX Spot BTC-USDC 1H ; 71 bougies consécutives du 2026-11-23T23:00:00Z au 2026-11-26T21:00:00Z.
- Dernière clôture : 60755.4 USDC/BTC ; EMA 5 : 60648.61 ; EMA 13 : 60592.36 ; EMA 34 : 60347.69 USDC.
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
