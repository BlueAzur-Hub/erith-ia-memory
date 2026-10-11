# ERITH.IA Trading Desk — 40.6.627

## Architecture active

Le Trader est de nouveau une **page autonome** :

`public/agent_crypto_erith_ia/trader/trading-desk.html`

Il ne charge plus `administrator/index.html` dans une iframe et ne charge plus de runtime miroir.

Le Trader peut réutiliser des styles et modules de données canoniques de l’Administrator, mais il possède son propre DOM, son propre point d’entrée et ses propres contrôles de présentation.

## Périmètre actuel

Conservé dans le Trader :

- Graphique ;
- Lecture Technique ;
- Market ;
- Math Core ;
- Bougies OKX publiques ;
- Profondeur / carnet OKX public ;
- historique vérifié / Coffre ;
- cas d’école BTC intégré directement dans `trading-desk.html`.

Retiré du Trader actif :

- Strategy A ;
- Paper ;
- T0 / Auto A ;
- runtime miroir Administrator.

Strategy A reste dans l’Interface / Administrator. Aucun changement de son propriétaire métier n’est revendiqué ici.

## Cas d’école BTC

BTC devient l’actif de référence du Trader pour vérifier la cohérence entre :

Market → Graphique → Lecture Technique → Bougies → Carnet → Historique vérifié → futur compte OKX privé.

Le Coffre reste une couche historique distincte. Les archives Binance Spot USDT ne sont jamais renommées USD ou USDC.

## Prochaine étape

Raccorder le compte OKX réel par le chemin sécurisé prévu :

local → Bridge → Aether Trust → API privée OKX.

Premier jalon : lecture des soldes, ordres, exécutions et frais. Aucune permission de retrait n’est nécessaire. L’exécution réelle reste désactivée tant que ce jalon n’est pas validé.

## Sécurité

Aucun secret OKX dans GitHub Pages, le DOM, localStorage ou IndexedDB.

Market Core 38.15.11 protégé.
