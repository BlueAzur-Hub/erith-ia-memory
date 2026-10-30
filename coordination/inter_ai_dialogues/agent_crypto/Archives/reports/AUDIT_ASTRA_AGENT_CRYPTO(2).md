**Audit Astra — Agent-Crypto 40.6.152 à 40.6.165**

16 septembre 2026 — dépôt examiné en lecture seule. Aucune modification de l’application, des ZIP reçus, des workflows ou des comptes. Aucune interaction avec le Bridge privé ni aucun ordre financier.

**Avis général**

Le projet a progressé depuis l’audit .126. Quatre familles de corrections sont confirmées dans les reproductions ciblées : fraîcheur DEX et compatibilité avec l’API figée, STOP volontaire, lecture historique TRADUS et retrait de la fausse émission de finalisation par la présentation Atlas. Il faut conserver ces acquis.

Les versions .152–.165 développent surtout la lecture des preuves et leur présentation. Elles rendent visibles l’historique POST-CURRENT, les gates de Strategy A, les contrôles d’intégrité après coûts et les conditions nécessaires au replay. Elles ne démontrent pas encore une stratégie rentable et ne livrent pas encore un backtest réaliste. Le maintien de G3 en PENDING et de G9 en LOCKED est cohérent avec leur contenu.

Les problèmes prioritaires se trouvent désormais dans la durée de vie des composants, l’applicabilité des preuves historiques et la traçabilité des dates. Une nouvelle couche de présentation ne suffira pas à les résoudre.

**Référence et méthode**

| Contrôle | Résultat |
| --- | --- |
| Commit GitHub figé pour cet audit | `a8ee570696f1a468003ec836a8128497b2fd2374` |
| Nature du commit de tête | Mise à jour automatique des données publiques ; il contient le runtime examiné |
| Build du manifeste | **40.6.165**, parent **40.6.164** |
| Release | **STRATEGY A G3 REALISTIC REPLAY CONTRACT** |
| Market Core déclaré | **38.15.11** |
| GitHub Pages | Succès sur ce commit, exécution **35043975925** |
| Sources locales vérifiées contre les empreintes Git | **44 fichiers** |
| Archives reçues | **10**, CRC ZIP valide pour chacune, SHA-256 recalculé |
| Empreintes internes SHA256SUMS fournies | **31 contrôles, tous conformes** |
| Reproductions ciblées | **17 reprises de l’audit précédent + 16 nouveaux cas logiques + 5 cas DOM + 2 cas de bootstrap d’archive** |
| Syntaxe / JSON des paquets et entrées comparées | **38 contrôles**, une entrée HTML avec JavaScript invalide |

Les tests logiques utilisent Node.js et des données contrôlées. Les tests DOM utilisent LinkeDOM pour les insertions, suppressions et événements ; ils ne mesurent pas le rendu CSS. La session Firefox de Christophe, les véritables compteurs privés et le Bridge n’ont pas été reproduits. Les validations Firefox citées dans les handoffs et le manifeste sont des validations rapportées par ces sources, pas de nouveaux essais terrain de ma part.

Sources de publication : [commit](https://github.com/BlueAzur-Hub/erith-ia-memory/commit/a8ee570696f1a468003ec836a8128497b2fd2374), [build.json](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/a8ee570696f1a468003ec836a8128497b2fd2374/public/agent_crypto_erith_ia/administrator/build.json), [Pages](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/35043975925). Un succès Pages n’est pas une preuve de justesse des gates ou de rentabilité.

**Ce que les versions apportent réellement**

| Version | Apport | Limite actuelle |
| --- | --- | --- |
| .152 | Historique des CURRENT évaluables, affichage limité aux huit dernières unités | Lecture d’observations ; aucun score de prévision |
| .153 puis .154 | Pont de lecture Strategy A / CURRENT / POST-CURRENT | Le montage .153 est signalé rejeté, puis corrigé dans la lignée publiée |
| .155 | Détail des gates non soldées | Plusieurs libellés perdent encore l’état réel du propriétaire |
| .157 puis .158 | Audit des gates et bouton explicite de tests ; réparation de son ancrage | Le rerendu du parent peut encore supprimer des composants ajoutés ensuite |
| .159 / .160 | Preuve terrain de fondation et paquet de passation | La .160 jointe est documentaire, pas une distribution complète |
| .161 / .162 | Diagnostic G1 après coûts, puis réparation de son montage | La première apparition est traitée ; l’actualisation durable ne l’est pas complètement |
| .163 | Restauration d’un reçu historique de fondation après recharge | Pas de contrôle de son applicabilité aux modules effectivement chargés |
| .164 | Repérage des candidats historiques existants | Lecture de texte DOM, pas accès structuré au dataset |
| .165, trouvée sur GitHub | Définition des huit champs du futur replay et interdiction de fuite d’information future | Aucun validateur complet ni dataset de replay certifié ; G3 reste PENDING |

Le manifeste .165 distingue les anciennes preuves terrain des preuves encore attendues. Il rapporte notamment des candidats de 300 points de marché, 483 observations de mémoire et 1 CURRENT évaluable sur 2 dans la capture précédente. Ces chiffres décrivent cette capture, pas un comptage live effectué par l’audit. Ils ne remplacent pas des décisions Strategy A et leurs entrées figées à t0.

**Réévaluation des anciens défauts**

| Défaut de l’audit .126 | Résultat actuel des cas ciblés |
| --- | --- |
| Champ DEX `observed_at_utc` ignoré | Corrigé : une observation de 60 secondes est reconnue fraîche |
| Proxy sur API figée provoquant une TypeError | Corrigé : la façade lit les deux méthodes sans exception |
| Dates DEX futures acceptées sans distinction | Une tolérance explicite et le motif FUTURE_TIMESTAMP sont présents |
| STOP suivi d’un autostart | Corrigé dans le cas testé : la clé d’arrêt est écrite, aucun rappel de start |
| Ancienne lecture Shadow recalculée avec le nouvel état A | Corrigé dans le cas testé : l’observation lue reste identique |
| Signal TRADUS manquant assimilé à NO_TRADE | Corrigé : NON COMPARABLE |
| Présentation .126 émettant CURRENT finalisé sans preuve | Cette émission et les wrappers métier ont été retirés |
| Gardes des commentaires IA incomplets | Toujours reproduit : les trois fausses assertions testées passent sans conflit |
| Rafraîchissement TRADUS `{ok:false}` compté sans erreur | Toujours reproduit : cycle compté, `last_error:null` |

Ces résultats ne sont pas une certification exhaustive de chaque sous-système. Ils permettent de fermer les anciens cas précisément testés et de ne pas relancer leurs chantiers par réflexe.

**1. Priorité haute — les composants G1/G3 peuvent disparaître après actualisation**

Fichiers : `strategy-a-evidence-dossier.js`, `strategy-a-paper-v2-proof-bridge.js`, `strategy-a-evidence-gate-audit-anchor-repair.js`.

Le dossier accepte maintenant l’audit ou les gates du Proof Bridge comme ancre de secours. C’est utile pour le premier montage, mais le dossier devient alors un descendant du bloc que `ProofBridge.render()` reconstruit avec `innerHTML`.

Reproduction D01, avec ce chemin de secours prévu par le code :

| Étape | Dossier G1/G3 | Audit | Contrat G3 .165 |
| --- | --- | --- | --- |
| Après montage | Présent | Présent | Présent |
| Après `ProofBridge.render()` | Absent | Absent | Absent |
| Après réparation et nouvel événement clic | Toujours absent | Rétabli | Toujours absent |

Le bouton « Actualiser preuves » appelle justement ce rendu. Le dossier a déjà retiré ses écouteurs après le montage réussi ; la réparation de l’audit ne le remonte pas. Cela explique un risque de retour des symptômes « le module est chargé mais le panneau a disparu », malgré les corrections .158/.162.

Autre reproduction D02 : avec une ancre stable, l’API passe de zéro à une ligne after-cost ; après clic et pageshow, son snapshot contient bien une ligne mais le compteur rendu reste à zéro. Le premier montage ne constitue pas un abonnement aux changements de données.

Correction proposée :

- Définir un emplacement stable des composants, hors de la portion reconstruite par le parent, ou préserver leurs nœuds lors de son actualisation.
- Séparer `mount()` et `update(snapshot)` ; conserver l’état ouvert des détails et le focus.
- Relier les mises à jour aux événements existants des propriétaires de données. S’il manque une notification, l’ajouter au propriétaire concerné ; ne pas créer de polling global pour compenser.
- Tester montage tardif → actualiser → exécuter fondation → masquer/rouvrir → arrivée d’une nouvelle preuve. Le composant doit rester présent et sa valeur doit suivre le snapshot.

[Dossier actuel](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/a8ee570696f1a468003ec836a8128497b2fd2374/public/agent_crypto_erith_ia/administrator/js/strategy-a-evidence-dossier.js), [parent qui reconstruit le DOM](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/a8ee570696f1a468003ec836a8128497b2fd2374/public/agent_crypto_erith_ia/administrator/js/strategy-a-paper-v2-proof-bridge.js).

**2. Priorité haute — le reçu .159 conserve une preuve, mais ne prouve pas le runtime courant**

La .163 intègre un objet constant `FOUNDATION_RECEIPT` avec le PASS terrain .159. L’objectif de continuité est légitime : un rechargement ne doit pas effacer l’existence d’un test réellement observé. Je ne conteste pas ce reçu historique.

Le problème est son utilisation : `foundationTruth()` en déduit PASS sans vérifier que les modules présents correspondent à ceux testés. N01 obtient G2/G7 FOUNDATION_PASS alors que les quatre propriétaires déclarent `available:false`. N03/N04 montrent qu’un nouveau test explicite défaillant prend correctement priorité dans la session. N05 montre qu’un nouveau contexte rétablit le PASS ancien et oublie cet échec.

Autre problème, N06 : si les objets modules existent mais ne possèdent pas `self_test`, `runFoundationTests()` accepte `{pass:!!api, reason:"NO_SELF_TEST_REQUIRED"}`. Avec un preflight de bridge positif, le bouton peut ainsi produire PASS sans avoir exécuté les tests des trois modules concernés. Ce test emploie des interfaces volontairement incomplètes ; il prouve le mauvais traitement d’une dépendance absente, pas une absence de tests dans tous les modules publiés.

Correction :

- Séparer **preuve historique PASS**, **compatibilité de cette preuve**, **état du dernier test** et **disponibilité actuelle des modules**.
- Lier le reçu aux empreintes des modules et à la version du contrat/test, pas nécessairement à chaque build cosmétique.
- Sans module ou sans méthode de test requise : INCOMPLETE / UNAVAILABLE, jamais PASS par simple présence d’un objet.
- Conserver le dernier échec dans un mécanisme de preuve existant ; après recharge, une preuve historique ne doit pas masquer un échec plus récent applicable au même code.
- Ne pas transformer FOUNDATION_PASS en certification globale de chaos testing. L’audit peut afficher « fondation validée » tout en indiquant précisément la couverture des tests.

G9 reste verrouillé dans le code examiné. Ces défauts concernent la vérité des attestations et ne démontrent aucun déverrouillage du trading réel.

[Safety Certification .163](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/a8ee570696f1a468003ec836a8128497b2fd2374/public/agent_crypto_erith_ia/administrator/js/strategy-a-safety-certification.js).

**3. Priorité haute avant replay — distinguer date du fait, date de clôture et date de sauvegarde**

Le lecteur rétrospectif emploie `Date.parse(value || 0)`. Sur le moteur Node/V8 du test, une date absente devient une date autour du 1er janvier 2000 au lieu d’être rejetée. N14 retient alors un CURRENT sans horodatage comme évaluable. Ce résultat précis dépend du moteur : il ne constitue pas un test Firefox. L’analyse des dates non standard est justement dépendante de l’implémentation. [Documentation Date.parse](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse).

Indépendamment de ce cas, `marketTime()` accepte `saved_at` ou `last_seen_at` lorsque la date du marché manque. N15 traite ainsi une observation sans date de source comme strictement postérieure à CURRENT parce qu’elle a été sauvegardée plus tard. Une sauvegarde tardive ne démontre pas que le prix a été observé après la décision.

Le contrôle N16 confirme que, lorsque les horodatages canoniques sont présents, les observations antérieures ou exactement simultanées sont exclues. Il faut conserver cette règle et renforcer ses préconditions.

Un autre raccord affecte G1 : `fromReconciliation()` remplace un `closed_at` absent par l’heure actuelle. N13, sur 30 lignes synthétiques isolées, obtient zéro timestamp manquant et `monte_carlo_ready:true`, alors qu’aucune date de clôture source n’a été fournie. Le test n’a exécuté aucun trade et n’a pas promu la gate G6, qui reste PENDING. Il montre que le diagnostic de readiness perd la provenance temporelle en amont.

Correction :

- Rejeter explicitement null, vide et types inattendus avant le parsing ; exiger une date canonique avec fuseau ou un timestamp numérique documenté.
- Conserver séparément `observed_at`, `received_at`, `closed_at` et `saved_at`.
- Si l’horodatage nécessaire à la preuve manque, conserver l’enregistrement à titre diagnostique avec `TIME_UNVERIFIED`, mais l’exclure de la certification.
- Vérifier `outcome_observed_at > decision_at` avec les dates des faits, et non avec les dates d’écriture en mémoire.

[Lecteur POST-CURRENT](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/a8ee570696f1a468003ec836a8128497b2fd2374/public/agent_crypto_erith_ia/administrator/js/retrospective-validation.js), [producteur after-cost](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/a8ee570696f1a468003ec836a8128497b2fd2374/public/agent_crypto_erith_ia/administrator/js/strategy-a-after-cost-metrics.js).

**4. Priorité importante — G3 lit la présentation et transforme encore l’inconnu en zéro**

La découverte .164 analyse `document.body.innerText` avec des expressions régulières. Elle dépend donc de la présence, de la visibilité et de la formulation des autres panneaux. La .165 relit ensuite une partie des chiffres dans les cellules DOM de ce dossier.

N09 fournit uniquement « série historique 24h · 300 pts ». Le résultat affirme `median_step_min:0` et `completeness_pct:0`, alors que ces deux informations sont absentes. D03 confirme l’affichage « 0 min » et « 0.0 % ». La cause est la conversion de la chaîne vide en nombre zéro, puis une seconde conversion de `null` dans le rendu. [Conversion Number documentée](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number).

G3 reste PENDING : il n’y a pas de faux backtest exécuté. Mais le diagnostic est faux et le futur replay ne doit pas se baser dessus.

Correction : lire les propriétaires structurés de série, Market Memory et rétrospective ; conserver les valeurs inconnues comme null jusqu’au formatage « INCONNU » ; inclure identifiant de dataset, actif, source, fenêtre et date de collecte. La couche UI doit afficher ces faits, pas devenir leur source.

La .165 définit huit champs utiles mais `definition_ready` vérifie seulement la longueur de cette liste. C’est une définition documentaire, pas un validateur de lignes. Avant une implémentation G3, préciser aussi version de stratégie et paramètres, provenance des données, politique de coûts/exécution, horizon d’outcome et séparation train/test. Un snapshot descriptif CURRENT ne reconstitue pas à lui seul les entrées exactes dont Strategy A disposait au moment de décider.

[Contrat .165](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/a8ee570696f1a468003ec836a8128497b2fd2374/public/agent_crypto_erith_ia/administrator/js/strategy-a-evidence-gate-audit-anchor-repair.js).

**5. Priorité importante — des libellés contradictoires réduisent la valeur de l’interface**

Deux reproductions :

- D04 : Evidence Dossier absent → « 0 gate(s) non soldée(s) ». L’absence du lecteur est confondue avec un résultat connu égal à zéro.
- D05 : G2 affiche PASS et « Aucune dette », tout en indiquant « le test […] n’est pas soldé dans cette session ». Le texte de preuve ne tient pas compte du reçu historique.

Le détail .155 numérote aussi les seules lignes non soldées de 01 à N et leur donne toutes le badge WAIT. Après résolution de G2/G7, ces indices ne correspondent plus aux numéros réels des gates ; LOCKED ou INSUFFICIENT_SAMPLE perdent leur distinction dans ce panneau.

Correction : un modèle de présentation commun doit conserver `gate`, `state`, `proof_source`, `proof_at`, `applicability` et `reason`. Si un propriétaire est indisponible, afficher INDISPONIBLE, pas zéro. Garder FOUNDATION_PASS distinct de PASS complet, et afficher le numéro canonique de la gate.

Le CSS ajouté impose souvent des corps de 7 à 9 px. Sans capture actuelle, je ne juge pas le rendu final de Firefox, mais ces tailles déclarées prolongent la dette de lisibilité signalée dans le fil. Préférer une synthèse courte lisible, puis les champs techniques repliables, plutôt qu’une succession de tableaux miniaturisés. Aucun changement d’artwork n’est nécessaire pour cela.

**6. Archives — une livraison ZIP doit être corrigée, indépendamment du site**

Les dix ZIP sont lisibles et les 31 empreintes internes fournies sont conformes. Cela garantit l’intégrité des paquets reçus, pas l’exécutabilité de leurs fichiers.

| Paquet | Observation vérifiée |
| --- | --- |
| .152 | Module d’historique identique au GitHub actuel |
| .153 | Ancienne étape, remplacée par la lignée .154/.155 ; patch partiel |
| .155 | Module actuel équivalent, différence de fin de fichier seulement |
| .157 | Audit actuel équivalent sur les modifications observées, différence d’indentation |
| .158 | Réparation d’ancrage étendue depuis par la .165 |
| .160 | Paquet de passation documentaire, explicitement non autonome |
| .161 / .162 | Entrées HTML archivées différentes des entrées GitHub ; leur regex de métadonnées duplique l’ancienne valeur au lieu de la remplacer dans le test |
| **.163** | **L’entrée `administrator/releases/40.6.163/index.html` contient un script invalide : SyntaxError** |
| .164 | Le fichier JavaScript du dossier correspond exactement à GitHub ; le ZIP contient `README_RELEASE_ENTRY.html`, pas l’entrée exécutable `index.html` |

Dans la .163, un retour à la ligne littéral coupe une chaîne JavaScript entre apostrophes. Deux caractères de contrôle ont aussi remplacé les séquences attendues pour les frontières de mots dans les regex. Le fichier GitHub .163 consulté est corrigé et passe le contrôle syntaxique. Il ne faut donc pas réimporter cette entrée du ZIP sur le dépôt.

Les essais de bootstrap des .161/.162 conservent simultanément une nouvelle métadonnée de build et celle de l’ancien shell. Cela ne prouve pas une panne complète du boot, mais démontre que ces archives ne sont pas des copies strictes des entrées actuellement corrigées.

Correction de livraison : reconstruire chaque paquet depuis un commit fixé, conserver les chemins de destination, contrôler le JavaScript inline des HTML, comparer les octets du paquet aux blobs Git annoncés, puis produire le SHA. Une archive différentielle doit déclarer sa base requise et les fichiers réellement inclus. La .164 peut être un patch valide sans entrée autonome, à condition que cela soit explicite.

La racine Administrator lit maintenant le manifeste avant d’exécuter le shell : c’est un progrès de cohérence depuis l’ancien audit. Les anciennes URL `/releases/…/` chargent néanmoins encore les assets partagés actuels. Elles ne constituent pas à elles seules des instantanés reproductibles de tout le code d’une ancienne build.

**Dettes précédentes encore présentes**

Les trois cas de commentaires IA incohérents et le mauvais bilan d’erreur TRADUS ont été rejoués sur les sources actuelles : ils restent ouverts. Le module de raffinement des commentaires et celui du poll TRADUS sont identiques aux versions précédemment auditées ; le garde de base extrait d’app.js présente les mêmes limites testées. Leur correction peut être séparée des nouvelles réparations G1/G3.

Le diagnostic G1 filtre également les lignes non objets avant de compter le dataset. N11 : une ligne valide accompagnée de trois entrées invalides est présentée comme un dataset d’une ligne intègre. Ajouter `input_rows`, `accepted_rows` et `rejected_rows`, avec raisons, pour que cette élimination ne soit pas silencieuse.

**Ordre de travail proposé à la prochaine IA**

1. Vérifier le HEAD actuel avant modification ; cet audit est figé sur .165. Réparer la livraison ZIP .163 depuis le commit correspondant sans modifier la stratégie.
2. Stabiliser le cycle montage / mise à jour / destruction des panneaux G1/G3 et du Proof Bridge. Valider les transitions, pas uniquement une capture initiale.
3. Séparer preuve de fondation historique et preuve applicable au runtime ; supprimer le PASS lorsqu’une méthode de test obligatoire manque.
4. Corriger les horodatages et leur provenance avant de certifier une seule ligne de replay.
5. Brancher la découverte G3 sur les données structurées, conserver UNKNOWN et réaliser ensuite un validateur effectif de ligne.
6. Produire un petit jeu de replay traçable en mode hors trading : une décision t0 réellement figée, un outcome strictement postérieur et un modèle de coûts explicite. Si les entrées historiques n’existent pas, le signaler et commencer leur capture à partir de maintenant ; ne pas les reconstruire avec des informations futures.
7. Traiter séparément les deux dettes anciennes des commentaires IA et du poll TRADUS.

Le seuil de 30 lignes est celui de l’implémentation actuelle. Atteindre ce nombre ne certifie ni la représentativité d’un échantillon ni sa rentabilité. G4/G5 exigent encore de vraies séparations temporelles, G6 des stress mesurés et G8 une observation Paper exploitable. Rien dans cet audit ne justifie d’assouplir les entrées pour fabriquer des trades ni de déverrouiller G9.

Préserver Graphique, Lecture Technique, Chronos, Oracle métier, Aether, Web Classique et Market Core hors d’un défaut directement démontré. Une responsabilité, une correction locale, un test de raccord, puis une vérification terrain adaptée.

**Conclusion de travail**

La meilleure avancée suivante est de rendre fiables les preuves que l’interface possède déjà. Les versions récentes apportent une meilleure visibilité, mais la visibilité d’un panneau, l’existence d’un reçu historique, la validité temporelle d’une observation et la certification d’un replay sont quatre résultats différents. Le code doit les conserver distincts jusqu’à la livraison.
