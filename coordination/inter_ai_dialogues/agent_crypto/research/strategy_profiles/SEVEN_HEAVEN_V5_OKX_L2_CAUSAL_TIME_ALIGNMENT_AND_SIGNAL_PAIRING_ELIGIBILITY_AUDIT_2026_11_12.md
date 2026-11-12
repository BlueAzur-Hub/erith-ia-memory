# Seven Heaven — V5 et OKX L2 : admissibilité temporelle d'une exécution PAPER sans anticipation

**Date :** 12 novembre 2026. **Nature :** audit de causalité et de couverture, réalisé sur les **preuves déjà archivées**, sans nouvel ordre ni modification de code. **Conclusion scientifique : grille d'horaires disponible, exécutions V5 strictement appariées NON démontrées.**

## 1. Point de départ et règle de mémoire

**À lire avant de recommencer un test :**

- [Notion canonique, `OKX MEMORY CORE → 01 Trading Fees` et `05 PAPER / Backtest V5`](https://app.notion.com/p/3e07754fe08481eb95c7cdc4fd8ff099).
- [Audit précédent V5/V6 : taux, méthode OHLC versus carnet, distributions de friction](./SEVEN_HEAVEN_OKX_V5_V6_SLIPPAGE_AND_ORDERBOOK_CALIBRATION_SCIENTIFIC_AUDIT_2026_11_12.md).
- [Rapport scientifique des six archives et de la persistance des spreads](./SEVEN_HEAVEN_OKX_BTC_ETH_AUGUST_SEPTEMBER_OCTOBER_ONE_MINUTE_EVENT_TIME_SPREAD_PERSISTENCE_SCIENTIFIC_AUDIT_2026_11_12.md).

La **première règle** est de **ne pas reconstituer une décision de trading à partir d'une observation de carnet qui n'était pas encore connue à l'instant supposé de décision ou de soumission de l'ordre**.

Dans le moteur V5 actuel, le signal EMA est calculé sur bougie clôturée, puis l'exécution fictive est représentée par l'**ouverture de la bougie contiguë suivante**, modifiée de ± un forfait de glissement. Son code ne demande pas de carnet réel à l'instant de cette ouverture.

## 2. Sources et audit exact, déjà publié sous forme machine

| Élément | Chemin ou référence | Empreinte Git blob |
|---|---|---|
| Relevés L2 à chacun des 96 quarts d'heure | `SEVEN_HEAVEN_OKX_L2_BTC_ETH_AUGUST_SEPTEMBER_OCTOBER_2026_96_QUARTER_HOUR_PAIRED_SPREADS_288_ROWS_2026_11_12.csv` | `1cd617b6229e23e6d1ef7b1b62d4ee6a691ab659` |
| Relevés de spreads à la minute | `SEVEN_HEAVEN_OKX_BTC_ETH_THREE_DAYS_PAIRED_MINUTE_SPREADS_4320_ROWS_2026_11_12.csv` | `0c06f32548ff6fa240a8b7040d8f9c0dc23da05c` |
| Coûts de profondeur à 96 quarts d'heure | `SEVEN_HEAVEN_OKX_L2_BTC_ETH_AUGUST_SEPTEMBER_OCTOBER_2026_96_QUARTER_HOUR_PAIRED_DEPTH_COSTS_2880_ROWS_2026_11_12.csv` | `4cc4d6e6cfda04da29a36ea23fb490ccd03e9238` |
| V5 historique (code sur main) | `public/agent_crypto_erith_ia/administrator/js/market-microscope-paper-backtest-v5.js` | `069162a40c4a65651ff1cd9ac98a837d64f41e9a` |

**Dates inchangées** : 15 août, 15 septembre, 15 octobre 2026. Paires : BTC-USDC et ETH-USDC. Les trois jours sont **isolés** ; ni trois mois complets ni une mesure prospective. Horodatages analysés dans la devise et le temps de la source OKX.

**Preuves JSON calculées en relisant les deux CSV de timestamps** : [`SEVEN_HEAVEN_V5_OKX_L2_CAUSAL_TIME_ALIGNMENT_AND_SIGNAL_PAIRING_PROOFS_2026_11_12.json`](./SEVEN_HEAVEN_V5_OKX_L2_CAUSAL_TIME_ALIGNMENT_AND_SIGNAL_PAIRING_PROOFS_2026_11_12.json). Le document contient les références de sources, les comptes par période, les délais et les cinq cas d'égalité à la milliseconde.

## 3. Résultat nouveau : les états publiés sont au début OU APRÈS les créneaux, jamais avant

La méthode initiale des fichiers L2 sélectionnait **le premier carnet reconstruit valide à ou après** une heure fixe du quart d'heure. Ceci est légitime pour les études de spread et de profondeur déjà publiées. Pour une comparaison **causale** à l'ouverture exacte d'une bougie, c'est une autre question.

Sur les **288 horaires du quart d'heure par actif** (576 états en comptant BTC et ETH) :

| Relation entre le timestamp du carnet et l'heure du créneau | États |
|---|---:|
| **Strictement après** le créneau, de +1 à +9 ms | **571 / 576** |
| **Horodatage identique à la milliseconde** | **5 / 576** |
| **Strictement avant** le créneau | **0 / 576** |

Tous les **288 créneaux** `date + HH:MM` sont uniques et présents. Les **cinq égalités à la milliseconde** ne démontrent **pas** qu'un événement de carnet a été publié, reçu et appliqué **avant** une opération prévue à la même milliseconde. Sans ordre des événements, traiter ces cas comme strictement antérieurs serait injustifié.

**Nuance indispensable :** un carnet de `T + 3 ms` n'est pas forcément impropre à un ordre **réellement envoyé à `T + 100 ms`**. Mais V5 ne définit actuellement pas ce délai de soumission et utilise l'**ouverture OHLC à T** comme prix fictif. Un carnet postérieur à T ne doit donc **pas** être présent dans un calcul censé représenter l'information disponible **à T**. Il faut d'abord fixer l'horodatage de décision, de soumission et le délai supposé d'exécution.

## 4. Couverture par granularité V5 : « horaire possible » ne signifie pas « ordre trouvé »

En supposant que les grilles des trois journées soient complètes, on obtient les **créneaux de bougies théoriquement alignables** ci-dessous. **Aucune transaction EMA réelle ou fictive individuelle n'a été identifiée par cette seule étape.**

| Granularité V5 | Ouvertures attendues par actif sur ces trois jours | Points avec métrique de profondeur historique à créneau identique | Répartition temporelle de ces points de profondeur, deux actifs |
|---|---:|---:|---|
| **5 minutes** | 864 | 288 (un créneau sur trois) | 571 après T ; 5 égalité ms ; 0 avant |
| **15 minutes** | 288 | 288 | 571 après T ; 5 égalité ms ; 0 avant |
| **4 heures** | 18 | 18 | **36 après T** ; 0 égalité ; 0 avant |

Le fichier minute ajoute une **mesure de spread** sur chaque ouverture de 5 minutes : **864 timestamps par actif**, soit **1 728** pour les deux paires. Parmi ces 1 728 relevés, **1 721 sont postérieurs à T**, **7 égaux à la milliseconde** et **0 antérieurs** ; les retards atteignent **16 182 ms**. **Ce fichier minute ne contient pas les niveaux de profondeur nécessaires pour calculer un VWAP d'exécution au sens V6**, et ne peut pas être substitué à une archive de carnets complète.

Pour les fenêtres de **4 heures**, les 36 points L2 disponibles correspondent à des créneaux `00:00 / 04:00 / 08:00 / 12:00 / 16:00 / 20:00 UTC` et surviennent tous strictement après T (+1 à +9 ms).

## 5. Pourquoi le véritable appariement des ordres V5 n'est pas encore réalisé

Le [Notion canonique](https://app.notion.com/p/3e07754fe08481eb95c7cdc4fd8ff099) décrit les recettes Firefox V5 des **6 novembre 2026** (299 bougies clôturées, EMA 5/13, 5m/15m/4h et nombres de signaux/trades), mais **n'enregistre pas dans les passages contrôlés les `entryAt` / `exitAt` individuels**. En revanche, le code V5 peut produire ces champs dans son objet `closedTrades` lorsque la simulation est lancée.

Il serait scientifiquement faux de dire que **0 ordre V5 est appariable**. La réalité est : **aucune liste horodatée de ces ordres n'a été jointe aux trois archives L2 pendant cet audit**, et les 576 relevés publiés se situent à T ou après T, alors que l'étude demande un carnet strictement antérieur au cutoff.

Trois couches de preuves manquent à un appariement complet :

1. **OHLC natif d'OKX + signaux V5 reproduits sur les MÊMES dates et la MÊME paire**, avec warm-up EMA, OHLC confirmées, `signal.index`, `nextBarOpen`, sens, taille fictive et réglages figés ; ne pas substituer les résultats des replays sur Bitstamp/USD.
2. **Dernier carnet L2 reconstruit avant le cutoff de soumission**, en distinguant la date de la bougie, le timestamp de chaque événement, l'éventuelle égalité ms, et l'âge maximal admissible ; ne pas employer automatiquement le **premier** carnet après l'ouverture.
3. **Référence d'exécution reproductible** : distinguer prix d'ouverture de bougie (premier trade), meilleur bid/ask, mid et VWAP du carnet ; le prix OHLC `next.open` ne porte pas en soi le timestamp précis du premier trade. Comparer des coûts avec des définitions identiques, éviter le double comptage spread/impact et préserver les hypothèses de latence.

**Aucun chiffre de performance EMA, de PnL validé ou de glissement réalisé ne résulte de cet audit.** L'absence de cet appariement ne remet **pas** en cause les coûts de carnet historiques ni leurs sources déjà vérifiées.

## 6. Protocole exécutable pour la phase réellement appariée — à ne pas considérer déjà exécuté

**Cible prioritaire : V5 EMA 5/13 sur BTC-USDC, bougies de 15 minutes, l'une des trois journées archivées**, puis ETH-USDC si les mêmes garanties existent. La période est choisie pour exploiter les archives existantes, **pas** pour sélectionner ex post des transactions rentables.

1. **Figer les données OHLC et les réglages** avant calcul des résultats : horodatages des bougies en UTC, confirmations, continuité, warm-up EMA, seuils d'exécution, frais **taker 0,10 %/côté** venant de `OKX MEMORY CORE`, glissement V5 **0,05 %/côté** comme **hypothèse**, non comme mesure.
2. **Calculer les signaux V5** avec le moteur ou une reproduction indépendante strictement comparée à ses `closedTrades`; publier le tableau `signalAt, nextBarOpen, side, notional, V5_open, V5_fill`. Si aucun signal dans les journées fixées, publier **zéro événement observé**, pas une comparaison fabriquée.
3. **Rejouer les archives L2 sources en flux**, en réutilisant les vérifications SHA/CRC et la logique de reconstruction déjà éprouvée. Pour chaque événement V5, extraire le dernier état de carnet **horodaté strictement avant le cutoff**, sans emprunter un événement futur. Qualifier les cas de timestamp identique comme **ordre non prouvé** sans résolution supplémentaire ; tester plusieurs seuils d'âge prédéclarés (100 ms, 1 000 ms, 10 000 ms) sans choisir le meilleur a posteriori.
4. **Prédéfinir la règle de comparaison** des prix : `V5_next_open` et `VWAP_book` ne sont pas des prix contemporains garantis. Fixer une hypothèse de latence / soumission ou prendre le premier trade timestampé ; compter séparément les cas où cette information manque et refuser une comparaison « causale » non justifiée.
5. **Publier la couverture avant les PnL** : nombre total de signaux et d'ouvertures, cas avec carnet pré-exécution et âge acceptable, exclusions, pertes d'information, différences de prix, frais hypothétiques, analyses de sensibilité et versions de sources. Ne pas étendre des observations à d'autres dates, devises ou paires.
6. **Faire un contrôle de seconde implémentation** indépendant, en conservant une preuve de concordance des timestamps et des calculs ; pas de test réseau privé, pas d'ordres ni de permission Trade.

Si la source OHLC ou la chronologie requise n'est pas disponible, arrêter au statut **`UNPAIRED / COVERAGE_INSUFFICIENT`** ; le projet doit privilégier une incertitude correctement publiée à un faux taux de réalisme.

## 7. Décision et arrêt

- **RÉSULTAT ACQUIS :** 571/576 carnets quart-horaires sont postérieurs à la grille ; 5 sont temporellement ex æquo à la milliseconde et non ordonnables ; **0** apporte une preuve de carnet strictement antérieur au créneau.
- **RÉSULTAT ACQUIS :** les grilles 5m, 15m et 4h ont été dénombrées, en séparant **coûts de profondeur** et **simples spreads minute**.
- **NON ACQUIS :** aucun appariement `closedTrades` V5 → carnet strictement antérieur → prix OHLC n'est démontré. Ni slippage réellement exécuté ni performance nouvelle n'est attestée.
- **DÉCISION :** ne pas modifier le défaut V5 de 0,05 %, conserver les frais Spot taker de 0,10 %, ne pas requalifier V6 en historique. **La prochaine opération utile est la reconstruction ciblée des états AVANT les ouvertures de bougie, à partir des archives déjà découvertes, en parallèle d'une preuve OHLC/V5 strictement même paire et même date.**
- **Règle de mémoire :** consigner ce résultat dans `OKX MEMORY CORE → 05 PAPER / Backtest V5` et dans la passation inter-IA GitHub déjà existante ; ne pas ouvrir une énième fiche Notion.

**Actions effectivement faites :** lecture du code V5 et des CSV publiés, comptage des décalages, preuve JSON et rapport. **Actions non faites :** rejeu complet des neuf millions d'événements pendant cette session, récupération OHLC natif pour ces dates, test Firefox, modification de l'Administrator/Trader/Bridge, ordre réel.


## Mise à jour documentaire du 13 novembre 2026 — ne pas refaire cette étape

Ce rapport décrivait **l'état de couverture des fichiers de snapshots à ou après T**, pas le résultat d'un rejeu ciblé pré-ouverture. **Depuis sa publication, la reconstruction ciblée des états strictement antérieurs à T et la validation des timestamps du V5 JavaScript ont été réalisées et vérifiées sur BTC-USDC les 15 août, 15 septembre et 15 octobre 2026.**

**Source de reprise actuelle :** [comparaison scientifique des trois journées BTC](./SEVEN_HEAVEN_BTC_USDC_EMA5_13_AUGUST_SEPTEMBER_OCTOBER_PREOPEN_L2_SCIENTIFIC_COMPARISON_2026_11_13.md) ; [preuves consolidées](./SEVEN_HEAVEN_BTC_USDC_EMA5_13_THREE_DAYS_PREOPEN_L2_EXECUTION_COMPARATIVE_PROOFS_2026_11_13.json).

Les anciens constats de 571/576 snapshots `T+ms` demeurent **corrects pour le CSV de snapshots**, mais ils ne constituent plus une impossibilité de construire des carnets `T−ms` en rejouant les archives L2. **25/25 opérations fictives BTC** ont désormais été appariées à un état L2 horodaté avant T. Les incertitudes de disponibilité réseau, de latence, de frais historiques, de continuité amont L2 et de remplissage réel restent ouvertes. Le **prochain** périmètre de recherche est ETH-USDC, **pas** le rejeu des mêmes dates BTC.
