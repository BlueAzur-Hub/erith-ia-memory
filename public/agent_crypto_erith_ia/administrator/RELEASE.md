# Agent-Crypto 40.6.459 — EXECUTION COST CURRENCY PROOF HARDENING

## Objet unique
Fermer la dette Astra où une fixture `BTCUSDT + price_eur + bid/ask génériques` pouvait être acceptée comme carnet BTC/EUR.

## Cause
Deux permissivités se combinaient :
- une identité compacte `BTCUSDT` pouvait ne pas être retenue comme paire explicite ;
- `price_eur` suffisait à autoriser ensuite des `bid/ask` génériques, alors qu'un prix converti en EUR ne prouve pas la devise du carnet.

## Correction
- toute identité de paire compacte non réduite à l'actif seul `BTC` est traitée comme paire explicite ;
- toute paire explicite autre que `BTCEUR` est rejetée ;
- `price_eur` n'autorise plus les alias génériques de carnet ;
- les bid/ask génériques ne sont utilisables que si la devise EUR est prouvée par le carnet EUR spécifique, une paire BTCEUR explicite ou une devise EUR explicite.

## Protégé
Market Core 38.15.11 · frais · calculs de coût · Strategy · Oracle · Source Truth · Aether · Paper.

Aucun timer, observer, stockage, owner réseau ou ordre réel ajouté.
