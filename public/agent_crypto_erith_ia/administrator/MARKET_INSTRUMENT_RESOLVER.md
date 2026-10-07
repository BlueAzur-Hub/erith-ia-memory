# Market Instrument Resolver — 40.6.619

## Pourquoi cette version existe

Le terrain 40.6.618 a validé **OKB-USDC / OKX / 300 bougies** après réparation du Backend 1.4.5.

Le test suivant avec **Bitway (BTW)** a révélé la dette architecturale restante :
- Ligne / CoinGecko fonctionnait ;
- Bougies fabriquait d'abord `BTW-USDC`, puis `BTW-USDT` ;
- OKX répondait que ces instruments n'existaient pas ;
- Profondeur répétait le même modèle.

La cause n'était plus un défaut BTW : le runtime ne possédait aucun propriétaire chargé de demander **où l'actif sélectionné est réellement coté**.

## D — comportement demandé

`crypto sélectionnée → chercher une paire SPOT réellement disponible → choisir la source → afficher`

Aucun patch symbole par symbole.

## Nouveau propriétaire

`administrator/js/market-instrument-resolver.js`

Le propriétaire reçoit l'actif Market courant et la devise d'affichage, puis interroge uniquement le **Backend local read-only 8790**.

Backend requis : **1.4.6 — Market Instrument Resolver**.

Routes :
- `/market-resolve`
- `/market-candles`
- `/market-book`

## Résolution

Priorité fournisseurs :
1. **OKX**
2. **Bitget**
3. **Binance**

Priorité des quotes :
- affichage USD : **USDC → USDT** ;
- affichage EUR : **EUR → USDC → USDT**.

Le resolver interroge les catalogues SPOT publics ; il ne construit plus une paire puis ne suppose plus qu'elle existe.

### Capacités

| Source | Bougies | Carnet/Profondeur | Pourquoi |
|---|---:|---:|---|
| OKX | oui | oui | catalogue SPOT + timestamps carnet |
| Bitget | oui | oui | catalogue SPOT + timestamp carnet public |
| Binance | oui | non dans 40.6.619 | le depth standard ne fournit pas le timestamp source exigé par le contrat FRESH/STALE actuel |

Le **Graphique Ligne CoinGecko existant reste intact**. Une crypto sans microstructure CEX compatible peut donc garder son historique Ligne sans fabriquer de Bougies ou de carnet.

## Cas de référence BTW

Les sources publiques actuelles indiquent que Bitway est négocié en **BTW/USDT sur Bitget** :
- CoinGecko Markets : https://www.coingecko.com/en/coins/bitway
- annonce Bitget : https://www.bitget.com/support/articles/12560603859567

Le resolver 40.6.619 doit donc pouvoir produire :

`BTW sélectionné → OKX absent → Bitget BTW-USDT trouvé → Bougies Bitget → Carnet Bitget`

sans ajouter `BTW` dans une whitelist.

## EXEC / SETTLE

La dette visuelle `DISPLAY USD · EXEC BTC-EUR · SETTLE EUR` est corrigée au même propriétaire de vérité.

`quote-currency-architecture-406497.js` accepte désormais la vérité résolue :
- exemple OKB : `DISPLAY USD · EXEC OKB-USDC · SETTLE USDC` ;
- exemple BTW : `DISPLAY USD · EXEC BTW-USDT · SETTLE USDT` ;
- aucune source : `EXEC INDISPONIBLE · SETTLE —`.

Changer DISPLAY ne fabrique toujours aucune conversion d'exécution.

## Identité

Le resolver part de l'actif canonique sélectionné dans Market et vérifie que le catalogue de l'exchange possède le même **base symbol + quote + état SPOT actif**.

Ce n'est **pas** une preuve d'identité par adresse de contrat. Le contrat `ticker_unique_assumption=false` reste conservé : les actifs ambigus par ticker devront continuer d'utiliser les mécanismes d'identité spécialisés déjà présents dans le Radar / New Listings.

## Backend 1.4.6

Package local stable :
`AGENT_CRYPTO_AETHER_CONTROL_R19_BACKEND_OKX_LOCAL_TRANSPORT.zip`

SHA-256 :
`c2a5357d6bef9360f5f7de809c8fb9c5dc83e6cd51a8f626f24f0065a827e98f`

Bridge : **V1.9.13 inchangé**.

Tests hors réseau :
- Python compile : PASS ;
- Backend self-test : PASS ;
- resolver synthétique OKX : PASS ;
- resolver synthétique Bitget BTW-USDT : PASS ;
- Bougies Bitget normalisées : PASS ;
- carnet Bitget avec timestamp source : PASS ;
- Binance candles fallback : contrat présent ;
- ordres / wallet / API privée : absents.

## Protections

Non refaits :
- Market Core **38.15.11** ;
- Graphique Ligne / CoinGecko ;
- formules Bougies ;
- Lecture Technique business logic ;
- Oracle ;
- Math Core ;
- Target Top ;
- Market Flow ;
- Aether ;
- Strategy / Cost Gate ;
- Bridge 1.9.13.

Aucun ordre réel, wallet, retrait ou clé exchange.

## Terrain attendu

Après installation du Backend 1.4.6 :

1. OKB → USD → Bougies → **OKX · OKB-USDC**.
2. BTW → USD → Bougies → **Bitget · BTW-USDT** si l'instrument est toujours online.
3. BTW → Profondeur → **Bitget · BTW-USDT** avec timestamp source.
4. Choisir une autre crypto au hasard :
   - source/pair réelle si trouvée ;
   - sinon indisponibilité explicite ;
   - jamais BTC de secours.
5. Vérifier `DISPLAY / EXEC / SETTLE` dynamique.
6. Aucun ordre réel.

Terrain Firefox : **PENDING opérateur**.
