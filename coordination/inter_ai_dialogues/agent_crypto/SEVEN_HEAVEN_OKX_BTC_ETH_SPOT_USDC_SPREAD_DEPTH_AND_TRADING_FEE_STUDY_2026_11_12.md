# Seven Heaven — OKX Spot BTC/ETH-USDC: Study of Order-Book Depth, Spread and Trading Fees

**Date:** 12 novembre 2026  
**Statut:** recherche documentaire et recalcul indépendant à partir des CSV publics déjà publiés ; **PAPER / lecture seule**.  
**Périmètre:** BTC-USDC et ETH-USDC, trois journées UTC isolées : 15 août, 15 septembre et 15 octobre 2026.  
**Aucune transaction réelle, aucune clé privée, aucun changement du Trader, de l'Administrator, de l'Operator ou du Bridge.**

## 1. Objectif et sources

L'étude précédente établissait les spreads et leur persistance à la minute. Cette étude complémentaire répond à une question plus pratique :

> Quel est, pour différents montants, le coût théorique d'acheter et de revendre au carnet, et quelle part est due au spread, à la profondeur et aux commissions ?

**Sources numériques contrôlées dans le dépôt public `BlueAzur-Hub/erith-ia-memory` :**

- `coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/SEVEN_HEAVEN_OKX_L2_BTC_ETH_AUGUST_SEPTEMBER_OCTOBER_2026_96_QUARTER_HOUR_PAIRED_DEPTH_COSTS_2880_ROWS_2026_11_12.csv`
  - Blob Git SHA-1 : `4cc4d6e6cfda04da29a36ea23fb490ccd03e9238`
- `coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/SEVEN_HEAVEN_OKX_L2_BTC_ETH_AUGUST_SEPTEMBER_OCTOBER_2026_96_QUARTER_HOUR_PAIRED_SPREADS_288_ROWS_2026_11_12.csv`
  - Blob Git SHA-1 : `1cd617b6229e23e6d1ef7b1b62d4ee6a691ab659`
- Rapport scientifique d'origine : `SEVEN_HEAVEN_OKX_L2_BTC_ETH_AUGUST_SEPTEMBER_OCTOBER_2026_96_QUARTER_HOUR_MULTI_DATE_SCIENTIFIC_REPORT_2026_11_12.md`
- Rapport de persistance minute/événements : `SEVEN_HEAVEN_OKX_BTC_ETH_AUGUST_SEPTEMBER_OCTOBER_ONE_MINUTE_EVENT_TIME_SPREAD_PERSISTENCE_SCIENTIFIC_AUDIT_2026_11_12.md`

Ces documents sont dans le même répertoire `strategy_profiles/` :  
https://github.com/BlueAzur-Hub/erith-ia-memory/tree/main/coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles

Les CSV comportent **288 horaires fixes** (96 par journée), **2 actifs**, **5 tailles** et **2 côtés** : 2 880 lignes de comparaison BTC/ETH pour les coûts, soit **5 760 coûts individuels**. Tous les statuts de profondeur du CSV sont `complete`. Il s'agit de 96 états de carnet par jour et actif, **pas** d'une reconstruction continue des coûts sur toutes les secondes.

## 2. Méthode : ne pas compter le spread deux fois

Chaque prix moyen d'exécution fictif (VWAP) est calculé depuis le **prix médian `mid`** d'un carnet historique figé.

Pour un même horaire, une taille donnée et un actif :

- `coût carnet achat (bp)` : écart entre le VWAP des asks consommés et le mid ;
- `coût carnet vente (bp)` : écart entre le mid et le VWAP des bids consommés ;
- `coût carnet des deux côtés (bp)` = coût achat + coût vente ;
- `impact additionnel de profondeur (bp)` = coût carnet des deux côtés − spread relatif (bp).

**Identité de décomposition :** `coût carnet deux côtés = spread + impact additionnel de profondeur`.

Le spread est donc **déjà compris** dans les coûts de carnet. Il serait faux de l'ajouter une deuxième fois.

Les deux côtés sont évalués au **même instantané de carnet**, sans évolution du prix entre achat et vente : c'est une **friction hypothétique** au même instant, *pas* une simulation de stratégie exécutée dans le temps.

Pour convertir les points de base : **1 bp = 0,01 %**. Un coût de `40 bp` équivaut à `0,40 %` du notionnel.

## 3. Résultats — décomposition des coûts de carnet, hors frais

Moyenne arithmétique sur **288 horaires appariés** par montant. Toutes les valeurs sont en **points de base (bp)** :

| Notionnel par côté | BTC : spread | BTC : impact profondeur | BTC : total carnet | ETH : spread | ETH : impact profondeur | ETH : total carnet |
|---:|---:|---:|---:|---:|---:|---:|
| 10 USDC | 0,151452 | 0,001418 | **0,152870** | 0,783644 | 0,005886 | **0,789531** |
| 100 USDC | 0,151452 | 0,018247 | **0,169698** | 0,783644 | 0,034731 | **0,818375** |
| 1 000 USDC | 0,151452 | 0,123586 | **0,275038** | 0,783644 | 0,322725 | **1,106369** |
| 10 000 USDC | 0,151452 | 0,725106 | **0,876557** | 0,783644 | 1,332564 | **2,116209** |
| 100 000 USDC | 0,151452 | 3,335582 | **3,487034** | 0,783644 | 9,343618 | **10,127262** |

**Observation vérifiée :** lorsque le montant augmente, le prix fictif consomme davantage de niveaux de carnet et son impact supplémentaire croît. Le spread de départ est indépendant du montant **pour un carnet donné** ; son importance relative décroît avec la taille de l'ordre.

**Profondeur mobilisée :**

| Notionnel | BTC : côtés consommant un seul niveau | ETH : côtés consommant un seul niveau | Nombre moyen de niveaux BTC / ETH |
|---:|---:|---:|---:|
| 10 USDC | 99,13 % | 98,96 % | 1,01 / 1,01 |
| 100 USDC | 95,83 % | 95,49 % | 1,06 / 1,06 |
| 1 000 USDC | 78,47 % | 54,69 % | 1,34 / 1,57 |
| 10 000 USDC | 19,10 % | 6,25 % | 3,45 / 3,59 |
| 100 000 USDC | 3,13 % | 0 % | 12,68 / 20,85 |

Un montant fictif de 100 000 USDC est une **expérience de résistance de profondeur**, non une proposition d'investissement ni une validation d'ordre admissible sur un compte.

## 4. Frais : partir du référentiel canonique existant, pas d'un barème générique

**CORRECTION DOCUMENTAIRE du 12 novembre 2026.** Au moment de la première publication de ce rapport, la consultation de la mémoire Notion a été insuffisante : la fiche **`OKX MEMORY CORE → 01 · Trading Fees`** du [Notion AETHER · AGENT-INTERFACE](https://app.notion.com/p/3e07754fe08481eb95c7cdc4fd8ff099) consignait **déjà** les frais personnels vus sur les captures des **6 et 9 novembre 2026**. Une troisième capture du 12 novembre confirme les mêmes taux. Une demande de capture et une nouvelle fiche Notion étaient donc redondantes.

**Taux Spot affichés dans l'espace connecté — niveau « Utilisateur régulier » :**

| Type | Taux affiché par côté | Équivalent en bp | Scénario à deux côtés |
|---|---:|---:|---:|
| **Maker** | **0,0800 %** | 8 bp | 16 bp si maker/maker, sans garantie de remplissage |
| **Taker** | **0,1000 %** | 10 bp | **20 bp** si taker/taker |
| Maker puis taker | 0,0800 % puis 0,1000 % | 8 + 10 bp | 18 bp sous hypothèse de remplissage |

**Règle de mémoire impérative :** la fiche `OKX MEMORY CORE → 01 · Trading Fees` est la **source canonique du projet**. Lire cette fiche avant d'effectuer de nouvelles simulations ou de demander une capture. [Renvoi GitHub secondaire daté, sans données privées](./SEVEN_HEAVEN_OKX_OBSERVED_SPOT_FEE_REFERENCE_2026_11_12.md). L'écran de frais affiché n'est pas la preuve du taux exécuté sur une paire donnée et ne donne pas sa date d'entrée en vigueur.

**Barèmes EEE génériques, conservés uniquement comme contexte externe :** les annonces officielles des frais Spot standard (sans produits dérivés) évoquent 0,35 % taker avant le 25 septembre 2026 et 0,20 % après cette date. Elles ne démontrent **pas** que le compte étudié a jamais payé l'un de ces taux. **Ne plus les utiliser comme frais personnels** ni leur attribuer une baisse propre à ce compte. Documents externes : [annonce d'ajustement EEE](https://www.okx.com/fr-fr/help/important-notice-upcoming-spot-fee-adjustment-eea) et [annonce précédente](https://www.okx.com/fr-fr/help/notice-updates-to-okx-eea-trading-fees).

**Le calcul de consommation du carnet modélise un ordre taker.** Il serait incorrect d'y injecter simplement le taux maker sans modéliser la file d'attente, l'incertitude de remplissage et l'évolution du carnet. Les catégories `Groupe 1` et `Paires sans frais` figurent sur la page OKX : vérifier le traitement de **BTC-USDC** ou **ETH-USDC** avant d'affirmer un tarif d'ordre réel.

## 5. Simulation corrigée : frais Spot observés + carnet historique

**Scénario documentaire homogène** : 0,1000 % par côté, soit **20 bp de commissions taker/taker**, appliqués aux carnets historiques de trois journées. **Ces frais constatés en novembre ne sont pas présumés avoir réellement été en vigueur les 15 août, 15 septembre ou 15 octobre.** Les tableaux ci-dessous représentent une **analyse de sensibilité PAPER à tarif constant**, pas le coût réel des transactions historiques.

Pour 1 000 USDC **par côté**, coût combiné fictif de l'achat et de la vente aux prix moyens du **même carnet figé**, sans évolution temporelle du cours :

| Journée UTC | BTC : coût carnet sans frais | ETH : coût carnet sans frais | Commissions taker/taker supposées | BTC : coût total simulé | ETH : coût total simulé |
|---|---:|---:|---:|---:|---:|
| 15 août | 0,19688 bp | 1,15532 bp | 20 bp | 2,0197 USDC | 2,1155 USDC |
| 15 septembre | 0,44037 bp | 1,47154 bp | 20 bp | 2,0440 USDC | 2,1472 USDC |
| 15 octobre | 0,18786 bp | 0,69224 bp | 20 bp | 2,0188 USDC | 2,0692 USDC |

**Moyenne descriptive sur les 288 instants historiques**, avec la même hypothèse fixe de 20 bp :

| Notionnel par côté | BTC : frais + carnet (bp) | BTC : coût estimé | ETH : frais + carnet (bp) | ETH : coût estimé |
|---:|---:|---:|---:|---:|
| 100 USDC | 20,169698 | 0,2017 USDC | 20,818375 | 0,2082 USDC |
| 1 000 USDC | 20,275038 | 2,0275 USDC | 21,106369 | 2,1106 USDC |

**Ordre fictif de 1 000 USDC :** deux commissions taker représentent environ **2 USDC** au total. Sur la moyenne des carnets, l'impact supplémentaire du spread et de la profondeur atteint **0,0275 USDC pour BTC**, **0,1106 USDC pour ETH**. Soit un coût hypothétique de **2,0275 USDC (BTC)** ou **2,1106 USDC (ETH)**. Les commissions représentent environ **98,64 %** de ce coût BTC et **94,76 %** du coût ETH.

**Mouvement brut indicatif pour couvrir ces coûts :** environ **0,20275 % sur BTC** ou **0,21106 % sur ETH**, uniquement pour cette construction fictive à deux côtés et notionnel constant. Pas de prix cible, de recommandation, de stratégie exécutée ni de véritable point mort : prix d'entrée/sortie, quantités et taxes peuvent différer, et les frais d'un ordre réel peuvent être perçus dans d'autres unités.

**Correction du travail précédent :** les chiffres **4,0275 USDC / 4,1106 USDC** publiés à l'origine correspondaient à **0,20 % taker par côté** (barème générique), non aux **0,10 % taker par côté déjà documentés pour ce compte**. Ils sont invalidés comme « scénario de frais courants du compte ». Les coûts de **carnet sans frais** issus des deux CSV, eux, sont inchangés et vérifiés.

## 6. Contrôles et limites

- **Vérifié ici :** rapprochement par date et horaire des deux CSV, 2 880 lignes de coûts `complete`, 288 observations de spread, identité `carnet = spread + impact` sans résidu négatif significatif au-delà de l'arrondi.
- **Vérifié dans le travail antérieur :** six archives historiques, SHA/CRC et workflows de reproduction ; pas de preuve de chaîne amont `seqId/prevSeqId`.
- **Vérifié dans la mémoire du projet :** le niveau « Utilisateur régulier » et le barème Spot affiché pour ce compte sur les captures des 6, 9 et 12 novembre 2026 (maker 0,08 %, taker 0,10 %). **Non vérifié :** le taux exécuté sur chaque paire et chaque ordre, les exceptions, les remises, les frais historiques réellement payés, et la continuité logique amont des updates OKX.
- **Échantillon limité :** seulement les 15 août, 15 septembre et 15 octobre 2026, 96 instantanés par jour. Ce ne sont ni 3 mois consécutifs, ni un tarif universel, ni une preuve prospective de rentabilité.
- **Périmètre devise et plateforme :** OKX Spot **USDC** uniquement. Ne pas transférer ces valeurs directement aux replays EMA historiques sur Bitstamp **USD**, ni mélanger avec EUR sans conversion sourcée.
- **Aucun double comptage :** le « coût carnet » inclut déjà le spread.
- **Aucune action de marché :** exclusivement calcul papier, aucune écriture sur le compte OKX.

## 7. Décision de recherche et prochaine étape unique

**Résultat de cette phase :** nous avons séparé quantitativement (1) le spread, (2) la consommation supplémentaire de niveaux de carnet avec la taille et (3) les commissions Spot théoriques. Pour de petits montants, les commissions taker dominent fortement ; pour de très gros ordres, la profondeur devient de plus en plus importante.

**Prochaine étape scientifique utile :** pour l'étude PAPER, réutiliser d'abord le **taux Spot déjà consigné dans OKX MEMORY CORE** ; vérifier uniquement les exceptions **par paire** (BTC-USDC / ETH-USDC) et la facturation d'ordres historiques si cela est nécessaire à une comparaison de performance. Mettre en parallèle un scénario constant de 20 bp taker/taker avec une analyse de sensibilité, sans faire passer les barèmes génériques pour les frais personnels et sans confondre OKX/USDC et Bitstamp/USD.

**Point d'arrêt :** aucune modification du Trader ni du Bridge, aucun ordre. Révision du rapport autorisée par la demande de correction du 12 novembre 2026 ; les CSV sources et les études précédentes restent inchangés.