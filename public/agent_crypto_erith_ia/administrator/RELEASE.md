# Agent-Crypto 40.6.479 — STRATEGY A INPUT FRESHNESS TRUTH + ATLAS UPSTREAM DIAGNOSIS

## Checkpoint sécurisé

40.6.478 est gelée comme checkpoint fonctionnel :
- 1 dossier prospectif réel ;
- OKX T0 capturé ;
- T+5, T+15 et T+60 CAPTURED ;
- 0 fenêtre manquée ;
- cycle `A-CYCLE-00029-405f73c5`.

La garde d'immuabilité post-terminale reste prouvée par harness. Le terrain n'a pas encore observé directement les écritures IndexedDB post-clôture.

## 40.6.479

Ajoute un panneau read-only **STRATEGY A · INPUT FRESHNESS TRUTH**.

Il sépare :
- les champs réellement capturés dans le cycle Strategy ;
- le contexte Atlas CURRENT visible ;
- la mesure Execution Cost de preuve ;
- le contexte News.

Pour chaque entrée : rôle, valeur, horodatage disponible, âge, fraîcheur et limite de preuve.

UNKNOWN reste UNKNOWN : si un upstream n'expose pas son propre timestamp dans la ligne de cycle, 40.6.479 ne l'invente pas.

## Diagnostic Atlas

Le producteur public Crypto canonique est DEGRADED :
- latest valide : 2026-09-29T05:38:03.339Z ;
- dernier essai observé : 2026-09-29T23:46:38Z ;
- erreur : HTTP 403 CoinGecko ;
- dernier snapshot valide préservé.

Le collecteur Top-50 indépendant est également en HTTP 403. La stagnation du CURRENT Atlas est donc expliquée par l'upstream CoinGecko, pas par un scheduler Atlas arrêté.

## Invariants

Aucun seuil, gate, calcul Oracle, décision Strategy, modèle de coûts, Market Core, wallet ou ordre réel modifié.
