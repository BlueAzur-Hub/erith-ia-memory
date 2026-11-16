# SEVEN HEAVEN · Strategy Lab — Donchian 55/20 4h · Replay BTC 2026

**Date :** 2026-11-16  
**Statut :** protocole gelé avant lecture du résultat Donchian 2026  
**Stratégie :** Donchian 55/20 4h inchangé  
**Source :** Binance Spot BTC/USDT 1h · janvier à octobre 2026  
**Data Gate déjà établi :** 10/10 mois certifiés, 7 296 bougies 1h continues  
**Mode :** PAPER only

## 1. But

Tester Donchian 55/20 4h sur une période nouvelle pour cette stratégie, sans modifier aucun paramètre.

Le marché 2026 a déjà été observé dans d'autres études du Lab. Cette expérience n'est donc **pas** présentée comme un holdout de marché totalement aveugle.

En revanche, le résultat Donchian 2026 n'a pas encore été utilisé pour choisir 55/20, 4h ou un filtre.

## 2. Règle inchangée

- entrée : clôture > plus haut des 55 bougies 4h précédentes ;
- sortie : clôture < plus bas des 20 bougies 4h précédentes ;
- canal excluant la bougie signal ;
- signal sur bougie clôturée ;
- fill PAPER à l'ouverture suivante ;
- capital : 10 000 USDT ;
- frais : 0,10 % / côté ;
- glissement : 0,05 % / côté ;
- long-only ;
- aucun filtre ;
- aucun tuning ;
- aucune liquidation forcée de fin.

## 3. Scénarios prévus

- zéro friction ;
- coûts de base ;
- coûts ×2.

Mesures :
- rendement ;
- drawdown maximal ;
- fills ;
- frais ;
- inventaire final.

## 4. Interprétation

- résultat positif : renforce le candidat, sans preuve future ;
- résultat négatif : falsification importante du candidat sur une nouvelle période ;
- signe qui change uniquement sous coûts : problème de friction ;
- résultat déjà négatif sans friction : problème de signal/régime.

## 5. Stop Gate

Après résultat :
- ne pas modifier 55/20 ;
- ne pas modifier 4h ;
- ne pas ajouter un filtre pour réparer 2026 ;
- ne pas intégrer au runtime automatiquement ;
- conserver le résultat quel qu'il soit.

**Même règle. Nouvelle période. Aucun sauvetage après coup.**
