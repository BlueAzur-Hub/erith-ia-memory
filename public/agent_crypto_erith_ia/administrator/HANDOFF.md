# Agent-Crypto — Handoff

Build **40.6.413** · parent **40.6.412** · rollback **40.6.407**.

## Mission

Séparer le vrai coût JavaScript du simple temps d'attente pour les cinq plus gros modules secondaires observés en 40.6.412.

## Cibles

1. `analysis-aux-demand-loader.js`
2. `market-reading-depth.js`
3. `layout-repair.js`
4. `admin-theme-glass.js`
5. `market-stack.js`

## Mesure

Pour chaque fichier :

`responseEnd → eval-enter → eval-exit → load-event`

Cela distingue :
- réseau / revalidation ;
- attente avant exécution ;
- JavaScript réellement exécuté ;
- délai de dispatch du `load`.

## Protections

- Decision Board 40.6.412 conservé ;
- Market Core 38.15.11 protégé ;
- Strategy / Aether / Oracle / Math / Lecture Technique protégés ;
- aucun changement métier ;
- aucun nouveau stockage, fetch métier, observer ou ordre.

## Prochaine décision

- si un module possède une **eval réelle lourde**, 40.6.414 corrigera uniquement ce propriétaire ;
- si l'eval est courte mais l'attente longue, 40.6.414 visera le propriétaire de contention, pas le petit fichier victime.

**STOP après le rapport Firefox 40.6.413.**
