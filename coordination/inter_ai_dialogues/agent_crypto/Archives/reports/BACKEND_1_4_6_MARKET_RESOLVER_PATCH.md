# Backend 1.4.6 — Market Instrument Resolver · vérité de livraison

Artefact autoritaire sur `main` :

`coordination/inter_ai_dialogues/agent_crypto/AGENT_CRYPTO_BACKEND_1_4_6_MARKET_RESOLVER_PATCH.zip`

SHA-256 :

`85a193b4b59eb397f7f67f414112d51878682addb9039c0ff8912286e8179782`

Le ZIP contient le **Private Backend 1.4.6** read-only et les routes :

- `/market-resolve`
- `/market-candles`
- `/market-book`

## Installation / test terrain recommandé

1. Arrêter l'ancien Backend sur **127.0.0.1:8790**.
2. Fermer le Control Center qui supervise l'ancien Backend.
3. Extraire ce ZIP dans un dossier propre.
4. Lancer directement `backend/start_private_backend.cmd`.
5. Revenir dans Firefox et faire `Ctrl+F5` sur le Trader 40.6.619.

Le Control Center compilé pour Backend **1.4.5** vérifie strictement le numéro de version et peut afficher **1.4.6 non prêt**.  
Au checkpoint actuel, **aucun Control Center intégré 1.4.6 n'est publié sur `main`**. Ne pas annoncer l'ancien nom
`AGENT_CRYPTO_AETHER_CONTROL_R19_BACKEND_OKX_LOCAL_TRANSPORT.zip` comme artefact disponible.

## Sécurité

Lecture seule : aucune clé exchange, API privée, ordre, wallet ou retrait.  
Bridge **1.9.13** inchangé.

## Test attendu

- OKB / USD / Bougies → OKX / OKB-USDC si disponible ;
- BTW / USD / Bougies → Bitget / BTW-USDT si online ;
- autre crypto → paire réelle ou indisponibilité explicite ;
- Profondeur cohérente ;
- aucun fallback BTC silencieux.
