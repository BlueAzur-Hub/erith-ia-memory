# Seven Heaven — Découverte contrôlée des archives L2 historiques OKX Spot USDC

**Préenregistré le 12 novembre 2026 AVANT consultation des archives ciblées.**
Étude documentaire et récupération de **métadonnées uniquement**, en lecture publique, sans ordres ni accès de compte.

## Pourquoi changer de méthode

Les deux observations Spot du 12 novembre sur BTC/USDC et ETH/USDC montrent une évolution ponctuelle du spread, mais ne permettent **pas** une distribution temporelle, des quantiles, une mesure fiable de stress, ni de rejouer les carnets de 2024–2026.

OKX affiche [des archives L2 haute résolution depuis mars 2023](https://www.okx.com/historical-data), et [sa documentation d'API V5](https://www.okx.com/docs-v5/en/) mentionne une fonction **Get historical market data** depuis septembre 2025, avec `module=4` pour 400 niveaux. Le registre public de modules peut dépendre des paires, de leur date de cotation et de la région. **Disponibilité spécifique BTC-USDC/ETH-USDC non prouvée à la création de ce protocole.**

## Fenêtre de découverte et requêtes figées

Rechercher **une seule journée UTC, le 15 octobre 2026**, sur les deux paires Spot **BTC-USDC et ETH-USDC** exclusivement. Date choisie comme test technique au sein d'une période antérieure au protocole ; **pas** un choix de rendement ou une validation hors-échantillon.

Utiliser uniquement l'endpoint public documenté `GET /api/v5/public/market-data-history` avec :
- `module=4` (400 niveaux), `instType=SPOT`, `dateAggrType=daily` ;
- `instIdList=BTC-USDC` puis `ETH-USDC` dans deux requêtes distinctes ;
- `begin=2026-10-15T00:00:00Z`, `end=2026-10-15T23:59:59Z`, encodés en millisecondes Unix ;
- domaine public `www.okx.com` ; si refus géographique, éventuellement **eea.okx.com** pour consultation publique, sans authentification. Journaliser ce changement explicitement et ne pas masquer l'échec initial.

## Critères d'admissibilité de la réponse

Archiver chaque **réponse API JSON brute** et son SHA-256, le temps de réception et les paramètres. `code=0` signifie requête acceptée, **pas** qu'un fichier d'archives pour la paire a été trouvé. Identifier les champs réels, les nombres de fichiers, dates/instruments et les URL publiques si présentes. Un lien temporaire n'est pas une preuve de disponibilité durable : publier le domaine et le chemin (sans signature query éventuelle), les dates d'expiration si connues.

**Aucun téléchargement automatique de ZIP/L2 de taille inconnue**, aucune extraction de millions de niveaux, aucune comparaison de performance ou d'historique de spreads avant réception et validation d'octets d'archive. Si aucune archive ou requête invalide, produire un bilan exact `unavailable` ou `metadata_only` — jamais un résultat chiffré inventé.

## Risques de validité

- « L2 depuis mars 2023 » signifie couverture **de la plateforme**, et **pas de chaque paire cotée**. La précédente réponse de `public/instruments` a retourné pour BTC-USDC et ETH-USDC `listTime=1755763200000` (2025-08-21 UTC) : **ne pas supposer** la présence de ces instruments en 2023 ou 2024.
- Les archives potentiellement lourdes exigent une stratégie de sous-échantillonnage reproductible, une conservation des checksums et une attribution temporelle et instrumentale avant toute statistique.
- Ne pas confondre un carnet en 2026 avec les cours Bitstamp/USD historiques en 2024, ni USDC avec USD et USDT.

## Livrables

Script Python standard-library à lecture publique seule, autotests, preuves JSON / rapport de découverte / passation dans `coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/`. Workflow GitHub Actions ponctuel **non récurrent**. Les nouvelles observations ne déclenchent aucune modification EMA, Trader, Administrator, Operator, Bridge et n'autorisent aucun ordre réel.
