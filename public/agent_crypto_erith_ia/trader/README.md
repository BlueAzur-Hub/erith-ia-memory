# ERITH.IA Trading Desk — 40.6.590

## Objet
**Interface Fidelity II** : arrêter d'ajouter des propriétaires Trader parallèles et rapprocher encore le poste Trader de l'Administrator 40.6.571 validé.

## Cette version
- conserve le Graphique Ligne 40.6.589 et les vrais propriétaires Bougies / Profondeur / devise ;
- restaure un **vrai bouton Volume** pour le Graphique Ligne : il masque/affiche réellement les volumes ;
- remplace le petit résumé Trader par la hiérarchie d'analyse de l'Interface :
  - actif + nom + période + devise ;
  - vérité de source ;
  - prix / variation / bas / haut / amplitude ;
  - départ / dernière / nombre de points / date de série / source ;
- ajoute un **propriétaire de contexte unique** pour Lecture Technique :
  - actif sélectionné ;
  - Prix EUR/USD ;
  - variation 24 h marché ;
  - Fiche active ;
  - Source Dock ;
  - état marché / spot / historique ;
  - réseau, cache, latence ;
  - intégrité graphique ;
- corrige le bug où la carte **24 h** affichait la granularité Bougies (ex. `5m`) au lieu de la variation 24 h ;
- laisse les Support / Résistance au propriétaire Bougies existant.

## Protégé
- Administrator 40.6.571 ;
- Market Core 38.15.11 ;
- propriétaires Bougies / Profondeur / Quote Currency ;
- New Listings ;
- Math Core ;
- aucune exécution réelle.

## Direction suivante
40.6.591 servira de test visuel **Interface miroir / exclusions grisées** : conserver la géométrie de l'Interface et rendre visibles mais inactifs les modules exclus du Trader, afin de comparer cette approche avec la suppression pure.

## Terrain
Firefox opérateur : **PENDING CHRISTOPHE**.
