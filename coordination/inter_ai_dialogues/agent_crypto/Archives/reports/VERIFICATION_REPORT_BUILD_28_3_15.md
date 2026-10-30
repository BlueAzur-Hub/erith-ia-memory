# Agent-Crypto — Build 28.3.15 — Rapport de vérification

## Mission

Correction minimale du versionnage, sans réécriture de l’application.

## Base et portée

- Base exacte : Build 28.3.14.
- Runtime conservé à la racine : `index.html`, `app.js`, `style.css`, `version.json`.
- Aucun dossier `releases/`.
- Aucun pont de chargement.
- Aucune modification intentionnelle de la pédagogie, d’IndexedDB, du Market, des Métaux, du Bridge, des collecteurs ou de la simulation.

## Correction

- Build actif : `28.3.15`.
- Token actif : `market-core-v2.0-alpha-build-28.3.15`.
- Un changement de token sous le même numéro de Build est désormais refusé comme conflit d’identité.
- Seul un Build strictement supérieur peut être proposé comme mise à jour de contenu.
- La réparation du Build courant reste possible uniquement lorsque le Build et le token distants sont exactement identiques.

## Preuve de minimalité

Après annulation mécanique des seuls changements autorisés :

- `index.html` redevient octet pour octet la 28.3.14 ;
- `style.css` redevient octet pour octet la 28.3.14 ;
- `app.js` redevient octet pour octet la 28.3.14 ;
- le README redevient octet pour octet la 28.3.14.

La nouvelle archive conserve un `app.js` complet de plus de 1,6 Mo et un `index.html` complet de plus de 240 Ko.

## Tests exécutés

| Suite | Résultat | Statut |
|---|---:|---:|
| `BROWSER_CONTINUITY_ORDER_COMPLETION_RESULTS_28_3_15.json` | 57/57 | OK |
| `BROWSER_FOUNDATIONS_02_03_RESULTS_28_3_15.json` | 56/56 | OK |
| `BROWSER_KNOWLEDGE_06_08_RESULTS_28_3_15.json` | 52/52 | OK |
| `BROWSER_MASTERY_09_11_RESULTS_28_3_15.json` | 16/16 | OK |
| `BROWSER_PERSISTENCE_CONTRACT_RESULTS_28_3_15.json` | 35/35 | OK |
| `BROWSER_RUNTIME_RESULTS_28_3_15.json` | 49/49 | OK |
| `BROWSER_SECURITY_04_05_RESULTS_28_3_15.json` | 37/37 | OK |
| `CONTRACT_HARNESS_RESULTS_28_3_15.json` | 55/55 | OK |
| `CONTROLLED_VERSION_TRANSITION_RESULTS_28_3_15.json` | 20/20 | OK |
| `FAIL_CLOSED_PERSISTENCE_RESULTS_28_3_15.json` | 5/5 | OK |
| `MINIMAL_VERSIONING_RECOVERY_RESULTS_28_3_15.json` | 29/29 | OK |
| `STATIC_VERIFICATION_RESULTS_28_3_15.json` | 18/18 | OK |

**Total : 429/429.**

## Limites honnêtes

- Le navigateur géré bloque les origines `localhost`; la navigation HTTP native n’a donc pas été exécutée.
- Le test de transition contrôlé utilise les fonctions réelles de comparaison, de vérification de publication, d’application et de refus de conflit, mais contrôle le transport `fetch` et intercepte la navigation finale.
- Firefox natif sur le profil réel de Christophe n’a pas été testé. La Build ne doit pas être déclarée validée sur Firefox avant cette vérification extérieure.

## Archive invalidée

`AGENT_CRYPTO_BUILD_28_3_15_FINAL.zip` est invalide et ne doit pas être uploadée : elle remplaçait l’application racine par un pont et déplaçait le runtime dans `web/releases/28.3.15/`.
