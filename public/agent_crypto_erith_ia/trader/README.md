# ERITH.IA Trading Desk — 40.6.591

## Objet
Tester concrètement l'idée **« repartir de l'Interface puis griser ce qui est exclu »** sans reconstruire le Trader ni réintroduire les propriétaires métier Administrator.

## Ce qui change
Le menu supérieur reprend la géométrie et les repères visuels de l'Administrator :
- **Marché** et **Graphique** restent actifs ;
- Livecheck, Atlas, Oracle, Sources, Décision, Analyse, Système, Projets, Vue Normal, Command Center et Aether restent visibles mais **gris / désactivés** ;
- aucun de ces boutons gris ne charge de module, ne lance d'appel, ne restaure de contexte ni n'ajoute de logique.

## Ce qui reste 40.6.590
- Graphique Ligne et tableau d'analyse Interface Fidelity II ;
- Bougies / Profondeur / devise natifs ;
- Lecture Technique synchronisée sur l'actif unique ;
- Market + Nouveaux listings ;
- Fiche native ;
- Math Core ;
- READ ONLY / aucune exécution réelle.

## But terrain
Comparer visuellement deux philosophies :
1. retirer les modules inutiles ;
2. conserver l'Interface comme squelette et **griser les modules exclus**.

Firefox opérateur tranche.
