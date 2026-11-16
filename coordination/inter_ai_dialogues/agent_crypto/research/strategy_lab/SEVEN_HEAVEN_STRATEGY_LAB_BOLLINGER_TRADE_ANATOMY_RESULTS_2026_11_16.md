# SEVEN HEAVEN · Strategy Lab — Bollinger Trade Anatomy 2024–2025

**Date UTC :** 2026-11-16  
**Statut :** étude pré-enregistrée terminée  
**Source :** Binance Spot BTC/USDT 1h certifiée 2024–2025  
**Fenêtres :** 23 mois indépendants avec 720 h de warmup  
**Paramètres :** Bollinger 20 / 2 sigma · 10 000 USDT · frais 0,10 %/côté · glissement 0,05 %/côté  
**Mode :** PAPER ONLY · zéro ordre réel · aucun tuning

## Résultat global

- round-trips clôturés : **193**
- gagnants : **126**
- perdants : **67**
- rendement médian par trade : **+0,696 %**
- rendement moyen par trade : **+0,098 %**
- durée moyenne : **39,32 h**

## Gagnants vs perdants

| Mesure | Gagnants | Perdants |
|---|---:|---:|
| Trades | 126 | 67 |
| Rendement moyen | **+1,478 %** | **-2,496 %** |
| Rendement médian | +1,166 % | -1,568 % |
| Durée moyenne | **25,54 h** | **65,24 h** |
| Largeur bande entrée | 1,894 % | 2,044 % |
| Profondeur sous bande basse | 0,212 % | 0,281 % |
| MFE moyenne | **+2,031 %** | **+0,856 %** |
| MAE moyenne | **-1,279 %** | **-5,844 %** |

## Corrélations trade-level

- durée ↔ rendement : **-0,700**
- largeur de bande à l'entrée ↔ rendement : **+0,019**
- profondeur sous la bande à l'entrée ↔ rendement : **+0,024**
- MFE ↔ rendement : **+0,538**
- MAE ↔ rendement : **+0,809**

La MAE est négative par convention ; la corrélation positive signifie que les trades dont la MAE reste proche de zéro tendent à mieux finir, tandis que les excursions fortement négatives sont associées aux pertes.

## Lecture principale

### 1. La géométrie exacte de l'entrée explique très peu le résultat

La largeur de bande à l'entrée et la profondeur sous la bande basse ont des corrélations quasi nulles avec le rendement final.

Donc, à ce stade, il n'existe aucun argument solide pour créer un filtre du type « ne pas acheter si la bande est trop large » ou « acheter seulement si le prix dépasse la bande de X % ».

### 2. La durée est un signal descriptif beaucoup plus fort

- gagnants : 25,54 h en moyenne ;
- perdants : 65,24 h ;
- corrélation durée ↔ rendement : -0,700.

Les trades qui restent ouverts longtemps ont nettement plus tendance à mal finir.

Cela ne justifie pas encore un time-stop : la durée n'est connue qu'au fur et à mesure du trade. Il faut d'abord vérifier comment la probabilité de succès évolue causalement avec l'âge de la position.

### 3. L'excursion adverse est la variable la plus discriminante

- MAE gagnants : -1,28 %
- MAE perdants : -5,84 %
- corrélation MAE ↔ rendement : +0,809

Les pertes ne sont donc pas seulement de petits échecs répétés : elles passent en moyenne beaucoup plus profondément sous le prix d'entrée.

### 4. Les gagnants montrent aussi davantage d'excursion favorable

- MFE gagnants : +2,03 %
- MFE perdants : +0,86 %

Un trade qui ne produit pas rapidement de rebond favorable semble plus fragile.

### 5. 2024 et 2025 ont presque le même nombre de trades et de gagnants

**2024**
- 97 trades
- 64 gagnants / 33 perdants
- rendement moyen par trade : +0,227 %
- durée moyenne : 38,05 h

**2025**
- 96 trades
- 62 gagnants / 34 perdants
- rendement moyen par trade : -0,031 %
- durée moyenne : 40,60 h

La différence annuelle ne vient donc pas d'un effondrement du taux de réussite. Elle semble davantage venir de la **sévérité et de la trajectoire des pertes**.

## Conclusion

Le prochain axe n'est plus l'entrée Bollinger.

La question devient :

> combien de temps un trade peut-il rester sans rebond avant que ses chances de finir positivement se dégradent fortement ?

Prochaine étude descriptive pré-enregistrée :

- âge 12 h / 24 h / 36 h / 48 h / 72 h ;
- état du trade à cet instant ;
- excursion adverse déjà subie ;
- probabilité de gain final ;
- rendement final moyen ;
- comparaison 2024 / 2025.

Aucun time-stop ne sera appliqué dans cette étude.

**Observer l'agonie d'un trade avant d'inventer la règle qui l'interrompt.**
