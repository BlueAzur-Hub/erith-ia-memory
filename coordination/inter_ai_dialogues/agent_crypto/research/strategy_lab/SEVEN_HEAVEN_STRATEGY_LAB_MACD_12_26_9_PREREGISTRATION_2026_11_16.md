# SEVEN HEAVEN · Strategy Lab — MACD Research Preregistration

**Date :** 2026-11-16  
**Statut :** règle gelée avant lecture des résultats MACD  
**Périmètre :** recherche isolée, aucune intégration runtime V4.6.2  
**Source primaire :** Binance Spot BTC/USDT 1h certifié 2024–2025  
**Ordres réels :** 0

## 1. Hypothèse

Tester un MACD long-only simple comme famille distincte de l'EMA Cross existante.

Cette étude ne cherche pas un « meilleur MACD ». Elle teste d'abord une configuration standard fixe afin d'apprendre son comportement avec les mêmes hypothèses PAPER que le Lab.

## 2. Paramètres gelés

- EMA rapide MACD : **12**
- EMA lente MACD : **26**
- signal MACD : **9**
- timeframe : **1h**
- capital : **10 000 USDT**
- frais : **0,10 % par côté**
- glissement : **0,05 % par côté**
- spot long-only
- levier : 1
- taille : tout le cash disponible lors d'une entrée
- inventaire final marqué au dernier close
- aucune liquidation forcée de fin

Aucun filtre RSI, volume, zéro-line ou régime dans ce premier passage.

## 3. Causalité

Pour la bougie ouverte à l'heure T :

1. seuls les closes jusqu'à T−1h peuvent mettre à jour EMA12, EMA26 et signal9 ;
2. le croisement MACD/signal est décidé sur cette dernière clôture disponible ;
3. le fill PAPER éventuel est supposé à l'ouverture T ;
4. aucune donnée high/low/close de T n'entre dans la décision.

## 4. Règles

### Entrée
Lorsque l'histogramme MACD passe de <= 0 à > 0 et qu'aucun BTC n'est détenu :

- BUY PAPER au prochain open.

### Sortie
Lorsque l'histogramme passe de >= 0 à < 0 et qu'une position est ouverte :

- SELL PAPER au prochain open.

## 5. Fenêtres

Les prix 2024–2025 ont déjà été observés lors des baselines. Par conséquent :

- 2024 = **research replay** ;
- 2025 = **known-market validation**, pas un holdout untouched.

Aucune revendication de test aveugle ne sera faite.

## 6. Diagnostics

Pour 2024 et 2025 :

- rendement net ;
- drawdown max ;
- fills ;
- frais ;
- cash / inventaire final ;
- zéro-friction ;
- coûts ×2 ;
- comparaison descriptive avec CASH et Hold, sans modifier MACD.

## 7. Critère d'apprentissage

Le test est utile même si MACD perd.

Questions :

- le signal est-il positif avant coûts ?
- la fréquence détruit-elle l'avantage ?
- le comportement change-t-il fortement entre 2024 et 2025 ?
- la stratégie est-elle moins ou plus fragile que EMA/Bollinger ?

## 8. Stop Gate

Après lecture des résultats :

- ne pas retoucher 12/26/9 et appeler cela la même expérience ;
- tout filtre ajouté devient une nouvelle expérience datée ;
- ne pas intégrer au Lab stable sans justification ;
- aucune V4.7 automatique.

**Une règle. Une preuve. Une limite.**
