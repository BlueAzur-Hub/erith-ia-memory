# SEVEN HEAVEN · Strategy Lab — Donchian 55/20 4h · Protocole de mécanisme et régimes

**Date :** 2026-11-16  
**Statut :** variables descriptives gelées avant lecture de l'anatomie des trades  
**Stratégie :** Donchian 55/20 4h inchangé  
**Périmètre :** BTC/USDT, ETH/USDT, BNB/USDT, XRP/USDT, SOL/USDT · 2024–2025  
**Mode :** analyse post-hoc descriptive, PAPER only

## 1. But

Les tests précédents ont montré que Donchian 55/20 4h :

- fonctionne sur certaines fenêtres ;
- échoue sur d'autres ;
- est peu sensible aux coûts par rapport aux stratégies plus actives ;
- dépend clairement de l'actif et du régime.

La question devient :

> quelles caractéristiques déjà observables au moment de l'entrée diffèrent entre les positions favorables et défavorables ?

Cette étude **ne crée aucun filtre**. Elle décrit les mécanismes.

## 2. Variables pré-entrée autorisées

Pour chaque entrée Donchian, calculées uniquement avec la bougie signal clôturée et son passé :

### A. Breakout excess
Écart en pourcentage entre la clôture signal et le haut du canal 55 précédent.

`breakout_excess_pct = (signal_close / prior_55_high - 1) × 100`

### B. Largeur du canal 55
Amplitude du plus haut au plus bas des 55 bougies précédentes, rapportée au prix signal.

`channel_width_pct = (prior_55_high - prior_55_low) / signal_close × 100`

### C. Rendement directionnel 55
Variation entre le close d'il y a 55 bougies et le close signal.

### D. Efficiency ratio 55
Rapport entre le déplacement net et la somme des déplacements absolus des closes sur 55 barres.

Valeur proche de 1 : chemin directionnel.  
Valeur proche de 0 : chemin très irrégulier.

Ce ratio reste descriptif ; aucun seuil n'est défini.

### E. ATR 20 relatif
ATR Wilder 20 rapporté au close signal, en pourcentage.

Mesure de volatilité locale, pas signal d'achat.

## 3. Variables de position rétrospectives

Pour les positions entièrement clôturées seulement :

- durée en bougies 4h ;
- rendement net après frais et glissement ;
- MFE : excursion favorable maximale par les highs observés pendant la position ;
- MAE : excursion défavorable maximale par les lows observés pendant la position.

MFE/MAE sont **rétrospectifs** et ne doivent jamais être présentés comme des prix exécutables ou des informations disponibles au moment de l'entrée.

Une position encore ouverte en fin de fenêtre reste exclue des statistiques de positions clôturées.

## 4. Descripteurs annuels de régime

Pour chaque actif/année :

- rendement du sous-jacent ;
- volatilité réalisée 4h annualisée ;
- drawdown maximal du sous-jacent ;
- efficiency ratio annuel ;
- pourcentage de closes 4h au-dessus de SMA200 après préchauffage ;
- nombre de fills Donchian ;
- rendement Donchian.

Ces dix fenêtres annuelles sont un petit échantillon. Les relations observées sont descriptives, pas des corrélations robustes.

## 5. Comparaisons autorisées

Sur les positions clôturées :

- médiane des variables pré-entrée pour gagnantes vs perdantes ;
- médiane durée ;
- médiane MFE/MAE ;
- résultat par actif et année.

Interdit dans cette étape :

- chercher automatiquement un seuil optimal ;
- entraîner un classifieur ;
- choisir la meilleure combinaison de variables ;
- supprimer les outliers parce qu'ils gênent la conclusion ;
- créer une nouvelle stratégie.

## 6. Règle de causalité

Toutes les variables candidates à un futur filtre doivent être calculables **avant le fill**.

MFE, MAE, durée et PnL servent uniquement à expliquer après coup.

## 7. Critère de sortie

Cette étude est terminée quand elle peut répondre sans créer de filtre :

- les gagnants apparaissent-ils après des breakouts plus ou moins étendus ?
- les canaux sont-ils plus étroits ou plus larges ?
- les chemins pré-entrée sont-ils plus directionnels ?
- la volatilité locale diffère-t-elle ?
- les pertes viennent-elles surtout de faux breakouts rapides ou de tendances longues qui se retournent ?
- quels régimes annuels concentrent les échecs ?

Une hypothèse de filtre éventuelle devra ensuite être **pré-enregistrée comme une nouvelle expérience**.

**Comprendre le mécanisme avant de toucher à la règle.**
