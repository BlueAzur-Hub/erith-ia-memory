# Seven Heaven — suivi public BTC : 2026-11-12T08:27:51Z

**Statut : DEGRADED_OR_UNVERIFIED** — lecture seule, couverture partielle documentée, aucune exécution réelle.

Fenêtre UTC : 2026-11-11T08:27:51Z au 2026-11-12T08:27:51Z.

## Santé et provenance

- **OKX Spot BTC-USDC 1H** : 23 bougies clôturées dans cette fenêtre ; dernière bougie 2026-11-12T07:00:00Z ; source fraîche : OUI.
- **Liquidations dérivées** : 189 messages observés dans les archives ; 12 fenêtres de connexion par fournisseur (les périodes sans connexion sont inconnues, **pas des liquidations nulles**).
- **Actualités de l'Interface** : 14 événements BTC ; relevé source 2026-11-12T01:02:37.625211+00:00.

| Source dérivés | Messages observés | Fenêtres de connexion |
|---|---:|---:|
| bybit | 79 | 4 |
| binance | 72 | 4 |
| okx | 38 | 4 |

## Interprétation autorisée

Ce rapport constate des **coïncidences temporelles** quand des données sont présentes. Il ne déduit aucune vente Spot d’une liquidation sur dérivés et ne prouve **aucune causalité** des articles.

Les montants OKX en contrats ne sont pas convertis en USDT sans multiplicateur vérifié. Les messages Bybit/Binance ne constituent pas un total mondial.

## Dernières heures Spot archivées

| UTC | Ouverture (USDC) | Clôture (USDC) | Volume Spot BTC | Messages de liquidations observés | Couverture |
|---|---:|---:|---:|---:|---|
| 2026-11-11T20:00:00Z | 74356.2 | 74620 | 25.62679256 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-11T21:00:00Z | 74618.4 | 74324.6 | 36.55567191 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-11T22:00:00Z | 74324.6 | 73878.9 | 21.56968302 | 1 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-11T23:00:00Z | 73879 | 73938.5 | 27.78752321 | 155 | SAMPLED_WITH_GAPS |
| 2026-11-12T00:00:00Z | 73938.4 | 74014.7 | 21.33715667 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-12T01:00:00Z | 74008.2 | 73648.6 | 24.50623331 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-12T02:00:00Z | 73636 | 73736.6 | 10.33775158 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-12T03:00:00Z | 73732.9 | 73728.3 | 6.52797613 | 0 | SAMPLED_WITH_GAPS |
| 2026-11-12T04:00:00Z | 73736.9 | 73660.2 | 7.66117258 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-12T05:00:00Z | 73657.4 | 73510.6 | 9.615828 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-12T06:00:00Z | 73516.7 | 73450.5 | 12.83627707 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-12T07:00:00Z | 73452.7 | 73576.8 | 6.07089971 | 0 | NO_DOCUMENTED_OBSERVATION |

## Étude de stratégie — structure EMA 5/13/34 (observation, pas backtest)

- Source : OKX Spot BTC-USDC 1H ; 71 bougies consécutives du 2026-11-09T09:00:00Z au 2026-11-12T07:00:00Z.
- Dernière clôture : 73576.8 USDC/BTC ; EMA 5 : 73595.77 ; EMA 13 : 73759.86 ; EMA 34 : 73911.54 USDC.
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
