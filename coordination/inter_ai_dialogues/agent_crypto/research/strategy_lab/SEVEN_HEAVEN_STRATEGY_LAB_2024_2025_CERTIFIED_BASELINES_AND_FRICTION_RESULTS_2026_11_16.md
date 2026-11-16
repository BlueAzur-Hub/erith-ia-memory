# SEVEN HEAVEN · Strategy Lab — Baselines certifiées 2024–2025

**Date UTC :** 2026-11-16  
**Statut :** premier passage pré-enregistré exécuté  
**Source :** Binance Spot BTC/USDT · 1h · 24/24 mois certifiés  
**Bougies :** 17 544 heures continues  
**Moteur :** V4.6.2 PAPER · next-bar-open · long-only  
**Capital :** 10 000 USDT par fenêtre indépendante  
**Coûts de base :** 0,10 % de frais + 0,05 % de glissement par côté  
**Ordres réels :** 0

## 1. Data Gate

Les 12 mois 2024 et les 12 mois 2025 passent tous le validateur strict.

- 2024 : millisecondes
- 2025 : microsecondes
- trous : 0
- mois rejetés : 0
- interpolation : 0

La transition d'unité temporelle Binance du 1er janvier 2025 est validée par la même chaîne.

## 2. Protocole gelé

Le protocole a été enregistré avant lecture des performances :

- 2024 = recherche ;
- 2025 = holdout procédural ;
- six références seulement ;
- aucun tuning après lecture de 2025 ;
- DCA 1 440 minutes converti correctement en 24 bougies de 1h.

## 3. Résultats de base

| Stratégie | 2024 recherche | DD max 2024 | Fills 2024 | 2025 holdout | DD max 2025 | Fills 2025 |
|---|---:|---:|---:|---:|---:|---:|
| EMA 10/30 | **+38,78 %** | −27,26 % | 281 | **−56,16 %** | −59,50 % | 300 |
| Bollinger 20/2 | +9,41 % | −33,92 % | 216 | −22,06 % | −32,14 % | 199 |
| DCA 50 USDT / jour | +62,02 % | −28,84 % | 200 | −9,37 % | −34,76 % | 200 |
| Hold 50 % BTC | +60,49 % | −20,51 % | 1 | −3,24 % | −19,94 % | 1 |
| Hold 100 % BTC | **+120,97 %** | −32,31 % | 1 | −6,48 % | −34,76 % | 1 |
| CASH | 0 % | 0 % | 0 | **0 %** | 0 % | 0 |

Aucune stratégie active n'est positive sur les deux années.

## 4. Diagnostic des frictions

### 2024

| Stratégie | Zéro friction | Coûts de base | Coûts ×2 |
|---|---:|---:|---:|
| EMA | +111,54 % | +38,78 % | **−8,95 %** |
| Bollinger | +51,28 % | +9,41 % | **−20,87 %** |
| DCA | +62,27 % | +62,02 % | +61,78 % |
| Hold 50 % | +60,65 % | +60,49 % | +60,32 % |
| Hold 100 % | +121,31 % | +120,97 % | +120,64 % |
| CASH | 0 % | 0 % | 0 % |

Frais simulés de base :
- EMA : **3 112,99 USDT** ;
- Bollinger : **2 413,17 USDT** ;
- DCA : 9,99 USDT ;
- Hold 50 : 5,00 USDT ;
- Hold 100 : 9,99 USDT.

### 2025

| Stratégie | Zéro friction | Coûts de base | Coûts ×2 |
|---|---:|---:|---:|
| EMA | **−31,25 %** | −56,16 % | −72,05 % |
| Bollinger | **+5,05 %** | −22,06 % | −42,18 % |
| DCA | −9,23 % | −9,37 % | −9,50 % |
| Hold 50 % | −3,17 % | −3,24 % | −3,31 % |
| Hold 100 % | −6,33 % | −6,48 % | −6,62 % |
| CASH | 0 % | 0 % | 0 % |

Frais simulés de base :
- EMA : **2 158,73 USDT** ;
- Bollinger : **1 826,27 USDT** ;
- DCA : 9,99 USDT ;
- Hold 50 : 5,00 USDT ;
- Hold 100 : 9,99 USDT.

## 5. Lecture

### EMA

Deux problèmes distincts apparaissent.

En 2024, le signal brut est fort mais les 281 fills consomment une grande partie de l'avantage. Doubler les frictions suffit à rendre la stratégie négative.

En 2025, la stratégie reste très négative même sans frais ni glissement. Le problème n'est donc plus seulement le coût : le régime de marché rend le croisement EMA 10/30 lui-même mauvais dans cette configuration.

### Bollinger

Le modèle montre une forte sensibilité aux frictions.

En 2025, le scénario zéro-friction est légèrement positif (+5,05 %), mais 199 fills et les coûts hypothétiques transforment le résultat en −22,06 %.

### DCA / Hold

Leur sensibilité aux frictions est très faible.

Leur bascule 2024 → 2025 vient principalement de l'exposition au marché et non des frais.

### CASH

CASH ne gagne rien, mais protège intégralement le capital dans le holdout 2025. Il doit rester une baseline réelle et ne jamais être traité comme une stratégie « inactive donc sans intérêt ».

## 6. Conclusion scientifique

Le premier passage ne fournit **aucune stratégie toujours active robuste**.

Il montre en revanche :

1. que le régime de marché domine fortement le classement ;
2. que la suractivité peut détruire une stratégie techniquement profitable avant coûts ;
3. qu'un signal peut rester mauvais même avec coûts nuls ;
4. qu'une stratégie prudente doit pouvoir réduire ou suspendre son exposition ;
5. qu'un futur filtre de régime est une hypothèse nouvelle à tester, pas une correction rétroactive.

## 7. Discipline pour la suite

Le holdout 2025 a désormais été vu. Il ne doit plus être présenté comme « untouched » pour toute règle inventée après ce rapport.

La suite doit être une nouvelle expérience explicitement datée.

Prochaine famille proposée : **MACD**, en module de recherche séparé, sans modifier le runtime V4.6.2. Puis SuperTrend, SAR, Donchian et VWAP, une famille à la fois.

Spot Grid restera séparé à cause de l'ambiguïté intrabougie.

**Le premier résultat utile n'est pas une stratégie gagnante. C'est la preuve qu'une stratégie doit savoir quand ne pas trader.**
