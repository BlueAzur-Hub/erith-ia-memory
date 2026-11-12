# Seven Heaven — OKX Spot : contraintes d'instrument et deuxième relevé

**Étude publique, lecture seule : aucune opération, aucune recommandation de trading.**

## Données instrument récupérées

| Paire | État API | minSz (base) | lotSz (base) | tickSz (USDC) |
|---|---|---:|---:|---:|
| BTC-USDC | live | 0.00001 | 1E-8 | 0.1 |
| ETH-USDC | live | 0.001 | 0.000001 | 0.01 |

## Deux observations, pas une tendance horaire

| Paire | Spread ancien (bp) | Nouveau (bp) | Écart (bp) |
|---|---:|---:|---:|
| BTC-USDC | 0.014006 | 0.014022 | +0.000016 |
| ETH-USDC | 0.049925 | 0.751354 | +0.701429 |

Les heures UTC des deux captures, les octets JSON publics et leurs SHA-256
sont conservés dans les preuves JSON et les fichiers bruts.
Le CSV des exemples contient les montants théoriques 10/20/100/1000 USDC.

**Avertissement :** minSz et lotSz sont des quantités en monnaie de base.
tickSz est un pas de prix en USDC. Les règles d'ordres au marché
peuvent utiliser tgtCcy=quote_ccy ou base_ccy, et la disponibilité
effective d'un instrument dépend aussi du compte, des restrictions
régionales, des soldes et des limites non modélisées.
Deux instantanés ne révèlent pas la variation des spreads par heure.
Aucune donnée n'a été injectée dans le backtest EMA 2024–2026.
