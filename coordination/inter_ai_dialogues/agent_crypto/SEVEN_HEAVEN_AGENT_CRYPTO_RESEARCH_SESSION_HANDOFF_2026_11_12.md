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

### Étude de causalité V5 ↔ L2 — réalisée le 12 novembre 2026

**Rapport :** [V5 L2 Causal Timing and Signal Pairing Eligibility](./research/strategy_profiles/SEVEN_HEAVEN_V5_OKX_L2_CAUSAL_TIME_ALIGNMENT_AND_SIGNAL_PAIRING_ELIGIBILITY_AUDIT_2026_11_12.md). **Preuves numériques :** [JSON de contrôle](./research/strategy_profiles/SEVEN_HEAVEN_V5_OKX_L2_CAUSAL_TIME_ALIGNMENT_AND_SIGNAL_PAIRING_PROOFS_2026_11_12.json).

- **3 journées historiques déjà publiées** (15 août, 15 septembre, 15 octobre 2026), **288 horaires de quart d'heure par actif** (576 états BTC-USDC et ETH-USDC), tous unique et contrôlés.
- **Causalité au début de la bougie :** **571/576 carnets sont horodatés après le créneau de 1 à 9 ms** ; **5/576** ont le même timestamp à la milliseconde, ordonnancement inconnu ; **0/576** sont strictement antérieurs au créneau. Les anciens CSV sélectionnaient précisément le **premier carnet valide à ou après** le créneau : cette méthode reste pertinente pour mesurer la liquidité, mais elle **ne prouve pas une disponibilité pré-exécution** à l'heure exacte T.
- **V5 5m** : 864 ouvertures théoriques/actif sur les trois dates, **288** créneaux ayant un carnet complet publié ; les **576 autres créneaux sur 864** n'ont pas de carnet complet publié. Le fichier minute montre **les spreads** à 864 ouvertures/actif, sans profondeur ; sur les 1728 relevés minute à 5m, **1721** sont après T, **7** égaux ms, **0** avant.
- **V5 15m** : 288 créneaux par actif et 288 carnets publiés, mais **aucun ne prouve le carnet connu strictement avant T**.
- **V5 4h** : 18 créneaux par actif, soit 36 états publiés pour les deux actifs, **tous après T**, aucun pré-exécution.
- **Ne pas confondre horaires possibles et vrais signaux EMA :** les recettes V5 du 06/11 dans Notion documentent les nombres de signaux et de transactions, sans liste `entryAt`/`exitAt` individuelle dans la section inspectée ; **aucun appariement exhaustif aux six archives n'a été effectué**. Un zéro de preuve **n'est pas** une preuve de zéro événement appariable.
- **Ne pas proclamer de nouvelle performance ni de slippage exécuté** : l'analyse ne comprend aucun OHLC historique natif apparié, aucun `next.open` comparé au carnet avant soumission, aucune latence établie.

**Décision :** garder frais Spot taker observés **0,10 %/côté** et forfait V5 **0,05 %/côté**. Une modification de paramètres sur la base d'états postérieurs à l'ouverture serait prématurée. Rejouer ciblé les archives L2 complètes seulement si nécessaire pour obtenir **le dernier carnet strictement AVANT** le cutoff fixé, et reproduire les signaux V5 sur **mêmes dates / paires / devises / côtés / tailles**.

### Reproduction réelle des données publiques et appariement historique V5 — 13 novembre 2026

**NOUVELLE PREUVE ACQUISE, postérieure à l'audit de couverture ci-dessus :** [rapport scientifique de la reproduction BTC-USDC 15/10/2026, V5 EMA 5/13 à 15m ↔ carnet strictement avant T](./research/strategy_profiles/SEVEN_HEAVEN_BTC_USDC_V5_EMA5_13_PREOPEN_ORDERBOOK_EXECUTION_RESEARCH_REPORT_2026_11_13.md), [preuve JSON native complète](./research/strategy_profiles/SEVEN_HEAVEN_BTC_USDC_V5_EMA5_13_2026_10_15_CAUSAL_L2_PROOFS.json), [programme reproductible](./research/strategy_profiles/SEVEN_HEAVEN_BTC_USDC_V5_EMA5_13_2026_10_15_CAUSAL_L2_REPLAY.py), [GitHub Actions — SUCCESS, run 43327600503](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/43327600503).

- **Données source vérifiées :** 300 bougies confirmées natives OKX BTC-USDC 15m, du **12/10 21:00 UTC** au **15/10 23:45 UTC** ; 2 346 486 événements d'archive L2 BTC-USDC 15/10 entièrement rejoués, SHA-256 archive et membre / CRC contrôlés, 4 références antérieures concordantes.
- **V5 original validé :** 32 croisements EMA 5/13 dans les 300 bougies, 12 opérations fictives (6 achats, 6 ventes : 6 cycles) sur le 15 octobre ; **les timestamps des 12 opérations sont identiques à ceux du module V5 JavaScript réel**, contrôle indépendant GitHub Actions vert.
- **Causalité événementielle :** **12/12** opérations associées au **dernier carnet horodaté strictement avant** leur ouverture fictive ; **9/12** carnets âgés d'au plus 100 ms, **12/12** d'au plus 1 000 ms ; âge 3–253 ms. **Ce test réussit là où les anciens premiers carnets à T+millisecondes étaient impropres à la preuve.**
- **Coûts descriptifs au carnet, 1 000 USDC fixes par côté :** friction théorique mid→VWAP moyenne **0,125681 bp**, maximum **1,011898 bp**, demi-spread déjà compris ; écart absolu entre VWAP pré-T et OHLC next.open, moyenne **0,726011 bp**, max **2,902325 bp**, variablement favorable/défavorable.
- **Six cycles PAPER, capital fictif remis à 1 000 USDC au début du 15 octobre (ce n'est PAS le PnL natif du V5 sur les 300 bougies), au tarif taker observé 0,10 %/côté (hypothèse transposée à octobre) :** V5 forfait 0,05 % de glissement/côté **−23,51424 USDC** sur capital initial de 1 000 USDC (−2,3514 %) ; scénario contrefactuel utilisant VWAP du carnet avant T **−17,63313 USDC** (−1,7633 %) ; écart **+5,88111 USDC** pour le contrefactuel. **Deux simulations perdues, zéro ordre réel. Le JavaScript V5 a validé les timestamps des opérations, pas ces PnL de simulation journalière réinitialisée.** Le notionnel du carnet est fixé à 1 000 USDC, même si le capital de la simulation évolue.
- **Limites :** aucun remplissage réel ni latence mesurée ; timestamp source L2 ne garantit pas disponibilité avant soumission ; EMA/V5 sans fuite temporelle sur bougies clôturées mais OHLC next.open est un prix de premier trade, pas le mid ; séquence amont L2 non démontrée ; les frais de compte vus en novembre ne prouvent pas le taux historique exact d'octobre.
- **Décision :** conserver V5 (taker 0,10 %/côté, forfait glissement 0,05 %/côté) et V6 inchangés. Ne pas recommencer le test BTC du 15 octobre. Pas de modification Trader, Operator, Administrator, Bridge ni d'ordres.

### Étude comparée BTC-USDC sur les trois dates — terminée et vérifiée le 13 novembre 2026

**Nouvelle étape faite, sans recommencer les archives déjà publiées :** [rapport scientifique comparatif BTC/USDC EMA 5/13 et carnets pré-ouverture des 15 août, 15 septembre et 15 octobre](./research/strategy_profiles/SEVEN_HEAVEN_BTC_USDC_EMA5_13_AUGUST_SEPTEMBER_OCTOBER_PREOPEN_L2_SCIENTIFIC_COMPARISON_2026_11_13.md), [preuves JSON consolidées](./research/strategy_profiles/SEVEN_HEAVEN_BTC_USDC_EMA5_13_THREE_DAYS_PREOPEN_L2_EXECUTION_COMPARATIVE_PROOFS_2026_11_13.json), [workflow GitHub Actions août-septembre — SUCCESS](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/43330003604), [workflow octobre — SUCCESS](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/43327600503).

- **Sources identiques au protocole antérieur :** 300 OHLC confirmées OKX Spot BTC-USDC 15m pour chacune de **trois fenêtres séparées**, EMA 5/13, signaux originaux recoupés avec le **vrai moteur JS V5** ; **4 459 980** événements L2 sur les trois archives de journées, vérifications SHA-256/CRC et références.
- **Appariements stricts :** 15 août **11/11** (dont une vente héritée d'une position précédente), 15 septembre **2/2**, 15 octobre **12/12** ; **25/25 opérations avec un carnet antérieur à T selon les timestamps source**, **14/25** carnets ≤100 ms, **23/25** ≤1 seconde, **25/25** ≤10 secondes. Deux carnets plus âgés de 1 seconde le 15 août.
- **Friction théorique moyenne du carnet, mid→VWAP, sur 25 côtés** : **0,166301 bp** (max **1,144010 bp**), demi-spread inclus et frais exclus ; **aucun coût mid→VWAP supérieur à 5 bp**. Mais l'écart absolu moyen carnet-VWAP versus ouverture OHLC est **0,946189 bp**, et **une vente du 15 septembre** atteint **5,149755 bp défavorables** : **attention** à ne pas assimiler mid→VWAP, prix OHLC et véritable slippage.
- **Rendements PAPER seulement pédagogiques**, capital remis à 1 000 USDC au **premier achat complet de chaque journée**, sans continuité entre dates, et notionnel du carnet fixé à 1 000 USDC à chaque côté : août **5 cycles** V5 **−16,5354 USDC**, carnet pré-T **−12,1283** ; septembre **1 cycle** V5 **−15,6626**, carnet **−15,0979** ; octobre **6 cycles** V5 **−23,5142**, carnet **−17,6331**. La vente reportée au début du 15 août est exclue de ce calcul de PnL journalier, mais incluse dans l'audit de causalité. **NE PAS additionner ces PnL pour prétendre représenter un trimestre ni les confondre avec le PnL du V5 sur les 300 bougies.**
- **Limites persistantes :** aucune latence d'exécution réelle, aucune garantie de disponibilité réseau à T, aucune confirmation de frais historiques d'août-septembre-octobre et aucune continuité amont L2 `seqId/prevSeqId` démontrée. Trois dates isolées et 25 opérations ne prouvent pas la stabilité du glissement.
- **Décision définitive de cette phase :** garder les hypothèses V5 déjà présentes **taker 0,10 %/côté et glissement forfaitaire 0,05 %/côté**, V6 inchangé, aucun ordre et aucun code de production modifié. La section canonique **Notion `OKX MEMORY CORE → 05 · PAPER / Backtest V5`** est mise à jour. **Ne plus proposer de rejouer BTC/USDC les trois journées : le test est fait.**

### ETH-USDC : trois journées de validation V5 / L2 pré-ouverture — terminées le 13 novembre 2026

**RÉSULTAT ACQUIS :** [rapport scientifique ETH-USDC, 15 août, 15 septembre et 15 octobre 2026](./research/strategy_profiles/SEVEN_HEAVEN_ETH_USDC_EMA5_13_AUGUST_SEPTEMBER_OCTOBER_PREOPEN_L2_SCIENTIFIC_COMPARISON_2026_11_13.md) ; [preuve consolidée ETH vs BTC et empreintes des archives](./research/strategy_profiles/SEVEN_HEAVEN_ETH_USDC_EMA5_13_THREE_DAYS_PREOPEN_L2_AND_BTC_COMPARATIVE_PROOFS_2026_11_13.json) ; [GitHub Actions 43332184629 — 3/3 jobs SUCCESS](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/43332184629). Une première version du contrôleur CI a échoué sur une variable de date non définie ; corrigée puis complètement revérifiée par la seconde exécution. **Ne pas confondre cet incident logiciel avec une donnée de marché.**

- **Données vérifiées :** **5 168 157 événements L2 ETH** sur trois archives natives SHA/CRC et 900 bougies Spot ETH-USDC 15m dans trois fenêtres disjointes de 300. Les dates des **24 opérations EMA 5/13** sont recoupées avec **le vrai V5 JavaScript** ; **24/24** derniers états de carnet horodatés avant T. **21/24** états ≤1 s, **23/24** ≤10 s ; la vente du **15/08 à 20:30 UTC** a un carnet vieux de **11 888 ms** et **échoue au seuil de 10 s** (malgré l'appariement strict pré-T). La chaîne de continuité amont L2 et la disponibilité effective réseau ne sont pas prouvées.
- **Comparaison BTC/ETH, seulement même date, PAS même moment des signaux :** sur les opérations V5 déclenchées, friction moyenne mid→VWAP **BTC 0,166301 bp** sur 25 côtés et **ETH 0,626362 bp** sur 24 côtés, **demi-spread déjà compris** et sans commission. Écart absolu moyen carnet pré-T vs ouverture OHLC **BTC 0,946189 bp**, **ETH 1,404502 bp** ; une vente ETH du **15/09 à 13:45 UTC** atteint **6,894273 bp défavorables**, au-delà du forfait V5 de 5 bp sans constituer une mesure de slippage exécuté.
- **Comptages jour par jour ETH :** août **9 opérations**, **4 cycles intra-journaliers** (une vente héritée exclue du PnL reset), septembre **9 opérations**, **4 cycles** et **un achat restant ouvert à 23:30 UTC**, octobre **6 opérations et 3 cycles**. Au tarif taker PAPER 0,10 %/côté et 1 000 USDC **réinitialisés par jour** : PnL V5 vs carnet hypothétique, août **−13,8911 / −10,8132 USDC**, septembre **−47,4247 / −44,9040**, octobre **+14,2271 / +16,7643**. **Le carnet du 15 août dépassant 10 s rend son contrefactuel non qualifié à ce seuil** ; les valeurs sont des illustrations brutes, pas des performances réelles ou un portefeuille continu.
- **Limites :** frais du compte observés en novembre, **pas prouvés sur ces dates historiques** ; carnet de référence fixé à 1 000 USDC malgré variation du capital ; aucune latence, disponibilité réseau, file d'attente ou ordre réel. **Ne pas optimiser V5 sur 3 dates et 24 actions ETH.**
- **Décision mémoire :** les **six couples (BTC/ETH × 15 août, 15 septembre, 15 octobre)** sont maintenant étudiés et publiés. Le Notion canonique `OKX MEMORY CORE → 05 · PAPER / Backtest V5` est mis à jour ; **NE PAS refaire les six tests ni redemander les frais**. Garder V5 **taker 0,10 % / glissement forfaitaire 0,05 %** par côté et V6 inchangés. Aucun Trader/Bridge/Administrator/Operator modifié.

## 6. Seule prochaine direction scientifique

**Les deux études BTC-USDC et ETH-USDC sur les trois dates ont été EXÉCUTÉES et VALIDÉES, leurs preuves sont publiées.** Ne pas rejouer ce périmètre par défaut. **Prochaine étude scientifiquement justifiable : prédéfinir d'autres dates/régimes de marché et vérifier d'abord les archives L2 et OHLC, puis appliquer SANS OPTIMISATION RÉTROSPECTIVE le même protocole sur les deux actifs.** Conserver les seuils de fraîcheur (100 ms / 1 s / 10 s) ; exclure honnêtement les carnets trop anciens de toute métrique qualifiée, sans les effacer des preuves brutes. Sinon faire une **analyse de sensibilité PAPER** des forfaits 0,02 % / 0,05 % / 0,10 % par côté, explicitement hypothétiques. Aucun tarif historique de compte ni slippage réel n'est prouvé. Ne pas mélanger OKX/USDC et Bitstamp/USD.

**Trois extracteurs de recherche reproductibles sont désormais publiés : deux BTC (octobre, puis août/septembre) et un ETH pour les trois dates.** Tous les tests cités ont été exécutés sur données publiques, contrôlés avec le véritable V5 JavaScript et consignés sans ordre réel ni modification des programmes Administrator, Trader, Operator ou Bridge.

**Règle opérationnelle pour la prochaine IA :** relire en premier `OKX MEMORY CORE → 01 · Trading Fees` dans Notion, puis ce handoff, le rapport et l'état GitHub main ; **ne jamais redemander les taux déjà consignés**. Séparer faits, modèles, hypothèses et actions ; réutiliser les preuves, ne pas créer de fiches en double, livrer les correctifs demandés puis s'arrêter.

## 7. Mise à jour 13 novembre 2026 — protocole prospectif gelé

**L'étude L2 précédente (section 6) est achevée ; cette note supplante son ancienne direction « encore plus de journées L2 » pour le programme comparatif EMA.** Les paramètres de production n'ont pas changé.

- **13/11 — Bilan comparatif rétrospectif réellement reproduit et validé** : [rapport BTC/ETH cash, EMA et risques](./research/strategy_profiles/SEVEN_HEAVEN_BTC_ETH_DAILY_CASH_OPPORTUNITY_CONFIRMATION_AND_RISK_REPORT_2026_11_13.md), [preuves JSON](./research/strategy_profiles/SEVEN_HEAVEN_BTC_ETH_DAILY_CASH_OPPORTUNITY_CONFIRMATION_AND_RISK_PROOFS_2026_11_13.json), [programme reproductible](./research/strategy_profiles/SEVEN_HEAVEN_BTC_ETH_DAILY_CASH_OPPORTUNITY_CONFIRMATION_AND_RISK_REPLAY_2026_11_13.js), CI #43343936630 SUCCESS. Deux actifs Bitstamp USD, 1 035 jours continus 2024–octobre 2026, sept politiques ; aucun nouveau succès prédictif prétendu.
- **13/11 — Gel avant collecte de novembre** : [protocole prospectif sans réoptimisation](./research/strategy_profiles/SEVEN_HEAVEN_BTC_ETH_EMA_PROSPECTIVE_NO_RETUNING_PROTOCOL_2026_11_13.md), commit `351dc515192dd02c10abea9bc09836699d046f7f`. Trois méthodes uniquement pour l'évaluation : HOLD, EMA FAST 5/13, EMA SLOW 10/30 ; mêmes frais PAPER hypothétiques 0,10 % et glissement 0,05 % par côté, stress ×2. USD Bitstamp ≠ OKX USDC.
- **Contrôle indépendant du 1er au 12 novembre 2026 : TERMINÉ**, 12 bougies natives closes BTC/USD et 12 ETH/USD, SHA de réponses API et sources consignés ; **CI #43345185112 SUCCESS**. [Rapport diagnostique](./research/strategy_profiles/seven_heaven_ema_frozen_forward_evidence/SEVEN_HEAVEN_BTC_ETH_NOVEMBER_TEMPORAL_DIAGNOSTIC_2026_11_13_NOVEMBER_01_12_REPORT.md) ; [preuves JSON](./research/strategy_profiles/seven_heaven_ema_frozen_forward_evidence/SEVEN_HEAVEN_BTC_ETH_NOVEMBER_TEMPORAL_DIAGNOSTIC_2026_11_13_NOVEMBER_01_12_PROOFS.json). Les deux règles FAST et SLOW sont restées **entièrement en cash, 0 opération et 0 %** pour chacun des actifs ; les témoins Buy & Hold ont perdu **−8,09 % BTC**, **−10,68 % ETH**, **−9,39 % 50/50**. **Attention : ces journées sont déjà passées au moment du gel, ce n'est PAS une validation prospective ; 12 jours ne sont pas probants.**
- **Véritable suivi prospectif automatisé** : [workflow hebdomadaire](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/.github/workflows/seven-heaven-btc-eth-frozen-forward-observation.yml), lundi à 02:45 UTC, read-only public GET, archives nouvelles observations et preuves dans `research/strategy_profiles/seven_heaven_ema_frozen_forward_evidence/`, uniquement pour les **journées closes à partir du 13 novembre UTC**. Reproducteur : [programme Python](./research/strategy_profiles/SEVEN_HEAVEN_BTC_ETH_FROZEN_NOVEMBER_HOLDOUT_AND_FORWARD_OBSERVATION_2026_11_13.py). Le premier jour 13/11 est clos après 14/11 00:00 UTC ; aucune performance future annoncée à ce stade. Revues quantitatives après 14, 30 et 90 jours ; **même 90 jours ne prouvent pas un avantage durable**. Le programme s'arrête explicitement après 120 jours sans nouveau protocole, afin de ne pas changer silencieusement de périmètre.
- **Ne pas recommencer** les audits 2024–2026, les trois journées L2 BTC/ETH ni le diagnostic 1–12 novembre. Pour reprendre : ouvrir en priorité **les derniers fichiers datés `PROSPECTIVE_..._REPORT.md`** du sous-répertoire de preuves et consulter la dernière exécution GitHub Actions. Si aucune observation n'est encore close, **aucun résultat prospectif n'existe**.
- **Frontière :** aucune notification de trading ni ordre réel ; aucune modification de l'Administrator, Trader, Operator, Bridge, des clés ou des taux de frais existants. Notion non modifié lors de cette nouvelle phase.
