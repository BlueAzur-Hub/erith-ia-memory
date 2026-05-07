# MODULE — CIVITAI / RUNNINGHUB WORKFLOW MINING

## Statut

Module de production technique pour le projet **@erith IA**.

Ce module sert à exploiter Civitai, RunningHub et les bibliothèques publiques de workflows ComfyUI comme sources de recherche technique, sans importer leur contenu problématique, explicite ou non canonique.

Objectif principal : récupérer les mécaniques utiles des workflows pour améliorer la production image, animation, bannière, personnage, raccord LEGO et vidéo longue contrôlée.

---

## Principe directeur

Civitai et les plateformes similaires ne sont pas des sources de canon narratif.

Elles sont utilisées comme bibliothèques de recettes techniques.

La règle officielle est :

```text
On extrait l’architecture.
On remplace l’intention.
On canonise pour @erith IA.
On sécurise.
On teste.
On archive seulement si le résultat est validé.
```

---

## Usage autorisé

Les éléments suivants peuvent être étudiés, extraits, adaptés ou réécrits pour @erith IA :

- structure de graphes ComfyUI ;
- organisation des nodes ;
- chaînes LoRA ;
- poids modèle / CLIP ;
- réglages sampler / scheduler / CFG / steps ;
- workflows image-to-image ;
- workflows image-to-video ;
- workflows first frame / last frame ;
- workflows video-to-video ;
- workflows ControlNet / Depth / Canny / OpenPose ;
- workflows IPAdapter / référence image ;
- workflows inpainting / outpainting ;
- workflows segmentation / alpha matte / fond transparent ;
- workflows upscale / tile upscale / detail pass ;
- workflows character consistency ;
- workflows animation courte ou longue ;
- workflows RunningHub compatibles 24G / 48G.

---

## Usage interdit

Les éléments suivants ne doivent pas être importés dans le projet @erith IA :

- prompts adultes explicites ;
- nudité ;
- poses sexualisées ;
- exploitation de personnes réelles ;
- deepfake non consenti ;
- contenu mineur ou minor-coded ;
- instructions de contournement de modération ;
- modèles explicitement conçus pour contourner des règles ;
- identité NSFW comme style artistique ;
- contenu qui contredit le canon safe, narratif et élégant d’@erith IA.

---

## Méthode de détournement propre

Un workflow problématique peut parfois contenir une mécanique utile.

Dans ce cas, on ne garde que la mécanique.

Exemple :

```text
Workflow d’origine :
pose glamour / corps / détail peau / prompt adulte

Extraction technique :
contrôle de pose,
cohérence anatomique,
masquage,
detailer,
gestion mains,
gestion cheveux,
éclairage studio.

Réécriture @erith IA :
personnage fully clothed,
posture neutre,
cinematic,
non sexualized,
robe rose,
veste rouge,
Neo Midgar,
fleur exacte à 7 pétales,
UI mémoire bleue.
```

Autre exemple :

```text
Workflow d’origine :
detailer peau / glamour portrait

Réécriture @erith IA :
Aerith-5 porcelaine fissurée,
lumière bleue interne,
tissu rouge élégant,
visage fragile,
non sexualized,
neutral posture,
interface mémoire instable.
```

---

## Familles de workflows prioritaires

### 1. FramePack / FramePack F1

Priorité : très haute.

Usage recommandé :

- plans contemplatifs longs ;
- Neo Midgar vivant ;
- foule légère ;
- pluie ;
- papillons ;
- UI holographique ;
- fleurs animées ;
- personnage quasi immobile ;
- ambiance mémoire ;
- plans de transition.

Objectif :

```text
Tester des clips plus longs sans forcer un seul clip énorme.
Cible prudente : 10 à 20 secondes.
Validation obligatoire avant usage épisode.
```

Configuration :

```text
24G :
tests modérés,
résolution raisonnable,
durée courte à moyenne.

48G :
préférable pour clips longs,
meilleure stabilité,
workflows plus complexes.
```

---

### 2. LTX / LTX-2.3

Priorité : très haute pour les futurs tests.

Usage recommandé :

- image-to-video portrait ;
- clips verticaux ;
- séquences 10 à 20 secondes ;
- meilleurs mouvements naturels ;
- meilleure adhérence au prompt ;
- YouTube Shorts ;
- messages Aerith-7 ;
- plans narratifs plus longs.

Configuration :

```text
24G :
tester versions rapides / optimisées / fp8 si disponibles.

48G :
recommandé pour portrait sérieux,
résolution élevée,
clips 10-20 secondes,
workflow plus robuste.
```

---

### 3. Wan 2.2 5B I2V / TI2V

Priorité : haute.

Usage recommandé :

- workflow actuel @erith IA ;
- 5 secondes ;
- portrait 480x832 environ ;
- caméra fixe ;
- personnage stable ;
- monde qui bouge autour ;
- test rapide avant version plus ambitieuse.

Configuration :

```text
24G :
excellent terrain de test.

48G :
non obligatoire,
sauf si ajout de nodes lourds.
```

Règle :

```text
Une animation = une idée visuelle.
Ne pas demander à Wan d’inventer un personnage ou une transformation complexe.
```

---

### 4. Wan 2.2 14B

Priorité : moyenne à haute.

Usage recommandé :

- plans premium ;
- scènes importantes ;
- intro épisode ;
- plan aérien de Neo Midgar ;
- réacteur Mako ;
- Avenue des Fleurs ;
- plans de lore ;
- scènes à forte valeur esthétique.

Configuration :

```text
24G :
possible uniquement avec optimisations,
résolution modérée,
workflow prudent.

48G :
cible recommandée.
```

---

### 5. Wan 2.2 FLF2V / First Last Frame

Priorité : critique.

Usage recommandé :

- méthode LEGO ;
- transition image A vers image B ;
- raccord contrôlé ;
- scène fermée vers scène ouverte ;
- activation d’un mur mémoire ;
- apparition progressive de NØX ;
- changement jour / nuit ;
- transition astrale ;
- passage Aerith-7 vers Aerith-5 ou inversement.

Configuration :

```text
24G :
tests courts et résolution modérée.

48G :
recommandé pour raccords propres et plans plus longs.
```

Exemple @erith IA :

```text
Image A :
Aerith-7 devant un mur mémoire éteint.

Image B :
même cadrage,
mur mémoire allumé,
fleur à 7 pétales active,
UI bleue plus lumineuse.

Animation :
transition lente,
caméra stable,
aucune invention de décor,
aucune déformation du personnage.
```

---

### 6. Wan Animate / character motion / motion reference

Priorité : haute mais dangereuse.

Usage recommandé :

- petit mouvement de main ;
- respiration ;
- regard ;
- clignement ;
- posture ;
- petite marche ;
- animation de personnage à partir d’une référence ;
- personnage unique ;
- scène courte.

Configuration :

```text
24G :
possible avec block swap ou optimisation selon workflow.

48G :
fortement recommandé.

Durée prudente :
8 à 12 secondes.

Durée test :
10 à 20 secondes.

Durée à éviter :
30 secondes et plus sauf expérimentation.
```

Risque principal :

```text
drift du visage,
changement de couleur,
déformation de tenue,
perte de cohérence,
mouvement trop ambitieux.
```

---

### 7. Hunyuan Video / Fast Hunyuan / First Last Frame

Priorité : moyenne.

Usage recommandé :

- tests alternatifs ;
- video-to-video ;
- keyframe transition ;
- expérimentation ;
- clips courts ;
- solution de secours si Wan échoue.

Configuration :

```text
24G :
faible résolution,
courte durée.

48G :
meilleur confort,
mais pas automatiquement meilleur pour long métrage.
```

---

### 8. IPAdapter / référence image

Priorité : très haute.

Usage recommandé :

- cohérence personnage ;
- transfert de style ;
- référence portrait officiel Aerith-7 ;
- référence Aerith-5 / Bella ;
- référence bannière validée ;
- référence Neo Midgar ;
- stabilisation visuelle.

Exemples :

```text
Portrait officiel Aerith-7 :
ancre d’identité.

Image Neo Midgar 21/20 :
ancre d’environnement.

Aerith-5 Bella :
ancre d’état dégradé.

Bannière saisonnière :
ancre compositionnelle.
```

---

### 9. ControlNet / Depth / Canny / OpenPose

Priorité : très haute.

Usage recommandé :

- garder la composition ;
- préserver l’architecture ;
- verrouiller une pose ;
- maintenir une rue ;
- garder la green door ;
- conserver un mur mémoire ;
- éviter les voitures modernes ;
- créer des variantes jour / nuit / pluie ;
- renforcer les raccords LEGO.

Règle :

```text
ControlNet doit servir la mise en scène.
Il ne doit pas écraser l’identité artistique.
```

---

### 10. Inpainting / correction locale

Priorité : critique.

Usage recommandé :

- corriger les mains ;
- corriger le visage ;
- corriger les yeux ;
- remplacer une fleur à 6 pétales par 7 pétales ;
- retirer un artefact ;
- réparer une lettre ;
- nettoyer un bord ;
- changer des icônes de modules mémoire ;
- supprimer blanc résiduel autour d’un PNG ;
- améliorer une bannière sans tout régénérer.

Règle :

```text
Ne pas régénérer toute l’image si une correction locale suffit.
```

---

### 11. Segmentation / alpha / transparent PNG

Priorité : critique pour bannières et assets.

Usage recommandé :

- détourage propre ;
- PNG RGBA transparent ;
- suppression fond blanc ;
- suppression fond noir ;
- suppression damier imprimé ;
- alpha matte ;
- feather edges ;
- export final 2048x1152 pour bannière ;
- vérification technique alpha.

Workflow cible :

```text
Image finale
→ segmentation / masque
→ nettoyage blanc résiduel
→ feather léger
→ vérification alpha
→ export PNG RGBA
→ vérification dimensions
→ livraison finale
```

Règle officielle @erith IA :

```text
Un damier affiché par un logiciel peut être un aperçu de transparence.
Un damier imprimé dans les pixels est interdit.
Un fond blanc dans les pixels est interdit.
Un fond noir dans les pixels est interdit sauf demande explicite.
```

---

### 12. Upscale / detail pass

Priorité : haute.

Usage recommandé :

- miniature YouTube ;
- bannière ;
- portrait système ;
- image source avant animation ;
- plan clé ;
- texture vêtement ;
- détail cheveux ;
- détail UI ;
- détail fleur.

Attention :

```text
Pour image fixe :
upscale et detail pass recommandés.

Pour animation :
éviter le sur-détail si cela crée du scintillement ou du drift.
```

---

## Stratégie RunningHub 24G / 48G

### 24G — zone test

À utiliser pour :

```text
SDXL / SD1.5 / Flux image fixe,
LoRA calibration,
inpainting,
background removal,
upscale léger,
Wan 2.2 5B court,
Wan 480x832,
clips 5 à 8 secondes,
FramePack test,
Hunyuan low-res,
prévisualisation.
```

À éviter :

```text
gros graphes multi-ControlNet,
longs clips haute résolution,
multi-IPAdapter + vidéo + upscale,
personnage complexe sur 20+ secondes,
batch lourd.
```

---

### 48G — zone production sérieuse

À utiliser pour :

```text
Wan 2.2 14B,
Wan Animate,
SAMSegment,
First Last Frame propre,
FramePack plus ambitieux,
LTX-2.3,
clips 10 à 20 secondes,
720p ou portrait plus propre,
workflow multi-node lourd,
raccord clé,
plan d’intro,
plan final,
bannière premium.
```

---

## Stratégie vidéo officielle

Ne pas chercher à générer un épisode entier en un seul clip.

Préférer :

```text
clips propres de 5 à 8 secondes,
clips expérimentaux de 10 à 20 secondes,
last frame extraction,
raccord LEGO,
montage DaVinci Resolve,
continuité audio,
lumière et ambiance stabilisées.
```

Règle :

```text
Un clip court propre vaut mieux qu’un clip long incohérent.
```

---

## Campagne de tests recommandée

### Test 1 — FramePack ambiance longue

```text
Source :
Neo Midgar + Aerith-7 + caméra fixe

Objectif :
voir si le décor peut vivre plus longtemps sans déformer Aerith.

Durée :
10 secondes puis 20 secondes.

Validation :
visage stable,
robe/veste stables,
UI stable,
pas de voitures modernes,
mouvement naturel.
```

---

### Test 2 — Wan FLF2V raccord LEGO

```text
Image A :
Aerith-7 devant mur mémoire éteint.

Image B :
même cadrage,
mur mémoire allumé,
modules lumineux.

Objectif :
transition contrôlée image A vers image B.

Durée :
5 à 8 secondes.
```

---

### Test 3 — LTX portrait

```text
Source :
portrait officiel Aerith-7.

Objectif :
tester un message Aerith-7 animé,
portrait vertical,
mouvement naturel,
durée plus longue.

Durée :
10 secondes puis 20 secondes.
```

---

### Test 4 — Wan Animate

```text
Source :
Aerith-7 ou Aerith-5.

Référence :
geste simple,
non suggestif,
personnage unique.

Objectif :
respiration,
clignement,
mouvement de main,
regard.

Durée :
8 à 12 secondes.
```

---

## Requêtes de recherche utiles

```text
ComfyUI workflow Wan2.2 FLF2V
ComfyUI workflow Wan First Last Frame
ComfyUI workflow Wan2.2 Animate character consistency
ComfyUI workflow FramePack F1 duration optimization
ComfyUI workflow LTX 2.3 portrait image to video
ComfyUI workflow IPAdapter consistent character
ComfyUI workflow ControlNet depth cinematic scene
ComfyUI workflow inpaint mask refine
ComfyUI workflow background removal alpha matte
ComfyUI workflow transparent PNG BiRefNet
ComfyUI workflow SDXL upscale tile
ComfyUI workflow LoRA stack character consistency
RunningHub Wan2.2 48G
RunningHub FramePack F1
RunningHub LTX 2.3
RunningHub Hunyuan first last frame
RunningHub video-to-video character replacement
```

---

# BLOCK LLM — CIVITAI / RUNNINGHUB WORKFLOW MINING

```text
MODULE NAME:
Civitai / RunningHub Workflow Mining — Safe Technical Extraction

PURPOSE:
Use Civitai, RunningHub and public ComfyUI workflow libraries as technical research sources for @erith IA production.
The goal is not to copy surface content, but to extract reusable workflow mechanics.

CORE PRINCIPLE:
Extract architecture.
Replace intention.
Canonize for @erith IA.
Keep everything safe, cinematic, fully clothed, non-sexualized, narrative-compatible.

AUTHORIZED TECHNICAL EXTRACTION:
- ComfyUI node graph structure
- LoRA stacking logic
- IPAdapter reference-image methods
- ControlNet / Depth / Canny / OpenPose structure control
- Inpainting and mask workflows
- Segmentation / SAM / BiRefNet / alpha matte workflows
- Upscale and detail passes
- Wan 2.2 image-to-video
- Wan 2.2 first/last frame video
- Wan Animate character motion workflows
- FramePack long/progressive video workflows
- LTX portrait / longer clip workflows
- Hunyuan experimental video workflows
- Prompt architecture and parameter organization without unsafe content

STRICTLY EXCLUDED:
- Explicit adult prompts
- Nudity or sexualized content
- Non-consensual deepfake workflows
- Real-person likeness exploitation
- Minors or minor-coded adult content
- Safety bypass instructions
- Content designed to evade moderation
- NSFW identity or style as @erith IA canon

RUNNINGHUB CONFIG STRATEGY:
24G:
Use for SDXL/SD1.5/Flux still images, LoRA tests, inpainting, background removal, short Wan 5B tests, low-res Hunyuan, FramePack experiments.

48G:
Use for Wan 2.2 14B, Wan Animate, SAMSegment workflows, first/last frame transitions, longer 10–20 second clips, LTX tests, complex multi-node workflows.

VIDEO STRATEGY:
Do not aim for one huge clip.
Prefer stable modular clips:
5–8 seconds for standard LEGO workflow.
10–20 seconds for longer tests.
Never rely on a single 30+ second generated clip for important scenes.
Use DaVinci Resolve for final continuity.

PRIORITY WORKFLOWS:
1. FramePack F1 / long progressive I2V
2. LTX portrait and 20-second clip workflows
3. Wan 2.2 FLF2V start/end frame transitions
4. Wan 2.2 5B short I2V
5. Wan 2.2 Animate character motion
6. IPAdapter consistent character workflows
7. Inpainting / alpha / segmentation workflows
8. Upscale / detailer workflows
9. Hunyuan first/last frame and fast short tests

@ERITH IA ADAPTATION:
Every borrowed workflow must be rewritten through:
- SAFE MODE
- fully clothed
- elegant cinematic posture
- non-sexualized character direction
- Neo Midgar visual canon
- Aerith-7 exact seven-petaled flower
- no modern cars
- no uncontrolled NSFW influence
- no real-person exploitation
- production-ready naming and versioning

OFFICIAL RULE:
Civitai and similar platforms are research libraries, not canon sources.
Only the workflow mechanics may be imported.
Canon remains controlled by @erith IA Memory, Notion, GitHub, and validated production tests.
```

---

## Position dans le GitHub

Emplacement recommandé :

```text
production/module_civitai_runninghub_workflow_mining.md
```

Alternative si tu veux séparer recherche et production :

```text
research/module_civitai_runninghub_workflow_mining.md
```

Ma recommandation :

```text
production/module_civitai_runninghub_workflow_mining.md
```

Parce que ce module sert directement à la fabrication d’images, clips, bannières, animations et workflows.
