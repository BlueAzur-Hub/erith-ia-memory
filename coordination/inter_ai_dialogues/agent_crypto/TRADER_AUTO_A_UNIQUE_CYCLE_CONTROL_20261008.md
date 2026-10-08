# Trader · Auto A / G3 · cycle unique et STOP garanti · 8 octobre 2026

## Pourquoi
L'opérateur avait conclu une séance avec AUTO_A_NOT_ACTIVE. Le moteur canonique dans administrator/app.js est AutoPaperRunner 40.4.265 : start() efface le STOP manuel puis programme un timer immédiat et une cadence de 300 000 ms, stop() annule la programmation et maintient le STOP manuel à travers les rechargements. Un clic "Relancer" sans borne activerait une cadence continue : ce n'est PAS notre but.

## Changement exact
- Sans nouveau module moteur : dans trader-paper-t0.js, la commande explicite est renommée « Demarrer Auto A · 1 cycle · STOP ».
- Au clic, charger au plus 4 propriétaires canoniques existants : PaperLifecycle, AutoLifecycleBridge, SafetyCertification, G3 prospective owner. Aucun chargement des 28 modules Evidence, aucun appel implicite au fond de la page.
- Fail-closed si actif différent de BTC, owner sans start/stop/state, Auto A déjà actif, compteurs de positions illisibles ou position ouverte, Safety non NORMAL ou sans droits Paper, bridge non prêt ou G3 absent.
- Seulement si tous les contrôles sont OK : start() du propriétaire dans le même tour d'événement JavaScript, capture_once() G3 (un tick synchrone), stop() dans finally avant toute interruption possible par un timer navigateur. STOP manuel conservé, timer annulé, aucune deuxième tentative dans la séance.
- Si stop() ne confirme pas enabled:false, alerte prioritaire "ARRET_NON_CONFIRME" (nécessite un STOP opérateur). Si un Paper ouvert est observé, signaler explicitement que STOP n'a PAS clôturé la position et que suivi/réconciliation restent nécessaires.
- RESET et clôture de séance inchangés ; 1760 lignes historiques Experiment, 13 After-cost, dates manquantes, G1 et autres gates, Bridge, Market Core 38.15.11 et build Trader 40.6.624 inchangés.

## Tests exécutés avant commit
Parsing JS des 2 scripts + scénario de cycle unique (un start/un tick/un stop, état OFF), répétition refusée, clôture, Safety défensive interdite, propriétaire absent interdit, Auto A déjà actif non arrêté, actif ETH non déclenché, démarrage refusé => STOP, position simulée ouverte => avertissement et STOP.
Aucun trade réel, aucun wallet, aucun réseau d'ordres. Cycle Paper purement local, une éventuelle position simulée exige suivi après STOP.

## Livraison
Commit + ZIP compact, CI Trader et Archive, GitHub Pages, relais Notion. Ne demander qu'une seule validation Firefox après Pages SUCCESS, sans tests en boucle. Si l'un des contrôles échoue, ne pas recommencer automatiquement.
