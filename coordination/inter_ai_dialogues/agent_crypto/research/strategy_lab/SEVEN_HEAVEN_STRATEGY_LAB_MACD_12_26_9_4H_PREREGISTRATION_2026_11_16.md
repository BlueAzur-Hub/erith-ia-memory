# SEVEN HEAVEN · Strategy Lab — MACD 12/26/9 · Protocole 4h

**Date :** 2026-11-16  
**Statut :** règle gelée avant lecture des résultats 4h  
**Périmètre :** recherche isolée, aucune intégration runtime V4.6.2  
**Source :** Binance Spot BTC/USDT 1h certifié 2024–2025, agrégé causalement en 4h  
**Ordres réels :** 0

## 1. Hypothèse

Le premier MACD 12/26/9 en 1h conserve un résultat brut positif sans friction sur 2024 et 2025, mais 664 fills par an rendent la stratégie très négative avec les coûts PAPER du Lab.

Cette nouvelle expérience teste une seule variable : **l'horizon des bougies**, de 1h vers 4h.

Les paramètres MACD ne changent pas.

## 2. Paramètres gelés

- MACD rapide : 12
- MACD lente : 26
- signal : 9
- timeframe : **4h**
- capital : 10 000 USDT
- frais : 0,10 % par côté
- glissement : 0,05 % par côté
- spot long-only
- levier : 1
- aucun filtre RSI, volume, zéro-line ou régime
- aucune liquidation forcée de fin

## 3. Construction des bougies 4h

Les bougies 4h sont agrégées par le module existant `src.observatory.aggregate_bars()` à partir des bougies 1h certifiées.

Chaque groupe de quatre heures doit être :

- continu ;
- aligné UTC ;
- complet ;
- construit avec open du premier intervalle ;
- high maximum ;
- low minimum ;
- close du quatrième intervalle ;
- somme des volumes.

Aucune bougie 4h n'est fabriquée à travers un trou.

## 4. Causalité

Pour une bougie 4h ouverte à T :

- le calcul MACD utilise uniquement les closes 4h terminés avant T ;
- le signal vient de la dernière bougie 4h clôturée ;
- le fill PAPER est supposé à l'ouverture T ;
- aucun high/low/close de T n'entre dans la décision.

## 5. Règles

Entrée :
- histogramme MACD <= 0 puis > 0 ;
- BUY PAPER au prochain open 4h si aucune position.

Sortie :
- histogramme MACD >= 0 puis < 0 ;
- SELL PAPER au prochain open 4h si position ouverte.

## 6. Fenêtres

- 2024 : research replay ;
- 2025 : known-market validation.

Les deux marchés ont déjà été observés dans d'autres expériences. Aucun caractère « untouched » n'est revendiqué.

## 7. Diagnostics prévus

Pour chaque année :

- rendement avec coûts de base ;
- rendement zéro-friction ;
- rendement avec coûts ×2 ;
- drawdown ;
- fills ;
- frais ;
- inventaire final.

La comparaison principale est avec le MACD 1h de même paramètres.

## 8. Critère d'apprentissage

Le 4h mérite une étude future seulement si :

- la fréquence baisse nettement ;
- l'avantage brut ne disparaît pas entièrement ;
- les coûts cessent de dominer le résultat ;
- la dégradation entre 2024 et 2025 reste lisible.

Aucune de ces conditions ne constitue une preuve de rentabilité future.

## 9. Stop Gate

- ne pas modifier 12/26/9 après résultat ;
- ne pas ajouter de filtre pour « sauver » le test ;
- toute variante devient une expérience distincte ;
- aucune intégration au runtime stable sans décision explicite.

**Une variable change : 1h → 4h. Tout le reste reste fixe.**
