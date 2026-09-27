# Handoff Seven — 40.6.431 · Strategy A Oracle / Cost Calibration Truth

## État de clôture

Build courant : **40.6.431**.  
Market Core : **38.15.11**.  
Parent : **40.6.430**.

CSS cockpit .428/.430 : protégé.  
Aether / News : protégé.  
Strategy A : **aucune règle métier modifiée**.

## Ce qui a été découvert

Strategy A ne produit toujours pas de vrai Paper autonome démontré. Le goulot dominant est le Cost Gate.

Le coût courant **0,60 %** n'est pas une mesure vérifiée des coûts réels d'une plateforme. Il provient des champs Simulation / fallback pédagogique :

- 0,25 % achat ;
- 0,05 % impact entrée ;
- 0,25 % vente ;
- 0,05 % impact sortie.

Le seuil courant reste **0,80 % = max(0,80 %, 0,60 % + 0,20 %)**.

La valeur appelée `expected_move_pct` par Strategy A est en réalité `atlasOracleBuildModel(BTC).bullAmplitude`, c'est-à-dire une enveloppe de scénario déterministe, pas un rendement attendu calibré.

## Version 40.6.431

Ajoute seulement :

`js/strategy-a-oracle-cost-calibration-audit.js`

Le panneau croise :

- coût modélisé ;
- seuil ;
- enveloppe Oracle médiane ;
- MFE médiane observée ;
- couverture T+60 ;
- écart MFE − enveloppe.

Aucun fetch, timer récurrent, observer, stockage ou ordre.

## Prochain D

1. Firefox Ctrl+F5 et valider le panneau .431.
2. Exporter le Cost-Wait Audit et, si utile, l'Oracle / Cost Calibration Truth.
3. Ne pas baisser arbitrairement 0,80 %.
4. Prochaine étude : **coût réel vérifiable vs modèle pédagogique**, puis **calibration bullAmplitude ↔ MFE**.
5. Ne toucher aux seuils que sur preuve Paper mesurable.

## Règle de reprise

Une intention → un propriétaire → une modification → une preuve → STOP.

Git porte les versions ; les noms de fichiers portent les responsabilités.
