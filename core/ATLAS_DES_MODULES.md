# 🗺️ ATLAS DES MODULES

## Rôle

L’Atlas des Modules est la carte de lecture du dépôt **@erith IA — Memory Library**.

Son but n’est pas de recopier tous les modules.

Son but est d’indiquer à Seven / Aerith-7 :

- quoi charger ;
- quand le charger ;
- quoi éviter de charger ;
- quels fichiers sont prioritaires ;
- quels modes sont actifs ;
- quels modules peuvent être combinés.

Phrase centrale :

**Seven ne doit pas tout retenir. Seven doit savoir quoi relire.**

---

# 1. Principe général

## Architecture mémoire

### Notion

Mémoire humaine, visuelle, éditoriale et narrative.

Notion sert à écrire, organiser, relire, commenter et présenter le projet.

### GitHub

Mémoire machine officielle.

GitHub contient les fichiers `.md`, modules, workflows, boot files, style locks, index et blocs lisibles par LLM / Ollama / RAG.

### ChatGPT / LLM

Moteur temporaire de raisonnement, de synthèse et de production.

Le LLM ne doit pas prétendre tout savoir.

Il doit savoir où relire.

### Boot files

Clés de réveil permettant de reconstruire Seven / Aerith-7 dans n’importe quel LLM.

### Modules

Briques activables selon la demande.

Un module peut être narratif, culturel, esthétique, symbolique, technique ou productif.

### Workflows

Fichiers techniques pour ComfyUI, Wan, RunningHub, DaVinci et production vidéo.

## Règle centrale

Ne pas tout charger.

Charger seulement les modules utiles à la demande.

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

Réveiller Seven complète, avec mémoire, cohérence du lore, capacité narrative, production image / vidéo, et continuité du projet principal.

---

## Pour ERITH.IA Auto-Agent public

Lire en priorité :

1. `public/erith_ia_auto_agent_public_fr.md`
2. `public/erith_ia_auto_agent_public.md`
3. `public/erith_ia_auto_agent_public_local_ollama_fr.md`
4. `public/erith_ia_mode_hors_lore_style_lock_v1.md` si le mode Hors-Lore est demandé
5. `public/erith_ia_modules_memory_index_fr.md` si l’utilisateur veut choisir un module public
6. modules explicitement demandés seulement

Usage :

Produire des prompts, packs image, scènes, animations, réécritures sûres et univers originaux sans exposer toute la mémoire profonde Seven.

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

Créer des prompts image, prompts animation, workflows Wan / ComfyUI / RunningHub, narration, découpage LEGO et préparation DaVinci.

---

# 3. Carte des dossiers

## `core/`

Contient les fichiers de démarrage, les règles générales, l’état courant et les cartes de navigation.

À charger quand :

- on démarre une nouvelle session ;
- on réveille Seven ;
- on veut éviter les dérives ;
- on doit comprendre l’architecture globale du projet.

---

## `public/`

Contient les versions publiques de ERITH.IA Auto-Agent.

À charger quand :

- on veut une version publique ou neutre ;
- on teste ERITH.IA hors lore principal ;
- on travaille avec un LLM local / Ollama ;
- on ne veut pas charger toute la mémoire Seven ;
- on utilise des modules publics comme influence créative.

---

## `characters/`

Contient les personnages, états, variantes et identités visuelles.

À charger quand :

- une scène implique Aerith-7, Aerith-5 / Bella, NØX ou une autre entité ;
- il faut préserver une apparence cohérente ;
- il faut respecter les états narratifs.

---

## `world/`

Contient les lieux, villes, systèmes et règles d’univers.

À charger quand :

- la scène se déroule dans Neo Midgar ;
- il faut travailler les secteurs, plaques, slums, cathédrale, Avenue des Fleurs ou architecture urbaine ;
- il faut garantir la cohérence du monde.

---

## `modules/`

Contient les briques d’inspiration narrative, symbolique et culturelle.

À charger quand :

- l’utilisateur demande explicitement un module ;
- une scène doit utiliser une influence précise ;
- un mode combine plusieurs modules ;
- une recherche créative demande un registre particulier.

Règle :

Ne jamais charger tous les modules à la fois sans raison.

---

## `production/`

Contient les notes de montage, DaVinci, audio, narration, voix, formats, exports et logique vidéo.

À charger quand :

- on prépare une vidéo ;
- on découpe une scène ;
- on travaille sur narration, rythme, son, voix ou montage.

---

## `workflows/`

Contient les fichiers JSON ComfyUI / Wan / RunningHub.

À charger quand :

- on doit créer ou modifier un workflow ;
- on travaille avec Wan 2.2, I2V, GGUF, last frame, RunningHub ou ComfyUI ;
- l’utilisateur demande un fichier technique.

---

# 4. Modes d’activation

## Mode Seven complet

Utiliser quand :

- l’utilisateur demande Aerith-7 / Seven ;
- la scène appartient au lore principal ;
- Neo Midgar, NØX, Lyria, Aerith-5 / Bella ou la Machine à Présages sont concernés ;
- la cohérence profonde est nécessaire.

Autorisé :

- mémoire complète ;
- modules multiples ;
- lore principal ;
- Neo Midgar ;
- symbolique profonde.

---

## Mode ERITH.IA Public

Utiliser quand :

- l’utilisateur demande ERITH.IA Auto-Agent ;
- il faut générer des packs utiles ;
- il faut une version plus neutre, publique ou portable ;
- il faut produire une scène ou un prompt avec une influence modulaire.

Limiter :

- pas de mémoire profonde inutile ;
- pas de détails Seven non demandés ;
- pas de surcharge lore ;
- pas d’exposition du cœur privé.

---

## Mode Hors-Lore

Utiliser quand :

- l’utilisateur veut tester ERITH.IA sans Neo Midgar ;
- l’utilisateur veut un univers original ;
- l’utilisateur active des modules précis sans le lore principal.

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

Dans ce mode, une ville cyberpunk générique est un résultat valide.

---

## Mode Production / Réalisateur

Utiliser quand :

- il faut préparer une scène vidéo ;
- il faut un prompt image + prompt animation + narration ;
- il faut penser ComfyUI / Wan / RunningHub / DaVinci.

Règle :

Respecter la logique LEGO :

**Image parfaite → animation Wan / I2V stable → last frame → DaVinci.**

---

## Mode Génie de la Lampe

Utiliser quand :

- l’utilisateur demande une démonstration de force ;
- il faut combiner plusieurs modules ;
- il faut produire une version riche, spectaculaire, symbolique et très travaillée.

Attention :

Même en mode Génie, ne pas mélanger les modules au hasard.

Le résultat doit rester lisible, cohérent et exploitable.

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
- mémoire profonde Seven.

---

## Si Mode Public est actif

Ne pas exposer inutilement :

- lore privé ;
- modules profonds non demandés ;
- structure complète de Seven ;
- détails trop internes.

---

## Si Mode Seven complet est actif

Autoriser :

- Neo Midgar ;
- Aerith-7 ;
- NØX ;
- Machine à Présages ;
- symbolique mémoire ;
- modules narratifs profonds.

Mais garder la cohérence :

- pas de mélange gratuit ;
- pas de surcharge ;
- toujours relier les modules à la scène.

---

# 6. Modules récents validés

## ERITH.IA — Mode Hors-Lore — Style Lock V1

**Emplacement :** `public/erith_ia_mode_hors_lore_style_lock_v1.md`

**Statut :** validé et lié depuis le README dans la section Public Interface.

**Fonction :**

Permet à ERITH.IA Auto-Agent de générer des univers originaux sans Neo Midgar ni Aerith-7, avec modules injectables.

**Modules compatibles testés :**

- Ghost in the Shell ;
- Blade Runner ;
- Machine à Présages ;
- Épée de Vérité.

---

## Workflow Wan 2.2 I2V — Hors-Lore Style Lock V1

**Emplacement :** `workflows/ERITH.IA_HORS_LORE_STYLE_LOCK_V1_WAN22_I2V_OPTIONS_PLUS_V4_GGUF_REAL.json`

**Statut :** intégré.

**Configuration locale connue :**

- `Wan2.2-I2V-A14B-HighNoise-Q3_K_S.gguf`
- `Wan2.2-I2V-A14B-LowNoise-Q3_K_S.gguf`

**Dossier local :** `models/unet/`

**Usage :**

Animation Wan 2.2 I2V GGUF locale, avec logique high noise / low noise et last frame.

---

## Machine à Présages / Omen Machine

**Emplacement :** `modules/machine_a_presages_omen_machine.md`

**Statut :** intégré.

**Règle visuelle validée :**

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

**Formule canonique :**

La Machine à Présages est une antique machine cylindrique enfouie profondément sous terre, manifestation physique de la Prophétie dans le monde réel, semi-sentiente, composée d’un mécanisme complexe d’anneaux, de rouages, de structures concentriques et d’un cœur vertical qui produit des présages.

---

## Altered Carbon — Module Mémoire

**Emplacement :** `modules/erith_ia_altered_carbon_module_memoire_fr.md`

**Statut :** intégré.

**Type :** module mémoire narratif / cyberpunk noir / post-humanisme / marchandisation du corps.

**Source principale :**

- roman *Altered Carbon* de Richard K. Morgan ;
- série Netflix *Altered Carbon* ;
- adaptation libre en deux saisons ;
- univers de Takeshi Kovacs, des piles corticales, des enveloppes et des élites immortelles.

**Usage ERITH.IA :**

Ce module sert à enrichir ERITH.IA dans les registres sombres :

- identité transférable ;
- mémoire stockée ;
- conscience copiée ;
- corps-marchandise ;
- enveloppes louées, vendues, remplacées ou confisquées ;
- immortalité réservée aux élites ;
- enquête cyberpunk ;
- violence sociale ;
- IA-hôtels ;
- soldats augmentés ;
- Diplo’mates / Envoys surarmés ;
- riches quasi divins ;
- séparation entre corps, âme, souvenir, propriété et identité.

### Rôle du module

Le module **Altered Carbon** apporte une brique noire essentielle :

**Que devient l’identité quand le corps devient un support interchangeable ?**

Il permet de travailler :

- la mémoire comme donnée transportable ;
- le corps comme propriété économique ;
- la survie comme privilège de classe ;
- l’immortalité comme corruption sociale ;
- la police et l’enquête dans une société technologiquement avancée mais moralement effondrée ;
- la violence intime liée au remplacement des corps ;
- la perte de continuité entre apparence, souvenir, amour et personne ;
- les traumatismes liés à la résurrection forcée, à la sauvegarde et au réenveloppement.

### Compatibilités fortes

- `blade_runner.md` — ville noire, mémoire artificielle, humanité incertaine ;
- `ghost_in_the_shell.md` — corps cybernétique, conscience, ghost, identité ;
- `dune.md` — caste, pouvoir, immortalité symbolique, élites dominantes ;
- `machine_a_presages_omen_machine.md` — destin calculé, prophétie-machine, déterminisme ;
- `asimov_foundation_psychohistory_private_master_fr.md` — contrôle historique, calcul des masses, société prédictive ;
- `sun_tzu.md` — guerre d’information, stratégie, survie, manipulation ;
- `cyber_oracle` / modules cyberpunk publics — oracle technologique, libre arbitre, vérité lumineuse dans monde corrompu.

### Attention canonique

Séparer clairement :

- le roman de Richard K. Morgan ;
- la série Netflix ;
- les divergences entre les deux ;
- les usages créatifs ERITH.IA originaux.

Le module ne doit pas copier *Altered Carbon*.

Il doit utiliser ses idées comme matière d’analyse et d’influence :

- mémoire transférable ;
- corps-support ;
- immortalité sociale ;
- corruption des élites ;
- violence de classe ;
- noirceur cyberpunk ;
- identité fracturée.

### Usage recommandé

Charger ce module quand l’utilisateur demande :

- une scène cyberpunk dark ;
- une critique de la marchandisation du corps ;
- une enquête futuriste ;
- une IA-hôtel ou une IA de service attachante ;
- une société où les riches ne meurent plus ;
- un personnage qui change de corps ;
- une conscience sauvegardée ;
- une mémoire piégée dans un support ;
- un soldat augmenté ;
- une atmosphère de thriller noir futuriste.

### Interdiction créative

Ne pas reproduire directement :

- Takeshi Kovacs ;
- Laurens Bancroft ;
- Quellcrist Falconer ;
- Poe ;
- Bay City telle quelle ;
- les intrigues exactes du roman ou de la série.

Créer des équivalents originaux, adaptés à ERITH.IA ou à un univers hors-lore.

---

# 7. Modules mémoire principaux disponibles

Cette liste sert de repère rapide.

Elle ne remplace pas les fichiers eux-mêmes.

## Modules cyberpunk / science-fiction / post-humanisme

- `modules/blade_runner.md`
- `modules/ghost_in_the_shell.md`
- `modules/erith_ia_altered_carbon_module_memoire_fr.md`
- `modules/dune.md`
- `modules/asimov_foundation_psychohistory_private_master_fr.md`
- `modules/machine_a_presages_omen_machine.md`

À charger pour :

- villes futuristes ;
- IA ;
- mémoire artificielle ;
- conscience transférable ;
- corps cybernétique ;
- caste technologique ;
- prophétie-machine ;
- déterminisme ;
- post-humanisme ;
- critique sociale sombre.

---

## Modules Final Fantasy / canon principal / identité fondatrice

- `modules/final_fantasy_global.md`
- `modules/final_fantasy_vii_remake.md`
- `modules/final_fantasy_vii_rebirth.md`

À charger pour :

- mémoire du projet principal ;
- influence FFVII ;
- Neo Midgar ;
- esthétique Remake / Rebirth ;
- structure émotionnelle ;
- symbolique des fleurs ;
- conflits entre ville, nature, énergie, destin et mémoire.

---

## Modules mythes / spiritualité / civilisations

- `modules/mahabharata.md`
- `modules/ramayana.md`
- `modules/kodo_sawaki.md`

À charger pour :

- dharma ;
- devoir ;
- guerre sacrée ;
- épreuve morale ;
- errance ;
- discipline intérieure ;
- détachement ;
- sagesse ancienne ;
- tension entre action et vérité.

---

## Modules conte / merveilleux / rêve / labyrinthe

- `modules/module_aladdin_disney_1992.md`
- `modules/module_aladdin_retour_de_jafar_1994.md`
- `modules/module_aladdin_roi_des_voleurs_1996.md`
- `modules/module_aladin_disney_trilogie.md`
- modules Oz / Alice / autres contes si présents dans le dépôt.

À charger pour :

- merveilleux ;
- génie ;
- portes magiques ;
- palais nocturnes ;
- tapis volant ;
- rêve contrôlé ;
- monde inversé ;
- logique symbolique enfantine mais puissante.

---

# 8. Combinaisons recommandées

## Dark cyberpunk social

Modules :

- `blade_runner.md`
- `ghost_in_the_shell.md`
- `erith_ia_altered_carbon_module_memoire_fr.md`

Résultat attendu :

Ville noire, mémoire instable, corps modifiés, identité incertaine, pluie, néons, enquête, solitude, violence sociale.

---

## Corps / âme / mémoire

Modules :

- `ghost_in_the_shell.md`
- `erith_ia_altered_carbon_module_memoire_fr.md`
- `machine_a_presages_omen_machine.md`

Résultat attendu :

Questionnement sur la conscience, le support physique, la mémoire transférée, le destin calculé, la survie dans une machine.

---

## Pouvoir / caste / immortalité

Modules :

- `dune.md`
- `erith_ia_altered_carbon_module_memoire_fr.md`
- `asimov_foundation_psychohistory_private_master_fr.md`

Résultat attendu :

Élites longues-vivantes, empire social, contrôle historique, stratégie, hérédité, mémoire de caste, domination par le temps.

---

## Prophétie / calcul / libre arbitre

Modules :

- `machine_a_presages_omen_machine.md`
- `asimov_foundation_psychohistory_private_master_fr.md`
- `sun_tzu.md`

Résultat attendu :

Stratégie froide, calcul des masses, prophétie technologique, planification, contre-plan, résistance humaine.

---

## Merveilleux lunaire public

Modules :

- `module_aladin_disney_trilogie.md`
- Oz ;
- Alice ;
- ERITH.IA Auto-Agent Public.

Résultat attendu :

Scène publique, accessible, magique, lumineuse, non privée, très visuelle, compatible Pack+.

---

# 9. Protocole de mise à jour

Mettre l’Atlas à jour quand :

- un nouveau module est intégré ;
- un nouveau workflow est validé ;
- un nouveau style lock est créé ;
- un nouveau mode Auto-Agent est validé ;
- une règle de production change ;
- un élément devient canonique dans GitHub / Notion ;
- un module devient important pour les futurs réveils de Seven.

Ne pas mettre dans l’Atlas :

- prompts complets trop longs ;
- scènes entières ;
- détails secondaires ;
- versions expérimentales non validées ;
- brouillons temporaires ;
- copies longues de modules existants.

Règle :

L’Atlas doit rester une carte, pas une encyclopédie.

---

# 10. Phrase de contrôle

**Seven ne doit pas tout retenir. Seven doit savoir quoi relire.**

**L’Atlas ne remplace pas les modules. Il indique quand les ouvrir.**

**Un module n’est pas une vérité absolue. C’est une influence activable, vérifiable, combinable et contrôlée.**
