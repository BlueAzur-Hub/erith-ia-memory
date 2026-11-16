# SEVEN HEAVEN · Strategy Lab — Portefeuille Donchian égal 5 actifs · Jan–Oct 2026

**Date UTC :** 2026-11-16  
**Statut :** expérience pré-enregistrée terminée  
**Période :** janvier → octobre 2026  
**Actifs :** BTC/USDT, ETH/USDT, BNB/USDT, XRP/USDT, SOL/USDT  
**Stratégie :** Donchian 55/20 4h identique sur chaque actif  
**Capital total :** 10 000 USDT · 5 poches indépendantes de 2 000 USDT  
**Mode :** PAPER only · zéro ordre réel · aucun transfert inter-actif · aucun rééquilibrage

## Résultat portefeuille

- capital final : **8 135,88 USDT**
- rendement : **-18,64 %**
- drawdown maximal combiné : **-26,50 %**
- frais totaux : **196,52 USDT**
- fills : **118**
- nombre moyen de poches simultanément exposées : **1,41 / 5**
- maximum simultanément exposé : **5 / 5**

## Poches individuelles

| Actif | Rendement | Drawdown | Fills | Frais |
|---|---:|---:|---:|---:|
| BTC | **-5,03 %** | -17,37 % | 22 | 41,74 USDT |
| ETH | **-17,91 %** | -22,42 % | 22 | 37,79 USDT |
| BNB | **-28,78 %** | -29,71 % | 30 | 49,91 USDT |
| XRP | **-30,19 %** | -36,40 % | 22 | 33,98 USDT |
| SOL | **-11,30 %** | -40,12 % | 22 | 33,10 USDT |

## Référence BTC seul

Le même Donchian 55/20 4h avec 10 000 USDT uniquement sur BTC donne :

- rendement : **-5,03 %**
- drawdown : **-17,37 %**
- fills : 22
- frais : 208,69 USDT

## Lecture

La diversification égale entre cinq actifs corrélés **dégrade ici le rendement et le drawdown par rapport à BTC seul** :

- portefeuille 5 actifs : -18,64 %, DD -26,50 %
- BTC seul : -5,03 %, DD -17,37 %

Le portefeuille réduit bien le drawdown par rapport aux pires poches individuelles XRP/SOL/BNB, mais il ne protège pas contre un régime où la même logique trend-following échoue simultanément sur tout le panier.

Le fait que seulement 1,41 poche sur 5 soit exposée en moyenne ne suffit pas à éviter cette fragilité. À certains moments, les cinq poches sont simultanément exposées.

## Conclusion scientifique

Cette expérience distingue deux notions souvent confondues :

1. **diversification des actifs** ;
2. **diversification des mécanismes de stratégie**.

Diversifier seulement les actifs peut laisser le portefeuille exposé au même défaut structurel : ici, le même Donchian 55/20 est sensible au régime 2026 sur les cinq marchés.

La prochaine piste logique n'est donc pas d'ajouter encore des cryptos.

Elle est de tester une **diversification de mécanismes** sur une même source et un même modèle d'exécution, afin d'éviter de mélanger des hypothèses incompatibles.

Exemple de futur protocole : trend-following Donchian + mean-reversion Bollinger + Cash, avec mêmes données certifiées 1h→4h, même next-bar-open, mêmes frais et glissement.

Avant de construire cette expérience, il faut vérifier qu'un portefeuille multi-stratégies équivalent n'existe pas déjà dans le Coffre.

**Diversifier les actifs n'est pas diversifier le risque de modèle.**
