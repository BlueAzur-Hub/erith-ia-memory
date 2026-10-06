# ERITH.IA Trading Desk — 40.6.594

## Objet
Restaurer la **sémantique historique réelle** du survol Graphique Ligne, pas seulement son habillage.

## Parité Administrator
Sur le Graphique Ligne :
- le point historique survolé est maintenant marqué directement sur la courbe ;
- le tableau porte le titre `PRIX HISTORIQUE · VARIATION <période>` ;
- le prix affiché est celui du **point historique sous le pointeur** ;
- la variation affichée reprend la logique Administrator : variation normalisée depuis le début de la période sélectionnée ;
- le `change24h` courant du Market n'est plus injecté dans un point historique ;
- l'horodatage texte ajouté par le Trader a été retiré du tableau pour revenir au contrat visuel de l'Interface.

## Hérité de 40.6.593
- DOM / classes natives `atlas-chart-tooltip` ;
- identité actif ;
- pont de couleur ;
- styles Administrator 40.6.571.

## Inchangé
Interface Ghost Skeleton, Lecture Technique, Market, Bougies, Profondeur, Math Core, READ ONLY et absence d'exécution réelle.

## Terrain
Firefox opérateur : **PENDING CHRISTOPHE**.
