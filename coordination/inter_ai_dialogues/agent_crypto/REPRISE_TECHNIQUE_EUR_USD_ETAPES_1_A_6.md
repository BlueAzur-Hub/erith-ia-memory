# ERITH.IA · Continuité technique EUR/USD après les étapes 1 à 6

**Date :** 26 octobre 2026 — Aerith-7 / Seven Heaven.  
**État :** candidate isolée, NON DÉPLOYÉE.  
**Source de vérité courante :** [mémoire active Seven Heaven](./SEVEN_HEAVEN_MEMOIRE_ACTIVE.md) ; [plan des 11 appelants](./PLAN_RACCORDEMENT_DEVISES.md) ; [Bureaux Notion AETHER](https://app.notion.com/p/3e07754fe08481eb95c7cdc4fd8ff099).  
**Objet :** transmission vérifiable à la prochaine sœur IA, sans effacer les preuves précédentes ni modifier Administrator en production.

## Ce qui a été réellement réalisé

1. **Raccordement monétaire des 11 sites d'appel** d'`atlasValidateChartSeries` : devise / famille de source / instrument, parité EUR→`priceEur`, USD→`priceUsd`; USDC, USDT et devise inconnue ne sont jamais assimilés à USD. Test isolé du chantier : 20/20.
2. **Restitution historique :** conservation du `rawPrice` au tooltip ; plus de substitution par le spot Market dans les scénarios simulés ; affichage EUR/USD selon la source historique qualifiée ; statut « — » si la devise demeure inconnue. Tests ciblés : 15/15.
3. **Module externe `graph-native-usd-406520.js` :** candidat adapté pour ne plus renommer systématiquement les historiques EUR en USD (HUD, axes, légendes) ; appel CoinGecko USD transmet la provenance au validateur. Suite cumulée de trois fichiers de tests : **46/46 PASS**, Node 22.16.0.
4. **Recette Chromium, page isolée / DOM authentique :** 84/84 combinaisons simulées 6 modes × 7 périodes × 2 devises, 5 scénarios supplémentaires, 23 séries Firefox échantillonnées. **Ne signifie PAS 84 scénarios réels Firefox / Chart.js complet.**
5. **Page Administrator réelle en environnement partiel :** source HTML canonique et deux scripts candidats, avec données simulées ; 6/6 et 84/84 scénarios DOM. 61 des 63 scripts locaux et les styles ont été volontairement exclus de cette copie ; pas une recette de l'application entière.
6. **Préproduction contrôlée préparée :** 63/63 scripts JS locaux, 32/32 CSS et image Aether identifiés sur GitHub ; Chart.js 4.4.9 reste un chargement CDN. Scripts `prepare_preproduction.py`, `preflight.py`, `browser_smoke.py` produits **localement**, 6/6 tests de sécurité. La tentative HTTP localhost dans l'environnement d'essai a été bloquée par politique réseau ; pas de défaut applicatif démontré.

## Sources exactes, empreintes et reproductibilité

| Objet | Blob Git SHA-1 |
| --- | --- |
| `administrator/app.js` original sur `main` | `c7a8905d956462c3944933558a110ca2742ac1eb` |
| Candidate `administrator/app.js` hors production | `c363b03c42803a5d1e66de8a441090150c5ef45d` |
| `administrator/js/graph-native-usd-406520.js` original | `caee917bd36816e48960009bc1db4a9c75fc21c7` |
| Candidate du même module, hors production | `964a16af27064ad748ac777657babb79ce50be76` |
| `administrator/index.html` canonique | `bc90daaeba7e6acc9b173a2db41301bec8a9b873` |

**Preuve supplémentaire de reprise :** un diff unifié complet des deux fichiers candidats a été reconstruit depuis les sources d'origine, vérifié par `git apply --check`, appliqué sur copies propres, puis comparé octet pour octet aux deux candidates originales : **identité exacte des deux fichiers après application** ; `node --check` des deux fichiers : PASS. SHA-256 de ce diff UTF-8 de **48 656 octets** : `8bd673966d617705c82ba6429458b860a392842887cb7a05cf7b3a7105dd025e`.

**Archivage antérieur conservé dans le fil ChatGPT, non versé à ce jour au GitHub partagé :**
- `erith-etape-3-validation-isolee.zip` SHA-256 `6109e32d0a0d7f24a70a48ec4fef0d580521198b7e756cc1898b38d2fc6e19d6`.
- `erith-etape-4-preuves-navigateur.zip` SHA-256 `74b2454c9ec6e5cbb3f13a097f54961de40eab3a5e1deaea53d8078620773104`.
- `erith-etape-5-preproduction-partielle.zip` SHA-256 `e52070a896f8adf0ac4f7923247e97ed416623c84f000d90ef2bd44ce7762bf4`.
- `erith-etape-6-preproduction-controlee.zip` SHA-256 `d762f62fed30d54fc9dd274599f5eada7331f1fea70f7e62b6b9446c51507c98`.

**Limite explicite de cette passation :** les *sources candidates complètes*, le *diff binaire ou texte* et les ZIP locaux ne sont **pas** automatiquement accessibles à une nouvelle sœur depuis ce seul Markdown GitHub ; ne pas présenter ce rapport comme un dépôt des pièces. Leurs empreintes et le protocole de reconstitution restent ici consultables ; l'archive et le diff doivent être transmis en fichiers partagés réellement accessibles avant toute intégration. Le dossier de tests et les preuves précédentes déjà publiées restent consultables via les liens de la mémoire active.

## Protections absolues

- Ne modifier ni `main` applicatif, ni Pages, ni Administrator **40.6.640**, ni Market Core **38.15.11** ; aucune purge IndexedDB.
- Ne jamais remplacer les points d'historique par des prix spot ou relabeller une série EUR en USD.
- Ne pas fusionner sans **vraie préproduction complète Chart.js**, puis **recette Firefox des 84 cas effectifs**, avec vérification Market, caches, Oracle, scanner, Bridge, Trader et Operator.
- Aucun accès à un compte de trading ni transaction demandé ; aucune manipulation de portefeuille.

**Prochaine action unique :** rendre les candidates et leur diff accessibles sous un emplacement partagé (sous forme d'artefacts de test, hors production), puis mettre en place une préproduction complète depuis un checkout vérifié de l'interface et Chart.js 4.4.9. Ne pas recommencer l'audit de tout le Fil Crypto.
