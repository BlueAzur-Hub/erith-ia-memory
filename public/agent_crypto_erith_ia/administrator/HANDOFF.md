# HANDOFF — Agent-Crypto 40.6.457

## Test Firefox exact
**Ne pas provoquer le chemin d'échec `mount()=false`. Il est couvert par le harness.**

1. Faire `Ctrl+F5`.
2. Vérifier en haut : **Build 40.6.457 · Administrator**.
3. Ouvrir uniquement **Section 04 · Expérimentation & système**.
4. Ouvrir uniquement **Backend / API**.
5. Dans **SOURCE TRUTH CEX · READ ONLY**, vérifier :
   - `CEX READY` ;
   - Binance présent ;
   - Kraken présent ;
   - Coinbase présent ;
   - OKX présent ;
   - `4/4 source(s)` si le terrain courant les fournit.
6. Plus bas dans la même sous-section, vérifier **SOURCE INTELLIGENCE V1.3 · ADDRESS PROOF GATE · AUTO READ ONLY**.
7. Vérifier seulement que la ligne CEX reste chargée/fraîche. L'état global peut rester **PARTIEL** à cause du DEX.

**Rien d'autre à ouvrir pour .457.**

## Ce que valide .457
La correction ne change pas le comportement nominal visible. Elle durcit seulement le contrat interne : API disponible ≠ panneau monté. Le runtime READY n'est possible qu'après `mount() === true`.
