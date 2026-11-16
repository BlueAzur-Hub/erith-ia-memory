# SEVEN HEAVEN · Strategy Lab — Donchian 55/20 4h · Validation historique segmentée 2019–2021

**Date :** 2026-11-16  
**Statut :** protocole gelé avant lecture des résultats de ces blocs  
**Stratégie :** Donchian 55/20 4h inchangé  
**Source :** Binance Spot BTC/USDT 1h, mois strictement certifiés puis agrégés en 4h  
**Mode :** PAPER only

## 1. But

Le Donchian 55/20 4h a produit un résultat positif sur 2024 et 2025, mais ces marchés étaient déjà connus au moment de son exécution.

Avant toute optimisation ou intégration, cette étude cherche une **contre-épreuve historique** sur des périodes plus anciennes dont les performances Donchian n'ont pas encore été calculées dans le Strategy Lab.

Il ne s'agit pas d'un holdout académique aveugle : l'histoire publique de Bitcoin est connue. Il s'agit d'une validation procédurale sur des données non encore utilisées par ce test.

## 2. Règle verrouillée

Aucun paramètre ne change :

- entrée : clôture > plus haut des 55 bougies précédentes ;
- sortie : clôture < plus bas des 20 bougies précédentes ;
- timeframe : 4h ;
- capital : 10 000 USDT par bloc ;
- frais : 0,10 % / côté ;
- glissement : 0,05 % / côté ;
- next-bar-open ;
- spot long-only ;
- aucune liquidation forcée de fin ;
- aucun filtre de régime.

## 3. Blocs choisis avant résultats

Seuls des blocs de **plusieurs mois consécutifs** entièrement certifiés sont retenus.

### Bloc A
**2019-01 → 2019-02**

### Bloc B
**2019-09 → 2019-10**

### Bloc C
**2020-07 → 2020-10**

### Bloc D
**2021-05 → 2021-07**

### Bloc E
**2021-10 → 2021-11**

Les mois rejetés par la gate ne sont jamais franchis artificiellement.

## 4. Indépendance des blocs

Chaque bloc :

- commence avec 10 000 USDT ;
- zéro BTC ;
- indicateurs initialisés uniquement avec ses propres bougies ;
- aucune position reportée depuis le bloc précédent ;
- aucun rendement cumulé artificiellement entre blocs.

## 5. Agrégation

Les bougies 1h certifiées sont agrégées en 4h avec le module existant du Lab.

Le bloc est refusé si :

- les mois ne sont pas contigus ;
- une bougie 1h manque ;
- l'alignement 4h échoue ;
- une période 4h est incomplète.

## 6. Diagnostics

Pour chaque bloc :

- zéro friction ;
- coûts de base ;
- coûts ×2 ;
- rendement ;
- drawdown ;
- fills ;
- frais ;
- inventaire final.

## 7. Critère d'interprétation

La question n'est pas « combien gagne Donchian ? ».

La question est :

> le comportement positif 2024–2025 apparaît-il aussi sur plusieurs périodes anciennes indépendantes, avec une fréquence faible et une résistance raisonnable aux coûts ?

Résultats possibles :

- positif partout : signal intéressant mais encore non prédictif ;
- positif sur certains blocs : sensibilité au régime ;
- négatif sur la majorité : résultat récent probablement spécifique ;
- zéro trade : exposition absente, pas une victoire.

## 8. Stop Gate

Après lecture :

- ne pas retirer un bloc défavorable ;
- ne pas changer 55/20 ;
- ne pas modifier le timeframe ;
- ne pas ajouter un filtre et présenter le résultat comme la même validation ;
- ne pas combler les mois manquants ;
- ne pas cumuler les cinq capitaux comme un seul portefeuille.

**Cinq blocs choisis avant résultat. Même règle. Même coût. Aucune seconde chance rétroactive.**
