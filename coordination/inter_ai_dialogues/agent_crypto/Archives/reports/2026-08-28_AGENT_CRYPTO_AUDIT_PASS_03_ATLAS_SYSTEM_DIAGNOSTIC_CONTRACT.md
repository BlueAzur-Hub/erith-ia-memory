# Agent-Crypto @erith.IA — Audit cumulatif Pass 03

**Date :** 2026-08-28  
**Nature :** AUDIT ONLY — NO BUILD — NO LIVE RUNTIME WRITE  
**Runtime protégé :** Administrator 40.4.88  
**Market Core protégé :** 38.15.11  
**HEAD au début du passage :** `5a6273453d0dfa3cd10321a29f9bec5a1a760f13` — Pass 02 coordination uniquement.

Ce document continue directement les handoffs canoniques et les Pass 01/02. Il ne modifie aucun fichier sous `public/agent_crypto_erith_ia/administrator/`.

---

## 1. Résumé décisionnel

### PROUVÉ

1. **Le runtime live n'a pas changé depuis 40.4.88.** Le HEAD GitHub a avancé uniquement par documents de coordination/audit après le commit runtime `0b8672c4d2481bf21205e2cc74082ea591175d08`.

2. **Projects et Operations restent PROVEN RETIRABLE pour leur ancien generic closed-body residency.** Leur true-lazy owner crée déjà les shells et hydrate le vrai corps à l'ouverture. Aucun nouvel élément ne justifie de rouvrir cette conclusion.

3. **System est désormais suffisamment séparé pour une matrice d'ownership précise.** Storage Health et Grey Plate restent résidents. Simulation reste un vrai corps parser-mounted. Commandes, Backend, Safety et Physical Security sont quatre shells true-lazy avec body placeholder et ancre stable dans le `summary`.

4. **Le generic residency System n'est pas l'autorité de routage des quatre shells true-lazy.** Les ancres `#commandes`, `#backend`, `#safety` et `#physical-security` sont présentes dans les summaries stables. Le true-lazy owner écoute `toggle` et `erith:presentation-resident`; son hash helper ne charge que lorsque le shell est déjà ouvert. Le generic residency n'est donc pas requis pour rendre ces ancres présentes à froid.

5. **Atlas `insertAdjacentHTML` est une dette réelle mais bornée.** `atlas-peripheral-lazy.js` sauvegarde `Element.prototype.insertAdjacentHTML`, intercepte seulement l'insertion `beforebegin` sur `#atlas-view-host`, exécute son preprocess, remet immédiatement la méthode native puis désarme le hook. Ce n'est pas une interception permanente.

6. **La fragilité Atlas vient davantage de la frontière implicite que de la durée du hook.** Le true-lazy dépend du fait que `atlas-presentation.js` utilise exactement cette primitive DOM et cette cible. Le preprocess repose en plus sur des bornes textuelles/regex autour de `<details>` et `<section>`. Il faut donc remplacer cette frontière à terme par une API locale explicite, pas simplement déplacer le même monkeypatch.

7. **Le no-local-producer reste PROUVÉ et doit être traité comme vérité d'environnement, pas comme panne.** Le Pass 02 a démontré que le rôle compute retombe implicitement sur Production hors Transformer Book et que la supervision Bridge peut alors conserver une cadence `/health`. La future sémantique doit séparer Administrator / compute permission / producer configured / Bridge connected.

8. **Les diagnostics historiques ne peuvent pas servir de gate VNext dans leur état courant.** L'auto-update protocol exige des gates strictes de version, budgets runtime, Market Core 38.15.11, hashes, duplicate IDs et syntaxe JS. Le prochain audit read-only doit compléter ces gates avec une matrice d'ownership actuelle plutôt que des listes de scripts hardcodées historiquement.

### HYPOTHÈSE / À MESURER

- Retirer les generic residency redondants de Projects/Operations et des quatre périphériques System devrait réduire listeners, bookkeeping et chemins d'événement, mais le gain de performance lui-même n'est pas encore mesuré et peut être modeste puisque les placeholders true-lazy sont déjà légers.
- Le retrait du hook `insertAdjacentHTML` peut améliorer la robustesse architecturale sans produire de gain Firefox perceptible. Sa priorité est la fiabilité, pas une promesse de vitesse.

---

## 2. System 04 — matrice d'ownership cible

| Zone | État DOM à froid | Owner présentation actuel | Generic residency | Décision audit |
|---|---|---|---|---|
| Storage Health | vrai panneau résident | System presentation + app runtime | aucun besoin | **PROTECTED RESIDENT** |
| Grey Plate Forensic | vrai panneau résident | System presentation + app runtime | aucun besoin | **PROTECTED RESIDENT** |
| Simulation | vrai corps lourd parser-mounted | System presentation / app runtime | détache corps fermé | **RETAIN FOR NOW** |
| Commandes | shell + placeholder | `system-presentation.js` true-lazy | détache placeholder | **PROVEN RETIRE CANDIDATE** |
| Backend | shell + placeholder | `system-presentation.js` true-lazy + Source Intelligence handoff | détache placeholder | **PROVEN RETIRE CANDIDATE** |
| Safety | shell + placeholder | `system-presentation.js` true-lazy | détache placeholder | **PROVEN RETIRE CANDIDATE** |
| Physical Security | shell + placeholder | `system-presentation.js` true-lazy | détache placeholder | **PROVEN RETIRE CANDIDATE** |

### Preuve de routage

Les quatre shells true-lazy placent une ancre stable dans leur `summary` :

- `id="commandes"`
- `id="backend"`
- `id="safety"`
- `id="physical-security"`

Le body lourd n'a donc pas besoin d'être résident pour que la destination de navigation existe. Une ouverture native du `<details>` déclenche ensuite le propriétaire true-lazy.

### Backend particulier

Backend garde une dépendance supplémentaire : Source Intelligence / Private Backend. Cette dépendance est déjà traitée explicitement par `erith:system-hydrated`; le runtime Source Intelligence remonte son panneau après l'hydratation réelle du body. Cela reste WATCH, mais aucune raison n'apparaît pour conserver un second propriétaire de détachement du placeholder.

### Condition avant future chirurgie

Avant retrait effectif des quatre selectors du generic residency :

- test hash à froid pour les quatre ancres ;
- test hashchange post-boot ;
- ouverture souris/clavier ;
- Window Manager docked/floating ;
- Backend Source Intelligence après hydratation ;
- fermer/réouvrir sans double bind ;
- duplicate IDs = 0.

Simulation ne doit pas être entraînée dans cette consolidation.

---

## 3. Atlas peripheral — frontière VNext

### État actuel

`atlas-peripheral-lazy.js` possède déjà :

- Auto Reader ;
- Shared Memory ;
- GitHub Memory ;
- quatre blocs read-only CURRENT audit ;
- deux blocs Book/Knowledge.

Le fichier transforme le gros HTML Atlas avant son insertion. Pour les trois périphériques, il remplace le body complet par un placeholder puis recharge `views/atlas.html` au premier `toggle`.

### Hook global — preuve exacte

Le fichier :

1. capture `nativeInsert = Element.prototype.insertAdjacentHTML` ;
2. arme un booléen `armed=true` ;
3. remplace temporairement la méthode du prototype ;
4. ne preprocess que si la cible est `#atlas-view-host` et la position `beforebegin` ;
5. exécute l'insertion native avec le HTML preprocessé ;
6. passe `armed=false` ;
7. restaure `Element.prototype.insertAdjacentHTML=nativeInsert` ;
8. attache les owners true-lazy.

**Verdict : OPEN / HIGH-RISK ARCHITECTURAL DEBT, PAS BUG PROUVÉ.**

### Pourquoi ne pas le retirer brutalement

Ce hook est aujourd'hui la frontière qui empêche le gros contenu périphérique/audit Atlas d'être monté à froid. Le supprimer sans replacement remettrait ces corps dans le DOM et pourrait réintroduire le coût que les vagues 40.3.51→40.4.35 cherchaient à contenir.

### Frontière cible

Une future version viable devrait faire porter le preprocess au propriétaire local, par exemple conceptuellement :

```text
atlas-presentation
  obtains canonical source/fragment
        ↓
AtlasPresentationBoundary.prepare(fragment)
        ↓
mount stable shells
        ↓
AtlasPeripheralOwner hydrate(key) on explicit demand
```

Aucune primitive globale du DOM ne doit être interceptée.

---

## 4. Atlas routing — contrat complet avant retrait du vieux owner

Le Pass 02 a prouvé que le generic lifecycle ne peut pas restaurer un ID qui a été retiré **avant** son propre sweep.

La future autorité Atlas doit donc exposer explicitement une résolution de destination :

```text
requested target
   ↓
resolve target → peripheral key
   ↓
find stable <details> shell
   ↓
open shell
   ↓
await hydrate(key)
   ↓
resolve canonical target now present
   ↓
scroll/focus
```

Le contrat doit couvrir :

- quick-links existants ;
- URL directe avec hash ;
- `hashchange` ;
- routeur interne ;
- Window Manager ;
- fermeture/réouverture ;
- aucune duplication d'ID ;
- aucune ouverture involontaire du main cockpit.

**Le main `#atlas-local-ai-collapse` reste hors de cette retraite.**

---

## 5. No-local-producer — dépendances à protéger

### Vérité cible

L'état absent/non configuré d'un producteur n'est pas une erreur réseau répétitive.

Proposition de contrat conceptuel :

```text
administrator_authorized: true|false
compute_role: observer|production
local_producer_configured: true|false
bridge_state: n/a|offline|online|error
ollama_state: n/a|offline|online|error
```

Règles :

- `administrator_authorized=true` ne force jamais `local_producer_configured=true` ;
- si `local_producer_configured=false`, aucune supervision périodique Bridge/Ollama ;
- télémétrie CPU/GPU absente = `N/A`, jamais faux `0 %` ;
- les données historiques restent lisibles ;
- un futur producteur peut être explicitement réactivé sans migration destructive ;
- Market Core, Binance LIVE, Graphique, Top 5, Oracle et historique CURRENT restent indépendants.

### Risque de compatibilité

Le bouton existant Production / STOP et le stockage du compute role ont une sémantique historique. Une future version ne doit pas convertir silencieusement un rôle stocké en nouvelle vérité de producteur. Le plus sûr est d'ajouter une vérité explicite `producer configured` plutôt que de surcharger `observer`.

**État : OPEN / DESIGN PROUVÉ NÉCESSAIRE, IMPLEMENTATION NON ENCORE AUTORISÉE.**

---

## 6. Diagnostics VNext — contrat read-only proposé

Les audits historiques ne doivent plus déduire la santé de l'application à partir d'une liste fixe de vieux scripts.

### 6.1 Identity truth

Vérifier dynamiquement :

- meta build = manifest build ;
- Administrator build = manifest ;
- Market Core = exactement `38.15.11` ;
- asset token cohérent ;
- parent build attendu lors d'une candidate.

### 6.2 Ownership truth

Déclarer une matrice actuelle :

- `projects`: true-lazy owner unique ;
- `operations`: true-lazy owner unique ;
- `system.simulation`: generic closed-body allowed ;
- `system.commandes/backend/safety/physical-security`: true-lazy owner unique ;
- `atlas.main`: hot/protected + éventuel closed-body owner ;
- `atlas.peripherals`: true-lazy owner unique ;
- `oracle`: true-lazy owner unique ;
- Storage/Grey: resident.

Le diagnostic doit signaler **duplicate ownership**, pas "missing old registration".

### 6.3 DOM/routing truth

Checks read-only :

- duplicate IDs ;
- shells attendus connectés ;
- stable anchors présents ;
- open body jamais detached par un autre owner ;
- target map Atlas complète ;
- aucun protected cockpit disconnected.

### 6.4 Runtime budget truth

Conserver les gates de l'auto-update protocol :

- pas d'augmentation `setInterval(` ;
- pas de nouvel observer ;
- pas de nouveau WebSocket ;
- pas de hausse de writes localStorage ;
- `private-backend-sources.js` sans polling permanent ;
- JS syntax check ;
- hashes manifest ;
- aucune capacité financière positive.

### 6.5 Local producer truth

Ajouter :

- absence producteur => aucune cadence Bridge ;
- état UI N/A/OFFLINE cohérent ;
- historique CURRENT non reset ;
- Market Core indépendant.

---

## 7. Dettes — état cumulatif après Pass 03

| Dette | État |
|---|---|
| Projects double residency | **PROVEN RETIRABLE** |
| Operations double residency | **PROVEN RETIRABLE** |
| System Commandes | **PROVEN RETIRE CANDIDATE** |
| System Backend | **PROVEN RETIRE CANDIDATE / WATCH handoff** |
| System Safety | **PROVEN RETIRE CANDIDATE** |
| System Physical Security | **PROVEN RETIRE CANDIDATE** |
| System Simulation | **RETAIN / PROTECTED** |
| Storage Health / Grey Plate | **RESIDENT / PROTECTED** |
| Atlas peripheral generic residency | **RETIRE AFTER ROUTER PROOF** |
| Atlas main cockpit | **PROTECTED / OPEN** |
| Atlas hash/router | **OPEN — explicit owner required** |
| Atlas prototype interception | **OPEN — bounded high-risk debt** |
| Oracle owner consolidation | **CLOSED** |
| Diagnostics stale | **OPEN — VNext contract now designed** |
| Learning post-parse recovery | **OPEN / PROTECTED** |
| No-local-producer | **PROUVÉ / OPEN** |
| Backend / Source Intelligence | **WATCH, no surgery** |
| Shared monolith | **OPEN / HIGH RISK** |

---

## 8. Invariants protégés

Aucune future candidate issue de cet audit ne doit modifier sans checkpoint humain spécifique :

- Market Core `38.15.11` ;
- Graph Context V7 ;
- Graphique ;
- Top 5 ;
- CURRENT cadence/fingerprint/finalization ;
- Oracle prediction/evidence ;
- IndexedDB schema ;
- Bridge executable/port/auth ;
- Private Backend executable ;
- trading/order/wallet/financial action ;
- Window Manager drag/floating geometry ;
- simulation métier ;
- historique CURRENT.

Ces frontières sont cohérentes avec `AETHER_AGENT_CRYPTO_AUTO_UPDATE_PROTOCOL.md`, qui exige un retour humain pour les modifications critiques de ces domaines.

---

## 9. Candidate status

**NOT READY — aucun Build créé.**

Il manque encore avant une candidate viable :

1. une preuve complète du router Atlas et de sa target map ;
2. la cartographie exhaustive des dépendances du compute role / Bridge UI avant no-local-producer ;
3. une stratégie de remplacement local du hook Atlas, ou décision explicite de le laisser intact dans une première petite candidate ;
4. le diagnostic read-only VNext suffisamment concret pour servir de gate ;
5. validation statique puis Firefox/opérateur de la future petite consolidation.

---

## 10. Prochain passage

Priorités du Pass 04 :

1. inventorier les destinations Atlas réelles (`auto-reader`, `shared-memory`, `github-memory` et IDs internes) et leurs routeurs ;
2. cartographier les lectures/écritures du rôle compute, la supervision Bridge, focus/visibility et les éléments UI CPU/GPU/Ollama ;
3. décider si la première candidate doit rester volontairement petite : **owner consolidation + diagnostics seulement**, en laissant Learning et le hook Atlas intacts ;
4. définir une matrice de tests Firefox/opérateur avant tout package.

Aucun runtime live n'a été modifié par ce Pass 03.
