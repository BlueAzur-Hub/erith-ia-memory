# Seven Heaven — suivi public BTC : 2026-11-13T22:03:12Z

**Statut : DEGRADED_OR_UNVERIFIED** — lecture seule, couverture partielle documentée, aucune exécution réelle.

Fenêtre UTC : 2026-11-12T22:03:12Z au 2026-11-13T22:03:12Z.

## Santé et provenance

- **OKX Spot BTC-USDC 1H** : 23 bougies clôturées dans cette fenêtre ; dernière bougie 2026-11-13T21:00:00Z ; source fraîche : OUI.
- **Liquidations dérivées** : 5 messages observés dans les archives ; 9 fenêtres de connexion par fournisseur (les périodes sans connexion sont inconnues, **pas des liquidations nulles**).
- **Actualités de l'Interface** : 18 événements BTC ; relevé source 2026-11-13T18:48:09.321787+00:00.

| Source dérivés | Messages observés | Fenêtres de connexion |
|---|---:|---:|
| bybit | 1 | 3 |
| binance | 4 | 3 |
| okx | 0 | 3 |

## Interprétation autorisée

Ce rapport constate des **coïncidences temporelles** quand des données sont présentes. Il ne déduit aucune vente Spot d’une liquidation sur dérivés et ne prouve **aucune causalité** des articles.

Les montants OKX en contrats ne sont pas convertis en USDT sans multiplicateur vérifié. Les messages Bybit/Binance ne constituent pas un total mondial.

## Dernières heures Spot archivées

| UTC | Ouverture (USDC) | Clôture (USDC) | Volume Spot BTC | Messages de liquidations observés | Couverture |
|---|---:|---:|---:|---:|---|
| 2026-11-13T10:00:00Z | 69055.2 | 69290.1 | 67.7805801 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-13T11:00:00Z | 69280.9 | 69276.9 | 78.5208276 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-13T12:00:00Z | 69276.9 | 69163.9 | 26.16241732 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-13T13:00:00Z | 69149.9 | 69507.8 | 99.90848039 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-13T14:00:00Z | 69513.3 | 68960.9 | 126.75353672 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-13T15:00:00Z | 68959.6 | 68854.5 | 181.2399499 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-13T16:00:00Z | 68854.4 | 68662.1 | 88.76534954 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-13T17:00:00Z | 68662.1 | 68903.6 | 55.55035147 | 3 | SAMPLED_WITH_GAPS |
| 2026-11-13T18:00:00Z | 68903.4 | 68942.3 | 26.53501314 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-13T19:00:00Z | 68945.9 | 69008.7 | 16.60228964 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-13T20:00:00Z | 69018 | 68868.2 | 19.82008479 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-13T21:00:00Z | 68863.2 | 68340.8 | 45.38891389 | 0 | NO_DOCUMENTED_OBSERVATION |

## Étude de stratégie — structure EMA 5/13/34 (observation, pas backtest)

- Source : OKX Spot BTC-USDC 1H ; 71 bougies consécutives du 2026-11-10T23:00:00Z au 2026-11-13T21:00:00Z.
- Dernière clôture : 68340.8 USDC/BTC ; EMA 5 : 68730.32 ; EMA 13 : 68989.61 ; EMA 34 : 70020.85 USDC.
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
