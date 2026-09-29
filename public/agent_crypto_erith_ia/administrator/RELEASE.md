# Agent-Crypto 40.6.463 — STRATEGY A EXECUTION COST EVIDENCE CAPTURE

## Objet unique
Armer la capture de preuve de coûts d'exécution pour les **futurs PAPER** sans toucher aux quatre dossiers historiques incomplets révélés par 40.6.462.

## Pourquoi la version ne remplit pas encore after-cost
40.6.462 a prouvé que les quatre anciens dossiers manquent `spread_eur` et `slippage_eur`.
Les valeurs actuelles ne peuvent pas être réinjectées rétroactivement : elles ne sont pas contemporaines des exécutions historiques.
De plus, avant d'ajouter spread/slippage au calcul comptable, il faut prouver que le moteur PAPER calcule le net selon exactement la même sémantique afin de ne pas créer un faux mismatch.

## Capture 40.6.463
Le Strategy Core charge l'owner existant **Execution Cost Truth 40.6.459**, puis le nouveau capture owner enveloppe Auto Lifecycle **avant l'autostart**.

Pour chaque futur PAPER :
- ouverture → mesure Kraken BTC/EUR bornée ;
- fermeture → seconde mesure Kraken BTC/EUR bornée ;
- conservation du top-of-book, spread et simulation exacte de carnet lorsqu'un montant 10 / 25 / 50 / 100 € correspond exactement ;
- si une preuve manque ou si une mesure est déjà occupée, l'état reste explicite au lieu d'inventer une valeur ;
- la preuve est projetée dans l'état PAPER durable existant.

## Persistance
Aucun nouveau store IndexedDB.
Le fingerprint PAPER de Durable Evidence inclut désormais la révision/état de la capture afin qu'une mise à jour asynchrone d'évidence soit persistée dans le store PAPER existant.

## Garde-fous
- aucun backfill historique ;
- aucune injection dans after-cost en 40.6.463 ;
- aucun seuil Strategy A modifié ;
- aucun ordre réel ;
- aucun timer récurrent / MutationObserver ;
- aucun nouvel endpoint : réutilisation de l'owner Execution Cost Truth ;
- Market Core 38.15.11 intact.
