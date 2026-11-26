# Seven Heaven — suivi public BTC : 2026-11-26T12:55:29Z

**Statut : DEGRADED_OR_UNVERIFIED** — lecture seule, couverture partielle documentée, aucune exécution réelle.

Fenêtre UTC : 2026-11-25T12:55:29Z au 2026-11-26T12:55:29Z.

## Santé et provenance

- **OKX Spot BTC-USDC 1H** : 23 bougies clôturées dans cette fenêtre ; dernière bougie 2026-11-26T11:00:00Z ; source fraîche : OUI.
- **Liquidations dérivées** : 8 messages observés dans les archives ; 9 fenêtres de connexion par fournisseur (les périodes sans connexion sont inconnues, **pas des liquidations nulles**).
- **Actualités de l'Interface** : 7 événements BTC ; relevé source 2026-11-26T05:30:50.057723+00:00.

| Source dérivés | Messages observés | Fenêtres de connexion |
|---|---:|---:|
| bybit | 1 | 3 |
| binance | 7 | 3 |
| okx | 0 | 3 |

## Interprétation autorisée

Ce rapport constate des **coïncidences temporelles** quand des données sont présentes. Il ne déduit aucune vente Spot d’une liquidation sur dérivés et ne prouve **aucune causalité** des articles.

Les montants OKX en contrats ne sont pas convertis en USDT sans multiplicateur vérifié. Les messages Bybit/Binance ne constituent pas un total mondial.

## Dernières heures Spot archivées

| UTC | Ouverture (USDC) | Clôture (USDC) | Volume Spot BTC | Messages de liquidations observés | Couverture |
|---|---:|---:|---:|---:|---|
| 2026-11-26T00:00:00Z | 60389.7 | 60438 | 142.94550799 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-26T01:00:00Z | 60455.3 | 60787.9 | 103.59838262 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-26T02:00:00Z | 60784.8 | 60634 | 14.66416356 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-26T03:00:00Z | 60634.6 | 60706.8 | 9.69673201 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-26T04:00:00Z | 60702.6 | 60909.5 | 6.94542008 | 3 | SAMPLED_WITH_GAPS |
| 2026-11-26T05:00:00Z | 60900.8 | 60737.2 | 8.0415027 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-26T06:00:00Z | 60751.9 | 60493.1 | 14.00026409 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-26T07:00:00Z | 60485.5 | 60459.4 | 10.57439571 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-26T08:00:00Z | 60457 | 60840.2 | 61.47957239 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-26T09:00:00Z | 60838.3 | 60863.4 | 8.18014181 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-26T10:00:00Z | 60863.6 | 60445.2 | 13.39668833 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-26T11:00:00Z | 60447.9 | 60649.1 | 15.64334327 | 0 | NO_DOCUMENTED_OBSERVATION |

## Étude de stratégie — structure EMA 5/13/34 (observation, pas backtest)

- Source : OKX Spot BTC-USDC 1H ; 71 bougies consécutives du 2026-11-23T13:00:00Z au 2026-11-26T11:00:00Z.
- Dernière clôture : 60649.1 USDC/BTC ; EMA 5 : 60638.75 ; EMA 13 : 60491.66 ; EMA 34 : 60158.68 USDC.
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
