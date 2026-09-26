# Agent-Crypto — Decision Board Continuity Recovery

Build **40.6.414** · parent **40.6.413** · rollback sain **40.6.407** · Market Core **38.15.11**.

## Pourquoi 40.6.414

La séquence .412/.413 a montré deux choses distinctes :

- le regroupement Decision Board de **40.6.412** réduisait fortement les rendus redondants observés au boot ;
- **40.6.413** a réintroduit ces rendus en liant par erreur l'activation du garde à un numéro de build précis.

La première .414 présente sur main réparait partiellement cette continuité, mais la livraison restait mélangée : HTML/manifeste .413, chargeur .414, sonde .414 non raccordée et rapport susceptible d'être écrasé.

## Finalisation 40.6.414

Une seule intention : **préserver le regroupement .412 et rendre son état + sa preuve fiables**.

Corrections :

1. **Activation stable** — le propriétaire Decision Board active le coalescing parce qu'il est résident, sans dépendre du numéro commercial `40.6.x`.
2. **Signature fidèle** — la santé compacte des sources et le total attendu participent à la déduplication ; OK → ERROR → OK invalide donc la peinture.
3. **Strategy truth** — `agent-crypto:strategy-core-ready` avec `detail.ok:false` reste un échec. Le fallback postboot peut afficher un état informatif sans transformer l'échec en READY.
4. **Mesures fidèles** — null / undefined / chaîne vide = **non mesuré** ; un vrai zéro reste 0 ms.
5. **Timer raccordé** — la sonde lit le contrat réellement produit `postboot-schedule-406412` / `postboot-schedule-fired-406412`.
6. **Rapport composé** — la sonde de continuité .414 possède sa propre API et n'écrase plus la sonde chirurgicale .413. Les deux blocs sont ajoutés au même rapport.
7. **Vérité de release** — `index.html`, `build.json`, tokens des ressources modifiées et snapshot immuable décrivent tous **40.6.414**.

## Ce qui ne change pas

- Market Core **38.15.11** ;
- Atlas / CURRENT métier et N+1 ;
- Strategy A métier, Gates et Paper ;
- Aether métier / géométrie ;
- Oracle / Math / Lecture Technique ;
- Storage métier ;
- Window Manager / F11 ;
- aucune requête métier ajoutée ;
- aucun nouveau timer récurrent ;
- aucun ordre réel.

## Diagnostic Atlas

La restauration d'un CURRENT puis un **nouveau CURRENT fermé** sur un snapshot N+1 n'est pas une preuve d'un double démarrage du même cycle. Aucune chirurgie Atlas n'est incluse dans .414.

## Validation statique

La release est cohérente lorsque :

- entrée + manifeste = 40.6.414 ;
- app + postboot modifiés chargés avec token 40.6.414 ;
- sonde .413 complète conservée ;
- sonde .414 raccordée séparément ;
- aucune dépendance au regex de version pour le gate ;
- source health incluse dans la signature ;
- Strategy FAILED visible comme FAILED ;
- absence de mesure affichée « non mesuré ».

## Test Firefox terrain — requis avant PASS

1. Ctrl+F5.
2. Confirmer **Build 40.6.414 · Administrator**.
3. Utiliser souris / scroll / cockpit normalement.
4. Attendre Consultation / Strategy / Postboot.
5. Rapport de démarrage → **Actualiser** → **Copier**.
6. Vérifier :
   - `DECISION BOARD CONTINUITY · 40.6.414` → `active YES`;
   - `deferred` augmente pendant le boot puis un flush utile a lieu ;
   - `errors 0`;
   - le bloc **SURGICAL BOOT PROBE · 40.6.413** est toujours présent ;
   - **POSTBOOT TIMER** est présent ;
   - les valeurs absentes disent **non mesuré**, jamais faux `0 ms`;
   - un échec Strategy éventuel reste **FAILED** ;
   - source OK → ERROR → OK rafraîchit le Decision Board.

## Stop point

**Statique / publication peuvent être vérifiées par GitHub. PASS performance reste PENDING jusqu'au terrain Firefox opérateur.**

Si les gels cycliques persistent après cette .414, l'intervention suivante doit mesurer d'abord les propriétaires Atlas/CURRENT et les réveils Aether externes avec identités de cycle. Ne pas retoucher les cinq modules secondaires déjà innocentés sans nouvelle preuve.
