# AETHER — PROMPT DE REPRISE AGENT-CRYPTO

Version de reprise : **40.4.211**  
Market Core : **38.15.11 — PROTÉGÉ**  
Mode : **Administrator**

## Démarrage minimal

Lire d'abord :
1. `public/agent_crypto_erith_ia/administrator/version.json` ;
2. `coordination/inter_ai_dialogues/agent_crypto/AGENT_CRYPTO_FIN_DE_FIL_AETHER.md` ;
3. `public/agent_crypto_erith_ia/administrator/js/market-stack.js` ;
4. `public/agent_crypto_erith_ia/administrator/js/parallel-markets.js` ;
5. `public/agent_crypto_erith_ia/administrator/js/market-reading-depth.js`.

Ne charger une mémoire privée que si elle change réellement la décision. Pour le code, conserver la méthode chirurgicale : lire → diagnostiquer → cibler → corriger → vérifier → s'arrêter.

## État canonique

Le cycle marché est : **Crypto → Métaux → Indices → Énergie → Cross → Crypto**. Crypto reste le maître de géométrie. La géométrie validée 40.4.189/40.4.195, le rail droit, le Window Manager, Atlas, Oracle, Bridge et Backend ne doivent pas être rouverts sans preuve de régression.

40.4.209 consolide la parité visuelle : identité couleur stable par actif, axe temporel réel, inspection historique, tableau permanent superposé sur Indices/Énergie/Cross, propagation couleur au rail, aux tableaux de lecture profonde et aux rôles leader/retard du Math Core.

40.4.210 est un verrou de **Cache Truth** : les quatre payloads marché effectivement modifiés par 40.4.205→40.4.209 (`parallel-markets.css`, `market-reading-depth.css`, `js/parallel-markets.js`, `js/market-reading-depth.js`) sont désormais appelés par des URL versionnées 40.4.210. Leur contenu fonctionnel reste inchangé ; `market-stack.js` et `version-truth.js` ne sont pas artificiellement republiés.

40.4.211 verrouille l’**autorité unique d’affichage de version** : `market-stack.js` ne peut plus écrire `#atlasVersionControlText`; le badge first-paint est synchronisé par le release driver, `version-truth.js` reste l’autorité runtime globale, et les versions de module sont explicitement séparées de la release Agent-Crypto.

## Vérités protégées

- Market Core **38.15.11** inchangé.
- Aucun nouveau moteur de graphique.
- Aucun nouveau fetch, timer, MutationObserver, WebSocket ou requestAnimationFrame dans les propriétaires parallèles/lecture profonde.
- Historique 5a/10a/MAX toujours lazy et chargé uniquement à l'appel.
- Futures continus ≠ spot.
- Base 100 = comparaison relative.
- Corrélation ≠ causalité.
- Aucune valeur inventée, aucune prévision, aucun ordre.
- La couleur est redondante avec symbole/nom/valeur : elle ne porte jamais seule l'information.

## Règle de travail

Une dette → un propriétaire → une chirurgie → une preuve → un commit → stop. Ne jamais revenir à un ancien commit pour reconstruire une version : partir du `main` courant et préserver les mises à jour de données automatiques.
