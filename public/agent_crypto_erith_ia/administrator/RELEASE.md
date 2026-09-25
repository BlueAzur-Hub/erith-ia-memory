# Agent-Crypto — Recovery Candidate

Build interne : **40.6.399**
Parent : **40.6.398**
Checkpoint scheduler : **40.6.369**
Market Core : **38.15.11 — inchangé**

## Changement fonctionnel unique
Owner actif : `administrator/js/post-boot-runtime-loader.js`

Le diff 40.6.369 → 40.6.398 prouve que 40.6.397 ajoute le hook `pointermove` échantillonné à 120 ms qui réarme la fenêtre de calme de 1400 ms. Le terrain 40.6.398 exigeait alors l’immobilité pour progresser correctement.

Ce candidat :
- restaure le payload scheduler du checkpoint 40.6.369 ;
- retire uniquement le hook `pointermove` 40.6.397 ;
- conserve la fenêtre 1400 ms et les listes de modules ;
- canonicalise le nom permanent en `post-boot-runtime-loader.js`.

Aucun changement Strategy métier, Strategy Evidence loader, Market Core 38.15.11, Math Core, Aether, Oracle, Lecture Technique, REDIVIDER, Storage, Window Manager, timer récurrent, observer ou réseau métier.

## Gate Firefox
Ctrl+F5 → Build 40.6.399 → utiliser souris/scroll/clics normalement pendant le chargement.
Toute fonction validée perdue = REJET / STOP.
Terrain : **PENDING_FIREFOX**.
