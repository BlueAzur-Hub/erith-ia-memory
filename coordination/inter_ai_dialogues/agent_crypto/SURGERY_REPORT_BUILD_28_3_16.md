# Agent-Crypto — Build 28.3.16 — Rapport de chirurgie du versionnage

## Verdict

La fonction de versionnage historique a été restaurée dans la base publique 28.3.14 sans rollback fonctionnel.

Le contrôleur de version complet de 28.3.16 est byte-identique à celui des Builds 28.3.12 et 28.3.13 originales :

`SHA-256 04e976aec9a92bbf2e2162725d1fa772a6a1910e7ba94e7feafc48ab20d11155`

La logique ajoutée en 28.3.14 `sameBuildTokenChanged` a été retirée des deux chemins concernés. Le mode historique de réparation locale à Build identique est conservé.

## Périmètre modifié

- `app.js` : nouvelle identité 28.3.16, retrait exact des deux branches `sameBuildTokenChanged`, libellé d’interface 28.3.16.
- `index.html` : identité, cache-busters et libellés 28.3.16 uniquement.
- `style.css` : identité active 28.3.16 uniquement.
- `version.json` : identité 28.3.16 et enregistrement documentaire de la restauration ; tout l’historique 28.3.14 est conservé.
- `README.md` : section 28.3.16 ajoutée ; historique 28.3.14 et antérieur conservé byte-identique.

Aucune modification fonctionnelle de la pédagogie, IndexedDB, Market, Métaux, Bridge, collecteurs, simulation ou layout.

## Preuves structurelles

- contrôleur 28.3.12 = contrôleur 28.3.13 : oui ;
- contrôleur 28.3.16 = contrôleur historique : oui ;
- `sameBuildTokenChanged` restant : 0 ;
- `app.js` 28.3.14 → 28.3.16 : uniquement modifications whitelistées ;
- `index.html` : identité/mission uniquement ;
- `style.css` : identité active uniquement ;
- historique manifeste 28.3.14 conservé : oui ;
- historique README 28.3.14 et antérieur conservé : oui.

## Contrôle navigateur du versionnage

**15/15** :

- Build strictement supérieure détectée ;
- URL de mise à jour construite avec nouveau Build/token ;
- même Build + token différent NON traité comme mise à jour ;
- même Build + token différent NON installé ;
- réparation locale historique à Build identique conservée ;
- manifeste distant inférieur refusé ;
- aucune erreur de page critique.

## Non-régression automatisée

Total exécuté : **421/421** contrôles réussis.

- chirurgie statique : 26/26
- contrôle navigateur versionnage : 15/15
- BROWSER_CONTINUITY_ORDER_COMPLETION_RESULTS_28_3_16.json: 57/57
- BROWSER_FOUNDATIONS_02_03_RESULTS_28_3_16.json: 56/56
- BROWSER_KNOWLEDGE_06_08_RESULTS_28_3_16.json: 52/52
- BROWSER_MASTERY_09_11_RESULTS_28_3_16.json: 16/16
- BROWSER_PERSISTENCE_CONTRACT_RESULTS_28_3_16.json: 35/35
- BROWSER_REAL_INDEXEDDB_RESULTS_28_3_16.json: skipped_environment_policy
- BROWSER_RUNTIME_RESULTS_28_3_16.json: 49/49
- BROWSER_SECURITY_04_05_RESULTS_28_3_16.json: 37/37
- CONTRACT_HARNESS_RESULTS_28_3_16.json: 55/55
- FAIL_CLOSED_PERSISTENCE_RESULTS_28_3_16.json: 5/5
- STATIC_VERIFICATION_RESULTS_28_3_16.json: 18/18

## Limite réelle

La persistance IndexedDB native n’a pas été exécutée dans cet environnement : la politique Chromium bloque les origines web utilisables et Firefox n’est pas disponible ici. La candidate ne doit donc être dite « validée Firefox réel » qu’après publication et contrôle non destructif dans le profil Firefox existant.

## Publication

Les cinq fichiers publics doivent être remplacés **ensemble dans un seul commit**. Aucun fichier de version ne doit être publié isolément.

Commit proposé :

`release agent-crypto build 28.3.16 historical version control restoration lock`

Point d’arrêt : après publication, ne produire aucune nouvelle Build avant validation du bouton de version et du chargement effectif de 28.3.16 dans Firefox.
