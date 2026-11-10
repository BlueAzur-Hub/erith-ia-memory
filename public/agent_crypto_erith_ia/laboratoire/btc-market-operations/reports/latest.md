# Seven Heaven — suivi public BTC : 2026-11-10T15:42:29Z

**Statut : OPERATIONAL_PARTIAL_COVERAGE** — lecture seule, couverture partielle documentée, aucune exécution réelle.

Fenêtre UTC : 2026-11-09T15:42:29Z au 2026-11-10T15:42:29Z.

## Santé et provenance

- **OKX Spot BTC-USDC 1H** : 23 bougies clôturées dans cette fenêtre ; dernière bougie 2026-11-10T14:00:00Z ; source fraîche : OUI.
- **Liquidations dérivées** : 577 messages observés dans les archives ; 3 fenêtres de connexion par fournisseur (les périodes sans connexion sont inconnues, **pas des liquidations nulles**).
- **Actualités de l'Interface** : 13 événements BTC ; relevé source 2026-11-10T15:13:05.844334+00:00.

| Source dérivés | Messages observés | Fenêtres de connexion |
|---|---:|---:|
| bybit | 459 | 1 |
| binance | 79 | 1 |
| okx | 39 | 1 |

## Interprétation autorisée

Ce rapport constate des **coïncidences temporelles** quand des données sont présentes. Il ne déduit aucune vente Spot d’une liquidation sur dérivés et ne prouve **aucune causalité** des articles.

Les montants OKX en contrats ne sont pas convertis en USDT sans multiplicateur vérifié. Les messages Bybit/Binance ne constituent pas un total mondial.

## Dernières heures Spot archivées

| UTC | Ouverture (USDC) | Clôture (USDC) | Volume Spot BTC | Messages de liquidations observés | Couverture |
|---|---:|---:|---:|---:|---|
| 2026-11-10T03:00:00Z | 74788.1 | 74487.9 | 20.44863997 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-10T04:00:00Z | 74489.9 | 74721.3 | 15.55906391 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-10T05:00:00Z | 74705.5 | 74735.4 | 4.32549021 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-10T06:00:00Z | 74735.4 | 74580.3 | 9.79738434 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-10T07:00:00Z | 74576.6 | 74767 | 15.18796694 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-10T08:00:00Z | 74754.7 | 74640.4 | 23.10997888 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-10T09:00:00Z | 74648.4 | 74439 | 30.83258595 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-10T10:00:00Z | 74431.7 | 74157 | 20.98295035 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-10T11:00:00Z | 74149.7 | 74353.7 | 34.1235545 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-10T12:00:00Z | 74344.7 | 74329.9 | 13.67210178 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-10T13:00:00Z | 74313.4 | 73679.9 | 114.17539267 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-10T14:00:00Z | 73671.6 | 74336.5 | 47.59983469 | 0 | NO_DOCUMENTED_OBSERVATION |

## Restrictions

- GitHub cron may be delayed or dropped; no 24/7 claim
- Derivatives subscriptions are partial or venue-sampled; not market totals
- No recorded feed event does not imply no liquidation
- News event timestamp is not proof of a price catalyst
- Exchange original market samples not cryptographically signed
- Spot quote USDC is not derivatives notional USDT
- Not personal financial advice and never an order

Fichiers sources : `../spot-hourly/`, `../../liquidation-monitor/observations/` et `../../../data/news/latest.json`.
