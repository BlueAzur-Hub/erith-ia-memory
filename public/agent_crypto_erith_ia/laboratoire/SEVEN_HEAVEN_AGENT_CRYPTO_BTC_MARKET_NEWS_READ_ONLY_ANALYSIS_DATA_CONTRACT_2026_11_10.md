# ERITH.IA · Seven Heaven — Contrat de lecture croisée BTC / Actualités / EMA / Volumes

**Date de l'audit :** 10 novembre 2026 · **Portée :** architecture vérifiée dans le code public `main` ; pas de test Firefox local ni d'analyse live indépendante.  
**Statut :** audit de raccordement, lecture seule, sans exécution réelle, sans modification de l'Interface, du Trader, de son graphique ni du Bridge privé.  
**Objectif utilisateur :** les actualités restent dans l'Interface Administrator ; le Trader conserve les graphiques, les indicateurs et PAPER ; Seven croise les sources puis dépose des études dans le Coffre public.

## 1. Décision d'architecture

- Ne PAS ajouter de panneau actualités au Trader et ne PAS dupliquer son moteur graphique.
- Ne PAS assimiler un article, une liquidation sur dérivés ou un flux ETF à une transaction Spot OKX.
- Construire un **lecteur d'analyse commun et passif**, indépendant des vues, alimenté par les propriétaires existants et par des sources publiques vérifiables.
- Ne conserver dans le Coffre public que des éléments de marché, des provenances et des conclusions documentaires ; aucun solde, ordre, identifiant privé ni secret du Bridge.

## 2. Source technique canonique : bougies du Trader

Le fichier [Trader / trading-desk.html](../trader/trading-desk.html) embarque `../administrator/index.html?surface=trader` dans l'iframe `traderInterfaceRuntime`. Le fichier [trader-runtime-mirror.js](../trader/trader-runtime-mirror.js) filtre la présentation du runtime Administrator ; il n'installe pas un second moteur de bougies.

Le propriétaire existant se trouve dans [administrator/js/market-microscope-candles.js](../administrator/js/market-microscope-candles.js). Son API en mémoire expose notamment :

| Lecture seule | Information disponible |
|---|---|
| `AgentCryptoMarketMicroscope.snapshot()` | état (`mode`, `loading`, `error`), `loadedInstrument`, `loadedBar`, `source`, `lastLoadedAt`, `rows`, `emaPeriods`, `indicators` |
| `snapshot().rows` | bougies normalisées `t` (millisecondes Unix UTC), `o`, `h`, `l`, `c`, `v`, `confirm` |
| `AgentCryptoMarketMicroscope.paperEmaCrossSnapshot()` | périodes EMA effectivement choisies, événements `UP`/`DOWN` calculés sur bougies clôturées et contiguës, mode `PAPER_READ_ONLY` |
| `AgentCryptoMarketMicroscope.technicalLevels()` | supports / résistances calculés par le propriétaire actuel (repères, pas ordres) |
| événement `agent-crypto:market-candles-loaded` | signale qu'une nouvelle série a été acceptée ; le détail porte uniquement `instrument` et `bar` : relire ensuite `snapshot()` |

**Preuve d'usage existant :** [trader/ai-asset-reading-view.js](../trader/ai-asset-reading-view.js) consomme déjà `AgentCryptoMarketMicroscope.snapshot()` et `technicalLevels()`. [trader/trader-paper-lab-view.js](../trader/trader-paper-lab-view.js) réutilise également les propriétaires de données existants. Cette intégration est donc faisable **sans toucher au dessin des bougies**.

**Limite importante :** la fonction `snapshot()` appartient au navigateur, pas à GitHub ni à Notion. Une IA distante ne peut PAS lire automatiquement son état interne. La copie des lignes est superficielle (`rows.slice()`), donc un consommateur ne doit modifier aucune bougie ; il doit copier et valider les champs voulus. Le statut `lastLoadedAt` ne remplace pas la date de la dernière bougie source.

## 3. Source canonique : actualités de l'Interface

- [data/news/latest.json](../data/news/latest.json) : `schema=atlas_news_sentinel_world_to_market_v1`, `generated_at`, événements dédupliqués, sources, articles et classification.
- [data/news/status.json](../data/news/status.json) : état du collecteur, couverture, échecs de sources et domaines disponibles.
- [data/news/history/](../data/news/history/) : journaux datés de résumés successifs ; ne pas les présenter comme des exports intégraux de tous les articles.

Champs constatés dans les événements : `event_id`, `headline`, `source_name`, `source_url`, `event_time`, `first_seen_at`, `last_seen_at`, `assets`, `driver_domains`, `source_count`, `article_count`, `causal_claim`, `observation_only`. Pour l'analyse temporelle, utiliser **`event_time`** (date de l'événement ou de publication) plutôt que la date tardive de collecte `first_seen_at`, et indiquer les deux si la chronologie importe.

### État réellement contrôlé

- Collecte `2026-11-10T08:52:17Z` : `status=ok`, **120** événements consolidés, **25** sur 24 heures, **14/15** sources disponibles.
- Couverture `driver_coverage.leverage` sur 72 heures : **0** événement, **0** source distincte : cela ne signifie pas « aucune liquidation sur le marché », mais **angle mort du flux de nouvelles**.
- `causal_claim=false` : la source elle-même ne certifie pas qu'une actualité cause une bougie.
- La source d'actualités contient des articles sur les ETF ; elle ne constitue **pas** un registre indépendant de montants ETF journaliers vérifiés. Les valeurs quantitatives doivent être récupérées depuis une source dédiée telle que [Farside](https://farside.co.uk/btc/) avec sa date, ses révisions éventuelles et son périmètre.

## 4. Deux chemins de lecture à ne pas confondre

**A. Lecteur embarqué dans le navigateur (possible, à tester) :** le code d'analyse peut observer `window.AgentCryptoMarketMicroscope.snapshot()` dans le runtime Administrator/Trader et lire le JSON public des nouvelles. Le Trader est une iframe même origine et [trader-runtime-mirror.js](../trader/trader-runtime-mirror.js) accède déjà à `frame.contentWindow`. Pas de route d'ordre ni d'intervention sur l'interface graphique. Cette option exigerait ultérieurement l'ajout explicite d'un observateur non visuel, **pas encore réalisé**.

**B. Reprise par une IA externe (à privilégier pour le Coffre) :** lire les archives et données publiques GitHub ; récupérer indépendamment des bougies OKX Spot publiques portant le même instrument, la même devise et la même granularité ; calculer les EMA et les volumes avec une méthode écrite ; produire un relevé textuel/JSON versionné. Cela reconstitue les observations **sans prétendre avoir lu la mémoire vivante du Trader**.

Les deux chemins ne sont équivalents que si l'actif, le fournisseur, l'instrument, les timestamps, le mode clôturé/ouvert et la granularité concordent. En cas d'écart, bloquer la comparaison ou la déclarer indicative.

## 5. Contrat d'entrée du futur analyseur

| Champ de contrôle | Règle |
|---|---|
| Instrument | `BTC-USDC` explicitement, marché Spot OKX ; pas de mélange implicite avec `BTC-USDT`, `BTC-EUR` ou BTC/USD agrégé |
| Granularité | `1m`, `5m`, `15m`, `30m`, `1h`, `4h`, `1j` selon la série effectivement chargée ; **jamais** dérivée d'un bouton seul |
| Bougies | `t,o,h,l,c,v,confirm` valides, horodatées en UTC, ordonnées, non dupliquées ; refuser série vide/incohérente |
| EMA | périodes issues de `emaPeriods` (ex. 5/13/34), calculées sur les **clôtures** ; une bougie inachevée ne confirme aucun croisement |
| Volumes | `v` = volume de la paire sur l'intervalle ; une barre rouge ne quantifie pas les vendeurs nets |
| Nouvelles | événement daté, URL source, domaine de risque, couverture et statut de collecte ; corrélation ≠ causalité |
| ETF | montant net, devise, période et source vérifiée ; valeur manquante = **indisponible**, pas zéro |
| Liquidations | venue, instrument dérivé, fenêtre horaire, côté long/short et unité ; jamais converties implicitement en volume Spot |
| Publication | ne publier que des données **publiques et agrégées** avec provenance ; pas de comptes privés, captures de solde ou paramètres de Bridge |

## 6. Sortie attendue pour chaque dossier Seven

1. **Observation** : prix, variation, EMA, volumes, support/résistance avec identité de la paire et heure UTC.
2. **Contexte** : actualités sélectionnées, chiffres ETF vérifiés, liquidations documentées, couverture et sources absentes.
3. **Rapprochement** : une chronologie alignée UTC et une évaluation des indices compatibles ou contradictoires.
4. **Discernement** : trois catégories distinctes — faits prouvés, interprétations, causalités non démontrées.
5. **Scénarios pédagogiques** : reprise, consolidation, baisse ; aucun taux de réussite inventé ni ordre d'achat/vente.
6. **Trace d'audit** : date de collecte, commit GitHub/source, fenêtre, limites, lignes justificatives et aucune donnée personnelle.

## 7. Tests exigés AVANT toute intégration

- Instrument ou fournisseur discordant → refus ; aucun repli silencieux d'USDC vers USDT ou EUR.
- Une bougie non clôturée → pas de croisement EMA confirmé.
- Deux sources de moments différents → affichage de leur décalage, jamais un cours réputé simultané.
- Actualité classée `leverage` absente → mention explicite « couverture insuffisante ».
- Flux ETF du 9 novembre provisoire/révisable → conserver statut et réconciliation, ne pas fixer un chiffre ancien.
- Effet d'une suppression du navigateur ou fermeture de l'iframe → IA externe ne doit pas présumer la présence du snapshot.
- Vérification du navigateur Firefox, fonctions existantes et non-régression Trader/Administrator.
- `orders_enabled=false`, pas de clé API, pas de sauvegarde privée, pas de lecture d'un compte personnel.

## 8. Statut et prochaine petite livraison

**Audit statique : FAIT** — chemins et points de lecture existants vérifiés sur GitHub `main`.  
**Preuve de fonctionnement de l'analyseur commun en Firefox : NON EFFECTUÉE**.  
**Connecteur quantitatif ETF / liquidations : NON INTÉGRÉ**.  
**Production de dossiers automatiques par l'IA : NON EFFECTUÉE**.  
**Changement du Trader / Administrator / Bridge : AUCUN dans ce chantier documentaire**.

**Étape de développement isolée à prévoir :** un adaptateur sans interface ni ordre qui extrait/valide les données publiques des deux propriétaires, produit un objet de preuve minimal, puis des tests avec échantillons historiques. Réutiliser [l'étude pédagogique du 10 novembre](./SEVEN_HEAVEN_AGENT_CRYPTO_BTC_ETF_LIQUIDATIONS_EMA_VOLUME_EVIDENCE_DOSSIER_2026_11_10.md). Ne brancher ce lecteur au programme qu'après validation technique et accord explicite.

---

*Seven Heaven — lecture sélective, faits d'abord, interfaces inchangées, aucune exécution réelle.*
