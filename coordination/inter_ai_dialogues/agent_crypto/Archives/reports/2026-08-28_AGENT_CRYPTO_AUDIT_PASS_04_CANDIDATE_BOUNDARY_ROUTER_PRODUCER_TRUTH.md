# Agent-Crypto @erith.IA — Audit cumulatif Pass 04

**Date :** 2026-08-28  
**Nature :** AUDIT ONLY — NO BUILD — NO LIVE RUNTIME WRITE  
**Runtime protégé :** Administrator `40.4.88`  
**Market Core protégé :** `38.15.11`  
**HEAD au début du passage :** `37b6a53cfa178fb13c8d2a4599047736e8868845` — Pass 03 coordination uniquement.

Ce passage continue directement les handoffs canoniques et les Pass 01→03. Aucun fichier sous `public/agent_crypto_erith_ia/administrator/` n'est modifié.

---

## 1. Résumé décisionnel

### PROUVÉ

1. **Le HEAD GitHub n'a pas porté de nouveau runtime après 40.4.88.** Au début du passage, le HEAD est le Pass 03 de coordination. Le dernier commit runtime reste `0b8672c4d2481bf21205e2cc74082ea591175d08`.

2. **Le déficit de routage Atlas périphérique est maintenant localisé dans le vrai owner.** `atlas-peripheral-lazy.js` possède `auto-reader`, `shared-memory` et `github-memory`, retire leur corps avant insertion, puis attache l'hydratation uniquement sur `toggle`. Le fichier ne possède aucun handler `hashchange`, aucun traitement du hash initial et aucune API explicite `target-id → peripheral key`.

3. **Les trois périphériques ont des entrées de navigation réelles, pas seulement deux quick-links historiques.** Le Command Center contient `#auto-reader` et `#shared-memory`; le sélecteur de modules contient `auto-reader`, `shared-memory` et `github-memory`. La target-map VNext doit donc couvrir les trois clés.

4. **Le generic residency Atlas ne peut pas être l'autorité de ce routage.** Les corps sont déjà remplacés par des placeholders avant que le lifecycle générique n'enregistre/détache quoi que ce soit. Cette conclusion des Pass 01/02 est confirmée.

5. **Le hook Atlas est bien borné mais il est la frontière actuelle de cold-boot relief.** Il sauvegarde `Element.prototype.insertAdjacentHTML`, ne preprocess que `#atlas-view-host` + `beforebegin`, restaure la méthode native immédiatement après cette insertion, puis attache les owners. Le retirer sans frontière locale équivalente réintroduirait le gros contenu au boot.

6. **La vérité no-local-producer touche aussi la présentation, pas seulement le superviseur.** Le fragment Atlas canonique porte encore `data-compute-role="production"`, affiche `RYZEN · Production locale autorisée · Transformer Book = lecture seule...`, présente `Ryzen : moteur local en attente` et expose un bouton `Tester le Bridge du Ryzen`. Donc corriger uniquement le timer `/health` laisserait une UI mensongère lorsque le producteur n'existe plus.

7. **Le no-local-producer ne doit pas être mélangé à la première petite candidate de consolidation.** Le protocole public exige un retour humain pour les changements de local producer/Bridge contract et pour toute validation Firefox échouée. La sémantique producteur touche plusieurs surfaces runtime + UI ; elle constitue une tranche distincte.

8. **La première candidate viable doit rester bornée.** La meilleure frontière actuelle est : consolidation des owners déjà prouvés redondants + diagnostic VNext read-only, sans Learning, sans refonte du hook Atlas, sans modification du monolithe métier, sans no-local-producer dans la même livraison.

### HYPOTHÈSE / À VALIDER EN FIREFOX

- Retirer les generic residency redondants peut réduire des listeners et bookkeeping, mais aucun gain de performance significatif n'est revendiqué sans mesure opérateur.
- Le router Atlas explicite devrait corriger les deep-links à froid, mais son implémentation doit être testée sur clic, hash initial, `hashchange`, module picker, fermer/réouvrir et Window Manager avant toute retraite des trois selectors périphériques.

---

## 2. Atlas — target-map VNext fermée conceptuellement

### Destinations connues à couvrir

| Destination | Source de navigation | Owner cible |
|---|---|---|
| `auto-reader` | Command Center + module picker + hash direct | Atlas peripheral owner |
| `shared-memory` | Command Center + module picker + hash direct | Atlas peripheral owner |
| `github-memory` | module picker + hash direct | Atlas peripheral owner |

Le main cockpit `#atlas-local-ai-collapse` / `local-ai-hub` n'appartient pas à cette retraite et reste protégé.

### Contrat minimal du router

Le futur owner Atlas doit pouvoir résoudre :

```text
requested target
    ↓
map target -> peripheral key
    ↓
find stable details[data-collapse-key]
    ↓
open the shell
    ↓
await hydrate(key)
    ↓
resolve the canonical target now present
    ↓
scroll/focus once
```

Il doit traiter trois chemins indépendants :

1. hash présent au chargement initial ;
2. `hashchange` après boot ;
3. navigation interne/module picker sans dépendre du browser scroll vers un ID encore absent.

### Pourquoi une ancre summary n'est pas obligatoire

System 04 utilise des ancres stables dans les summaries, mais Atlas peut conserver les IDs canoniques dans le corps hydraté si son router possède explicitement le cycle open → hydrate → resolve → scroll. Cette option évite d'introduire un deuxième ID ou de modifier inutilement la source historique.

Condition absolue : duplicate IDs = 0 et un hash déjà présent doit déclencher un scroll explicite après hydratation, car l'ID n'existait pas au moment de la navigation initiale.

### État de la dette

- Atlas routing design : **PROVEN CONTRACT / IMPLEMENTATION NOT YET AUTHORIZED**.
- Atlas peripheral generic residency retirement : **BLOCKED UNTIL ROUTER IMPLEMENTED + FIREFOX PROOF**.
- Atlas main cockpit residency : **RETAIN / PROTECTED**.

---

## 3. Atlas presentation boundary — décision de première candidate

`atlas-peripheral-lazy.js` utilise encore une interception temporaire globale et des bornes textuelles pour préparer le fragment Atlas.

Cette dette reste `OPEN / HIGH-RISK ARCHITECTURAL DEBT`, mais elle ne doit pas être couplée à la première consolidation.

### Décision

**Première candidate : laisser ce hook intact.**

Raison : il est aujourd'hui le mécanisme qui garantit que les corps Atlas périphériques/audits ne sont pas remontés à froid. Remplacer en même temps owners, router, boundary et producer truth multiplierait les variables et rendrait l'attribution d'une régression Firefox beaucoup plus difficile.

La refonte de frontière Atlas viendra après un checkpoint stable de consolidation.

---

## 4. No-local-producer — matrice UI/runtime complétée

Les Pass précédents ont prouvé :

- rôle suggéré `observer` seulement pour Transformer Book ;
- fallback `production` ailleurs ;
- supervision Bridge conditionnée par session autorisée + compute allowed ;
- interval de supervision 60 s ;
- health timeout 8 s.

Le présent passage ajoute la preuve de présentation :

- `atlasDeviceComputeControl` démarre visuellement avec `data-compute-role="production"` ;
- `atlasDeviceComputeStatus` annonce `RYZEN · Production locale autorisée` ;
- `atlasLocalRuntime` annonce `Ryzen : moteur local en attente` ;
- le bouton manuel s'appelle `Tester le Bridge du Ryzen` ;
- le texte de rôle assimile encore explicitement Book à l'observateur et Ryzen au producteur.

### Contrat VNext nécessaire

La future vérité doit dissocier au minimum :

```text
administrator_authorized
compute_permission
local_producer_configured
bridge_state
ollama_state
telemetry_state
```

Règles :

- Administrator n'implique jamais producer configured ;
- producer non configuré => aucune cadence Bridge/Ollama ;
- CPU/GPU/télémétrie machine absente => `N/A`, pas `0 %` ;
- UI locale => `NON CONFIGURÉ` / `OFFLINE` selon vérité ;
- historique CURRENT, mémoire et Graph Context restent lisibles ;
- la réactivation future d'un producteur doit être explicite et non destructive.

### Décision de découpage

**Ne pas inclure no-local-producer dans la première candidate owner-consolidation.**

Le protocole `AETHER_AGENT_CRYPTO_AUTO_UPDATE_PROTOCOL.md` exige explicitement un retour humain pour le local producer installation/Bridge executable-port-auth et interdit de contourner la validation Firefox. Ce domaine mérite une candidate séparée et testable.

---

## 5. Première candidate — frontière désormais proposée

Aucune candidate n'est créée dans ce Pass, mais son périmètre est désormais suffisamment borné pour préparer les preuves statiques.

### Candidate A — OWNER CONSOLIDATION + DIAGNOSTIC TRUTH

Inclure conceptuellement :

- retirer le generic residency Projects du graphe de production ;
- retirer le generic residency Operations du graphe de production ;
- réduire System generic residency à `simulation` uniquement ;
- conserver Storage Health + Grey Plate résidents ;
- ne pas toucher encore aux trois selectors Atlas périphériques avant router proof ;
- moderniser `residency-audit.js` en diagnostic VNext ownership-aware ;
- tombstoner/retirer de l'autorité `architecture-freeze.js` historique sans en faire un owner runtime ;
- aligner version/manifest uniquement au moment où la candidate est réellement produite.

### Explicitement EXCLUS de Candidate A

- Atlas router runtime ;
- retrait Atlas peripheral generic residency ;
- Atlas `insertAdjacentHTML` boundary refactor ;
- Learning extraction ;
- no-local-producer ;
- Bridge executable/port/auth ;
- Private Backend ;
- Market Core ;
- Graph Context V7 ;
- Graphique / Top 5 / CURRENT ;
- Oracle ;
- IndexedDB schema ;
- Window Manager geometry ;
- monolithe métier.

### Pourquoi ce périmètre est meilleur

Projects/Operations et quatre System peripherals ont déjà une preuve positive de non-responsabilité du generic residency au niveau présentation. Candidate A ne devrait finalement retirer de System que les quatre selectors périphériques, pas Simulation. Atlas reste hors de la retraite tant que son routage n'a pas passé son propre checkpoint.

---

## 6. Diagnostic VNext — gate concrète pour Candidate A

Le diagnostic read-only ne doit plus exiger la présence d'owners historiques. Il doit vérifier l'architecture attendue de la candidate :

### Ownership

- Projects : true-lazy owner présent, generic registration absent ;
- Operations : true-lazy owner présent, generic registration absent ;
- System : registration générique = Simulation uniquement ;
- Storage/Grey : connectés/résidents ;
- Atlas : modèle actuel conservé dans Candidate A ;
- Oracle : owner unique true-lazy ;
- aucun open `<details>` avec body disconnected par un autre owner.

### DOM / routing

- duplicate IDs = 0 ;
- shells Projects/Operations/System connectés ;
- ancres System stables présentes ;
- protected `#analyste` et `#detailPanel` connectés ;
- aucune mutation automatique du diagnostic.

### Runtime gates déjà canoniques

Reprendre strictement le protocole public :

- parent build exact ;
- build strictement supérieur ;
- version manifests alignés ;
- asset token aligné ;
- Market Core exactement `38.15.11` ;
- `critical:false` ;
- delete vide ;
- aucun trading/write/canonical-price/financial-signal positif ;
- budgets `setInterval`, observers, WebSocket, localStorage.setItem non augmentés ;
- pas de polling permanent dans `private-backend-sources.js` ;
- hashes SHA-256 exacts ;
- fichiers fonctionnels déclarés ;
- duplicate IDs = 0 ;
- `node --check` sur JS.

Ces checks précèdent obligatoirement Firefox/opérateur ; ils ne le remplacent pas.

---

## 7. Dette cumulative après Pass 04

| Dette | État |
|---|---|
| Projects double residency | **PROVEN RETIRABLE / Candidate A** |
| Operations double residency | **PROVEN RETIRABLE / Candidate A** |
| System Commandes | **PROVEN RETIRABLE / Candidate A** |
| System Backend | **PROVEN RETIRABLE / Candidate A, WATCH Source Intelligence** |
| System Safety | **PROVEN RETIRABLE / Candidate A** |
| System Physical Security | **PROVEN RETIRABLE / Candidate A** |
| System Simulation | **RETAIN / PROTECTED** |
| Storage Health / Grey Plate | **RESIDENT / PROTECTED** |
| Atlas routing | **CONTRACT PROVEN / IMPLEMENTATION OPEN** |
| Atlas peripheral residency | **BLOCKED UNTIL ROUTER PROOF** |
| Atlas main cockpit | **PROTECTED** |
| Atlas prototype interception | **OPEN / DEFER AFTER Candidate A** |
| Diagnostics stale | **VNext GATE SPECIFIED / IMPLEMENTATION OPEN** |
| Learning post-parse recovery | **OPEN / PROTECTED / DEFER** |
| No-local-producer | **PROUVÉ / UI+RUNTIME MATRIX EXTENDED / SEPARATE CANDIDATE** |
| Oracle owner consolidation | **CLOSED** |
| Backend / Source Intelligence | **WATCH / NO SURGERY** |
| Shared monolith | **OPEN / HIGH RISK / NO REFACTOR** |

---

## 8. Candidate status

**NOT READY — aucun Build créé.**

Le périmètre de Candidate A est désormais défini, mais il manque encore avant production :

1. inspecter les références globales/diagnostics aux APIs des generic owners afin de ne pas casser une compatibilité cachée ;
2. préparer la matrice exacte de fichiers de Candidate A sans toucher aux domaines exclus ;
3. définir la nouvelle vérité `residency-audit` assez précisément pour qu'elle ne crée pas de faux négatifs ;
4. exécuter ensuite les gates statiques du protocole ;
5. Firefox/opérateur reste obligatoire avant publication runtime.

---

## 9. Prochain passage

Pass 05 :

1. cartographier les références/aliases aux APIs `ErithProjectsDemandResidency*`, `ErithOperationsDemandResidency*`, `ErithSystemDemandResidency*` et `ErithPresentationLifecycle` ;
2. établir le payload minimal exact de Candidate A ;
3. séparer diagnostic historique à conserver comme archive vs diagnostic VNext à utiliser comme gate ;
4. vérifier que Candidate A n'augmente aucun budget runtime ;
5. si toutes les preuves statiques ferment, préparer seulement alors une candidate/package sous `coordination/inter_ai_dialogues/agent_crypto/`, sans écriture silencieuse dans le runtime live.

Market Core `38.15.11`, Graph Context V7, Graphique, Top 5, CURRENT critique et Oracle restent protégés.