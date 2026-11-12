# Seven Heaven — ETH-USDC : étude V5 EMA 5/13 et carnet OKX strictement pré-ouverture (15 août, 15 septembre, 15 octobre 2026)

**Rapport daté du 13 novembre 2026.** Recherche documentaire en lecture seule ; trois dates historiques isolées, **aucun ordre réel**. Même protocole préenregistré que [l'étude BTC-USDC déjà terminée](./SEVEN_HEAVEN_BTC_USDC_EMA5_13_AUGUST_SEPTEMBER_OCTOBER_PREOPEN_L2_SCIENTIFIC_COMPARISON_2026_11_13.md), sans changer les paramètres.

## 1. Résultat et validation

**Les trois journées ETH-USDC ont été rejouées avec succès.** [GitHub Actions : trois jobs SUCCESS, dont la vérification indépendante des dates d'ordres par le véritable module V5 JavaScript](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/43332184629).

- **ETH** : **5 168 157 événements L2** de trois archives, **900 bougies natives OKX confirmées** dans trois fenêtres disjointes de 300, **71 croisements EMA** dans ces fenêtres de calcul (non assimilables à des transactions de trois mois), **24 opérations fictives** vérifiées par le V5 natif et **24/24 carnets strictement horodatés AVANT leur ouverture**.
- **BTC de référence** : **4 459 980 événements L2**, 25 opérations V5 déjà prouvées sur les mêmes dates de calendrier, **mais à des horaires de signal généralement différents**.
- Les six archives totalisent donc **9 628 137 événements** déjà contrôlés par SHA-256 et CRC, avec les anciennes ancres de référence (96/96 en août et septembre, 4/4 en octobre). La continuité complète amont `seqId/prevSeqId` n'a pas été établie.
- **Compte OKX** : référence canonique [Notion `OKX MEMORY CORE → 01 Trading Fees`](https://app.notion.com/p/3e07754fe08481eb95c7cdc4fd8ff099) : **taker Spot 0,10 % par côté**, maker 0,08 %. Pour la comparaison, seule l'hypothèse **taker 0,10 %** est appliquée ; les commissions personnelles réellement prélevées durant les trois mois étudiés et les éventuelles exceptions par paire ne sont pas prouvées.

**Méthode identique au BTC :** Spot `ETH-USDC`, bougies de 15 minutes, EMA rapide **5** / lente **13**, `next.open` de bougie contiguë suivante, long-only V5, glissement forfaitaire **0,05 % par côté** (5 bp), capital PAPER de référence 1 000 USDC, prix VWAP hypothétique de carnet pour **1 000 USDC fixes par sens**, et **dernier carnet dont l'horodatage L2 est strictement inférieur à T** (ouverture simulée). Pas de sélection du premier carnet postérieur à T.

## 2. Résultats temporels ETH, qualité de la profondeur

| Journée UTC | Événements L2 entièrement relus | Croisements EMA (fenêtre 300 bougies) | Opérations fictives pré-T | Carnets âgés ≤1 s | Carnets âgés ≤10 s | Coût moyen mid→VWAP par opération |
|---|---:|---:|---:|---:|---:|---:|
| 15/08 | 277 791 | undefined | 9 | 6/9 | 8/9 | 0,657 bp |
| 15/09 | 1 717 498 | undefined | 9 | 9/9 | 9/9 | 0,820 bp |
| 15/10 | 3 172 868 | undefined | 6 | 6/6 | 6/6 | 0,291 bp |
| **Ensemble ETH** | **5 168 157** | **71** | **24** | **21/24** | **23/24** | **0,626 bp** |

**Qualification importante :** les **24** opérations ETH sont toutes appariées à un état L2 **avant T**, mais cela ne signifie pas que les 24 états sont suffisamment récents : **21/24** ont au plus une seconde d'âge ; **23/24** ont au plus dix secondes. Une **vente du 15 août à 20:30 UTC** repose sur un carnet âgé de **11 888 ms** : **dépassé selon notre seuil 10 s**, elle doit être exclue d'une comparaison présentée comme « ≤10 s qualifiée ». Elle reste dans les statistiques descriptives pour éviter d'effacer une donnée gênante.

**Une seconde dimension :** le 15 août commence par une **vente d'une position ouverte avant cette journée**. Le 15 septembre finit par un **achat dont la position n'est pas clôturée avant la fin de la journée**. Ces deux opérations sont conservées dans les contrôles temporels, mais ne forment pas à elles seules un aller-retour journalier complet.

**Coût `mid → VWAP` :** distance défavorable du VWAP estimé depuis le mid du **même carnet**, contenant **déjà le demi-spread et la consommation de profondeur**, hors frais. Pour ces 24 états ETH : moyenne **0,626362 bp** ; maximum **1,600869 bp** ; **0/24** au-delà de 5 bp.

**Différence entre le carnet et `next.open` :** moyenne de la **valeur absolue** **1,404502 bp**, maximum **6,894273 bp**. Une vente ETH le **15 septembre à 13:45 UTC** présente un écart **défavorable** de **6,894273 bp**, au-dessus du forfait V5 de 5 bp, malgré son propre coût mid→VWAP inférieur à 1 bp. **Un petit spread n'annule donc pas la différence entre la transaction OHLC d'ouverture et la cotation de carnet juste avant T.**

## 3. Comparaison descriptive BTC / ETH sur les mêmes journées, PAS aux mêmes horaires

Les actifs sont étudiés avec exactement le même moteur et les mêmes **dates de calendrier**, mais **leurs signaux EMA ne surviennent pas nécessairement au même moment**. Les moyennes ci-dessous ne sont **pas** des paires contemporaines comparables à une transaction simultanée BTC vs ETH.

| Journée | Opérations BTC | Opérations ETH | Coût moyen carnet BTC | Coût moyen carnet ETH | Écart abs. carnet/ouverture BTC | Écart abs. carnet/ouverture ETH |
|---|---:|---:|---:|---:|---:|---:|
| 15/08 | 11 | 9 | 0,127 bp | 0,657 bp | 0,810 bp | 1,139 bp |
| 15/09 | 2 | 9 | 0,627 bp | 0,820 bp | 3,018 bp | 1,987 bp |
| 15/10 | 12 | 6 | 0,126 bp | 0,291 bp | 0,726 bp | 0,928 bp |
| **Pondéré par opération, 3 jours** | **25** | **24** | **0,166 bp** | **0,626 bp** | **0,946 bp** | **1,405 bp** |

**Lecture :** sur les opérations sélectionnées par le V5 dans ces trois journées, la friction théorique moyenne du carnet ETH est numériquement supérieure à celle de BTC, ce qui concorde avec notre première étude L2. Cependant, **ce n'est ni une loi générale du marché, ni une comparaison microseconde à microseconde**, et les différences d'horaires/états de volatilité peuvent expliquer une partie de l'écart.

**Âge des carnets :** BTC **23/25** ≤1 s, ETH **21/24** ≤1 s. Les deux mesures doivent rester distinguées avant un éventuel réglage par instrument.

## 4. Simulations PAPER sur les cycles COMPLETS de chaque journée — illustratives

**Important :** chaque journée est simulée **indépendamment**, avec un **capital fictif réinitialisé à 1 000 USDC au premier achat complet**, et seulement les allers-retours **entièrement clôturés dans cette même journée**. La vente héritée au début d'août et l'achat restant ouvert à la fin de septembre sont exclus du calcul de PnL journalier, mais comptés dans l'audit des carnets. Les résultats ne constituent pas le PnL natif V5 sur les 300 bougies complètes, ni un historique continu de portefeuille.

**Deux règles, frais taker supposés à 0,10 % par côté :**
- `V5` : `buy=next.open × 1,0005`, `sell=next.open × 0,9995`, puis commission d'achat/vente de 0,10 % ;
- `Carnet pré-T` : VWAP hypothétique pour **1 000 USDC fixés par côté**, aux dates d'exécution fictives, puis mêmes commissions. La quantité de carnet reste fixe même si le capital réinvesti change ; **aucun ordre réel n'a subi ces prix**.

| Date ETH | Cycles complets dans la journée | PnL PAPER V5 fixe | PnL PAPER carnet pré-T | Différence illustrative |
|---|---:|---:|---:|---:|
| 15/08 | 4 | -13,89 USDC | -10,81 USDC | 3,08 USDC |
| 15/09 | 4 | -47,42 USDC | -44,90 USDC | 2,52 USDC |
| 15/10 | 3 | 14,23 USDC | 16,76 USDC | 2,54 USDC |

**Attention au 15 août :** sur ses quatre cycles complets, **un contient un carnet âgé de 11,9 secondes**. Le PnL contrefactuel de cette ligne est publié comme **illustration brute**, **pas comme estimation admissible au seuil de 10 secondes**. Au seuil plus strict de 1 seconde, **un seul des quatre cycles** d'août garde deux carnets qualifiés. En septembre, **4/4 cycles** ont deux carnets ≤1 seconde ; octobre, **3/3**.

**Constat :** août et septembre sont perdants dans ces deux modèles ; **octobre est positif** pour ETH, contrairement à BTC dans les mêmes dates. Cela décrit **11 cycles ETH intra-journaliers**, pas trois mois de trading ou une performance probable future. Les PnL par date **ne doivent jamais être additionnés** comme un trimestre : capital réinitialisé, fenêtres disjointes et positions reportées exclues.

## 5. Sources, fichiers et contrôles reproductibles

- **Preuves consolidées avec dates, SHA-256 des archives L2, SHA des 300 OHLC, carnets, seuils, coûts et PnL illustratifs :** [`SEVEN_HEAVEN_ETH_USDC_EMA5_13_THREE_DAYS_PREOPEN_L2_AND_BTC_COMPARATIVE_PROOFS_2026_11_13.json`](./SEVEN_HEAVEN_ETH_USDC_EMA5_13_THREE_DAYS_PREOPEN_L2_AND_BTC_COMPARATIVE_PROOFS_2026_11_13.json) — blob Git `b72386bc3b8c83534655d976bbda17d12fc32161`.
- **Reproducteur Python ETH réutilisant les deux parseurs L2 déjà éprouvés :** [`SEVEN_HEAVEN_ETH_USDC_V5_EMA5_13_2026_08_09_10_COMPARATIVE_CAUSAL_L2_REPLAY.py`](./SEVEN_HEAVEN_ETH_USDC_V5_EMA5_13_2026_08_09_10_COMPARATIVE_CAUSAL_L2_REPLAY.py).
- **GitHub Actions — trois reconstructions ETH et contrôle du V5 JavaScript :** [run 43332184629 — SUCCESS](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/43332184629).
- **Preuves complètes par journée** : [15 août](./SEVEN_HEAVEN_ETH_USDC_V5_EMA5_13_2026_08_15_CAUSAL_L2_PROOFS.json), [15 septembre](./SEVEN_HEAVEN_ETH_USDC_V5_EMA5_13_2026_09_15_CAUSAL_L2_PROOFS.json), [15 octobre](./SEVEN_HEAVEN_ETH_USDC_V5_EMA5_13_2026_10_15_CAUSAL_L2_PROOFS.json). Chacun contient 300 bougies OHLC confirmées, toutes les opérations V5, l'âge des carnets, les empreintes d'archives et les limites.
- **Workflow versionné :** [`seven-heaven-eth-v5-ema15m-aug-sep-oct-preopen-l2-causal-replay.yml`](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/.github/workflows/seven-heaven-eth-v5-ema15m-aug-sep-oct-preopen-l2-causal-replay.yml).

Une première tentative du pipeline a échoué sur **une variable de date non définie dans le vérificateur JS**, après avoir produit les preuves. Ce défaut **de code du contrôle**, non de marché, a été corrigé ; la **nouvelle exécution de validation (run 43332184629) est entièrement SUCCESS**, sans masquer le premier échec. Le résultat retenu est celui vérifié après correction.

## 6. Ce que l'étude ne prouve PAS

1. L'accès réseau effectif au carnet juste avant T : le timestamp des événements L2 source et leur caractère pré-T **ne sont pas** une garantie de réception ou de possibilité de transaction à cet instant.
2. La continuité logique amont de tous les événements : intégrité SHA/CRC **n'implique pas** absence de trous dans l'enregistrement de marché.
3. Le slippage exécuté : l'ouverture OHLC est le prix d'une transaction et non le mid du carnet ; un ordre envoyé à T+latence verrait potentiellement un autre carnet.
4. Les frais réels historiques de ce compte sur ETH-USDC les 15 août/septembre/octobre. Les **0,10 % taker** ne sont attestés que sur les captures de novembre, comme tarif de référence PAPER de ce compte.
5. Une comparaison simultanée exacte BTC vs ETH : les dates sont alignées, pas les signaux. L'âge des quotes et les états de volatilité diffèrent.
6. Une robustesse de performance : **trois dates et 24 opérations ETH ne suffisent pas**, particulièrement avec une journée de neuf opérations dont seulement six carnets sont âgés d'au plus une seconde.

## 7. Décision documentée et prochaine étape utile

**Terminé :** étendre le protocole BTC à ETH sur les mêmes trois dates. **Ne pas recommencer les études BTC ou ETH de ces jours sans raison nouvelle.** Un nouveau taux de glissement n'est **pas** validé : les estimations de friction du carnet au mid ne sont pas directement le glissement V5 relativement à l'ouverture OHLC.

**Préserver :** moteur V5 avec **frais taker de référence 0,10 % par côté** et **glissement forfaitaire 0,05 % par côté**, V6 inchangé. Aucune modification de Trader, Administrator, Operator, Bridge ou ordre.

**Prochaine direction scientifique recommandée :** **préenregistrer de nouvelles dates ou de nouveaux régimes de marché avant d'étudier leurs PnL**, en privilégiant la couverture L2 pré-T et les seuils de fraîcheur des carnets. À défaut de couverture supplémentaire, faire une analyse de sensibilité PAPER explicite (0,02 %, 0,05 %, 0,10 % de glissement par côté) sans lui donner le statut d'un glissement « mesuré », et sans lancer de nouvelle stratégie réelle. La comparaison **strictement contemporaine** BTC vs ETH constitue une autre question, distincte de cet audit déclenché par les signaux EMA.

**Règle de passation :** consulter en premier `OKX MEMORY CORE → 01 Trading Fees` et `05 PAPER/Backtest V5`, puis ce rapport et ses preuves consolidées. Ne pas inventer un historique continu de trois mois ni redemander les frais déjà consignés.
