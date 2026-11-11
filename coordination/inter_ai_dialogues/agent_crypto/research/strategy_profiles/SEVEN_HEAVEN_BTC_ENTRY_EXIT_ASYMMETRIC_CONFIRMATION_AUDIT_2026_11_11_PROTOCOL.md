# Seven Heaven — protocole de comparaison confirmation entrée / sortie

**Date : 11 novembre 2026 · avant exécution du nouveau calcul.**

**Question:** un retard de confirmation est-il plus coûteux à l'entrée (achat BTC) ou à la sortie (vente BTC), séparément pour les règles EMA10/30, SuperTrend ATR14×3 et consensus 2/3 EMA/MACD/ADX ?

**Plan fixé avant lecture des résultats de cette variante :** comparer, pour chaque indicateur, les 9 combinaisons de confirmation `(clôtures d'entrée, clôtures de sortie)` du produit `{1,2,3} × {1,2,3}`. Les deux cas principaux pré-déclarés sont entrée rapide/sortie lente **(1,3)** et entrée lente/sortie rapide **(3,1)**. Références : (1,1), (2,2), (3,3), Buy & Hold BTC.

**Données:** 2023-04 à 2023-06 (avril chauffage 30 jours; mai–juin PAPER), 2024-01 à 2024-03 (janvier chauffage 31 jours; février–mars PAPER), 2025 identique; 2026-01 à 2026-10 (janvier chauffage 31 jours; février–octobre PAPER). Tous les ZIP 1m doivent satisfaire les SHA-256 des registres publiés, la continuité de leurs minutes et l'agrégation des OHLC journaliers.

**Portefeuille:** 1 000 USDT fictifs initialement en liquidités; état BTC ou cash, pas de levier, aucune transaction de grille. Signal calculé à la clôture UTC de D et ordre hypothétique à l'ouverture UTC de D+1; frais 0,10 % et glissement 0,05 % par côté, puis contrôle de coûts ×2; valorisation liquidable chaque fin de journée.

**Calculs:** rendement net total, drawdown quotidien, nombre d'achats et ventes, exposition, cash, whipsaws de cash ≤7 jours, journées de retard des premières sorties/entrées après changement de signal brut, et prix BTC entre les dates d'exécution de la référence (1,1) et une politique alternative, seulement quand les événements correspondent. Des trajectoires divergentes ne sont pas confondues avec des paires comparables.

**Contrôles:** restauration exacte des résultats symétriques C1/C2/C3 antérieurs; tests de causalité préfixe/série complète; livre BTC/cash recoupé; pas de sélection du meilleur réglage d'après l'échantillon.

**Portée scientifique:** les quatre fenêtres **ont déjà été utilisées dans l'exploration du laboratoire**. Ce test mesure une sensibilité supplémentaire et n'est **pas** une validation statistique indépendante, y compris pour 2023 (désormais connue). Binance BTCUSDT et hypothèses de remplissage au cours d'ouverture, non OKX BTCUSDC. Aucune recommandation, aucun ordre.
