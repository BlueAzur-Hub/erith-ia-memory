# SEVEN HEAVEN · Strategy Lab — Bollinger Age+Negative Exit · protocole de sélection

**Date :** 2026-11-16  
**Statut :** gelé avant exécution  
**Base :** Bollinger 20 / 2 sigma · PAPER ONLY  
**Source :** Binance Spot BTC/USDT 1h certifiée

## Hypothèse

Les diagnostics précédents montrent que les positions encore négatives après plusieurs dizaines d'heures récupèrent rarement.

La nouvelle règle testée est donc :

> si une position Bollinger est encore ouverte après H heures, et si la dernière bougie clôturée est sous le prix d'entrée PAPER, vendre à l'open de la bougie suivante.

## Candidats fixés avant résultat

- H = 24 h
- H = 36 h
- H = 48 h
- H = 72 h

Le Bollinger original sans sortie conditionnelle reste la baseline.

## Causalité

À l'open d'une bougie :

1. lire uniquement la bougie précédente déjà clôturée ;
2. calculer la sortie Bollinger normale ;
3. si la sortie normale ne se déclenche pas, vérifier l'âge de la position ;
4. si âge >= H et close précédent < prix d'entrée PAPER, sortir à cet open.

Aucune information de la bougie courante après son open n'est utilisée.

## Périodes

### Sélection
**2024-02-01 → 2024-12-31**

- janvier 2024 : 720 h de warmup final avant le 1er février ;
- capital frais au début de la période active.

### Validation connue
**2025-01-01 → 2025-12-31**

- 720 h de warmup tirées de décembre 2024 ;
- 2025 a déjà été observé dans les diagnostics : il n'est pas qualifié de holdout aveugle.

### Confirmation indépendante
**2026-01-01 → 2026-10-31**

- 720 h de warmup tirées de décembre 2025 ;
- bloc 2026 certifié avant cette expérience ;
- 2026 ne participe jamais au choix de H.

## Critère de sélection sur 2024 uniquement

Un candidat H est **admissible** seulement s'il :

1. a un rendement net strictement supérieur à la baseline ;
2. a un drawdown maximal au moins aussi bon que la baseline (moins négatif ou égal).

Parmi les candidats admissibles :

1. rendement net le plus élevé ;
2. en cas d'égalité, meilleur drawdown ;
3. puis moins de fills ;
4. puis horizon H le plus long.

Si aucun candidat n'est admissible, la baseline originale est conservée.

## Paramètres fixes

- capital : 10 000 USDT
- frais : 0,10 %/côté
- glissement : 0,05 %/côté
- timeframe : 1h
- Bollinger : 20 périodes, 2 sigma
- spot long-only
- zéro levier
- zéro liquidation forcée de fin

## Interdictions

- aucune modification de H après lecture de 2025 ou 2026 ;
- aucun stop-loss supplémentaire ;
- aucun take-profit supplémentaire ;
- aucun changement sigma/période ;
- aucune sélection sur 2026 ;
- aucune modification de V4.6.2 stable.

**La règle doit gagner son droit d'exister sur 2024 avant d'être regardée ailleurs.**
