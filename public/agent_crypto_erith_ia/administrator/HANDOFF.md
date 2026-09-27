# Handoff Seven — 40.6.432 · Strategy A Execution Cost Truth

## État courant

Build : **40.6.432**.  
Parent : **40.6.431**.  
Market Core : **38.15.11**.

Aether, CSS cockpit, Oracle métier, Risk, Paper et Market Core restent protégés.

## Pourquoi cette version existe

40.6.431 a démontré que le coût 0,60 % est un modèle pédagogique et non une preuve des coûts réels de plateforme.

40.6.432 mesure donc séparément, sur BTC/EUR :

- Kraken Pro ;
- OKX Europe ;
- frais Maker / Taker de référence ;
- spread ;
- profondeur du carnet ;
- glissement simulé 10 / 25 / 50 / 100 € ;
- coût Market → Market ;
- planchers Post-only.

## Geste opérateur

Firefox → Ctrl+F5 → Simulation / Strategy A → panneau **EXECUTION COST TRUTH** → **MESURER KRAKEN + OKX** → **EXPORTER**.

Christophe n'a rien à chercher dans la console.

## Lecture attendue

Cette version ne doit pas dire quelle plateforme choisir. Elle fournit les mesures nécessaires pour comparer.

Si les deux plateformes répondent :
- comparer le coût total des micro-opérations ;
- conserver séparément frais, spread, profondeur et glissement ;
- ne pas confondre tarif de référence et tarif réellement appliqué au compte.

Si une plateforme échoue :
- conserver la mesure de l'autre ;
- afficher l'erreur ;
- réparer uniquement le propriétaire réseau concerné.

## Prochain D

1. valider le terrain .432 ;
2. analyser l'export réel Kraken + OKX ;
3. décider si davantage d'échantillons sont nécessaires ;
4. calibrer bullAmplitude ↔ MFE avec les observations disponibles ;
5. seulement ensuite tester en Paper un Cost Gate fondé sur un coût d'exécution vérifié.

Règle : **une intention → un propriétaire → une modification → une preuve → STOP**.
