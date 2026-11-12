# Seven Heaven — BTC-USDC EMA 5/13 : comparaison des carnets antérieurs aux ouvertures du 15 août, 15 septembre et 15 octobre 2026

**Date du rapport : 13 novembre 2026.** **Nature :** analyse scientifique documentaire, basée sur **trois dates UTC isolées**, sans exécution d'ordre, accès à un compte privé, ni modification des moteurs V5/V6, du Trader, de l'Administrator ou du Bridge.

## Résultat principal

La reproduction de la méthode du 15 octobre sur les **15 août et 15 septembre** a réussi. Les deux nouvelles journées ont été vérifiées par **le véritable moteur V5 JavaScript** et les carnets historiques **strictement antérieurs** aux ouvertures fictives, avec les paramètres déjà fixés.

**Preuves GitHub Actions :** [août + septembre — exécution SUCCESS, deux jobs](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/43330003604) ; [octobre — exécution SUCCESS](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/43327600503).

<details>
<summary>Contrat expérimental inchangé</summary>

- Exchange **OKX Spot**, paire **BTC-USDC**, bougies **15 minutes**, **300 bougies clôturées contiguës par étude** (chauffe EMA comprise), **EMA 5/13**, entrées/sorties *long-only* au prochain `open` selon les règles V5 ;
- **Capital initial fictif 1 000 USDC** pour les comparatifs journaliers explicitement réinitialisés ; **référence fixe 1 000 USDC de profondeur** du carnet pour chaque côté ;
- Frais hypothétiques Spot **taker 0,10 % par côté**, déjà relevés sur le compte dans le Notion canonique les **6, 9 et 12 novembre 2026** ; le montant de ces frais au 15 août, septembre ou octobre n'est **pas** prouvé ;
- V5 : **0,05 % de glissement forfaitaire** par côté (= 5 points de base) ;
- Carnet source : dernière reconstruction dont le timestamp L2 vérifié est **strictement inférieur** à l'heure de la prochaine ouverture ; aucun carnet sélectionné après T pour estimer une exécution à T ;
- Archives L2 épinglées par SHA-256, contrôles CRC et comparaisons avec les relevés précédemment publiés ;
- Aucune optimisation des paramètres a posteriori. Les trois dates ne sont ni trois mois entiers ni un test prospectif.

</details>

## 1. Contrôles des trois journées

Les chiffres « appariées » sont des **opérations fictives** (achats et ventes), pas des transactions du compte OKX.

| Journée (UTC) | Événements L2 relus | Opérations V5 appariées avant T | Carnet âgé ≤ 1 seconde | Coût carnet moyen par côté, depuis mid | Écart absolu moyen entre VWAP et `next.open` |
|---|---:|---:|---:|---:|---:|
| 15/08 | 301 816 | 11 | 9/11 | 0,127 bp | 0,810 bp |
| 15/09 | 1 811 678 | 2 | 2/2 | 0,627 bp | 3,018 bp |
| 15/10 | 2 346 486 | 12 | 12/12 | 0,126 bp | 0,726 bp |
| **TOTAL / pondéré par opération** | **4 459 980** | **25/25** | **23/25** | **0,166 bp** | **0,946 bp** |

**Provenance :** trois fichiers complets de 300 OHLC natifs OKX/USDC, soit **900 bougies dans trois fenêtres distinctes**. Les signaux EMA totalisent **66 croisements** sur ces trois fenêtres (avec chevauchements de préchauffe possibles), dont **25** opérations théoriques dans les trois journées étudiées. Ne **pas** interpréter 66 croisements comme 66 trades sur les trois dates.

Les **25/25** opérations sont appariées à un carnet antérieur selon **les timestamps source**. L'âge des carnets va de **1 à 2058 ms**, médiane **81 ms** ; **14/25** ont au plus 100 ms, **23/25** au plus 1 seconde. Les deux états âgés de plus d'une seconde concernent le **15 août**. Aucun contrôle de disponibilité effective réseau avant T n'est possible à partir du seul timestamp de l'archive.

### Trois notions de « glissement » à ne pas confondre

1. **Coût du carnet depuis le mid** (calculé à partir du VWAP fictif) : demi-spread **déjà inclus** + impact supplémentaire de profondeur. Moyenne **0,166301 bp**, maximum **1,144010 bp** sur les 25 opérations, hors frais. **0/25** coûts de carnet supérieurs à **5 bp**.
2. **Écart entre VWAP de carnet strictement pré-T et prix OHLC `next.open` à T** : moyenne de la valeur absolue **0,946189 bp**, maximum **5,149755 bp** ; cet écart peut être favorable ou défavorable et mêle prix de transaction, heure et microstructure.
3. **Glissement forfaitaire V5** : **5 bp par côté** appliqués à l'ouverture OHLC suivante, puis frais séparés. C'est un paramètre **hypothétique**, **pas** une mesure effectuée sur un carnet.

**Exception utile :** au **15 septembre, vente à 18:45 UTC**, l'écart **défavorable** du VWAP pré-ouverture au prix `next.open` vaut **+5,149755 bp**, légèrement au-dessus des **5 bp** du forfait V5. Le coût propre au carnet depuis son mid reste pourtant bien inférieur à 5 bp. C'est la preuve qu'un petit spread et un faible impact de profondeur ne suffisent pas à expliquer la relation entre un carnet antérieur et la transaction d'ouverture suivante.

## 2. Simulation de six, cinq ou un allers-retours — comparaison pédagogique uniquement

**Convention spéciale indispensable :** nous redémarrons fictivement avec **1 000 USDC au premier achat complet de la journée** pour comparer les mêmes cycles. Le **15 août débute par une VENTE d'une position ouverte la veille** ; elle est validée comme appariement, mais **exclue** du calcul des cycles journaliers réinitialisés. Les statistiques de toute la journée (25 opérations) la conservent. Ce ne sont pas les PnL natifs d'un V5 exécuté en continu sur les 300 bougies.

Les frais hypothétiques sont identiques dans les deux colonnes : **0,10 % taker à l'achat et 0,10 % à la vente**. Les prix sont calculés d'après :
- **V5 fixe :** `next.open × (1 + 0,0005)` à l'achat ; `next.open × (1 - 0,0005)` à la vente.
- **Carnet pré-T :** VWAP théorique du dernier carnet antérieur, en consommant un **notionnel de référence fixé à 1 000 USDC à chaque côté**, même si le capital de la simulation évolue. Aucune latence ni remplissage réel.

| Date | Cycles complets dans la journée | PnL PAPER V5 forfait | PnL PAPER VWAP pré-T | Différence théorique favorable au carnet |
|---|---:|---:|---:|---:|
| 15/08 | 5 | -16,535 USDC | -12,128 USDC | 4,407 USDC |
| 15/09 | 1 | -15,663 USDC | -15,098 USDC | 0,565 USDC |
| 15/10 | 6 | -23,514 USDC | -17,633 USDC | 5,881 USDC |

**Les trois journées testées sont perdantes dans les deux scénarios.** Cela ne démontre pas qu'EMA 5/13 est toujours déficitaire : les journées sont très limitées, les régimes diffèrent, septembre comporte **un seul cycle complet**, et le capital est réinitialisé par date.

Il serait faux d'additionner les PnL des trois lignes pour annoncer une performance trimestrielle : **aucune continuité de portefeuille entre ces journées n'a été modélisée**.

## 3. Sources verrouillées et reproduction

**Preuves numériques agrégées, avec les calculs, références SHA, conventions et limites :** [`SEVEN_HEAVEN_BTC_USDC_EMA5_13_THREE_DAYS_PREOPEN_L2_EXECUTION_COMPARATIVE_PROOFS_2026_11_13.json`](./SEVEN_HEAVEN_BTC_USDC_EMA5_13_THREE_DAYS_PREOPEN_L2_EXECUTION_COMPARATIVE_PROOFS_2026_11_13.json).

| Journée | Relevé complet natif (300 OHLC et opérations) | Blob Git SHA-1 | Archive OKX L2 SHA-256 |
|---|---|---|---|
| 2026-08-15 | [Preuve JSON](./SEVEN_HEAVEN_BTC_USDC_V5_EMA5_13_2026_08_15_CAUSAL_L2_PROOFS.json) | `4eb46ec1352a6487ebcb285de4fe3215ee24cb4b` | `a8af512dabf96c6e5c8af37a0e19eb11ebce88ed232308cba9a63a37053fc130` |
| 2026-09-15 | [Preuve JSON](./SEVEN_HEAVEN_BTC_USDC_V5_EMA5_13_2026_09_15_CAUSAL_L2_PROOFS.json) | `c2551986f5e7f1ca01da9e00f5753af54598c9d4` | `53ab528063479e83dbd833be63615d09cee209897d39021403a88fd6f2d31460` |
| 2026-10-15 | [Preuve JSON](./SEVEN_HEAVEN_BTC_USDC_V5_EMA5_13_2026_10_15_CAUSAL_L2_PROOFS.json) | `a103f3a65e9cf5fbe2e22b93d27f51286d37cb0f` | `3b543b7333a6c71f4a8bf0ddf4e058fa84f61ad58092b3250784acc0964c7b44` |

**Programmes :** [script historique d'octobre](./SEVEN_HEAVEN_BTC_USDC_V5_EMA5_13_2026_10_15_CAUSAL_L2_REPLAY.py) ; [extension août-septembre, réutilisant le moteur d'archives déjà validé](./SEVEN_HEAVEN_BTC_USDC_V5_EMA5_13_2026_08_09_COMPARATIVE_CAUSAL_L2_REPLAY.py) ; [workflow deux journées et double validation V5 JS](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/.github/workflows/seven-heaven-btc-v5-ema15m-aug-sep-preopen-l2-causal-replay.yml).

**Contrôles exécutés dans GitHub Actions :** syntaxe et tests synthétiques, réception de 300 bougies consécutives confirmées et conservation SHA-256, streaming complet des archives L2, empreinte SHA-256 compressée/interne et CRC, **96/96** ancres d'août et septembre comparées aux anciennes preuves (octobre : 4/4), cohérence des **timestamps du vrai V5 JavaScript** et obligation `last_l2_timestamp < next_open_timestamp`. Les preuves sont publiées dans le répertoire inter-IA.

## 4. Limites qui ne doivent jamais disparaître des transmissions

- La chaîne `seqId/prevSeqId` du flux amont n'est **pas vérifiable** pour l'ensemble des archives : SHA/CRC valident les fichiers reçus, pas la complétude parfaite du marché.
- Les horodatages L2 ne démontrent pas à eux seuls que le carnet était **reçu et exploitable** à T par un programme connecté. Le marché peut changer avant le remplissage réel à T+latence.
- Le VWAP d'un carnet figé est une **estimation**, pas la preuve que le volume serait réellement exécuté à ce prix.
- L'ouverture OHLC représente un **prix de transaction** et n'est ni un mid ni un meilleur ask/bid synchronisé.
- Le montant de profondeur **reste fixé à 1 000 USDC** par opération, alors que le capital réinvesti varie. Cette approximation limite la fidélité de la comparaison contrefactuelle.
- L'affichage des frais personnels Spot à 0,10 % taker date des **6, 9 et 12 novembre** ; leur exactitude historique pour chaque paire et chaque date d'août/septembre/octobre n'est **pas établie**.
- Trois dates isolées sélectionnées pour disponibilité des données historiques et un total de **25** opérations ne suffisent ni à prouver la stabilité d'un paramètre, ni à garantir un profit.
- Aucun ordre ni accès à un compte ; aucune modification de l'Administrator, du Trader, de l'Operator ou du Bridge.

## 5. Décision scientifique : ne pas « optimiser » V5 sur trois journées

**Résultat acquis :** le protocole de causalité strictement pré-ouverture a été étendu et vérifié sur **les trois journées de données BTC-USDC**, avec **25/25 événements appariés** et la reproduction des dates de V5 JavaScript. Le décalage entre coût du carnet et ouverture OHLC est désormais observable, sans le confondre avec le glissement réel.

**Décision de configuration :** **ne pas changer** V5 : **taker 0,10 %/côté, glissement forfaitaire 0,05 %/côté** comme hypothèses PAPER actuelles. **Ne pas réduire le glissement à 0,166 bp** : le mid→VWAP moyen de trois jours n'est pas un proxy fiable pour l'ouverture OHLC et la latence d'une transaction réelle.

**Prochaine direction scientifique unique :** étendre le **protocole figé à ETH-USDC** sur les mêmes dates lorsque l'OHLC natif et les archives L2 déjà indexées le permettent, avec vérification indépendante des timestamps V5 et du carnet strictement pré-T. Si l'on souhaite tester BTC sur davantage d'épisodes, préenregistrer les dates ou les régimes **avant** de regarder les profits, et conserver des journées non conformes plutôt que les éliminer.

**Consigne mémoire :** cette étude est TERMINÉE pour BTC sur les 15 août, 15 septembre et 15 octobre 2026. Lire ce rapport, le JSON et le Notion canonique avant de recommencer ; éviter toute fiche Notion dupliquée.
