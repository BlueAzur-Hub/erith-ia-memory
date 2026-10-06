# ERITH.IA Trading Desk — 40.6.600

## CANONICAL CHART OWNER EXTRACTION

40.6.599 est rejetée terrain.

La cause n'était pas un simple cache manquant : depuis 40.6.589, le Trader possédait son propre moteur Ligne (fetch, périodes, cache, validation et rendu). 40.6.599 lisait le stockage brut de l'Interface mais ne réutilisait pas son contrat d'intégrité ; une série d'environ 24 h pouvait donc être affichée sous le bouton Max.

## Correction

Le propriétaire historique est maintenant extrait dans :

`administrator/js/chart-history-owner.js`

Le nom du fichier ne contient aucun numéro de build.

Il reprend la lignée du Graphique Administrator :

- périodes : 24h / 7j / 30j / 60j / 90j / 1a / Max ;
- cache exact par actif + devise + période + famille de source ;
- mêmes seuils minimum de points et de couverture ;
- validation chronologique et fraîcheur ;
- même stockage canonique : `agent_crypto_storage_relief_40278 / payloads` ;
- clé historique : `agent_crypto_erith_ia_real_charts_v1_1_alpha_26_37_top50` ;
- EUR : Binance sur les actifs canoniques supportés, CoinGecko sinon ;
- USD : CoinGecko USD natif et cache USD isolé.

`trader/line-chart-native.js` ne possède plus de History Bank ni de fallback « période couvrante ». Il reste l'adaptateur visuel du Trader : canvas, tooltip, Volume et pont New Listings.

## Règle de période

Une période exacte valide existe : elle est affichée immédiatement.

Elle est absente ou périmée : le propriétaire canonique peut l'actualiser auprès de sa source, puis la stocke dans le cache partagé.

Une série plus courte ne peut jamais être renommée 7j, 30j ou Max.

## Protégé

- Administrator 40.6.571 : runtime non importé et non modifié ;
- Market Core 38.15.11 ;
- PAIR Central Truth ;
- Bougies ;
- Profondeur ;
- Lecture Technique ;
- Source Dock ;
- Fiche ;
- Math Core ;
- EUR / USD ;
- READ ONLY · aucun ordre réel.

## Test Firefox

BTC / USD / Ligne :

24h → 7j → 30j → 60j → 90j → 1a → Max.

À vérifier pour chaque période :

- bouton actif = période réellement couverte ;
- dates début/fin cohérentes ;
- aucune série 24 h affichée sous Max ;
- PAIR reste SYNC ;
- un cache exact est utilisé lorsqu'il existe ;
- une actualisation réseau n'a lieu que si le propriétaire canonique en a besoin.

Puis EUR → USD, et BTC → ETH → SOL.
