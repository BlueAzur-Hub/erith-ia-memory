# SEVEN HEAVEN · Strategy Lab — SuperTrend 20/4 · Preregistration 1h + 4h

**Date :** 2026-11-16  
**Statut :** protocole gelé avant résultats SuperTrend  
**Périmètre :** recherche isolée, aucune intégration V4.6.2  
**Source :** Binance Spot BTC/USDT certifié 2024–2025  
**Mode :** PAPER only, long-only, next-bar-open

## 1. Origine de l'hypothèse

Le plan de recherche antérieur avait identifié une configuration SuperTrend **20 / 4** dans les stratégies externes étudiées.

Cette première implémentation n'essaie pas de reproduire toutes les conditions externes. Elle isole le cœur directionnel SuperTrend afin de mesurer son comportement propre.

## 2. Paramètres gelés

- période ATR : **20**
- multiplicateur : **4**
- ATR : lissage de Wilder
- capital : 10 000 USDT
- frais : 0,10 % par côté
- glissement : 0,05 % par côté
- spot long-only
- levier : 1
- aucun RSI
- aucun volume
- aucun filtre de distance
- aucun stop supplémentaire
- aucune liquidation forcée de fin

Deux horizons sont déclarés avant résultats :

- **1h**
- **4h**, agrégé causalement depuis la même source 1h certifiée.

Les deux sont des expériences prévues, pas une sélection après observation.

## 3. Construction directionnelle

Pour chaque bougie clôturée :

1. calcul du True Range ;
2. calcul ATR 20 par lissage Wilder ;
3. bandes de base : HL2 ± 4 × ATR ;
4. bandes finales persistantes selon le prix clôturé précédent ;
5. tendance conservée jusqu'à cassure de la bande opposée.

## 4. Règles PAPER

Entrée :
- tendance précédente baissière ;
- nouvelle tendance haussière sur la dernière bougie clôturée ;
- BUY fictif à l'ouverture suivante.

Sortie :
- tendance précédente haussière ;
- nouvelle tendance baissière sur la dernière bougie clôturée ;
- SELL fictif à l'ouverture suivante.

Aucun achat simplement parce que l'état initial est haussier : la stratégie attend un **vrai basculement observé** après initialisation.

## 5. Causalité

La décision à l'ouverture T ne peut utiliser que les bougies entièrement closes avant T.

La bougie d'exécution n'apporte ni high, ni low, ni close au signal.

## 6. Fenêtres

Pour les deux timeframes :

- 2024 : research replay ;
- 2025 : known-market validation.

Ces marchés sont déjà connus ; aucun holdout untouched n'est revendiqué.

## 7. Scénarios de coût

Chaque horizon est évalué avec :

1. zéro friction ;
2. coûts de base ;
3. coûts ×2.

## 8. Mesures

- rendement ;
- drawdown max ;
- fills ;
- frais ;
- cash final ;
- inventaire BTC ;
- différence 1h / 4h ;
- stabilité 2024 / 2025.

## 9. Stop Gate

Après résultat :

- ne pas modifier 20/4 et garder le même nom d'expérience ;
- ne pas ajouter le filtre « distance < 1 % » rétroactivement ;
- si ce filtre est étudié, il devient une nouvelle expérience ;
- aucune intégration runtime automatique.

**SuperTrend 20/4 : d'abord le signal directionnel nu, ensuite seulement les filtres éventuels.**
