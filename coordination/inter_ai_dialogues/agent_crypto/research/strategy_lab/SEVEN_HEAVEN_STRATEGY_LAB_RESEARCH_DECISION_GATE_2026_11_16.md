# SEVEN HEAVEN · Strategy Lab — Research Decision Gate après V4.6.2

**Date :** 2026-11-16  
**Statut :** synthèse scientifique et gate d'implémentation  
**Runtime stable :** V4.6.2 inchangé  
**Mode :** PAPER ONLY

## 1. Ce que V4.6.2 sait déjà exécuter nativement

Le moteur stable `src/engine.py` expose actuellement :

- CASH
- HOLD_50
- HOLD_100
- DCA
- EMA_CROSS
- BOLLINGER
- CUSTOM_RULES

Le créateur personnalisé sait combiner :
- EMA cross up / prix au-dessus EMA ;
- filtres RSI ou volume ;
- sorties EMA cross down / prix sous EMA / RSI ;
- stop/target déclaratifs.

Aucun moteur natif Donchian, SuperTrend, MACD, SAR, VWAP ou Spot Grid n'est encore présent dans V4.6.2.

## 2. Familles réellement étudiées

### EMA
**État : étudiée, native, fragile aux coûts et aux régimes.**

- Les EMA rapides ont montré de la suractivité.
- EMA 10/30 1h : très sensible aux frictions.
- Sur 2025, le signal reste négatif même à zéro friction dans l'étude annuelle.
- À conserver comme référence pédagogique/native, pas comme candidat « gagnant ».

### Bollinger
**État : étudiée en profondeur, native.**

Travaux :
- baselines annuelles ;
- cartographie mensuelle ;
- friction ;
- trade anatomy ;
- MFE/MAE ;
- vieillissement des positions ;
- règle expérimentale âge+négatif.

Résultat important :
- la suractivité explique une grande part de l'érosion ;
- plusieurs mois échouent déjà sans friction ;
- la règle âge+négatif 24/36/48/72 h a été rejetée selon son protocole pré-enregistré.

Décision :
- garder Bollinger original ;
- arrêter le tuning post-hoc.

### DCA
**État : étudiée, native.**

- faible sensibilité aux coûts dans le modèle courant ;
- très forte dépendance à la direction du BTC ;
- utile comme baseline d'exposition progressive.

### MACD
**État : recherche externe suffisamment informative.**

- fréquence élevée en 1h ;
- forte érosion par les coûts ;
- passage en 4h réduit la rotation mais ne produit pas une robustesse générale.

Décision :
- ne pas prioriser son intégration native.

### SuperTrend
**État : recherche externe, mixte.**

- certains blocs favorables ;
- d'autres périodes nettement négatives ;
- intérêt pédagogique pour les régimes/tendances.

Décision :
- candidat secondaire éventuel après un moteur trend-following plus simple.

### Parabolic SAR
**État : recherche externe, fragile.**

- résultats très dépendants du régime ;
- forte dégradation sur certaines périodes.

Décision :
- ne pas prioriser.

### VWAP
**État : indicateur graphique natif du Microscope ; stratégie externe largement falsifiée.**

- nombreuses variantes étudiées ;
- versions fréquentes fortement pénalisées par les coûts ;
- pas de supériorité robuste sur BTC/ETH.

Décision :
- conserver VWAP comme indicateur/outil d'analyse ;
- ne pas le promouvoir comme moteur de stratégie à ce stade.

### Spot Grid
**État : recherche avancée mais modèle d'exécution différent.**

Travaux :
- faisabilité horaire ;
- replay natif 1 minute ;
- inventaire ;
- périodes continues sans reset ;
- recentrage mensuel ;
- stress de coûts ;
- sélection de régime Grid/Hold.

Point critique :
- TOUCH et CLOSE restent des **hypothèses de fill**, pas des exécutions vérifiées ;
- le modèle ne correspond pas au simple moteur next-bar-open des stratégies directionnelles.

Décision :
- **ne pas mélanger Spot Grid au moteur V4.6.2** comme s'il avait le même contrat d'exécution ;
- si intégré un jour, prévoir un moteur PAPER spécialisé Grid/execution.

### « Règle des 3 jours »
**État : étudiée comme événement/rebond, pas validée comme prédiction.**

- 20 épisodes évaluables ;
- confirmation 3 clôtures : 4/20 ;
- filtres structure/volume/EMA non convaincants ;
- délai peut éviter des pertes mais aussi manquer des reprises.

Décision :
- conserver en recherche événementielle ;
- aucune intégration native.

### Reversal / RSI / MACD / ADX / confirmations 2 jours
**État : recherche externe riche, mais pas de règle supérieure démontrée.**

- confirmation réduit certains whipsaws ;
- coût important des jours en cash ;
- pas de validation indépendante suffisante.

### Position sizing
**État : question déjà étudiée.**

Replay Donchian journalier :
- allocation 100 % : +387,12 %, DD -33,53 %
- 50 % : +146,05 %, DD -20,80 %
- 25 % : +61,87 %, DD -12,02 %

Conclusion :
- réduire l'allocation réduit mécaniquement amplitude des gains/pertes ;
- ne répare pas un mauvais régime ;
- inutile de relancer une recherche générique 25/50/100 sans nouvelle question.

## 3. Donchian 55/20 : famille la plus étudiée hors moteur natif

### Résultats favorables connus

BTC :
- 2020 Jul–Oct : +42,30 %
- 2021 Mai–Juil : +5,95 %
- 2024 : +71,39 %
- 2025 : +8,12 %

ETH :
- 2024 : +48,73 %
- 2025 : +18,04 %

XRP :
- 2024 : +142,62 %

SOL :
- 2024 : +33,72 %

BNB :
- 2025 : +14,92 %

### Falsifications connues

BTC :
- 2019 Sep–Oct : -0,74 %
- 2021 Oct–Nov : -6,77 %
- 2026 Jan–Oct : -5,03 %

2026 Jan–Oct :
- ETH : -17,91 %
- BNB : -28,78 %
- XRP : -30,19 %
- SOL : -11,30 %

Les cinq actifs restent négatifs en 2026 même à zéro friction.

### Mécanisme

136 round-trips sur BTC/ETH/BNB/XRP/SOL 2024–2025 :
- 54 gagnants / 82 perdants ;
- gagnants : durée médiane 69 bougies 4h, MFE +15,16 %, MAE -1,47 % ;
- perdants : 26,5 bougies, MFE +2,84 %, MAE -6,62 %.

Donchian est donc une stratégie trend-following :
- faible taux de réussite ;
- gros gagnants prolongés ;
- faible rotation ;
- forte dépendance au régime.

## 4. Diversification : résultats désormais établis

### Même mécanisme, plusieurs actifs

Donchian égal sur BTC/ETH/BNB/XRP/SOL Jan–Oct 2026 :
- portefeuille : **-18,64 %**
- DD : **-26,50 %**
- BTC seul : -5,03 %, DD -17,37 %

Conclusion :
- diversifier les actifs n'a pas protégé contre un échec commun du même mécanisme.

### Plusieurs mécanismes, même actif

BTC 50 % Donchian + 50 % Bollinger :

| Période | Portefeuille | DD | Donchian | Bollinger |
|---|---:|---:|---:|---:|
| 2024 | +34,47 % | -20,22 % | +71,39 % | -2,45 % |
| 2025 | +14,02 % | -20,72 % | +8,12 % | +19,91 % |
| 2026 Jan–Oct | -6,52 % | -17,82 % | -5,03 % | -8,01 % |

Corrélation 4h des equity returns :
- 0,099 / 0,027 / 0,107.

Conclusion :
- faible corrélation n'implique pas domination ;
- diversification de mécanismes peut lisser certains risques mais peut diluer le meilleur modèle ou combiner deux pertes.

## 5. Ce qu'il ne faut plus faire maintenant

Ne pas :
- retuner Bollinger sur les périodes déjà vues ;
- retuner Donchian pour « réparer » 2026 ;
- essayer 20 variantes de poids de portefeuille jusqu'à trouver le meilleur ;
- ajouter encore des actifs au même Donchian ;
- intégrer Spot Grid dans le moteur next-bar-open sans modèle d'exécution spécifique ;
- déclarer une stratégie « validée » ;
- toucher au runtime V4.6.2 sans gate propriétaire.

## 6. Premier candidat logique à une future intégration native

### DONCHIAN 55/20

**Pourquoi lui :**
1. mécanisme simple et auditable ;
2. causalité claire ;
3. next-bar-open identique au contrat du Lab ;
4. faible rotation ;
5. suffisamment de succès ET de falsifications documentés ;
6. comportement différent de Bollinger/EMA ;
7. bon outil pédagogique pour étudier la dépendance au régime ;
8. code de recherche déjà testé et reproductible.

**Pourquoi pas comme « stratégie recommandée » :**
- 2026 falsifie clairement toute robustesse tous-régimes ;
- plusieurs actifs échouent simultanément ;
- aucun filtre de régime n'est validé.

La valeur de l'intégration serait donc **scientifique**, pas commerciale :
> ajouter un véritable moteur trend-following au comparateur afin que le Lab puisse apprendre sur des familles de stratégie différentes.

## 7. Gate d'implémentation proposé

Aucune modification stable n'est effectuée par ce document.

Si Christophe autorise la prochaine étape logicielle, le périmètre recommandé est volontairement étroit :

1. ajouter un moteur natif `DONCHIAN` au Lab ;
2. conserver 55/20 comme valeurs par défaut ;
3. signal sur clôture précédente, fill à l'open suivant ;
4. exposer clairement entry period / exit period ;
5. intégrer le signal_context dans Forensics ;
6. ajouter Donchian au Comparateur, sans le favoriser dans le classement ;
7. rendre Scientific/Research compatibles sans optimiser automatiquement les paramètres ;
8. tests de parité contre `experimental_donchian.py` ;
9. aucune modification Spot Grid ;
10. aucune V4.7 publiée ni installée avant recette complète + accord propriétaire.

## Décision actuelle

**Phase de recherche historique : suffisamment mature pour ouvrir un gate logiciel.**

Le prochain geste ne doit plus être un nouveau backtest aléatoire.

Le prochain geste doit être soit :
- **A — autoriser la préparation d'un moteur natif Donchian**, sur branche isolée ;
- **B — rester en recherche documentaire/PAPER et ne modifier aucun moteur.**

V4.6.2 reste la release stable dans les deux cas.
