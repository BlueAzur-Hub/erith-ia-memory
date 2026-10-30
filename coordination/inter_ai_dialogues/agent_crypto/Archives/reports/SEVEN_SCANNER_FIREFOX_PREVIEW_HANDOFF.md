# Seven — Firefox preview, scanner EUR/USD, 28 octobre 2026

## Livraison concrète

- Prévisualisation prête pour essai utilisateur : https://raw.githack.com/BlueAzur-Hub/erith-ia-memory/0b24db64be7bdc0a27d7b1d743571c3ffc84e825/public/agent_crypto_erith_ia/administrator/index.html
- [PR #702 — preview combinée](https://github.com/BlueAzur-Hub/erith-ia-memory/pull/702), **OPEN DRAFT non fusionnée**.
- Branche : `test/seven-scanner-firefox-preview-20261028`, commit ciblé `0b24db64be7bdc0a27d7b1d743571c3ffc84e825`.
- Point de départ `main` : `0ca602deea07273ebfcb7ec0fc3f7a87e23cb895`; Administrator **40.6.640**; Market Core inchangé **38.15.11**.
- 19 blocs de modifications appliqués sans conflit : #695 (12), #696 (1), #699 (6), fichier `administrator/app.js` ; quatre suites de tests incluses.

## Preuve de validation

- [CI GitHub Actions #40652167200](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/40652167200) : **39/39 PASS**, 0 échec, `node --check` de l'application complète PASS. Le premier essai, #40652046757, a échoué 5/39 sur **un test harness incomplet** (le test de #699 ne simulait pas le nouveau `Market Frame` de #695).
- Correction du seul simulateur de tests : injecte maintenant le véritable contrôle `atlasScannerMarketFreshness`, un cadre daté et un contexte de devise EUR explicite. Aucune suppression du garde de fraîcheur du runtime.
- Le HTML du commit source référence `./app.js` (ligne 6240) et le fichier source corrigé est bien présent sur ce commit (blob `e80d1a81613c4cf75297525b52dc843e2ea13eca`).
- Les autres workflows GitHub du dépôt doivent être examinés séparément ; la suite combinée de régression est verte. Le chargement CDN `raw.githack.com` et le rendu Firefox ne sont pas certifiés par CI et restent des preuves utilisateur à obtenir.

## Contrat / limites

- #695 : intégrité Market Frame, date, identité du panier et des historiques EUR/USD.
- #696 : résumé de Lecture Technique synchronisé avec l'actif principal sélectionné.
- #699 : diagnostics honnêtes des manques 4/5, sans remplacer une crypto ni fabriquer un historique.
- **La PR #700 de collecte serveur EUR reste séparée** : RAIN a été récupéré via serveur dans son diagnostic, mais **l'Administrator de cette preview n'est pas encore branché dessus** ; pas de promesse de 5/5 systématique.
- L'Interface publique `main`, le Trader, le Bridge, le Coffre, le Market Core et les fonctions d'ordre restent non modifiés par cette preview.
- Ne pas confondre la variation 24 h du classement du Market et la variation de la série historique de 24 h : bornes d'observation et fraîcheur à vérifier avant de conclure à une erreur.

## Prochain test utilisateur UNIQUE

Ouvrir le lien de prévisualisation Firefox (ne pas tester `main` par erreur), choisir le scanner **Hausses 5, EUR, 24 h**, puis communiquer une capture du résultat. Examiner identité des cinq actifs, provenance, horodatages, 5/5 ou raison explicite d'une série manquante, concordance Lecture Technique avec l'actif principal. Si PASS, étendre à Baisses 5 puis aux autres périodes/USD **une étape à la fois**.

L'utilisateur subit des interruptions fréquentes de connexion ; préserver les commits et ce document, éviter F12/CTRL+F5 comme condition préalable.
