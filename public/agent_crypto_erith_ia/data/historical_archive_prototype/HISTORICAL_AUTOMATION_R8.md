# R8 · Seven Heaven · Collecte historique horaire contrôlée
État : **pilote automatique activé par GitHub Actions**, limité pour préserver la lecture R6/R7.

## Source et fréquence
- **Workflow existant** `.github/workflows/agent-crypto-historical-ohlcv-incremental-r4.yml` (propriétaire R4 conservé) : ajout d'un déclenchement `schedule`, **une fois par heure à HH:17 UTC**. GitHub peut déclencher en retard ou omettre une occurrence (pas une garantie minute par minute).
- Déclenchement manuel via `workflow_dispatch` conservé. Un push sur le workflow ou le script déclenche également une collecte initiale.
- **7 cryptos / 21 séries** Binance Spot **USDT** qualifiées du pilote R2/R4, périodes 24 h (5m), 7j (1h), 30j (4h). Bougies **clôturées** uniquement, 240 nouvelles au maximum par série par exécution. Chaque exécution repart de la dernière chandelle physiquement validée ; jamais des heures prévues par le planning seul.
- Pas de clés, pas d'ordre ni de portefeuille, pas de données Firefox envoyées. Requêtes GET Binance Spot publiques.
- Avant toute collecte : tests hors réseau, lecture complète et vérification du R2 immuable, des deltas, de l'index et des SHA-256 ; ensuite collecte, contrôle complet, publication Git seulement si nouveautés.

## Contrôle de volume et STOP
- Les lecteurs historiques R6 et R7 limitent actuellement les archives à **150 deltas**. **R8 s'arrête à 100 deltas cumulés** (incluant les deux déjà présents au lancement), soit au maximum 98 nouvelles archives dans ce pilote.
- À la limite, script retourne `PAUSED_CAP_REACHED` **sans appels réseau Binance, sans écriture ni nouveaux fichiers**. Le workflow reste programmé, mais n'ajoute plus de données tant qu'une version suivante n'a pas élargi ou compacté le stockage et adapté le lecteur.
- Exécution sans nouvelle bougie clôturée : `NOOP`, aucun commit. Concurrency GitHub `agent-crypto-ohlcv-r4-incremental` : pas de chevauchement des deux collectes.
- Archive seed R2 et tous les deltas immuables ; index cumulatif recalculé et commité uniquement lorsqu'une nouvelle archive est produite.
- Pas de rotation/suppression automatique, pas de conversion USDT/USD/EUR et pas de reconstruction de courbes fictives.

## Limites assumées
- GitHub n'est pas une base de données requêtable à grande échelle. Les 100 fichiers préservent le pilote, pas une bibliothèque illimitée. La phase suivante doit concevoir des **blocs agrégés immuables indexés par périodes** et une lecture partielle, sans casser la provenance ni l'historique existant.
- GitHub Actions `schedule` peut subir des retards ; les outages Binance, API refusées ou un historique interrompu entraînent un échec fermé.
- Les statuts d'âge `STALE` du Coffre restent descriptifs, pas une promesse de données live. Actualiser la page Coffre pour charger un nouvel index.
- Les compteurs du cache local Firefox restent indépendants et limités à 80 séries.

## Protections
- **Administrator 40.6.624, Market Core 38.15.11, Trader, Bridge, Graphiques Ligne/Bougies, Top 5 canonique, Lecture Technique** : inchangés.
- La seule modification fonctionnelle de R8 se situe dans le collecteur existant et son workflow horaire, pas dans le navigateur.

## Critères de validation
1. Test CI du script `--self-test` avec garde-fou 100/150.
2. Run GitHub Actions R8 : `--audit-existing` avant et après collecte, validation SHA et index et commit.
3. Vérifier `index.json` : `candles_total` augmente uniquement si des chandelles clôturées nouvelles ont été obtenues ; le nombre de deltas reste au plus 100.
4. Après un run horaire UTC, vérifier le décalage temporel indiqué dans le Coffre R7. Il n'est pas nécessaire de modifier le Graphique.
