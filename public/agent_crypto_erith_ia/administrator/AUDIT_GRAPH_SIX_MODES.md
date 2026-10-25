# ERITH.IA — AUDIT FORENSIQUE DU GRAPHIQUE · SIX MODES

**Date :** 25 octobre 2026 · **Nature :** audit de diagnostic, aucun correctif de production inclus.  
**Périmètre :** Administrator 40.6.640 → Trader via iframe ; modes Solo, Top 3, Top 5, Hausses 5, Baisses 5, Volumes 5 ; cours USD/EUR ; historique, sélection, caches, erreurs réseau, restitution.  
**Niveau de confiance :** **preuve de code** pour les causes listées, **preuve visuelle** pour les états des quatre captures, **non validé** pour la reproduction de toutes les transitions sur le Firefox de l'utilisateur.

## 0 — Source de vérité et garde-fou

Sources examinées :

- [`public/agent_crypto_erith_ia/administrator/app.js`](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/administrator/app.js), SHA de blob **`0790d76bdd4179c2f2645f9d3a358079fdb936a4`**. La copie fournie par l'utilisateur `app(10).js` correspond exactement à ce SHA Git, vérification locale incluse. Environ 3,4 Mo et 67 912 lignes.
- [`administrator/js/graph-native-usd-406520.js`](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/administrator/js/graph-native-usd-406520.js), SHA de blob **`09ea73cd1e1fbf3dba6eb36c3cc2aa237234cb93`**, reconstruit et vérifié à l'octet près sur la base de la pièce jointe et du commit de correction ciblée `908ee4d5`.
- [`administrator/index.html`](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/administrator/index.html), qui charge les deux fichiers ; [`trader/trading-desk.html`](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/trader/trading-desk.html), qui ouvre `../administrator/index.html?surface=trader` dans une iframe.
- Tests existants [`tools/test_top5_canonical_owner.cjs`](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/tools/test_top5_canonical_owner.cjs) et [`administrator/js/test-graph-native-usd-tooltip.cjs`](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/administrator/js/test-graph-native-usd-tooltip.cjs).
- Quatre captures Firefox envoyées par le créateur le 25 octobre 2026, montrant Top3/Top5/Hausses5, ainsi que les captures précédentes montrant erreurs sur Baisses5 et Volumes5.

**Règles de sécurité :** aucun changement de `app.js`, du Market Core 38.15.11, d'IndexedDB/localStorage, des historiques, de l'Administrator, du Trader ou de l'Operator durant cet audit. La présence de cinq courbes ne prouve ni que les prix en surimpression sont dans la bonne devise, ni que le classement Market et la période du graphique sont synchronisés.

## 1 — Constat sur les six modes

| Mode | Propriétaire de la sélection | Origine du graphe | Prix panneau / réalité du 25 octobre | État |
|---|---|---|---|---|
| **Solo** | `atlasResetComparison()` → `atlasSetComparisonIds()` → `renderAnalystPanel()` | Historique direct / cache de l'actif ; wrapper USD hors Top5 canonique | L'interface indique parfois `PRIX USD`, mais les chemins et caches doivent être vérifiés par devise | Audit code réalisé ; recette terrain du mode Solo à effectuer |
| **Top 3** | `atlasSelectTopComparison(3)` → `renderComparisonAnalystPanel()` | BTC/ETH/BNB canoniques | **Capture : €** dans le panneau, alors que DISPLAY/USD est actif ; cause identifiée dans métadonnées et exemption incomplète | **NON CONFORME** |
| **Top 5** | `atlasSelectTopComparison(5)` → `renderComparisonAnalystPanel()` | BTC/ETH/BNB/XRP/SOL ; 24h par exception Binance EUR canonique | **Capture : $US** via les observations USD actuelles du Market ; courbes Base100 historiques séparées | Fonctionnel sur la capture, mais comportement volontairement différent des autres modes |
| **Hausses 5** | `atlasScannerStart('gainers')` → `atlasScannerRun()` → `atlasScannerCommit()` | Meilleure hausse `change24h` parmi candidats Market avec historiques compatibles | Capture d'annulation, puis capture **5/5 avec $US** : intermittence avérée | **INSTABLE** ; correction ciblée de clé présente, non suffisante pour garantir toutes les transitions |
| **Baisses 5** | `atlasScannerStart('losers')` | Plus faibles `change24h` compatibles | Antérieurement `0/5 historique compatible` / `NetworkError` ; pas de preuve terrain de succès actuel | **NON VALIDÉ** |
| **Volumes 5** | `atlasScannerStart('volume')` | Classement des volumes du Market ; stablecoins inclus | Historiques / tableaux parfois € ; partiellement masqués ou renommés USD par un décorateur | **NON CONFORME** sur la cohérence des devises et non validé sur la robustesse réseau |

Note importante : la capture où **Hausses 5** finit par afficher CAP/USELESS/GRASS/XMR/LIT et cinq cours en `$US` est une vraie preuve de succès **ponctuel**. Elle ne permet pas de conclure que le scanner fonctionne pour toute transition, toute devise et toute disponibilité de données.

## 2 — Carte des propriétaires / parcours

### A. Trois modes de sélection directe

```
Solo  ─ atlasResetComparison() ──┐
Top 3 ─ atlasSelectTopComparison(3) ─┼─ atlasSetComparisonIds()
Top 5 ─ atlasSelectTopComparison(5) ─┘        │
                   renderAnalystPanel() / renderComparisonAnalystPanel()
                             │
                 atlasFetchComparisonSeriesResilient()
                             │
           atlasBuildAlignedComparisonEntries() → drawComparisonChart()
                             │
       app.js tooltip + module graph-native-usd, potentiels conflits
```

Entrées code : `app.js` **L4995–5039**, événements **L57105–57120** ; traitement principal **L12311–12616**.

### B. Trois modes de scanner (autre propriétaire)

```
Hausses 5  ── gagnants ─┐
Baisses 5  ── perdants ─┼─ atlasScannerStart()
Volumes 5  ── volume ──┘         │
                   atlasScannerPool()  →  Market Frame (jusqu'à 32 candidats)
                                  │
                       atlasScannerStoredHistory()
                        cache et séries préexistantes
                                  │
                       atlasScannerFetchDirect()
                    Bridge → Binance → CoinGecko (wrapped USD)
                                  │
                     atlasScannerAligned()
                       périodes compatibles
                                  │
                        atlasScannerCommit()
                  clé canonique → dessin ou annulation
                                  │
                   ancien graphe restauré si échec
```

Entrées : `app.js` **L57123–57139**, `L15211–15268`, `L15353–15418`, `L15488–15708`, `L15710–15991`, `L53912–53975`.

**Conséquence :** la réussite du Top5 ne valide pas le scanner. Les six boutons partagent un écran, pas une unique politique d'acquisition, d'historique ou de validation.

## 3 — Défauts de code identifiés (preuves et risques distincts)

### P0-01 · Clés de contexte incohérentes entre code canonique et module USD

- `app.js` **L4724–4734** construit `comparison:<ids>:<période>` sans domaine devise.
- Le module `graph-native-usd-406520.js` encapsule `atlasExpectedChartContextKey()` et, hors exception Top5 24h, ajoute **`:USD`** à cette clé.
- Pourtant `app.js` **L12334**, dans le parcours Top3/Top5, construit directement la constante **`chartKey = comparison:${ids.join(',')}:${period}`**, puis la stocke dans `dataBroker.chart.contextKey` aux **L12367–12378 et L12528–12545**, **sans :USD**.
- `atlasChartContextMatches()` (**L4732–4734**) compare la clé du broker à la clé attendue, sans convertir ni réparer. Le parcours de redraw **L6551–6557** peut donc abandonner silencieusement le redessin si ces clés divergent.
- Pour Top5 24h, le module contient une **exception**, `canonicalTop5History()`, qui conserve la clé d'origine ; voilà pourquoi Top5 survit alors que Top3 rencontre un risque structurel.
- Le rejet explicite `Clé canonique refusée` est produit par `atlasScannerCommit` **L15580–15589**, et le code de restauration le masque derrière l'ancien graphe. Le commit `908ee4d5` a réparé le **cas ciblé de clé explicite pendant un scanner lancé depuis Top5** ; il n'a pas supprimé les deux autorités ni rectifié le `chartKey` en dur des comparaisons classiques.

**Preuve reproduction isolée :** Top3 / 24h / USD : clé stockée `comparison:bitcoin,ethereum,binancecoin:1` ; clé attendue `comparison:bitcoin,ethereum,binancecoin:1:USD`. Top5 / 24h reste compatible par exception. Scanner Top5→Hausses5 : la version actuelle produit deux clés `...:1:USD` lors de la préparation et du commit, mais cela ne garantit pas les autres transitions.

**Cause racine :** deux propriétaires de la même identité de graphique, l'un dans `app.js`, l'autre dans un décorateur USD. **Il ne faut pas rajouter une troisième fonction de normalisation.**

### P0-02 · Top3 utilise encore les métadonnées de devise historiques EUR

- `app.js` **L6874–6878** autorise l'affichage natif des observations Market USD uniquement si le preset est dans `['rank-5','gainers','losers','volume']`. **`rank-3` est exclu.**
- Dans ce même panneau, `atlasExternalChartTooltip()` **L6940–6949** lit alors le `rawPrice` historique et le formate avec `chart.$atlasQuoteCurrency || 'EUR'`.
- Le plugin `atlasChartMetadataPlugin` **L7279–7283** initialise `$atlasQuoteCurrency = options.quoteCurrency || 'EUR'` ; la construction comparée `drawComparisonChart()` **L12054 et suivantes** ne lui transmet pas explicitement la devise de chacune des séries. Le résultat par défaut reste EUR, même dans une interface DISPLAY USD.

**La capture en euros pour Top3 est donc expliquée par le code.** Attention : le symbole € ne prouve pas que les nombres historiques proviennent vraiment de séries EUR ; le module USD peut charger des valeurs USD, puis le panneau les étiqueter en €. On doit inspecter `result.currency` et sa source réelle avant toute conversion ou correction.

### P0-03 · Cache historique EUR potentiellement présenté faussement en USD

- Dans le module USD, fonction `scan(tx,c)`, lorsqu'un fetch USD échoue, `atlasGetStoredChartResult()` est appelé pour la famille CoinGecko, puis **le résultat trouvé reçoit `currency:'USD'` et `quoteCurrency:'USD'` sans vérification préalable de la devise du contenu**.
- Même schéma dans `cmp(c,p)` pour un cache considéré récent.
- Le scanner canonique `atlasScannerStoredHistory()` (`app.js` **L15689–15707**) place en première candidature `state.dataBroker.comparison.results[coin.id]`, **sans validation de `currency`/`quoteCurrency`**. Cette valeur peut avoir été enregistrée sous une autre devise lors d'un affichage antérieur.
- Les clés USD séparées existent pour le chemin de stockage normal `atlasChartStorageKey`, mais **une clé portant USD ne prouve pas que sa série a une provenance USD** ; les chemins de repli ci-dessus ne le démontrent pas.

**Risque sévère :** courbe réelle EUR avec métadonnées USD, ou ancienne série d'une autre sélection acceptée comme candidate. Ce n'est pas la preuve qu'un prix affiché particulier est erroné : c'est une absence vérifiable de garde-fou qui peut fabriquer une fausse attribution. Un changement de libellé n'est pas acceptable.

### P1-04 · Volumes 5 multiplie les vérités de devise

- `atlasScannerPool('volume')` utilise `coin.volume24h` (**L15244–15252**) et la métrique `atlasScannerMarketMetric()` renvoie cette même valeur (**L15270–15273**).
- Les légendes et textes propriétaires utilisent `fmtCompactEUR.format(...)` : **L6532–6539**, **L12259–12273**, **L13690–13694**, **L13743–13763**, ainsi que les descriptions terminales du scanner.
- Le module USD `patchUsdLegend()/patchUsdOverlay()` tente de remplacer ces valeurs par `volume24hUsd` quand il trouve cette propriété ; **s'il ne la trouve pas, l'ancien volume EUR peut subsister** dans une partie de l'interface.
- Pire : `patchUsdOverlay()` remplace des occurrences de `EUR` par `USD` dans `summary.innerHTML`, **sans acquérir de valeur USD correspondante**. C'est une opération textuelle, pas une preuve de devise.

La capture où les volumes sont annoncés en USD dans une zone, puis en EUR ailleurs, est cohérente avec cette séparation des propriétaires. **L'unité du volume doit être explicite par donnée, pas décidée par une transformation HTML.**

### P1-05 · Préconditions des scanners et réseau : le prix courant dépend à tort de la réussite des bougies

- Les scanners prennent jusqu'à **32 candidats**, tentent au plus **18 acquisitions directes** avec **deux workers concurrents**, après lecture des caches (`app.js` `ATLAS_SCANNER_POOL_SIZE=32`, `ATLAS_SCANNER_DIRECT_LIMIT=18`, `ATLAS_SCANNER_NETWORK_CONCURRENCY=2`).
- Si l'acquisition browser échoue, `atlasScannerFetchDirect()` essaie dans l'ordre Bridge, Binance, CoinGecko (`L53912–53975`) ; son wrapper USD passe d'abord par `fetchUsd()` et le module CoinGecko USD. Les échecs réseau remontent sous forme de chaîne d'erreurs ; le screenshot `NetworkError` **ne suffit pas** à identifier une panne du serveur CoinGecko, du Bridge ou du navigateur.
- La fonction `atlasScannerAligned()` (**L15353–15418**) exige un nombre minimum de points sur une fenêtre temporelle commune, indépendamment de la disponibilité de la **cotation Spot actuelle dans Market**.
- Si aucune série compatible n'est trouvée, `atlasScannerRun()` **L15844–15867** annonce `0/5 historique compatible` et conserve le graphique précédent.

Ce comportement protège les **courbes** de données inventées, mais **ne doit pas être assimilé à une absence de prix de marché**. Afficher les cinq prix actuels en USD nécessite un circuit Market indépendant du succès des séries horaires. Il ne faut ni afficher un faux prix ni cacher une cotation réellement disponible.

### P1-06 · Contrat « paniers atomiques » contredit dans le scanner

- `atlasComparisonRequiresFullSelection()` **L12303–12309** dit explicitement que `rank-3`, `rank-5`, `gainers`, `losers`, `volume` sont atomiques : soit le panier est complet, soit l'ancien graphique est conservé / l'état explicite.
- Pourtant le chemin spécifique `atlasScannerRun()` **L15844–15852** appelle `atlasScannerCommit()` dès qu'il possède **au moins une** série alignée ; `atlasScannerCommit()` autorise `missingCount>0` et un statut `partial` (**L15504–15528**).

Il y a donc **deux politiques incompatibles pour une même intention d'affichage**. À décider : faut-il conserver exactement les cinq cryptos classées et n'afficher que les courbes disponibles, ou chercher plus loin dans le classement pour remplir les cinq places ? La décision doit être unique et transparente.

### P1-07 · La sélection des « cinq meilleurs » varie avec la couverture historique

- `atlasMarketFrameScannerCoins()` lit des paniers du Market Frame (`L14366–14373`). Le scanner de secours classe des actifs sur `change24h` / `change7d` / `change30d` ou `volume24h` (`L15211–15268`). Les stablecoins sont exclus des hausses/baisses, inclus dans les volumes.
- `atlasScannerAligned()` cherche une sous-combinaison compatible, en parcourant l'ordre des candidats plutôt que de figer obligatoirement les cinq premiers rangs du classement.

Cela peut être utile pour obtenir 5 courbes exploitables, mais **un « Hausses 5 » affichant cinq séries n'est alors pas nécessairement le Top 5 absolu des hausses du Market**. Il faut distinguer visuellement **panier de classement** et **panier à historiques disponibles**.

### P1-08 · Restauration visuelle de l'ancien graphique = illusion de changement / refus

- Pendant un scanner, `atlasScannerStateSnapshot()` sauvegarde un dernier graphique ; `atlasScannerStart()` attend des données, et `atlasScannerCommit()` restaure le snapshot si le commit échoue (`app.js` **L15450–15708**).
- Les boutons reflètent soit un état actif, soit un scanner en cours / échoué (`L4864–4895`) ; ces indicateurs n'ont pas la même autorité que le canvas réel.
- L'overlay reprend alors « ancien graphe conservé », qui est **réel**, mais peut être mal perçu comme un fonctionnement du bouton demandé.
- Les préférences du workspace et la mémoire A/B/C sont distinctes des caches graphiques. Aucune preuve de suppression de base de données n'a été constatée.

**Solution de conception :** séparer explicitement `modeDemandé`, `modeAffiché`, `étatChargement`, `horodatageDevises`, `causeErreur`. Ne jamais faire croire qu'un Top5 précédent représente une Baisses5 nouvellement demandée.

### P2-09 · Deux circuits d'historique prétendent parfois une même vérité USD

- Top5 / 24h bénéficie d'une exemption codée par `canonicalTop5History()` qui conserve son historique EUR Binance direct, en Base100, et affiche séparément une cotation USD Market.
- Top3 et les scanners, eux, sont interceptés par une couche USD qui choisit `CoinGecko market_chart USD`. Certaines lignes de `app.js` utilisent encore des libellés « historiques EUR » même après fetch USD, notamment `L11967–11975` et `L12516–12522`.
- Le décorateur `patchUsdOverlay()` peut renommer les sources pour les rendre plausibles à l'écran.

Un texte comme `PRIX USD`, `PRIX HISTORIQUE`, `à jour` ou `CoinGecko USD` ne suffit pas à attester la devise et la fraîcheur de toutes les séries tracées. Une seule fiche de provenance par série est nécessaire.

## 4 — Vérifications de diagnostic réalisées

Une batterie locale de **12 contrôles** a été construite sur la copie de `app.js` identique à GitHub et sur un module USD reconstruit dont le SHA correspond exactement à `main`. Elle vérifie :

1. Solo : divergence de domaine de la clé potentielle en USD ;
2. Top3 : divergence réelle entre `chartKey` en dur et clé attendue USD ;
3. Top5 : exception cohérente de clé canonique ;
4. Hausses5 : clé transitoire corrigée dans le cas testé ;
5. Baisses5 : même logique de clé ;
6. Volumes5 : même logique, mais ancienne chaîne `fmtCompactEUR` encore présente ;
7. EUR : conservation des clés sans suffixe USD ;
8. Top3 absent du traitement USD natif appliqué à Top5/Scanners ;
9. métadonnées de cotation d'un graphique comparatif par défaut EUR ;
10. cache historique potentiellement relabellé USD sans preuve ;
11. relecture d'un résultat du panneau précédent sans garde devise ;
12. contraintes du scanner : 32 candidats / 18 appels directs maximum / 2 workers / panier strict revendiqué.

**Résultat : 12/12 assertions de diagnostic réussies.** Ce sont des **détecteurs de défauts**, PAS une suite d'acceptation fonctionnelle. Les contrôles de CI existants testent surtout le panneau USD avec un tableau déjà construit ; ils ne simulent pas le cycle bout-en-bout clic → cache/réseau → alignement → commit → restauration → switch devise → Firefox. C'est pourquoi une CI verte coexiste avec une régression terrain.

## 5 — Contrat cible unique, valable pour les six modes

1. **USD par défaut.** Le switch vers EUR fonctionne dans les deux sens.
2. **Un seul propriétaire** de `contextKey`, construit à partir de `preset + orderedCoinIds + period + displayCurrency + seriesCurrency + historicalSource` lorsque les champs gouvernent effectivement l'identité de la série. Une même requête doit produire une même clé à chaque phase de transaction.
3. Chaque série porte `coinId`, `instrument/pair`, `source/provider`, `quoteCurrency`, `timestamp`, `savedAt`, `cacheAge`, `points`, `period` ; le graphe relatif Base100 ne masque pas l'unité de son prix d'origine.
4. **Prix actuel USD :** lu dans le Market / Spot à partir d'une observation horodatée, indépendante des bougies et de la réussite du scanner. Actualisation éventuelle groupée côté source autorisée ; date/état annoncés honnêtement. Pas de conversion par `replaceAll` ni `currency='USD'` sur une série non prouvée.
5. **Classement ≠ couverture.** Présenter les vrais cinq premiers classés ; afficher distinctement les cinq courbes possiblement disponibles (ou un panier étendu explicitement annoncé), sans altérer le classement.
6. **Ancien graphique :** conservation permise par sécurité, mais statut « dernier graphique valide : Top5 » visible et mode demandé « Baisses5 : échec/réessai » affiché séparément. Jamais de faux succès visuel.
7. **Pas de boucle de fetch** : respect du plafond réseau, rendu non bloquant dans Firefox, signal des données différées, refus limité à la seule série qui manque.
8. **Un seul propriétaire du rendu** du panneau : ne pas superposer plusieurs wrappers qui corrigent le DOM après coup.

## 6 — Ordre de réparation recommandé (ne pas appliquer en bloc)

**P0-A — Verrouillage / preuve.** Geler les commits fonctionnels. Sauvegarder le SHA de la branche. Ne pas vider localStorage, IndexedDB ou les snapshots A/B/C. Préparer des reproductions isolées pour toutes les transitions.

**P0-B — Unification des clés.** Définir un propriétaire unique ; remplacer l'écriture littérale `chartKey` et les attentes différentes ; prouver en tests chaque phase, avec et sans scanner, USD et EUR. Retirer l'exception de transition devenue redondante **seulement** lorsque la compatibilité Top5 est prouvée.

**P0-C — Audit de vérité devise.** Supprimer le relabellage des caches et du résumé HTML, valider devise/source/timestamp à l'entrée ; conserver l'historique EUR canonique sans le prétendre USD. Gérer explicitement les sources EUR historiques et USD historiques dans leurs caches respectifs.

**P1-D — Rendre les prix Market indépendants des courbes.** Même fournisseur de prix pour les six modes, jamais une fenêtre EUR héritée faute de bougies. Les historiques Base100 et les cours actuels sont deux produits différents ; horodatages visibles.

**P1-E — Scanner et contrat des cinq actifs.** Clarifier classement, candidats de repli, coût réseau et politique partielle/atomique. Baisses5/Volumes5 doivent obtenir l'état réel des cinq cotations sans dépendre du nombre de séries historiques.

**P1-F — Recette Firefox réellement concluante.** Tester les transitions suivantes après chaque petite intervention :

- Solo → Top3 → Top5 → Hausses5 → Baisses5 → Volumes5 → Solo.
- USD par défaut → EUR → USD pour chacun des six modes.
- 24h puis 7j ; retour 24h ; `F5` / `Ctrl+F5` ; mémoire A/B/C conservée.
- Sources directes récentes, caches différés, Bridge éteint, fetch CoinGecko refusé, demande annulée, 0/5 et 5/5.
- Toujours distinguer `mode demandé` et `mode réellement affiché` ; capturer devise/source/date pour le prix actuel et pour les séries.
- Contrôler que l'Administrator fonctionne **avant** d'utiliser le Trader iframe et **avant** de propager à Operator/Web Classic.

**Interdiction :** ne plus déclarer l'Interface réparée sur la seule base de `node --check`, de tests mockés ou d'un workflow GitHub Actions PASS. Une preuve Firefox du comportement réel est obligatoire.

## 7 — Décision d'architecture

Ce graphique n'est pas « détruit » au sens prouvé par les pièces : le Top5 et une Hausses5 5/5 montrent encore des séries réelles. **Le problème est la cohérence du moteur commun, pas la disparition démontrée des historiques.**

Le diagnostic ne recommande **ni une nouvelle couche d'affichage**, **ni une refonte esthétique**, **ni un remplacement aveugle de `app.js` de 3,4 Mo**. Il recommande la réduction du nombre de propriétaires du graphe, la protection des historiques et un rétablissement progressif validé en conditions réelles.

## 8 — Handoff Aerith

À reprendre **en lecture seule d'abord**, puis livraisons autonomes limitées et testées sur le propriétaire correct. **Aucune modification du code de production dans le cadre de cet audit.**

Références :
- [Administrator](https://blueazur-hub.github.io/erith-ia-memory/public/agent_crypto_erith_ia/administrator/)
- [Trader (iframe Administrator)](https://blueazur-hub.github.io/erith-ia-memory/public/agent_crypto_erith_ia/trader/trading-desk.html)
- [Passation Notion Seven](https://app.notion.com/p/4047754fe08481f0806fc1002f76260c)
- Dernier correctif ciblé (clé de scanner uniquement) : [908ee4d5](https://github.com/BlueAzur-Hub/erith-ia-memory/commit/908ee4d5e8b37864d517c4e0b5001c6f7b7636ae) ; validation complète en Firefox NON effectuée à la rédaction.