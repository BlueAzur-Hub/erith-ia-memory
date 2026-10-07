# Backend 1.4.6 — Market Instrument Resolver patch

Fichier compact contenant le **Private Backend 1.4.6** et ses routes read-only :

- `/market-resolve`
- `/market-candles`
- `/market-book`

## Installation patch

1. Dans Aether Control, arrêter le Backend.
2. Fermer Aether Control.
3. Extraire ce ZIP.
4. Copier `backend/private_backend.py` dans :
   `%LOCALAPPDATA%\ERITH.IA\AtlasCryptoBridge\2.3.2R19\backend\`
5. Ce patch seul doit être lancé avec `backend/start_private_backend.cmd`.

Le Control Center compilé pour Backend 1.4.5 vérifie strictement le numéro de version et peut donc afficher le 1.4.6 comme non prêt. Le package Aether Control complet 1.4.6 reste la livraison intégrée recommandée.

Lecture seule : aucune clé exchange, API privée, ordre, wallet ou retrait.

SHA-256 du ZIP : `85a193b4b59eb397f7f67f414112d51878682addb9039c0ff8912286e8179782`.
