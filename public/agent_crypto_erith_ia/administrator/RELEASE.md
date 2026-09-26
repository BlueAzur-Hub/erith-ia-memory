# Agent-Crypto — Aether Contract Freeze + News Event Core Foundation

Build **40.6.417** · parent **40.6.415** · rollback **40.6.415** · Market Core **38.15.11**.

## But

Commencer la refonte News Sentinel / Aether VEILLE **sans toucher à Aether Attention Watch**.

40.6.415 reste le checkpoint Firefox validé pour le Watch, son menu natif, le Window Manager et le cockpit.

## Aether Watch — GEL ABSOLU

Cette build ne modifie pas :
- `js/aether.js` ;
- `#atlasAetherStatusPanel` ;
- le Window Manager `aether-watch` ;
- déplacer / réduire / détacher-raccrocher / agrandir / masquer ;
- géométrie, placement gauche, F11, restauration ;
- rendu du Watch.

Le défaut 40.6.416 n'est pas réintroduit.

## News Event Core 40.6.417

Le producteur canonique `tools/atlas_news_collector.py` reçoit un contrat additif :

**un événement réel = une histoire opérateur ; plusieurs articles = confirmations.**

Champs additifs :
- `event_core_build` / `event_core_schema` ;
- `canonical_topic` ;
- `article_ids` / `article_count` ;
- `cluster_reason` ;
- `source_tier` / `source_tier_label` ;
- `operator_relevance` ;
- `market_reaction` explicitement `not_measured` tant qu'aucune réaction n'est calculée.

## Déduplication

Les règles historiques restent disponibles : URL identique et similarité de titre.

Une fondation supplémentaire est ajoutée pour les incidents `security` / `bankruptcy` : dans une fenêtre bornée, des titres différents partageant une même entité significative peuvent être regroupés. Cela vise notamment les multiples articles décrivant le même incident Bitget.

Le cluster conserve les articles et les sources ; il ne les efface pas.

## Faux positif Hack VC

`Hack VC` est désormais protégé comme nom d'entité de venture capital. Le mot `Hack` dans cette expression ne suffit plus à classer l'article comme cyberattaque.

## Scores séparés

`operator_relevance` est ajouté comme dimension descriptive distincte. Les scores `evidence`, `impact`, `market_reaction` et pertinence opérateur ne sont pas fusionnés en une causalité.

Le tri de production existant n'est **pas encore remplacé** dans cette foundation build.

## Français / sources

Cette build ne modifie ni :
- Google News FR ;
- le contrat français natif 40.4.291 ;
- la politique `[EN]` de fallback ;
- les sources configurées.

Ces sujets restent pour la phase suivante après validation de l'Event Core.

## CI

Le workflow News Sentinel vérifie après collecte :
- schema `atlas_news_event_core_v1` ;
- build Event Core `40.6.417` ;
- présence des identifiants/articles ;
- absence du faux classement `Hack VC` → `security`.

## Test Firefox

1. Ctrl+F5 et confirmer **Build 40.6.417**.
2. Ouvrir Aether Attention Watch.
3. Vérifier les cinq contrôles Window Manager.
4. Vérifier Market Core 38.15.11, Binance, Graphique, Math, Atlas, Oracle, Strategy.
5. Après le prochain refresh News Sentinel, vérifier la réduction des doublons d'un même incident.

## Stop point

Si Aether Watch ou son menu régresse : rollback immédiat 40.6.415.

Si le Watch reste intact mais Event Core ne regroupe pas correctement les événements : corriger uniquement le producteur News, sans toucher au Watch.

## Archive semantic refresh

The collector now recomputes deterministic derived semantics when carrying the previous archive forward. A stale historical classification (for example `Hack VC` previously stored as security/critical) cannot survive merely because it already existed in `latest.json`. Immutable source text and evidence provenance remain untouched.

