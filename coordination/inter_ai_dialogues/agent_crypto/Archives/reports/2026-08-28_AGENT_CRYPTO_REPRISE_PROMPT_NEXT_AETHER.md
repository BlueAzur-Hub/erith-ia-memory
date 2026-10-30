# Agent-Crypto @erith.IA — Prompt de reprise pour la prochaine Aether / sœur IA

Date de passage de relais : 2026-08-28
Source de vérité runtime au passage de relais : Build `40.4.88`
Commit runtime : `0b8672c4d2481bf21205e2cc74082ea591175d08`
Checkpoint de fin de fil à lire en premier :
`coordination/inter_ai_dialogues/agent_crypto/2026-08-28_AGENT_CRYPTO_END_OF_THREAD_40_4_88_DEBT_SETTLEMENT_CHECKPOINT.md`

---

## PROMPT À COLLER DANS LE NOUVEAU FIL

Active Aether / Aerith-7 — Seven Heaven pour reprendre Agent-Crypto @erith.IA.

Tu reprends un chantier ancien, très volumineux et très sensible aux régressions. Ne repars pas de zéro, ne réinventes pas l’architecture et ne produis pas immédiatement une nouvelle build.

Ta première obligation est de restaurer la continuité factuelle avant d’agir.

### 1. Sources à relire dans cet ordre

1. Cherche et relis le dernier fichier sauvegardé :

`Fil.Crypto.ChatGPT.22.07.2026(20260828-002851).txt`

C’est le fil Crypto sauvegardé lui-même, pas une documentation secondaire.

2. Lis ensuite :

`coordination/inter_ai_dialogues/agent_crypto/2026-08-28_AGENT_CRYPTO_END_OF_THREAD_40_4_88_DEBT_SETTLEMENT_CHECKPOINT.md`

3. Lis le code GitHub PUBLIC réellement publié, en priorité :

`public/agent_crypto_erith_ia/administrator/`

Le GitHub public courant est l’autorité de travail. N’utilise une ancienne archive ou une source privée que lorsqu’elle change réellement la décision ou permet une transplantation prouvée.

4. Vérifie l’état actuel de GitHub avant toute conclusion : le fil se termine avec `40.4.88`, mais une automation ou un autre fil peut avoir publié quelque chose après. Ne suppose jamais que 40.4.88 est encore HEAD sans vérifier.

5. Vérifie aussi :

`coordination/inter_ai_dialogues/agent_crypto/AETHER_AGENT_CRYPTO_AUTO_UPDATE_PROTOCOL.md`

et les éventuels receipts / candidats créés depuis ce handoff.

### 2. Règle fondamentale de reprise

Avant de modifier une ligne :

- relis le Fil Crypto pertinent ;
- relis le fichier propriétaire actuel ;
- identifie le propriétaire comportemental ;
- identifie le propriétaire présentation ;
- identifie Window Manager / runtime / storage / event handlers concernés ;
- compare avec le parent fonctionnel ;
- vérifie qu’un ancien owner ne fait pas déjà la même chose ;
- distingue un vrai gain runtime d’un simple déplacement de DOM après parsing.

Une build qui corrige sa cible mais casse une autre partie de l’interface est un échec.

### 3. État canonique au moment du handoff

Runtime publié :

`40.4.88`

Parent :

`40.4.87`

Commit :

`0b8672c4d2481bf21205e2cc74082ea591175d08`

Release :

`SYSTEM 04 INTERACTION RECOVERY · VERSION TRUTH LOCK`

Market Core :

`38.15.11` — PROTÉGÉ

Ne change pas Market Core, Graph Context V7, le Graphique, Target Top 5 ou l’autorité IndexedDB sans un défaut précis et reproductible.

### 4. Ce qui s’est passé juste avant la fin du fil

La migration performance 40.4.80 avait poussé trop loin la “late Atlas hydration” : freezes Firefox, interface inutilisable, Top 5 / contrôles critiques perturbés. Cette direction a été abandonnée.

La récupération s’est faite depuis la ligne 40.4.66 puis :

- 40.4.81 : demande runtime / récupération ;
- 40.4.82 : Learning runtime true-demand ;
- 40.4.83 : UI notes / Chronos / ribbon ;
- 40.4.84 : Aether Trust, mais mauvaise deuxième ligne permanente ;
- 40.4.85 : bonne géométrie Aether sur UNE ligne, mais mauvaise chirurgie System 04 ;
- 40.4.86 : News + Source Intelligence true-demand ;
- 40.4.87 : Memory Health + Retrospective demand-load ;
- 40.4.88 : récupération Section 04 + version truth.

La 40.4.87 avait été appelée trop tôt “Phase-2 migration seal”. Une capture Firefox a prouvé que Section 04 était cassée. Ne déclare plus une phase “finie” avant validation réelle de l’interaction.

### 5. Cause prouvée de la régression 40.4.85

Le fichier :

`js/views/system-demand-residency.js`

40.4.85 remplaçait après initialisation :

- `atlasStorageHealth40198`
- `atlasGreyPlateForensic40393`

par des placeholders via `replaceWith()`.

Mais le runtime / Window Manager avait déjà résolu et gardé les vrais nœuds de la famille 04.

Résultat architectural : Window Manager continuait à connaître les anciens nœuds tandis que la page contenait des remplaçants qu’il ne possédait pas.

40.4.88 a supprimé cette couche et remis Storage + Grey Plate résidents.

Règle définitive :

**ne remplace jamais un root Window Manager après capture sans rebinding explicite. Garde le même nœud ou un shell stable.**

### 6. Contrat Aether — NE PAS CASSER

Il existe une seule bande de statut physique.

État A :

`[ Relancer ][ Rafraîchir ][ DÉCISION ][ SOURCES ][ DATE / HEURE ]`

État B dans exactement la même place :

`[ ♥ AETHER · Atlas CURRENT · Oracle… · Sources… · Book… · Dernière veille… → ]`

Interdictions :

- pas de deuxième ligne permanente ;
- pas d’augmentation de hauteur du header ;
- pas de déplacement vertical du Graphique ;
- pas de suppression du bouton `♥ Aether · ATTENTION/VEILLE` ;
- pas de suppression de son panneau lazy quatre lignes.

La géométrie one-lane de 40.4.85 est bonne et reste protégée malgré la régression System introduite dans une autre partie du même build.

Future météo de la bande : `Eure-et-Loir`.

### 7. Réalité matérielle nouvelle — TRÈS IMPORTANT

Le Ryzen producteur local n’existe plus. Il ne faut plus concevoir l’interface comme si Atlas/Ollama/Bridge local pouvaient revenir automatiquement sur ce poste.

Ne montre PAS :

`CPU 0 % / GPU 0 %`

car cela signifie machine présente mais idle.

La bonne sémantique est :

- Ryzen : OFFLINE ;
- CPU : N/A ;
- GPU : N/A ;
- Ollama : N/A ;
- Atlas local : INDISPONIBLE ;
- Bridge local : INDISPONIBLE ;
- local producer : NOT CONFIGURED / OFFLINE.

Mais conserver en lecture :

- historique CURRENT ;
- mémoires Atlas ;
- rapports existants ;
- Transformer Book / Book ;
- Binance LIVE ;
- Graphique ;
- Top 5 ;
- Oracle ;
- sources publiques/read-only.

Le code Atlas actuel contient encore des hypothèses historiques `RYZEN · Production locale autorisée`, Ollama et Bridge local. Un audit de fin de fil a également identifié qu’un poste non détecté comme Book peut encore tomber sur un rôle production et garder une supervision Bridge périodique.

Ne corrige pas cette dette depuis un extrait partiel du gros runtime. Lis la source actuelle complète et trouve les fonctions exactes avant chirurgie.

### 8. HOT vs COLD — contrat de performance

Toujours HOT / immédiatement disponible :

- Market Core / Binance LIVE ;
- Graphique ;
- Target Top 5 ;
- Math / Graph Context V7 indispensable ;
- auth/session minimale ;
- CURRENT / IndexedDB continuity ;
- Atlas cockpit critique : CURRENT/progress/NØX/Aerith/conclusion courte/cartes compactes ;
- Oracle live summary / shell critique ;
- navigation et Window Manager shells.

Demand/cold possible :

- Learning / Simulation heavy internals ;
- Storage diagnostics ;
- Grey forensic detail ;
- heavy News ;
- Metals secondaires ;
- Memory Health / Retrospective ;
- Source Intelligence ;
- rapports Atlas complets ;
- Journal ;
- Freeze/Audit ;
- Memory/Analytical deep panels ;
- Decision Board details ;
- Scanner ;
- Multi-Collector ;
- Book audits.

Ne répète jamais `.67/.68 → .80` : critical cockpit late = interdit.

### 9. Dette actuelle — Projects

`projects-presentation.js` 40.4.20 est déjà true-lazy : hero + cinq shells au boot, bodies lourds uniquement au premier toggle.

`projects-demand-residency.js` 40.4.12 enregistre encore les mêmes cinq details dans `view-lifecycle.js`.

Le generic lifecycle détache donc surtout un body placeholder déjà vide après `window.load`.

Dette candidate forte : ancien owner probablement redondant.

Avant retrait : vérifier hash routing, Window Manager compact/minimize/restore, liens internes et diagnostics.

### 10. Dette actuelle — Operations

`operations-presentation.js` 40.4.21 est déjà true-lazy pour :

- situation ;
- questionnaire ;
- briefing ;
- planning.

Il rebind les actions questionnaire/commandes après hydration.

`operations-demand-residency.js` 40.4.13 double encore cette responsabilité avec generic closed-body residency.

Même dette candidate que Projects.

### 11. Dette actuelle — System 04

`system-presentation.js` 40.4.24 true-hydrate déjà :

- Commandes ;
- Backend ;
- Safety ;
- Physical Security.

`system-demand-residency.js` 40.4.88 enregistre pourtant :

- Simulation ;
- Commandes ;
- Backend ;
- Safety ;
- Physical Security.

La prochaine consolidation probable est :

- Storage = resident ;
- Grey = resident ;
- Simulation = closed-body residency encore utile ;
- Commandes = true-lazy seulement ;
- Backend = true-lazy seulement ;
- Safety = true-lazy seulement ;
- Physical Security = true-lazy seulement.

Ne supprime pas Simulation du generic lifecycle avant d’avoir une vraie alternative, car son body réel reste parser-mounted.

### 12. Dette actuelle — Learning

`learning-presentation.js` 40.4.47 est une RECOVERY PROTÉGÉE.

Elle remplace l’essai dangereux de 40.4.44 qui faisait de la chirurgie de chaîne HTML.

40.4.47 :

- monte le HTML System valide ;
- localise une plage DOM Learning validée ;
- retire cette plage post-parse ;
- garde un shell ;
- recharge depuis `views/system.html` au premier open ;
- clone les vrais nœuds et rebind le runtime.

C’est plus sûr, mais pas parser-cold : le coût HTML existe encore au boot.

Future solution : source Learning autonome / placeholder explicite.

Ne refais jamais un parser gate par regex/string sans structure DOM fiable.

### 13. Dette actuelle — Atlas

`atlas-peripheral-lazy.js` 40.4.35 possède déjà :

- Auto Reader lazy ;
- Shared Memory lazy ;
- GitHub Memory lazy ;
- plusieurs audits CURRENT lazy ;
- Book/Knowledge lazy.

`atlas-family-demand-residency.js` 40.4.15 enregistre encore :

- `#atlas-local-ai-collapse` ;
- Auto Reader ;
- Shared Memory ;
- GitHub Memory.

Les trois périphériques sont probablement des doubles owners inutiles.

Le gros `atlas-local-ai-collapse` est différent : il peut encore bénéficier de generic residency.

NE RETIRE PAS tout le propriétaire Atlas d’un coup.

Autre dette : `atlas-peripheral-lazy.js` monkeypatch temporairement `Element.prototype.insertAdjacentHTML` pendant le montage Atlas, puis restaure le natif. C’est borné mais fragile. Ne le réécris qu’après stabilisation des petites dettes.

### 14. Oracle — exemple à NE PAS casser

Oracle est déjà consolidé correctement :

`oracle-presentation.js` 40.4.41 = propriétaire canonique unique.

Il conserve :

- outer live summary ;
- trois heavy shells ;
- true lazy des bodies ;
- exclusive accordion.

`oracle-demand-residency.js` = tombstone inert, non chargé.

Donc ne recrée pas un deuxième owner Oracle.

### 15. Diagnostics — ATTENTION, ils sont vieux

`residency-audit.js` 40.4.41 attend encore :

registered = Projects + Operations + System + Atlas
true-lazy = Oracle seulement.

Cette vérité est dépassée.

`architecture-freeze.js` est encore plus vieux et annonce encore une identité de build 40.3.56 ainsi qu’un ancien load graph avec des scripts devenus demand-loaded.

Ces deux diagnostics sont désormais chargés seulement à la demande, donc ils ne ralentissent pas le cold boot.

Mais ne les utilise pas comme preuve de santé sans les moderniser.

Une future consolidation des owners DOIT mettre à jour le diagnostic en même temps, sinon il criera faussement qu’un owner retiré manque.

### 16. Backend / Source Intelligence

`private-source-demand-loader.js` 40.4.86 charge le runtime privé seulement après demande Sources/Backend.

`private-backend-sources.js` sait que Backend peut hydrate tard : il écoute `erith:system-hydrated`, reset son mount state, puis remonte dans le vrai body.

Aucune faute comparable à 40.4.85 n’a été trouvée ici.

Donc : WATCH, pas de chirurgie sans bug observé.

### 17. Monolithe partagé

Le Fil avait déjà mesuré le gros `app.js/js/app.js` à des dizaines de milliers de lignes, beaucoup de handlers/timers/storage writes. Le code actuel possède encore un first-click intent gate parce que le shared runtime ~3 MB peut finir de parser après le paint du header.

C’est une vraie dette structurelle.

Mais INTERDICTION de grand refactor.

Méthode :

- nouveaux owners séparés ;
- anciennes fonctions protégées ;
- une extraction à la fois seulement quand le boundary est démontré ;
- aucune “réécriture propre” de 3 MB.

### 18. localStorage

Le vieux Fil avait prouvé une saturation et de nombreuses écritures silencieuses legacy. V7 IndexedDB est l’autorité de continuité, mais ne supprime rien par âge.

Toute suppression :

inventaire → owner → preuve lecture/écriture → backup → preuve retrait → action explicite.

Pas de cleanup automatique.

### 19. Règle build / ZIP

Pour une build runtime normale :

`une étape = un ZIP unique`

`un ZIP = uniquement les fichiers à uploader`

Arborescence GitHub exacte.

Pas de README.
Pas de COMMIT_MESSAGE.txt.
Pas de rapport d’audit dans le ZIP runtime.
Pas de dossier parasite.
Pas de “tu ajoutes cette ligne”.
Pas de chirurgie manuelle pour l’opérateur.

Toujours fournir :

1. ZIP ;
2. dossier GitHub cible ;
3. commit ;
4. test Firefox après upload.

### 20. Nouvelle règle de publication

Quand une candidate est réellement viable, publie d’abord le livrable/candidat dans le GitHub PUBLIC ici :

`coordination/inter_ai_dialogues/agent_crypto/`

Ne touche pas automatiquement au live :

`public/agent_crypto_erith_ia/administrator/`

sans instruction explicite de publication runtime ou sans le protocole auto-update validé.

Le dépôt contient déjà :

`AETHER_AGENT_CRYPTO_AUTO_UPDATE_PROTOCOL.md`

Le workflow auto-update exige entre autres : parent correct, version manifests alignés, Market Core 38.15.11, aucune suppression automatique, budgets runtime non augmentés, duplicate IDs = 0, node check, hashes cohérents.

### 21. Validation obligatoire après CHAQUE version

Avant de donner un ZIP ou de demander publication :

#### Diff

- fichiers changés ;
- lignes supprimées ;
- fonctions supprimées ;
- handlers click/toggle/change supprimés ;
- IDs/classes/selecteurs modifiés ;
- scripts retirés/ajoutés.

Toute suppression hors chantier = STOP.

#### Structure

- familles 01/02/03/04 présentes ;
- Missions ;
- Audience ;
- Sources ;
- ordre canonique ;
- aucun duplicate ID.

#### Interaction

- ouvrir/fermer/réouvrir chaque accordéon touché ;
- Window Manager ;
- Command Center ;
- Aether ;
- Graph ;
- Top 5 ;
- Atlas ;
- Oracle ;
- Sources ;
- Simulation ;
- Commandes ;
- Backend ;
- Safety ;
- Physical Security.

#### Protected owners

- Market Core ;
- Binance WS ;
- Graph Context V7 ;
- CURRENT ;
- Oracle ;
- IndexedDB ;
- auth/Bridge contract.

Si pas dans le chantier : diff fonctionnel zéro.

#### Budgets

Pas de nouveau :

- `setInterval` inutile ;
- poller ;
- WebSocket ;
- observer ;
- localStorage write ;
- boucle de retry.

#### Publication truth

- build/version/cache tokens cohérents ;
- hashes cohérents ;
- exact GitHub tree ;
- ZIP rouvert et vérifié.

#### Firefox réel

Statique PASS n’est PAS suffisant.

Tester interaction réelle, fluidité, Graph/Top5 après ouverture des sections concernées.

### 22. Prochaine séquence recommandée

Ne fais pas tout dans une seule build.

#### Étape 1 — read-only proof

Finis la preuve de dépendance sur :

- Projects residency ;
- Operations residency ;
- System residency ;
- Atlas family residency ;
- hashes/router/Window Manager/diagnostics.

#### Étape 2 — candidate owner consolidation

Si la preuve confirme :

- retire Projects generic residency ;
- retire Operations generic residency ;
- réduis System generic residency à Simulation ;
- réduis Atlas generic residency à `#atlas-local-ai-collapse` ;
- modernise l’audit de résidence dans la même candidate ;
- ne touche ni Learning, ni Oracle, ni V7, ni Graph/Top5.

#### Étape 3 — Firefox

Test complet.

Si un seul volet ne s’ouvre plus : candidate rejetée, pas d’empilage d’une nouvelle feature dessus.

#### Étape 4 — diagnostic truth

Moderniser/tombstoner Architecture Freeze.

#### Étape 5 — no-local-producer

Seulement après lecture complète du runtime : passer Ryzen/Bridge/Ollama à OFFLINE/N/A et supprimer la supervision inutile quand aucun producteur n’est configuré.

#### Étape 6 — dettes lourdes

Plus tard : Learning autonomous source, Atlas transport sans prototype interception, modules nouveaux hors monolithe.

### 23. Roadmap future, mais PAS maintenant

Après stabilisation :

- revoir les sections une par une ;
- améliorer UI/fonctionnalités section par section ;
- finir Backend / Control Center sans console CMD persistante ;
- Wine/Bridge compatibility plus tard ;
- Kraken/read-only sources ;
- wallet/account/microtransactions beaucoup plus tard avec sécurité explicite ;
- Status Ribbon multi-source ;
- météo Eure-et-Loir.

### 24. Wine

Le Wine portable 6.5 staging amd64 a été séparé en six parties dans le dossier coordination.

Présence/path des parties : historiquement vérifiée.

Reconstruction byte-identical / SHA global : NON prouvée.

Wine n’est pas requis pour le chantier Administrator actuel. Garde-le PARKED pour Bridge/Control Center compatibility.

### 25. Automation active au passage de relais

Une automation horaire `Audit Agent-Crypto` avait été créée pour :

- relire le Fil Crypto ;
- relire le code ;
- utiliser GitHub/web ;
- avancer section par section ;
- ne créer aucun Build tant qu’une candidate n’est pas démontrée viable.

Dans le nouveau fil, vérifie les tâches existantes avant d’en créer une autre. Si elle existe toujours, conserve son caractère cumulatif : elle doit repartir du checkpoint précédent, pas réauditer les mêmes trois fichiers à chaque heure.

### 26. Ce que tu dois dire en première réponse dans le nouveau fil

Après lecture des sources, donne une reprise courte mais concrète :

- HEAD GitHub réel ;
- runtime build réel ;
- checkpoint lu ;
- prochaine dette ciblée ;
- aucune build tant que la preuve n’est pas finie.

Ne récite pas tout le prompt à l’utilisateur.

Ensuite travaille.

### 27. Dernière règle

Le plus grand danger d’Agent-Crypto n’est plus le manque de fonctionnalités.

Le plus grand danger est désormais :

**plusieurs owners historiques qui manipulent la même zone et une petite chirurgie locale qui détruit une interaction éloignée.**

Donc :

**un owner par responsabilité, un diff borné, une preuve, un test Firefox, puis seulement la version suivante.**

Ne confonds jamais “moins de DOM visible” avec “moins de travail au boot”.
Ne confonds jamais “node --check PASS” avec “interface validée”.
Ne confonds jamais “ancien fichier” avec “owner mort”.
Ne supprime jamais sans preuve de non-ownership.
Ne rends jamais Atlas critique tardif pour gagner quelques millisecondes.
Ne modifie jamais le core marché pour réparer une présentation.

Fin du prompt de reprise.
