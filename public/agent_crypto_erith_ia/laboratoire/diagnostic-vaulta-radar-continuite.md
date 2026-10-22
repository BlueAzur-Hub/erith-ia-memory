# ERITH.IA · Audit de continuité Vaulta A et Radar ciblé
**Observation datée : 22 octobre 2026, captures Firefox utilisateur vers 09:15–09:22 Paris.**  
**Mode : lecture seule · document de diagnostic · aucune modification d'ordres.**

## 1. Cas constaté : sélection Vaulta A, courbe ZEC résiduelle

- Capture ~09:15 : entête `A · Vaulta`, et fiche latérale Vaulta (`A`, `0,094085 USD`), mais **ancienne courbe verte ZEC** et vignette ZEC ~1 263 USD encore visibles. L'entête du graphique annonce temporairement `HISTORIQUE CONSERVÉ` et affiche une échelle d'environ 1 300 USD, manifestement incompatible avec l'actif A autour de 0,094 USD.
- Capture ~09:17 : `A · Vaulta` reprend sa courbe **jaune** et une échelle autour de 0,10 USD, avec `HISTORIQUE DIRECT COINGECKO` (288 points). Le graphique a donc fini par charger correctement. Ce comportement ne prouve ni absence d'historique A ni défaut intrinsèque du fournisseur ; **il démontre un état transitoire de surface attribuant encore ZEC à la sélection A**.
- Capture ~09:22 : panneau Radar du Trader affiche `Radar partiel · Top 1000 : identités de rang Top 1000 incohérentes`. La fiche à droite concerne Figure Heloc `FIGR_HELOC`, sans relation directe démontrée avec le graphique A. Ne pas confondre cette alerte d'inventaire avec la transition ZEC → A.

## 2. Cause / hypothèses techniques : ne pas confondre analyse et correction

Lecture du code `administrator/js/market-microscope-candles.js` :
- Le module de bougies prévoit déjà un **nettoyage au changement d'actif** (`handleCanonicalSelectionChanged`, lignes 924–953 du fichier observé). Il vide `state.rows` et interrompt la requête en cours si l'actif chargé diffère de l'actif sélectionné.
- Cette protection porte sur **le microscope de bougies** ; elle **ne démontre pas** que le propriétaire du tracé principal CoinGecko (modes Ligne/Hybride) efface immédiatement la surface précédente au début de chaque sélection.
- Le `graph-owner-handshake-406515.js` encapsule plusieurs fonctions de rendu et de settlement de devise mais n'identifie pas, à lui seul, les points historiques de la courbe à l'actif courant.
- **Hypothèse technique à vérifier dans Firefox** : un décalage entre propriétaire du titre/fiches et propriétaire du dataset principal laisse un ancien rendu ZEC sous le nouvel entête Vaulta jusqu'à l'arrivée de l'historique CoinGecko correct.

## 3. Invariants et critères de validation

1. Une sélection nouvelle invalide immédiatement le rendu **du propriétaire graphique principal** (pas seulement celui des bougies), sans détruire les caches IndexedDB utiles.
2. Tant que la série n'est pas identifiée comme `coin_id = vaulta` (ou identifiant canonique vérifié), afficher **« chargement de A / historique non confirmé »** au lieu de la série ZEC et de son snapshot.
3. Un retour tardif d'une requête sur ZEC ne peut pas écraser une sélection A plus récente (token de requête et identité de série vérifiés).
4. Courbe, axes, légende, snapshot, tooltip, fiche latérale et période doivent correspondre à **un seul actif canonique**, au même état de sélection.
5. Test obligatoire : ZEC → A → ZEC → A rapidement, en mode Ligne puis Hybride, avec réseau lent, retour depuis onglet masqué, et Firefox Ctrl+F5. Ne pas casser `Top 5`, `F11`, le tableau comparatif ou le Market Core protégé.
6. La cotation USD CoinGecko de A et une éventuelle paire Spot `A-USDC` ne sont pas interchangeables ; les référentiels devise/fournisseur doivent rester affichés explicitement.

**Statut : anomalie observée, correction graphique principale non certifiée.** Ne pas annoncer « corrigé » sur la seule base du second écran correct.

## 4. Couverture publique réellement relue pendant cette passation

- `data/crypto/radar-verified-target-hourly/latest.json` : `2026-10-22T06Z`, `observed_at_utc=2026-10-22T06:16:41Z`, BR/JCT/BEAM tous `OBSERVED`.
- `data/crypto/radar-verified-target-hourly/coverage-latest.json` : **1 heure archivée**, **1 heure attendue depuis la première**, 0 heure manquante *dans cette fenêtre d'une heure*, pas une garantie de couverture continue de la journée.
- `data/crypto/case-market-hourly/latest.json` : ZEC et AXIS `OBSERVED` à `2026-10-22T06Z`, relevé `06:16:39Z`.
- À ce contrôle, **aucune heure consécutive supplémentaire n'était visible dans les derniers index**. Les tâches GitHub déjà programmées ne constituent pas la preuve d'une collecte effectivement réussie aux heures suivantes.

**Prochain contrôle :** vérifier les résultats du workflow existant (permissions d'écriture, échec API, nouvelle date UTC, archive journalière et état `latest.json`). Ne jamais produire de backfill synthétique. Si le workflow est en erreur, distinguer erreur de planification et source Spot indisponible.

## 5. Priorités des données à consolider

| Groupe | État certain | Action suivante |
|---|---|---|
| ZEC / AXIS | Premier relevé public réel, nouveaux historiques attendus | Vérifier heures successives, spread et profondeur sans interpolation |
| BR / JCT / BEAM | Trois contrats Bitget contrôlés au premier passage | Contrôler collecte continue + erreurs et divergences de contrat |
| BAT / ALT / REZ | Contrat projet connu, identité paire Binance non établie | Trouver source explicite de listing natif ; ne pas promouvoir par symbole |
| AUCTION / THETA / DOS / Vaulta A / IOST / COMP | Six dossiers humains publiés dans l'Atlas | Détailler la preuve de pair CEX, réseau, migrations et fraîcheur des sources |
| Radar Top 1000 | Alerte visible de rang/identité incohérents | Audit séparé des identifiants de classement et du cache de fiche avant toute expansion |

**Décision conservatrice :** priorité aux transitions fiables et à la continuité horaire réelle ; ensuite seulement élargir la liste des cryptos suivies. Aucun ordre réel, aucune nouvelle minuterie ni nettoyage des fichiers publics sans audit et validation.

## 6. Références canoniques

- Trader : `trader/trading-desk.html`
- Microscope : `administrator/js/market-microscope-candles.js`
- Handshake : `administrator/js/graph-owner-handshake-406515.js` (nom historique conservé)
- Radar humain : `laboratoire/radar-priority-dossiers.html`
- Archives ZEC/AXIS : `data/crypto/case-market-hourly/`
- Archives BR/JCT/BEAM : `data/crypto/radar-verified-target-hourly/`
- Dépôt MASTER : `BlueAzur-Hub/erith-ia-memory`

Ce document identifie les **preuves déjà obtenues**, les **hypothèses non testées** et les **tests de non-régression obligatoires** ; il ne revendique aucune correction non vérifiée.
