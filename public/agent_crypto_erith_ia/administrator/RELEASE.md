# Agent-Crypto — News Flow Direction Truth + Role Quality Evidence

Build **40.6.420** · parent **40.6.419** · Market Core **38.15.11**.

## Terrain acquis avant cette version

**40.6.419 AETHER NEWS-SET EXPOSURE GATE = PASS Firefox.**

Le système principal charge d'abord. News Sentinel termine son cycle. Le fil Aether apparaît ensuite déjà alimenté. Cette mécanique est **gelée** et n'est pas modifiée par 40.6.420.

## Audit News Sentinel — P0 prouvé

Le snapshot terrain 40.6.419 montrait deux défauts de vérité opérateur :

1. une storyline ETF positive / inflows pouvait être accompagnée de **ETF / FLUX SORTANTS · OFFRE / VENTE** ;
2. **SOLIDITÉ DE LA LECTURE DU RÔLE** affichait un total (ex. 78/100) alors que ses composantes visibles restaient à `—`.

### Cause 1 — direction de flux

`newsMarketDemandContext()` mettait l'événement sélectionné et tous les événements de contexte dans le même panier, puis `newsMarketBestRawRole()` prenait le meilleur score de preuve.

Donc un article de contexte `outflow` mieux scoré pouvait renverser une storyline sélectionnée `inflow`.

### Cause 2 — composantes de solidité invisibles

Le renderer écrivait dans des IDs hérités `*_40237` alors que le HTML canonique expose `newsMarketRoleQuality_<composante>`.

Le score était calculé, mais sa preuve visuelle n'était pas raccordée.

## Correction 40.6.420

### Flux
- un flux explicite dans **l'événement sélectionné** a priorité ;
- les événements liés ne servent qu'en fallback/contexte ;
- si le contexte contient réellement des flux entrants **et** sortants, aucun gagnant arbitraire n'est choisi :
  **ETF / FLUX MIXTES · INDÉTERMINÉ** ;
- le score de preuve ne peut plus, à lui seul, inverser le sens d'un flux.

### Solidité de lecture
Les sept composantes canoniques sont de nouveau écrites : Preuve source, Sources distinctes, Timestamp, Actif, Mécanisme, Timeline, Marché.

## Non modifié
Collector News Sentinel / Event Core / relevance gate ; Aether 40.6.419 ; Watch / Window Manager / F11 ; Market Core 38.15.11 ; Oracle / LT / Atlas CURRENT ; Strategy / TRADUS / Storage. Aucun nouveau fetch, timer, observer ou stockage. PAPER only · G3 PENDING · G9 LOCKED.

## Terrain Firefox attendu
1. Ctrl+F5 → **Build 40.6.420**.
2. Confirmer que le boot Aether reste celui validé en 40.6.419.
3. Ouvrir News Sentinel / NEWS→MARCHÉ.
4. Une storyline ETF positive ne doit plus être inversée en `FLUX SORTANTS` par un contexte opposé.
5. Si les deux sens sont réellement présents : `FLUX MIXTES · INDÉTERMINÉ`.
6. **SOLIDITÉ DE LA LECTURE DU RÔLE** doit montrer ses composantes et leurs détails.

## Roadmap
- **40.6.421 — Taxonomy Truth**
- **40.6.422 — Storyline Clustering / Diversity**
- **40.6.423 — Criticality vs Operator Relevance**
- **40.6.424 — Langue / présentation**, seulement après la sémantique.

## Stop
Ne pas retoucher le chargement Aether. Une intention : vérité directionnelle + preuve visible.
