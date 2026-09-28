# HANDOFF — Agent-Crypto 40.6.450

## Test Firefox unique
1. Vérifier **Build 40.6.450**.
2. Ouvrir **Simulation**.
3. Dans **EXECUTION COST TRUTH**, cliquer **MESURER KRAKEN + OKX**.
4. Sur la carte OKX, vérifier une ligne distincte de la latence :
   - `Fraîcheur : FRESH`
   - âge de quote
   - limite de fraîcheur
   - heure de quote.
5. Kraken doit continuer à afficher sa mesure normalement.

Aucun besoin de fabriquer une quote périmée dans la session réelle : les cas STALE/UNKNOWN/futur/croisé/mauvaise devise sont couverts par le self-test isolé.

## À ne pas confondre
La prochaine dette reste le loader Strategy : reprise après script chargé sans API + self_test trompeur. Ce n'est pas traité dans .450.

Checkpoints protégés : .441 · .442 · .445 · .446 · .448 · .449 · Market Core 38.15.11 · Aether.
