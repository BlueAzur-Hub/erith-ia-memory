# Seven Heaven — suivi public BTC : 2026-11-18T22:13:32Z

**Statut : DEGRADED_OR_UNVERIFIED** — lecture seule, couverture partielle documentée, aucune exécution réelle.

Fenêtre UTC : 2026-11-17T22:13:32Z au 2026-11-18T22:13:32Z.

## Santé et provenance

- **OKX Spot BTC-USDC 1H** : 23 bougies clôturées dans cette fenêtre ; dernière bougie 2026-11-18T21:00:00Z ; source fraîche : OUI.
- **Liquidations dérivées** : 27 messages observés dans les archives ; 9 fenêtres de connexion par fournisseur (les périodes sans connexion sont inconnues, **pas des liquidations nulles**).
- **Actualités de l'Interface** : 14 événements BTC ; relevé source 2026-11-18T21:37:39.750237+00:00.

| Source dérivés | Messages observés | Fenêtres de connexion |
|---|---:|---:|
| bybit | 7 | 3 |
| binance | 13 | 3 |
| okx | 7 | 3 |

## Interprétation autorisée

Ce rapport constate des **coïncidences temporelles** quand des données sont présentes. Il ne déduit aucune vente Spot d’une liquidation sur dérivés et ne prouve **aucune causalité** des articles.

Les montants OKX en contrats ne sont pas convertis en USDT sans multiplicateur vérifié. Les messages Bybit/Binance ne constituent pas un total mondial.

## Dernières heures Spot archivées

| UTC | Ouverture (USDC) | Clôture (USDC) | Volume Spot BTC | Messages de liquidations observés | Couverture |
|---|---:|---:|---:|---:|---|
| 2026-11-18T10:00:00Z | 64583.1 | 64306.4 | 49.65343657 | 9 | SAMPLED_WITH_GAPS |
| 2026-11-18T11:00:00Z | 64302.2 | 64173.6 | 61.22743998 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-18T12:00:00Z | 64181.7 | 64021.7 | 22.61247374 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-18T13:00:00Z | 64019.6 | 63871.7 | 27.58725228 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-18T14:00:00Z | 63868.9 | 63613.4 | 165.6546735 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-18T15:00:00Z | 63613.4 | 63071.1 | 71.55791478 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-18T16:00:00Z | 63058.7 | 62704.3 | 149.7626792 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-18T17:00:00Z | 62687.6 | 63047.1 | 89.05156836 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-18T18:00:00Z | 63038.7 | 63121.2 | 21.82686734 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-18T19:00:00Z | 63111 | 62668.5 | 104.9409943 | 14 | SAMPLED_WITH_GAPS |
| 2026-11-18T20:00:00Z | 62684.8 | 62553.2 | 56.29764939 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-18T21:00:00Z | 62557.8 | 62278.9 | 82.01984213 | 0 | NO_DOCUMENTED_OBSERVATION |

## Étude de stratégie — structure EMA 5/13/34 (observation, pas backtest)

- Source : OKX Spot BTC-USDC 1H ; 71 bougies consécutives du 2026-11-15T23:00:00Z au 2026-11-18T21:00:00Z.
- Dernière clôture : 62278.9 USDC/BTC ; EMA 5 : 62671.73 ; EMA 13 : 63217.97 ; EMA 34 : 63829.1 USDC.
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
