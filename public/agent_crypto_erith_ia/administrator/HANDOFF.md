# Handoff — 40.6.430

Parent fonctionnel : **40.6.429**.

Objet unique : réparer la nomenclature du nouveau module Cost-Wait sans modifier son métier.

## Canonique

`js/strategy-a-cost-wait-outcome-audit.js`

## Retiré

`js/strategy-a-cost-wait-outcome-audit-406429.js`

Le loader secondaire référence uniquement le nom canonique, sans `?v=`.

La dette `?v=40.6.429` introduite par .429 sur `style.css`, `app.js` et `post-boot-runtime-loader.js` est également retirée. Les query strings historiques extérieures à cette livraison ne sont pas traitées ici.

Aucun seuil, Oracle, Risk, Paper, Market Core 38.15.11, Aether ou CSS cockpit n'est modifié.

Test : Ctrl+F5 → Build 40.6.430 → Simulation / Strategy A → panneau Cost-Wait → self-test PASS.
