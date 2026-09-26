# Agent-Crypto — Aether Progressive Readiness + News Relevance Gate

Build **40.6.418** · parent **40.6.417** · rollback **40.6.417** · Market Core **38.15.11**.

## But

Corriger les deux défauts terrain restants de 40.6.417 sans reconstruire l'architecture :

1. le Watch existe tôt mais montre des cartes vides avant l'arrivée des couches ;
2. News Sentinel confond encore parfois **qualité de source** et **pertinence marché**.

## Aether · hydratation progressive

Le propriétaire reste `administrator/js/aether.js`.

La fenêtre, le Window Manager, la géométrie, F11, déplacer/réduire/détacher/agrandir/masquer ne changent pas.

Au lieu de `—` silencieux, le shell affiche immédiatement des états explicites :
- `SHELL READY` ;
- Marché / News / Atlas / Oracle : `EN ATTENTE` ;
- hydratation progressive ;
- puis le rendu canonique existant remplace ces placeholders dès que les vraies données sont disponibles.

Aucun fetch, timer, observer ou stockage n'est ajouté par cette readiness.

## News · relevance gate

Le producteur canonique reste `tools/atlas_news_collector.py`.

40.6.418 sépare désormais :
- **preuve / qualité de source** ;
- **impact potentiel** ;
- **pertinence opérateur pour le marché**.

Un article peut rester dans l'archive tout en étant marqué `archive_context_only`.

Régressions verrouillées :
- hack FBI sans ancrage crypto/marché → non prioritaire opérateur ;
- avis administratif Fed / Peoples Bancorp sans mécanisme macro → non prioritaire opérateur ;
- incidents crypto réels (Bitget, bridge exploit, wallets, etc.) restent éligibles ;
- regroupement Event Core 40.6.417 conservé.

Le tri privilégie d'abord les événements éligibles au lane opérateur. Les compteurs critique/fort du résumé utilisent cette même population éligible.

## Protections

Inchangés :
- Market Core **38.15.11** ;
- Window Manager `aether-watch` ;
- géométrie et F11 ;
- Oracle / Lecture Technique / REDIVIDER / Storage ;
- Strategy A métier / thresholds / Cost Gate ;
- PAPER only, G3 PENDING, G9 LOCKED ;
- aucun ordre réel.

## Preuve terrain attendue

1. Ctrl+F5 → **Build 40.6.418**.
2. Ouvrir Aether tôt : aucune grille muette ; états `EN ATTENTE` visibles immédiatement.
3. Laisser le runtime converger : Binance 5/5, News, Atlas CURRENT, Oracle.
4. Vérifier tous les contrôles Window Manager et F11.
5. Ouvrir News Sentinel : les événements génériques sans ancrage marché ne doivent plus dominer la priorité.
6. Copier le Rapport de démarrage seulement pour comparer les temps ; il n'est plus nécessaire de reprover 40.6.417.

## Stop point

Si le Watch régresse en géométrie/Window Manager : rollback 40.6.417.

Si le relevance gate dégrade un événement crypto réellement pertinent : corriger uniquement le producteur News / gate ; ne pas toucher au Watch.
