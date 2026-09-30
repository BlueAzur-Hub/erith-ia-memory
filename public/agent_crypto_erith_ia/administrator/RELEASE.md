# Agent-Crypto 40.6.480 — PUBLIC CRYPTO COLLECTOR ACCESS RECOVERY

## Objet unique

Réparer l'accès du producteur public Crypto canonique Top-250 à CoinGecko, sans modifier Strategy A ni le moteur Atlas CURRENT.

## Cause confirmée en 40.6.479

- `data/crypto/latest.json` reste sur le dernier snapshot valide ;
- le collecteur continue de se réveiller ;
- CoinGecko répond HTTP 403 ;
- `status.json` passe DEGRADED et protège le dernier valide.

Le problème démontré est donc l'accès upstream du collecteur, pas un gel du moteur Atlas.

## Correction 40.6.480

- le workflow canonique lit `secrets.COINGECKO_DEMO_API_KEY` ;
- le collecteur transmet la clé uniquement via l'en-tête `x-cg-demo-api-key` aux requêtes CoinGecko ;
- la clé n'est jamais placée dans les en-têtes globaux de la session `requests` ;
- la requête BCE USD/EUR ne reçoit donc jamais la clé CoinGecko ;
- le fallback de pagination Top-250 utilise la même authentification ;
- secret absent/invalide → fail-closed, `status=degraded`, dernier `latest.json` valide conservé ;
- aucune valeur de clé n'est publiée dans les JSON.

## Preuve

Harness sans réseau : `.github/scripts/agent_crypto_public_crypto_demo_auth_test_406480.py`.

La preuve provider réelle reste PENDING jusqu'à l'exécution GitHub Actions avec un secret Demo valide et la publication d'un nouveau snapshot `ready`.

## Invariants

Strategy A, seuils/gates, Oracle, Cost Gate, Aether, Lecture Technique, Atlas CURRENT engine, Market Core **38.15.11**, wallet et ordres réels : inchangés.
