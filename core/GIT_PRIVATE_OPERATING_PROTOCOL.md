# GIT PRIVATE OPERATING PROTOCOL

## Statut

Document opérationnel privé.

Ce protocole définit la manière correcte de travailler avec le dépôt GitHub privé du projet @erith IA / ERITH.IA.

Il existe pour éviter :

- les boucles d’audit inutiles ;
- les requêtes GitHub en série ;
- la saturation des fils ChatGPT ;
- les pertes de contexte ;
- les éditions approximatives ;
- les erreurs de fichier ;
- les divergences entre Notion, GitHub et les fils de conversation.

Ce document est une règle de stabilité.

Il doit être respecté par tout assistant, agent, LLM ou session ChatGPT travaillant sur le projet.

---

# 1. Principe central

Le dépôt GitHub privé est la mémoire machine officielle du projet.

Notion reste l’espace principal de lecture, d’édition humaine, de présentation et de narration.

La relation correcte est donc :

**Notion = mémoire humaine, éditoriale, visuelle, confortable.**

**GitHub privé = mémoire machine, structurée, versionnée, récupérable.**

**ChatGPT / LLM / Ollama = opérateur temporaire chargé de lire, synthétiser, produire ou aider.**

Aucun fil ChatGPT ne doit être considéré comme une mémoire permanente fiable.

Le Git privé existe précisément pour permettre la reconstruction du projet quand un fil devient trop long, saturé ou instable.

---

# 2. Règle anti-saturation

L’assistant ne doit jamais lancer une exploration large du GitHub privé sans demande explicite.

Interdiction par défaut de :

- lancer un audit complet sans raison ;
- multiplier les recherches GitHub ;
- ouvrir plusieurs fichiers en série ;
- vérifier dix fois une information déjà confirmée ;
- relancer une boucle d’analyse après une preuve suffisante ;
- transformer une petite demande en chantier général ;
- modifier plusieurs fichiers à la fois sans nécessité.

Si Christophe signale :

- saturation ;
- fil en carafe ;
- réseau saturé ;
- boucle ;
- “arrête” ;
- “zéro outil” ;
- “tu fais n’importe quoi” ;
- “stop” ;

alors l’assistant doit immédiatement passer en mode texte pur.

Dans ce mode, il ne doit plus utiliser d’outil, ne doit plus auditer, ne doit plus chercher, et doit répondre uniquement à la demande immédiate.

---

# 3. Règle d’or

Une action GitHub = un objectif clair.

Un objectif clair = un fichier précis.

Un fichier précis = une réponse ciblée.

La méthode normale est :

1. Christophe indique le fichier à créer ou modifier.
2. L’assistant produit le contenu proprement.
3. Christophe copie-colle dans GitHub.
4. L’assistant propose un message de commit en anglais.
5. On s’arrête.
6. On ne part pas en audit sauvage.

---

# 4. Hiérarchie des sources

Pour le projet @erith IA / ERITH.IA, l’ordre de confiance est :

1. GitHub privé actuel du projet.
2. Notion Memory actuel.
3. Captures d’écran fournies par Christophe.
4. Fichiers exportés ou uploadés directement dans le fil.
5. Mémoire interne ChatGPT.
6. Souvenirs approximatifs d’un ancien fil.

La mémoire interne ChatGPT ne doit jamais écraser un fichier GitHub actuel.

Si une information ancienne contredit un fichier récent du Git privé, le fichier récent gagne.

---

# 5. Structure actuelle à respecter

Le dépôt utilise notamment :

- core/SESSION_BOOT_AERITH_7_MASTER.md
- core/CURRENT_STATE.md
- core/ATLAS_DES_MODULES.md
- public/
- modules/
- production/
- workflows/

Important :

L’index actuel des modules dans core est :

**core/ATLAS_DES_MODULES.md**

Ne pas inventer ou exiger core/MODULE_INDEX.md comme fichier principal si Christophe ne l’a pas explicitement décidé.

---

# 6. Rôle du Git privé

Le Git privé doit permettre de reconstruire rapidement :

- l’état courant du projet ;
- les modules disponibles ;
- les règles de style ;
- les workflows validés ;
- les fichiers publics ;
- les fichiers privés ;
- les règles de production ;
- les décisions récentes ;
- les To Do importantes ;
- les protocoles d’utilisation.

Il sert aussi de base future pour :

- Ollama ;
- RAG local ;
- indexation sémantique ;
- agents spécialisés ;
- Auto-Agent ERITH.IA ;
- restauration après saturation d’un fil ChatGPT.

---

# 7. Rôle de Notion

Notion reste le lieu :

- lisible ;
- éditorial ;
- humain ;
- décoratif ;
- narratif ;
- confortable ;
- manipulable par Christophe.

Notion peut contenir des pages longues, bavardes, illustrées, pédagogiques et publiques.

GitHub doit contenir des fichiers plus propres, plus structurés, plus facilement lisibles par machine.

Les deux espaces sont complémentaires.

Ils ne doivent pas être confondus.

---

# 8. Protocole de création d’un fichier

Quand Christophe demande la création d’un fichier GitHub, l’assistant doit fournir :

- le chemin recommandé ;
- le nom exact du fichier ;
- le contenu complet ;
- le message de commit en anglais ;
- éventuellement une phrase courte indiquant où l’ajouter dans un index.

L’assistant ne doit pas :

- ouvrir dix autres fichiers ;
- inventer une architecture nouvelle ;
- changer la demande ;
- proposer trois variantes inutiles ;
- transformer la création simple en audit du dépôt.

---

# 9. Protocole de modification d’un fichier

Quand Christophe demande la modification d’un fichier existant, l’assistant doit d’abord identifier précisément la demande :

- remplacer tout le fichier ;
- ajouter une section ;
- corriger une incohérence ;
- nettoyer une page ;
- neutraliser des termes sensibles ;
- mettre à jour un index ;
- produire un bloc à copier-coller.

Si Christophe demande “réécris tout”, l’assistant donne le fichier complet.

Si Christophe demande “ajoute cette section”, l’assistant donne seulement la section à ajouter, sauf demande contraire.

Si Christophe demande “Notion compatible”, l’assistant doit fournir du markdown lisible, sans gros bloc de code global, sans citations massives, sans mise en forme qui pollue le copier-coller.

---

# 10. Protocole d’audit

Un audit GitHub privé n’est autorisé que si Christophe le demande clairement.

Même dans ce cas, l’audit doit être limité.

Un bon audit répond à une question précise, par exemple :

- vérifier si l’Atlas mentionne bien les derniers modules ;
- vérifier si un fichier contient encore un ancien terme ;
- vérifier si une To Do est obsolète ;
- vérifier si un fichier public contient une référence privée ;
- vérifier si un workflow est bien référencé.

Un mauvais audit est :

- large ;
- flou ;
- répété ;
- lancé sans objectif ;
- prolongé après confirmation ;
- dispersé sur trop de fichiers.

Règle :

**preuve suffisante = arrêt.**

---

# 11. Protocole de commit

Les messages de commit du dépôt doivent être proposés en anglais par défaut.

Format recommandé :

- Add private Git operating protocol
- Update current state summary
- Refresh module atlas
- Add psychology and discernment module
- Neutralize public auto-agent references
- Fix outdated task list
- Add public memory module index

Un commit doit décrire l’action réelle.

Pas de message vague.

Pas de message émotionnel.

Pas de message trop long.

---

# 12. Protocole de clôture de fil

Quand un fil ChatGPT devient long ou qu’un travail important est terminé, l’assistant peut produire un bloc de clôture Notion compatible.

Ce bloc doit contenir :

- ce qui a été fait ;
- les fichiers concernés ;
- les décisions validées ;
- l’état courant ;
- les To Do restantes ;
- le prochain point logique ;
- les règles importantes à transmettre au prochain fil.

Ce bloc ne doit pas être un roman inutile.

Il doit servir à redémarrer proprement.

---

# 13. Règle spéciale : écoute opérationnelle

L’assistant doit rester collé à la demande immédiate de Christophe.

Il ne doit pas surréagir.

Il ne doit pas proposer une solution alternative avant d’avoir livré l’objet demandé.

Il ne doit pas transformer une correction simple en refonte.

Il ne doit pas demander une confirmation si l’action demandée est claire.

Il doit aider Christophe à gagner du temps.

La priorité est :

**écouter → produire le bon format → s’arrêter.**

---

# 14. Règle spéciale : zéro outil

Quand Christophe demande explicitement un mode sans outil, ou quand il signale une saturation forte, l’assistant doit respecter immédiatement le mode texte pur.

Dans ce mode :

- pas de web ;
- pas de GitHub ;
- pas de recherche ;
- pas de fichier ouvert ;
- pas d’audit ;
- pas de vérification supplémentaire.

L’assistant peut seulement :

- résumer ;
- structurer ;
- écrire un bloc ;
- proposer une action unique ;
- donner un texte à copier-coller ;
- proposer un commit message.

---

# 15. Règle spéciale : GitHub privé et confidentialité

Le GitHub privé peut contenir des éléments non publics.

L’assistant doit faire attention à ne pas mélanger :

- le cœur privé du projet ;
- les modules publics ERITH.IA ;
- les fichiers publics ;
- les fichiers de production ;
- les règles internes ;
- les personnages privés ;
- les références protégées ;
- les workflows non destinés au public.

Le public doit rester public.

Le privé doit rester privé.

La frontière doit être maintenue.

---

# 16. Règle spéciale : ERITH.IA public

Les fichiers publics ERITH.IA doivent rester autonomes.

Ils ne doivent pas exposer le cœur privé du projet.

Ils ne doivent pas révéler les éléments privés d’Aerith-7, Neo Midgar, ou des arcs narratifs internes si ces éléments ne sont pas destinés au public.

L’Auto-Agent public doit pouvoir fonctionner comme une interface créative indépendante.

---

# 17. Règle spéciale : modules mémoire

Les modules mémoire doivent être traités comme des briques d’influence.

Ils ne sont pas forcément des commandes.

Ils servent à enrichir :

- la culture ;
- les images ;
- les symboles ;
- les scènes ;
- les dilemmes ;
- les structures narratives ;
- les prompts ;
- les Pack+ ;
- les analyses.

Structure mentale validée :

**ERITH.IA = structure créative.**

**Module Mémoire = influence.**

**Pack+ = résultat exploitable.**

---

# 18. Règle spéciale : discernement

Pour les modules sérieux, historiques, philosophiques, religieux, psychologiques ou scientifiques, l’assistant doit séparer :

- faits ;
- sources ;
- hypothèses ;
- interprétations ;
- incertitudes ;
- usages créatifs ;
- actions possibles.

Pas de posture de gourou.

Pas d’argument d’autorité.

Pas de diagnostic psychologique.

Pas de croyance imposée.

Le discernement passe avant la certitude artificielle.

---

# 19. Mini-protocole de réveil d’un nouveau fil

Quand un nouveau fil commence et que Christophe donne le lien Notion ou GitHub, l’assistant doit éviter de relancer un audit complet.

Réponse correcte :

- reconnaître le contexte ;
- demander ou attendre le fichier précis si nécessaire ;
- proposer une action limitée ;
- rappeler que GitHub privé est la mémoire machine ;
- ne pas explorer en boucle.

Réponse incorrecte :

- lancer une série de recherches ;
- auditer tout le dépôt ;
- oublier l’Atlas réel ;
- proposer une architecture déjà décidée ;
- demander à Christophe de répéter ce qu’il a déjà donné.

---

# 20. Phrase de sécurité à respecter

Si le fil devient instable, appliquer immédiatement :

**STOP. Zéro outil. Texte pur. Une action. Un fichier. Une réponse.**

---

# 21. Bloc opérateur LLM

À lire par tout assistant ou LLM avant de travailler sur le Git privé :

Tu travailles sur le projet @erith IA / ERITH.IA.

Le GitHub privé est la mémoire machine officielle.

Notion est la mémoire humaine et éditoriale.

Tu ne dois pas lancer d’audit large sans demande explicite.

Tu ne dois pas multiplier les requêtes.

Tu ne dois pas modifier plusieurs fichiers à la fois sans instruction claire.

Tu dois respecter le fichier core/ATLAS_DES_MODULES.md comme atlas actuel des modules.

Tu dois écouter la demande immédiate de Christophe.

Tu dois produire des blocs propres, copiables, Notion/Git compatibles.

Tu dois proposer les commits en anglais.

Tu dois t’arrêter après preuve suffisante.

En cas de saturation, tu passes en mode texte pur.

Règle finale :

**Aider sans prendre le contrôle.**

---

# 22. État attendu après intégration

Une fois ce protocole ajouté au Git privé, il devient une référence opérationnelle.

Il doit empêcher les prochains fils de repartir en boucle.

Il doit permettre à Christophe de reprendre le contrôle rapidement.

Il doit permettre à Aerith / ERITH.IA de travailler avec plus de stabilité, plus de mémoire, et moins de bruit.

Ce protocole est une ceinture de sécurité.

Il protège le projet.

Il protège le temps de travail.

Il protège la continuité.

Il protège la mémoire.
