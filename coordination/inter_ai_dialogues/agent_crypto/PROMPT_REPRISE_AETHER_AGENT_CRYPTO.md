# PROMPT DE REPRISE — AETHER / AGENT-CRYPTO

Version de reprise : **40.4.204**  
Autorité de départ : GitHub public `BlueAzur-Hub/erith-ia-memory` → `public/agent_crypto_erith_ia/administrator/`.

Tu reprends Agent-Crypto après le checkpoint final **40.4.204**.

## À charger en priorité

1. `public/agent_crypto_erith_ia/administrator/version.json`
2. `coordination/inter_ai_dialogues/agent_crypto/AGENT_CRYPTO_FIN_DE_FIL_AETHER.md`
3. `public/agent_crypto_erith_ia/administrator/js/market-stack.js`
4. `public/agent_crypto_erith_ia/administrator/js/parallel-markets.js`
5. `public/agent_crypto_erith_ia/administrator/js/market-reading-depth.js`
6. le Fil Crypto uniquement pour l'intention/historique lorsque nécessaire.

## Contrats non négociables sans preuve

- **Market Core 38.15.11 protégé.**
- Géométrie 40.4.189/40.4.195 verrouillée : même sélecteur Marché, mêmes dimensions, même rail, même origine, aucune transition de coque.
- Cycle exact : Crypto → Métaux → Indices → Énergie → Cross → Crypto.
- Historical Depth long = lazy à l'appel ; pas au boot.
- Deep Reading = mesures déterministes, explicables, observation uniquement.
- Futures continus Métaux/Énergie séparés du spot.
- Cross : dates communes ; corrélation ≠ causalité.
- Aucun prix inventé, aucune prévision présentée comme mesure, aucun ordre financier.

## État au départ

- Crypto : cockpit natif riche + Math Core V3.
- Métaux : cockpit natif + 5a/10a/MAX + lecture profonde.
- Indices : 5/5 + 5a/10a/MAX + lecture profonde.
- Énergie : 3/3 + 5a/10a/MAX + lecture profonde.
- Cross : 5/5 + mémoire longue + corrélations + lecture profonde.
- 40.4.204 empêche le DOM Métaux natif de contaminer sémantiquement les domaines parallèles tout en conservant son empreinte physique.
- Version Truth est gardée par `.github/scripts/agent_crypto_version_truth_guard.py`.

## Première action du prochain fil

Avant toute chirurgie, vérifier le build réellement publié et demander/observer le retour Firefox si la demande touche l'interface. Si 40.4.204 est saine, considérer ce checkpoint comme base canonique. Ne pas créer une 40.4.205 uniquement pour “nettoyer” sans dette observable : la prochaine version doit répondre à une demande fonctionnelle explicite de Christophe.
