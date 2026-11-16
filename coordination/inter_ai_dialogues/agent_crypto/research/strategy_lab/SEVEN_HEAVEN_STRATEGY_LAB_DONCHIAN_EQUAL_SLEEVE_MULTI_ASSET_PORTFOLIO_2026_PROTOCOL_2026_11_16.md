# SEVEN HEAVEN · Strategy Lab — Donchian 55/20 4h · portefeuille 5 actifs 2026

**Date :** 2026-11-16  
**Statut :** protocole gelé avant calcul du portefeuille  
**Période :** janvier → octobre 2026  
**Actifs :** BTC/USDT, ETH/USDT, BNB/USDT, XRP/USDT, SOL/USDT  
**Mode :** PAPER only

## Question

Une diversification égale entre cinq actifs réduit-elle le drawdown d'une même stratégie Donchian lorsque le régime 2026 est défavorable aux cinq actifs ?

## Capital

Capital total fictif : **10 000 USDT**.

Cinq poches indépendantes :
- BTC : 2 000 USDT
- ETH : 2 000
- BNB : 2 000
- XRP : 2 000
- SOL : 2 000

Aucun transfert de capital entre les poches.

Aucun rééquilibrage périodique.

Le cash non utilisé par un actif reste dans la poche de cet actif.

## Stratégie

Pour chaque poche :
- Donchian 55/20 ;
- timeframe 4h ;
- signal sur bougie clôturée ;
- fill PAPER à l'ouverture suivante ;
- frais 0,10 %/côté ;
- glissement 0,05 %/côté ;
- long-only ;
- aucun filtre ;
- aucune liquidation forcée en fin de période.

## Mesures

- capital final combiné ;
- rendement combiné ;
- drawdown maximal combiné sur clôtures 4h ;
- frais totaux ;
- fills totaux ;
- rendement et DD de chaque poche ;
- nombre moyen et maximal de poches simultanément exposées ;
- comparaison descriptive avec BTC Donchian seul et avec Cash.

## Interprétation

Le résultat du portefeuille ne doit pas être utilisé pour supprimer un actif après coup.

Si les cinq poches sont négatives, le portefeuille peut réduire l'amplitude des pertes mais la diversification ne crée pas mécaniquement un signal positif.

## Stop Gate

- aucun poids modifié après résultat ;
- aucun actif retiré ;
- aucun transfert dynamique ;
- aucun filtre de régime ;
- aucun tuning Donchian ;
- aucune intégration runtime.

**Diversifier le capital n'est pas diversifier le mécanisme de stratégie.**
