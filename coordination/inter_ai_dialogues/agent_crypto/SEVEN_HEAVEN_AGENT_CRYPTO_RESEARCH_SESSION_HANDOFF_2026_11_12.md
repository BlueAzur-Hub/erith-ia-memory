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

Le document de 135 lignes a été copié intégralement depuis le fichier Markdown généré pendant la session. Il comporte les sources, hypothèses tarifaires, tableaux de coût, limites et prochaine direction.

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

## 4. Frais — attention au périmètre

Le rapport conserve deux **hypothèses de frais de compte EEE Spot standard sans dérivés**, selon les barèmes annoncés autour du 25 septembre 2026 : taker/taker de 70 bp aller-retour avant le changement et 40 bp après. **Ces taux sont des hypothèses de compte, pas des frais personnels vérifiés.** Ne pas les appliquer automatiquement à un compte EEE, VIP, X-Perps ou à une paire particulière sans contrôle.

En scénario indicatif à 0,20 % taker par côté et à montant constant fictif de 1 000 USDC, les moyennes des trois journées impliquent :
- BTC : environ **4,0275 USDC** de frais et friction de carnet cumulés.
- ETH : environ **4,1106 USDC**.

Il s'agit de la somme de deux coûts au **même instantané historique**, et non d'un véritable aller-retour entre deux dates : aucune variation de prix, aucun ordre rempli, aucune latence ni priorité de file simulée. Ne pas extrapoler une rentabilité de stratégie.

### Mise à jour — frais Spot du compte effectivement relevés le 12 novembre 2026

**Source ultérieure et plus spécifique que les hypothèses génériques ci-dessus :** capture de la page OKX authentifiée `Actifs > Frais`, fournie par l'opérateur. Niveau affiché : `Utilisateur régulier`. **Spot maker = 0,0800 %, Spot taker = 0,1000 %** ; cette observation remplace **pour les nouveaux scénarios PAPER à frais courants du compte** l'hypothèse générique de 0,20 % taker par côté. Elle ne réécrit pas les coûts historiques des journées d'août, septembre et octobre 2026.

- [Source de vérité partagée sur GitHub — taux Spot observés, sans soldes ni capture](./SEVEN_HEAVEN_OKX_OBSERVED_SPOT_FEE_REFERENCE_2026_11_12.md).
- [Fiche Notion — taux complets Spot/Futures/Options de la capture](https://app.notion.com/p/4167754fe084817dbcb5e007a399e595).
- Le barème applicable à **BTC-USDC ou ETH-USDC** reste conditionné à la classification effective de la paire dans OKX ; ne pas affirmer une commission d'ordre exécuté sans vérifier la paire et les détails.
- **Priorité de reprise :** ne plus demander les taux Spot à l'opérateur à chaque fil ; consulter ces références et demander une actualisation seulement lorsque cela est nécessaire.

## 5. Intégrité et limites

- Trois **journées isolées**, jamais trois mois continus.
- Historique OKX **Spot USDC** distinct des backtests EMA **Bitstamp/USD** ; ne pas transférer ces coûts sans validation adaptée.
- Reconstitution des états historiques avec contrôles SHA/CRC, mais exhaustivité amont des événements non garantie.
- Les tarifs réels, restrictions EEE et frais du compte doivent encore être contrôlés ; aucune connexion à un compte privé pour cette étude.
- Ni Administrator, ni Operator, ni Trader, ni Bridge R31, ni ordres PAPER intégrés n'ont été modifiés par cette session.
- La page Notion a été **consultée**, pas mise à jour.
- Cette transmission décrit les documents de **cette session** ; elle ne prétend pas reproduire les dizaines de milliers de pages d'archives précédentes.

## 6. Seule prochaine direction scientifique

**Contrôler les tarifs effectifs OKX Spot applicables à un compte et une paire, puis comparer des stratégies PAPER sous plusieurs barèmes explicites et constants**, afin d'évaluer si les performances survivent aux coûts sans contamination des données Bitstamp/USD.

Aucun nouveau collecteur, ordre ou modification du programme central n'est nécessaire pour poursuivre la recherche documentaire.

**Règle opérationnelle pour la prochaine IA :** lire ce handoff puis le rapport complet ; vérifier le GitHub main avant de refaire une étude ; distinguer faits, modèles, hypothèses et actions ; publier les nouveaux documents de recherche dans ce répertoire partagé si demandé, et s'arrêter dès que la preuve est suffisante.
