# SEVEN HEAVEN · Strategy Lab — Donchian 55/20 4h · Validation segmentée 2019–2021

**Date UTC :** 2026-11-16  
**Statut :** contre-épreuve pré-enregistrée exécutée  
**Source :** Binance Spot BTC/USDT · uniquement blocs de mois strictement certifiés  
**Stratégie :** Donchian 55/20 4h inchangé  
**Mode :** PAPER only

## Résultats

Chaque bloc repart de 10 000 USDT et zéro BTC. Aucun capital ni position n'est reporté entre blocs.

| Bloc | Période | Bougies 4h | Fills | Zéro friction | Coûts base | Coûts ×2 | DD base |
|---|---|---:|---:|---:|---:|---:|---:|
| A | 2019-01 → 2019-02 | 354 | 2 | +3,00 % | **+2,69 %** | +2,38 % | −9,52 % |
| B | 2019-09 → 2019-10 | 366 | 3 | −0,29 % | **−0,74 %** | −1,18 % | −6,62 % |
| C | 2020-07 → 2020-10 | 738 | 7 | +43,80 % | **+42,30 %** | +40,81 % | −12,63 % |
| D | 2021-05 → 2021-07 | 552 | 5 | +6,75 % | **+5,95 %** | +5,16 % | −17,36 % |
| E | 2021-10 → 2021-11 | 366 | 6 | −5,92 % | **−6,77 %** | −7,60 % | −20,71 % |

## Lecture

Le résultat récent 2024–2025 n'est pas reproduit uniformément sur le passé.

Sur cinq blocs anciens choisis avant lecture :

- **3 blocs positifs** ;
- **2 blocs négatifs**.

Cela exclut l'interprétation « Donchian gagne partout ».

### Frictions

Les écarts entre zéro-friction, coûts de base et coûts ×2 restent modestes.

Le signe de chaque bloc ne change pas sous stress de coûts ×2.

Conclusion :

> le facteur principal n'est pas la friction ; c'est le comportement du marché pendant le bloc.

### Fréquence

Donchian 4h reste extrêmement peu actif :

- 2 à 7 fills sur ces blocs de 2 à 4 mois.

Cette faible fréquence explique sa résistance aux frais, mais réduit aussi l'échantillon statistique : quelques trades peuvent peser fortement sur le résultat.

## Ensemble des fenêtres étudiées jusqu'ici

Donchian 55/20 4h :

- 2019 Jan–Fév : +2,69 %
- 2019 Sep–Oct : −0,74 %
- 2020 Jul–Oct : +42,30 %
- 2021 Mai–Juil : +5,95 %
- 2021 Oct–Nov : −6,77 %
- 2024 : +71,39 %
- 2025 : +8,12 %

Soit **5 fenêtres positives sur 7**, avec des durées différentes et des capitaux indépendants.

Ce ratio n'est pas un taux de réussite de trades et ne doit pas être utilisé comme probabilité future.

## Décision scientifique

Donchian 55/20 4h mérite de rester **candidat de recherche prioritaire**, mais pas d'être intégré comme stratégie validée.

Avant tout tuning :

1. caractériser les régimes des fenêtres positives et négatives ;
2. vérifier si une distinction de régime peut être définie sans utiliser le futur ;
3. seulement ensuite décider si un filtre de régime constitue une hypothèse testable ;
4. conserver les blocs négatifs dans toutes les comparaisons.

Aucun paramètre 55/20 n'est modifié.

**Résultat : candidat intéressant, sensibilité au régime confirmée, robustesse universelle non démontrée.**
