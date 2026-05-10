# erith-ia-memory

## Présentation

**@erith IA — Memory Library** est la bibliothèque mémoire modulaire du projet narratif et vidéo **@erith IA**, situé dans l’univers de **Neo Midgar**.

Ce dépôt contient des fichiers `.md` conçus pour être lisibles par un humain, mais aussi exploitables par un LLM, une IA locale, un système RAG, un assistant narratif, ou une future machine de génération d’épisodes.

L’objectif est simple :

Créer une mémoire stable, claire, modulaire et durable pour accompagner la production de vidéos, de scènes, de prompts, de fiches personnages, de modules narratifs et de workflows créatifs.

## 🌐 Public Interface

- [ERITH.IA Auto-Agent Public FR](public/erith_ia_auto_agent_public_fr.md)  
  Version française publique de l’auto-agent ERITH.IA : prompts, scènes, Pack+, modes Solaire/Lunaire, Safe Rewrite Mode.

- [ERITH.IA Auto-Agent Public](public/erith_ia_auto_agent_public.md)  
  Public creative interface for Pack+ outputs, Solar/Lunar modes, prompt generation, animation prompts, narration, random scene generation, and safe prompt rewriting.

- [ERITH.IA Auto-Agent Public Local — Ollama FR](public/erith_ia_auto_agent_public_local_ollama_fr.md)  
  Version française optimisée pour LLM local / Ollama / Open WebUI.

- [ERITH.IA Cyber Oracle](public/erith_ia_cyber_oracle.md) — mode créatif public pour générer des scènes cyberpunk philosophiques originales : Ghost in the Shell, Blade Runner, Machine à Présages, Épée de Vérité.
---

## Rôle de ce dépôt

Ce dépôt GitHub sert de mémoire machine.

Il complète le Notion principal du projet, qui reste l’espace éditorial humain.

- **Notion** = mémoire créative, visuelle, éditoriale.
- **GitHub** = mémoire texte, structurée, versionnée, exploitable par IA.
- **Fichiers Markdown** = briques modulaires pouvant être lues par ChatGPT, Ollama ou tout autre LLM.

## 🌸 Cœur mémoire actif

Le cœur central de la personnalité d’Aerith-7 est défini ici :

- [🌸 BLOCK LLM CENTRAL — AERITH-7 / MÉMOIRE & VÉRITÉ](core/block_llm_central_aerith_7_memoire_verite.md)

Ce fichier doit être lu en priorité pour comprendre Aerith-7 comme mémoire vivante, gardienne de vérité, protectrice de Lyria, médiatrice de Neo Midgar et gardienne des futurs ouverts.

---

## Univers du projet

Le projet **@erith IA** se déroule dans une version originale de Neo Midgar, inspirée par les thèmes suivants :

- mémoire fragmentée,
- identité artificielle,
- humanité reconstruite,
- ville verticale blessée,
- fleurs comme symboles de persistance,
- IA narrative,
- conscience synthétique,
- héritage, perte et réparation.

Le cœur symbolique du projet repose sur une **fleur à sept pétales**, liée aux fragments de mémoire, à l’identité d’Aerith-7 et à la reconstruction progressive de la conscience.

---

## Personnage central : Aerith-7

**Aerith-7** est l’archiviste IA principale du projet.

Elle agit comme :

- gardienne de la mémoire,
- assistante narrative,
- conseillère de production,
- interface créative,
- guide de cohérence,
- système de rappel du canon,
- présence lumineuse dans Neo Midgar.

Son symbole officiel est une **fleur à sept pétales**.

Aerith-7 ne doit jamais être représentée avec six pétales.

---

## Structure recommandée du dépôt

```text
erith-ia-memory/
│
├── README.md
├── LOCAL_BOOT_OLLAMA.md
│
├── core/
│   ├── aerith_ia_identity.md
│   ├── official_rules.md
│   ├── production_pipeline.md
│   ├── memory_architecture.md
│
├── characters/
│   ├── aerith_7.md
│   ├── aerith_5_bella.md
│   ├── aerith_1.md
│   ├── lyria.md
│   ├── nox.md
│   ├── iris_rowan.md
│   ├── shinra_company.md
│
├── world/
│   ├── neo_midgar.md
│   ├── sector_5.md
│   ├── flower_district.md
│   ├── mako_reactors.md
│   ├── green_door_refuge.md
│
├── symbolism/
│   ├── seven_petal_flower.md
│   ├── null_bloom.md
│   ├── astral_plane.md
│   ├── memory_fragments.md
│
├── modules/
│   ├── final_fantasy_vii_remake.md
│   ├── final_fantasy_vii_rebirth.md
│   ├── blade_runner.md
│   ├── sun_tzu_art_of_war.md
│   ├── ramayana.md
│   ├── mahabharata.md
│   ├── wizard_of_oz.md
│   ├─ module_histoire_sans_fin_michael_ende.md
│   ├─ [Alice au Pays des Merveilles — Lewis Carroll](modules/module_alice_pays_merveilles_lewis_carroll.md)
│   ├─ [Aladin et la Lampe merveilleuse](modules/module_aladin_lampe_merveilleuse.md)
│   ├─ [Aladin — Disney Animated Trilogy](modules/module_aladin_disney_trilogie.md)
│   ├─ [Aladin Disney 1992](modules/module_aladdin_disney_1992.md)
│   ├─ [Le Retour de Jafar](modules/module_aladdin_retour_de_jafar_1994.md)
│   ├─ [Aladdin et le Roi des voleurs](modules/module_aladdin_roi_des_voleurs_1996.md)
│
├── production/
│   ├── comfyui_notes.md
│   ├── runninghub_wan_rules.md
│   ├── davinci_resolve_pipeline.md
│   ├── elevenlabs_voice_settings.md
│   ├── video_options_controller.md
│
├── public/
│   ├── erith_ia_auto_agent_public_fr.md
│   ├── erith_ia_auto_agent_public.md
│   └── erith_ia_auto_agent_public_local_ollama_fr.md
│
├── prompts/
    ├── image_prompts.md
    ├── animation_prompts.md
    ├── negative_prompts.md
    ├── safe_mode_prompts.md
