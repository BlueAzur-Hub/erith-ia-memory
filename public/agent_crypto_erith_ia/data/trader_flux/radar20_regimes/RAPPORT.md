# ERITH.IA — Radar 20 : diagnostic des pertes et des régimes de marché

**13 octobre 2026 · Étude historique exploratoire · Lecture seule · Aucun ordre réel**

## Sources et périmètre

- 120 archives mensuelles dérivées vérifiées SHA-256 dans le Coffre public : 20 cryptomonnaies × avril–septembre 2026 ; originaux Binance Spot USDT conservés dans les GitHub Releases.
- Deux journaux publiés : avril–juin (**109 transactions**, portefeuille initial **400 USDT**, résultat **−222,36 USDT**, recul maximal **57,17 %**) et juillet–septembre (**149 transactions**, 400 USDT réinitialisés, résultat **+97,75 USDT**, recul maximal **32,24 %**).
- **258 transactions**, dont **94 gagnantes** et **164 perdantes**. Ce sont **deux simulations distinctes**, pas un portefeuille de six mois ; ne pas additionner les soldes pour déduire une performance de capital unique.
- Règle non modifiée : pression acheteuse agressive >= 50 % de la valeur échangée sur l'heure achevée ; volume supérieur à la médiane des 24 heures précédentes ; achat fictif à l'ouverture de l'heure suivante ; vente après 48 heures ; ticket de 100 USDT, maximum quatre positions, coûts supposés de 0,8 % aller-retour.

## Marché connu avant l'entrée (72 heures)

La tendance n'est **pas** déduite de l'évolution suivant l'achat. Elle est classée par la variation médiane des cours des 20 actifs sur les 72 heures achevées avant le signal : hausse >= +3 %, baisse <= −3 %, sinon marché relativement stable.

| État du marché | Transactions | Gain/perte cumulé, USDT |
|---|---:|---:|
| Hausse | 60 | +16,77 |
| Stable | 142 | −130,76 |
| Baisse | 48 | −17,54 |
| Début de période (historique insuffisant) | 8 | +6,92 |

**Attention :** juillet–septembre et avril–juin divergent : en marché baissier antérieur, **−83,81 USDT sur 21 opérations** dans le premier trimestre étudié, mais **+66,27 USDT sur 27 opérations** dans le second. L'état « baisse » ne suffit donc pas à déterminer l'issue du signal.

## Volatilité, volume, pression acheteuse

La volatilité est mesurée par l'écart-type des rendements horaires d'un indice équipondéré des 20 actifs, sur les 24 dernières heures achevées. Elle est qualifiée d'élevée quand elle atteint au moins 1,5 fois la volatilité des 168 heures précédentes ; la première semaine environ reste non classée.

| Volatilité antérieure | Transactions | Gain/perte cumulé, USDT |
|---|---:|---:|
| Élevée | 25 | −11,42 |
| Ordinaire | 204 | −107,61 |
| Historique insuffisant | 29 | −5,58 |

| Achats agressifs lors du signal | Transactions | Gain/perte cumulé, USDT |
|---|---:|---:|
| 50 à moins de 55 % | 54 | −17,44 |
| 55 à moins de 60 % | 70 | +2,19 |
| Au moins 60 % | 134 | −109,36 |

| Volume de l'heure par rapport à la médiane précédente | Transactions | Gain/perte cumulé, USDT |
|---|---:|---:|
| Supérieur à 1×, inférieur à 1,5× | 136 | −37,12 |
| 1,5× à moins de 2× | 53 | −34,11 |
| Au moins 2× | 69 | −53,38 |

**Constat principal :** une forte pression acheteuse ou un volume nettement supérieur à la normale ne protège pas des pertes. Sur avril–juin, **62 transactions** à pression >= 60 % ont cumulé **−148,03 USDT** ; sur juillet–septembre, **72 transactions** de cette catégorie ont rapporté **+38,67 USDT**. La même observation de flux n'implique donc pas le même résultat selon la période.

## Où se concentrent les risques ?

- Les pires pertes par actif sur les deux journaux : BCH **−77,85 USDT** (22 opérations), ADA **−40,92 USDT** (5 opérations), APT **−23,14 USDT** (19 opérations). Ces chiffres par actif ne prouvent pas une inefficacité intrinsèque de ces marchés : le portefeuille choisit les marchés selon ses disponibilités de trésorerie et son classement des signaux.
- Le pire ordre fictif : **ADA, entrée du 3 juin 2026 à 13:00 UTC, −25,13 USDT**, malgré **63,28 % d'achats agressifs** durant l'heure du signal.
- Le moteur connaît de nombreux refus de candidats en raison des positions ouvertes ou du manque de liquidités. Il n'est donc pas possible d'attribuer la totalité du résultat à l'indicateur de pression acheteuse : la **sélection sous contrainte de capital** joue aussi un rôle.
- Un panier de référence occupant exactement les mêmes créneaux de transactions n'est pas une vraie exécution comparable sur OKX : il répartit théoriquement les tickets sur 20 cryptomonnaies, parfois sous les minimums d'ordre.

## Conclusions et limites

1. Le Radar 20 actuel est **non validé pour le réel**. Les pertes du trimestre avril–juin et l'ampleur des reculs empêchent toute certification de rentabilité durable.
2. Les diagnostics de tendance, volatilité, volume et pression sont **exploratoires**. Ils ont été analysés après connaissance des résultats ; les transformer en filtres serait un nouvel ajustement au passé qui exigerait un essai distinct sur des périodes non utilisées.
3. Les 20 actifs ont été sélectionnés après certaines dates étudiées (biais de sélection). Les coûts sont des hypothèses : ni glissement, ni écarts bid/ask OKX, ni minimums d'ordre, ni contraintes de liquidité réelles ne sont mesurés.
4. Les volumes de « taker buy » Binance indiquent quel côté initie un échange ; ils ne démontrent ni une entrée nette de capital, ni une hausse future certaine.
5. **Aucun changement de stratégie ni du Trader.** Avant tout nouveau modèle, il faut verrouiller par écrit ses règles, choisir une période réellement non utilisée et enregistrer un calcul de sensibilité aux conditions d'exécution sur OKX.

## Provenance et audit

L'analyseur refuse les fichiers dont le SHA-256 ne correspond pas à l'index source, vérifie 120 mois-actifs, la continuité des horodatages, la concordance entre journaux et soldes trimestriels, les signaux utilisant uniquement des bougies achevées, et l'absence d'ordre réel. La publication comprend un index SHA-256, un résumé machine lisible et les 258 transactions annotées.

Cette étude reste une **analyse descriptive**. Aucun prédicteur nouveau, signal opérationnel, optimisation ni ordre réel n'en découle.
