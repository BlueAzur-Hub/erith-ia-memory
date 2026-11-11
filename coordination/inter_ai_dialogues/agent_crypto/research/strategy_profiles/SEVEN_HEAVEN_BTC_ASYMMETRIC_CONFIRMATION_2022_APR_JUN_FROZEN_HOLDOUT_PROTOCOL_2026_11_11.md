# Seven Heaven — Protocole figé avant lecture des cours BTC 2022 Q2

**11 novembre 2026 · recherche PAPER, aucune connexion au compte, aucun ordre.**

## Origine et objectif

Le précédent audit de 108 politiques asymétriques couvre quatre fenêtres **déjà explorées** (2023 Q2, 2024 Q1, 2025 Q1, 2026 fév.–oct.). Le contrôle de robustesse documentaire correspondant montre le risque de surajustement. Il faut donc examiner un bloc de données **non encore utilisé dans cette famille d'études**, sans sélectionner de paramètres sur ses rendements futurs.

## Bloc chronologique retenu AVANT lecture des cours 2022

- **Avril 2022** : 30 jours de chauffe des indicateurs ; aucune transaction fictive.
- **1er mai au 30 juin 2022 inclus** : 61 jours de portefeuille PAPER avec 1 000 USDT au 1er mai, sans réinitialisation au 1er juin.
- Binance Spot **BTCUSDT 1 minute** ; regroupement OHLC en UTC jour, aucune substitution par un prix d'une autre plateforme.
- Archives prévues, empreintes **du registre déjà publié** :

| Mois | Release GitHub | SHA-256 ZIP obligatoirement conforme | Minutes |
|---|---|---|---:|
| 2022-04 | `crypto-spot-bulk-2022-04-1m` | `6e840c81076ac25e6acdbfe4aaeb7aa8b1895a70d8111a3c2908c5134072f097` | 43 200 |
| 2022-05 | `crypto-spot-bulk-2022-05-1m` | `154311f08aa264e233b0c7b472aa490c8cfd1b6083ba86cf6c18134e50536b89` | 44 640 |
| 2022-06 | `crypto-spot-bulk-2022-06-1m` | `0ced8899e9c3b2c098e1c5fc4993250bac22d8684d2d38404310351f35e32c0c` | 43 200 |

Références : `https://github.com/BlueAzur-Hub/erith-ia-memory/releases/tags/<release>` et index public `public/agent_crypto_erith_ia/data/historical_archive_prototype/calendar_year_hourly_shards/index.json`.

## Politiques verrouillées, comparaison primaire

Indicateurs **INCHANGÉS** par rapport aux programmes antérieurs : EMA 10/30 avec clôture > EMA30 ; SuperTrend ATR14 ×3 ; consensus haussier si au moins deux des trois états EMA, MACD12/26/9 (histogramme et MACD positifs), ADX14 ≥20 et DI+ > DI−. Pas de paramètres adaptés sur 2022.

Pour chacune des trois familles, comparer **exactement** quatre politiques de confirmation symétrique ou asymétrique, décidées avant lecture :

1. **E1/S1** : première clôture haussière pour acheter, première baissière pour vendre ; témoin actif.
2. **E3/S1** : entrée après trois clôtures haussières consécutives, sortie après une clôture baissière.
3. **E1/S3** : entrée après une clôture haussière, sortie après trois clôtures baissières consécutives.
4. **E2/S2** : confirmation de deux clôtures à l'achat comme à la vente.

Un treizième témoin **Buy & Hold 100 % BTC** achète fictivement au 1er mai à l'ouverture. Le résultat d'une règle qui reste en cash n'est pas une preuve d'alpha. Aucune nouvelle variante n'est ajoutée après résultat.

## Hypothèses de calcul et métriques, à ne pas modifier

- État calculé après la clôture UTC du jour D ; achat ou vente *hypothétique* à l'ouverture UTC de D+1.
- Positions exclusivement BTC ou USDT (100 %), capital 1 000 USDT, pas de levier, pas d'apport, pas de Grid, pas de compte.
- Frais 0,10 % + glissement 0,05 % **par côté**, puis scénario de coût ×2.
- Valorisation en liquidation fictive quotidienne, capital final, rendement net, drawdown quotidien maximal, nombre de trades, jours cash et BTC, fenêtres de vente/rachat ≤7 jours.
- Comparaison **à l'intérieur du même échantillon** : E3/S1 et E1/S3 contre E1/S1, E2/S2 contre E1/S1, chaque famille contre Buy & Hold. Tous les résultats rapportés, y compris négatifs.
- Critères descriptifs de robustesse seulement, sans seuil d'achat : rendement relatif à Buy & Hold, variation de drawdown, variation des coûts, jours en cash. Aucun gagnant général à partir d'une unique fenêtre 2022.

## Contrôles bloquants

- Empreintes exactes SHA-256 des trois ZIP, membre CSV conforme, 12 colonnes de la source originale, OHLC valides.
- Exactement **131 040** minutes, timestamps strictement espacés d'une minute, zéro lacune/doublon, normalisation ms/us selon format original.
- Agrégation UTC OHLC quotidienne complète (91 jours, avril=30 + mai/juin=61).
- Tests de causalité sur préfixes : les décisions anciennes ne doivent pas changer lorsque des cours futurs sont ajoutés.
- Contrôle comptable BTC/USDT indépendant de l'implémentation primaire ; aucune transaction pendant avril.
- Si un contrôle échoue, **ne pas publier de performance** et documenter l'erreur. Ne jamais fabriquer les cours, les résultats ni les exécutions.

## Statut de cette préinscription

**PROTOCOLE FIGÉ AVANT TOUTE LECTURE OU ANALYSE DE COURS 2022 DANS CETTE SESSION.** Les empreintes et la présence des releases ont été vérifiées dans le catalogue, mais les ZIP n'ont pas pu être téléchargés par l'environnement de calcul. Ce document ne contient aucun résultat de backtest 2022. En cas d'accès bloqué, demander uniquement les trois ZIP à l'utilisateur.

Les sources restent GitHub Releases. Dans Git `main` : uniquement protocole, scripts, rapport et résultats textuels, pas de ZIP binaires. Aucun changement des interfaces ni du Bridge.
