# SEVEN HEAVEN · Strategy Lab — Protocole pré-enregistré Bollinger Trade Aging

**Date :** 2026-11-16  
**Statut :** gelé avant lecture des résultats  
**Source :** Binance Spot BTC/USDT 1h certifiée 2024–2025  
**Base :** Bollinger 20 / 2 sigma · PAPER ONLY · paramètres inchangés

## Question

Comment évolue la probabilité de succès d'un trade Bollinger quand il reste ouvert longtemps ?

## Horizons fixés avant calcul

- 12 h
- 24 h
- 36 h
- 48 h
- 72 h

Pour chaque horizon, seuls les round-trips encore ouverts juste avant cet instant sont étudiés.

## État causal observé à l'horizon

Pour éviter toute fuite d'information :

- le fill d'entrée a lieu à l'open ;
- à H heures, le PnL marqué utilise la dernière bougie **déjà clôturée** avant l'instant H ;
- la MAE observée n'utilise que les low déjà réalisés avant H ;
- aucune donnée postérieure à l'horizon n'est utilisée pour décrire l'état courant.

Le résultat final du trade est ensuite utilisé uniquement comme étiquette d'issue.

## Mesures par horizon

- nombre de positions encore ouvertes ;
- taux de victoire final de ces positions ;
- rendement final moyen et médian ;
- PnL marqué moyen à l'horizon ;
- MAE moyenne déjà subie ;
- même lecture séparée pour 2024 et 2025 ;
- séparation descriptive entre positions actuellement positives et négatives à l'horizon.

## Interdictions

- aucun time-stop appliqué ;
- aucun stop-loss ajouté ;
- aucun seuil choisi après lecture ;
- aucune optimisation de Bollinger ;
- aucune modification du runtime stable.

## But

Repérer si la dégradation est progressive et à partir de quel âge les positions restantes deviennent statistiquement beaucoup plus fragiles.

Une éventuelle règle temporelle future devra faire l'objet d'une expérience séparée et pré-enregistrée.

**Cette étude observe l'âge ; elle ne coupe aucun trade.**
