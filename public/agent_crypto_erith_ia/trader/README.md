# ERITH.IA Trading Desk — 40.6.592

## Objet
Faire du Trader une **projection filtrée de l'Interface Administrator**, pas une deuxième application.

## Principe
- les surfaces utiles au Trader restent réelles, actives et à plein contraste ;
- les fonctions exclues conservent une **mémoire visuelle grise** ;
- cette mémoire est uniquement du HTML/CSS de présentation : aucun propriétaire métier, aucun listener, aucun fetch, aucun état restauré.

## Actif dans Trader
- Marché / Market Snapshot ;
- Graphique Ligne ;
- Bougies ;
- Profondeur ;
- Lecture Technique ;
- EUR / USD ;
- Fiche ;
- Math Core ;
- Nouveaux listings.

## Mémoire dormante
Le corps de page ajoute une silhouette grise pour :
- Oracle ;
- Atlas ;
- Sources ;
- Décision ;
- Analyse ;
- Système ;
- Projets ;
- Aether.

Ces panneaux sont `aria-hidden`, `pointer-events:none` et ne chargent aucun script.

## Grammaire
- couleur / cyan / champagne : actif Trader ;
- gris : existe dans Agent-Crypto mais hors mission Trader ;
- rouge : sécurité / interruption.

## Protégé
Administrator 40.6.571, Market Core 38.15.11, propriétaires Bougies / Profondeur / Quote Currency / New Listings / Math Core.

## Terrain
Firefox opérateur : **PENDING CHRISTOPHE**.
