# Agent-Crypto 40.6.490 — ORACLE EVIDENCE VERIFIED HOT WINDOW RETENTION

## Objet

Conserver au moins 10 000 Oracle Evidence locales dans Firefox et permettre à l’opérateur de retirer uniquement des chunks complets dont la copie froide GitHub est prouvée `VERIFIED`.

40.6.489 reste la sonde READ ONLY de mesure. 40.6.490 n’exécute automatiquement qu’un preview READ ONLY.

## Preview automatique

La carte `ORACLE EVIDENCE · VERIFIED HOT WINDOW 10 000 · 40.6.490`, montée sous 40.6.489, affiche :

- lignes locales ;
- budget maximal retirable sans franchir 10 000 ;
- chunks complets candidats ;
- lignes candidates ;
- lignes prévues après rétention ;
- estimation MiB libérables.

Le preview ouvre IndexedDB uniquement en `readonly`. Il ne supprime rien.

## Canari obligatoire

`Tester 1 chunk · max 500` exige une confirmation opérateur puis, avant la transaction :

1. recharge le manifest public ;
2. exige une entrée `VERIFIED` et toutes ses preuves ;
3. relit le JSONL froid public sans cache ;
4. vérifie son `row_count`, son SHA-256 et ses quatre bornes ;
5. reconstruit les lignes locales dans l’ordre canonique `(t0, id)` ;
6. exige le SHA-256 local exact du manifest et les mêmes bornes ;
7. relit et re-hashe encore le chunk local juste avant la transaction ;
8. supprime uniquement les clés primaires exactes du chunk ;
9. recompte et vérifie l’absence de tous les IDs retirés.

Le reçu visible doit être `RETENTION_CANARY_PASS`. Sans ce reçu, la continuation reste désactivée.

## Continuation

`Continuer jusqu’à HOT 10 000` traite un chunk à la fois. Le manifest, le chunk froid et les lignes locales sont revérifiés avant chaque suppression. Le traitement s’arrête au premier écart et ne descend jamais sous 10 000 lignes.

Le reçu final `HOT_RETENTION_COMPLETE` affiche les lignes supprimées, les lignes restantes, les chunks retirés localement et l’estimation MiB récupérée. La sonde READ ONLY 40.6.489 est alors relancée automatiquement.

## Protections

- aucun `clear()` ;
- aucun `indexedDB.deleteDatabase()` ;
- aucune suppression automatique au chargement ;
- aucun chunk absent ou non `VERIFIED` ;
- aucune Evidence postérieure au watermark froid ;
- queue récente non archivée conservée ;
- archive froide GitHub inchangée ;
- schéma IndexedDB inchangé ;
- Market Core 38.15.11, Strategy A, Atlas CURRENT, Oracle Math, collecteurs Market, Aether, Redivider, Lecture Technique, Bridge R17 / V1.9.13 et Web Classique inchangés ;
- aucun ordre réel et aucun wallet.

## Validation livrée

Les validations sont statiques et isolées. Elles ne touchent aucune IndexedDB réelle. Le premier test terrain destructif autorisé reste exclusivement le canari explicite dans Firefox, après revue Seven.
