# Agent-Crypto 40.6.477 — LECTURE TECHNIQUE INITIAL IMAGE RECOVERY

## Défaut démontré

Sur démarrage replié avec cache visuel froid, Lecture Technique pouvait rester sans image après ouverture.

Cause bornée au contrôleur `atlasTechnicalStaticThemeController` :
- `swapUrl()` pouvait retourner `false` ;
- `apply()` ignorait ce résultat et retournait toujours `true` ;
- `ensureInitialImage()` posait alors `imageReady=true` ;
- l'ouverture ultérieure pouvait ne plus relancer le chargement.

Cas associé : si le panneau s'ouvrait pendant la lecture asynchrone du cache, l'observer rejoignait la Promise déjà démarrée en état replié et aucune seconde tentative n'était garantie.

## Correction

40.6.477 :
1. propage le vrai résultat de `swapUrl()` depuis `apply()` ;
2. ne marque l'image prête que sur succès réel ;
3. si le chargement a commencé replié, a échoué, puis que le panneau s'est ouvert pendant l'attente, effectue une seule reprise avec réseau autorisé ;
4. conserve le réseau différé tant que Lecture Technique reste repliée ;
5. préserve cache chaud, image privée, AUTO, RND et absence de préchargement complet.

## Hors périmètre

Aucun changement Strategy A, Aether, Redivider, Market Core 38.15.11, schéma IndexedDB ou ordre réel.

Le plantage Firefox/Transformer Book observé reste un chantier séparé : aucune causalité n'est affirmée par cette correction.
