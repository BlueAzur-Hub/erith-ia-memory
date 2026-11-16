# SEVEN HEAVEN · Strategy Lab — Bollinger Age+Negative Exit · résultat de sélection

**Date UTC :** 2026-11-16  
**Statut :** expérience pré-enregistrée terminée  
**Mode :** PAPER ONLY · zéro ordre réel  
**Règle testée :** sortie si âge >= H et dernière clôture < prix d'entrée PAPER  
**Horizons :** 24 / 36 / 48 / 72 h  
**Sélection :** 2024 uniquement  
**2025 :** validation connue  
**2026 :** confirmation indépendante réservée

## Baseline 2024 — février à décembre

Bollinger original :

- rendement : **+9,78 %**
- drawdown max : **-33,92 %**
- fills : **200**
- frais : **2 261,19 USDT**
- temps en position : **48,11 %**

## Candidats 2024

| H | Rendement | Drawdown | Fills | Sorties âge+négatif | Admissible |
|---|---:|---:|---:|---:|---|
| 24 h | +3,60 % | -38,12 % | 282 | 60 | non |
| 36 h | -14,56 % | -48,38 % | 248 | 46 | non |
| 48 h | **+14,22 %** | **-34,48 %** | 236 | 29 | non |
| 72 h | -4,37 % | -37,11 % | 208 | 14 | non |

## Pourquoi 48 h est malgré tout rejeté

Le protocole exigeait avant résultat :

1. rendement strictement supérieur à la baseline ;
2. drawdown au moins aussi bon que la baseline.

Le candidat 48 h satisfait le premier critère mais pas le second :

- rendement : +14,22 % > +9,78 %
- drawdown : -34,48 % < -33,92 %

La différence de drawdown est faible, mais modifier le critère après avoir vu le résultat serait du **post-hoc tuning**.

Le candidat est donc rejeté.

## Décision de sélection

- candidat sélectionné : **aucun**
- mode retenu : **BASELINE**
- horizon retenu : **aucun**

Par conséquent, 2025 et 2026 ne sont pas utilisés pour départager les candidats.

## Référence des périodes non sélectionnantes

### 2025 — baseline
- rendement : **-22,06 %**
- drawdown : **-32,14 %**
- fills : 199

### 2026 janvier→octobre — baseline
- rendement : **-40,85 %**
- drawdown : **-43,34 %**
- fills : 157

Ces résultats montrent aussi que le Bollinger 20/2 original reste très fragile sur le bloc indépendant 2026.

## Conclusion

L'hypothèse descriptive « un trade vieux et encore négatif récupère rarement » était vraie.

Mais la règle naïve dérivée :

> sortir automatiquement quand âge >= H et position encore négative

**ne gagne pas son droit d'intégrer le modèle** sous le critère rendement + drawdown fixé à l'avance.

C'est un résultat scientifique utile : une forte relation descriptive n'est pas automatiquement une bonne règle de trading causale.

Le candidat 48 h peut rester une piste de recherche séparée, mais il ne doit pas être promu rétroactivement.

**Hypothèse intéressante ≠ règle validée.**
