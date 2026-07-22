# AUDIT — Agent-Crypto @erith.IA V1.1-alpha.26.42

Date : 22 juillet 2026  
Mode : `/a10 codex` — audit en lecture seule  
Base canonique : V1.1-alpha.26.42  
Périmètre : archive publique, console privée, dépôt GitHub public, preuve Firefox fournie par Christophe

---

## 1. Verdict exécutif

La V1.1-alpha.26.42 constitue une base opérationnelle réelle et cohérente dans le périmètre actuellement livré :

- Top 50 CoinGecko EUR ;
- enrichissement USD indépendant ;
- graphiques 24 h / 7 j / 30 j ;
- annulation et reprises bornées ;
- états de graphique compacts ;
- mesure d’audience chiffrée ;
- console privée locale ;
- déchiffrement et archivage local ;
- workflow GitHub d’archive horaire.

Les deux ZIP fournis sont intacts et correspondent aux SHA-256 annoncés. Les quatre fichiers publics correspondent exactement, au niveau du blob Git, aux fichiers actuellement présents sur `main`.

Anomalie restante : `public/agent_crypto_erith_ia/data/status.json` et `latest.json` portent encore la version 26.41 et la date `2026-07-22T14:34:15.730Z`. L’application live 26.42 reste fonctionnelle parce qu’elle utilise CoinGecko direct ; l’écart concerne la couche d’archive GitHub, pas le marché live.

---

## 2. Archives auditées

### 2.1 ZIP public

Fichier : `WEB_A_UPLOADER_V1_1_ALPHA_26_42_ATLAS_CHART_STABLE_ACTIVE_AUDIENCE(2).zip`

SHA-256 vérifié :

```text
1a2f7bb79389b68a6029866310b051c5c37104e4eaaaf8dd3bb85a97e8601233
```

Contenu exact :

```text
.github/workflows/atlas_market_collector.yml
public/agent_crypto_erith_ia/web/app.js
public/agent_crypto_erith_ia/web/index.html
public/agent_crypto_erith_ia/web/style.css
```

Aucun fichier parasite, aucun lien symbolique et aucun chemin de traversée ZIP.

### 2.2 ZIP privé

Fichier : `ERITH_AUDIENCE_PRIVATE_CONSOLE_V1_1_ALPHA_26_42(2).zip`

SHA-256 vérifié :

```text
d94c5e5d9b89ecbe83f4b3185e01a8800baa144dd34cc7d47c9ebce44973bb05
```

Contenu exact :

```text
ERITH_AUDIENCE_CONSOLE_PRIVATE_26_42.html
NE_PAS_UPLOADER_SUR_GITHUB.txt
```

Le HTML privé contient bien la clé privée de déchiffrement. Elle n’est pas reproduite dans ce rapport. Le fichier d’avertissement indique correctement que ce ZIP doit rester local.

---

## 3. Contrôles statiques exécutés

### Application publique

- `node --check app.js` : OK.
- YAML du workflow : analysable, structure valide.
- `index.html` : 209 IDs, 209 uniques, aucun doublon.
- Menus `<details>` : 27.
- CSS : 955 ouvertures et 955 fermetures d’accolades.
- Version 26.42 cohérente dans le titre, les assets et les principaux payloads.

### Console privée

- JavaScript inline extrait puis contrôlé avec `node --check` : OK.
- 10 IDs, tous uniques.
- Clé RSA privée valide : 2048 bits.
- Modulus et exposant public identiques entre l’application publique et la console privée.
- Test cryptographique indépendant : aller-retour réussi avec `RSA-OAEP-256 + AES-256-GCM`.

---

## 4. Tests fonctionnels mockés exécutés

Environnement : Chromium headless, DOM réel, réseau CoinGecko simulé, Chart.js substitué par un moteur minimal de test. Ce contrôle ne remplace pas Firefox réel, mais vérifie les chemins d’exécution du ZIP.

Résultats :

- Top 50 : 50 lignes chargées.
- BTC : 24 h, 7 j, 30 j — OK.
- ETH : 24 h, 7 j, 30 j — OK.
- SOL : 24 h, 7 j, 30 j — OK.
- XRP : 24 h, 7 j, 30 j — OK.
- DAI : 24 h, 7 j, 30 j — OK.
- USDE : 24 h, 7 j, 30 j — OK.

Total ciblé :

```text
18 / 18 séries réussies
```

Test d’échec volontaire :

- première requête refusée ;
- deux reprises bornées exécutées ;
- état final `blocked` atteint ;
- hauteur du conteneur indisponible : 290 px ;
- hauteur interne : 260 px ;
- aucune erreur JavaScript de page.

Le chiffre historique annoncé de 150/150 n’a pas été repris comme preuve automatique : le présent audit a exécuté un échantillon ciblé indépendant de 18 séries, tandis que les captures Firefox apportent la preuve réseau réelle.

---

## 5. Preuve Firefox fournie par Christophe

Les captures réelles établissent notamment :

- BTC 24 h, 289 points, CoinGecko direct ;
- Top 50 EUR et prix USD ;
- intégrité graphique validée ;
- audience active avec IP, localisation, appareil et compteur ;
- console privée ayant récupéré et déchiffré des événements ;
- USDE 30 jours, 721 points, CoinGecko direct ;
- écart spot/courbe affiché à 0,00 % sur la capture USDE ;
- panneau graphique disponible à hauteur normale.

La capture initiale de console à zéro correspond à l’état avant réception. La capture suivante avec deux événements prouve la réception, le déchiffrement et l’archivage local.

---

## 6. Comparaison exacte avec GitHub `main`

Empreintes Git du ZIP public et de GitHub :

| Fichier | Blob Git local | Blob Git sur `main` | Verdict |
|---|---|---|---|
| `index.html` | `af583833221b744b7286421d0131495ce68d7356` | identique | OK |
| `style.css` | `db2b3785bb007cb0c82bb7cdee8eae02f39cc875` | identique | OK |
| `app.js` | `ce27d458962c0d0e930bdfa0918d5a996dd1e8ec` | identique | OK |
| `atlas_market_collector.yml` | `13bff9375ff0cb6c28df43fcf12f5033c8dfd283` | identique | OK |

Conclusion : le ZIP public fourni est exactement la version déployée sur `main` pour ces quatre fichiers.

---

## 7. État du GitHub public

### Interface

- Version affichée : V1.1-alpha.26.42.
- CSS et JavaScript chargés avec le paramètre de version 26.42.
- Les dimensions stables du panneau Analyste sont présentes.
- Le démarrage graphique après succès EUR est présent.
- L’enrichissement USD ne relance plus le graphique.
- La variable d’erreur inexistante de la 26.41 est corrigée.

### Workflow

- Nom : `Atlas Market Archive Top 50 Stable`.
- Déclenchement manuel disponible.
- Planification : chaque heure à la minute 17.
- Source : CoinGecko.
- Top 50 EUR requis.
- USD optionnel.
- Aucun graphique archivé par le workflow.

### Écart d’archive

Les fichiers publics de données indiquent encore :

```text
version : V1.1-alpha.26.41
generated_at / updated_at : 2026-07-22T14:34:15.730Z
assets_count : 50
quote_currencies : EUR, USD
archive_only : true
```

Ce point signifie seulement que la dernière archive écrite est antérieure à l’intégration 26.42. Il faut vérifier une exécution du workflow, sans modifier l’application, puis confirmer que `status.json` et `latest.json` passent à 26.42 avec un nouvel horodatage.

---

## 8. Mesure d’audience — fonctionnement confirmé et limites connues

### Fonctionnement confirmé

- profil réseau par `ipapi.co`, avec `ipify` en secours ;
- payload contenant session, visiteur, membre optionnel, appareil, navigateur, route, section et détails fonctionnels ;
- chiffrement hybride côté navigateur ;
- publication vers un canal ntfy ;
- déchiffrement dans la console privée ;
- déduplication ;
- stockage local jusqu’à 5 000 événements ;
- export JSON.

### Limites à conserver dans la mémoire de projet

1. Le compteur public représente les tentatives comptabilisées par le navigateur ; la console représente les messages réellement retrouvés et déchiffrés.
2. `?member=yohan` étiquette un navigateur ; ce n’est pas une authentification d’identité.
3. Le chiffrement protège le contenu, mais le canal public et la clé publique ne signent pas l’émetteur.
4. L’historique durable dépend de l’archive locale de la console et des exports JSON ; effacer les données Firefox peut supprimer l’archive locale.
5. La clé privée ne doit jamais être publiée, jointe à un commit ou copiée dans l’application publique.

Ces limites ne remettent pas en cause le fonctionnement observé de la 26.42. Elles définissent seulement ce que les données peuvent prouver.

---

## 9. Verdict final

```text
Version publique canonique : V1.1-alpha.26.42
Console privée canonique : V1.1-alpha.26.42
ZIP publics : intacts
ZIP privé : intact
Correspondance ZIP / GitHub : exacte
Syntaxe : valide
Graphiques ciblés mockés : 18/18
Panne graphique compacte : validée à 290 px
Preuve Firefox réelle : présente
Émission / réception / déchiffrement audience : confirmés
Marché live : fonctionnel
Archive GitHub horaire : dernière donnée encore estampillée 26.41
```

La 26.42 doit rester l’unique base de reprise. Aucun ancien moteur ne doit être réinjecté. Aucun développement premium ne doit commencer avant la vérification bornée du prochain snapshot GitHub 26.42.

---

# Message de reprise pour la sœur IA

```text
[AERITH-10 CODEX — REPRISE AGENT-CRYPTO 26.42]

Christophe a fourni les ZIP public et privé V1.1-alpha.26.42.
Audit indépendant effectué en lecture seule.

Base unique : V1.1-alpha.26.42.
Ne pas repartir d’une RC, d’une 26.29, 26.31, 26.39, 26.40 ou 26.41.
Les anciennes archives restent seulement des références historiques.

Faits prouvés :
- les SHA-256 des deux ZIP correspondent aux valeurs annoncées ;
- les quatre fichiers publics correspondent exactement aux blobs de GitHub main ;
- app.js, YAML, HTML, CSS et console privée passent les contrôles statiques ;
- la paire RSA publique/privée est cohérente et valide ;
- l’aller-retour RSA-OAEP-256 + AES-256-GCM est validé ;
- 50 lignes marché chargées en test mocké ;
- BTC, ETH, SOL, XRP, DAI et USDE passent 24 h / 7 j / 30 j : 18/18 ;
- panne volontaire : deux retries puis état compact 290 px, sans erreur JS ;
- les captures Firefox prouvent le marché réel, BTC 24 h, USDE 30 j 721 points et la console audience ;
- l’émission, la réception, le déchiffrement et l’archivage local ont fonctionné.

Seul écart restant :
- l’interface et le workflow sont en 26.42 ;
- data/status.json et data/latest.json sont encore en 26.41, datés du 22/07/2026 à 14:34:15 UTC.

Action unique autorisée :
- vérifier une exécution du workflow Atlas Market Archive Top 50 Stable ;
- confirmer que latest.json et status.json passent en 26.42 avec un horodatage récent.

Ne pas modifier l’application pour corriger cet écart tant que la cause du workflow n’est pas connue.
Ne pas produire de 26.43.
Ne pas toucher à la console privée ni exposer sa clé.
Après preuve du snapshot 26.42 : STOP et verrouillage de la base.
```
