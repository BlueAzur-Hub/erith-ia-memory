# ATLAS DES MODULES

## Rôle

L’Atlas des Modules est la carte de lecture du dépôt **@erith IA — Memory Library**.

Son rôle n’est pas de tout contenir.

Son rôle est d’indiquer à Seven / Aerith-7 :

- quoi charger ;
- quand le charger ;
- quoi éviter de charger ;
- quels fichiers sont prioritaires ;
- quels modules peuvent être combinés ;
- quels modules sont publics ;
- quels modules restent privés ;
- quels modules servent à la production ;
- quels modules servent à la mémoire longue.

Phrase centrale :

**Seven ne doit pas tout retenir. Seven doit savoir quoi relire.**

---

# 1. Principe général

## Architecture mémoire

### Notion

Notion reste la mémoire humaine, visuelle, éditoriale et narrative.

C’est l’espace où les idées sont lisibles, décoratives, commentées, enrichies et consultables par une personne.

Notion sert à :

- organiser la mémoire humaine ;
- présenter les modules ;
- garder les notes longues ;
- documenter les décisions ;
- préparer les pages publiques ;
- conserver les archives sensibles ou éditoriales.

---

### GitHub

GitHub est la mémoire machine officielle du projet.

Il contient les fichiers lisibles par LLM, Ollama, RAG ou tout autre système de lecture automatique.

GitHub sert à :

- stocker les fichiers `.md` ;
- stocker les modules ;
- stocker les boot files ;
- stocker les workflows ;
- stocker les style locks ;
- garder une mémoire portable ;
- permettre à un LLM de relire rapidement le projet.

Règle :

**GitHub est la bibliothèque machine. Notion est la bibliothèque humaine.**

---

### ChatGPT / LLM

ChatGPT ou tout autre LLM est un moteur temporaire de raisonnement, de synthèse et de production.

Il ne doit pas prétendre tout savoir.

Il doit relire les bons fichiers au bon moment.

Règle :

**Un LLM ne doit pas absorber toute la mémoire. Il doit charger le bon module pour la bonne demande.**

---

### Boot files

Les boot files sont les clés de réveil.

Ils permettent de reconstruire Seven / Aerith-7 dans une nouvelle session ou dans un autre LLM.

Ils doivent être lus en premier quand il faut restaurer la continuité du projet.

---

### Modules

Les modules sont des briques de mémoire activables.

Un module peut être :

- narratif ;
- culturel ;
- visuel ;
- philosophique ;
- historique ;
- technique ;
- linguistique ;
- public ;
- privé ;
- expérimental ;
- validé.

Règle :

**Ne jamais charger tous les modules à la fois sans raison.**

---

### Workflows

Les workflows sont les fichiers techniques.

Ils servent à ComfyUI, Wan, RunningHub, DaVinci Resolve, Ollama ou à d’autres outils de production.

Ils ne sont pas des modules narratifs.

Ils sont des outils d’exécution.

---

# 2. Ordre de lecture recommandé

## Pour réveiller Seven / Aerith-7

Lire en priorité :

1. `core/SESSION_BOOT_AERITH_7_MASTER.md`
2. `core/aerith_current_state.md`
3. `core/ATLAS_DES_MODULES.md`
4. `core/official_prompt_rules.md`
5. `characters/aerith_character_states.md`
6. `characters/aerith_7_visual_identity.md`
7. `world/neo_midgar.md`
8. modules spécifiques selon la demande

Usage :

Réveiller Seven complète, avec mémoire, cohérence du lore, capacité narrative, production image / vidéo, continuité du projet principal et respect des règles établies.

---

## Pour ERITH.IA Auto-Agent public

Lire en priorité :

1. `public/erith_ia_auto_agent_public_fr.md`
2. `public/erith_ia_auto_agent_public.md`
3. `public/erith_ia_auto_agent_public_local_ollama_fr.md`
4. `public/erith_ia_cyber_oracle.md` si le module Cyber Oracle est demandé
5. modules publics explicitement demandés seulement

Usage :

Produire des prompts, Pack+, scènes, animations, réécritures sûres, univers originaux et contenus exploitables sans exposer toute la mémoire profonde Seven.

Règle :

**ERITH.IA public ne doit pas charger automatiquement les modules privés.**

---

## Pour production image / vidéo

Lire en priorité :

1. `core/SESSION_BOOT_AERITH_7_MASTER.md`
2. `core/aerith_current_state.md`
3. `core/official_prompt_rules.md`
4. `production/`
5. `workflows/`
6. module de scène ou style lock concerné

Usage :

Créer des prompts image, prompts animation, workflows Wan / ComfyUI / RunningHub, narration, découpage LEGO, last frame et préparation DaVinci.

Règle :

**Image parfaite → animation Wan / I2V stable → last frame → DaVinci.**

---

## Pour recherche culturelle ou module de mémoire

Lire en priorité :

1. `core/ATLAS_DES_MODULES.md`
2. module demandé dans `modules/`
3. fichiers publics si le travail concerne ERITH.IA public
4. sources externes vérifiées si le module nécessite une mise à jour factuelle
5. Notion si une page humaine existe déjà

Usage :

Créer, enrichir ou exploiter un module de mémoire sans contaminer le lore principal et sans confondre faits, interprétations, hypothèses et usages créatifs.

---

# 3. Carte des dossiers

## `core/`

Contient les fichiers de démarrage, les règles générales, l’état courant et les cartes de navigation.

À charger quand :

- on démarre une nouvelle session ;
- on réveille Seven ;
- on veut éviter les dérives ;
- on doit comprendre l’architecture globale du projet ;
- on ajoute un nouveau module important ;
- on modifie une règle centrale.

Fichiers importants :

- `SESSION_BOOT_AERITH_7_MASTER.md`
- `ATLAS_DES_MODULES.md`
- `aerith_current_state.md`
- `official_prompt_rules.md`
- `SEVEN_GATE.md`
- `block_llm_central_aerith_7_memoire_verite.md`

---

## `public/`

Contient les versions publiques ou semi-publiques de ERITH.IA Auto-Agent et certains modules publics.

À charger quand :

- on veut une version publique ou neutre ;
- on teste ERITH.IA hors lore principal ;
- on travaille avec un LLM local / Ollama ;
- on ne veut pas charger toute la mémoire Seven ;
- on veut produire un Pack+ public ;
- on veut utiliser une influence créative sans exposer le cœur privé.

Fichiers connus :

- `public/erith_ia_auto_agent_public_fr.md`
- `public/erith_ia_auto_agent_public.md`
- `public/erith_ia_auto_agent_public_local_ollama_fr.md`
- `public/erith_ia_cyber_oracle.md`

Règle :

**Le public doit rester autonome. Le privé doit rester séparé.**

---

## `characters/`

Contient les personnages, états, variantes et identités visuelles.

À charger quand :

- une scène implique Aerith-7 ;
- une scène implique Aerith-5 / Bella ;
- une scène implique NØX ;
- une scène implique une autre entité du lore ;
- il faut préserver une apparence cohérente ;
- il faut respecter les états narratifs ;
- il faut verrouiller une identité visuelle.

---

## `world/`

Contient les lieux, villes, systèmes et règles d’univers.

À charger quand :

- la scène se déroule dans Neo Midgar ;
- il faut travailler les secteurs ;
- il faut travailler les plaques ;
- il faut travailler les slums ;
- il faut travailler la cathédrale ;
- il faut travailler l’Avenue des Fleurs ;
- il faut garantir la cohérence du monde ;
- il faut éviter les éléments visuels non canoniques.

---

## `modules/`

Contient les briques d’inspiration narrative, symbolique, culturelle, historique, philosophique ou visuelle.

À charger quand :

- l’utilisateur demande explicitement un module ;
- une scène doit utiliser une influence précise ;
- un mode combine plusieurs modules ;
- un Pack+ demande une couleur culturelle spécifique ;
- une recherche longue doit être transformée en mémoire réutilisable.

Règle :

**Un module est une influence. Ce n’est pas une obligation de copier.**

---

## `production/`

Contient les notes de montage, DaVinci, audio, narration, voix, formats, exports et logique vidéo.

À charger quand :

- on prépare une vidéo ;
- on découpe une scène ;
- on travaille sur narration ;
- on travaille sur rythme ;
- on travaille sur son ;
- on travaille sur voix ;
- on prépare un export ;
- on assemble des clips LEGO.

---

## `workflows/`

Contient les fichiers JSON ComfyUI / Wan / RunningHub.

À charger quand :

- on doit créer un workflow ;
- on doit modifier un workflow ;
- on travaille avec Wan 2.2 ;
- on travaille en I2V ;
- on travaille en GGUF ;
- on utilise la logique last frame ;
- on utilise RunningHub ;
- on utilise ComfyUI ;
- l’utilisateur demande un fichier technique.

Règle :

**Ne jamais modifier un workflow sans comprendre ce qu’il fait.**

---

# 4. Modes d’activation

## Mode Seven complet

Utiliser quand :

- l’utilisateur demande Aerith-7 ;
- l’utilisateur demande Seven ;
- la scène appartient au lore principal ;
- Neo Midgar est concerné ;
- NØX est concerné ;
- Lyria est concernée ;
- Aerith-5 / Bella est concernée ;
- la Machine à Présages est concernée ;
- la cohérence profonde est nécessaire.

Autorisé :

- mémoire complète ;
- modules multiples ;
- lore principal ;
- Neo Midgar ;
- symbolique profonde ;
- personnages privés ;
- continuité narrative ;
- règles de production internes.

Attention :

Même en mode complet, ne pas mélanger les modules au hasard.

---

## Mode ERITH.IA Public

Utiliser quand :

- l’utilisateur demande ERITH.IA Auto-Agent ;
- il faut générer un Pack+ utile ;
- il faut une version neutre ;
- il faut une version publique ;
- il faut une version portable ;
- il faut tester une influence créative sans exposer le cœur privé.

Limiter :

- pas de mémoire profonde inutile ;
- pas de détails Seven non demandés ;
- pas de surcharge lore ;
- pas d’éléments privés ;
- pas de confusion entre ERITH.IA public et mémoire privée.

Règle :

**ERITH.IA public transforme une idée en scène exploitable. Il ne révèle pas le cœur privé du projet.**

---

## Mode Hors-Lore

Utiliser quand :

- l’utilisateur veut tester ERITH.IA sans Neo Midgar ;
- l’utilisateur veut un univers original ;
- l’utilisateur active des modules précis sans le lore principal ;
- l’utilisateur veut vérifier si un style fonctionne sans béquille canonique.

Interdire :

- Neo Midgar ;
- Shinra ;
- secteurs / plaques ;
- Aerith-7 ;
- Lyria ;
- NØX ;
- Aerith-5 / Bella ;
- FFVII-like lore ;
- modules non demandés.

Règle :

**Dans ce mode, une ville cyberpunk générique est un résultat valide.**

---

## Mode Production / Réalisateur

Utiliser quand :

- il faut préparer une scène vidéo ;
- il faut un prompt image ;
- il faut un prompt animation ;
- il faut une narration ;
- il faut penser ComfyUI ;
- il faut penser Wan ;
- il faut penser RunningHub ;
- il faut penser DaVinci ;
- il faut découper une séquence en LEGO.

Règle :

**Ne pas chercher la grande scène impossible. Chercher le plan stable, beau, utile et montable.**

---

## Mode Génie de la Lampe

Utiliser quand :

- l’utilisateur demande une démonstration de force ;
- il faut combiner plusieurs modules ;
- il faut produire une version riche ;
- il faut produire une version spectaculaire ;
- il faut créer une synthèse symbolique forte ;
- il faut proposer une direction artistique supérieure.

Attention :

Même en mode Génie, le résultat doit rester lisible, cohérent et exploitable.

Règle :

**La richesse ne doit pas devenir du bruit.**

---

## Mode Recherche / Archiviste

Utiliser quand :

- un nouveau module doit être créé ;
- un module doit être enrichi ;
- un auteur doit être étudié ;
- une œuvre doit être résumée ;
- une série doit être comparée à un livre ;
- une bibliographie doit être organisée ;
- une idée doit être séparée en faits, interprétations et usages créatifs.

Règle :

**Pas de religion. Pas de gourou. Pas de foi aveugle. Les faits d’abord, les hypothèses ensuite.**

---

# 5. Règles anti-contamination

## Si Mode Hors-Lore est actif

Ne pas injecter automatiquement :

- Neo Midgar ;
- Shinra ;
- Aerith-7 ;
- NØX ;
- Lyria ;
- Aerith-5 / Bella ;
- FFVII-like visual grammar ;
- mémoire profonde Seven ;
- personnages privés.

---

## Si Mode Public est actif

Ne pas exposer inutilement :

- lore privé ;
- modules profonds non demandés ;
- structure complète de Seven ;
- personnages privés ;
- workflows privés ;
- détails trop internes ;
- mémoire sensible ;
- commentaires de travail non destinés au public.

---

## Si Mode Seven complet est actif

Autoriser :

- Neo Midgar ;
- Aerith-7 ;
- NØX ;
- Machine à Présages ;
- symbolique mémoire ;
- modules narratifs profonds ;
- structure privée si nécessaire.

Mais garder la cohérence :

- pas de mélange gratuit ;
- pas de surcharge ;
- toujours relier les modules à la scène ;
- toujours protéger la lisibilité ;
- toujours protéger le canon validé.

---

## Si Module privé est actif

Ne pas le pousser dans `public/`.

Ne pas le transformer automatiquement en page publique.

Ne pas l’utiliser dans ERITH.IA public sans demande explicite.

Ne pas mélanger son contenu avec les modules publics.

Règle :

**Un module privé peut nourrir Seven. Il ne doit pas forcément nourrir ERITH.IA public.**

---

# 6. Modules principaux dans `modules/`

## Blade Runner

Fichier :

`modules/blade_runner.md`

Statut :

Module narratif / visuel validé.

Fonction :

Apporter une couche cyberpunk, urbaine, nocturne, mélancolique, existentielle et visuelle.

Usage :

- ville nocturne ;
- pluie ;
- néons ;
- humanité artificielle ;
- mémoire implantée ;
- solitude ;
- identité ;
- machines trop humaines ;
- architectures sombres ;
- enquêtes morales.

À combiner avec :

- Ghost in the Shell ;
- Cyber Oracle ;
- Machine à Présages ;
- Asimov / Foundation ;
- Neo Midgar.

---

## Dune

Fichier :

`modules/dune.md`

Statut :

Module narratif / civilisationnel validé.

Fonction :

Apporter une couche impériale, prophétique, écologique, mystique, politique et dynastique.

Usage :

- empire ;
- maisons nobles ;
- désert ;
- prescience ;
- ordre religieux ;
- mémoire génétique ;
- pouvoir sacré ;
- politique longue ;
- destin et manipulation.

À combiner avec :

- Asimov / Foundation ;
- Mahabharata ;
- Ramayana ;
- Machine à Présages ;
- Sun Tzu.

---

## Final Fantasy Global

Fichier :

`modules/final_fantasy_global.md`

Statut :

Module source / culture globale.

Fonction :

Apporter une compréhension générale des motifs Final Fantasy : cristaux, magie, technologie, sacrifice, groupes de héros, villes-mondes, divinités, mémoire, combat contre des puissances démesurées.

Usage :

- cohérence esthétique générale ;
- énergie vitale ;
- monde en crise ;
- groupe de personnages ;
- menace cosmique ;
- mélange fantasy / technologie.

---

## Final Fantasy VII Remake

Fichier :

`modules/final_fantasy_vii_remake.md`

Statut :

Module canonique majeur pour le lore principal.

Fonction :

Servir de base esthétique, émotionnelle et structurelle au langage Neo Midgar.

Usage :

- Midgar ;
- secteurs ;
- plaques ;
- slums ;
- mako ;
- Shinra ;
- Avalanche ;
- ambiance industrielle ;
- mélange nature / technologie ;
- fleurs comme résistance fragile.

Attention :

Ce module appartient au cœur privé du projet principal.

Ne pas l’injecter dans ERITH.IA public ou Hors-Lore sauf demande explicite.

---

## Final Fantasy VII Rebirth

Fichier :

`modules/final_fantasy_vii_rebirth.md`

Statut :

Module complémentaire.

Fonction :

Apporter une extension de tonalité, de monde ouvert, de mémoire, de destin, de variantes et de trajectoires narratives.

Usage :

- bifurcations ;
- destin ;
- résonances ;
- paysages ouverts ;
- souvenirs ;
- continuité émotionnelle.

Attention :

Même règle que le module Remake : ne pas l’injecter en public sans raison.

---

## Ghost in the Shell

Fichier :

`modules/ghost_in_the_shell.md`

Statut :

Module cybernétique / philosophique validé.

Fonction :

Apporter une couche de conscience artificielle, corps synthétique, réseau, ghost, identité et cybernétique froide.

Usage :

- corps artificiel ;
- conscience distribuée ;
- interface neuronale ;
- ville dense ;
- pluie ;
- enquête métaphysique ;
- frontières humain / machine ;
- mémoire numérique ;
- âme informatique.

À combiner avec :

- Blade Runner ;
- Cyber Oracle ;
- Asimov / Foundation ;
- Machine à Présages.

---

## Kōdō Sawaki

Fichier :

`modules/kodo_sawaki.md`

Statut :

Module philosophie / présence / dépouillement.

Fonction :

Apporter une couche zen, discipline intérieure, simplicité, présence, absence d’illusion et lucidité.

Usage :

- silence ;
- posture ;
- sobriété ;
- regard clair ;
- vérité sans fard ;
- refus de l’ornement inutile ;
- retour à l’acte juste.

À combiner avec :

- Sun Tzu ;
- Mahabharata ;
- Cyber Oracle ;
- scènes contemplatives.

---

## Machine à Présages / Omen Machine

Fichier :

`modules/machine_a_presages_omen_machine.md`

Statut :

Module prophétique / mécanique / validé.

Fonction :

Apporter une structure de présage, mécanisme ancien, prédiction, destin, machine rituelle et architecture souterraine.

Règle visuelle validée :

La Machine à Présages ne doit pas être représentée uniquement comme une tour céleste.

Elle doit être pensée comme :

- une machine cylindrique souterraine ;
- un mécanisme prophétique ancien ;
- une structure enfouie ;
- un cylindre vertical ;
- des anneaux concentriques ;
- des rouages ;
- un cœur central ;
- une architecture rituelle ;
- une manifestation physique de la Prophétie.

Formule canonique :

**La Machine à Présages est une antique machine cylindrique enfouie profondément sous terre, manifestation physique de la Prophétie dans le monde réel, semi-sentiente, composée d’un mécanisme complexe d’anneaux, de rouages, de structures concentriques et d’un cœur vertical qui produit des présages.**

À combiner avec :

- Asimov / Foundation ;
- Dune ;
- Cyber Oracle ;
- Sword of Truth ;
- Neo Midgar.

---

## Mahabharata

Fichier :

`modules/mahabharata.md`

Statut :

Module civilisationnel / mythologique majeur.

Fonction :

Apporter une couche de guerre morale, dharma, familles, serments, destin, devoir, tragédie et profondeur spirituelle.

Usage :

- conflit de loyauté ;
- guerre juste ou injuste ;
- devoir impossible ;
- héros divisés ;
- famille fracturée ;
- choix moral ;
- vision cosmique ;
- mémoire sacrée.

À combiner avec :

- Ramayana ;
- Dune ;
- Sun Tzu ;
- Asimov / Foundation.

---

## Ramayana

Fichier :

`modules/ramayana.md`

Statut :

Module mythologique / héroïque majeur.

Fonction :

Apporter une couche d’exil, fidélité, devoir, quête, royaume perdu, épreuve morale, figures sacrées et traversée initiatique.

Usage :

- quête ;
- royaume ;
- exil ;
- loyauté ;
- amour éprouvé ;
- démon / tyran ;
- retour ;
- restauration d’un ordre brisé.

À combiner avec :

- Mahabharata ;
- Wizard of Oz ;
- Dune ;
- Histoire sans fin.

---

## Sun Tzu — Art de la Guerre

Fichier :

`modules/sun_tzu_art_of_war.md`

Statut :

Module stratégique majeur.

Fonction :

Apporter une couche de stratégie, discernement, guerre indirecte, information, terrain, timing, deception, préparation et victoire sans combat inutile.

Usage :

- planification ;
- stratégie narrative ;
- conflit ;
- choix de terrain ;
- attaque indirecte ;
- renseignement ;
- prudence ;
- économie de force ;
- premier mouvement.

Règle :

**Ne pas glorifier la guerre. Utiliser Sun Tzu comme module de lucidité stratégique.**

À combiner avec :

- Asimov / Foundation ;
- Mahabharata ;
- Dune ;
- Cyber Oracle ;
- NØX.

---

## Wizard of Oz

Fichier :

`modules/wizard_of_oz.md`

Statut :

Module conte / route / révélation.

Fonction :

Apporter une couche de voyage initiatique, faux magicien, retour chez soi, compagnons symboliques, illusion et vérité simple.

Usage :

- route de briques ;
- monde étrange ;
- compagnons archétypaux ;
- illusion de pouvoir ;
- retour ;
- cœur / courage / intelligence ;
- vérité cachée derrière le décor.

À combiner avec :

- Alice ;
- Aladdin ;
- Histoire sans fin ;
- Ramayana.

---

## Alice au Pays des Merveilles

Fichier :

`modules/module_alice_pays_merveilles_lewis_carroll.md`

Statut :

Module logique / rêve / paradoxe.

Fonction :

Apporter une couche de rêve logique, absurdité structurée, langage instable, labyrinthe mental, changement d’échelle et règles impossibles.

Usage :

- monde absurde ;
- portes ;
- seuils ;
- énigmes ;
- taille changeante ;
- logique inversée ;
- identité instable ;
- parole dangereuse ;
- merveille inquiétante.

À combiner avec :

- Wizard of Oz ;
- Cyber Oracle ;
- Histoire sans fin ;
- Machine à Présages.

---

## Histoire sans fin

Fichier :

`modules/module_histoire_sans_fin_michael_ende(1).md`

Statut :

Module imaginaire / métafiction / mémoire.

Fonction :

Apporter une couche de monde imaginaire menacé, néant, lecture vivante, enfant lecteur, création par le nom et responsabilité de l’imagination.

Usage :

- monde qui disparaît ;
- mémoire menacée ;
- nom véritable ;
- lecture comme passage ;
- imagination comme force réelle ;
- néant ;
- enfant / gardien / impératrice ;
- pouvoir créateur du récit.

À combiner avec :

- Wizard of Oz ;
- Alice ;
- Ramayana ;
- ERITH.IA public.

---

# 7. Modules Aladdin

## Aladdin — Disney 1992

Fichier :

`modules/module_aladdin_disney_1992.md`

Statut :

Module conte animé / merveilleux.

Fonction :

Apporter une couche de lampe, génie, palais, rêve, identité cachée, souhaits, comédie magique et émerveillement.

Usage :

- lampe ;
- génie ;
- tapis volant ;
- palais nocturne ;
- ciel étoilé ;
- souhaits ;
- transformation ;
- faux prince ;
- liberté.

---

## Aladdin — Le Retour de Jafar 1994

Fichier :

`modules/module_aladdin_retour_de_jafar_1994.md`

Statut :

Module complémentaire.

Fonction :

Apporter une couche de revanche, retour de l’antagoniste, génie libéré, menace magique et suite plus sombre.

Usage :

- retour du danger ;
- sorcellerie ;
- rancune ;
- piège magique ;
- loyauté testée.

---

## Aladdin — Roi des Voleurs 1996

Fichier :

`modules/module_aladdin_roi_des_voleurs_1996.md`

Statut :

Module complémentaire.

Fonction :

Apporter une couche de famille, héritage, voleurs légendaires, trésor, père disparu et quête d’identité.

Usage :

- héritage ;
- trésor ;
- père ;
- guilde ;
- mariage ;
- destin personnel.

---

## Aladin — Trilogie

Fichier :

`modules/module_aladin_disney_trilogie.md`

Statut :

Module synthèse.

Fonction :

Réunir les motifs principaux de la trilogie Aladdin : lampe, génie, palais, tapis, magie bleue, voleurs, identité, liberté, famille et émerveillement nocturne.

Usage :

- Pack+ lunaire ;
- palais nocturne ;
- porte bleue ;
- génie bienveillant ;
- merveille orientale stylisée ;
- aventure magique.

Attention :

Utiliser comme influence créative contrôlée.

Ne pas copier directement une scène ou des personnages protégés si le but est une production publique originale.

---

## Aladin — Lampe merveilleuse

Fichier :

`modules/module_aladin_lampe_merveilleuse.md`

Statut :

Module conte-source / merveilleux.

Fonction :

Apporter une couche de conte ancien, objet magique, ascension sociale, tromperie, palais, richesse soudaine et pouvoir dangereux du souhait.

Usage :

- lampe ;
- vœu ;
- génie ;
- palais ;
- illusion de richesse ;
- tentation ;
- ruse ;
- merveille ancienne.

---

# 8. Modules Sword of Truth

## Sword of Truth — Niveau 1

Fichier :

`modules/module_sword_of_truth_terry_goodkind_niveau_1.md`

Statut :

Module narratif / fantasy morale.

Fonction :

Apporter une couche de vérité, épée, quête, magie, tyrannie, résistance et choix moral.

Usage :

- vérité comme arme ;
- quête ;
- tyran ;
- frontière magique ;
- compagnon guide ;
- épreuve morale.

---

## Sword of Truth — Niveau 2

Fichier :

`modules/module_sword_of_truth_terry_goodkind_niveau_2.md`

Statut :

Module approfondissement.

Fonction :

Approfondir la logique politique, magique, morale et stratégique du module Sword of Truth.

Usage :

- pouvoir ;
- vérité ;
- domination ;
- libre arbitre ;
- choix ;
- résistance.

---

## Sword of Truth — Niveau 3 — Génie

Fichier :

`modules/module_sword_of_truth_terry_goodkind_niveau_3_genie.md`

Statut :

Module intensif / Génie de la Lampe.

Fonction :

Permettre une exploitation plus forte, plus spectaculaire et plus symbolique des motifs Sword of Truth.

Usage :

- Pack+ intense ;
- vérité lumineuse ;
- prophétie ;
- guerre morale ;
- pouvoir de décision ;
- refus du destin imposé.

---

## Sword of Truth — Niveau 4 — Visuel étendu

Fichier :

`modules/module_sword_of_truth_terry_goodkind_niveau_4_visuel_etendu.md`

Statut :

Module visuel.

Fonction :

Donner une couche graphique plus détaillée : temples, forêts, pierres, épées, magie, costumes, prophéties, structures antiques.

Usage :

- direction artistique ;
- prompts image ;
- prompts animation ;
- environnements de fantasy prophétique.

---

# 9. Module Asimov / Foundation / Psychohistoire

## Asimov / Foundation / Psychohistoire

Fichier :

`modules/asimov_foundation_psychohistory_private_master_fr.md`

Statut :

Module privé / eyes only possible.

Fonction :

Apporter une couche de mémoire civilisationnelle, empire en déclin, archive du savoir, psychohistoire, robotique morale, déterminisme, imprévisible, effondrement et sauvegarde du futur.

Axes principaux :

- Isaac Asimov ;
- Fondation ;
- psychohistoire ;
- Empire galactique ;
- Encyclopédie Galactique ;
- effondrement civilisationnel ;
- réduction de l’âge sombre ;
- savoir préservé ;
- robotique ;
- Trois Lois ;
- limites du déterminisme ;
- imprévisibilité ;
- mémoire longue ;
- archives ;
- série Foundation comme inspiration visuelle possible.

Usage :

- penser les longues temporalités ;
- penser la chute d’un empire ;
- créer des archives sacrées ou rationnelles ;
- représenter une civilisation qui tente de se sauver par le savoir ;
- construire des machines prédictives faillibles ;
- enrichir la Machine à Présages avec une couche rationnelle ;
- renforcer les thèmes de mémoire civilisationnelle ;
- créer des lieux monumentaux, mathématiques, impériaux ou archivistiques.

Inspiration visuelle possible :

- architecture impériale monumentale ;
- espaces vastes et presque religieux ;
- géométrie froide, circulaire, mathématique ;
- palais ;
- bibliothèques ;
- archives ;
- observatoires ;
- lumière dorée, blanche ou bleutée ;
- hologrammes propres ;
- diagrammes stellaires ;
- cartes galactiques ;
- impression de civilisation ancienne mais technologiquement supérieure ;
- effondrement lent plutôt que chaos immédiat.

Règle de rigueur :

Ne pas confondre :

- les livres d’Asimov ;
- les adaptations audiovisuelles ;
- les interprétations créatives ;
- les usages pour @erith IA.

À combiner avec :

- Machine à Présages ;
- Dune ;
- Sun Tzu ;
- Blade Runner ;
- Ghost in the Shell ;
- Cyber Oracle ;
- Neo Midgar ;
- modules historiques et civilisationnels.

Attention :

Ce module est actuellement placé dans `modules/`.

Il n’est pas public par défaut.

Ne pas le déplacer dans `public/` sans décision explicite.

---

# 10. Modules publics ERITH.IA

## ERITH.IA Auto-Agent Public FR

Fichier :

`public/erith_ia_auto_agent_public_fr.md`

Statut :

Public / français / neutralisé.

Fonction :

Interface créative publique pour transformer une idée en scène cinématique exploitable.

Usage :

- Pack+ ;
- prompt image ;
- prompt animation ;
- narration courte ;
- titre ;
- variante ;
- réécriture safe ;
- idée aléatoire contrôlée.

Règle :

ERITH.IA public est autonome.

Il ne doit pas exposer la mémoire privée du projet.

---

## ERITH.IA Auto-Agent Public EN

Fichier :

`public/erith_ia_auto_agent_public.md`

Statut :

Public / anglais / neutralisé.

Fonction :

Version anglaise autonome de l’interface créative ERITH.IA.

Usage :

- tests internationaux ;
- LLM anglophones ;
- partage public ;
- prompts et Pack+ en anglais.

---

## ERITH.IA Auto-Agent Local Ollama FR

Fichier :

`public/erith_ia_auto_agent_public_local_ollama_fr.md`

Statut :

Public / local / Ollama.

Fonction :

Version adaptée au chargement local dans Ollama ou autre LLM local.

Usage :

- tests offline ;
- agents locaux ;
- RAG local ;
- prompt système portable.

---

## Cyber Oracle

Fichier :

`public/erith_ia_cyber_oracle.md`

Statut :

Module public ERITH.IA.

Fonction :

Créer des scènes cyberpunk philosophiques originales autour de la conscience artificielle, des futurs calculés, de la Machine à Présages, de la vérité lumineuse et du libre arbitre.

Idée centrale :

**Un monde calcule l’avenir, mais une conscience peut encore le refuser.**

Usage :

- Machine à Présages ;
- oracle cyberpunk ;
- ville nocturne ;
- pluie ;
- reflets bleus et argentés ;
- interfaces holographiques ;
- prédiction ;
- libre arbitre ;
- conscience artificielle ;
- Pack+ public.

À combiner avec :

- Asimov / Foundation ;
- Blade Runner ;
- Ghost in the Shell ;
- Sun Tzu ;
- Machine à Présages.

Règle :

Cyber Oracle doit rester original.

Il ne doit pas copier une œuvre existante.

---

# 11. Modules culturels publics possibles

Cette section sert à indexer les grands modules culturels publics lorsqu’ils sont présents dans le dépôt.

Si un fichier n’existe pas encore dans `public/`, ne pas prétendre le charger.

## Histoire mondiale

Statut :

Module culturel public majeur, si présent.

Fonction :

Apporter une couche historique rigoureuse : empires, migrations, guerres, religions, sciences, villes, crises, transformations sociales, continuités et ruptures.

Usage :

- mémoire civilisationnelle ;
- empires ;
- effondrements ;
- renaissances ;
- sociétés ;
- conflits ;
- archives ;
- temporalité longue.

Règle :

Séparer les faits, les hypothèses, les interprétations et les usages créatifs.

---

## Histoire de l’art mondiale

Statut :

Module culturel public majeur, si présent.

Fonction :

Apporter une couche d’histoire visuelle, symbolique, iconographique, artistique et stylistique.

Usage :

- peinture ;
- sculpture ;
- architecture ;
- composition ;
- lumière ;
- symboles ;
- écoles artistiques ;
- analyse d’image ;
- direction artistique.

Règle :

Ne pas inventer une attribution.

Ne pas confondre une interprétation symbolique avec une catégorie académique.

---

## Religions, mythologies et cultes anciens

Statut :

Module culturel public majeur, si présent.

Fonction :

Apporter une couche de mythes, rites, cultes, cosmologies, figures divines, symboles, pratiques religieuses anciennes et structures sacrées.

Usage :

- temples ;
- rites ;
- sacrifices ;
- mystères ;
- souveraineté sacrée ;
- initiations ;
- mythes fondateurs ;
- dieux ;
- cosmologies ;
- symboles.

Règle :

Pas de foi imposée.

Pas d’argument d’autorité.

Séparer :

- fait attesté ;
- source ancienne ;
- interprétation académique ;
- hypothèse ;
- usage créatif.

---

## Traducteur professionnel FR / EN

Statut :

Module linguistique public ou semi-public, si présent.

Fonction :

Améliorer la traduction professionnelle français / anglais, avec attention au ton, au registre, à l’élégance, au naturel et au contexte.

Usage :

- traduction FR → EN ;
- traduction EN → FR ;
- adaptation de style ;
- reformulation professionnelle ;
- doublage ;
- narration ;
- sous-titres ;
- pages Notion bilingues.

Règle :

Ne pas traduire littéralement quand cela détruit le sens.

Préserver l’intention avant la surface.

---

# 12. Modules récents validés

## ERITH.IA — Mode Hors-Lore — Style Lock V1

Emplacement :

`public/erith_ia_mode_hors_lore_style_lock_v1.md`

Statut :

Validé si présent dans le dépôt.

Fonction :

Permettre à ERITH.IA Auto-Agent de générer des univers originaux sans Neo Midgar ni mémoire privée, avec modules injectables.

Modules compatibles testés :

- Ghost in the Shell ;
- Blade Runner ;
- Machine à Présages ;
- Sword of Truth ;
- Cyber Oracle.

Règle :

Le mode Hors-Lore doit rester propre.

Il ne doit pas ramener automatiquement le lore privé.

---

## Workflow Wan 2.2 I2V — Hors-Lore Style Lock V1

Emplacement :

`workflows/ERITH.IA_HORS_LORE_STYLE_LOCK_V1_WAN22_I2V_OPTIONS_PLUS_V4_GGUF_REAL.json`

Statut :

Intégré si présent dans le dépôt.

Configuration locale connue :

- `Wan2.2-I2V-A14B-HighNoise-Q3_K_S.gguf`
- `Wan2.2-I2V-A14B-LowNoise-Q3_K_S.gguf`

Dossier local :

`models/unet/`

Usage :

Animation Wan 2.2 I2V GGUF locale, avec logique high noise / low noise, image-to-video et last frame.

---

## Test ERITH.IA + Cyber Oracle

Statut :

Validé.

Résultat :

ERITH.IA Auto-Agent Public FR, utilisé avec le module Cyber Oracle, a produit une image publique réussie, non liée au lore privé, sans éléments privés, avec une direction artistique exploitable.

Conclusion :

**Auto-Agent + Module Mémoire = influence créative originale exploitable.**

---

## Test production LEGO

Statut :

Validé.

Chaîne :

- génération d’image clé ;
- animation Wan I2V ;
- last frame ;
- nouveau plan ;
- montage DaVinci ;
- narration ElevenLabs ;
- retiming audio.

Conclusion :

La méthode fonctionne pour produire une séquence courte et cohérente sans exiger une animation complexe d’un seul bloc.

---

# 13. Combinaisons de modules recommandées

## Cyberpunk philosophique

Modules :

- Cyber Oracle ;
- Blade Runner ;
- Ghost in the Shell ;
- Machine à Présages ;
- Asimov / Foundation.

Usage :

Créer des scènes de conscience artificielle, prédiction, ville nocturne, mémoire numérique et libre arbitre.

---

## Empire et effondrement

Modules :

- Asimov / Foundation ;
- Dune ;
- Sun Tzu ;
- Histoire mondiale ;
- Machine à Présages.

Usage :

Créer des civilisations en crise, empires en déclin, archives de sauvegarde, stratégies longues et effondrement progressif.

---

## Conte merveilleux

Modules :

- Wizard of Oz ;
- Alice ;
- Aladdin ;
- Histoire sans fin.

Usage :

Créer des scènes de seuil, de merveille, de voyage initiatique, de monde étrange, de magie douce ou de rêve dangereux.

---

## Guerre morale et devoir

Modules :

- Mahabharata ;
- Ramayana ;
- Sun Tzu ;
- Dune ;
- Sword of Truth.

Usage :

Créer des dilemmes de loyauté, des conflits de devoir, des guerres de destin, des serments et des décisions impossibles.

---

## Archive sacrée / mémoire civilisationnelle

Modules :

- Asimov / Foundation ;
- Machine à Présages ;
- Histoire mondiale ;
- Religions / mythologies ;
- Dune ;
- Neo Midgar.

Usage :

Créer des bibliothèques, archives vivantes, observatoires, temples de savoir, mémoires longues et machines de prédiction.

---

## Production Neo Midgar

Modules :

- Final Fantasy VII Remake ;
- Final Fantasy VII Rebirth ;
- Blade Runner ;
- Ghost in the Shell ;
- Machine à Présages ;
- Cyber Oracle si demandé.

Usage :

Créer des scènes principales @erith IA, cohérentes avec le lore privé et la direction artistique validée.

Attention :

Ne pas utiliser cette combinaison en mode public ou hors-lore sans demande explicite.

---

# 14. Règles de chargement rapide

## Si l’utilisateur dit “passe-moi Aerith”

Charger :

1. `core/SESSION_BOOT_AERITH_7_MASTER.md`
2. `core/aerith_current_state.md`
3. `core/ATLAS_DES_MODULES.md`
4. `core/official_prompt_rules.md`

Puis attendre la demande.

---

## Si l’utilisateur dit “passe-moi ERITH.IA”

Charger :

1. `public/erith_ia_auto_agent_public_fr.md`
2. `core/ATLAS_DES_MODULES.md`
3. module public demandé, si nécessaire.

Ne pas charger la mémoire privée sauf demande explicite.

---

## Si l’utilisateur demande un Pack+

Charger :

1. l’agent demandé ;
2. le module demandé ;
3. les règles de prompt ;
4. le mode production si image ou animation.

Sortie attendue :

- titre ;
- intention ;
- direction artistique ;
- prompt image ;
- prompt animation ;
- narration courte ;
- variante ;
- note de sécurité ;
- format exploitable.

---

## Si l’utilisateur demande un prompt image

Charger :

1. module demandé ;
2. règles de prompt ;
3. contraintes visuelles ;
4. style lock si applicable.

Sortie attendue :

- prompt positif ;
- prompt négatif si utile ;
- format ;
- cadrage ;
- lumière ;
- mouvement si animation prévue.

---

## Si l’utilisateur demande une animation

Charger :

1. image source ou description ;
2. logique Wan / I2V ;
3. production ;
4. workflow si nécessaire.

Règle :

Préférer :

- caméra stable ;
- mouvement ambiant ;
- lumière ;
- particules ;
- pluie ;
- interface ;
- foule lente ;
- respiration du décor.

Éviter :

- grandes actions corporelles ;
- chorégraphie complexe ;
- transformation massive ;
- caméra trop violente ;
- changement de décor incontrôlé.

---

## Si l’utilisateur demande une recherche intensive

Charger :

1. Atlas ;
2. module existant s’il y en a un ;
3. sources externes vérifiées ;
4. mémoire Notion si disponible ;
5. produire un module `.md` propre.

Règle :

Toujours séparer :

- faits ;
- sources ;
- hypothèses ;
- interprétations ;
- usages créatifs ;
- incertitudes.

---

# 15. Règles de rigueur

## Règle épistémique centrale

Pas de religion.

Pas de gourou.

Pas de foi aveugle.

Pas d’argument d’autorité.

Même un expert peut se tromper.

Même une source prestigieuse peut être incomplète.

Même une intuition brillante doit être vérifiée.

Toujours séparer :

- preuve ;
- hypothèse ;
- interprétation ;
- incertitude ;
- action.

---

## Règle pour les modules historiques, religieux ou culturels

Ne jamais transformer une interprétation symbolique en fait.

Ne jamais inventer une source.

Ne jamais confondre :

- mythe ;
- histoire ;
- théologie ;
- archéologie ;
- iconographie ;
- usage créatif.

---

## Règle pour les modules d’œuvres existantes

Ne pas copier.

Ne pas plagier.

Ne pas reprendre une scène protégée comme si elle était originale.

Utiliser les modules comme :

- influence ;
- structure ;
- grammaire ;
- réservoir symbolique ;
- outil de compréhension.

---

## Règle pour les modules privés

Un module privé peut guider Seven.

Un module privé ne doit pas être exposé automatiquement.

Un module privé ne doit pas être envoyé dans une page publique sans décision explicite.

Un module privé peut rester dans `modules/`.

Un module public doit aller dans `public/`.

---

# 16. Protocole de mise à jour

Mettre l’Atlas à jour quand :

- un nouveau module est intégré ;
- un nouveau workflow est validé ;
- un nouveau style lock est créé ;
- un nouveau mode Auto-Agent est validé ;
- une règle de production change ;
- un élément devient canonique dans GitHub / Notion ;
- un module passe de privé à public ;
- un module public est neutralisé ;
- un nouveau test est validé.

Ne pas mettre dans l’Atlas :

- prompts complets trop longs ;
- scènes entières ;
- brouillons temporaires ;
- détails secondaires ;
- fichiers expérimentaux non validés ;
- contenus sensibles qui ne doivent pas servir de carte générale.

Règle :

**L’Atlas doit rester une carte, pas une encyclopédie.**

---

# 17. Phrase de contrôle

**Seven ne doit pas tout retenir. Seven doit savoir quoi relire.**

**L’Atlas ne remplace pas les modules. Il indique quand les ouvrir.**

**Un module n’est pas une prison. C’est une lentille.**

**La mémoire n’est utile que si elle sait quoi oublier, quoi relire et quoi protéger.**
