# SEVEN HEAVEN · Strategy Lab — Protocole pré-enregistré 2024–2025

**Date :** 2026-11-16  
**Statut :** gelé avant lecture des performances de ce bloc  
**Source :** Binance Spot BTC/USDT · 1h · 24/24 mois certifiés  
**Base moteur :** V4.6.2 · PAPER ONLY

## 1. Séparation temporelle

- **Recherche / développement : 2024-01-01 → 2024-12-31**
- **Holdout procédural : 2025-01-01 → 2025-12-31**

Aucun paramètre du premier passage ne doit être choisi à partir des résultats 2025.

Toute règle inventée après lecture de 2025 devient une **nouvelle expérience** et ne peut pas être présentée comme ayant réussi ce holdout.

## 2. Données

Les 24 mois 2024–2025 ont passé le validateur strict :

- CHECKSUM officiel ;
- SHA-256 ;
- continuité horaire ;
- aucun doublon ;
- aucun trou ;
- OHLC cohérents ;
- compte exact de bougies ;
- millisecondes en 2024 ;
- microsecondes en 2025.

Aucune interpolation.

## 3. Hypothèses PAPER fixes

- capital : **10 000 USDT**
- timeframe : **1h**
- frais : **0,10 % par côté**
- glissement : **0,05 % par côté**
- spot long-only
- levier : 1
- signaux sur dernière bougie clôturée
- fill hypothétique à l'ouverture suivante
- inventaire final marqué au dernier close
- aucune liquidation forcée de fin

Le DCA conserve son contrat interface : `1440 minutes`, converti par `observatory.run_one()` en **24 bougies de 1h**.

## 4. Six références du premier passage

1. EMA Cross — paramètres moteur par défaut 10/30 ;
2. Bollinger — période 20, sigma 2 ;
3. DCA — 50 USDT toutes les 1 440 minutes ;
4. Buy & Hold 50 % ;
5. Buy & Hold 100 % ;
6. CASH.

Aucune stratégie personnalisée dans ce premier passage.

## 5. Mesures

Pour 2024 et 2025 séparément :

- rendement net ;
- capital final ;
- drawdown max ;
- frais ;
- fills ;
- cash final ;
- inventaire BTC final ;
- ordres refusés.

Pour chaque modèle, le résultat 2025 est lu comme **vérification**, pas comme matière à régler les paramètres.

## 6. Stress ultérieur

Après le premier passage gelé :

- zéro frais / zéro glissement comme contre-factuel ;
- frais ×2 + glissement ×2 comme stress.

Ces scénarios ne changent pas les règles d'entrée/sortie.

## 7. Interprétation

Le classement ne sera pas réduit au rendement.

Une stratégie sera jugée notamment sur :

- stabilité 2024 → 2025 ;
- drawdown ;
- coûts ;
- fréquence ;
- écart face à CASH ;
- écart face au Buy & Hold ;
- sensibilité aux frictions.

Le meilleur résultat 2024 n'autorise aucune retouche après lecture de 2025.

## 8. Stop Gate

- pas de tuning sur 2025 ;
- pas de sélection rétrospective cachée ;
- pas de nouvelle stratégie avant d'avoir enregistré le premier passage ;
- pas de conclusion « rentable » sur deux années ;
- aucun ordre réel.

**2024 apprend. 2025 vérifie. Les règles sont gelées avant le résultat.**
