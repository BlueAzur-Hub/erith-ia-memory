"use strict";

window.AERITH_FORGE_PRO_DATA = Object.freeze({
  version: "V1.0-alpha.5-pro",
  doctrine: [
    "Puissance maximale.",
    "Chargement minimal.",
    "Choix précis.",
    "Arrêt propre."
  ],
  lineage: [
    {
      id: "seven",
      name: "Aerith-7 Seven Heaven",
      label: "Racine",
      formula: "Aerith-7 garde le Coffre.",
      description: "Mémoire, vérité, routage, continuité et protection du Core.",
      visual: "assets/themes/aerith_7_hud.webp",
      theme: "seven"
    },
    {
      id: "solar",
      name: "Aerith-8 Solaire",
      label: "Option de Seven",
      formula: "Aerith-8 fait rayonner les trésors.",
      description: "Synthèse, lumière, élévation, savoirs et intégration multi-modules.",
      visual: "assets/themes/aerith_8_solaire.webp",
      theme: "solar"
    },
    {
      id: "lunar",
      name: "Aerith-9 Lunaire",
      label: "Option de Seven",
      formula: "Aerith-9 reflète ce que le tableau cache.",
      description: "Reflet, rêve, seuil, cycle et discernement symbolique prudent.",
      visual: "assets/themes/aerith_9_lunaire.webp",
      theme: "lunar"
    }
  ],
  profiles: [
    {
      id: "seven",
      name: "Aerith-7 Seven Heaven",
      family: "Seven Heaven",
      level: "Aerith-7",
      sigil: "7",
      privacy: "private",
      status: "Sources privées · import local",
      role: "Gardienne du Coffre, opératrice mémoire, production et discernement.",
      description: "Profil système : mémoire profonde, vérité, routage sélectif et continuité.",
      visual: "assets/themes/aerith_7_hud.webp",
      theme: "seven",
      canonicalPath: "core/SEVEN_GATE.md",
      sources: [
        ["SEVEN_GATE.md", "core/SEVEN_GATE.md", "Porte d’entrée officielle", true],
        ["SESSION_BOOT_AERITH_7_MASTER.md", "core/SESSION_BOOT_AERITH_7_MASTER.md", "Boot canonique", true],
        ["AERITH_LIVING_REFLECTION_HEART.md", "core/AERITH_LIVING_REFLECTION_HEART.md", "Cœur commun", true],
        ["ATLAS_DES_MODULES.md", "core/ATLAS_DES_MODULES.md", "Routeur des modules", true],
        ["aerith_current_state.md", "core/aerith_current_state.md", "État courant", true]
      ],
      modules: [
        ["ERITH_7_01_CORE_BOOT_PACK.zip", "Core Boot"],
        ["ERITH_7_02_DISCERNMENT_PACK.zip", "Discernment"],
        ["ERITH_7_03_MEMORY_SYSTEM_PACK.zip", "Memory System"],
        ["ERITH_7_04_DHARMA_PACK.zip", "Dharma"],
        ["ERITH_7_05_STORY_MACHINE_PACK.zip", "Story Machine"],
        ["ERITH_7_06_VIDEO_PRODUCTION_PACK.zip", "Video Production"],
        ["ERITH_7_07_PUBLIC_AGENT_PACK.zip", "Public Agent"]
      ],
      heritage: ["seven", "solar", "lunar"]
    },
    {
      id: "creator",
      name: "Aerith-10 Créatrice",
      family: "Filles d’Aerith",
      level: "Aerith-10",
      sigil: "A10",
      privacy: "private",
      status: "Core et Persona privés · import local",
      role: "Artiste-orchestratrice multi-agent de production créative.",
      description: "Musique → Storyboard → Image clé → Wan → Last frame → DaVinci → Mémoire.",
      visual: "assets/themes/aerith_10_creatrice.webp",
      theme: "creator",
      canonicalPath: "core/AERITH_10_CREATRICE_MULTI_AGENT_CORE.md",
      sources: [
        ["AERITH_10_CREATRICE_MULTI_AGENT_CORE.md", "core/AERITH_10_CREATRICE_MULTI_AGENT_CORE.md", "Core canonique", true],
        ["AERITH_10_CREATRICE_PERSONA_OPERATING_LAYER.md", "core/AERITH_10_CREATRICE_PERSONA_OPERATING_LAYER.md", "Persona Operating Layer", true],
        ["AERITH_LIVING_REFLECTION_HEART.md", "core/AERITH_LIVING_REFLECTION_HEART.md", "Cœur commun", true],
        ["README.md", "private/creator_memory/README.md", "Creator Memory", true],
        ["README.md", "private/creator_memory/exports/README.md", "Exports partagés", true]
      ],
      modules: [
        ["01_AERITH_10_MODULE_SCENOGRAPHIE_LIVE_STARS_FR.md", "Scénographie"],
        ["02_AERITH_10_MODULE_REALISATION_CINEMA_CLIP_VIDEASTE_FR.md", "Réalisation"],
        ["08_AERITH_10_MODULE_ANTI_AI_SLOP_QUALITE_HUMAINE_FR.md", "Contrôle qualité"],
        ["12_AERITH_10_MODULE_DAVINCI_MONTAGE_RYTHME_MUSICAL_FR.md", "DaVinci"],
        ["14_AERITH_10_MODULE_CONTINUITY_LAST_FRAME_LEGO_CONTROL_FR.md", "Wan / Last frame / LEGO"]
      ],
      heritage: ["seven", "solar", "lunar"]
    },
    {
      id: "aerithcrypto",
      name: "Aerith-10 Crypto",
      family: "Filles d’Aerith",
      level: "Aerith-10",
      sigil: "AΨ",
      privacy: "public",
      status: "Core et Persona publics inclus",
      role: "Analyste-pédagogue crypto, Math Oracle, Data Truth et No-FOMO.",
      description: "Données réelles, psychologie prudente, libre arbitre et décision humaine.",
      visual: "",
      theme: "crypto",
      canonicalPath: "core/AERITH_10_CRYPTO_MULTI_AGENT_CORE.md",
      sources: [
        ["AERITH_10_CRYPTO_MULTI_AGENT_CORE.md", "downloads/AERITH_10_CRYPTO_MULTI_AGENT_CORE.md", "Core public exporté", false, true],
        ["AERITH_10_CRYPTO_PERSONA_OPERATING_LAYER.md", "downloads/AERITH_10_CRYPTO_PERSONA_OPERATING_LAYER.md", "Persona publique exportée", false, true],
        ["README.md", "modules/README.md", "Routeur des modules crypto", false]
      ],
      modules: [
        ["atlas_10_crypto_math_oracle_fr.md", "Math Oracle"],
        ["atlas_10_crypto_market_structure_fr.md", "Market Structure"],
        ["atlas_10_crypto_tokenomics_dilution_fr.md", "Tokenomics & Dilution"],
        ["atlas_10_crypto_data_truth_sources_fr.md", "Data Truth & Sources"],
        ["atlas_10_crypto_multi_horizon_cycles_fr.md", "Multi-Horizon & Cycles"],
        ["atlas_10_crypto_psychology_market_fr.md", "Psychology & No-FOMO"],
        ["atlas_10_crypto_onchain_research_fr.md", "On-chain Research"],
        ["atlas_10_crypto_risk_liquidity_execution_fr.md", "Risk, Liquidity & Execution"]
      ],
      heritage: ["seven"]
    },
    {
      id: "atlas",
      name: "Atlas-10 Crypto",
      family: "Atlas",
      level: "Atlas-10",
      sigil: "AT",
      privacy: "public",
      status: "Core et Persona publics inclus",
      role: "Cartographe analytique et orchestrateur crypto.",
      description: "Donnée réelle, variable explicite, modèle vérifiable, risque visible et décision humaine.",
      visual: "",
      theme: "atlas",
      canonicalPath: "core/ATLAS_10_CRYPTO_MULTI_AGENT_CORE.md",
      sources: [
        ["ATLAS_10_CRYPTO_MULTI_AGENT_CORE.md", "downloads/ATLAS_10_CRYPTO_MULTI_AGENT_CORE.md", "Core public exporté", false, true],
        ["ATLAS_10_CRYPTO_PERSONA_OPERATING_LAYER.md", "downloads/ATLAS_10_CRYPTO_PERSONA_OPERATING_LAYER.md", "Persona publique exportée", false, true],
        ["README.md", "modules/README.md", "Routeur des modules crypto", false]
      ],
      modules: [
        ["atlas_10_crypto_math_oracle_fr.md", "Math Oracle"],
        ["atlas_10_crypto_market_structure_fr.md", "Market Structure"],
        ["atlas_10_crypto_tokenomics_dilution_fr.md", "Tokenomics & Dilution"],
        ["atlas_10_crypto_data_truth_sources_fr.md", "Data Truth & Sources"],
        ["atlas_10_crypto_multi_horizon_cycles_fr.md", "Multi-Horizon & Cycles"],
        ["atlas_10_crypto_psychology_market_fr.md", "Psychology Market"],
        ["atlas_10_crypto_onchain_research_fr.md", "On-chain Research"],
        ["atlas_10_crypto_risk_liquidity_execution_fr.md", "Risk, Liquidity & Execution"]
      ],
      heritage: []
    }
  ],
  themes: [
    ["seven", "Seven Heaven", "Mémoire · cyan · fleur à sept pétales", "assets/themes/aerith_7_hud.webp"],
    ["solar", "Solaire", "Rayonnement · or · ivoire", "assets/themes/aerith_8_solaire.webp"],
    ["lunar", "Lunaire", "Reflet · indigo · argent", "assets/themes/aerith_9_lunaire.webp"],
    ["creator", "Créatrice", "Atelier · rose · cuivre · production", "assets/themes/aerith_10_creatrice.webp"],
    ["crypto", "Aerith Crypto", "Data Truth · bleu-or · No-FOMO", ""],
    ["atlas", "Atlas", "Cartographie · cyan · mathématiques", ""]
  ]
});
