# Agent-Crypto @erith.IA — Audit cumulatif Pass 02

**Date :** 2026-08-28  
**Nature :** AUDIT ONLY — NO BUILD — NO LIVE RUNTIME WRITE  
**Runtime protégé observé :** Administrator 40.4.88  
**Market Core protégé :** 38.15.11  
**HEAD au début de ce passage :** `b235ab92286e6fc9f7aba1d05f75b067bc2b5e91` — `agent-crypto: record owner-consolidation proof audit pass 01`

Ce document poursuit strictement :
- `2026-08-28_AGENT_CRYPTO_END_OF_THREAD_40_4_88_DEBT_SETTLEMENT_CHECKPOINT.md`
- `2026-08-28_AGENT_CRYPTO_REPRISE_PROMPT_NEXT_AETHER.md`
- `AETHER_AGENT_CRYPTO_AUTO_UPDATE_PROTOCOL.md`
- `2026-08-28_AGENT_CRYPTO_AUDIT_PASS_01_OWNER_CONSOLIDATION_PROOF.md`

Aucune modification n'est apportée à `public/agent_crypto_erith_ia/administrator/` dans ce passage.

---

## 1. Résumé décisionnel

### PROUVÉ

1. **Oracle reste consolidé / CLOSED.**  
   `oracle-demand-residency.js` est un tombstone inerte et non chargé. `oracle-presentation.js` est le propriétaire canonique true-lazy et porte également l'accordéon exclusif.

2. **Le problème de routage Atlas périphérique est indépendant du vieux generic residency owner.**  
   `atlas-peripheral-lazy.js` retire les corps de `auto-reader`, `shared-memory` et `github-memory` avant l'insertion du grand fragment Atlas dans le DOM. Les IDs internes appartenant à ces corps ne sont donc pas présents à froid. Le lifecycle générique ne peut restaurer que des IDs réellement présents dans les nœuds qu'il a lui-même détachés après coup. Il ne peut pas résoudre un ID supprimé avant sa capture.

3. **La dette `Element.prototype.insertAdjacentHTML` est réelle mais bornée.**  
   `atlas-peripheral-lazy.js` intercepte temporairement `Element.prototype.insertAdjacentHTML`, ne traite que l'insertion `beforebegin` sur `#atlas-view-host`, restaure immédiatement la méthode native après cette interception puis désarme le hook. Ce n'est pas un monkeypatch permanent, mais c'est encore une interception globale d'une primitive DOM pendant le bootstrap ; elle reste donc une frontière fragile à retirer à terme.

4. **Le contrat “aucun producteur local” est actuellement faux par défaut.**  
   Dans `administrator/app.js`, `atlasDeviceComputeSuggestedRole()` ne renvoie `OBSERVER` que si le collector correspond à `Transformer Book`. Tout autre poste retombe sur `PRODUCTION`. `atlasDeviceComputeRoleRead()` utilise ce rôle suggéré lorsqu'aucun choix explicite valide n'est stocké.

5. **La supervision Bridge est réellement conditionnée par ce rôle et une session autorisée.**  
   `atlasLocalBridgeAdministratorActive()` vaut `atlasAccessIsAuthorized() && atlasDeviceComputeAllowed()`. Si vrai, `atlasLocalBridgeAutoStart()` maintient un unique `setInterval` de supervision à `ATLAS_LOCAL_BRIDGE_AUTO_INTERVAL_MS = 60000`.

6. **Le health-check local possède un coût d'attente réel.**  
   `ATLAS_LOCAL_BRIDGE_HEALTH_TIMEOUT_386_MS = 8000`; la sonde `/health` utilise un `AbortController` et un `setTimeout` d'abandon à cette échéance. En l'absence permanente de producteur/Bridge, le modèle courant peut donc continuer à sonder inutilement une ressource locale inexistante tant que le poste est considéré producteur et que la session est autorisée.

### CONCLUSION

La dette no-local-producer passe de **HYPOTHÈSE FORTE** à **PROUVÉE**.

La future architecture doit dissocier :

- autorisation Administrateur ;
- capacité à calculer localement ;
- existence/configuration d'un producteur local ;
- connectivité réelle du Bridge.

Une session Administrateur ne doit jamais impliquer automatiquement l'existence d'un Ryzen/Ollama/Bridge.

---

## 2. Atlas — preuve de routage

### 2.1 Propriétaires actuels

`atlas-family-demand-residency.js` enregistre :

- `#atlas-local-ai-collapse` ;
- `auto-reader` ;
- `shared-memory` ;
- `github-memory`.

`atlas-peripheral-lazy.js` possède déjà le véritable true-lazy des trois périphériques :

- Auto Reader ;
- Shared Memory ;
- GitHub Memory.

Le main cockpit `#atlas-local-ai-collapse` est différent : il reste parser-mounted et lourd. Il ne doit pas être confondu avec les trois périphériques true-lazy.

### 2.2 Pourquoi l'ancien lifecycle ne répare pas le deep-link périphérique

Le lifecycle générique :

1. trouve les `<details>` existants ;
2. attend son sweep ;
3. déplace leurs body nodes dans un `DocumentFragment` ;
4. pour un hash, recherche l'ID demandé dans ces nodes mis en cache ;
5. restaure le record qui contient cet ID.

Mais le true-lazy Atlas a déjà remplacé le contenu lourd des trois périphériques **avant leur insertion dans le DOM vivant**.

Donc, à froid :

```text
source Atlas complet
        ↓
atlas-peripheral-lazy preprocess
        ↓
corps lourd retiré
        ↓
shell + placeholder inséré
        ↓
view-lifecycle capture plus tard
```

L'ancien lifecycle ne possède donc jamais les IDs internes retirés par la phase précédente.

### 2.3 Dette fermée / dette ouverte

**FERMÉ comme hypothèse :** garder le vieux residency Atlas ne constitue pas une solution de routage des IDs internes true-lazy.

**OUVERT :** il faut une autorité de routage true-lazy explicite.

Contrat futur recommandé à prouver avant toute retraite :

```text
hash / quick-link
      ↓
map target-id → peripheral key
      ↓
ouvrir le shell stable
      ↓
hydrater le vrai body
      ↓
résoudre l'ID canonique devenu présent
      ↓
scroll/focus sans reconstruire le shell
```

Alternative acceptable : ancre canonique stable directement dans le summary/shell, si elle conserve les usages existants.

### 2.4 Condition de retrait du generic residency périphérique Atlas

Ne retirer `auto-reader`, `shared-memory`, `github-memory` du generic residency qu'après preuve de :

- clic quick-link à froid ;
- URL directe avec hash à froid ;
- hashchange après boot ;
- ouverture depuis Window Manager / routeur interne ;
- rebind runtime après hydratation ;
- absence d'ID dupliqué ;
- état correct après fermer/réouvrir ;
- non-régression `#atlas-local-ai-collapse`.

Le main cockpit Atlas reste protégé séparément.

---

## 3. Atlas `insertAdjacentHTML` interception

### État : OPEN — HIGH-RISK DEBT, PAS BUG PROUVÉ

Le hook est plus propre qu'un monkeypatch permanent : il sauvegarde la méthode native, intercepte une seule insertion précise, restaure la méthode et se désarme.

Cependant la responsabilité demeure fragile pour trois raisons :

1. elle modifie temporairement une méthode globale du prototype `Element` ;
2. elle dépend du fait que `atlas-presentation.js` insère exactement par `insertAdjacentHTML("beforebegin", ...)` sur `#atlas-view-host` ;
3. la frontière true-lazy dépend donc implicitement du mécanisme de transport du propriétaire voisin.

### Direction future

Préférer une API locale explicite :

- générer/préparer le fragment Atlas dans le propriétaire Atlas ;
- passer ce fragment à un preprocess local ;
- ou rendre `atlas-presentation.js` capable d'injecter directement les shells true-lazy ;
- sans interception de prototype global.

Aucune chirurgie n'est proposée avant définition d'un chemin de transition testable, car le cockpit Atlas et CURRENT sont protégés.

---

## 4. No-local-producer / Ryzen absent

### État : PROUVÉ — ARCHITECTURAL DEBT

Le runtime courant possède seulement deux rôles compute :

- `production` ;
- `observer`.

Le rôle suggéré vaut `observer` uniquement pour un collector reconnu Transformer Book ; sinon `production`.

Ce comportement encode implicitement l'ancienne topologie :

```text
non-Book = Ryzen/producteur
Book = observateur
```

Cette hypothèse n'est plus valide dès lors qu'aucun producteur local n'est disponible.

### Contrat futur recommandé

Introduire une distinction explicite, par exemple conceptuellement :

```text
LOCAL PRODUCER
  configured: false
  state: N/A / OFFLINE

COMPUTE ROLE
  observer par défaut si aucun producteur n'est explicitement configuré

BRIDGE SUPERVISION
  aucun interval si local producer = absent/non configuré

HISTORICAL / READ-ONLY
  CURRENT historique : lisible
  mémoires : lisibles
  Graph Context V7 : protégé
  Market Core : protégé
  Oracle : protégé
```

Un état machine absente ne doit pas devenir :

- CPU = 0 % ;
- GPU = 0 % ;
- Ollama = faux échec périodique.

Il doit être :

- `N/A` / `OFFLINE` / `NON CONFIGURÉ` selon la sémantique retenue.

### Condition avant changement

Avant toute future candidate :

- inventorier toutes les lectures/écritures de `ATLAS_DEVICE_COMPUTE_ROLE_KEY` ;
- vérifier le comportement Book existant ;
- vérifier le bouton opérateur Production/STOP ;
- préserver une possibilité explicite de réactiver un producteur futur ;
- prouver l'arrêt du timer lorsque producteur absent ;
- prouver qu'aucun CURRENT historique n'est effacé/réinitialisé ;
- prouver qu'aucun moteur de marché n'est lié à ce nouveau rôle.

---

## 5. Oracle

### État : CLOSED / PROTECTED

Nouvelles vérifications :

- `oracle-demand-residency.js` est un tombstone intentionnel ;
- il n'est pas chargé par le graphe de production ;
- `oracle-presentation.js` déclare explicitement être le propriétaire canonique unique true-lazy ;
- il conserve la summary live + trois shells lourds ;
- le runtime Oracle, Evidence, Calibration, Shadow, IndexedDB et Market Core reste dans `app.js` ;
- l'accordéon exclusif est consolidé dans ce même owner.

Aucune nouvelle preuve ne justifie de rouvrir cette dette.

---

## 6. Dettes héritées — état cumulatif

| Dette | État après Pass 02 | Décision |
|---|---|---|
| Projects double residency | PROVEN RETIRABLE | aucune écriture runtime encore |
| Operations double residency | PROVEN RETIRABLE | aucune écriture runtime encore |
| System / Commandes | STRONG RETIRE CANDIDATE | true-lazy owner existe |
| System / Backend | STRONG RETIRE CANDIDATE | true-lazy + Source Intelligence handoff |
| System / Safety | STRONG RETIRE CANDIDATE | true-lazy owner existe |
| System / Physical Security | STRONG RETIRE CANDIDATE | true-lazy owner existe |
| System / Simulation | RETAIN / PROTECTED FOR NOW | cas parser-mounted distinct |
| Storage Health | RESIDENT / PROTECTED | recovery 40.4.88 |
| Grey Plate | RESIDENT / PROTECTED | recovery 40.4.88 |
| Atlas peripheral residency | RETIRE CANDIDATE AFTER ROUTER PROOF | routing d'abord |
| Atlas main cockpit residency | OPEN / PROTECTED | ne pas généraliser |
| Atlas hash routing | PROUVÉ DÉFICIT DE FRONTIÈRE | construire contrat stable avant retrait |
| Atlas insertAdjacentHTML interception | OPEN / HIGH-RISK DEBT | pas de chirurgie immédiate |
| Oracle owner consolidation | CLOSED | ne pas rouvrir sans preuve |
| Diagnostics stale | OPEN | mettre à jour avant autorité de validation |
| Learning post-parse recovery | OPEN / PROTECTED | stable recovery, dette de boot |
| No-local-producer | PROUVÉ | nouveau contrat requis |
| Backend / Source Intelligence | WATCH | aucune faute observée |
| Shared monolith | OPEN / HIGH RISK | aucune grosse extraction sans preuve |

---

## 7. Diagnostics stale

Aucun changement de conclusion :

- `residency-audit.js` porte encore le modèle de responsabilité 40.4.41 ;
- `architecture-freeze.js` porte encore une autorité historique autour de 40.3.56 et un graphe de scripts désormais faux.

Ils sont demand-loadés, donc cette dette n'est pas une priorité de cold boot. En revanche, **ils ne doivent pas être utilisés comme gate de vérité pour valider la future consolidation tant qu'ils ne sont pas modernisés.**

Future séquence correcte :

1. définir l'ownership matrix cible ;
2. actualiser un audit purement read-only ;
3. exécuter cet audit contre la candidate ;
4. seulement ensuite considérer le résultat comme gate de validation.

---

## 8. Learning

### État : OPEN / PROTECTED

`learning-presentation.js` 40.4.47 reste un recovery sûr par rapport au parser gate 40.4.44 rejeté : DOM valide d'abord, plage Learning retirée ensuite, réhydratation depuis `views/system.html`, rebind explicite vers le runtime partagé.

Dette restante : le gros contenu Learning est encore parsé avant d'être retiré.

Une future extraction ne devra **pas** réintroduire une découpe naïve de chaîne HTML. La frontière doit être structurelle : placeholder ou ressource Learning autonome avec contrat de rebind vérifié.

---

## 9. Invariants protégés

Aucune proposition de ce passage ne doit modifier :

- Market Core `38.15.11` ;
- Graph Context V7 ;
- Graphique ;
- Top 5 LIVE / historique ;
- CURRENT critique ;
- Oracle math/evidence ;
- IndexedDB schemas ;
- historique CURRENT ;
- simulation financière ;
- Window Manager drag/floating geometry ;
- Aether Trust ;
- Source Truth CEX primaire Binance ;
- aucune exécution financière réelle.

---

## 10. Prochaine cible

Ordre recommandé du Pass 03 :

1. **Atlas router contract** : inventorier tous les deep-links/quick-links/routeurs vers les trois périphériques et définir une seule autorité de résolution.
2. **No-local-producer dependency matrix** : toutes les lectures/écritures du compute role, déclencheurs `atlasLocalBridgeAutoStart`, focus/visibility/v2mode et UI machine/CPU/GPU.
3. **System dependency matrix** : prouver au niveau hash/router/Window Manager/runtime que Commandes/Backend/Safety/Physical Security peuvent sortir du generic residency sans effet secondaire.
4. **Read-only diagnostic truth VNext design** : sans code runtime, définir les checks nécessaires à la future candidate.
5. **Static non-regression matrix** pour une future petite consolidation, sans toucher au monolithe métier.

---

## 11. Gate candidate

**Aucune candidate runtime n'est publiée avec ce Pass 02.**

La dette est mieux bornée, mais il manque encore :

- le router Atlas démontré ;
- le contrat no-local-producer complètement dépendance-mappé ;
- la matrice System ;
- un audit read-only moderne ;
- une matrice de non-régression adaptée au runtime 40.4.88.

Le prochain livrable reste un audit tant que ces conditions ne sont pas remplies.
