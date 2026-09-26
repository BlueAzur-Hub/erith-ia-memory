# Agent-Crypto — Aether News-Set Exposure Gate

Build **40.6.419** · parent **40.6.418** · rollback **40.6.418** (Aether ribbon gate only) · Market Core **38.15.11**.

## Objet

Corriger la causalité de démarrage du fil Aether, sans nouveau placeholder.

Le défaut observé en 40.6.418 est précis :

`market ready → aetherCorePaint() → system/network → News`

Aether devenait donc visible avant que News Sentinel ait fini son cycle initial. Les messages `EN ATTENTE`, `NON DISPONIBLE` ou `News Sentinel non chargée` ne corrigeaient pas le défaut : ils ne faisaient que rendre visible l'absence de données.

## Contrat 40.6.419

Nouvel ordre :

`menu normal → marché/système → News Sentinel → lot News opérateur prêt → exposition Aether`

Règles :
- le code Aether reste résident tôt pour ses API et le Window Manager ;
- le **ruban opérateur Aether reste invisible** pendant `idle/loading` ;
- le menu natif `Relancer / Rafraîchir / Décision / Sources / Chronos` reste visible pendant cette attente ;
- le déclencheur n'est **pas une News unique** : il faut un lot opérateur pluriel, minimum **2 événements qualifiés** ;
- quand le lot est prêt, Aether apparaît déjà rempli et démarre sa cadence existante ;
- une archive précédente/cachée peut être utilisée si le cycle est terminé et que le lot qualifié existe ;
- aucun nouveau texte d'attente n'est présenté dans le ruban opérateur.

## Chirurgie

### `administrator/js/aether.js`
- `aetherMarkMarketReady()` ne peint plus Aether ;
- News reste réveillée par son propriétaire existant ;
- ajout d'un gate `aetherNewsSetReadiness()` / `aetherExposeWhenNewsSetReady()` ;
- `renderAether()`, `renderAetherVeille()` et `aetherCorePaint()` refusent le rendu opérateur avant exposition ;
- le premier rendu survient après règlement du cycle News et constitution d'un lot pluriel.

### `administrator/admin-ribbons.css`
- avant `data-aether-news-set-ready="1"` : menu natif forcé visible, ruban Aether forcé invisible ;
- après le signal : le gate disparaît et **la cadence Aether historique démarre depuis sa première frame** ;
- aucune géométrie, couleur, durée ou animation post-ready n'est modifiée.

## Protections

Inchangés :
- Market Core **38.15.11** ;
- Watch / Window Manager / géométrie / F11 ;
- News collector / Event Core / relevance gate 40.6.418 ;
- Oracle / Lecture Technique / REDIVIDER / Storage ;
- Strategy A métier / thresholds / Cost Gate ;
- PAPER only · G3 PENDING · G9 LOCKED ;
- aucun ordre réel.

Aucun nouveau timer, MutationObserver, stockage ou requête métier.

## Preuve Firefox attendue

1. Ctrl+F5 → **Build 40.6.419**.
2. Observer le header pendant le boot : **menu normal uniquement**, aucun fil Aether vide.
3. Laisser News Sentinel finir son cycle.
4. À la disponibilité du lot qualifié, Aether doit apparaître **déjà rempli de News**.
5. Vérifier ensuite la séquence du fil (plusieurs News) et les contrôles Window Manager/F11.

## Stop

Si Aether apparaît avant le lot News, **40.6.419 = FAIL**. Ne pas remplacer le défaut par un autre message d'attente.
