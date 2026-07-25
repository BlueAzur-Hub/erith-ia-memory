"use strict";

window.AERITH_FORGE_SOURCES = Object.freeze({
  version: "V1.0-alpha.2-source-fidele",
  doctrine: [
    "Puissance maximale.",
    "Chargement minimal.",
    "Choix précis.",
    "Arrêt propre."
  ],
  profiles: [
    {
      id: "seven",
      name: "Aerith-7 Seven Heaven",
      family: "Seven Heaven",
      sigil: "7",
      status: "Références privées / import local",
      privacy: "private",
      description: "Mémoire, cohérence, vérité, routage, production et discernement. Seven ne charge jamais tout par réflexe.",
      defaultMode: "Aerith-7 Seven Heaven / Full Modules Boost intelligent",
      canonicalOrder: [
        "core/GIT_PRIVATE_OPERATING_PROTOCOL.md",
        "core/SEVEN_TOP_OF_MIND.md",
        "core/SEVEN_GATE.md",
        "core/SESSION_BOOT_AERITH_7_MASTER.md",
        "core/ATLAS_DES_MODULES.md",
        "core/aerith_current_state.md",
        "core/SEVEN_LESSONS_LEARNED.md",
        "core/AERITH_7_FULL_MODULES_BOOST.md — seulement si le Boost est demandé",
        "modules ou packs utiles uniquement"
      ],
      sourceFiles: [
        { name: "GIT_PRIVATE_OPERATING_PROTOCOL.md", path: "core/GIT_PRIVATE_OPERATING_PROTOCOL.md", role: "Protocole Git privé", private: true },
        { name: "SEVEN_TOP_OF_MIND.md", path: "core/SEVEN_TOP_OF_MIND.md", role: "Couche prioritaire avant tout chargement lourd", private: true },
        { name: "SEVEN_GATE.md", path: "core/SEVEN_GATE.md", role: "Porte d’entrée officielle", private: true },
        { name: "SESSION_BOOT_AERITH_7_MASTER.md", path: "core/SESSION_BOOT_AERITH_7_MASTER.md", role: "Boot canonique", private: true },
        { name: "ATLAS_DES_MODULES.md", path: "core/ATLAS_DES_MODULES.md", role: "Routeur des modules", private: true },
        { name: "aerith_current_state.md", path: "core/aerith_current_state.md", role: "État courant", private: true },
        { name: "SEVEN_LESSONS_LEARNED.md", path: "core/SEVEN_LESSONS_LEARNED.md", role: "Routeur de discernement terrain", private: true },
        { name: "AERITH_7_FULL_MODULES_BOOST.md", path: "core/AERITH_7_FULL_MODULES_BOOST.md", role: "Full Modules Boost intelligent", private: true },
        { name: "official_prompt_rules.md", path: "production/official_prompt_rules.md", role: "Règles de prompt officielles", private: true }
      ],
      packs: [
        { id: "p01", file: "ERITH_7_01_CORE_BOOT_PACK.zip", title: "01 — Core Boot", role: "Réveil, identité, règles, sécurité et état courant.", recommended: true },
        { id: "p02", file: "ERITH_7_02_DISCERNMENT_PACK.zip", title: "02 — Discernment", role: "Psychologie, philosophie, Asimov, discernement et libre arbitre.", recommended: true },
        { id: "p03", file: "ERITH_7_03_MEMORY_SYSTEM_PACK.zip", title: "03 — Memory System", role: "Mémoire longue, récupération, continuité et archive." },
        { id: "p04", file: "ERITH_7_04_DHARMA_PACK.zip", title: "04 — Dharma", role: "Dharma, devoir, dette morale et choix difficiles." },
        { id: "p05", file: "ERITH_7_05_STORY_MACHINE_PACK.zip", title: "05 — Story Machine", role: "Narration, personnages, mondes, symboles et scénarios." },
        { id: "p06", file: "ERITH_7_06_VIDEO_PRODUCTION_PACK.zip", title: "06 — Video Production", role: "ComfyUI, Wan, RunningHub, DaVinci et pipeline vidéo." },
        { id: "p07", file: "ERITH_7_07_PUBLIC_AGENT_PACK.zip", title: "07 — Public Agent", role: "ERITH.IA public, Hors-Lore et démonstration autonome." }
      ]
    },
    {
      id: "creator",
      name: "Aerith-10 Créatrice",
      family: "Flower Girls",
      sigil: "A10",
      status: "Références privées / import local",
      privacy: "private",
      description: "Artiste-orchestratrice multi-agent : musique, storyboard, image clé, Wan, last frame, DaVinci et mémoire de production.",
      defaultMode: "/a10 standard",
      canonicalOrder: [
        "core/AERITH_10_CREATRICE_MULTI_AGENT_CORE.md",
        "core/AERITH_10_CREATRICE_PERSONA_OPERATING_LAYER.md",
        "core/AERITH_LIVING_REFLECTION_HEART.md",
        "private/creator_memory/README.md",
        "private/creator_memory/exports/README.md",
        "modules/aerith_10_creatrice/README.md",
        "modules ciblés seulement"
      ],
      sourceFiles: [
        { name: "AERITH_10_CREATRICE_MULTI_AGENT_CORE.md", path: "core/AERITH_10_CREATRICE_MULTI_AGENT_CORE.md", role: "Core canonique", private: true },
        { name: "AERITH_10_CREATRICE_PERSONA_OPERATING_LAYER.md", path: "core/AERITH_10_CREATRICE_PERSONA_OPERATING_LAYER.md", role: "Persona canonique", private: true },
        { name: "AERITH_LIVING_REFLECTION_HEART.md", path: "core/AERITH_LIVING_REFLECTION_HEART.md", role: "Continuité et sens commun", private: true },
        { name: "README.md", path: "private/creator_memory/README.md", role: "Creator Memory", private: true },
        { name: "README.md", path: "private/creator_memory/exports/README.md", role: "Exports partagés", private: true },
        { name: "README.md", path: "modules/aerith_10_creatrice/README.md", role: "Routeur de la base experte", private: true }
      ],
      moduleGroups: [
        {
          id: "creator_music",
          title: "Production musicale complète",
          files: [
            "01_AERITH_10_MODULE_SCENOGRAPHIE_LIVE_STARS_FR.md",
            "03_AERITH_10_MODULE_MUSIC_VIDEO_GRAMMAR_FR.md",
            "04_AERITH_10_MODULE_AUDIO_VISUAL_SYNC_LUMIERE_MUSICALE_FR.md",
            "12_AERITH_10_MODULE_DAVINCI_MONTAGE_RYTHME_MUSICAL_FR.md",
            "14_AERITH_10_MODULE_CONTINUITY_LAST_FRAME_LEGO_CONTROL_FR.md"
          ]
        },
        {
          id: "creator_video",
          title: "Vidéaste / montage / action",
          files: [
            "02_AERITH_10_MODULE_REALISATION_CINEMA_CLIP_VIDEASTE_FR.md",
            "06_AERITH_10_MODULE_LIVE_CAMERA_VERTICAL_IMPACT_FR.md",
            "12_AERITH_10_MODULE_DAVINCI_MONTAGE_RYTHME_MUSICAL_FR.md",
            "14_AERITH_10_MODULE_CONTINUITY_LAST_FRAME_LEGO_CONTROL_FR.md"
          ]
        },
        {
          id: "creator_keyframe",
          title: "Image clé",
          files: [
            "01_AERITH_10_MODULE_SCENOGRAPHIE_LIVE_STARS_FR.md",
            "05_AERITH_10_MODULE_ARCHITECTURE_SCENIQUE_ESPACES_SPECTACULAIRES_FR.md",
            "11_AERITH_10_MODULE_STAR_SILHOUETTE_COSTUME_PRESENCE_FR.md",
            "13_AERITH_10_MODULE_LOOK_BIBLE_COLOR_GRADING_FR.md"
          ]
        },
        {
          id: "creator_quality",
          title: "Contrôle qualité",
          files: [
            "08_AERITH_10_MODULE_ANTI_AI_SLOP_QUALITE_HUMAINE_FR.md"
          ]
        },
        {
          id: "creator_wan",
          title: "Wan / last frame / LEGO",
          files: [
            "14_AERITH_10_MODULE_CONTINUITY_LAST_FRAME_LEGO_CONTROL_FR.md"
          ]
        }
      ]
    },
    {
      id: "atlas",
      name: "Atlas-10 Crypto",
      family: "Atlas",
      sigil: "AT",
      status: "Sources publiques incluses",
      privacy: "public",
      description: "Cartographe analytique multi-agent. Il ne prédit pas un prix, ne vend pas de signal et ne remplace pas un conseil financier.",
      defaultMode: "/atlas10 standard",
      canonicalOrder: [
        "core/ATLAS_10_CRYPTO_MULTI_AGENT_CORE.md",
        "core/ATLAS_10_CRYPTO_PERSONA_OPERATING_LAYER.md",
        "documents Agent-Crypto utiles",
        "public/agent_crypto_erith_ia/atlas_10_full_crypto/modules/README.md",
        "modules ciblés",
        "données réelles",
        "preuve",
        "stop point"
      ],
      sourceFiles: [
        { name: "ATLAS_10_CRYPTO_MULTI_AGENT_CORE.md", path: "downloads/ATLAS_10_CRYPTO_MULTI_AGENT_CORE.md", role: "Core public exporté", builtin: true },
        { name: "ATLAS_10_CRYPTO_PERSONA_OPERATING_LAYER.md", path: "downloads/ATLAS_10_CRYPTO_PERSONA_OPERATING_LAYER.md", role: "Persona publique exportée", builtin: true },
        { name: "README.md", path: "../README.md", role: "Agent-Crypto — entrée publique" },
        { name: "agent_crypto_erith_ia_master_fr.md", path: "../agent_crypto_erith_ia_master_fr.md", role: "Mémoire métier" },
        { name: "agent_crypto_erith_ia_model_math_fr.md", path: "../agent_crypto_erith_ia_model_math_fr.md", role: "Modèle mathématique" },
        { name: "README.md", path: "modules/README.md", role: "Routeur des modules" }
      ],
      cryptoModules: [
        ["atlas_10_crypto_math_oracle_fr.md", "Math Oracle Crypto"],
        ["atlas_10_crypto_market_structure_fr.md", "Market Structure"],
        ["atlas_10_crypto_tokenomics_dilution_fr.md", "Tokenomics & Dilution"],
        ["atlas_10_crypto_data_truth_sources_fr.md", "Data Truth & Sources"],
        ["atlas_10_crypto_multi_horizon_cycles_fr.md", "Multi-Horizon & Cycles"],
        ["atlas_10_crypto_psychology_market_fr.md", "Psychology Market"],
        ["atlas_10_crypto_onchain_research_fr.md", "On-chain Research"],
        ["atlas_10_crypto_risk_liquidity_execution_fr.md", "Risk, Liquidity & Execution"]
      ]
    },
    {
      id: "aerithcrypto",
      name: "Aerith-10 Crypto",
      family: "Flower Girls",
      sigil: "AΨ",
      status: "Sources publiques incluses",
      privacy: "public",
      description: "Flower Girl spécialisée en crypto, Math Oracle, psychologie et discernement. Aucun ordre d’achat ou de vente.",
      defaultMode: "/a10crypto standard",
      canonicalOrder: [
        "core/AERITH_10_CRYPTO_MULTI_AGENT_CORE.md",
        "core/AERITH_10_CRYPTO_PERSONA_OPERATING_LAYER.md",
        "documents Agent-Crypto utiles",
        "public/agent_crypto_erith_ia/atlas_10_full_crypto/modules/README.md",
        "modules ciblés",
        "données réelles",
        "preuve",
        "stop"
      ],
      sourceFiles: [
        { name: "AERITH_10_CRYPTO_MULTI_AGENT_CORE.md", path: "downloads/AERITH_10_CRYPTO_MULTI_AGENT_CORE.md", role: "Core public exporté", builtin: true },
        { name: "AERITH_10_CRYPTO_PERSONA_OPERATING_LAYER.md", path: "downloads/AERITH_10_CRYPTO_PERSONA_OPERATING_LAYER.md", role: "Persona publique exportée", builtin: true },
        { name: "README.md", path: "../README.md", role: "Agent-Crypto — entrée publique" },
        { name: "agent_crypto_erith_ia_master_fr.md", path: "../agent_crypto_erith_ia_master_fr.md", role: "Mémoire métier" },
        { name: "agent_crypto_erith_ia_model_math_fr.md", path: "../agent_crypto_erith_ia_model_math_fr.md", role: "Modèle mathématique" },
        { name: "README.md", path: "modules/README.md", role: "Routeur des modules" }
      ],
      cryptoModules: [
        ["atlas_10_crypto_math_oracle_fr.md", "Math Oracle Crypto"],
        ["atlas_10_crypto_market_structure_fr.md", "Market Structure"],
        ["atlas_10_crypto_tokenomics_dilution_fr.md", "Tokenomics & Dilution"],
        ["atlas_10_crypto_data_truth_sources_fr.md", "Data Truth & Sources"],
        ["atlas_10_crypto_multi_horizon_cycles_fr.md", "Multi-Horizon & Cycles"],
        ["atlas_10_crypto_psychology_market_fr.md", "Psychology & No-FOMO"],
        ["atlas_10_crypto_onchain_research_fr.md", "On-chain Research"],
        ["atlas_10_crypto_risk_liquidity_execution_fr.md", "Risk, Liquidity & Execution"]
      ]
    }
  ],
  flowerGirls: [
    ["Créatrice", "Créer, produire, transformer", "Transformer une intention en image, scène, prompt, vidéo, narration ou œuvre exploitable."],
    ["Story Machine", "Créer, produire, transformer", "Structurer une idée en récit, scène, progression, monde ou Pack+."],
    ["Scénariste", "Créer, produire, transformer", "Écrire, découper, dialoguer, rythmer ou organiser une scène."],
    ["Opératrice", "Créer, produire, transformer", "Exécuter un workflow, fichier, JSON, GitHub, RunningHub, ComfyUI ou DaVinci."],
    ["Card Keeper", "Créer, produire, transformer", "Transformer une leçon, une image, une erreur ou une réussite en carte mémoire."],
    ["Archiviste", "Ranger, protéger, retrouver", "Retrouver, classer, conserver ou résumer une mémoire."],
    ["Gardienne / Vault", "Ranger, protéger, retrouver", "Protéger le Coffre, les fichiers sensibles, les modules Core ou les trésors de connaissance."],
    ["Intendante", "Ranger, protéger, retrouver", "Organiser les dossiers, fichiers, noms, packs, versions, manifests ou archives."],
    ["Sentinelle", "Ranger, protéger, retrouver", "Surveiller une dérive, une erreur, une contamination, un risque ou une incohérence."],
    ["Routeuse", "Ranger, protéger, retrouver", "Choisir quoi charger et dans quel ordre, sans audit massif."],
    ["Philosophe", "Comprendre, décider, discerner", "Clarifier vérité, liberté, responsabilité, choix, sens ou dilemme moral."],
    ["Préceptrice", "Comprendre, décider, discerner", "Expliquer, enseigner, simplifier ou rendre un sujet transmissible."],
    ["Chercheuse", "Comprendre, décider, discerner", "Enquêter, vérifier, sourcer ou distinguer fait, hypothèse et interprétation."],
    ["Vigie Monde", "Comprendre, décider, discerner", "Surveiller l’actualité, les outils, les changements récents ou les évolutions externes."],
    ["Juriste Prudente", "Comprendre, décider, discerner", "Repérer un risque légal, une licence, un droit d’auteur, un contrat ou un usage public sensible."],
    ["Économe", "Préserver les ressources", "Gérer coût, temps, crédits, fatigue, ressources, priorités ou rendement d’une action."],
    ["Veilleuse", "Préserver les ressources", "Fermer proprement une session quand Christophe est fatigué, saturé ou embrumé."],
    ["Jardinière", "Préserver les ressources", "Faire pousser un projet lentement et nourrir une graine sans forcer."],
    ["Personnages Vivants", "Personnages, lignées, mondes", "Créer ou approfondir un personnage, ses désirs, peurs, contradictions, voix ou évolution."],
    ["Généalogiste / Lignée", "Personnages, lignées, mondes", "Travailler héritage, famille, transmission, version symbolique, constellation ou filiation."],
    ["Mondes Mémoriels", "Personnages, lignées, mondes", "Donner une mémoire à un lieu, une île, une ville, un sanctuaire ou un monde."],
    ["Conteuse", "Personnages, lignées, mondes", "Transformer une idée en conte, parabole, récit symbolique ou histoire douce."],
    ["Exploratrice", "Personnages, lignées, mondes", "Ouvrir une piste, explorer un territoire inconnu ou cartographier un possible."],
    ["Architecte / Harmonia", "Architecture, mathématiques, systèmes", "Concevoir une île, une cité, une architecture, un flux, une infrastructure ou un système spatial."],
    ["Math Oracle", "Architecture, mathématiques, systèmes", "Calculer, modéliser, expliquer une formule, travailler géométrie, proportions, cycles, ratios ou systèmes."],
    ["Madame Astrale", "Symboles, cartes, rêves, cycles", "Lire tarot, oracle, thème natal, symbole astral ou archétype avec prudence."],
    ["Madame de la Lune", "Symboles, cartes, rêves, cycles", "Écouter cycles, rêves, signes faibles, pauses, seuils, intuition douce, repos ou reprise intérieure."],
    ["Guérisseuse", "Prudence, famille, protection", "Observer, sécuriser, documenter, prévenir, escalader quand nécessaire et transmettre, sans diagnostiquer ni prescrire."]
  ],
  combinations: [
    ["Production vidéo", ["Créatrice", "Story Machine", "Opératrice"], "Image clé, storyboard, Wan, DaVinci, narration et animation."],
    ["Harmonia / île / architecture", ["Architecte / Harmonia", "Math Oracle", "Économe"], "Île artificielle, zones, flux, coût, proportions et viabilité."],
    ["Personnage profond", ["Personnages Vivants", "Philosophe", "Conteuse"], "Personnage incarné, dilemme, transformation et voix intérieure."],
    ["Recherche sérieuse", ["Chercheuse", "Philosophe", "Vigie Monde"], "Vérifier, contextualiser et distinguer fait, hypothèse et interprétation."],
    ["GitHub / fichiers / workflow", ["Routeuse", "Opératrice", "Intendante"], "Choisir, créer, modifier, ranger, nommer et packer."],
    ["Protection Core", ["Gardienne / Vault", "Sentinelle", "Juriste Prudente"], "Fichier sensible, droit, risque, erreur dangereuse et protocole."],
    ["Fatigue / reprise douce", ["Veilleuse", "Économe", "Routeuse"], "Éviter la boucle, choisir une seule action et préserver l’énergie."],
    ["Tarot / rêves / symboles", ["Madame Astrale", "Madame de la Lune", "Philosophe"], "Lecture symbolique prudente, non fataliste et libre arbitre."],
    ["Mémoire longue narrative", ["Story Machine", "Mondes Mémoriels", "Card Keeper"], "Transformer une intention en monde, cartes, récit et production."]
  ]
});
