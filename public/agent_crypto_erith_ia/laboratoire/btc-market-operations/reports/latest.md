# Seven Heaven — suivi public BTC : 2026-11-21T19:33:13Z

**Statut : DEGRADED_OR_UNVERIFIED** — lecture seule, couverture partielle documentée, aucune exécution réelle.

Fenêtre UTC : 2026-11-20T19:33:13Z au 2026-11-21T19:33:13Z.

## Santé et provenance

- **OKX Spot BTC-USDC 1H** : 23 bougies clôturées dans cette fenêtre ; dernière bougie 2026-11-21T18:00:00Z ; source fraîche : OUI.
- **Liquidations dérivées** : 264 messages observés dans les archives ; 9 fenêtres de connexion par fournisseur (les périodes sans connexion sont inconnues, **pas des liquidations nulles**).
- **Actualités de l'Interface** : 3 événements BTC ; relevé source 2026-11-21T15:39:26.564425+00:00.

| Source dérivés | Messages observés | Fenêtres de connexion |
|---|---:|---:|
| bybit | 167 | 3 |
| binance | 62 | 3 |
| okx | 35 | 3 |

## Interprétation autorisée

Ce rapport constate des **coïncidences temporelles** quand des données sont présentes. Il ne déduit aucune vente Spot d’une liquidation sur dérivés et ne prouve **aucune causalité** des articles.

Les montants OKX en contrats ne sont pas convertis en USDT sans multiplicateur vérifié. Les messages Bybit/Binance ne constituent pas un total mondial.

## Dernières heures Spot archivées

| UTC | Ouverture (USDC) | Clôture (USDC) | Volume Spot BTC | Messages de liquidations observés | Couverture |
|---|---:|---:|---:|---:|---|
| 2026-11-21T07:00:00Z | 57947.7 | 57885 | 121.45873963 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-21T08:00:00Z | 57887.2 | 57692.4 | 110.21822779 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-21T09:00:00Z | 57700.6 | 57927.5 | 37.09201658 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-21T10:00:00Z | 57924.2 | 57854.4 | 31.20773456 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-21T11:00:00Z | 57850 | 58123.7 | 45.14520326 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-21T12:00:00Z | 58127.6 | 58775.2 | 104.19315137 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-21T13:00:00Z | 58769.3 | 60467.5 | 168.41579292 | 197 | SAMPLED_WITH_GAPS |
| 2026-11-21T14:00:00Z | 60487.8 | 60245.4 | 104.35028726 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-21T15:00:00Z | 60242.4 | 59844.7 | 54.82948701 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-21T16:00:00Z | 59832.5 | 59959.1 | 19.0686708 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-21T17:00:00Z | 59960 | 59982.6 | 23.64782583 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-21T18:00:00Z | 59982.6 | 60052.1 | 17.4177483 | 0 | NO_DOCUMENTED_OBSERVATION |

## Étude de stratégie — structure EMA 5/13/34 (observation, pas backtest)

- Source : OKX Spot BTC-USDC 1H ; 71 bougies consécutives du 2026-11-18T20:00:00Z au 2026-11-21T18:00:00Z.
- Dernière clôture : 60052.1 USDC/BTC ; EMA 5 : 59867.71 ; EMA 13 : 59288.62 ; EMA 34 : 59501.73 USDC.
- Structure horaire observée : **STRUCTURE_HORAIRE_MIXTE**.
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
