# Trader · G1 chronologie + Replay en lecture ponctuelle — 8 octobre 2026

## Objectif
Le test opérateur T0 (BTC/USDC, 300 bougies et carnet concordants) montre que 1 747 lignes Experiment contiennent trois dates absentes et une chronologie non ordonnée, 13 lignes After-cost ont une chronologie non ordonnée et 13 modèles de coûts partiels (spread/slippage). Replay déterministe non chargé dans le runtime T0 ; G2/G7 INCOMPLETE. Aucun acteur ne possède aujourd'hui le droit d'en déduire un PASS.

## Correctif minimal
- `administrator/js/strategy-a-durable-evidence-store.js` : au **seul moment de la restitution** de `cycles` et `after_cost`, tri chronologique stable par horodatages canoniques déjà reconnus par Evidence Dossier. Dates manquantes placées en fin de liste, sans date synthétique, sans réécriture IndexedDB, sans permutation du stockage ou du flux `paper_states`. Les lignes d'origine restent inchangées.
- `trader/trader-paper-t0.js` : exposer au maximum trois IDs des lignes sans dates sans en inventer ; au clic explicite « Capturer T0 », tenter le chargement **du seul** propriétaire Replay (`strategy-a-replay.js`) s'il n'est pas déjà en mémoire, avec la lecture Safety et Gate existante. Ne pas exécuter `self_test`, `run_foundation_tests`, de replay, ni charger les 28 modules de la cascade.
- `trader/trader-runtime-mirror.js` : rafraîchissement du cache T0 Firefox pour cette intervention ; pas de numéro de build dans les noms de fichiers.

## Limitations non falsifiables
Les trois dates manquantes de Experiment demeurent des preuves manquantes et bloquent `data_integrity_ready`. Le tri peut lever le seul défaut d'ordre After-cost mais les 13 lignes à coûts incomplets restent impropres à une validation complète. Le chargement du propriétaire Replay ne restaure pas la fondation G2/G7 sans test explicite de session sur les builds courants. G1 EVIDENCE_REQUIRED, G9 LOCKED, aucun ordre réel ni Paper autorisé.

## Protections
Market Core 38.15.11 ; Trader 40.6.624 ; Bridge, Backend, sources marché, gouverneur, réconciliation comptable, archives, stockage et données RAW inchangés. Aucun rafraîchissement implicite des archives ni mutation de certifications.

## Réception
- Tests synthétiques sur la fonction de tri : dates valides ordonnées, valeurs manquantes inchangées, source non mutée, Paper non trié, ordre stable à égalité.
- Test statique : parse des trois JS, pas de nouveaux chemins d'ordre ni de test implicite.
- Vérifier CI Trader/Archive, GitHub Pages ; ne pas affirmer la réussite avant la fin.
- Validation Firefox facultative **une seule capture T0** pour constater chronologie et G2/G7 : les trois dates manquantes doivent rester visibles et les coûts inconnus rester inconnus.

## ZIP
Contient seulement les 3 scripts existants avec arborescence relative et cette note.