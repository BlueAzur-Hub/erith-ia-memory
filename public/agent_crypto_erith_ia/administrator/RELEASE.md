# Agent-Crypto — Strategy Auto Residency Recovery

Build **40.6.405** · parent **40.6.404** · Market Core **38.15.11**.

Contrat opérateur : **Strategy A travaille automatiquement même si Simulation reste fermée.**

Preuve 40.6.404 : les coûts dominants étaient portés par Replay / After-Cost presentation / Paper Lifecycle presentation / TRADUS Shadow presentation.

40.6.405 applique une séparation moteur / présentation / diagnostic :
- Strategy Core passe de 10 à 8 modules : Replay Sandbox + Replay Acceptance quittent le boot prioritaire ;
- Replay reste disponible par le loader Evidence/Diagnostic explicite ;
- Auto A s'arme automatiquement après Strategy Core, sans ouverture de Simulation ;
- si nécessaire, le workspace local bascule automatiquement sur STRATÉGIE A ;
- un STOP opérateur explicite en session reste respecté ;
- Paper Lifecycle et After-Cost gardent leurs API métier résidentes, mais leurs panneaux ne se construisent qu'à l'ouverture de Simulation ;
- TRADUS Shadow Ledger / Paper Shadow / Observability / Data-UI quittent le postboot automatique ;
- ces quatre propriétaires se chargent automatiquement au **premier événement TRADUS**, sans clic opérateur, puis traitent ce premier événement ;
- les panneaux TRADUS ne sont plus auto-montés pendant le boot.

Protections inchangées : Market Core 38.15.11, Strategy A thresholds / Cost Gate / Risk Governor, Math, Aether métier, Oracle, Lecture Technique, REDIVIDER, Storage schemas, aucun ordre réel.

Terrain Firefox : **PENDING**.
