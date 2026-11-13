# Seven Heaven — suivi public BTC : 2026-11-13T15:32:49Z

**Statut : DEGRADED_OR_UNVERIFIED** — lecture seule, couverture partielle documentée, aucune exécution réelle.

Fenêtre UTC : 2026-11-12T15:32:49Z au 2026-11-13T15:32:49Z.

## Santé et provenance

- **OKX Spot BTC-USDC 1H** : 23 bougies clôturées dans cette fenêtre ; dernière bougie 2026-11-13T14:00:00Z ; source fraîche : OUI.
- **Liquidations dérivées** : 6 messages observés dans les archives ; 9 fenêtres de connexion par fournisseur (les périodes sans connexion sont inconnues, **pas des liquidations nulles**).
- **Actualités de l'Interface** : 9 événements BTC ; relevé source 2026-11-13T11:37:52.507851+00:00.

| Source dérivés | Messages observés | Fenêtres de connexion |
|---|---:|---:|
| bybit | 0 | 3 |
| binance | 2 | 3 |
| okx | 4 | 3 |

## Interprétation autorisée

Ce rapport constate des **coïncidences temporelles** quand des données sont présentes. Il ne déduit aucune vente Spot d’une liquidation sur dérivés et ne prouve **aucune causalité** des articles.

Les montants OKX en contrats ne sont pas convertis en USDT sans multiplicateur vérifié. Les messages Bybit/Binance ne constituent pas un total mondial.

## Dernières heures Spot archivées

| UTC | Ouverture (USDC) | Clôture (USDC) | Volume Spot BTC | Messages de liquidations observés | Couverture |
|---|---:|---:|---:|---:|---|
| 2026-11-13T03:00:00Z | 70180.5 | 68905.8 | 242.72496929 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-13T04:00:00Z | 68907.5 | 68532.6 | 61.87436891 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-13T05:00:00Z | 68527.6 | 68094.9 | 226.9295786 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-13T06:00:00Z | 68087 | 69020.4 | 101.0826577 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-13T07:00:00Z | 69020.4 | 68533.5 | 153.87184855 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-13T08:00:00Z | 68535.2 | 68656.2 | 86.60380805 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-13T09:00:00Z | 68657.5 | 69043.7 | 59.54638918 | 1 | SAMPLED_WITH_GAPS |
| 2026-11-13T10:00:00Z | 69055.2 | 69290.1 | 67.7805801 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-13T11:00:00Z | 69280.9 | 69276.9 | 78.5208276 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-13T12:00:00Z | 69276.9 | 69163.9 | 26.16241732 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-13T13:00:00Z | 69149.9 | 69507.8 | 99.90848039 | 0 | NO_DOCUMENTED_OBSERVATION |
| 2026-11-13T14:00:00Z | 69513.3 | 68960.9 | 126.75353672 | 0 | NO_DOCUMENTED_OBSERVATION |

## Étude de stratégie — structure EMA 5/13/34 (observation, pas backtest)

- Source : OKX Spot BTC-USDC 1H ; 71 bougies consécutives du 2026-11-10T16:00:00Z au 2026-11-13T14:00:00Z.
- Dernière clôture : 68960.9 USDC/BTC ; EMA 5 : 69156.97 ; EMA 13 : 69418.37 ; EMA 34 : 70631.09 USDC.
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
