# SEVEN HEAVEN · Strategy Lab — SAR parabolique 0,02 / 0,20 · Preregistration

**Date :** 2026-11-16  
**Statut :** protocole gelé avant résultats SAR  
**Périmètre :** recherche isolée, aucune intégration V4.6.2  
**Source :** Binance Spot BTC/USDT certifié 2024–2025  
**Mode :** PAPER only, long-only, next-bar-open

## 1. Hypothèse

Tester le SAR parabolique comme famille de suivi de tendance indépendante d'EMA, MACD et SuperTrend.

Aucune optimisation paramétrique n'est faite au premier passage.

## 2. Paramètres gelés

- facteur d'accélération initial : **0,02**
- incrément : **0,02**
- facteur d'accélération maximum : **0,20**
- capital : 10 000 USDT
- frais : 0,10 % par côté
- glissement : 0,05 % par côté
- spot long-only
- levier : 1
- aucun filtre externe
- aucune liquidation forcée de fin

Horizons déclarés avant résultat :

- 1h
- 4h

## 3. Algorithme

Le SAR suit la procédure directionnelle classique :

- tendance initialisée à partir des premières bougies closes ;
- point extrême EP mis à jour dans le sens de tendance ;
- SAR avancé de AF × (EP − SAR) ;
- AF augmente de 0,02 lors d'un nouveau point extrême, jusqu'à 0,20 ;
- contrainte du SAR par les deux bougies précédentes ;
- inversion si le prix franchit le SAR projeté.

## 4. Règles PAPER

Entrée :
- retournement SAR baissier → haussier sur une bougie clôturée ;
- BUY fictif à l'ouverture suivante.

Sortie :
- retournement SAR haussier → baissier ;
- SELL fictif à l'ouverture suivante.

Aucune position n'est ouverte simplement parce que l'état initial est haussier.

## 5. Causalité

La bougie servant au fill ne peut contribuer au calcul du signal.

Le signal est entièrement construit sur la bougie précédente et celles qui la précèdent.

## 6. Fenêtres

Pour 1h et 4h :

- 2024 : research replay ;
- 2025 : known-market validation.

Aucun caractère blind/untouched n'est revendiqué.

## 7. Coûts

Trois scénarios prévus :

- zéro friction ;
- coûts de base ;
- coûts ×2.

## 8. Mesures

- rendement ;
- drawdown ;
- nombre de fills ;
- frais ;
- inventaire final ;
- sensibilité aux coûts ;
- différence 1h / 4h ;
- stabilité 2024 / 2025.

## 9. Stop Gate

- ne pas modifier 0,02 / 0,20 après résultat en gardant le même nom ;
- toute autre vitesse SAR = nouvelle expérience ;
- aucun filtre ajouté rétroactivement ;
- aucune intégration runtime automatique.

**Le SAR est testé d'abord dans sa forme standard, pas optimisée.**
