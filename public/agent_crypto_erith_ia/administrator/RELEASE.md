# Agent-Crypto — 40.6.434 · STRATEGY A OKX ONE-SHOT RECOVERY + READABILITY

Parent : **40.6.433**.  
Market Core : **38.15.11**.

## Preuve terrain parent

40.6.433 est **PASS pour le montage** :
- panneau Execution Cost Truth visible dans Firefox ;
- Kraken BTC/EUR mesuré ;
- spread, profondeur et glissement Kraken calculés ;
- OKX : **NetworkError** sur le REST EEA direct ;
- Firefox a également affiché un avertissement de ralentissement global de la page.

Le défaut ouvert est donc OKX, pas le montage.

## Correction 40.6.434

Propriétaire unique :

`js/strategy-a-execution-cost-truth.js`

### OKX

La mesure reste **strictement manuelle**, au clic sur `MESURER KRAKEN + OKX`.

Ordre de transport :

1. **OKX Europe WebSocket public EEA**  
   `wss://wseea.okx.com:8443/ws/v5/public`  
   canal `books` · instrument `BTC-EUR`.

   Le WebSocket est **one-shot** :
   - ouvert uniquement au clic opérateur ;
   - premier snapshot carnet lu ;
   - fermeture immédiate ;
   - aucun abonnement permanent.

2. Si le WebSocket EEA échoue : **REST public OKX**  
   `https://www.okx.com/api/v5/market/books?instId=BTC-EUR&sz=100`.

Le `NetworkError` brut n'est plus la lecture principale : en cas d'échec total, l'interface affiche un état court et place les détails dans **Diagnostic technique** replié.

### Lisibilité

Le panneau Execution Cost Truth seul reçoit :
- titre et sous-titre plus grands ;
- labels et valeurs plus grands ;
- tableau 10/25/50/100 € plus lisible ;
- boutons plus lisibles ;
- source de transport visible ;
- passage en une colonne lorsque l'espace horizontal devient insuffisant.

Aucun CSS global du cockpit n'est modifié.

## Protections

Inchangés :
- calcul spread ;
- calcul profondeur ;
- calcul slippage ;
- frais Kraken / OKX de référence ;
- Cost Gate 0,80 % ;
- coût pédagogique historique 0,60 % ;
- Oracle / bullAmplitude ;
- Risk ;
- Paper ;
- Market Core 38.15.11 ;
- Aether ;
- CSS cockpit global ;
- aucune clé API ;
- aucun wallet ;
- aucun ordre réel.

Aucun timer récurrent. Aucun WebSocket permanent. Aucun stockage ajouté.

## Test Firefox

1. Ctrl+F5.
2. Vérifier **Build 40.6.434**.
3. Ouvrir **Simulation / Strategy A**.
4. Descendre au panneau **STRATEGY A · EXECUTION COST TRUTH · 40.6.434**.
5. Cliquer **MESURER KRAKEN + OKX**.
6. Attendre les deux cartes.
7. Vérifier qu'OKX affiche soit **WS EEA · ONE-SHOT**, soit **REST PUBLIC · FALLBACK**.
8. Cliquer **EXPORTER** et transmettre le JSON.

Si OKX échoue encore : capture/dump uniquement. **Aucune console.**

Terrain : **PENDING FIREFOX**.
