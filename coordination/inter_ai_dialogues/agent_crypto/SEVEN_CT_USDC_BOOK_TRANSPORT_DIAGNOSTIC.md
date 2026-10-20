# Seven Heaven — CT/USDC : diagnostic du carnet local en lecture seule

20 octobre 2026 · Dernière reprise du chantier PAPER CT/USDC · **aucun ordre réel, aucune permission Trade**.

## Constat de départ
La recette utilisateur après la PR #551 confirmait l'identité CT-USDC, la lecture des règles et du compte OKX via R25 / Bridge 1.9.19, ainsi que l'ajustement de la quantité PAPER au maximum de CT du compte. Mais le prix du ticket provenait encore d'un carnet GitHub archivé depuis plus de trois heures. **Cela ne prouve pas un défaut de l'API OKX ou du Backend : le Trader masquait tout échec de la lecture locale.**

## Analyse de code
- La version existante du Backend 1.4.6 contient déjà une route **publique GET** `/market-book?provider=okx&instrument=CT-USDC&limit=100`, mise en place sur `127.0.0.1:8790` avec accès depuis l'origine `https://blueazur-hub.github.io` et lecture de l'horodatage du carnet OKX.
- Dans le Trader `trader-paper-decision-view.js`, le GET du Backend était déclenché au clic de vérification ; mais les erreurs réseau/HTTP/délai de lecture, et les réponses non admissibles étaient silencieusement ignorées. Dans ce cas le calcul revenait à l'archive datée.
- `trader-paper-decision-core.js` impose déjà une identité exacte CT-USDC, une fraîcheur de 20 secondes, des prix et quantités positifs et ordonnés. Ces protections sont conservées.

## Livraison
- [PR #552](https://github.com/BlueAzur-Hub/erith-ia-memory/pull/552) fusionnée sur `main`, commit [547ecbe3](https://github.com/BlueAzur-Hub/erith-ia-memory/commit/547ecbe3d9795d7bf4276be9a3fc3ee266f8e72f).
- Le nouveau diagnostic pur `diagnoseCtLiveBook` indique : `LOCAL_OK`, `NO_LOCAL_BOOK`, `PAIR_OR_SOURCE`, `TIMESTAMP_INVALID`, `TIMESTAMP_FUTURE`, `BOOK_STALE`, `BOOK_INVALID`.
- Les échecs du GET local sont maintenant visibles : `LOCAL_REQUEST_FAILED`, précisé en `TIMEOUT`, `HTTP nnn` ou `RESEAU LOCAL` (ce dernier ne distingue pas à lui seul Backend arrêté, politique navigateur ou CORS).
- Le timeout borné du GET local passe de **4,5 à 6,5 secondes** ; on conserve un seul clic humain, aucune collecte répétitive automatique.
- La qualification du carnet et la simulation utilisent le même horodatage de référence. La vue affiche `DIAGNOSTIC CARNET LOCAL` dans le ticket existant ; tout repli vers l'archive est marqué **historique uniquement**, pas un cours Spot négociable.
- Le Backend R25, la clé OKX Read, le Market Core, les graphiques, Radar et l'exécution du compte sont inchangés.

## Validation
- Tests unitaires : carnets frais / périmés / futurs / croisés / mauvais instrument / données invalides et sécurité des appels.
- Trois workflows PR #552 réussis : Trader Current, multisite Pages, patch incrémental.
- CI Trader après fusion : [run 39506137711](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/39506137711) réussi.
- Pages après fusion : [run 39506137781](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/39506137781), statut à vérifier ; ne pas anticiper.
- **AUCUN test Windows/Firefox sur le PC utilisateur à ce stade.** La cause réelle de la non-utilisation du carnet local n'est donc PAS encore certifiée.

## Protocole terrain (sans identifiant ni token)
1. Garder Aether Control R25 (Bridge 1.9.19, Backend 1.4.6) ; aucun nouvel exécutable à installer.
2. Une fois le workflow Pages terminé, dans Firefox, Ctrl+F5 puis CT Solo → Laboratoire PAPER → Préparer un ticket OKX LIMIT → Vérifier ce scénario.
3. Relever la ligne **DIAGNOSTIC CARNET LOCAL** et la ligne **Carnet CT/USDC**, sans copier le journal privé ni les soldes.
4. Si `LOCAL_OK`, le ticket doit utiliser le **Backend public local OKX** et un horodatage récent. Si l'archive reste retenue malgré `LOCAL_OK`, examiner la concordance des règles prix/tick ; ne pas présumer le live.
5. Si `LOCAL_REQUEST_FAILED HTTP 502`, examiner le Backend local et l'appel public OKX ; si `TIMEOUT`, inspecter latence/filtrage ; si `RESEAU LOCAL`, inspecter la permission Firefox d'accès au réseau local ou la disponibilité de `127.0.0.1:8790`.
6. Si `BOOK_STALE`, contrôler la datation réellement renvoyée par OKX, l'horloge Windows et le retard de transport. Si `BOOK_INVALID`, contrôler tri, spread et décimales.
7. Pendant toutes les étapes, le ticket doit afficher `AUCUN ORDRE POSSIBLE` et ne pas envoyer de commande Trade.

## Point d'arrêt
Livraison diagnostique : **terminée côté GitHub**, cause transport réelle **en attente de la preuve Firefox**. Ne pas créer de nouveau Bridge ou modifier la configuration OKX sur la base d'une hypothèse.
