# Seven Heaven — R10.1 · Coffre historique · stabilisation du défilement

Date : 2026-10-08 · État : correctif limité au Coffre historique, essai utilisateur Firefox F11 encore requis.

## Symptôme observé

Dans `administrator/historical-vault.html`, le lecteur R9 charge correctement BTCUSDT aux périodes 24h / 5 min (312), 7 jours / 1h (170), 30 jours / 4h (180) avec vérification SHA-256/OHLCV, mais le changement de période fait sauter la position de défilement de la page selon l'utilisateur.

## Cause de reflow trouvée dans le code

À chaque lecture R9, le code HTML existant remplace provisoirement le tableau à sept lignes (entête et six bougies) par le texte court `Vérification SHA-256…`, puis réinsère le tableau. La hauteur du conteneur diminue puis réaugmente ; Firefox peut recaler son ancre de défilement. L'hypothèse doit encore être confirmée par Firefox.

## Correction minimale

Modifier **seulement** `administrator/js/historical-vault-automatic.js` : avant un changement automatique R9 et avant le gestionnaire de clic manuel R9, mesurer la hauteur du tableau déjà rendu. Tant que les six bougies sont remplacées par le message de chargement, imposer cette hauteur minimale au conteneur `r9-table` et désactiver uniquement son ancrage de défilement (`overflow-anchor: none`). Lors du prochain changement, la hauteur mesurée est réajustée ; ne pas réserver de hauteur arbitraire avant la toute première lecture. Ne jamais appeler `window.scrollTo`.

Aucun changement de lecture OHLCV, de fetch, des boutons R6/R7, de devises ou de stockage. Le fichier et les noms des fonctions de production restent stables (sans numéro de build).

## Validation technique

`node --check administrator/js/historical-vault-automatic.js` : PASS.
`node --test tools/historical-vault-automatic.test.mjs` : 4/4 PASS, dont garde de hauteur avant changement et clic manuel, chargement lazy, R6/R7 et erreur récupérable sans lecteur compact.

## Vérification utilisateur encore nécessaire

Ouvrir le Coffre historique sur Firefox F11, déplier R9 BTC, passer 24h → 7j → 30j. Observer que la page **ne saute plus**, et que le nouveau bloc SHA-256/OHLCV apparaît normalement. La simple réussite des tests Node ne constitue pas une preuve Firefox.

Protections : Administrator 40.6.624, Market Core 38.15.11, Graphique Ligne/Bougies, Top 5, Trader, Bridge, Backend, IndexedDB, données R2/R4/R8/R9 immuables et workflow R10 inchangés. Contrôle `schedule` horaire toujours distinct et non confirmé.
