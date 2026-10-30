# HANDOFF 40.6.419 — AETHER NEWS-SET EXPOSURE GATE

Date : 26/09/2026  
Parent : 40.6.418  
Market Core : 38.15.11

## Cause prouvée

Le runtime appelait `aetherCorePaint()` dans `aetherMarkMarketReady()` avant `aetherScheduleNews()`. En parallèle, `admin-ribbons.css` démarrait sa cadence Aether dès le chargement de page. Le ruban pouvait donc remplacer le menu natif alors que News Sentinel était encore `idle/loading`.

## Correction

- suppression du paint Aether depuis `aetherMarkMarketReady()` ;
- News se charge par le propriétaire existant ;
- `aetherNewsSetReadiness()` exige un cycle réglé + un lot opérateur pluriel (>=2 événements qualifiés) ;
- `aetherExposeWhenNewsSetReady()` est le gate unique d'exposition automatique ;
- CSS bloque la cadence Aether et maintient le menu natif jusqu'à `data-aether-news-set-ready="1"` ;
- après readiness, la cadence historique part de sa première frame.

## Non modifié

Watch, Window Manager, géométrie, F11, News collector, relevance gate, Market Core, Oracle, Lecture Technique, Strategy A, Storage.

## Verdict attendu

PASS seulement si aucun ruban Aether vide/attente n'est visible au boot et si Aether apparaît ensuite déjà alimenté par plusieurs News.
