# Agent-Crypto — 40.6.433 · STRATEGY A EXECUTION COST TRUTH MOUNT REPAIR

Parent : **40.6.432**.  
Market Core : **38.15.11**.

## Objet unique

Réparer le **montage visible** de `STRATEGY A · EXECUTION COST TRUTH`.

Le dump terrain 40.6.432 a prouvé :
- Build 40.6.432 chargé ;
- Cost-Wait .430 visible ;
- Oracle / Cost Calibration .431 visible ;
- **Execution Cost Truth .432 absent du DOM rendu**.

La mesure Kraken / OKX n'était donc pas testable par l'opérateur.

## Correction

Le propriétaire reste :

`js/strategy-a-execution-cost-truth.js`

Le panneau ne dépend plus uniquement des panneaux lazy .430/.431. Il peut maintenant s'ancrer sur, par ordre de préférence :

1. Oracle / Cost Calibration .431 ;
2. Cost-Wait .430 ;
3. Durable Evidence ;
4. Experiment Ledger ;
5. le corps stable de la console Strategy A.

Le montage est relancé de façon événementielle quand :
- la page est prête ;
- Durable Evidence devient disponible ;
- un cycle Strategy A arrive ;
- **Simulation est ouverte** ;
- le post-boot est terminé ;
- Firefox restaure la page.

Aucun timer récurrent et aucun MutationObserver ne sont ajoutés.

## Ce qui ne change pas

- endpoints Kraken / OKX : inchangés ;
- profils de frais : inchangés ;
- spread / profondeur / glissement : mêmes calculs ;
- Cost Gate : inchangé ;
- Oracle / bullAmplitude : inchangé ;
- Risk : inchangé ;
- Paper : inchangé ;
- Market Core 38.15.11 : inchangé ;
- Aether : inchangé ;
- CSS cockpit : inchangé ;
- aucun wallet ;
- aucune clé API ;
- aucun ordre réel.

## Test Firefox

1. Ctrl+F5.
2. Vérifier **Build 40.6.433**.
3. Ouvrir **Simulation / Strategy A**.
4. Le panneau **STRATEGY A · EXECUTION COST TRUTH · 40.6.433** doit être visible.
5. Cliquer **MESURER KRAKEN + OKX**.
6. Envoyer la capture et, si disponible, l'export JSON.

**Pas de recherche dans la page. Pas de console.**

Terrain : **PENDING FIREFOX**.
