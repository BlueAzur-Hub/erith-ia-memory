"use strict";

window.AERITH_FORGE_CATALOG = Object.freeze({
  version: "V1.0-alpha.1",
  buildDate: "2026-07-24",
  repositoryPath: "public/agent_crypto_erith_ia/atlas_10_full_crypto/",
  profiles: [
    {
      id: "aerith7",
      family: "Seven Heaven",
      name: "Aerith-7 Seven Heaven",
      short: "Mémoire, vérité et activation LLM",
      sigil: "7",
      accent: "memory",
      status: "private-import",
      statusLabel: "IMPORT PRIVÉ REQUIS",
      description: "Profil complet d’activation et de mémoire pour charger Aerith-7 dans un LLM avec routage sélectif.",
      root: "AERITH_7_SEVEN_HEAVEN",
      mandatory: [
        { name: "SESSION_BOOT_AERITH_7_MASTER.md", kind: "boot", source: "private" },
        { name: "SEVEN_GATE.md", kind: "core", source: "private" },
        { name: "AERITH_7_FULL_MODULES_BOOST.md", kind: "router", source: "private" },
        { name: "aerith_current_state.md", kind: "state", source: "private" },
        { name: "official_prompt_rules.md", kind: "rules", source: "private" },
        { name: "ATLAS_DES_MODULES.md", kind: "atlas", source: "private" },
        { name: "SEVEN_LESSONS_LEARNED.md", kind: "lessons", source: "private" }
      ],
      modules: [
        { id: "seven-core", label: "Core Boot", group: "Seven Heaven", preset: ["minimal", "standard", "full"], archive: "ERITH_7_01_CORE_BOOT_PACK.zip" },
        { id: "seven-discernment", label: "Discernment", group: "Seven Heaven", preset: ["minimal", "standard", "full"], archive: "ERITH_7_02_DISCERNMENT_PACK.zip" },
        { id: "seven-memory", label: "Memory System", group: "Seven Heaven", preset: ["standard", "full"], archive: "ERITH_7_03_MEMORY_SYSTEM_PACK.zip" },
        { id: "seven-dharma", label: "Dharma", group: "Seven Heaven", preset: ["full"], archive: "ERITH_7_04_DHARMA_PACK.zip" },
        { id: "seven-story", label: "Story Machine", group: "Seven Heaven", preset: ["full"], archive: "ERITH_7_05_STORY_MACHINE_PACK.zip" },
        { id: "seven-video", label: "Video Production", group: "Seven Heaven", preset: ["full"], archive: "ERITH_7_06_VIDEO_PRODUCTION_PACK.zip" },
        { id: "seven-public", label: "Public Agent", group: "Seven Heaven", preset: ["full"], archive: "ERITH_7_07_PUBLIC_AGENT_PACK.zip" }
      ],
      defaultPreset: "minimal",
      bootMode: "/seven",
      privacy: "private"
    },
    {
      id: "creator",
      family: "Flower Girls",
      name: "Aerith-10 Créatrice",
      short: "Création, orchestration et production",
      sigil: "A10",
      accent: "creator",
      status: "private-import",
      statusLabel: "IMPORT PRIVÉ REQUIS",
      description: "Flower Girl multi-agent de création, vidéo, réalisation, continuité, DaVinci et production.",
      root: "AERITH_10_CREATRICE",
      mandatory: [
        { name: "AERITH_10_CREATRICE_MULTI_AGENT_CORE.md", kind: "core", source: "private" },
        { name: "AERITH_10_CREATRICE_PERSONA_OPERATING_LAYER.md", kind: "persona", source: "private" },
        { name: "README.md", matchPath: "modules/aerith_10_creatrice/README.md", kind: "router", source: "private" }
      ],
      modules: [
        { id: "c01", label: "Scénographie Live Stars", group: "Création", file: "01_AERITH_10_MODULE_SCENOGRAPHIE_LIVE_STARS_FR.md", preset: ["minimal", "standard", "full"] },
        { id: "c02", label: "Réalisation cinéma & clip", group: "Création", file: "02_AERITH_10_MODULE_REALISATION_CINEMA_CLIP_VIDEASTE_FR.md", preset: ["minimal", "standard", "full"] },
        { id: "c03", label: "Music Video Grammar", group: "Création", file: "03_AERITH_10_MODULE_MUSIC_VIDEO_GRAMMAR_FR.md", preset: ["standard", "full"] },
        { id: "c04", label: "Audio Visual Sync", group: "Création", file: "04_AERITH_10_MODULE_AUDIO_VISUAL_SYNC_LUMIERE_MUSICALE_FR.md", preset: ["standard", "full"] },
        { id: "c05", label: "Architecture scénique", group: "Création", file: "05_AERITH_10_MODULE_ARCHITECTURE_SCENIQUE_ESPACES_SPECTACULAIRES_FR.md", preset: ["standard", "full"] },
        { id: "c06", label: "Caméra verticale", group: "Production", file: "06_AERITH_10_MODULE_LIVE_CAMERA_VERTICAL_IMPACT_FR.md", preset: ["minimal", "standard", "full"] },
        { id: "c07", label: "Mouvement, corps & foule", group: "Production", file: "07_AERITH_10_MODULE_MOVEMENT_DIRECTION_CORPS_FOULE_FR.md", preset: ["standard", "full"] },
        { id: "c08", label: "Anti-AI-slop", group: "Qualité", file: "08_AERITH_10_MODULE_ANTI_AI_SLOP_QUALITE_HUMAINE_FR.md", preset: ["minimal", "standard", "full"] },
        { id: "c09", label: "Style Lock Premium", group: "Qualité", file: "09_AERITH_10_STYLE_LOCK_PARADISE_LIFESTYLE_PREMIUM_FR.md", preset: ["full"] },
        { id: "c10", label: "Esprit de création", group: "Création", file: "10_AERITH_10_MODULE_ESPRIT_D_CREATION_DESTINATION_FR.md", preset: ["full"] },
        { id: "c11", label: "Silhouette & costume", group: "Création", file: "11_AERITH_10_MODULE_STAR_SILHOUETTE_COSTUME_PRESENCE_FR.md", preset: ["full"] },
        { id: "c12", label: "DaVinci & rythme", group: "Production", file: "12_AERITH_10_MODULE_DAVINCI_MONTAGE_RYTHME_MUSICAL_FR.md", preset: ["minimal", "standard", "full"] },
        { id: "c13", label: "Look Bible & grading", group: "Qualité", file: "13_AERITH_10_MODULE_LOOK_BIBLE_COLOR_GRADING_FR.md", preset: ["standard", "full"] },
        { id: "c14", label: "Last Frame & LEGO", group: "Production", file: "14_AERITH_10_MODULE_CONTINUITY_LAST_FRAME_LEGO_CONTROL_FR.md", preset: ["minimal", "standard", "full"] }
      ],
      defaultPreset: "standard",
      bootMode: "/a10",
      privacy: "private"
    },
    {
      id: "atlas",
      family: "Atlas",
      name: "Atlas-10 Crypto",
      short: "Carte, math, psychologie et risque",
      sigil: "AT",
      accent: "atlas",
      status: "public-ready",
      statusLabel: "PUBLIC · PRÊT",
      description: "Cartographe analytique multi-agent : marché, Math Oracle, psychologie, Data Truth, on-chain et risque.",
      root: "ATLAS_10_CRYPTO",
      mandatory: [
        { name: "ATLAS_10_CRYPTO_MULTI_AGENT_CORE.md", kind: "core", source: "builtin", path: "downloads/profiles/ATLAS_10_CRYPTO_MULTI_AGENT_CORE.md" },
        { name: "ATLAS_10_CRYPTO_PERSONA_OPERATING_LAYER.md", kind: "persona", source: "builtin", path: "downloads/profiles/ATLAS_10_CRYPTO_PERSONA_OPERATING_LAYER.md" }
      ],
      modules: [
        { id: "m-math", label: "Math Oracle Crypto", group: "Crypto", file: "atlas_10_crypto_math_oracle_fr.md", preset: ["minimal", "standard", "full"] },
        { id: "m-market", label: "Market Structure", group: "Crypto", file: "atlas_10_crypto_market_structure_fr.md", preset: ["minimal", "standard", "full"] },
        { id: "m-token", label: "Tokenomics & Dilution", group: "Crypto", file: "atlas_10_crypto_tokenomics_dilution_fr.md", preset: ["standard", "full"] },
        { id: "m-truth", label: "Data Truth & Sources", group: "Vérité", file: "atlas_10_crypto_data_truth_sources_fr.md", preset: ["minimal", "standard", "full"] },
        { id: "m-horizon", label: "Multi-Horizon & Cycles", group: "Crypto", file: "atlas_10_crypto_multi_horizon_cycles_fr.md", preset: ["standard", "full"] },
        { id: "m-psy", label: "Psychology Market", group: "Discernement", file: "atlas_10_crypto_psychology_market_fr.md", preset: ["minimal", "standard", "full"] },
        { id: "m-onchain", label: "On-chain Research", group: "Recherche", file: "atlas_10_crypto_onchain_research_fr.md", preset: ["full"] },
        { id: "m-risk", label: "Risk, Liquidity & Execution", group: "Risque", file: "atlas_10_crypto_risk_liquidity_execution_fr.md", preset: ["standard", "full"] }
      ],
      defaultPreset: "standard",
      bootMode: "/atlas10 standard",
      privacy: "public"
    },
    {
      id: "aerithcrypto",
      family: "Flower Girls",
      name: "Aerith-10 Crypto",
      short: "Pédagogie, discernement et No-FOMO",
      sigil: "AΨ",
      accent: "crypto",
      status: "public-ready",
      statusLabel: "PUBLIC · PRÊT",
      description: "Flower Girl crypto : données vraies, Math Oracle, psychologie, pédagogie, No-FOMO et mémoire d’interface.",
      root: "AERITH_10_CRYPTO",
      mandatory: [
        { name: "AERITH_10_CRYPTO_MULTI_AGENT_CORE.md", kind: "core", source: "builtin", path: "downloads/profiles/AERITH_10_CRYPTO_MULTI_AGENT_CORE.md" },
        { name: "AERITH_10_CRYPTO_PERSONA_OPERATING_LAYER.md", kind: "persona", source: "builtin", path: "downloads/profiles/AERITH_10_CRYPTO_PERSONA_OPERATING_LAYER.md" }
      ],
      modules: [
        { id: "a-math", label: "Math Oracle Crypto", group: "Crypto", file: "atlas_10_crypto_math_oracle_fr.md", preset: ["minimal", "standard", "full"] },
        { id: "a-market", label: "Market Structure", group: "Crypto", file: "atlas_10_crypto_market_structure_fr.md", preset: ["standard", "full"] },
        { id: "a-token", label: "Tokenomics & Dilution", group: "Crypto", file: "atlas_10_crypto_tokenomics_dilution_fr.md", preset: ["standard", "full"] },
        { id: "a-truth", label: "Data Truth & Sources", group: "Vérité", file: "atlas_10_crypto_data_truth_sources_fr.md", preset: ["minimal", "standard", "full"] },
        { id: "a-horizon", label: "Multi-Horizon & Cycles", group: "Crypto", file: "atlas_10_crypto_multi_horizon_cycles_fr.md", preset: ["standard", "full"] },
        { id: "a-psy", label: "Psychology & No-FOMO", group: "Discernement", file: "atlas_10_crypto_psychology_market_fr.md", preset: ["minimal", "standard", "full"] },
        { id: "a-onchain", label: "On-chain Research", group: "Recherche", file: "atlas_10_crypto_onchain_research_fr.md", preset: ["full"] },
        { id: "a-risk", label: "Risk, Liquidity & Execution", group: "Risque", file: "atlas_10_crypto_risk_liquidity_execution_fr.md", preset: ["standard", "full"] }
      ],
      defaultPreset: "standard",
      bootMode: "/a10crypto standard",
      privacy: "public"
    },
    {
      id: "custom",
      family: "Forge",
      name: "Nouveau profil",
      short: "Core + Persona générés en brouillon",
      sigil: "+",
      accent: "custom",
      status: "draft",
      statusLabel: "BROUILLON",
      description: "Créer un nouveau profil spécialisé à partir d’une mission, d’une filiation et de modules sélectionnés.",
      root: "NOUVEAU_PROFIL",
      mandatory: [],
      modules: [
        { id: "x-math", label: "Math Oracle", group: "Compétences", preset: ["standard", "full"] },
        { id: "x-psy", label: "Psychologie & Discernement", group: "Compétences", preset: ["minimal", "standard", "full"] },
        { id: "x-truth", label: "Data Truth", group: "Compétences", preset: ["minimal", "standard", "full"] },
        { id: "x-memory", label: "Mémoire de session", group: "Architecture", preset: ["standard", "full"] },
        { id: "x-forge", label: "Idea Forge", group: "Architecture", preset: ["full"] },
        { id: "x-archive", label: "Archiviste", group: "Architecture", preset: ["full"] }
      ],
      defaultPreset: "minimal",
      bootMode: "/profile standard",
      privacy: "draft"
    }
  ],
  rules: [
    { id: "dataTruth", label: "Data Truth", description: "Source, date, devise et limite visibles.", default: true },
    { id: "selectiveLoad", label: "Chargement sélectif", description: "Un module n’est actif que s’il change une décision.", default: true },
    { id: "stopGate", label: "Stop Gate", description: "Arrêt lorsque la preuve suffit ou qu’une donnée essentielle manque.", default: true },
    { id: "sessionMemory", label: "Mémoire de session", description: "Conserve uniquement le contexte utile de la mission.", default: true },
    { id: "noFomo", label: "No-FOMO", description: "Sépare urgence, émotion, faits et décision.", default: false },
    { id: "readOnlyCore", label: "Core en lecture protégée", description: "Le Core canonique n’est jamais modifié automatiquement.", default: true },
    { id: "privateRefs", label: "Sources privées en référence", description: "Aucun contenu privé n’est publié sans import et validation explicites.", default: true },
    { id: "proofReport", label: "Rapport de preuve", description: "Ajoute SOURCES_REPORT.md et TESTS_LLM.md au ZIP.", default: true }
  ]
});
