# Agent-Crypto — Residency Pipeline Diagnostic

Build **40.6.408** · parent / rollback **40.6.407** · Market Core **38.15.11**.

## Nature

Version **diagnostique uniquement**.

Aucun changement :
- ordre des modules ;
- valeurs de pause / yield du scheduler ;
- Strategy A métier, seuils, Cost Gate, Risk Governor, Paper ;
- Auto A / autostart ;
- découplage Simulation / Evidence ;
- résumé léger des 9 Gates ;
- Market Core, Math, Aether, Oracle, Lecture Technique, REDIVIDER, Storage.

Aucun ordre réel.

## Sonde

`post-boot-runtime-loader.js` mesure maintenant pour chaque module Strategy Core et Postboot :

- `queue_wait_ms` : cycle-start → load-start ;
- `yield_wait_ms` : durée réelle du `yieldMain()` ;
- `sleep_wait_ms` : durée réelle de la pause demandée ;
- `resource_fetch_ms` : Resource Timing requestStart/fetchStart → responseEnd ;
- `eval_load_event_ms` : responseEnd → événement load du script ;
- transfer/encoded/decoded size ;
- nextHopProtocol ;
- cache hint ;
- chevauchement Long Task si l'API navigateur est disponible.

Le Rapport de démarrage ajoute :

**RESIDENCY PIPELINE DIAGNOSTIC · 40.6.408**

## Test Firefox

1. Ctrl+F5.
2. Vérifier **Build 40.6.408 · Administrator**.
3. Ne pas ouvrir Simulation, Evidence ou GitHub Memory pendant le premier boot.
4. Utiliser normalement souris / scroll / cockpit.
5. Laisser le cockpit se stabiliser.
6. Ouvrir **Rapport de démarrage → Actualiser → Copier**.
7. Envoyer :
   - RESIDENCY PIPELINE DIAGNOSTIC ;
   - POSTBOOT MODULE COST TRACE ;
   - TOP MARK GAPS ;
   - READINESS EVENT TRACE.

**STOP : ne corriger aucun owner avant lecture de cette preuve.**
