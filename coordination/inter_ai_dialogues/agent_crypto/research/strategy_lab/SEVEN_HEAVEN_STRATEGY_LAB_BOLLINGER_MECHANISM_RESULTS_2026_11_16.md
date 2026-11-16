# SEVEN HEAVEN · Strategy Lab — Diagnostic du mécanisme Bollinger 20/2 · 2024–2025

**Date UTC :** 2026-11-16  
**Statut :** étude pré-enregistrée terminée  
**Source :** Binance Spot BTC/USDT · 1h · 24/24 mois 2024–2025 certifiés  
**Fenêtres actives :** 23 mois indépendants, février 2024 → décembre 2025  
**Warmup :** 720 h par mois, zéro fill pendant le préchauffage  
**Paramètres :** Bollinger 20 périodes · 2 sigma · 10 000 USDT · frais 0,10 %/côté · glissement 0,05 %/côté  
**Mode :** PAPER ONLY · zéro ordre réel · aucun tuning

## Résultat central

Sur les 23 mois :

- **13 mois** restent positifs après friction ;
- **9 mois** sont déjà négatifs même à zéro friction ;
- **1 mois**, mai 2025, est un véritable **friction flip** : positif sans friction, négatif après coûts.

La perte moyenne imputable aux frictions est de **2,67 points de rendement par mois**.

Activité moyenne :

- **17,48 fills/mois** ;
- **175,86 USDT de frais/mois**.

## Corrélations descriptives

- fills ↔ perte de friction : **0,9726**
- frais ↔ perte de friction : **0,9922**
- volatilité réalisée ↔ largeur de bande à l'achat : **0,6153**
- largeur de bande à l'achat ↔ rendement net : **-0,4316**

## Lecture

### 1. Les coûts suivent presque mécaniquement l'activité

Les deux relations les plus fortes sont :

- plus Bollinger déclenche de fills, plus l'écart entre zéro friction et net augmente ;
- plus les frais payés augmentent, plus cet écart augmente.

Ce résultat confirme que la suractivité est un problème réel de la configuration 20/2.

### 2. Mais les coûts ne sont pas la cause unique des mois perdants

Mois négatifs même sans friction :

- 2024-04
- 2024-07
- 2024-08
- 2024-12
- 2025-02
- 2025-03
- 2025-08
- 2025-10
- 2025-11

Ces neuf mois échouent déjà au niveau du signal. Supprimer les frais ne les transforme pas en succès.

### 3. Un seul mois bascule uniquement à cause des frictions

- **2025-05**

C'est le seul mois où le signal brut reste positif mais où les coûts font passer le rendement net sous zéro.

### 4. Treize mois survivent aux coûts

- 2024-02
- 2024-03
- 2024-05
- 2024-06
- 2024-09
- 2024-10
- 2024-11
- 2025-01
- 2025-04
- 2025-06
- 2025-07
- 2025-09
- 2025-12

### 5. La largeur de bande suit partiellement la volatilité

Corrélation volatilité ↔ largeur des bandes à l'achat : **0,615**.

C'est cohérent avec la mécanique de Bollinger : une volatilité plus élevée tend à élargir les bandes.

En revanche, une bande plus large n'est pas associée ici à un meilleur rendement. La corrélation largeur ↔ rendement net est **-0,432**.

Ce résultat est descriptif et ne justifie pas encore un filtre de largeur de bande.

## Exemple utile : décembre 2025

Malgré un marché mensuel négatif d'environ **-3,00 %**, Bollinger termine à **+0,66 % net** :

- zéro friction : +4,20 %
- friction drag : 3,53 points
- 23 fills
- 227,16 USDT de frais
- 11 positions clôturées
- durée moyenne : 30,27 h
- temps en position : 45,83 %

Cela montre qu'un mois baissier n'implique pas automatiquement l'échec de Bollinger.

## Nuance avec le résultat annuel 2025

Sur l'année 2025 continue :

- Bollinger zéro friction : **+5,05 %**
- Bollinger net : **-22,06 %**

La friction est donc décisive sur la trajectoire annuelle continue.

Mais les expériences mensuelles à capital remis à zéro montrent simultanément que plusieurs sous-périodes sont déjà mauvaises sans friction.

Ces deux résultats ne se contredisent pas : ils répondent à deux questions différentes et ne doivent pas être additionnés artificiellement.

## Conclusion

Bollinger 20/2 souffre de **deux mécanismes distincts** :

1. **suractivité / coûts**, très fortement mesurables ;
2. **mauvais signaux sur certains régimes**, présents même sans friction.

La prochaine étude ne doit donc pas être un tuning de sigma ou de période.

Elle doit disséquer les **trades eux-mêmes** :

- durée gagnants vs perdants ;
- largeur de bande à l'entrée ;
- profondeur sous la bande inférieure à l'entrée ;
- largeur de bande à la sortie ;
- rendement par round-trip ;
- relation durée ↔ résultat ;
- comparaison 2024 / 2025.

Aucune de ces mesures ne servira encore de filtre.

**Comprendre le trade avant de modifier la règle.**
