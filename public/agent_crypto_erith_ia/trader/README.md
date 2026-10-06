# ERITH.IA Trading Desk — 40.6.596

## Objet
Finir la transposition fonctionnelle de **Lecture Technique / SOURCE DOCK**.

La structure HTML était déjà celle de l'Administrator, mais le Trader n'activait réellement que l'étiquette CoinGecko. Cette version transpose le propriétaire métier Source Dock sans importer `administrator/app.js`.

## Portails actifs
Pour un actif CoinGecko canonique :
- CoinGecko ;
- **Site officiel** ;
- Explorateur blockchain ;
- Whitepaper ;
- Code source ;
- Communauté ;
- Actualités ciblées.

Les métadonnées sont lues depuis `/api/v3/coins/{id}`, comme dans l'Administrator.

## Propriétaire
`trader/source-dock-native.js`

Il possède :
- validation des URL http/https ;
- dédoublonnage ;
- cache navigateur 6 h ;
- conservation stale maximale 7 jours ;
- bouton **Actualiser** ;
- retry 1 min / 5 min / 15 min ;
- état Direct / Cache / limité ;
- synchronisation sur l'actif sélectionné.

## News Sentinel
Visible dans le Source Dock mais **grisé / hors Trader**. Son moteur n'est pas chargé.

## Protégé
40.6.595 Interface Filtered Layout et 40.6.594 Graphique Ligne historique + EUR/USD restent inchangés.

## Terrain
Firefox opérateur : **PENDING CHRISTOPHE**.
