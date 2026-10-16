# ERITH.IA — Bridge Operator Client · suivi des livraisons Windows

**État du 16 octobre 2026 : préversion Operator Client d'authentification compilée et archivée (EXE Windows + ZIP source + SHA), NON qualifiée pour une exploitation ou un compte OKX privé.**

## Convention de livraison confirmée dans le fil Crypto

**Ce dossier GitHub est le lieu d'archivage des Bridges**. Une livraison complète doit réunir, côte à côte, **deux éléments** distincts :

1. **Dossier complet / archive ZIP modifiable** : sources Python du Bridge, backend, projet Go du Control Center, profils, configuration modèle vierge, scripts de création et tests, documentation, contrôle des empreintes.
2. **Control Center Windows `.exe` GUI sans console** : le programme que Christophe lance sur Windows (historique de développement avec Wine, sources Go Win32). Ce binaire doit correspondre aux sources du ZIP et ses empreintes doivent être vérifiées.

Aucun secret OKX, mot de passe local, jeton, fichier DPAPI de confiance, état utilisateur ou portefeuille ne doit figurer dans les livrables.

Le dossier est une **archive de référence**, pas un boot source ni l'Interface/Trader publiée sur GitHub Pages. Les anciennes livraisons sont immuables.

## Paires historiques déjà archivées dans ce dossier

### Control Center R17 · Bridge 1.9.13 · Backend 1.4.2

- `ATLAS_10_CRYPTO_BRIDGE_CONTROL_CENTER_2_3_2R17_BRIDGE_V1_9_13_BACKEND_V1_4_2_ORACLE_EVIDENCE_GITHUB_RESILIENCE_COMPLETE_SOURCES.zip`
- `ATLAS_10_CRYPTO_BRIDGE_CONTROL_CENTER_2_3_2R17_BRIDGE_V1_9_13_BACKEND_V1_4_2_ORACLE_EVIDENCE_GITHUB_RESILIENCE_GUI_NO_CONSOLE.exe`

### Operator historique R19Y1 · Bridge 1.9.13 · Backend 1.4.4

- `AGENT_CRYPTO_YOHAN_OPERATOR_CONTROL_R19Y1_BRIDGE_1_9_13_BACKEND_1_4_4_OKX_LOCAL_TRANSPORT.zip`
- `YOHAN_OPERATOR_BRIDGE_CONTROL_CENTER_2_3_2R19Y1_BRIDGE_V1_9_13_BACKEND_V1_4_4_OKX_LOCAL_TRANSPORT_GUI_NO_CONSOLE.exe`

Le prénom correct est **Yoann** ; les anciens noms de fichiers `YOHAN` sont volontairement préservés pour la traçabilité, sans les réécrire.

### Administrator personnel R22 · Bridge 1.9.16 · Backend 1.4.6

Le R22 a été fourni séparément par Christophe pour audit et installation personnelle. **Ne pas supposer qu'un binaire R22 figure déjà dans ce dossier** sans vérification des deux artefacts et accord de publication. Ne jamais publier ses configurations locales, secrets ou métadonnées d'authentification.

## Nouvelle édition attendue : Operator Client générique

Même Interface/Trader **40.6.640**, même moteur de marché, installation autonome sur chaque PC client, profil `operator` local, aucun privilège Owner, backend sur `127.0.0.1:8790` et Bridge sur `127.0.0.1:8787`. Ollama facultatif. Le client possède ses propres identifiants et son éventuel compte OKX.

L'édition **Operator Client** doit produire, à terme, dans **ce dossier précis** :

- `ERITH_IA_OPERATOR_CLIENT_COMPLETE_SOURCES.zip` (nom stable de la livraison courante, avec version et SHA dans le manifeste interne) ;
- `ERITH_IA_OPERATOR_CLIENT_CONTROL_CENTER_GUI_NO_CONSOLE.exe` (nom stable de l'exécutable courant) ;
- `ERITH_IA_OPERATOR_CLIENT_SHA256.txt` (empreintes des deux artefacts et référence de commit GitHub) ;
- ce fichier de suivi actualisé.

Pour les reprises historiques, conserver les anciens binaires à des chemins uniques archivés et ne pas remplacer un EXE de production avant validation. Ne jamais appeler « prêt » un prototype uniquement testé en CI.

## Ce qui a effectivement été développé au 16 octobre

Travaux sur le dépôt privé [malabaryo/tradus](https://github.com/malabaryo/tradus) (accessible aux collaborateurs autorisés) :

- [Architecture des deux éditions](https://github.com/malabaryo/tradus/blob/main/docs/ARCHITECTURE_BRIDGE_OPERATOR_CLIENT.md).
- [Delta historique R19Y1 / R22](https://github.com/malabaryo/tradus/blob/main/docs/OPERATOR_CLIENT_SOURCE_DELTA.md).
- [Générateur de sources Operator Client](https://github.com/malabaryo/tradus/blob/main/tools/build_operator_client.py).
- [Tests d'identité et de refus des privilèges](https://github.com/malabaryo/tradus/blob/main/tests/test_operator_client_stage.py).
- [Détail de l'étape auth-only](https://github.com/malabaryo/tradus/blob/main/docs/OPERATOR_CLIENT_AUTH_STAGE.md).
- [Preuve CI réussie](https://github.com/malabaryo/tradus/actions/runs/38915685248).

La CI du dépôt privé vérifie le SHA-256 exact de l'archive R19Y1, transforme le code en un profil Operator générique, compile syntaxiquement Python et exécute les tests de sécurité. La CI **du dépôt maître** a ensuite compilé un EXE Windows GUI à partir du Go historique, construit un ZIP complet et vérifié les permissions locales. Cette édition est une **préversion d'authentification uniquement** : elle ne pilote pas les ordres OKX et ne donne pas accès au compte OKX privé. Le Bridge R22 personnel et le Trader 40.6.640 ne sont pas modifiés par cette étape.

## Jalon 16 octobre — préversion Windows archivée sur main (preuves vérifiées)

[GitHub Actions — compilation, vérification PE/ZIP, identité Operator et refus d'élévation](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/38918914363) : **SUCCESS**.

[Commit effectif sur main — 950c4347421e6621c07413a9d9fdf63f36646e2c](https://github.com/BlueAzur-Hub/erith-ia-memory/commit/950c4347421e6621c07413a9d9fdf63f36646e2c), contenant exactement :
- [ERITH_IA_OPERATOR_CLIENT_AUTH_PREVIEW_COMPLETE_SOURCES.zip](ERITH_IA_OPERATOR_CLIENT_AUTH_PREVIEW_COMPLETE_SOURCES.zip) — dossier source complet, projet Win32 Go, Backend et Bridge public, EXE embarqué et manifeste interne ;
- [ERITH_IA_OPERATOR_CLIENT_AUTH_PREVIEW_GUI_NO_CONSOLE.exe](ERITH_IA_OPERATOR_CLIENT_AUTH_PREVIEW_GUI_NO_CONSOLE.exe) — Control Center Windows GUI 64 bits compilé ;
- [ERITH_IA_OPERATOR_CLIENT_AUTH_PREVIEW_SHA256.txt](ERITH_IA_OPERATOR_CLIENT_AUTH_PREVIEW_SHA256.txt) — empreintes SHA-256 ci-dessous.

SHA-256 EXE : `d2a622b1417162dfa7ac8981ed52efda3491e5d4448873b43928a5161edb69b3`.

SHA-256 ZIP : `9865e24bcd71e8d6395e08715d12e1eeff800f171eb6080cda9cd4d335c8055c`.

La compilation est une **cross-compilation Go vers Windows**, vérifiée comme PE Windows GUI x86-64 et contrôlée avec le contenu du ZIP embarqué. Le code d'authentification Operator possède un trust autonome, refuse Owner et ne comporte aucune route de lecture de compte OKX privé ni d'ordre financier. Les scripts et le Control Center redirigent vers l'Interface Operator publique 40.6.640. **Aucune preuve d'utilisation sous Windows natif / Firefox sur le PC de Yoann, aucune signature de code Windows, pas d'Ollama embarqué.**

Statut exact : **preview exécutable, non production**. La paire finale `ERITH_IA_OPERATOR_CLIENT_COMPLETE_SOURCES.zip` / `ERITH_IA_OPERATOR_CLIENT_CONTROL_CENTER_GUI_NO_CONSOLE.exe` ne devra être produite que lorsque les capacités Operator voulues et la validation terrain seront effectivement prouvées.

## Étapes bloquantes avant publication des deux fichiers définitifs

1. Finaliser le portage du Control Center Go et de son ZIP embarqué, avec scripts et configurations génériques, sans référence obsolète à `administrator/yohan.html` / 40.6.509.
2. Porter le Backend R22 utile, puis ajouter les fonctions OKX privées **en lecture seule** avec coffre local propre au titulaire et sans élévation de `operator` vers `owner`.
3. Vérifier le démarrage local des deux services, les permissions, les erreurs, les anciens utilisateurs non migrés et l'absence d'ordres réels.
4. Construire l'EXE Windows GUI sans console et le ZIP source complet ; comparer leur contenu, calculer les SHA-256 et conserver la procédure de reconstruction.
5. Obtenir tests automatiques puis recette Firefox/Windows sur un PC client avant de qualifier la version de production.
6. Déposer **ensemble** le ZIP source, l'EXE et le fichier SHA-256 ici avec commit GitHub et preuve de build.

**STOP** : le ZIP et l'EXE de préversion sont désormais archivés, mais **pas validés sur un PC Windows réel**. Leur présence ne valide pas une édition Operator complète ni le trading OKX. Ne pas remplacer un Bridge de production par cette préversion.
