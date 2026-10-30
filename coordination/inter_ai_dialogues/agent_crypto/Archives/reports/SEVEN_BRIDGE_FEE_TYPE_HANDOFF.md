# Seven Heaven — Bridge audit et livraison CT-USDC / feeType
**20 octobre 2026 — lecture seule ; aucun ordre ni modification de compte**

## Sources et décision
- Fourni par l'utilisateur : exécutable Control Center R23 / Bridge 1.9.17 / Backend 1.4.6 et ZIP complet ; SHA-256 du binaire comparé à celui du ZIP, identiques : `0f3ab0e8d2f75a599fb4989a0d21a5feffaa9063450af74eeec41869c72e9936`.
- Revue du code `bridge/bridge.py`, `bridge_config.json`, `source/main.go` et tests, **sans exécution du .exe Windows**.
- L'architecture privée est déjà bornée à `127.0.0.1:8787` et protégée par Aether Trust ; appels OKX privés signés et réservés à une liste blanche GET ; comptes et jetons DPAPI locaux jamais exportés.
- Bridge fournit déjà les lectures `/okx/account`, `/okx/orders`, `/okx/fills`, `/okx/fees`, `/okx/ledger`. Il **ne fournit pas** `feeType` aujourd'hui dans R23.
- L'owner Aether Trust dispose d'une session en mémoire valable jusqu'à logout ou arrêt ; attention particulière aux longues sessions, même si le serveur est limité au loopback.

## Ce que dit l'API OKX officielle
`GET /api/v5/account/config` — Permission Read — renvoie `feeType`, où :
- `0` : frais en **devise obtenue** ; pour **l'achat CT/USDC**, frais typiquement en CT.
- `1` : frais en **devise cotée** ; pour **l'achat CT/USDC**, frais en USDC.
Ce mode dépend de la configuration effective du compte, ce n'est PAS une promesse de frais en USDC. Il ne donne pas les arrondis de commissions, l'exécutabilité des ordres, ni un minimum notionnel.
**Interdit :** `POST /api/v5/account/set-fee-type`, ou toute autre écriture.

Source primaire : https://www.okx.com/docs-v5/en/ (Get account configuration ; Set fee type).

## Correction réalisée en candidat autonome
- Control Center interne `2.3.2R24`, Bridge `1.9.18` ; Backend inchangé `1.4.6`.
- Route locale **GET `/okx/fee-type`**, owner seulement, capacité `okx.fee_type.read`, liste blanche ajoutée `/api/v5/account/config`.
- Réponse **réduite** à `fee_type`, `fee_currency_for_spot_buy_ct_usdc`, horodatage, source et booleans de preuve ; aucun retour de la configuration complète, aucune clé, compte ID, permission ou historique. `feeType` non reconnu -> **503** explicite, pas de défaut inventé.
- Tests garantissant `0`, `1`, données manquantes, rôles reader/operator refusés, aucune route POST d'écriture. Pas de changement du Trader, Market Core, Backend, paramètres du compte, frais, permissions réelles.
- Le Control Center R24 utilise un répertoire de travail versionné distinct ; **R23 demeure point de retour**. L'identité de fenêtre unique est conservée pour éviter les lancements simultanés.
- Le ZIP reconstitué comprend l'exécutable, le source Python/Go, le payload embarqué, tests, documentation, manifest SHA-256 ; aucun fichier de diagnostics utilisateur ni secret n'est inclus.

## Preuves effectuées ici (hors réseau)
- `python bridge.py --self-test` : réussi.
- `python test_okx_ledger.py` : 19 contrôles mock passés.
- `python test_atlas_singleflight.py` : 5 scénarios passés.
- `python test_okx_fee_type.py` : 5 tests complémentaires passés.
- Compilation `GOOS=windows GOARCH=amd64 CGO_ENABLED=0 go build ...` : PE32+ x86-64 GUI produit.
- ZIP validé (`testzip` réussi ; binaire intérieur égal au séparé).
- **AUCUN essai Windows/Firefox/OKX privé réel**, donc fonctionnement terrain et valeur de `feeType` NON CERTIFIÉS.

## Artefacts construits dans la conversation — empreintes
- `AETHER_CONTROL_FEE_TYPE.exe` : SHA-256 `cb8b19da23a8b9b41de3c4923f3dae46aefb575127c377380ade12d115fb6dda`.
- `AETHER_CONTROL_FEE_TYPE.zip` : SHA-256 `d1d568fd5c9e7e2181cc449d02e2e7a4fcb46fb0c375164d1322bdf91431f5fb`.
- `source/payload.zip` à l'intérieur : SHA-256 `6c14892a77b5f83f4ebe26e8e86218d4b2d642117de2ba184c2595be725e3833`.
- Le dossier partagé GitHub contient le **patch source minimal** `bridge_fee_type.patch`, vérifié applicable sur le Bridge R23 en source. Ce patch documente la fonctionnalité : il ne constitue pas à lui seul un paquet complet R24 avec recompilation, tests et renommage de version.
- Les **binaires sont fournis séparément comme pièces téléchargeables dans cette conversation**, pas publiés par cette écriture GitHub. Ne pas affirmer qu'un binaire est téléchargeable depuis ce dossier GitHub.

## Essai Windows, si l'utilisateur le souhaite
1. Conserver précieusement le ZIP original R23, arrêter proprement tout Atlas/Bridge actif via Control Center et fermer R23 ; ne pas démarrer les deux simultanément.
2. Décompresser `AETHER_CONTROL_FEE_TYPE.zip` dans un **nouveau dossier** ; ne pas écraser R23. Lancer l'EXE de cette archive. Aucun besoin de resaisir la clé OKX si DPAPI est toujours accessible.
3. Contrôler les écrans Control Center et les routes habituelles (/health, lecture du compte via Aether Trust) sans désactiver les protections.
4. Avec session owner, **GET localhost:8787/okx/fee-type** avec Bearer dans le client local existant : `fee_type=0` ou `1`, horodaté. **Ne jamais publier ni copier le token**, ni la réponse privée brute. L'interface Trader actuelle **n'affiche pas encore** ce nouveau champ ; ne pas prétendre le contraire. Si la lecture échoue, ne pas conclure à une valeur par défaut.
5. En cas de problème : arrêter R24, relancer le Control Center **R23 conservé**. Pas d'action OKX, achat, transfert, changement de configuration.

## Prochaine étape conditionnelle
Après preuve Firefox locale, intégrer si besoin une synthèse explicite du mode de frais au ticket PAPER CT/USDC, toujours en lecture seule et sans changer les règles du graphique. La qualification séparée des plafonds LIMIT, limites de prix et notionnel doit rester un autre chantier.

**STOP :** audit, patch et compilation hors ligne terminés. Aucune transaction, aucun service distant ni compte utilisateur touchés.
