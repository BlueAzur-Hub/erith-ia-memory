# SEVEN HEAVEN · Strategy Lab — Baselines 2024–2025 et diagnostic des frictions

**Date UTC :** 2026-11-16  
**Statut :** premier passage pré-enregistré terminé  
**Source :** Binance Spot BTC/USDT · 1h · 24/24 mois 2024–2025 certifiés  
**Moteur :** Seven Heaven Strategy Lab V4.6.2 · PAPER ONLY  
**Capital comparatif :** 10 000 USDT  
**Frais de base :** 0,10 % par côté  
**Glissement de base :** 0,05 % par côté  
**Timeframe :** 1h  
**Ordres réels :** 0

## 1. Protocole

La séparation a été fixée avant lecture des performances :

- **2024 = bloc recherche**
- **2025 = holdout procédural**

Six références ont été exécutées sans retouche intermédiaire :

1. EMA Cross 10/30
2. Bollinger 20 / 2 sigma
3. DCA 50 USDT toutes les 1 440 minutes
4. Buy & Hold 50 %
5. Buy & Hold 100 %
6. CASH

Le DCA est converti correctement par la couche `observatory.run_one()` : 1 440 minutes = 24 bougies de 1h.

## 2. Résultats 2024 — bloc recherche

| Modèle | Rendement | Drawdown max | Fills | Frais |
|---|---:|---:|---:|---:|
| EMA 10/30 | **+38,78 %** | -27,26 % | 281 | 3 112,99 USDT |
| Bollinger | **+9,41 %** | -33,92 % | 216 | 2 413,17 USDT |
| DCA | **+62,02 %** | -28,84 % | 200 | 9,99 USDT |
| Hold 50 % | **+60,49 %** | -20,51 % | 1 | 5,00 USDT |
| Hold 100 % | **+120,97 %** | -32,31 % | 1 | 9,99 USDT |
| CASH | 0,00 % | 0,00 % | 0 | 0 |

Le meilleur rendement 2024 est donc le simple Hold 100 %. DCA et Hold 50 % sont proches l'un de l'autre, tandis que les stratégies actives paient des coûts très élevés.

## 3. Résultats 2025 — holdout procédural

| Modèle | Rendement | Drawdown max | Fills | Frais |
|---|---:|---:|---:|---:|
| EMA 10/30 | **-56,16 %** | -59,50 % | 300 | 2 158,73 USDT |
| Bollinger | **-22,06 %** | -32,14 % | 199 | 1 826,27 USDT |
| DCA | **-9,37 %** | -34,76 % | 200 | 9,99 USDT |
| Hold 50 % | **-3,24 %** | -19,94 % | 1 | 5,00 USDT |
| Hold 100 % | **-6,48 %** | -34,76 % | 1 | 9,99 USDT |
| CASH | **0,00 %** | 0,00 % | 0 | 0 |

Aucun modèle exposé au BTC n'est positif sur le holdout 2025. CASH est la meilleure référence du bloc.

## 4. Diagnostic zéro friction / coûts ×2

### 2024

| Modèle | Zéro friction | Coûts de base | Coûts ×2 |
|---|---:|---:|---:|
| EMA 10/30 | +111,54 % | +38,78 % | **-8,95 %** |
| Bollinger | +51,28 % | +9,41 % | **-20,87 %** |
| DCA | +62,27 % | +62,02 % | +61,78 % |
| Hold 50 % | +60,65 % | +60,49 % | +60,32 % |
| Hold 100 % | +121,31 % | +120,97 % | +120,64 % |
| CASH | 0,00 % | 0,00 % | 0,00 % |

### 2025

| Modèle | Zéro friction | Coûts de base | Coûts ×2 |
|---|---:|---:|---:|
| EMA 10/30 | **-31,25 %** | -56,16 % | -72,05 % |
| Bollinger | **+5,05 %** | -22,06 % | -42,18 % |
| DCA | -9,23 % | -9,37 % | -9,50 % |
| Hold 50 % | -3,17 % | -3,24 % | -3,31 % |
| Hold 100 % | -6,33 % | -6,48 % | -6,62 % |
| CASH | 0,00 % | 0,00 % | 0,00 % |

## 5. Ce que l'étude permet déjà de distinguer

### EMA 10/30

Deux problèmes différents apparaissent :

- en 2024, le signal brut est favorable mais les frictions amputent très fortement le résultat ;
- en 2025, **même à zéro friction le modèle perd -31,25 %**.

Conclusion : le problème 2025 n'est pas seulement le coût. Le signal EMA 10/30 est lui-même inadapté à cette période, et la fréquence de transaction amplifie ensuite l'échec.

### Bollinger

- 2024 : signal brut +51,28 %, mais seulement +9,41 % après coûts ;
- 2025 : signal brut encore légèrement positif (+5,05 %), mais -22,06 % après coûts.

Conclusion : dans cette configuration, Bollinger est surtout victime de **suractivité / friction**, davantage que d'un signal structurellement catastrophique.

### DCA

Le résultat varie très peu quand les coûts changent :

- 2024 : +62,27 % → +62,02 % → +61,78 %
- 2025 : -9,23 % → -9,37 % → -9,50 %

Conclusion : le DCA est beaucoup moins sensible aux frictions de ce modèle, mais reste naturellement dépendant du régime de prix.

### Hold

Les frictions sont presque négligeables puisqu'il n'y a qu'un fill initial. Le résultat reflète donc essentiellement l'exposition directionnelle au BTC.

## 6. Conclusion scientifique du premier holdout

**Aucune stratégie active actuelle ne démontre de robustesse 2024 → 2025.**

Le résultat ne justifie ni tuning immédiat ni proclamation d'une stratégie gagnante.

Il justifie la prochaine question :

> **dans quels environnements de marché chaque famille fonctionne-t-elle ou échoue-t-elle ?**

La prochaine étude doit donc être descriptive avant d'être optimisatrice :

- découpage mensuel ;
- rendement BTC du mois ;
- volatilité réalisée ;
- drawdown du marché ;
- comportement de chaque modèle sur le même mois ;
- aucun paramètre modifié ;
- aucune classification utilisée comme signal d'entrée.

## 7. Stop Gate

Ne pas :

- tuner EMA ou Bollinger sur le holdout 2025 ;
- transformer le meilleur mois en preuve de robustesse ;
- utiliser une classification de régime ex post comme information future ;
- modifier V4.6.2 ;
- créer un bot autonome à ce stade.

**Étape suivante : cartographier les régimes et les échecs avant d'ajouter de nouvelles stratégies.**
