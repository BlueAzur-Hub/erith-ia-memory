# HANDOFF — Agent-Crypto 40.6.459

## Test Firefox minimal
1. Ctrl+F5.
2. Vérifier **Build 40.6.459 · Administrator**.
3. **Section 04 · Expérimentation & système → Simulation**.
4. Descendre à **STRATEGY A · EXECUTION COST TRUTH · 40.6.459**.
5. **Ne cliquer sur rien.**
6. Vérifier seulement que la mesure automatique nominale reste exploitable :
   - carte **OKX Europe · BTC/EUR** présente ;
   - fraîcheur **FRESH** si le backend courant fournit une quote fraîche ;
   - prix/spread présents ;
   - pas de **INVALID_PAIR** ni **MISSING_BOOK** sur le terrain nominal.

La fixture BTCUSDT contradictoire est couverte par le harness, pas à reproduire dans Firefox.
