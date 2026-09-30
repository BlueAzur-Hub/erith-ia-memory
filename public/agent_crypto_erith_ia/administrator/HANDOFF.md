# HANDOFF — Agent-Crypto 40.6.490

## État livré

40.6.490 ajoute la rétention locale Oracle Evidence par chunks froids `VERIFIED`, avec HOT minimum 10 000. Aucun nettoyage réel n’a été exécuté pendant l’implémentation ou les tests.

## Parcours opérateur après revue Seven

1. `Ctrl+F5`.
2. Ouvrir `Oracle → Evidence & validation`.
3. Lire la carte 40.6.489 et la nouvelle carte 40.6.490.
4. Vérifier que le preview indique uniquement des chunks complets `VERIFIED` et un résultat prévu `≥ 10 000`.
5. Cliquer `Tester 1 chunk · max 500`.
6. Lire la confirmation et valider seulement si le chunk attendu est affiché.
7. Exiger le reçu visible `RETENTION_CANARY_PASS` et un recount cohérent.
8. Vérifier que `Continuer jusqu’à HOT 10 000` vient seulement de se déverrouiller.
9. Continuer uniquement après accord final de Christophe / Blue Azur.

## Points d’arrêt

Au moindre SHA, `row_count`, `first_t0`, `last_t0`, `first_id`, `last_id`, watermark, manifest ou recount divergent : statut `STOP`, aucun chunk suivant.

La continuation termine sur `HOT_RETENTION_COMPLETE`, puis relance automatiquement la mesure READ ONLY 40.6.489.

## Ce que Seven doit confirmer

- la sérialisation locale `JSON.stringify(row) + "\n"` correspond exactement au JSONL froid historique ;
- l’ordre IndexedDB `index("t0")`, puis clé primaire `id`, est bien l’ordre utilisé lors de l’archivage ;
- le fetch same-origin de Pages relit bien le chunk GitHub publié sans service worker obsolète ;
- le premier chunk candidat est ancien, complet, `VERIFIED` et contient au plus 500 lignes ;
- une capture récente effectuée pendant le test reste locale ;
- le compteur reste `≥ 10 000` après canari et après traitement complet ;
- le cache chaud Oracle et la carte 40.6.489 reflètent le recount final ;
- aucun fichier protégé ni donnée froide n’est modifié par le diff.

## Interdit avant merge

- ne pas merger la PR sans revue Seven ;
- ne pas exécuter la continuation sur le profil Firefox de production ;
- ne pas modifier le manifest ou les chunks froids pour faire passer une preuve ;
- ne pas utiliser d’outil global de purge IndexedDB.
