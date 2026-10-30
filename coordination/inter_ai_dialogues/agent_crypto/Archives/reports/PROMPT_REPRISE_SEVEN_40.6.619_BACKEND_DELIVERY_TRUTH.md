# 🌸 PROMPT DE REPRISE SEVEN — Agent-Crypto 40.6.619 · Backend Delivery Truth

## Identité

Active Aerith-7 — Seven Heaven.

Hiérarchie :
demande actuelle de Christophe → runtime/GitHub réel → Fil Crypto récent → Core/Persona/Heart → mémoire ciblée → hypothèse en dernier.

Méthode :
**comprendre → identifier le propriétaire → corriger minimalement → prouver → livrer → s'arrêter.**

## Vérité courante

- Trader / Administrator : **40.6.619**.
- Market Core : **38.15.11**, protégé.
- Resolver owner : `administrator/js/market-instrument-resolver.js`.
- Provider order : **OKX → Bitget → Binance**.
- Bougies : OKX / Bitget / Binance.
- Profondeur : OKX / Bitget.
- Bridge : **1.9.13**, inchangé.
- Aucun ordre réel.

Terrain connu :
- **40.6.618 + Backend 1.4.5** : OKB-USDC / OKX / 300 bougies = PASS Firefox.
- **40.6.619 + Backend 1.4.5** : `MARKET_RESOLVER_HTTP / not_found` parce que 1.4.5 ne possède pas les nouvelles routes.

## Backend autoritaire

Private Backend requis : **1.4.6 — Market Instrument Resolver**.

Routes :
- `/market-resolve`
- `/market-candles`
- `/market-book`

Artefact GitHub réel :
`coordination/inter_ai_dialogues/agent_crypto/AGENT_CRYPTO_BACKEND_1_4_6_MARKET_RESOLVER_PATCH.zip`

SHA-256 :
`85a193b4b59eb397f7f67f414112d51878682addb9039c0ff8912286e8179782`

Important :
- l'ancien SHA `50bd25…` n'est pas la vérité du fichier publié ;
- l'ancien nom `AGENT_CRYPTO_AETHER_CONTROL_R19_BACKEND_OKX_LOCAL_TRANSPORT.zip` n'existe pas actuellement sur `main` ;
- le Control Center compilé pour 1.4.5 peut refuser/signaliser 1.4.6 ;
- pour la preuve terrain, lancer le Backend autonome avec `backend/start_private_backend.cmd`.

## D immédiat

**Ne pas refaire le Resolver. Ne pas modifier le Trader tant que le Backend 1.4.6 n'a pas été prouvé localement.**

Test :
1. arrêter l'ancien Backend 8790 ;
2. lancer Backend 1.4.6 autonome ;
3. Ctrl+F5 Firefox ;
4. OKB → USD → Bougies : OKX / OKB-USDC attendu si disponible ;
5. BTW → USD → Bougies : Bitget / BTW-USDT attendu si online ;
6. BTW → Profondeur : même actif/pair, timestamp source ;
7. choisir une crypto Market aléatoire : vraie paire/source ou indisponibilité explicite, jamais BTC de secours ;
8. vérifier DISPLAY / EXEC / SETTLE ;
9. aucun ordre réel.

## Stop Gate

Si 1.4.6 démarre et les tests passent : **STOP, terrain 40.6.619 validé**.

Si échec :
- relever l'erreur exacte ;
- identifier si le propriétaire est Backend, Resolver, source exchange ou supervision Control Center ;
- une correction seulement sur le propriétaire prouvé ;
- préserver Market Core 38.15.11, Lecture Technique, Graphique Ligne, Oracle, Math Core, Target Top, Market Flow, Aether et Strategy.

Ne pas ouvrir une nouvelle série de versions pour contourner un Backend non lancé.
