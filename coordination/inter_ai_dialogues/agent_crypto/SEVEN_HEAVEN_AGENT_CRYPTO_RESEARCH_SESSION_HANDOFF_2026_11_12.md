# Seven Heaven — Agent-Crypto | Research session handoff

**Date:** 12 novembre 2026  
**Destination:** répertoire partagé inter-IA Agent-Crypto, dépôt public BlueAzur-Hub/erith-ia-memory  
**Mode:** continuité documentaire et recherche PAPER en lecture seule. Aucune opération de marché, aucune clé privée.  
**Objet:** préserver les résultats de cette conversation pour une prochaine session, sans dépendre du fil ChatGPT.

## 1. Ce qui a été repris

Le fil Crypto fourni dans la conversation (export de 24,6 Mo) et la page Notion AETHER · AGENT-INTERFACE ont été consultés. Les quatre captures de l'utilisateur illustrent le Trader 40.6.719 (EMA, volumes, bougies OKX, historique Bitcoin), mais ne certifient pas à elles seules l'intégralité du fonctionnement.

La dernière étude de l'export sur les spreads OKX BTC/ETH avait été dépassée par les travaux publiés ultérieurement sur main, identifiés dans le dépôt partagé : six archives BTC-USDC et ETH-USDC, journées UTC du 15 août, 15 septembre et 15 octobre 2026, 9 628 137 événements L2, 8 640 mesures à la minute et 4 320 comparaisons BTC/ETH. Les analyses minute et durée événementielle ont été documentées ; la continuité logique amont seqId/prevSeqId n'est pas démontrée.

Référence scientifique déjà publiée :
https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/SEVEN_HEAVEN_OKX_BTC_ETH_AUGUST_SEPTEMBER_OCTOBER_ONE_MINUTE_EVENT_TIME_SPREAD_PERSISTENCE_SCIENTIFIC_AUDIT_2026_11_12.md

## 2. Nouveau livrable de CE fil — publié

**Rapport intégral :** [Seven Heaven — OKX Spread, Depth and Trading Fee Study](./SEVEN_HEAVEN_OKX_BTC_ETH_SPOT_USDC_SPREAD_DEPTH_AND_TRADING_FEE_STUDY_2026_11_12.md)

Chemin exact : `coordination/inter_ai_dialogues/agent_crypto/SEVEN_HEAVEN_OKX_BTC_ETH_SPOT_USDC_SPREAD_DEPTH_AND_TRADING_FEE_STUDY_2026_11_12.md`  
Commit de publication : `92640f607f4e5a3e8694c4c1e8adb8f690246501`

Le document initial comptait 135 lignes. Sa **version actuelle a été corrigée en place** après récupération des taux du 06 et 09 novembre déjà présents dans le Notion : elle conserve les CSV sources et rectifie les scénarios de frais et leurs conclusions.

## 3. Résultats recalculés sur les fichiers GitHub existants

Fichiers sources immuables vérifiés :

- `research/strategy_profiles/SEVEN_HEAVEN_OKX_L2_BTC_ETH_AUGUST_SEPTEMBER_OCTOBER_2026_96_QUARTER_HOUR_PAIRED_DEPTH_COSTS_2880_ROWS_2026_11_12.csv`, blob `4cc4d6e6cfda04da29a36ea23fb490ccd03e9238`.
- `research/strategy_profiles/SEVEN_HEAVEN_OKX_L2_BTC_ETH_AUGUST_SEPTEMBER_OCTOBER_2026_96_QUARTER_HOUR_PAIRED_SPREADS_288_ROWS_2026_11_12.csv`, blob `1cd617b6229e23e6d1ef7b1b62d4ee6a691ab659`.

Total : **2 880 lignes de comparaisons de coûts**, **288 couples de carnets BTC/ETH**, pour cinq montants fictifs (10, 100, 1 000, 10 000 et 100 000 USDC), avec achat/vente. Tous les statuts de profondeur indiquent complete.

Moyenne du coût de carnet achat + vente, exprimée en points de base, **spread compris, commissions exclues**, sur 288 instants :

| Notionnel par côté | BTC/USDC | ETH/USDC |
|---:|---:|---:|
| 10 USDC | 0,152870 bp | 0,789531 bp |
| 100 USDC | 0,169698 bp | 0,818375 bp |
| 1 000 USDC | 0,275038 bp | 1,106369 bp |
| 10 000 USDC | 0,876557 bp | 2,116209 bp |
| 100 000 USDC | 3,487034 bp | 10,127262 bp |

**Contrôle de méthode :** le coût VWAP calculé depuis le prix médian inclut déjà le spread. Décomposition : coût carnet = spread + impact supplémentaire de profondeur. **Ne jamais ajouter le spread une deuxième fois.**

Une taille de 1 000 USDC implique une moyenne de 1,34 niveau de carnet par côté en BTC et 1,57 en ETH. À 100 000 USDC, 12,68 niveaux en BTC et 20,85 en ETH. Ces observations sont historiques, figées et non exécutées.

## 4. Frais — correction après lecture du vrai référentiel du projet

**Priorité canonique :** [AETHER · AGENT-INTERFACE, fiche `OKX MEMORY CORE → 01 · Trading Fees`](https://app.notion.com/p/3e07754fe08481eb95c7cdc4fd8ff099). Les taux **Spot maker = 0,0800 %**, **Spot taker = 0,1000 %**, niveau « Utilisateur régulier », étaient **déjà consignés le 6 novembre 2026 et confirmés le 9 novembre**. La capture du 12 novembre est une troisième confirmation, **pas une première découverte**. La fiche canonique contient la consigne **« NE PAS REDÉMANDER »**.

**Incident documenté :** la première version de ce handoff et du rapport a traité un **barème EEE générique** (0,20 % taker par côté) comme scénario « récent » applicable au compte, en dépit des données existantes. Une fiche Notion supplémentaire et une nouvelle demande de capture ont été produites inutilement. **La méthode et les chiffres ont été corrigés** ; la source de vérité pour les frais personnels n'est pas cette fiche secondaire, mais `OKX MEMORY CORE`.

**Hypothèses de simulation cohérentes avec les taux affichés du compte au 12 novembre 2026 :**

- **Taker/taker : 10 + 10 = 20 bp** (0,20 % sur deux côtés fictifs, avant spread + profondeur).
- **Maker/maker : 8 + 8 = 16 bp**, **sans garantie de remplissage**. Ne pas greffer ce taux aux tests qui consomment le carnet en taker.
- **Maker/taker : 8 + 10 = 18 bp**, si les deux types d'ordres correspondent au modèle.

À montant fictif de **1 000 USDC par côté**, sur la **moyenne des 288 snapshots historiques**, commissions et coût du carnet **déjà compris avec le spread** :

- **BTC : 2,0275 USDC** = 2,0000 de commissions hypothétiques + 0,0275 d'écart de carnet.
- **ETH : 2,1106 USDC** = 2,0000 de commissions hypothétiques + 0,1106 d'écart de carnet.

**Les coûts 4,0275 USDC BTC / 4,1106 USDC ETH de la première version sont invalidés comme estimation au tarif actuellement affiché par le compte.** Les hypothèses génériques 70/40 bp des annonces EEE peuvent être conservées uniquement comme **scénarios alternatifs explicitement non personnels**, sans prouver le barème historique de ce compte.

**Date et paire :** ces taux sont observés les 06/09/12 novembre, sans preuve de leur date initiale d'application. L'écran montre des catégories de paires ; le tarif effectivement prélevé sur BTC-USDC ou ETH-USDC à une autre date ne se déduit pas de la capture.

Sources secondaires de continuité :
- [Rapport scientifique corrigé — conserver les calculs et les limites](./SEVEN_HEAVEN_OKX_BTC_ETH_SPOT_USDC_SPREAD_DEPTH_AND_TRADING_FEE_STUDY_2026_11_12.md).
- [Renvoi GitHub vers la mémoire canonique des frais](./SEVEN_HEAVEN_OKX_OBSERVED_SPOT_FEE_REFERENCE_2026_11_12.md).

### Audit V5/V6 du glissement — réalisé et publié le 12 novembre 2026

**Audit terminé :** [Seven Heaven — Scientific Audit of V5/V6 Slippage and Order-Book Calibration](./research/strategy_profiles/SEVEN_HEAVEN_OKX_V5_V6_SLIPPAGE_AND_ORDERBOOK_CALIBRATION_SCIENTIFIC_AUDIT_2026_11_12.md).

- **Code actuel relu sur main :** V5, `market-microscope-paper-backtest-v5.js`, paramètres par défaut **0,10 % taker + 0,05 % glissement** par côté, simulation à l'ouverture OHLC suivante ; V6, `market-microscope-orderbook-paper-v6.js`, estimation sur carnet public OKX frais et pairé (au plus 15 s), **0,10 % taker** par défaut. Ce sont **deux référentiels de prix différents**.
- **Mesure historique conservée :** 3 journées UTC isolées en août/septembre/octobre, 96 carnets par actif/jour, 576 coûts de carnet par actif/ligne de notionnel. Pour un notionnel **1 000 USDC**, coût moyen hors commission **depuis le mid** par côté : **BTC 0,1375 bp**, **ETH 0,5532 bp** ; 0 dépassement de 5 bp dans chacun des 576 côtés par actif. Pour **100 000 USDC** : **10/576 BTC** et **237/576 ETH** dépassent les 5 bp.
- **Interprétation bornée :** ces coûts de carnet sont **fictifs, à un instant figé**, et **ne mesurent pas** le slippage par rapport à la prochaine ouverture V5, qui peut déjà contenir de l'effet microstructurel. Ne **pas** proposer de remplacer le défaut 0,05 % sur cette seule comparaison.
- **Décision :** conserver V5/V6 tels quels ; étudier uniquement des scénarios de sensibilité PAPER à frais réels documentés (0,10 % taker/côté) et glissement fixe explicitement hypothétique (0 %, 0,02 %, 0,05 %, 0,10 %). V6 distingue l'écart VWAP vs meilleure offre de l'écart vs mid (ce dernier **inclut** déjà demi-spread + profondeur).
- **Limite actuelle :** pas de validation de frais d'exécution historiques ni d'appariement des carnets aux signaux et prix d'ouverture suivants ; pas de replay V5/V6, de test Firefox ou de code modifié lors de cette session.
- **Destination mémoire :** la section canonique **Notion `OKX MEMORY CORE → 05 · PAPER / Backtest V5`** a été mise à jour, sans nouvelle page ni duplication.

## 5. Intégrité et limites

- Trois **journées isolées**, jamais trois mois continus.
- Historique OKX **Spot USDC** distinct des backtests EMA **Bitstamp/USD** ; ne pas transférer ces coûts sans validation adaptée.
- Reconstitution des états historiques avec contrôles SHA/CRC, mais exhaustivité amont des événements non garantie.
- Le **niveau du compte et les taux Spot affichés** sont vérifiés par les captures des 06, 09 et 12 novembre ; restent inconnus : la catégorie tarifaire de chaque paire et les commissions réellement prélevées lors d'ordres particuliers.
- Ni Administrator, ni Operator, ni Trader, ni Bridge R31, ni ordres PAPER intégrés n'ont été modifiés par cette session.
- Le **Notion canonique a été mis à jour** avec la troisième confirmation du 12 novembre. La fiche secondaire créée inutilement est désormais identifiée comme une confirmation datée, et ne doit pas être présentée comme référence de premier rang.
- Cette transmission décrit les documents de **cette session** ; elle ne prétend pas reproduire les dizaines de milliers de pages d'archives précédentes.

## 6. Seule prochaine direction scientifique

**L'audit V5/V6 du glissement est désormais fait et publié, il ne doit pas être recommencé.** Prochaine recherche justifiable : protocoliser une **validation appariée** des signaux V5, de l'ouverture de la bougie suivante et du carnet OKX **à même date, même paire, même devise, même côté et même montant**, uniquement si la couverture des archives existe ; sinon statuer « couverture insuffisante / coût estimé ». Tester ensuite, sans modifier le code, la sensibilité aux paramètres de glissement avec **0,10 % taker/côté** connu ; vérifier les exceptions par paire seulement lorsqu'elles changent la décision. Ne pas mélanger les coûts OKX/USDC et Bitstamp/USD.

Aucun nouveau collecteur, ordre ou modification du programme central n'est nécessaire pour poursuivre la recherche documentaire.

**Règle opérationnelle pour la prochaine IA :** relire en premier `OKX MEMORY CORE → 01 · Trading Fees` dans Notion, puis ce handoff, le rapport et l'état GitHub main ; **ne jamais redemander les taux déjà consignés**. Séparer faits, modèles, hypothèses et actions ; réutiliser les preuves, ne pas créer de fiches en double, livrer les correctifs demandés puis s'arrêter.
