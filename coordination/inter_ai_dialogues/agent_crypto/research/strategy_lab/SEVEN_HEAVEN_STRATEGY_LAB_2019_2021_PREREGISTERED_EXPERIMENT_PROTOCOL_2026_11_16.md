# SEVEN HEAVEN · Strategy Lab — Protocole pré-enregistré 2019–2021

**Date :** 2026-11-16  
**Statut :** protocole fixé avant lecture des performances historiques longues  
**Base logicielle :** V4.6.2 stable · PAPER ONLY  
**Source cible :** Binance Spot BTC/USDT · 1h · mois certifiés uniquement

## 1. But

Tester si les stratégies actuelles résistent à plusieurs régimes anciens sans modifier leurs règles après lecture des résultats.

Ce protocole doit réduire le biais de rétrospection. Il ne transforme pas 2021 en holdout parfaitement aveugle au sens académique : les familles de stratégies existaient déjà et l'histoire publique de Bitcoin est connue. Il crée néanmoins un **holdout procédural** : aucun paramètre ne doit être choisi à partir des résultats 2021 une fois l'étude commencée.

## 2. Gate de données

Aucune performance n'est calculée tant que les sources ne sont pas certifiées.

Un mois est utilisable seulement si :

- ZIP officiel identifié ;
- `.CHECKSUM` correspondant ;
- SHA-256 concordant ;
- mois complet ;
- une bougie par heure ;
- ordre UTC strict ;
- aucun doublon ;
- aucun trou ;
- OHLC cohérents ;
- unité temporelle conforme ;
- provenance enregistrée.

Un mois rejeté n'est jamais réparé, interpolé ou rempli.

Si un mois manque dans une fenêtre, la fenêtre est soit rejetée, soit explicitement scindée. Elle n'est jamais présentée comme continue.

## 3. Périodes fixées avant résultats

### Bloc recherche

**2019-01-01 → 2020-12-31**

Usage :

- contrôle des stratégies de référence ;
- compréhension des régimes ;
- essais paramétriques futurs uniquement si explicitement déclarés ;
- sélection éventuelle d'une configuration avant ouverture du holdout.

### Bloc de vérification procédurale

**2021-01-01 → 2021-12-31**

Règle :

- aucun paramètre ne doit être choisi à partir de ses résultats ;
- aucun filtre ne doit être ajouté parce qu'il aurait amélioré 2021 ;
- toute modification née après lecture de 2021 crée une **nouvelle expérience**, pas une correction rétroactive de l'expérience initiale.

## 4. Hypothèses de coût de base

Conserver les valeurs actuelles du moteur V4.6.2 :

- capital comparatif : 10 000 USDT sauf étude explicitement différente ;
- frais Taker fictifs : **0,10 % par côté** (`0.001`) ;
- glissement fictif : **0,05 % par côté** (`0.0005`) ;
- spot long-only ;
- aucun levier ;
- aucun emprunt ;
- signal calculé sur bougie clôturée ;
- fill PAPER supposé à l'ouverture de la bougie suivante ;
- inventaire final non liquidé de force.

Stress déjà prévu :

- frais ×2 ;
- glissement ×2.

Ces hypothèses ne prétendent pas reconstruire les frais historiques exacts d'un compte Binance.

## 5. Stratégies de référence — premier passage

Aucune nouvelle stratégie au premier passage.

Références fixes :

1. CASH ;
2. Buy & Hold 50 % ;
3. Buy & Hold 100 % ;
4. DCA ;
5. EMA Cross ;
6. Bollinger ;
7. stratégie personnalisée uniquement si sa configuration est gelée avant le calcul.

Valeurs moteur par défaut si aucun profil gelé n'est fourni :

- EMA : 10 / 30 ;
- Bollinger : période 20, sigma 2 ;
- DCA : toutes les 1 440 minutes, 50 USDT ;
- RSI : période 14 lorsque utilisé ;
- volume : période 20 lorsque utilisé.

## 6. Mesures obligatoires

Pour chaque stratégie et chaque fenêtre :

- capital final ;
- rendement net ;
- drawdown maximal ;
- frais ;
- nombre de fills ;
- positions clôturées ;
- gagnantes / perdantes ;
- profit factor lorsque calculable ;
- temps en position ;
- PnL réalisé ;
- inventaire latent ;
- résultat sans frais/glissement uniquement comme contre-factuel ;
- résultat sous stress coûts ×2 ;
- comparaison CASH ;
- comparaison Buy & Hold.

Zéro trade = **capital resté en cash**, jamais « victoire ».

## 7. Walk-forward secondaire

Après le passage fixe recherche/holdout, un walk-forward peut être exécuté sur le bloc recherche uniquement.

Principe :

- historique antérieur seulement pour sélectionner ;
- période suivante pour vérifier ;
- préchauffage autorisé avec bougies antérieures ;
- aucune transaction pendant le préchauffage ;
- capital neuf à chaque fenêtre indépendante ;
- rendements de fenêtres indépendantes non cumulés artificiellement.

Le holdout 2021 reste séparé jusqu'à ce que les règles sélectionnées soient gelées.

## 8. Cartographie des régimes

La cartographie de régime est d'abord **descriptive**, pas une condition d'entrée.

Elle peut distinguer :

- tendance haussière ;
- tendance baissière ;
- range ;
- forte volatilité ;
- faible volatilité ;
- drawdown sévère ;
- reprise.

Si des régimes deviennent plus tard des entrées de stratégie, une nouvelle étude doit être créée pour éviter d'utiliser une classification ex post comme information future.

## 9. Nouvelles stratégies — après les baselines

Ordre proposé après la première étude :

1. MACD ;
2. SuperTrend ;
3. SAR parabolique ;
4. Donchian ;
5. VWAP comme règle de stratégie séparée de son rôle graphique ;
6. Spot Grid dans une étude distincte à cause de l'ambiguïté intrabougie.

Une famille à la fois.

## 10. Interprétation

Le meilleur rendement brut n'est pas automatiquement la meilleure stratégie.

La lecture doit considérer ensemble :

- rendement ;
- drawdown ;
- coûts ;
- fréquence ;
- stabilité entre fenêtres ;
- sensibilité aux paramètres ;
- temps en position ;
- comportement par régime ;
- différence avec CASH / Hold.

Une stratégie qui gagne sur 2019–2020 mais s'effondre en 2021 est fragile.

Une stratégie qui reste souvent en cash doit être décrite comme telle.

## 11. Stop Gate

Ne pas modifier les paramètres après lecture du holdout pour améliorer rétroactivement le score.

Ne pas publier « stratégie gagnante » sur un seul bloc.

Ne pas mélanger les paires, exchanges ou devises.

Ne pas transformer une corrélation historique en prévision.

Ne pas passer au bot autonome avant la qualité des sources et la reproductibilité.

## 12. Critère de réussite

Cette étude est réussie même si **toutes les stratégies perdent**.

Le succès scientifique est :

- données vérifiées ;
- règles gelées ;
- calcul reproductible ;
- résultats comparables ;
- échecs explicables ;
- limites visibles ;
- pas de fuite du holdout ;
- aucune donnée privée ;
- zéro ordre réel.

**Le Lab doit apprendre avant de chercher à gagner.**
