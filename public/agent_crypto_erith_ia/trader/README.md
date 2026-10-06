# ERITH.IA Trading Desk — 40.6.589

## Objet
Ajouter **le Graphique Crypto Ligne** à la surface Trader, sous le propriétaire Bougies déjà validé.

## Principe
Aucun second cockpit : le sélecteur natif **MICROSCOPE · Ligne / Bougies** reste l’unique changement de surface.

- **Ligne** → graphique historique style Administrator dans la même `.chart-shell`.
- **Bougies** → propriétaire `market-microscope-candles.js` existant, inchangé.
- La sélection Market reste la source d’identité de l’actif.
- La sélection Nouveaux listings reste compatible.

## Données
### Crypto canonique
Historique public CoinGecko `market_chart` dans la devise d’affichage active.

### Nouveaux listings
Réutilisation de `AgentCryptoNewListingLiveAsset.fetchCandles()` :
- 24h → 5m ;
- 7j → 1h ;
- 30j → 4h ;
- périodes longues → 1j selon couverture réellement disponible.

Aucune série synthétique.

## Interface transposée
Périodes :
**24h · 7j · 30j · 60j · 90j · 1a · Max ?**

La surface conserve :
- légende ;
- analyse historique ;
- axes temporels/prix ;
- tooltip au survol ;
- volume historique discret ;
- source et nombre de points.

## Protections
- Market Core 38.15.11 inchangé.
- Bougies inchangées.
- Profondeur inchangée.
- Fiche Crypto inchangée.
- Lecture Technique inchangée.
- READ ONLY ; aucun ordre réel.

## Terrain
Firefox : **PENDING CHRISTOPHE**.

Test demandé : BTC → Ligne, CT → Ligne, puis aller-retour Ligne / Bougies.

## Livraison 40.6.589
- PR #154 fusionnée.
- Merge commit : `b20ec32838ba6199825e8e5025bf55d3f22d5f63`.
- Build GitHub Pages : SUCCESS · run `37464985249`.
- ZIP : `downloads/AGENT_CRYPTO_TRADER_40.6.589_NATIVE_LINE_GRAPH.zip` · 149 049 octets.
- Syntaxe JS Trader : **PASS**.
- Terrain Firefox : **PENDING CHRISTOPHE**.
