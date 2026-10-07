# Aether Control 2.3.2R20 — Clean Runtime Rebuild

Reconstruction complète depuis la vraie lignée R19, avec le dernier Backend terrain validé.

## Baseline
- Trader / Administrator: 40.6.621
- Bridge: 1.9.13
- Private Backend: 1.4.6 Market Instrument Resolver R2
- Market Core: 38.15.11

## Pourquoi R20
Les essais Backend 1.4.7 / 1.4.7 R2 ont déstabilisé la pile locale. R20 ne poursuit pas cette branche. Il repart du R19 complet et du Backend 1.4.6 R2 validé.

## Changements Control Center
- nouveau workspace propre: `%LOCALAPPDATA%\ERITH.IA\AtlasCryptoBridge\2.3.2R20`;
- chemin Python exact journalisé;
- lancement Backend explicite: `python -u private_backend.py --host 127.0.0.1 --port 8790 --quiet`;
- port 8790 contrôlé avant lancement;
- aucun kill automatique d'un listener étranger;
- stdout/stderr Backend persistés dans `logs/backend.log`;
- vraie fin de log remontée si le Backend quitte avant `/health`;
- fenêtre de santé portée à 15 s;
- Bridge 1.9.13 inchangé au niveau protocole;
- aucune route d'ordre, wallet ou écriture ajoutée.

## Validation locale
- compilation Windows amd64 Go: PASS;
- Backend 1.4.6 `--self-test`: PASS;
- payload embarqué Bridge = SHA du Bridge 1.9.13;
- payload embarqué Backend = SHA du Backend 1.4.6 R2 validé.

## Terrain
PENDING Christophe / Windows / Firefox.

Package chat:
`AGENT_CRYPTO_AETHER_CONTROL_R20_CLEAN_RUNTIME.zip`

ZIP SHA-256:
`62688d6f248c2fff2fb1361d25116263a7bfbb28a7a17d9af349e7e326e354d3`
