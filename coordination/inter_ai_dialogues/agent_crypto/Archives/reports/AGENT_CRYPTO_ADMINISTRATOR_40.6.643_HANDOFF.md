# Agent-Crypto Administrator 40.6.643 — Market Hausses 5 EUR
**Statut :** BRANCHE ISOLÉE, VALIDATION FIREFOX EN ATTENTE. `main` INCHANGÉ.
**Base vérifiée :** 40.6.640, commit `7e302e9a5d55940d9bfbbb0ce39bd9cb548a4e44`.
## Pourquoi
Les cinq actifs sont classés par Market ; la récupération d'un historique EUR est une étape distincte.
La solution conserve exactement les cinq identifiants choisis et refuse toute courbe inventée.
## Correction
- Cotations : aucune modification Market Core / Trader / Bridge / USD.
- Première récupération : CoinGecko EUR direct 1j ; en secours : 2j EUR natif horaire, même ID.
- Validation horaire : couverture >=23h30, ancrage avant fenêtre, >=20 vrais points,
  trous <=90 minutes et dernier point <=90 minutes de la fenêtre. Ancien 12min réservé au flux 5min.
- Courbes : les historiques validés restent en cache navigateur ; aucun actif classé 6e n'est substitué.
- Bougies : Market OHLC EUR CoinGecko 24h en secours lorsqu'aucune paire compatible n'est disponible,
  même actif CoinGecko, bougies vraies, volume non fourni, granularité 30m affichée.
- Les cours Market 24h et les variations reconstruits depuis des courbes ne sont pas la même mesure.
## Contrôles
Syntaxe JS à contrôler en CI. Aucun résultat Firefox ni réseau réel promis à ce stade.
## Retour arrière
La branche ne touche pas à main. Fermeture de la branche/PR : retour instantané au runtime 40.6.640.
Pour un test isolé, revenir à https://blueazur-hub.github.io/erith-ia-memory/public/agent_crypto_erith_ia/administrator/
## Emplacements
administrator/app.js; administrator/js/market-microscope-candles.js; administrator/index.html; administrator/build.json.
## Commit
`Fix native EUR scanner hourly coverage and Market OHLC fallback`
