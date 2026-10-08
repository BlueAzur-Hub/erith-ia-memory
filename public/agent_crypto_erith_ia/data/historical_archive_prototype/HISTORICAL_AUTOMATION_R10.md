# Seven Heaven · R10 — synchronisation automatique des archives + Coffre sans clics obligatoires

## Objectif

L'utilisateur a validé R9 dans Firefox (BTC 24 h, **305 chandelles** ; SHA-256 et OHLCV corrects) et souhaite que le Coffre fonctionne automatiquement. R10 est **un raccordement des flux d'archivage et un confort de lecture**, PAS un changement du Graphique.

## GitHub : R8 et R9 synchronisés à chaque collecte

- Le workflow horaire existant `.github/workflows/agent-crypto-historical-ohlcv-incremental-r4.yml` conserve sa cadence `17 * * * *` UTC (déclenchements GitHub non garantis à la minute).
- Après les contrôles et la collecte R8, dans **le même run**, exécuter :
  - `tools/build_historical_compact_r9.py --self-test` ;
  - `--build` pour reconstruire la projection compacte des **21 séries** ;
  - `--verify` pour comparer **toutes les valeurs numériques OHLCV** aux archives R2 + deltas physiques et aux SHA.
  - tests Node de lecture ciblée et de l'interface automatique, y compris échec fermé sur bloc corrompu.
- Puis **un seul commit GitHub** pour les deux répertoires :
  `data/historical_archive_prototype/ohlcv_spot_pilot/` (original immuable, index cumulatif) et `compact_v1/` (blocs immuables, index cible).
- Absence de nouveautés → `NOOP`, sans commit. Toute rupture de continuité, empreinte invalide ou test échoué **interdit la publication**. L'index compact et l'index source ne doivent pas être publiés séparément par le workflow R10.
- **Plafond de sécurité existant conservé** : R8 s'arrête à **100 deltas** maximum, inférieur à la limite de lecture 150. L'automatisation R10 ne lève pas cette limite ; les anciennes archives ne sont pas supprimées ni écrasées. R9 ancien snapshot devient la dernière version si la collecte R8 continue ; R10 produit un nouveau catalogue après collecte validée.
- Les objets `series/<id>_<period>_<sha16>.json.gz` sont **immutables**, avec nouveaux noms si le contenu change. Cela provoque une croissance de Git au fil des heures : prototype borné, pas une solution indéfiniment compacte. Planifier plus tard un archivage par partitions temporelles/gestion des versions sans perdre les preuves.

## Firefox : R10 « mains libres », chargement minimal

- Le Coffre historique existant `administrator/historical-vault.html` ajoute un petit état R10 et un module stable `administrator/js/historical-vault-automatic.js`, exécuté **après** les lecteurs R5/R6/R7/R9.
- À l'ouverture de la page : clic programmatique unique sur le **contrôle R5 existant** (lecture seule : métadonnées Firefox, R2 et deltas GitHub), puis lecture du **petit index R9 seulement**, sans télécharger les 21 blocs.
- Quand l'utilisateur **déplie R6**, son lecteur existant affiche automatiquement la série sélectionnée (réutilisation du même bouton et de ses protections).
- Quand il **déplie R7**, son comparateur lit les sources BTC via les boutons existants. Le Backend OKX public est facultatif, non bloquant en cas d'erreur.
- Quand il **déplie R9**, le module relit le catalogue pour vérifier les nouveautés, puis charge **seulement le bloc choisi**. Un changement de crypto/période dans R6/R9 recharge automatiquement la nouvelle sélection ; fermer puis rouvrir une section permet une vérification de nouveau.
- Les boutons manuels restent accessibles, notamment en cas d'erreur réseau. **Aucun timer/polling permanent**, aucun appel à une API privée, aucune modification IndexedDB ou localStorage, aucun ordre.
- Une page Firefox déjà ouverte ne surveille pas les nouvelles publications en arrière-plan. Réouverture/actualisation du Coffre relit les sources ; déplier R9 pendant la session rafraîchit également son catalogue, sans téléchargement de tous les blocs.
- L'absence de R9 ou de Binance/OKX est affichée comme indisponible ; pas de substitution de devises. **USDT ≠ USD ≠ USDC**. Toutes les archives sont historiques et NON LIVE.

## Tests et validations

- Workflow initial R10 doit démontrer : test R8, audit avant/après, génération R9, `--verify` sur les 21 séries, tests navigateur simulés Node, publication atomique. La première exécution issue du commit est un **push** ; le premier déclenchement `schedule` devra être observé séparément.
- Test Firefox attendu : ouvrir `historical-vault.html`, vérifier le bilan automatique R5 et l'index R10 sans clic ; déplier R9 BTC/24h et observer lecture/horodatages ; changer la période pour 7j sans cliquer sur « Lire » ; vérifier les graphiques existants inchangés.
- En cas de déclenchement tardif GitHub, les historiques peuvent être **STALE**. Le workflow continue à partir du dernier point réellement archivé, sans combler de trous fictifs.

## Protéger sans exception

Administrator **40.6.624**, Market Core **38.15.11**, `administrator/app.js`, Graphique Ligne CoinGecko, Bougies OKX, Trader, Bridge, Backend, Top 5 canonique, archives historiques R2/R4/R8 et stockage Firefox inchangés. **Aucune opération financière.**
