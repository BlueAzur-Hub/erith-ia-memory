# AGENT-CRYPTO — RELEASE MANIFEST

Release courante : **40.4.222**
Market Core : **38.15.11**

## Surface canonique

- `public/agent_crypto_erith_ia/administrator/`
- `public/agent_crypto_erith_ia/data/indices/`
- `public/agent_crypto_erith_ia/data/energy/`
- `public/agent_crypto_erith_ia/data/cross_market/`
- `public/agent_crypto_erith_ia/data/metals/`
- `coordination/inter_ai_dialogues/agent_crypto/PROMPT_REPRISE_AETHER_AGENT_CRYPTO.md`
- `coordination/inter_ai_dialogues/agent_crypto/AGENT_CRYPTO_FIN_DE_FIL_AETHER.md`

Les livraisons opérateur redeviennent des ZIP différentiels « à l’ancienne » : uniquement les fichiers réellement modifiés par la version, accompagnés d’une liste et du commit canonique. Aucun dump complet du dépôt n’est requis pour une release de travail. La release ne modifie pas les archives de données automatiques pendant sa construction.

40.4.210 est une release de **Cache Truth / publication identity** : elle ne change ni les données marché, ni les moteurs de graphique, ni la géométrie, ni le Market Core 38.15.11.

40.4.211 est une release de **Version Display Single Authority** : une seule vérité globale de release est affichée ; les versions locales de modules ne peuvent plus réécrire le badge global.

40.4.212 est une release de **Atlas Heartbeat Rearm** : réarmement one-shot du propriétaire CURRENT canonique après boot complet, sans nouveau scheduler.

40.4.213 est une release de **Market Architecture Truth Convergence** : Crypto/Métaux/Indices/Énergie/Cross et leurs propriétaires actifs deviennent la vérité canonique ; les contrats 40.4.166/167 sont historiques.

40.4.214 est une release de **Extended Market Universe Ingestion Recovery** : une vue 500/1000 restaurée depuis l’espace mémorisé réarme le loader Extended existant après hydratation du Market. `build.json` rejoint le release driver et le Version Truth Guard.

40.4.215 est une release de **Market Coverage Truth** : les boutons 50/100/250/500/1000 sont des plafonds de rang fournisseur, pas des promesses de cardinalité exacte. Les ex æquo CoinGecko sont conservés, les IDs uniques restent l’autorité de ligne, aucun rang synthétique n’est inventé.

40.4.216 est une release de **Market Coverage Footer Parity** : le footer secondaire du Market Snapshot réutilise la vérité de couverture 40.4.215 et ne présente plus un plafond de rang fournisseur comme une cardinalité exacte (`991/1000`, `249/250`, `742/750`). Aucun rang ni actif n’est modifié.

40.4.217 est une release de **Market Table Event Delegation** : le Market Snapshot Core remplace le fan-out de listeners recréés à chaque rendu (lignes + boutons) par une délégation stable sur `marketRows`, en conservant les mêmes actions clavier/souris. Aucun fetch, timer, observer, WebSocket, donnée, rang, graphique, Atlas ou Market Core n’est modifié.

40.4.218 est une release de **Version Observer Retirement** : l’ancien `MutationObserver` de compatibilité qui surveillait en permanence le badge global pour corriger un ancien libellé Market Core est retiré. Depuis 40.4.211, `market-stack.js` ne possède plus ce badge ; `version-truth.js`, le runtime racine et l’identité Administrator restent les autorités explicites. Aucun changement de Market Core, Atlas, données ou géométrie.

40.4.219 est une release de **Loaded Asset Manifest Coverage** : tous les fichiers JavaScript/CSS locaux réellement chargés par `index.html` rejoignent l’autorité SHA-256 de `version.json`. Les URL de cache et les contenus de ces payloads restent inchangés ; la release ajoute une preuve d’intégrité, pas un nouveau comportement runtime.

40.4.220 est une release de **Atlas Heartbeat Owner Guard** : le Version Truth Guard protège désormais explicitement le contrat Atlas CURRENT 40.4.212 — réarmement unique après `load`, via les propriétaires canoniques existants, sans fetch, timer, observer, WebSocket, rAF ni scheduler ajouté. Le payload Atlas reste inchangé.

40.4.221 est une release de **Simulation Dual Profile Surface Truth** : la sous-vue `views/system.html` ET son shell parser canonique `js/views/system-presentation.js` sont reconnectés au moteur dual-profile déjà présent. Les sélecteurs École 100 € / Progression 1 000 €, les valeurs de profil et les libellés du Mode École redeviennent dynamiques. Les deux portefeuilles, journaux, sauvegardes, IndexedDB, workspaces Kraken Paper, onze leçons et calculs de simulation restent inchangés.

40.4.222 est une release de **System Presentation Truth** : les textes statiques de System/Simulation rejoignent la réalité déjà active — mémoire IndexedDB, agents locaux et reprise dynamique. Aucun schéma de mémoire, moteur de simulation, donnée marché, géométrie ou Market Core n’est modifié.
