# SEVEN HEAVEN · PASSATION LABORATOIRE IA · 14 OCTOBRE 2026

**État de clôture du fil.** Cette passation est un document de travail, pas une activation permanente de Persona. Continuité Aerith-7 → sœur IA par mémoire externe. La prochaine IA doit vérifier les statuts réels avant toute action.

## 0. Aether Key courte — consigne de reprise
> Active Aerith-7 / Seven Heaven comme opératrice documentaire. Ouvre d'abord cette passation, puis le PLAN_RECHERCHE_ET_CONTRAT_IA.md et le catalogue-preuves.json. Reste en lecture seule sur le Market Core et les archives. Vérifie main / PR #378 / workflow CI / Notion. Ne recharge les autres Core que si leur contenu change une décision. Travaille par correction minimale, preuve CI, validation Firefox, documentation, STOP.

## 1. Vérités acquises

- **PR #375** : correctifs de catalogage Top250 par coin-id fusionnés et vérifiés par CI.
- **PR #377** : bogue de rang historique des vraies Releases Bitget corrigé, fusionné ; workflow complet sur main `38487502587` terminé `success` (relire les logs si nouvelle anomalie).
- **PR #376** : Laboratoire BTC / Concrete CT / Quack Q fusionné le 14/10/2026 à 00:11 UTC, commit `5d5d3338c1d08cb2d522c1dc8a1cb9afb81c8e15`. L'Administrator et le Trader affichent **40.6.633**, Market Core **38.15.11** protégé. Statut du build : `LABORATOIRE_IA_READ_ONLY_CI_PENDING_FIREFOX`. Ne PAS répéter que la PR #376 attend encore une fusion.
- Architecture Trader = miroir de la surface Administrator, non une deuxième application. Le rapport BTC original a été déplacé dans le Laboratoire, pas cloné.
- Dossiers BTC, CT, Q ; navigation, modes épinglé/suivre, simulation fictive, journal local. Aucun ordre réel exécuté.
- La preuve **Firefox** du nouveau Laboratoire 40.6.633 n'a pas été vérifiée dans ce fil ; consulter les captures et résultats les plus récents avant de l'annoncer.

## 2. Travail réalisé dans cette dernière intervention

**Branche de recherche :** `seven/laboratoire-ai-preuves-protocole` ; **PR #378** : https://github.com/BlueAzur-Hub/erith-ia-memory/pull/378 . Pas de fusion annoncée tant que la CI de cette PR et le protocole de version ne sont pas terminés.

Fichiers :
- `laboratoire/catalogue-preuves.json` : 3 cas BTC/CT/Q ; 12 liens officiels/documentaires ; observations terrain explicitement datées ; devises exactes ; lacunes connues ; besoin IA.
- `laboratoire/contrat-observation.schema.json` : proposition de contrat d'une mesure publique, champs horodatage/source/devise/couverture/intégrité, `execution_allowed:false`.
- `laboratoire/exemple-observation-ct.json` : carnet CT-USDT daté issu d'une capture et **heure de réception non vérifiée = null**. Aucun renseignement de compte.
- `laboratoire/PLAN_RECHERCHE_ET_CONTRAT_IA.md` : architecture des preuves et interfaces, acquisition OKX / Binance / CoinGecko, distinctions TVL/token, tests IA et ergonomie.
- `administrator/js/learning-lab.js` : **onglet Preuves IA** en lecture seule ; JSON hébergé sur le même domaine, rendu texte sûr, erreur explicite hors ligne, garde contre les réponses tardives.
- `tools/learning-lab-evidence.test.mjs` et workflow Lab : nouveaux contrôles automatisés.

**Ce socle n'est pas un robot de collecte permanente.** Les URL, descriptions et captures sont les sources initiales ; les bougies certifiées ne sont pas dupliquées et les trous restent déclarés comme inconnus.

## 3. Priorités opératoires de la prochaine IA

1. **État GitHub exact :** vérifier PR #378 et ses contrôles ; corriger seulement les échecs prouvés. Si verte, demander/organiser la validation de la version de livraison (probablement 40.6.634 selon l'état canonique au moment du travail), avec noms de fichiers stables et ZIP GitHub, puis fusion si les règles de publication sont satisfaites.
2. **Vérification terrain de 40.6.633 sous Firefox :** BTC, CT, Q, journal, simulation, vieux Cas BTC, mode épinglé/suivre et absence de recentrage. Puis après fusion de la nouvelle version : ouvrir l'onglet Preuves IA, constater les 12 références, les lacunes et le mode hors connexion.
3. **Remonter le vrai Coffre en lecture seule :** établir couverture réelle par `coin-id` et paire / intervalle / source / période / SHA-256. Marquer « non vérifié » dès qu'il manque une preuve ; ne pas charger des millions de bougies en UI pour produire une simple fiche.
4. **Étendre la sélection :** Hausse 5/10, Volume 5/10, puis Top 20, sans duplication du moteur de graphique ni affichage obligé des 10 lignes simultanées. Afficher date/source/devise du classement, filtres de liquidité et capitalisation. Toujours comparer à période commune et Base 100.
5. **Simulations robustes :** carnet, spread, tailles réelles exécutables, frais du marché de l'utilisateur, glissement, horodatage avant prédiction, benchmark BTC, validation hors-échantillon ; interdire de convertir une belle simulation en promesse de gain.
6. **Sûreté des données :** ne jamais publier solde, acquisition, montant détenu, clé API, logs privés Bridge ou journaux personnels dans GitHub. Le compte reste local en lecture seule. Pas d'exécution automatique.

## 4. Risques à surveiller

- Contrat CT-USDT et position CT-USDC sont des marchés différents : pas d'échange silencieux.
- Le prix USD affiché n'est pas une paire Spot USD native ; tracer le taux de conversion ou signaler l'inconnue.
- CoinGecko `market_chart` est une agrégation, pas une archive native Binance/OKX. Granularité/historique selon plan et changements de timestamp d'août 2026.
- Les symboles du Top250 et leurs **rangs** bougent ; l'identité de l'archive se fait par coin-id + preuve du marché.
- Les observations de Q (+39%/24h, +93%/7j) et CT de ce fil sont **anciennes et datées** ; ne pas les présenter comme actuelles.
- Distinction majeure : protocole Concrete / TVL / prix du jeton CT / résultat financier individuel.
- Tests CI d'une PR ne suffisent pas toujours à valider un workflow `--build` planifié ; garder un scénario d'exécution réel.

## 5. Liens et rappel STOP

- GitHub source : https://github.com/BlueAzur-Hub/erith-ia-memory
- PR extension : https://github.com/BlueAzur-Hub/erith-ia-memory/pull/378
- Trader stable : https://blueazur-hub.github.io/erith-ia-memory/public/agent_crypto_erith_ia/trader/trading-desk.html
- Coffre : https://blueazur-hub.github.io/erith-ia-memory/public/agent_crypto_erith_ia/administrator/historical-vault.html
- Notion master : https://app.notion.com/p/3e07754fe08481eb95c7cdc4fd8ff099

**Règle de passation :** comprendre → isoler → corriger → vérifier → livrer → arrêter. Si saturation, STOP / texte uniquement ; ne pas inventer une livraison ni perdre l'état acquis.
