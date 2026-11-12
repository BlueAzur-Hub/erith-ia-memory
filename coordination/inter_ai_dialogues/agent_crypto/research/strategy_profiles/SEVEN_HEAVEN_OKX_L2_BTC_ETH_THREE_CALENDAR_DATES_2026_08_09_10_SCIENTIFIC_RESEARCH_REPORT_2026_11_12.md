# Seven Heaven — BTC/ETH OKX Spot USDC : trois dates historiques, six carnets L2 reconstitués

**Étude du 12 novembre 2026.** Les trois journées UTC ont été sélectionnées par la règle calendaire **15 août, 15 septembre et 15 octobre 2026**, figée avant lecture des archives d'août/septembre. La journée d'octobre servait déjà de référence. Recherche **PAPER**, aucune commande de marché, aucune donnée de compte.

## Conclusion principale

**Le spread du 15 octobre, extrêmement faible aux quatre instants examinés, n'est pas représentatif des deux autres journées archivées.** Les spreads observés aux mêmes quatre heures UTC sont sensiblement plus élevés en août et septembre pour **BTC-USDC comme ETH-USDC**. Le rapport relatif ETH/BTC, voisin de 3,4 le 15 octobre, varie fortement sur les nouvelles dates. La profondeur des carnets et le notionnel changent également le coût fictif d'achat ou de vente.

**Ce que nous avons démontré** : notre outil est techniquement capable de lire et de comparer six archives officielles entières, sur trois dates fixes et deux paires, sans saturer GitHub ; et les douze instants échantillonnés sur chaque actif révèlent des différences importantes. **Ce que nous n'avons pas démontré** : une distribution représentative de spreads, un modèle de frais exécutés, des régimes de marché confirmés, ou la rentabilité future des EMA.

## 1. Préenregistrement, calendrier et preuve d'exécution

[Protocole figé le 12 novembre avant récupération des nouvelles journées](./SEVEN_HEAVEN_OKX_BTC_ETH_L2_CALENDAR_MULTIDAY_2026_08_09_10_FROZEN_PROTOCOL_2026_11_12.md), commit `e24f9c5c6e8d583b5ca65255e98ea5db8710158f`.

- Dates fixes **2026-08-15, 2026-09-15**, plus référence **2026-10-15** ; aucune date remplacée.
- Paires `BTC-USDC` et `ETH-USDC`, **OKX Spot L2 400 niveaux**.
- Observations à **00 h, 06 h, 12 h, 18 h UTC**, premier carnet reconstitué à ou immédiatement après l'heure cible (décalages millisecondes).
- Notionnels fixes **10, 100, 1 000, 10 000 et 100 000 USDC**, achats et ventes fictifs séparément, **hors frais**.
- Pour les quatre archives nouvelles : vérification de leur existence dans l'API publique OKX pour **date, instrument et module exacts**, vérification du SHA-256 des octets complets `.tar.gz` et `.data`, gzip CRC et lecture en flux de toutes les lignes.
- [GitHub Actions : 4/4 nouveaux instruments/journées analysés, 0 archive manquante, SUCCESS](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/43264282755). Les preuves et contrôles sont publiés [dans le répertoire des journées calendaires](./okx_l2_calendar_multiday_2026_11_12_evidence/).

## 2. Volume réel des archives et intégrité

| Journée UTC | Actif | Octets compressés | Octets décompressés | Événements JSON |
|---|---|---:|---:|---:|
| 15 août 2026 | BTC | 5 874 484 | 57 596 807 | **301 816** |
| 15 août 2026 | ETH | 6 029 897 | 59 989 509 | **277 791** |
| 15 septembre 2026 | BTC | 62 266 870 | 491 977 909 | **1 811 678** |
| 15 septembre 2026 | ETH | 53 571 838 | 408 853 414 | **1 717 498** |
| 15 octobre 2026 | BTC | 56 920 312 | 457 277 836 | **2 346 486** |
| 15 octobre 2026 | ETH | 98 150 849 | 776 655 177 | **3 172 868** |
| **Total** | **6 archives** | — | — | **9 628 137** |

Les six archives contiennent **96 snapshots chacune** et leurs deltas ; les quatre nouveaux fichiers ont été vérifiés par leurs SHA-256 complets et la CRC gzip, et les deux d'octobre avaient déjà été vérifiés séparément.

SHA-256 des **archives comprimées complètes**, indispensables à toute reproduction :
- 15 août BTC : `a8af512dabf96c6e5c8af37a0e19eb11ebce88ed232308cba9a63a37053fc130`
- 15 août ETH : `9da303d949bce4f25248f7d3f6b7e34e2be6ed426b4945a395c3097d7932bfca`
- 15 septembre BTC : `53ab528063479e83dbd833be63615d09cee209897d39021403a88fd6f2d31460`
- 15 septembre ETH : `694464feb71a39dccff0188087079f3d200b50e51efc4a4120b454e4a9213924`
- 15 octobre BTC : `3b543b7333a6c71f4a8bf0ddf4e058fa84f61ad58092b3250784acc0964c7b44`
- 15 octobre ETH : `048d039eed1d6a18c166f022e8fe02359308445be682d1405df09b61fbc03546`

**Limite majeure et persistante :** les archives lues ne disposent pas de chaîne `seqId/prevSeqId` vérifiable pour les mises à jour, donc **SHA-256 et CRC ne prouvent pas qu'aucune mise à jour a été perdue par le fournisseur avant archivage**.

## 3. Les spreads changent selon les dates

**Un bp = 0,01 %.** Spread calculé au carnet à chaque instant : `(ask-bid)/mid×10 000`.

| Journée UTC | BTC-USDC, moyenne des 4 points | ETH-USDC, moyenne des 4 points |
|---|---:|---:|
| **15 août** | **0,317521 bp** | **1,316726 bp** |
| **15 septembre** | **0,326848 bp** | **0,840008 bp** |
| **15 octobre** | **0,012295 bp** | **0,041804 bp** |

**Deux faits importants :**
- Aux quatre observations du 15 octobre, le spread ETH/BTC était approximativement **3,37–3,43**. Sur les trois dates, **le rapport change fortement**, notamment quand BTC a un spread proche du pas de prix minimal.
- Aux douze horaires couplés de ces trois journées, ETH possède un spread relatif supérieur à celui de BTC. C'est une observation **de ces douze couples**, pas une caractéristique universelle de chaque seconde de marché.

Sur les **12 points d'observation par actif uniquement**, moyenne descriptive BTC **0,218888 bp**, ETH **0,732846 bp** ; médiane BTC **0,014435 bp**, ETH **0,506784 bp**. Cette différence entre moyenne et médiane indique que les valeurs très faibles et plus larges coexistent dans le petit échantillon ; **elle ne constitue pas une distribution probabiliste fiable**.

## 4. Coûts de marche de carnet : la taille et le côté comptent

La friction est l'écart du **prix moyen théorique du carnet depuis le mid**, en bp. L'achat dépense le montant USDC sur les asks ; la vente liquide une quantité `notionnel/mid` sur les bids. **Aucun frais de plateforme inclus**, aucune transaction exécutée, aucune latence ni impact réel mesuré.

### Valeurs à 100 000 USDC

Moyennes **des quatre horaires prédéfinis** du jour, par côté :

| Date | BTC achat | BTC vente | ETH achat | ETH vente |
|---|---:|---:|---:|---:|
| **15 août** | 0,859 bp | 1,085 bp | 3,834 bp | 3,699 bp |
| **15 septembre** | 2,922 bp | 3,299 bp | **8,426 bp** | **6,687 bp** |
| **15 octobre** | 1,159 bp | 0,815 bp | 3,842 bp | 3,480 bp |

En particulier, **l'achat fictif de 100 000 USDC d'ETH** sur les quatre relevés de septembre a produit un coût moyen de **8,426 bp**, comparé à **3,842 bp** en octobre et **3,834 bp** en août. Ce sont **des coûts de prix** sans frais taker ; selon la taille, un achat et une vente restent asymétriques.

### Valeurs à 1 000 USDC

Moyennes des quatre horaires, en bp :

| Date | BTC achat | BTC vente | ETH achat | ETH vente |
|---|---:|---:|---:|---:|
| 15 août | 0,159 | 0,159 | 0,686 | 0,709 |
| 15 septembre | 0,163 | 0,163 | 0,420 | 0,470 |
| 15 octobre | 0,011 | 0,011 | 0,257 | 0,204 |

**Un spread serré ne garantit pas** que l'ordre simulé d'un montant supérieur sera servi sur le seul meilleur niveau ; la profondeur au-delà du top-of-book modifie le VWAP.

## 5. Ce que couvre vraiment l'échantillon

Nous avons six fichiers source complets et **24 instantanés de carnet** au total (**12 par actif**) et **240 estimations de côté** (**3 jours × 2 actifs × 4 heures × 5 montants × achat/vente**). Les six fichiers entiers ont servi à **reconstruire les carnets** ; cela ne signifie pas que chaque seconde a été retenue pour les statistiques.

Le 15 août, les deux archives comptent nettement moins d'événements que les 15 septembre/octobre. Nous ne pouvons pas déterminer à partir de ces seuls compteurs **pourquoi** : activité de marché, calendrier, politique d'archivage, conditions de liquidité ou autres facteurs. Les trois dates ont été choisies par la règle calendaire, **pas classées a priori comme marchés haussiers, latéraux ou baissiers**.

**Cette étude n'est pas un out-of-sample temporel prospectif :** les journées précèdent le 12 novembre. La sélection a été enregistrée avant leur récupération, limitant le choix opportuniste des dates, mais ne remplace pas une future validation non observée. La validation EMA prospective séparée reste inchangée.

## 6. Pourquoi ne pas conclure à une stratégie rentable

- Données **OKX Spot BTC-USDC/ETH-USDC**, distinctes des historiques **Bitstamp BTC/USD et ETH/USD** utilisés pour les EMA historiques.
- Carnet visible **non exécutable garanti** ; coûts de prix théoriques sans frais de compte, latence, cancel/partial fills, financement, fiscalité ni frais du compte EEE.
- **Absence de numéros de séquence**, même quand les fichiers gzip et leurs empreintes sont intègres.
- **12 observations par actif sur trois journées** : insuffisant pour une distribution horaire robuste, une loi de marché ou une analyse de queues de liquidité.
- Aucun paramètre EMA10/30 recalibré, et aucun des 122 trades PAPER historiques revalorisé arbitrairement à partir de ces données.

## 7. Preuves et reproductibilité

- [**Protocole calendaire prépublié**](./SEVEN_HEAVEN_OKX_BTC_ETH_L2_CALENDAR_MULTIDAY_2026_08_09_10_FROZEN_PROTOCOL_2026_11_12.md).
- [**Programme Python streaming multi-date instrumenté**](./SEVEN_HEAVEN_OKX_L2_MULTIDAY_SPOT_USDC_STREAMING_FOUR_ANCHORS_2026_11_12.py).
- [**4 nouvelles archives : preuves JSON, SHA-256, 160 simulations et indice de disponibilité**](./okx_l2_calendar_multiday_2026_11_12_evidence/), [GitHub Actions 4/4 SUCCESS](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/43264282755).
- [**Preuve comparative JSON : 6 archives, toutes les sources Git blob épinglées, agrégats sur 3 dates et 12 spreads appariés**](./SEVEN_HEAVEN_OKX_L2_BTC_ETH_CALENDAR_THREE_DATES_2026_08_09_10_RESEARCH_PROOFS_2026_11_12.json).
- [**Tableau CSV des 24 observations de spread**](./SEVEN_HEAVEN_OKX_L2_BTC_ETH_CALENDAR_THREE_DATES_2026_08_09_10_SPREADS_24_ANCHORS_2026_11_12.csv).
- [**Tableau CSV des 240 coûts théoriques de carnet par côté**](./SEVEN_HEAVEN_OKX_L2_BTC_ETH_CALENDAR_THREE_DATES_2026_08_09_10_BOOK_COSTS_240_SIDES_2026_11_12.csv).
- [**Preuves BTC et ETH du 15 octobre, utilisées sans les modifier**](./SEVEN_HEAVEN_OKX_L2_BTC_ETH_USDC_SAME_DAY_FOUR_ANCHORS_SCIENTIFIC_COMPARISON_2026_11_12.md).

## 8. Étape scientifique suivante

Pour comprendre **les distributions des spreads**, il ne suffit pas d'ajouter des journées avec **quatre** horaires. La suite exige une grille temporelle plus dense, fixée à l'avance, par exemple les **96 snapshots réguliers de 15 minutes** que ces archives paraissent contenir. Mais il faudra contrôler leurs timestamps réels et les valeurs reconstruites, sans supposer automatiquement que chaque snapshot tombe exactement à son horaire théorique.

La première étude raisonnable serait de **densifier une seule journée déjà archivée**, avec une méthode et des critères de qualité gelés, avant de déployer une analyse haute fréquence sur plusieurs mois. Ne pas confondre cette direction avec un déploiement d'ordres ou une nouvelle stratégie EMA.

**Aucun ordre réel, aucune surveillance récurrente, aucun changement Administrator/Operator/Trader/Bridge.**