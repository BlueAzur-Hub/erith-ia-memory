# Agent-Crypto 40.6.446 — STRATEGY A DEMAND LOADER OWNER FIX

## Objectif unique
Réparer le déclenchement on-demand des audits Strategy A / Execution Cost dans Simulation.

## Cause prouvée
Le DOM canonique est :
```html
<details data-collapse-key="simulation">
  ...
  <section id="simulation">...</section>
</details>
```

Le loader 40.6.443 testait l'événement `toggle` et la propriété `.open` sur `#simulation`, qui est une `<section>`, pas le `<details>` ouvrable.

## Correction 40.6.446
Le propriétaire d'ouverture devient exclusivement :
```
details[data-collapse-key="simulation"]
```

Deux chemins testés localement avant commit :
- Simulation fermée puis ouverte : PASS, 3/3 modules chargés dans l'ordre.
- Simulation déjà ouverte au chargement du loader : PASS, 3/3 modules chargés dans l'ordre.

Ordre attendu :
1. COST-WAIT OUTCOME AUDIT
2. ORACLE / COST CALIBRATION TRUTH
3. EXECUTION COST TRUTH

## Protégé
Backend/API 40.6.441 · cadrage Graphique 40.6.442 · Oracle metrics 40.6.445 · Strategy A métier / seuils · Market Core 38.15.11 · Aether · stockage · timers / observers.
