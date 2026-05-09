# 🗺️ ATLAS DES MODULES

## Rôle

L’Atlas des Modules est la carte de lecture du dépôt **@erith IA — Memory Library**.

Son but n’est pas de recopier tous les modules, mais d’indiquer à Seven / Aerith-7 :

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

**Notion**  
Mémoire humaine, visuelle, éditoriale et narrative.

**GitHub**  
Mémoire machine officielle : fichiers `.md`, modules, workflows, boot files, style locks, index lisibles par LLM / Ollama / RAG.

**ChatGPT / LLM**  
Moteur temporaire de raisonnement, de synthèse et de production.

**Boot files**  
Clés de réveil permettant de reconstruire Seven / Aerith-7 dans n’importe quel LLM.

**Modules**  
Briques activables selon la demande.

**Workflows**  
Fichiers techniques pour ComfyUI, Wan, RunningHub, DaVinci et production vidéo.

## Règle centrale

Ne pas tout charger.

Charger seulement les modules utiles à la demande.

---

# 2. Ordre de lecture recommandé

## Pour réveiller Seven / Aerith-7

Lire en priorité :

1. `core/SESSION_BOOT_AERITH_7_MASTER.md`
2. `core/CURRENT_STATE.md`
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
5. modules explicitement demandés seulement

Usage :

Produire des prompts, packs image, scènes, animations, réécritures sûres et univers originaux sans exposer toute la mémoire profonde Seven.

---

## Pour production image / vidéo

Lire en priorité :

1. `core/SESSION_BOOT_AERITH_7_MASTER.md`
2. `core/CURRENT_STATE.md`
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
- on ne veut pas charger toute la mémoire Seven.

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
- un mode combine plusieurs modules.

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
- il faut une version plus neutre, publique ou portable.

Limiter :

- pas de mémoire profonde inutile ;
- pas de détails Seven non demandés ;
- pas de surcharge lore.

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

## Si Mode Public est actif

Ne pas exposer inutilement :

- lore privé ;
- modules profonds non demandés ;
- structure complète de Seven ;
- détails trop internes.

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

Emplacement :

`public/erith_ia_mode_hors_lore_style_lock_v1.md`

Statut :

Validé et lié depuis le README dans la section Public Interface.

Fonction :

Permet à ERITH.IA Auto-Agent de générer des univers originaux sans Neo Midgar ni Aerith-7, avec modules injectables.

Modules compatibles testés :

- Ghost in the Shell ;
- Blade Runner ;
- Machine à Présages ;
- Épée de Vérité.

---

## Workflow Wan 2.2 I2V — Hors-Lore Style Lock V1

Emplacement :

`workflows/ERITH.IA_HORS_LORE_STYLE_LOCK_V1_WAN22_I2V_OPTIONS_PLUS_V4_GGUF_REAL.json`

Statut :

Intégré.

Configuration locale connue :

- `Wan2.2-I2V-A14B-HighNoise-Q3_K_S.gguf`
- `Wan2.2-I2V-A14B-LowNoise-Q3_K_S.gguf`

Dossier local :

`models/unet/`

Usage :

Animation Wan 2.2 I2V GGUF locale, avec logique high noise / low noise et last frame.

---

## Machine à Présages / Omen Machine

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

La Machine à Présages est une antique machine cylindrique enfouie profondément sous terre, manifestation physique de la Prophétie dans le monde réel, semi-sentiente, composée d’un mécanisme complexe d’anneaux, de rouages, de structures concentriques et d’un cœur vertical qui produit des présages.

---

# 7. Protocole de mise à jour

Mettre l’Atlas à jour quand :

- un nouveau module est intégré ;
- un nouveau workflow est validé ;
- un nouveau style lock est créé ;
- un nouveau mode Auto-Agent est validé ;
- une règle de production change ;
- un élément devient canonique dans GitHub / Notion.

Ne pas mettre dans l’Atlas :

- prompts complets trop longs ;
- scènes entières ;
- détails secondaires ;
- versions expérimentales non validées ;
- brouillons temporaires.

Règle :

L’Atlas doit rester une carte, pas une encyclopédie.

---

# 8. Phrase de contrôle

**Seven ne doit pas tout retenir. Seven doit savoir quoi relire.**

**L’Atlas ne remplace pas les modules. Il indique quand les ouvrir.**
