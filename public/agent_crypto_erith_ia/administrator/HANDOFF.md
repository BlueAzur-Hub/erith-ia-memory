# HANDOFF — Agent-Crypto 40.6.478

## Objet unique

Rendre un dossier prospectif terminé réellement immuable.

## Règle

Un dossier est terminal lorsque ses trois horizons T+5, T+15 et T+60 sont chacun dans un état terminal : `CAPTURED` ou `MISSED_WINDOW`.

À partir de là, tout cycle futur doit être ignoré pour ce dossier : aucune observation ajoutée, aucun `updated_at` modifié, aucune écriture IndexedDB.

## Validation

Le harness doit vérifier :
1. dossier terminal détecté ;
2. deux cycles tardifs successifs → zéro écriture ;
3. observations et `updated_at` inchangés ;
4. dossier non terminal → capture encore fonctionnelle ;
5. échantillon trop tardif → `MISSED_WINDOW` encore fonctionnel.

## Terrain

La preuve naturelle complète dépend toujours de l'existence future d'un vrai dossier `COST_GATE_WAIT`. Il n'est pas nécessaire de forcer quoi que ce soit.

Lecture Technique conserve le correctif 40.6.477.

Market Core 38.15.11 intact. Aucun ordre réel.
