# SEVEN HEAVEN · Strategy Lab — Protocole pré-enregistré de cartographie mensuelle 2024–2025

**Date :** 2026-11-16  
**Statut :** gelé avant lecture des résultats mensuels  
**Source :** Binance Spot BTC/USDT · 1h · 24/24 mois 2024–2025 certifiés  
**Base moteur :** V4.6.2 · PAPER ONLY

## 1. Question

Pourquoi les mêmes modèles se comportent-ils si différemment entre 2024 et 2025 ?

Avant toute nouvelle stratégie ou optimisation, le laboratoire doit mesurer la relation entre :

- direction du marché ;
- volatilité ;
- drawdown du BTC ;
- fréquence des transactions ;
- coûts ;
- résultat de chaque modèle.

## 2. Fenêtres

Étudier **23 mois actifs indépendants** :

- 2024-02 → 2024-12 ;
- 2025-01 → 2025-12.

Janvier 2024 n'est pas utilisé comme mois actif parce que le bloc certifié commence au 1er janvier 2024 et ne fournit pas les 30 jours de préchauffage requis.

Pour chaque mois actif :

- **720 bougies 1h précédentes** servent de préchauffage ;
- aucune transaction n'est autorisée pendant le préchauffage ;
- le capital PAPER est remis à 10 000 USDT au début du mois actif ;
- les indicateurs peuvent se réchauffer avec l'historique antérieur ;
- le mois suivant constitue une expérience indépendante.

Les rendements mensuels ne sont donc **pas cumulés** comme s'il s'agissait d'un portefeuille continu.

## 3. Stratégies gelées

Même premier passage que le protocole annuel :

1. EMA Cross 10/30 ;
2. Bollinger 20 / 2 sigma ;
3. DCA 50 USDT toutes les 1 440 minutes ;
4. Buy & Hold 50 % ;
5. Buy & Hold 100 % ;
6. CASH.

Hypothèses :

- frais 0,10 % par côté ;
- glissement 0,05 % par côté ;
- spot long-only ;
- levier 1 ;
- fill fictif à l'ouverture suivante ;
- aucun ordre réel.

## 4. Mesures de marché — descriptives uniquement

Pour chaque mois actif :

### Rendement BTC du mois
Première ouverture du mois → dernière clôture du mois.

### Volatilité réalisée
Écart-type des rendements logarithmiques horaires, annualisé par `sqrt(24 × 365)`.

Cette annualisation est descriptive. Elle ne constitue ni une prévision ni un risque futur garanti.

### Drawdown du marché
Drawdown maximal calculé sur la série des clôtures du mois.

Aucune de ces mesures n'est utilisée comme condition d'entrée des stratégies.

## 5. Mesures par stratégie

Pour chaque mois et chaque modèle :

- rendement PAPER net ;
- capital final ;
- drawdown maximal ;
- fills ;
- frais ;
- ordres refusés ;
- cash final ;
- inventaire BTC final.

## 6. Analyses transversales autorisées

Après calcul des 23 mois :

- corrélation de Pearson entre rendement BTC mensuel et rendement du modèle ;
- corrélation entre volatilité réalisée et rendement du modèle ;
- nombre de mois positifs ;
- nombre de mois où le modèle bat CASH ;
- nombre de mois où le modèle bat Hold 100 % ;
- rendement mensuel médian ;
- pire mois ;
- meilleur mois.

Ces statistiques restent descriptives.

## 7. Ce qui est interdit

Ne pas :

- modifier les paramètres après avoir vu les mois difficiles ;
- créer des seuils de « bull/bear/range » puis les présenter comme prédictifs ;
- choisir un filtre parce qu'il aurait réparé rétrospectivement un mois ;
- cumuler les 23 expériences indépendantes comme un capital réel ;
- utiliser les régimes comme signal de trading dans cette étude ;
- modifier V4.6.2.

## 8. But scientifique

L'étude doit répondre à des questions comme :

- EMA gagne-t-elle surtout quand le BTC monte fortement ?
- Bollinger souffre-t-elle surtout des coûts dans les mois volatils ?
- DCA est-il simplement corrélé à la direction du BTC ?
- quel modèle limite le mieux les pertes dans les mois baissiers ?
- la fréquence de transaction explique-t-elle une partie de la fragilité ?

**Observer d'abord. Expliquer ensuite. Optimiser seulement après.**
