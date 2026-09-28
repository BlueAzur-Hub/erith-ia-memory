# HANDOFF — Agent-Crypto 40.6.456

## Test Firefox exact
**Ne pas déplier toute la page.**

1. Faire `Ctrl+F5`.
2. Vérifier en haut : **Build 40.6.456 · Administrator**.
3. Ouvrir uniquement **Section 04 · Expérimentation & système**.
4. Ouvrir uniquement **Backend / API**.
5. Dans **SOURCE TRUTH CEX · READ ONLY**, vérifier :
   - `CEX READY` ;
   - Binance 5/5 ;
   - Kraken présent ;
   - Coinbase présent ;
   - OKX présent ;
   - `4/4 source(s)` si le terrain courant les fournit.
6. Toujours dans **Backend / API**, descendre au bloc **SOURCE INTELLIGENCE V1.3 · ADDRESS PROOF GATE · AUTO READ ONLY**.
7. Vérifier seulement que la ligne CEX est chargée/fraîche (par exemple `CEX 5/5`). **L'état global peut rester PARTIEL à cause du DEX : ce n'est pas un échec de .456.**

**Rien d'autre à ouvrir pour le test .456.**

Le chemin d'échec fail-closed (freshness guard absent / downstream timeout) est couvert par le harness automatisé ; il ne faut pas provoquer volontairement une panne dans Firefox.
