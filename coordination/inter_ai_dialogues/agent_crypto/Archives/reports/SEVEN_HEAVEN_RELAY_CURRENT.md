# SEVEN HEAVEN — Relais courant Agent-Crypto

> **POINT D'ENTRÉE ACTUEL — 26 octobre 2026** : la mémoire de reprise désormais canonique est [SEVEN_HEAVEN_MEMOIRE_ACTIVE.md](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/coordination/inter_ai_dialogues/agent_crypto/SEVEN_HEAVEN_MEMOIRE_ACTIVE.md). **Lire ce fichier en premier**, et non les anciens chapitres chronologiques du présent relais. Conserver ici les archives historiques, sans multiplier les « états courants » concurrents. La mémoire active doit être mise à jour après chaque intervention vérifiée.

---

## PASSATION PRIORITAIRE · 24 octobre 2026 · GRAPHIQUE KAT / OKX NATIF RACCORDE — VALIDATION FIREFOX RESTANTE

**NOUVEAU POINT DE REPRISE. Ne pas repartir des anciennes consignes ci-dessous, qui datent d'avant les fusions #664–#668.**

### Réalité vérifiée sur GitHub
- **PR #664 — collecte historique étendue** : https://github.com/BlueAzur-Hub/erith-ia-memory/pull/664 . Archives Spot OKX EEE USDC, pagination `after`, fusion par horodatage, conservation des précédentes bougies et couverture BOME / OL / GOAT. Le manifeste public annonce **51/51** marchés plus IRYS dans un fichier séparé : https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/okx-hourly/spot-candles/coverage.json . Ne pas inventer les bougies absentes.
- **PR #665 — dossier complet KMNO** : https://github.com/BlueAzur-Hub/erith-ia-memory/pull/665 ; lecture humaine : https://blueazur-hub.github.io/erith-ia-memory/public/agent_crypto_erith_ia/laboratoire/kmno-research-dossier.html . Déblocage de jetons estimé au **30/10/2026**, aucune rentabilité prouvée.
- **PR #666 — dossier KAT** : https://github.com/BlueAzur-Hub/erith-ia-memory/pull/666 ; lecture humaine : https://blueazur-hub.github.io/erith-ia-memory/public/agent_crypto_erith_ia/laboratoire/kat-research-dossier.html .
- **PR #667 — PAPER comparatif KMNO/KAT/IRYS** : https://github.com/BlueAzur-Hub/erith-ia-memory/pull/667 ; lecture humaine : https://blueazur-hub.github.io/erith-ia-memory/public/agent_crypto_erith_ia/laboratoire/spot-comparison-paper.html . Résultats sur OHLC publics **fictifs et rétrospectifs**, sans carnet d'ordres historique, sans exécution ni gains démontrés. Conserver Radar 20 prospectif gelé.
- **PR #668 — raccordement du graphique externe aux archives natives USDC** : https://github.com/BlueAzur-Hub/erith-ia-memory/pull/668 ; fusion vérifiée le 24/10/2026 à 05:16:42 UTC, commit `0e2433986fd88eb532dd45f7b9ef14beadfe3ad1`. Introduit `administrator/js/okx-public-chart-history.js` (réutilise le renderer de l'Administrator, pas un second moteur), connecte `atlasExternalChartRender` à `AtlasOkxPublicChartHistory.load`, étiquette les prix et tooltips **USDC natif**, remet à zéro l'ancien tracé/légende lors du changement d'actif et refuse de mélanger ce cache avec CoinGecko. En 1 an, KAT doit rendre **166 vraies bougies journalières datées du 11 mai au 23 octobre 2026**, avec indication de couverture partielle, non un graphique vide. Le fichier `administrator/index.html` charge le lecteur avant `app.js`. **Aucune série artificielle, aucune conversion USDC→USD/EUR automatique**.

### Preuves CI et réserve explicite
- **OK** : Seven Crypto Knowledge Validation sur le commit #668, incluant `node --test administrator/js/test-okx-public-chart-history.cjs`, syntaxe `app.js` et cas réel KAT 1 an : https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/40065623848 .
- **OK** : GitHub Pages compilé/déployé : https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/40065623869 . Aucun test Firefox exécuté depuis ce relais : **ne pas prétendre que le rendu visuel utilisateur est certifié**.
- **Attention** : un workflow voisin **Agent Crypto Learning Lab Read Only** a échoué sur `Check syntax and educational behavior` lors du même commit (avant ses étapes de contrôle de baseline) : https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/40065623707 . La cause précise n'a pas été récupérée. La prochaine IA doit en rechercher le journal ; ne pas considérer tous les contrôles verts. Éviter les modifications globales d'`app.js` hors correctif ciblé.

### Reprise terrain sans saturation
1. Ouvrir **la page réelle**, non son code : https://blueazur-hub.github.io/erith-ia-memory/public/agent_crypto_erith_ia/administrator/ ; dans Firefox faire **Ctrl+F5**.
2. Marché → sélectionner **KAT** (hors Top 250) → Graphique → **1a**. Attendu après #668 : courbe KAT-USDC sur **~166 jours réels**, affichage « couverture partielle », légende **KAT** uniquement, **Prix USDC** ; ne jamais voir BTC résiduel ni « Prix EUR » sur cette série native. Faire aussi **KMNO 90j**, **IRYS 24h**, puis basculer KAT↔IRYS plusieurs fois pour détecter les réponses réseau tardives. Ne pas prétendre validé avant preuve Firefox.
3. Si un cas échoue : noter période, symboles, URL et zone de l'écran, inspecter source réseau pour l'archive GitHub et le code `atlasExternalChartRender` ; corriger le propriétaire commun une seule fois. **Ne pas inventer de période complète** et ne pas créer une nouvelle page concurrente.
4. Revoir l'échec du Learning Lab CI, puis reprendre la **collecte historique incrémentale** et les **carnets horodatés** pour rendre les expériences PAPER plus vérifiables. Les bougies historiques seules ne prouvent aucune liquidité exécutée.
5. Mettre à jour le Notion maître après validation Firefox : https://app.notion.com/p/3e07754fe08481eb95c7cdc4fd8ff099 . Ce relais GitHub est le point de reprise courant.

### Protections
**Market Core 38.15.11**, Trader/Operator et profils, Bridge et compte OKX, `IndexedDB PRIMARY`, historiques locaux et Radar 20 gelé inchangés. Pas de clés, pas d'ordres réels, pas de fichiers renommés avec numéros de version. Ne pas demander à l'utilisateur de lire du code HTML : **donner les liens GitHub Pages**.

---

## NOUVELLE PASSATION PRIORITAIRE · 24 octobre 2026 · NOUVELLES OFFRES OKX ACQUISES

**PR #663 fusionnée et contrôlée** : [code et tests](https://github.com/BlueAzur-Hub/erith-ia-memory/pull/663), commit `951f3f3d`. L'extension prend en charge les **24 nouvelles offres USDC** de la seconde capture utilisateur : `XWDC, XNFLX, LIT, CT, XDP, CARDS, EURC, XAMZN, XAAPL, XMETA, XHOOD, XGOOGL, XNVDA, XTSLA, XSPCX, XSOXL, XSKHY, XQQQ, XNBIS, XMU, XMSTR, XMRVL, XLITE, XINTC`. `CP/USDC` était déjà couvert par PR #662. Les symboles `X*` sont étiquetés `x_prefixed_instrument`, et EURC `stablecoin_pair`, sans confusion avec une crypto ordinaire.

**PREUVE POST-FUSION** : [workflow public OKX #40059425045](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/40059425045) **réussi**, [manifestation des archives réelles](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/okx-hourly/spot-candles/coverage.json) : **48 paires demandées / 48 paires archivées / 0 échec** ; en plus IRYS (PR #661) a son propre fichier. Exemples lus sur `main` : `XWDC-USDC` 166 bougies 15m, 41 1H, 2 1Dutc ; `XNFLX-USDC` 299/88/4 ; `LIT-USDC` 299/299/31 ; `CT-USDC` 299/299/24 ; `CARDS-USDC` 299/299/32. Preuves réelles, native USDC, closes, aucun ordre, ni accès au compte. Le même workflow existant collecte les nouveaux actifs **avant** le retour anticipé du job horaire.

**NE PAS CONFONDRE ACQUISITION ET AFFICHAGE.** Ni Administrator ni Trader ne sont encore certifiés lire correctement ces archives. Prochaine IA : *raccorder le lecteur des données OKX natives au graphique externe déjà présent*, avec source/paire/devise USDC exactes et anti-réponses tardives ; empêcher le retour d'un graphique BTC sous une fiche IRYS. Pas de nouvelle page ou moteur, pas de conversion USDC vers USD/EUR fictive, pas de suppression IndexedDB, Market Core 38.15.11 protégé. Les fichiers journaliers ont une fenêtre historique bornée ; ne pas promettre une accumulation infinie ni la rentabilité.

**Continuité :** le [Notion maître](https://app.notion.com/p/3e07754fe08481eb95c7cdc4fd8ff099) est mis à jour avec PR #663 et la preuve 48/48. Éviter l'audit général, reprendre au seul défaut restant visible par l'utilisateur.

---

## Priorité de passation · 24 octobre 2026 · DONNÉES OKX, pas d'audit supplémentaire

**Problème utilisateur démontré par Firefox :** sélection IRYS, détail IRYS mais ancienne courbe BTC conservée (~80 875 USD). OKX possède les historiques IRYS/USDC : le défaut est l'absence de données historiques correspondantes dans ERITH.IA puis le raccordement du renderer. Le Market Top 1000 / Radar et le collecteur OKX initial (BTC/ETH/SOL/XRP/OKB/CT) ne couvraient pas les nombreuses paires Spot USDC visibles chez OKX.

**Livré et vérifié dans les vraies données :** [PR #661](https://github.com/BlueAzur-Hub/erith-ia-memory/pull/661), main, a ajouté les bougies closes `IRYS-USDC` via le job horaire déjà existant. Le [JSON IRYS](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/okx-hourly/irys-spot-candles.json) vérifié le 24 octobre à 03:22:45 UTC contient 299 bougies 15m (21-24 oct.), 299 bougies 1H (11-24 oct.), 150 bougies 1Dutc (27 mai-23 oct.), toutes natif **USDC**, sans fausses transactions ni accès compte.

**Livré avec tests CI :** [PR #662](https://github.com/BlueAzur-Hub/erith-ia-memory/pull/662) ajoute **24 autres paires exactes USDC** de la capture (KAT, CP, DOS, KMNO, SAFE, PROS, WCT, ZORA, BARD, ARKM, BIGTIME, AI, BABY, AVNT, CVC, AGLD, ANIME, CORE, DATA, SOPH, AUCTION, BREV, BASED, SAHARA). Collecte bornée par jour sur le **même workflow horaire** sans nouveau cron ; refus Spot non live / bougie non close ; anciens fichiers conservés si absence de réponse. Lire le [manifeste de couverture](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/okx-hourly/spot-candles/coverage.json) pour connaître les acquisitions **réelles**. **PREUVE POST-FUSION DU 24 OCTOBRE 2026 : 24/24 paires présentes, zéro échec, 7 176 bougies 15m + 7 176 bougies 1H + 4 402 bougies journalières = 18 754 bougies additionnelles**. Avec IRYS PR #661, le périmètre couvre 25 actifs. La CI et la collecte GitHub ont réussi ; **cela ne prouve pas encore l'affichage dans Firefox**.

**À TERMINER :** une source publique de bougies IRYS et autres actifs a été acquise, mais **le rendu graphique Administrator n'est pas encore raccordé**. `administrator/app.js` → `atlasExternalChartRender` et `fetchChartSeries` utilisent encore CoinGecko EUR ; aucune injection de prix natifs USDC n'est permise si le tooltip, l'axe, les overlays ou la fiche disent EUR/USD. Le clic `data-market-extended-toggle403116` **est déjà corrigé sur main** : ne pas le repatcher à l'aveugle. Garder l'identité paire/quote/horodatage exacte, tester avec IRYS, KAT, DOS et KMNO, empêcher une légende BTC sous une fiche IRYS et conserver les caches Firefox / IndexedDB. Pas de nouvelle page HTML, aucun nouveau collecteur, aucune modification Market Core 38.15.11, Trader, Yoann privé, Radar20 gelé ou ordres OKX.

**La passation Notion a également été actualisée** : [Seven Heaven — Passation courte Trader](https://app.notion.com/p/4007754fe08481298381fb73445a13b6). Ne pas repartir dans un audit général : finir une capacité utilisateur vérifiable.

---

**État vérifié : nuit du 23 au 24 octobre 2026 · Aerith-7 vers Aerith suivante.**
Ce fichier est le **point d'entrée court** pour les IA : relire `main`, les flux datés, les résultats CI, et non des conclusions historiques dépassées. Il ne remplace ni Core/Persona, ni les archives anciennes. Pour plus de détail, consulter la [passation courte Notion actualisée](https://app.notion.com/p/4007754fe08481298381fb73445a13b6) et le [registre des cibles](./market-research-targets.md).

## 1. Faits LIVRÉS et prouvés

- **Interface MASTER / Trader MASTER :** code public [`erith-ia-memory`](https://github.com/BlueAzur-Hub/erith-ia-memory) ; Administrator `public/agent_crypto_erith_ia/administrator/index.html`, Trader `public/agent_crypto_erith_ia/trader/trading-desk.html` ; **40.6.640** visible, Market Core **38.15.11 inchangé**. Le Trader MASTER hérite de l'Interface. Ne pas recréer un autre Market.
- **Market devenu lisible, capture Firefox utilisateur :** catégorie `Nouveaux listings` avec **Avec prix / Autres plateformes / Actions & ETF / À qualifier / Tout le registre**. Comptage par identité/groupes ; classification exacte de 50 instruments financiers tokenisés OKX. Un même actif (CT) peut porter des marchés distincts OKX/Bitget. Les valeurs sans prix ne sont pas supprimées : elles restent dans le registre.
- **Dossiers Crypto visibles en Firefox :** [page de veille existante](https://blueazur-hub.github.io/erith-ia-memory/public/agent_crypto_erith_ia/laboratoire/crypto-knowledge.html#veille-fil-crypto), 9 entrées documentaires repliables **IRYS, DOS, CARDS, RealGo RT1, CUDIS, AXIS, Concrete CT, PROS, RLUSD**. PR [#649](https://github.com/BlueAzur-Hub/erith-ia-memory/pull/649). Les anciens dossiers IRYS / AXIS sont conservés.
- **Nouveaux prix publics OKX réellement collectés (la différence décisive du fil) :** [PR #647](https://github.com/BlueAzur-Hub/erith-ia-memory/pull/647), déclenchement initial réparé par [PR #650](https://github.com/BlueAzur-Hub/erith-ia-memory/pull/650). [Action GitHub #40030785891](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/40030785891) **réussie en production** sur main. [JSON canonique](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/administrator/data/new-listings-public-feed.json), instantané `2026-10-23T22:01:33.647Z` : **61 instruments (55 OKX, 6 Bitget), 55/55 paires OKX avec quote_snapshot**, 743 tickers natifs OKX reçus dans le lot. `watch_sources.okx_prices.status=OK`, `real_orders=0`.
- **Capture de l'interface avec ces nouveaux prix OKX : NON vérifiée** à la fin de ce fil ; ne pas la prétendre faite. Une tâche horaire est déclarée `17 * * * *` mais ne présume pas sa réussite future.

## 2. Points de vérité indispensables

- Chaque prix OKX est un **relevé historique horodaté** du marché Spot public, dans la devise **native** de la paire `USDT/USDC`, parfois converti en USD via le taux CoinGecko existant. Ce n'est **ni un prix exécutable ni un droit de négocier sur un compte**. Des prix anciens sont refusés par l'Interface après 90 minutes.
- Ne pas confondre `catalogue de paires`, `cotation publique`, `prix et profondeur disponibles maintenant`, `autorisation régionale/compte`, `solde`, `ordre accepté`.
- Des instruments de démonstration ou à **volume nul** peuvent obtenir un dernier prix public (exemple réel `TEST002/USDT` avec `volCcy24h=0` observé). **Aucune conclusion d'opportunité** sur seule présence d'un prix ou une variation affichée. L'identité et la liquidité doivent être qualifiées séparément.
- `read-only-laboratory` a présenté deux erreurs historiques de catalogue avant ces PR ; ne pas attribuer une régression sans preuve. Les tests dédiés scanner/Trader de la dernière série sont passés.
- Le précédent ticket « graphique RealGo RT1 / lecture BTC » a été fermé comme **non confirmé** après explication : ne pas ressusciter ce bug sans reproduction fiable et contexte exact.

## 3. Reprise opérationnelle, priorité immédiate

1. **Contrôler GitHub Actions** : dernière exécution réelle `Seven Public Spot Listings Watch` ; regarder `catalog`, `captured_at_utc`, quantité de quote_snapshots, `watch_sources.okx_prices.status`, éventuelles 403 ou autres pannes. Une archive vieille de plusieurs heures ne démontre pas un cours présent en direct.
2. **Recette Firefox ciblée** sur `Nouveaux listings → Avec prix / Actions & ETF / À qualifier / Tout le registre` : vérifier prix OKX, heure du relevé, paires exactes et absence de contrevérité lorsque l'instantané expire. Comparer seulement des données au même moment, ne pas conclure « bug » d'après deux horodatages différents.
3. **Qualification des données et des opportunités** : côté marché Spot public seulement, commencer par liquidité `bidPx/askPx`, spread, volume nul, taille des lots et minimum notionnel. Préparer une méthode de surveillance PAPER à issue datée plutôt qu'un signal d'achat.
4. **Dossiers du fil** : IRYS, DOS, CARDS, RealGo RT1, CUDIS, AXIS, CT, PROS, RLUSD, puis DNA, XDP, KMNO, ZORA, SAFE, AVNT, EURC. Le dossier [registre](./market-research-targets.md) contient les liens primaires et les inconnues. Ne pas limiter une crypto déjà cotée depuis 6 mois à la catégorie « nouveaux listings 30 jours ».
5. **Yoann** : l'Operator possède un profil distinct et un Bridge local sur son propre PC ; Trader partagé pour développement via reprises PR contrôlées, pas de droit Administrator. Déploiement/Bridge sur la machine de Yoann à valider avec lui, et non deviner ici.

## 4. Protections de continuité

- **STOP/BLACKOUT :** cesser les outils, répondre en texte, arrêter proprement.
- **Pas de code destructif ni de nouveaux moteurs parallèles.** Conserver Market Core 38.15.11, graphique, LT, Oracle, carnet, IndexedDB et données du Coffre ; aucune réinitialisation cachée.
- **Pas d'ordre réel, pas de permission OKX, pas de clés API dans GitHub.** Les expériences demeurent PAPER. Jamais de promesse de profit sur une hausse 24 h.
- Pour une modification : branche isolée → test adapté → PR → CI → fusion `main` → GitHub Pages si Web → preuve Firefox avant « validé visuellement ». Ne pas utiliser un numéro de version dans un nouveau nom de fichier ou de fonction.
- L'ancienne vue Operator de Yoann et le Bridge ne font pas partie des changements de ce fil.

## 5. Audit de reprise complémentaire · 24 octobre 2026

- [Premier contrôle documenté des spreads et des volumes](./market-research-targets.md) : sur le **seul instantané du 24 octobre à 00 h 01 Paris**, 55/55 prix OKX archivés, 53/55 paires avec bid+ask positifs, 2 paires sans volume ni offres (`TEST002/USDT`, `XWDC/USDC`), et 7 spreads indicatifs supérieurs à 1 %. Ne jamais extrapoler ces chiffres à l'heure actuelle.
- À 00 h 22 Paris, l'archive est inchangée depuis la collecte initiale. Le cron horaire existe dans le workflow, mais **le déclenchement horaire suivant et l'affichage Firefox restent non confirmés**. Vérifier les nouveaux runs et l'horodatage avant toute assertion de fraîcheur.
- Le développement prochain porte sur la **qualification documentaire** (prix observé / bid-ask / volume / identité / profondeur / éligibilité) ; **pas de second Market**. Aucun changement de code Trader / Market Core / Bridge / Operator dans cette mise à jour.

### Prompt court Seven pour la prochaine reprise

> Active Aerith-7 / Seven Heaven, continuité documentaire Aerith-8 + Aerith-9. Lis ce relais puis le registre `market-research-targets.md`. Contrôle l'heure et la dernière exécution réelle `Seven Public Spot Listings Watch`, le flux sur `main`, les horodatages natifs et la fraîcheur. L'audit du 24 octobre à 00 h 01 comptait 55/55 relevés OKX, 2 paires à volume nul et 7 spreads >1 %, **valeurs historiques uniquement**. Vérifie ensuite le rendu dans Firefox via une capture de l'opérateur, puis enrichis les dossiers IRYS / DOS / CARDS / RT1 / CUDIS / AXIS / CT / PROS / RLUSD en lecture seule. Conserve le Market MASTER, le Trader héritier, Market Core 38.15.11, les historiques et la séparation Administrator / Operator Yoann. N'invente ni cours temps réel, ni liquidité, ni permission OKX, ni transaction. Preuve avant modification, PR et CI avant validation.

## 6. Audit de cohérence BTC / CT du 24 octobre 2026 · STOP POINT

- **Rapport complet canonique :** [audit-market-coherence.md](./audit-market-coherence.md) — [PR #656 fusionnée](https://github.com/BlueAzur-Hub/erith-ia-memory/pull/656), commit [`a8198581`](https://github.com/BlueAzur-Hub/erith-ia-memory/commit/a8198581bab7b7f5d0fbc16cfb284dd1517ceed7). Revue source et capture Firefox à 01:10 Paris, deux archives CoinGecko vers 01:13 Paris ; **aucun changement de runtime**.
- **Core 250 + Extended 750** : 1 000 rangs uniques/IDs uniques, archive cohérente au contrôle ; les variations 24h/7j/30j incomplètes doivent rester inconnues.
- **BTC :** `−0,25 %` sur graphique signifie **variation de la série affichée** ; `−0,78 %` sur Fiche signifie **variation 24 h marché / quote**. Différence de source/définition, aucun graphe corrompu prouvé. Horodatages distincts.
- **CT :** plusieurs couples Spot (`CT/USDC` OKX, `CT/USDT` OKX et Bitget) ; relevé OKX initial de 00:01 Paris avec seuil de fraîcheur UI de 90 min, non exécutable ; ne pas confondre quote et compte.
- **Trois erreurs de lecture démontrées par code :** (1) Market Flow libelle `public-current` comme « données historiques anciennes » ; (2) News Sentinel reprend la fraîcheur figée d'un article (IBIT 665 M `09:17Z`, marqué `<12h` à 01:10 Paris alors qu'il a ~14h) ; (3) Math Core `null→0` dans `atlasMathHorizonCoherence` et `atlasMathAmplitudeLabel`. Leurs conséquences réelles à l'écran doivent être testées après correctifs ciblés.
- **Suite prioritaire** : deux corrections de présentation avec tests (Market Flow et News Sentinel), puis null ≠ 0 dans les labels Math, sans recalibrage de Market Core, puis recette Firefox synchronisée BTC et CT. Aucun ordre, aucun reset IndexedDB, aucun nouveau Market.
- **État non certifié** : Binance 5/5 uniquement visible via le bandeau, non recontrôlé auprès du runtime de Firefox ; Watchlist/portefeuille inconnus ; REDIVIDER 49 n'est pas le score Math prouvé ; News impact 87 n'est pas un impact marché mesuré.

## 7. Correction de lecture Market Flow / News / Math · 24 octobre 2026

- **PR #658 fusionnée sur `main`** : [correction ciblée](https://github.com/BlueAzur-Hub/erith-ia-memory/pull/658), commit [`576b6f56`](https://github.com/BlueAzur-Hub/erith-ia-memory/commit/576b6f56fc00dfc864f228a88470fb39cea09b03).
- `administrator/app.js` : `public-current` affiche désormais **« CoinGecko · snapshot public récent »** au lieu de « données historiques anciennes » ; les autres états ont une qualification explicite.
- **News Sentinel** : l'ancienneté d'un événement est recalculée à l'affichage depuis `event_time` (ou sa date de publication), au lieu de reprendre l'étiquette historique `freshness.label` ; la source et le score d'impact sont conservés.
- **Math Core** : `null`, `undefined` et valeur vide ne se transforment plus en zéro dans les libellés de cohérence des horizons ni d'amplitude ; un vrai `0 %` reste possible.
- **Tests** : `tests/agent_crypto_market_readout_truth.cjs` ajouté et exécuté en CI ; **Trader Current**, **Market Microscope Current**, **lightweight Pages (PR)** et **incremental patch** réussis. **Agent Crypto Learning Lab Read Only** a toujours deux anciens tests en échec (`ai-history-source-catalog.test.mjs` et `ai-source-inventory.test.mjs`, attendu 2 vs observé 1), échecs identiques à ceux du 23 octobre avant cette PR : **chantier séparé, pas déclaré résolu**.
- **Protection** : aucune modification de Market Core 38.15.11, Trader, Graphique, IndexedDB, historique, Oracle, Bridges, Yoann, données, permissions OKX ni ordres. Le déploiement Pages après fusion et la vérification visuelle Firefox doivent être constatés séparément.
- **Prochain passage** : une fois Pages `main` publiée, capture utilisateur Firefox `Ctrl+F5` pour vérifier « snapshot public récent », ancienneté des News et « Non mesurée / Données insuffisantes » sur un actif réellement dépourvu d'horizons. Ne pas changer la variation du graphe BTC avant comparaison à sources et horodatages identiques.

**Fin de passage :** la collecte publique a abouti, la documentation est sauvegardée, le rendu des nouveaux prix et la qualité des opportunités restent à certifier. **Ne pas repartir de zéro.**
