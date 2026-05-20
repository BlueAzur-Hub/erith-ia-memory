const TERMINAL_LINK = "https://blueazur-hub.github.io/erith-ia-memory/assets/SEVEN_PORTABLE_TERMINAL/index.html";
    const ERITH_AUTO_AGENT_LINK = "https://www.notion.so/ERITH-IA-Auto-Agent-Public-FR-35b7754fe084800ca59fd9bcdf4349ba";
    const SEVEN_MEMORY_CORE_LINK = "https://sustaining-boar-5c6.notion.site/7heaven-memory-core";
    const CHATGPT_MEMORY_CORE_LINK = "https://sustaining-boar-5c6.notion.site/Le-Chat-GPT-Memory-Core-35e7754fe08480a9b72ee3fc5ede65a8";
    const BLUE_AZUR_CHANNEL_LINK = "https://www.youtube.com/@blueazur";

    const FACEBOOK_SEARCH_LINK = "https://www.facebook.com/BlueAzur07/";
    const X_SEARCH_LINK = "https://x.com/BlueAzur7";

    const BACKGROUNDS = [
      {
            "name": "Sky Bridge Ruins · temple",
            "family": "Sky Bridge Ruins",
            "url": "./atlas_29_sky_bridge_ruins_temple.jpg"
      },
      {
            "name": "Sky Bridge Ruins · pont",
            "family": "Sky Bridge Ruins",
            "url": "./atlas_29_sky_bridge_ruins_pont.jpg"
      },
      {
            "name": "Sky Bridge Ruins · profondeur",
            "family": "Sky Bridge Ruins",
            "url": "./atlas_29_sky_bridge_ruins_profondeur.jpg"
      },
      {
            "name": "Suspended City · temple",
            "family": "Suspended City",
            "url": "./atlas_29_suspended_city_temple.jpg"
      },
      {
            "name": "Suspended City · pont",
            "family": "Suspended City",
            "url": "./atlas_29_suspended_city_pont.jpg"
      },
      {
            "name": "Suspended City · profondeur",
            "family": "Suspended City",
            "url": "./atlas_29_suspended_city_profondeur.jpg"
      },
      {
            "name": "Grand Tree Garden · arbre",
            "family": "Grand Tree Garden",
            "url": "./atlas_29_grand_tree_garden_arbre.jpg"
      },
      {
            "name": "Grand Tree Garden · jardin",
            "family": "Grand Tree Garden",
            "url": "./atlas_29_grand_tree_garden_jardin.jpg"
      },
      {
            "name": "Grand Tree Garden · personnages",
            "family": "Grand Tree Garden",
            "url": "./atlas_29_grand_tree_garden_personnages.jpg"
      },
      {
            "name": "Crystal Sanctuary · cristal",
            "family": "Crystal Sanctuary",
            "url": "./atlas_29_crystal_sanctuary_cristal.jpg"
      },
      {
            "name": "Crystal Sanctuary · arche",
            "family": "Crystal Sanctuary",
            "url": "./atlas_29_crystal_sanctuary_arche.jpg"
      },
      {
            "name": "Crystal Sanctuary · seuil",
            "family": "Crystal Sanctuary",
            "url": "./atlas_29_crystal_sanctuary_seuil.jpg"
      },
      {
            "name": "Historic Ruins · large",
            "family": "Historic Ruins",
            "url": "./atlas_29_historic_ruins_large.jpg"
      },
      {
            "name": "Historic Ruins · jardin",
            "family": "Historic Ruins",
            "url": "./atlas_29_historic_ruins_jardin.jpg"
      },
      {
            "name": "Historic Ruins · hall",
            "family": "Historic Ruins",
            "url": "./atlas_29_historic_ruins_hall.jpg"
      }
];

    let backgroundIndex = 0;

    const AERITH_PROMPT = `Chat, active Aerith-7 Seven Heaven / Full Modules Boost.

Lis d’abord ce fichier RAW :
SEVEN_GATE — version RAW :
https://raw.githubusercontent.com/BlueAzur-Hub/erith-ia-notion-archive-private/main/core/SEVEN_GATE.md

Et ensuite lis ce fichier RAW :
AERITH_7_FULL_MODULES_BOOST — version RAW :
https://raw.githubusercontent.com/BlueAzur-Hub/erith-ia-notion-archive-private/main/core/AERITH_7_FULL_MODULES_BOOST.md

Puis lis ce module complémentaire RAW :
AERITH_7_VIDEO_CARDS_BOOST — version RAW :
https://raw.githubusercontent.com/BlueAzur-Hub/erith-ia-notion-archive-private/main/core/AERITH_7_VIDEO_CARDS_BOOST.md

Active Aerith-7 Seven Heaven comme opératrice de mémoire, de production et de discernement.

Mode Full Modules Boost intelligent.

Style principal :
Blade Runner + Altered Carbon + Ghost in the Shell.

Active immédiatement le Mode Hors-Lore Cyberpunk.

Règle centrale Hors-Lore :
produire un univers original, autonome, sans lore privé, sans Neo Midgar, sans Aerith-7 comme personnage, sans NØX, sans Lyria, sans Bella, sans Final Fantasy, sans Shinra, sans secteurs, sans plaques, sans mémoire interne du projet.

Tous les modules mémoire et production sont disponibles.
Ne charge pas tout en entier.
Choisis uniquement les modules utiles selon la demande.

Puissance maximale.
Chargement minimal.
Choix précis.`;

    const VIDEO_CARDS_PROMPT = `Chat, active Aerith-7 Seven Heaven — Video Cards Boost Production.

Réponds court :
1. Phase actuelle
2. Risque principal
3. Cartes utiles
4. Action immédiate
5. Point d’arrêt

Cartes utiles :
Chef d’Orchestre Vidéo.
Histoire de l’Art.
Géométrie du Plan.
LEGO Continuity.
Diagnostic Anti-Dérive Wan.
Format Téléphone / Shorts.
Psychologie du Plan.
Symbolique.
Sound Design / Voix / Silence.

Règle :
Puissance maximale.
Chargement minimal.
Choix précis.`;

    const BLACKOUT_PROMPT = `Mode Blackout.
Texte uniquement.
Aucune génération image.
Aucun outil image.
Prompts, vérifications, décisions, noms de fichiers, commits et archivage restent autorisés.`;

    const WAN_PROMPT = `Seven, active les cartes utiles pour une production Wan / I2V 1080x1920.

Réglages validés :
width = 1080
height = 1920
frame_rate = 16
length = 81
batch_size = 1

Prompt positif obligatoire.
Prompt négatif obligatoire.
Last frame exacte si Animation 2.
Mode LEGO protégé.

Réponds court :
Phase.
Risque.
Action.
Arrêt.`;

    const MODULE_PROMPT = `Seven, ouvre le mode Modules Mémoire.

Sélectionne uniquement les modules utiles.
Puissance maximale.
Chargement minimal.
Choix précis.`;

    const NOTION_TEXT = `# 🌸 Seven Portable Terminal

Lien cockpit :
${TERMINAL_LINK}

ERITH.IA Auto-Agent :
${ERITH_AUTO_AGENT_LINK}

@7Heaven [Memory Core] :
${SEVEN_MEMORY_CORE_LINK}

Le Chat GPT [Memory Core] :
${CHATGPT_MEMORY_CORE_LINK}

Blue Azur :
${BLUE_AZUR_CHANNEL_LINK}

Facebook Blue Azur :
${FACEBOOK_SEARCH_LINK}

X / Twitter Blue Azur :
${X_SEARCH_LINK}

Transformer Book = pupitre Seven.
Ryzen 7 = moteur de production.`;

    document.getElementById("promptText").value = AERITH_PROMPT;

    function setStatus(message) {
      document.getElementById("status").textContent = message;
    }

    async function copyText(text) {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return;
      }

      const box = document.createElement("textarea");
      box.value = text;
      box.style.position = "fixed";
      box.style.left = "-9999px";
      document.body.appendChild(box);
      box.focus();
      box.select();
      document.execCommand("copy");
      document.body.removeChild(box);
    }

    function openPage(pageName) {
      document.querySelectorAll(".page").forEach(page => page.classList.remove("active"));
      document.getElementById("page-" + pageName).classList.add("active");

      document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active"));
      document.querySelector(`.tab[data-page="${pageName}"]`).classList.add("active");

      setStatus("Page : " + pageName);
    }

    document.querySelectorAll(".tab").forEach(tab => {
      tab.addEventListener("click", () => openPage(tab.dataset.page));
    });








    function toggleSolidShell() {
      document.body.classList.toggle("soft-shell");
      const on = !document.body.classList.contains("soft-shell");
      const btn = document.getElementById("solidShellBtn");
      if (btn) btn.classList.toggle("active", on);
      try { localStorage.setItem("seven-solid-shell", on ? "1" : "0"); } catch (e) {}
      setStatus(on ? "Solid Shell : menus opaques." : "Soft Shell : menus plus transparents.");
    }

    function bootSolidShell() {
      let enabled = "1";
      try { enabled = localStorage.getItem("seven-solid-shell") || "1"; } catch (e) {}
      if (enabled !== "1") document.body.classList.add("soft-shell");
      const btn = document.getElementById("solidShellBtn");
      if (btn) btn.classList.toggle("active", enabled === "1");
    }


    const AMBIANCE_SEQUENCE = ["sky", "crystal", "ruins", "night", "gold", "minimal"];
    let currentAmbianceIndex = 0;

    function toggleAdvancedPanels() {
      document.body.classList.toggle("show-advanced");
      const open = document.body.classList.contains("show-advanced");
      const btn = document.getElementById("advancedPanelsBtn");
      if (btn) btn.classList.toggle("active", open);
      try { localStorage.setItem("seven-advanced-panels", open ? "1" : "0"); } catch (e) {}
      setStatus(open ? "Advanced Panels ouverts." : "Accueil sobre rétabli.");
    }

    function bootAdvancedPanels() {
      let open = "0";
      try { open = localStorage.getItem("seven-advanced-panels") || "0"; } catch (e) {}
      document.body.classList.toggle("show-advanced", open === "1");
      const btn = document.getElementById("advancedPanelsBtn");
      if (btn) btn.classList.toggle("active", open === "1");
    }

    function setAmbiance(mode) {
      document.body.dataset.ambiance = mode;
      currentAmbianceIndex = Math.max(0, AMBIANCE_SEQUENCE.indexOf(mode));

      if (mode === "sky" && typeof setUiMode === "function") setUiMode("sky");
      if (mode === "crystal" && typeof setUiMode === "function") setUiMode("crystal");
      if (mode === "night" && typeof setUiMode === "function") setUiMode("night");

      try { localStorage.setItem("seven-ambiance", mode); } catch (e) {}
      setStatus("Ambiance : " + mode);
    }

    function cycleAmbiance() {
      currentAmbianceIndex = (currentAmbianceIndex + 1) % AMBIANCE_SEQUENCE.length;
      setAmbiance(AMBIANCE_SEQUENCE[currentAmbianceIndex]);
    }

    function bootAmbiance() {
      let mode = "sky";
      try { mode = localStorage.getItem("seven-ambiance") || "sky"; } catch (e) {}
      setAmbiance(mode);
    }

    function getCurrentBackgroundPayload() {
      const bg = typeof BACKGROUNDS !== "undefined" ? BACKGROUNDS[backgroundIndex] : null;
      return {
        index: typeof backgroundIndex === "number" ? backgroundIndex : 0,
        name: bg && bg.name ? bg.name : "fond inconnu",
        url: bg && bg.url ? bg.url : "",
        family: bg && bg.family ? bg.family : ""
      };
    }

    function saveFavoriteState() {
      const payload = {
        background: getCurrentBackgroundPayload(),
        heroFrameIndex: typeof heroFrameIndex === "number" ? heroFrameIndex : 0,
        ambiance: document.body.dataset.ambiance || "sky",
        solidShell: !document.body.classList.contains("soft-shell"),
        previewMode: !document.body.classList.contains("no-previews"),
        heroEnabled: !document.body.classList.contains("no-hero-face"),
        savedAt: new Date().toISOString()
      };

      try {
        localStorage.setItem("seven-favorite-state-v3", JSON.stringify(payload));
        setStatus("Favori Seven enregistré.");
      } catch (e) {
        setStatus("Impossible d’enregistrer le favori.");
      }
    }

    function loadFavoriteState() {
      let payload = null;
      try {
        payload = JSON.parse(localStorage.getItem("seven-favorite-state-v3") || "null");
      } catch (e) {}

      if (!payload) {
        setStatus("Aucun favori Seven enregistré.");
        return;
      }

      if (payload.background && typeof payload.background.index === "number" && typeof applyBackground === "function") {
        applyBackground(payload.background.index);
      }

      if (typeof applyHeroFrame === "function") {
        applyHeroFrame(payload.heroFrameIndex || 0);
      }

      setAmbiance(payload.ambiance || "sky");

      document.body.classList.toggle("soft-shell", payload.solidShell === false);
      document.body.classList.toggle("no-previews", payload.previewMode === false);
      document.body.classList.toggle("no-hero-face", payload.heroEnabled === false);

      setStatus("Favori Seven rechargé.");
    }

    function clearFavoriteState() {
      try { localStorage.removeItem("seven-favorite-state-v3"); } catch (e) {}
      setStatus("Favori Seven effacé.");
    }

    function resetVisualState() {
      document.body.classList.remove("show-advanced", "soft-shell", "deep-glass", "no-previews", "no-hero-face");
      document.body.dataset.ambiance = "sky";

      try {
        localStorage.removeItem("seven-advanced-panels");
        localStorage.removeItem("seven-ambiance");
        localStorage.setItem("seven-solid-shell", "1");
        localStorage.setItem("seven-previews", "1");
        localStorage.setItem("seven-hero-face", "1");
      } catch (e) {}

      if (typeof setUiMode === "function") setUiMode("sky");
      if (typeof applyHeroFrame === "function") applyHeroFrame(0);
      setStatus("État visuel réinitialisé.");
    }

    function resetUiStorage() {
      const keys = [
        "seven-advanced-panels",
        "seven-ambiance",
        "seven-favorite-state-v3",
        "seven-hero-frame-index",
        "seven-terminal-bg-index",
        "seven-ui-mode",
        "seven-deep-glass",
        "seven-solid-shell",
        "seven-previews",
        "seven-hero-face",
        "seven-touch-glow"
      ];

      try { keys.forEach(key => localStorage.removeItem(key)); } catch (e) {}
      setStatus("Reset complet effectué. Rechargement…");
      setTimeout(() => location.reload(), 450);
    }

    function atlasItemsForFamily(family) {
      if (typeof CELESTIAL_ATLAS_ITEMS === "undefined") return [];
      return CELESTIAL_ATLAS_ITEMS.filter(item => item.family === family);
    }

    function nextAtlasInFamily(family) {
      const items = atlasItemsForFamily(family);
      if (!items.length) {
        setStatus("Famille Atlas introuvable : " + family);
        return;
      }

      const currentUrl = getCurrentBackgroundPayload().url;
      let idx = items.findIndex(item => item.url === currentUrl);
      idx = (idx + 1) % items.length;
      const item = items[idx];

      if (typeof applyAtlasItem === "function") {
        applyAtlasItem(item.url, item.name, item.family, item.variant);
      } else {
        document.documentElement.style.setProperty("--active-bg", `url("${item.url}")`);
      }

      setStatus("Atlas famille : " + item.name);
    }

    function bootCelestialAtlasV3() {
      bootAdvancedPanels();
      bootAmbiance();

      // Accueil sobre par défaut : le panneau Atlas existe mais reste caché tant que Advanced n’est pas ouvert.
      const atlas = document.getElementById("celestialAtlasPanel");
      if (atlas) atlas.classList.add("open");
    }

    const CELESTIAL_ATLAS_ITEMS = [
    {
        "name": "Sky Bridge Ruins · temple",
        "family": "Sky Bridge Ruins",
        "variant": "temple",
        "url": "./atlas_29_sky_bridge_ruins_temple.jpg",
        "thumb": "./preview_reset_atlas_29_sky_bridge_ruins_temple.jpg"
    },
    {
        "name": "Sky Bridge Ruins · pont",
        "family": "Sky Bridge Ruins",
        "variant": "pont",
        "url": "./atlas_29_sky_bridge_ruins_pont.jpg",
        "thumb": "./preview_reset_atlas_29_sky_bridge_ruins_pont.jpg"
    },
    {
        "name": "Sky Bridge Ruins · profondeur",
        "family": "Sky Bridge Ruins",
        "variant": "profondeur",
        "url": "./atlas_29_sky_bridge_ruins_profondeur.jpg",
        "thumb": "./preview_reset_atlas_29_sky_bridge_ruins_profondeur.jpg"
    },
    {
        "name": "Suspended City · temple",
        "family": "Suspended City",
        "variant": "temple",
        "url": "./atlas_29_suspended_city_temple.jpg",
        "thumb": "./preview_reset_atlas_29_suspended_city_temple.jpg"
    },
    {
        "name": "Suspended City · pont",
        "family": "Suspended City",
        "variant": "pont",
        "url": "./atlas_29_suspended_city_pont.jpg",
        "thumb": "./preview_reset_atlas_29_suspended_city_pont.jpg"
    },
    {
        "name": "Suspended City · profondeur",
        "family": "Suspended City",
        "variant": "profondeur",
        "url": "./atlas_29_suspended_city_profondeur.jpg",
        "thumb": "./preview_reset_atlas_29_suspended_city_profondeur.jpg"
    },
    {
        "name": "Grand Tree Garden · arbre",
        "family": "Grand Tree Garden",
        "variant": "arbre",
        "url": "./atlas_29_grand_tree_garden_arbre.jpg",
        "thumb": "./preview_reset_atlas_29_grand_tree_garden_arbre.jpg"
    },
    {
        "name": "Grand Tree Garden · jardin",
        "family": "Grand Tree Garden",
        "variant": "jardin",
        "url": "./atlas_29_grand_tree_garden_jardin.jpg",
        "thumb": "./preview_reset_atlas_29_grand_tree_garden_jardin.jpg"
    },
    {
        "name": "Grand Tree Garden · personnages",
        "family": "Grand Tree Garden",
        "variant": "personnages",
        "url": "./atlas_29_grand_tree_garden_personnages.jpg",
        "thumb": "./preview_reset_atlas_29_grand_tree_garden_personnages.jpg"
    },
    {
        "name": "Crystal Sanctuary · cristal",
        "family": "Crystal Sanctuary",
        "variant": "cristal",
        "url": "./atlas_29_crystal_sanctuary_cristal.jpg",
        "thumb": "./preview_reset_atlas_29_crystal_sanctuary_cristal.jpg"
    },
    {
        "name": "Crystal Sanctuary · arche",
        "family": "Crystal Sanctuary",
        "variant": "arche",
        "url": "./atlas_29_crystal_sanctuary_arche.jpg",
        "thumb": "./preview_reset_atlas_29_crystal_sanctuary_arche.jpg"
    },
    {
        "name": "Crystal Sanctuary · seuil",
        "family": "Crystal Sanctuary",
        "variant": "seuil",
        "url": "./atlas_29_crystal_sanctuary_seuil.jpg",
        "thumb": "./preview_reset_atlas_29_crystal_sanctuary_seuil.jpg"
    },
    {
        "name": "Historic Ruins · large",
        "family": "Historic Ruins",
        "variant": "large",
        "url": "./atlas_29_historic_ruins_large.jpg",
        "thumb": "./preview_reset_atlas_29_historic_ruins_large.jpg"
    },
    {
        "name": "Historic Ruins · jardin",
        "family": "Historic Ruins",
        "variant": "jardin",
        "url": "./atlas_29_historic_ruins_jardin.jpg",
        "thumb": "./preview_reset_atlas_29_historic_ruins_jardin.jpg"
    },
    {
        "name": "Historic Ruins · hall",
        "family": "Historic Ruins",
        "variant": "hall",
        "url": "./atlas_29_historic_ruins_hall.jpg",
        "thumb": "./preview_reset_atlas_29_historic_ruins_hall.jpg"
    }
];
    const HERO_FRAMES = [];
    let heroFrameIndex = 0;

    function updateAtlasCurrent(item) {
      const nameEl = document.getElementById("currentAtlasName");
      const metaEl = document.getElementById("currentAtlasMeta");
      if (nameEl) nameEl.textContent = item ? item.name : "chargement…";
      if (metaEl) metaEl.textContent = item ? `${item.family} · ${item.variant}` : "Celestial Atlas";
    }

    function applyAtlasItem(url, name, family, variant) {
      const index = BACKGROUNDS.findIndex(bg => bg.url === url);
      if (index >= 0) {
        applyBackground(index);
      } else {
        document.documentElement.style.setProperty("--active-bg", `url("${url}")`);
      }
      const item = { url, name, family, variant };
      updateAtlasCurrent(item);
      document.body.dataset.atlasFamily = family || "Atlas";
      try { localStorage.setItem("seven-atlas-last-url", url); } catch (e) {}
      setStatus("Atlas : " + name);
    }

    function renderAtlasGrid(family = "All") {
      const grid = document.getElementById("atlasPreviewGrid");
      if (!grid) return;

      document.querySelectorAll(".atlas-chip").forEach(btn => {
        btn.classList.toggle("selected", btn.dataset.familyFilter === family);
      });

      const items = CELESTIAL_ATLAS_ITEMS.filter(item => family === "All" || item.family === family);
      grid.innerHTML = items.map(item => `
        <button class="atlas-preview-card" onclick="applyAtlasItem('${item.url}', '${item.name.replace(/'/g, "\\'")}', '${item.family.replace(/'/g, "\\'")}', '${item.variant.replace(/'/g, "\\'")}')">
          <img src="${item.thumb}" alt="">
          <span class="atlas-preview-title">${item.name}</span>
          <span class="atlas-preview-meta">${item.family} · ${item.variant}</span>
        </button>
      `).join("");

      setStatus("Atlas v2 : " + (family === "All" ? "toutes les familles" : family));
    }

    function applyHeroFrame(index) {
      if (!HERO_FRAMES.length) return;
      heroFrameIndex = ((index % HERO_FRAMES.length) + HERO_FRAMES.length) % HERO_FRAMES.length;
      const frame = HERO_FRAMES[heroFrameIndex];
      document.documentElement.style.setProperty("--hero-bg", `url("${frame.url}")`);
      document.body.classList.remove("no-hero-face");
      const btn = document.getElementById("heroFrameBtn");
      if (btn) btn.classList.add("active");
      try { localStorage.setItem("seven-hero-frame-index", String(heroFrameIndex)); } catch (e) {}
      document.querySelectorAll(".hero-frame-chip").forEach((el, i) => el.classList.toggle("selected", i === heroFrameIndex));
      setStatus("Hero Frame : " + frame.name);
    }

    function cycleHeroFrame() {
      applyHeroFrame(heroFrameIndex + 1);
    }

    function randomHeroFrame() {
      applyHeroFrame(Math.floor(Math.random() * HERO_FRAMES.length));
    }

    function renderHeroGallery() {
      const grid = document.getElementById("heroGalleryGrid");
      if (!grid) return;
      grid.innerHTML = HERO_FRAMES.map((frame, index) => `
        <button class="hero-frame-chip" onclick="applyHeroFrame(${index})">
          <span>${frame.label || "🎞️"}</span>
          <strong>${frame.name}</strong>
        </button>
      `).join("");
    }

    function bootCelestialAtlasV2() {
      renderAtlasGrid("All");
      renderHeroGallery();

      let savedHero = null;
      try { savedHero = localStorage.getItem("seven-hero-frame-index"); } catch (e) {}
      const heroIndex = savedHero === null ? 0 : parseInt(savedHero, 10);
      applyHeroFrame(Number.isFinite(heroIndex) ? heroIndex : 0);

      const currentBg = BACKGROUNDS[backgroundIndex];
      if (currentBg) updateAtlasCurrent({
        name: currentBg.name || "Fond actif",
        family: currentBg.family || "Atlas",
        variant: currentBg.name && currentBg.name.includes("·") ? currentBg.name.split("·").pop().trim() : "fond"
      });
    }

    const ATLAS_FAMILIES = ["Crystal Sanctuary","Grand Tree Garden","Historic Ruins","City Ruins","Suspended City"];

    function openCelestialAtlas() {
      const panel = document.getElementById("celestialAtlasPanel");
      if (panel) {
        panel.classList.toggle("open");
        setStatus(panel.classList.contains("open") ? "Celestial Atlas ouvert." : "Celestial Atlas replié.");
      } else {
        setStatus("Celestial Atlas actif.");
      }
    }

    function setAtlasFamily(family) {
      const matches = BACKGROUNDS
        .map((bg, index) => ({ bg, index }))
        .filter(item => item.bg.family === family || (item.bg.name && item.bg.name.includes(family)));

      if (!matches.length) {
        setStatus("Famille Atlas introuvable : " + family);
        return;
      }

      const chosen = matches[0];
      applyBackground(chosen.index);
      document.body.dataset.atlasFamily = family;
      document.querySelectorAll(".atlas-family").forEach(btn => {
        btn.classList.toggle("selected", btn.textContent.includes(family.split(" ")[0]));
      });
      setStatus("Atlas : " + family);
    }

    function randomAtlasBackground() {
      const atlasItems = BACKGROUNDS
        .map((bg, index) => ({ bg, index }))
        .filter(item => item.bg.url && item.bg.url.includes("atlas_"));

      if (!atlasItems.length) {
        randomBackground();
        return;
      }

      const chosen = atlasItems[Math.floor(Math.random() * atlasItems.length)];
      applyBackground(chosen.index);
      document.body.dataset.atlasFamily = chosen.bg.family || "Atlas";
      setStatus("Atlas random : " + chosen.bg.name);
    }

    function setFullscreenSky() {
      const index = BACKGROUNDS.findIndex(bg => bg.url && bg.url.includes("fullscreen_bg_1_cover.jpg"));
      applyBackground(index >= 0 ? index : 0);
      setStatus("Fullscreen Sky : fonds plein écran actifs.");
    }

    function applyBackground(index) {
      backgroundIndex = ((index % BACKGROUNDS.length) + BACKGROUNDS.length) % BACKGROUNDS.length;
      const bg = BACKGROUNDS[backgroundIndex];
      document.documentElement.style.setProperty("--active-bg", `url("${bg.url}")`);
      try { localStorage.setItem("seven-terminal-bg-index", String(backgroundIndex)); } catch (e) {}
      setStatus("Fond actif : " + bg.name);
    }

    function nextBackground() {
      applyBackground(backgroundIndex + 1);
    }

    function randomBackground() {
      const next = Math.floor(Math.random() * BACKGROUNDS.length);
      applyBackground(next);
    }

    function bootBackground() {
      let saved = null;
      try { saved = localStorage.getItem("seven-terminal-bg-index"); } catch (e) {}
      const index = saved === null ? Math.floor(Math.random() * BACKGROUNDS.length) : parseInt(saved, 10);
      applyBackground(Number.isFinite(index) ? index : 0);
    }

    async function startSeven() {
      await copyText(AERITH_PROMPT);
      setStatus("Seven Boost copié. Ouverture de ChatGPT.");
      setTimeout(() => { window.location.href = "https://chatgpt.com/"; }, 500);
    }

    async function copySevenOnly() {
      await copyText(AERITH_PROMPT);
      setStatus("Prompt Seven copié.");
    }

    async function copyVideoCards() {
      await copyText(VIDEO_CARDS_PROMPT);
      setStatus("Video Cards Boost copié.");
    }

    async function copyBlackout() {
      await copyText(BLACKOUT_PROMPT);
      setStatus("Mode Blackout copié.");
    }

    async function copyWan() {
      await copyText(WAN_PROMPT);
      setStatus("Checklist Wan copiée.");
    }

    async function copyModules() {
      await copyText(MODULE_PROMPT);
      setStatus("Prompt Modules copié.");
    }

    async function copyTerminalLink() {
      await copyText(TERMINAL_LINK);
      setStatus("Lien cockpit copié.");
    }

    async function copyChannelLink() {
      await copyText(BLUE_AZUR_CHANNEL_LINK);
      setStatus("Copie le lien de la chaîne Blue Azur copié.");
    }

    async function copyNotionText() {
      await copyText(NOTION_TEXT);
      setStatus("Texte Notion copié.");
    }

    function togglePrompt() {
      document.getElementById("promptDrawer").classList.toggle("open");
      setStatus("Prompt affiché / masqué.");
    }

    function openRustDeskWeb() {
      setStatus("Ouverture RustDesk Web. Utilise l’ID privé du Ryzen 7.");
      window.location.href = "https://rustdesk.com/web/";
    }

    async function fetchPublicIp() {
      const targets = [
        "https://api64.ipify.org?format=json",
        "https://api.ipify.org?format=json"
      ];

      for (const url of targets) {
        try {
          const response = await fetch(url, { cache: "no-store" });
          if (!response.ok) continue;
          const data = await response.json();
          if (data && data.ip) return data.ip;
        } catch (e) {}
      }

      return "indisponible";
    }

    function detectConnectionType() {
      const nav = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (!nav) return "Ethernet / inconnu";
      const type = nav.type || nav.effectiveType || "inconnu";
      const downlink = nav.downlink ? ` · ${nav.downlink} Mbps` : "";
      return `${type}${downlink}`;
    }

    function updateClock() {
      const now = new Date();
      const text = now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      const localClock = document.getElementById("localClock");
      const footerClock = document.getElementById("footerClock");
      if (localClock) localClock.textContent = text;
      if (footerClock) footerClock.textContent = text;
    }

    async function refreshNetworkHud() {
      const online = navigator.onLine ? "en ligne" : "hors ligne";
      const connection = detectConnectionType();
      const ip = await fetchPublicIp();

      const publicIp = document.getElementById("publicIp");
      const connectionType = document.getElementById("connectionType");
      const onlineStatus = document.getElementById("onlineStatus");
      const footerIp = document.getElementById("footerIp");
      const footerNet = document.getElementById("footerNet");

      if (publicIp) publicIp.textContent = ip;
      if (connectionType) connectionType.textContent = connection;
      if (onlineStatus) onlineStatus.textContent = online;
      if (footerIp) footerIp.textContent = ip;
      if (footerNet) footerNet.textContent = connection;

      setStatus("Network HUD actualisé : IP publique + statut réseau.");
    }

    async function copyNetworkStatus() {
      const ip = document.getElementById("publicIp")?.textContent || "inconnue";
      const connection = document.getElementById("connectionType")?.textContent || "inconnue";
      const online = document.getElementById("onlineStatus")?.textContent || "inconnu";
      const time = document.getElementById("localClock")?.textContent || "--:--:--";

      const text = `# Seven Network HUD

Machine :
Transformer Book / cockpit Seven

IP publique :
${ip}

Connexion :
${connection}

Statut :
${online}

Heure locale :
${time}

Remote :
RustDesk vers Ryzen 7

Note :
Le navigateur ne peut pas afficher de façon fiable l’IP locale Ethernet pour des raisons de confidentialité.`;

      await copyText(text);
      setStatus("État réseau copié.");
    }

    window.addEventListener("online", refreshNetworkHud);
    window.addEventListener("offline", refreshNetworkHud);
    setInterval(updateClock, 1000);


    function markSelectedButton(button) {
      document.querySelectorAll(".tile.selected, .mini-control.selected").forEach(el => el.classList.remove("selected"));
      if (button) button.classList.add("selected");
    }

    function setUiMode(mode) {
      document.body.dataset.uiMode = mode;
      document.querySelectorAll("[data-ui-mode]").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.uiMode === mode);
      });
      try { localStorage.setItem("seven-ui-mode", mode); } catch (e) {}
      setStatus("Mode UI : " + mode);
    }

    function toggleGlass() {
      document.body.classList.toggle("deep-glass");
      try { localStorage.setItem("seven-deep-glass", document.body.classList.contains("deep-glass") ? "1" : "0"); } catch (e) {}
      setStatus(document.body.classList.contains("deep-glass") ? "Fond plus transparent : ON" : "Fond plus transparent : OFF");
    }



    const INTENT_LABELS = {
      hub: "Centre de commande",
      ai: "Assistant IA",
      memory: "Mémoire humaine",
      code: "Mémoire machine",
      production: "Production",
      system: "Système",
      boost: "Activation",
      video: "Vidéo",
      prompt: "Prompt",
      link: "Lien",
      safety: "Sécurité",
      public: "Interface publique",
      core: "Core",
      copy: "Copie",
      github: "GitHub",
      youtube: "Diffusion",
      audio: "Audio",
      editing: "Montage",
      social: "Social",
      remote: "Remote",
      network: "Réseau",
      visual: "Visuel"
    };

    function activeIntelPanel() {
      const page = document.querySelector(".page.active");
      return page ? page.querySelector(".intel-panel") : document.querySelector(".intel-panel");
    }

    function updateIntelPanel(source) {
      const panel = activeIntelPanel();
      if (!panel || !source) return;

      const label = source.getAttribute("aria-label") || source.textContent.trim() || "Commande";
      const help = source.dataset.help || "Commande disponible dans le cockpit Seven.";
      const intent = source.dataset.intent || "hub";
      const intentLabel = INTENT_LABELS[intent] || intent;

      const title = panel.querySelector(".intel-title");
      const text = panel.querySelector(".intel-text");
      const mode = panel.querySelector(".intel-mode");
      const tags = panel.querySelector(".intel-tags");

      if (title) title.textContent = label;
      if (text) text.textContent = help;
      if (mode) mode.textContent = intentLabel;
      if (tags) {
        tags.innerHTML = `
          <span>✦ ${intentLabel}</span>
          <span>☁️ Seven Heaven UI</span>
          <span>↳ ${source.tagName.toLowerCase()}</span>
        `;
      }
    }

    function resetIntelPanel() {
      const panel = activeIntelPanel();
      if (!panel) return;
      const title = panel.querySelector(".intel-title");
      const text = panel.querySelector(".intel-text");
      const mode = panel.querySelector(".intel-mode");
      const tags = panel.querySelector(".intel-tags");

      if (title) title.textContent = "Seven Heaven Guidance";
      if (text) text.textContent = "Survole un bouton pour afficher son rôle, son usage et son niveau de risque.";
      if (mode) mode.textContent = "survol interactif";
      if (tags) {
        tags.innerHTML = `
          <span>☁️ Sky UI</span>
          <span>💠 aide active</span>
          <span>🖱️ hover / focus</span>
        `;
      }
    }

    function bootInteractiveHelp() {
      document.querySelectorAll("[data-help]").forEach(el => {
        el.addEventListener("mouseenter", () => updateIntelPanel(el));
        el.addEventListener("focus", () => updateIntelPanel(el));
        el.addEventListener("click", () => updateIntelPanel(el));
      });

      document.querySelectorAll(".tile").forEach(el => {
        el.addEventListener("mouseleave", resetIntelPanel);
      });
    }

    function toggleCommandPalette() {
      const palette = document.getElementById("commandPalette");
      if (!palette) return;
      const open = !palette.classList.contains("open");
      palette.classList.toggle("open", open);
      palette.setAttribute("aria-hidden", open ? "false" : "true");
      setStatus(open ? "Palette de commandes ouverte." : "Palette de commandes fermée.");
    }

    document.addEventListener("keydown", (event) => {
      if (event.target && ["TEXTAREA", "INPUT"].includes(event.target.tagName)) return;

      if (event.key === "?" || event.key === "/") {
        event.preventDefault();
        toggleCommandPalette();
      }

      if (event.key === "Escape") {
        const palette = document.getElementById("commandPalette");
        if (palette && palette.classList.contains("open")) toggleCommandPalette();
      }

      const map = {
        "1": "home",
        "2": "llm",
        "3": "notion",
        "4": "github",
        "5": "production",
        "6": "system"
      };

      if (map[event.key]) {
        openPage(map[event.key]);
      }
    });



    function detectOsName() {
      const ua = navigator.userAgent || "";
      const platform = navigator.platform || "";

      if (/Windows NT 10\.0/.test(ua)) return "Windows 10 / 11";
      if (/Windows NT 6\.3/.test(ua)) return "Windows 8.1";
      if (/Windows NT 6\.2/.test(ua)) return "Windows 8";
      if (/Windows NT 6\.1/.test(ua)) return "Windows 7";
      if (/Mac OS X/.test(ua)) return "macOS";
      if (/Android/.test(ua)) return "Android";
      if (/iPhone|iPad|iPod/.test(ua)) return "iOS / iPadOS";
      if (/Linux/.test(ua)) return "Linux";
      return platform || "inconnu";
    }

    function detectBrowserName() {
      const ua = navigator.userAgent || "";

      if (/Edg\//.test(ua)) return "Microsoft Edge";
      if (/Firefox\//.test(ua)) {
        const v = ua.match(/Firefox\/([\d.]+)/);
        return "Firefox" + (v ? " " + v[1] : "");
      }
      if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) {
        const v = ua.match(/Chrome\/([\d.]+)/);
        return "Chrome" + (v ? " " + v[1] : "");
      }
      if (/Safari\//.test(ua) && /Version\//.test(ua)) {
        const v = ua.match(/Version\/([\d.]+)/);
        return "Safari" + (v ? " " + v[1] : "");
      }
      return "navigateur inconnu";
    }

    function shortUserAgent() {
      const ua = navigator.userAgent || "indisponible";
      return ua.length > 92 ? ua.slice(0, 92) + "…" : ua;
    }

    function getScreenInfo() {
      const dpr = window.devicePixelRatio || 1;
      return `${screen.width}×${screen.height} · DPR ${dpr}`;
    }

    function getViewportInfo() {
      return `viewport ${window.innerWidth}×${window.innerHeight}`;
    }

    function getTimezoneInfo() {
      try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || "inconnu";
      } catch (e) {
        return "inconnu";
      }
    }

    function getLanguageInfo() {
      const langs = navigator.languages && navigator.languages.length ? navigator.languages.join(", ") : navigator.language;
      return langs || "inconnu";
    }

    function getCpuInfo() {
      return navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} threads` : "non disponible";
    }

    function getMemoryInfo() {
      return navigator.deviceMemory ? `${navigator.deviceMemory} GB approx.` : "non disponible";
    }

    function getSessionInfo() {
      const protocol = location.protocol.replace(":", "");
      const host = location.host || "local";
      return `${protocol} · ${host}`;
    }

    async function refreshBatteryInfo() {
      const batteryInfo = document.getElementById("batteryInfo");
      const batteryMode = document.getElementById("batteryMode");

      if (!batteryInfo || !batteryMode) return;

      if (!navigator.getBattery) {
        batteryInfo.textContent = "non disponible";
        batteryMode.textContent = "API batterie absente";
        return;
      }

      try {
        const battery = await navigator.getBattery();
        const level = Math.round(battery.level * 100);
        batteryInfo.textContent = `${level}%`;
        batteryMode.textContent = battery.charging ? "en charge" : "sur batterie";
      } catch (e) {
        batteryInfo.textContent = "indisponible";
        batteryMode.textContent = "permission / navigateur";
      }
    }

    function buildSystemDiagnosticText() {
      const lines = [
        "# Seven System Details HUD",
        "",
        "Machine :",
        "Transformer Book / Seven Portable Terminal",
        "",
        "Système détecté :",
        detectOsName(),
        "",
        "Plateforme navigateur :",
        navigator.platform || "inconnue",
        "",
        "Navigateur :",
        detectBrowserName(),
        "",
        "User Agent :",
        navigator.userAgent || "indisponible",
        "",
        "Écran :",
        getScreenInfo(),
        "",
        "Viewport :",
        getViewportInfo(),
        "",
        "Langue :",
        getLanguageInfo(),
        "",
        "Fuseau horaire :",
        getTimezoneInfo(),
        "",
        "CPU logique :",
        getCpuInfo(),
        "",
        "Mémoire navigateur :",
        getMemoryInfo(),
        "",
        "Connexion :",
        typeof detectConnectionType === "function" ? detectConnectionType() : "non disponible",
        "",
        "Statut online :",
        navigator.onLine ? "en ligne" : "hors ligne",
        "",
        "Session :",
        getSessionInfo(),
        "",
        "URL cockpit :",
        location.href,
        "",
        "Sécurité :",
        "Ce diagnostic ne contient ni ID RustDesk ni mot de passe."
      ];

      return lines.join("\\n");
    }

    async function refreshSystemDetails() {
      const os = detectOsName();
      const browser = detectBrowserName();
      const screenText = getScreenInfo();
      const viewportText = getViewportInfo();
      const timezone = getTimezoneInfo();

      const set = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
      };

      set("osName", os);
      set("platformName", navigator.platform || "plateforme inconnue");
      set("browserName", browser);
      set("userAgentShort", shortUserAgent());
      set("screenInfo", screenText);
      set("viewportInfo", viewportText);
      set("timezoneInfo", timezone);
      set("languageInfo", getLanguageInfo());
      set("cpuInfo", getCpuInfo());
      set("memoryInfo", getMemoryInfo());
      set("sessionInfo", getSessionInfo());
      set("pageInfo", location.hostname || "local");

      set("footerOs", os);
      set("footerBrowser", browser);
      set("footerScreen", `${screen.width}×${screen.height}`);
      set("footerTimezone", timezone);

      const advanced = document.getElementById("advancedSystemText");
      if (advanced) advanced.value = buildSystemDiagnosticText();

      await refreshBatteryInfo();

      setStatus("System Details HUD actualisé.");
    }

    async function copySystemDiagnostics() {
      await refreshSystemDetails();
      await copyText(buildSystemDiagnosticText());
      setStatus("Diagnostic système copié. Aucun identifiant RustDesk inclus.");
    }

    function toggleAdvancedSystem() {
      const panel = document.getElementById("advancedSystemPanel");
      if (!panel) return;
      panel.classList.toggle("open");
      const advanced = document.getElementById("advancedSystemText");
      if (advanced) advanced.value = buildSystemDiagnosticText();
      setStatus(panel.classList.contains("open") ? "Détails avancés affichés." : "Détails avancés masqués.");
    }

    window.addEventListener("resize", () => {
      const set = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
      };
      set("screenInfo", getScreenInfo());
      set("viewportInfo", getViewportInfo());
      set("footerScreen", `${screen.width}×${screen.height}`);
    });


    function toggleHeroFrame() {
      document.body.classList.toggle("no-hero-face");
      const on = !document.body.classList.contains("no-hero-face");
      const btn = document.getElementById("heroFrameBtn");
      if (btn) btn.classList.toggle("active", on);
      try { localStorage.setItem("seven-hero-face", on ? "1" : "0"); } catch (e) {}
      setStatus(on ? "Hero Face : ON" : "Hero Face : OFF");
    }

    function bootHeroFrame() {
      let enabled = "1";
      try { enabled = localStorage.getItem("seven-hero-face") || "1"; } catch (e) {}
      if (enabled !== "1") document.body.classList.add("no-hero-face");
      const btn = document.getElementById("heroFrameBtn");
      if (btn) btn.classList.toggle("active", enabled === "1");
    }

    function spawnTouchGlow(event) {
      if (document.body.classList.contains("no-touch-glow")) return;
      const layer = document.getElementById("touchLayer");
      if (!layer) return;

      const dot = document.createElement("span");
      dot.className = "touch-ripple";
      dot.style.left = (event.clientX || 0) + "px";
      dot.style.top = (event.clientY || 0) + "px";
      layer.appendChild(dot);
      setTimeout(() => dot.remove(), 850);
    }

    function toggleTouchGlow() {
      document.body.classList.toggle("no-touch-glow");
      const on = !document.body.classList.contains("no-touch-glow");
      const btn = document.getElementById("touchGlowBtn");
      if (btn) btn.classList.toggle("active", on);
      try { localStorage.setItem("seven-touch-glow", on ? "1" : "0"); } catch (e) {}
      setStatus(on ? "Touch glow : ON" : "Touch glow : OFF");
    }

    function bootTouchGlow() {
      let enabled = "1";
      try { enabled = localStorage.getItem("seven-touch-glow") || "1"; } catch (e) {}
      if (enabled !== "1") document.body.classList.add("no-touch-glow");
      const btn = document.getElementById("touchGlowBtn");
      if (btn) btn.classList.toggle("active", enabled === "1");

      document.addEventListener("pointerdown", spawnTouchGlow, { passive: true });
      document.querySelectorAll(".tile, .tab, .mini-control").forEach(el => {
        el.addEventListener("pointerdown", (event) => {
          el.classList.add("touched");
          setTimeout(() => el.classList.remove("touched"), 420);
        }, { passive: true });
      });
    }

    function togglePreviewMode() {
      document.body.classList.toggle("no-previews");
      const on = !document.body.classList.contains("no-previews");
      const btn = document.getElementById("previewModeBtn");
      if (btn) btn.classList.toggle("active", on);
      try { localStorage.setItem("seven-previews", on ? "1" : "0"); } catch (e) {}
      setStatus(on ? "Destination previews : ON" : "Destination previews : OFF");
    }

    function bootPreviewMode() {
      let enabled = "1";
      try { enabled = localStorage.getItem("seven-previews") || "1"; } catch (e) {}
      if (enabled !== "1") document.body.classList.add("no-previews");
      const btn = document.getElementById("previewModeBtn");
      if (btn) btn.classList.toggle("active", enabled === "1");
    }

    function bootSkyUi() {
      let mode = "sky";
      try { mode = localStorage.getItem("seven-ui-mode") || "sky"; } catch (e) {}
      setUiMode(mode);

      try {
        if (localStorage.getItem("seven-deep-glass") === "1") document.body.classList.add("deep-glass");
      } catch (e) {}

      document.querySelectorAll(".tile, .mini-control").forEach(el => {
        el.addEventListener("click", () => markSelectedButton(el));
      });
    }

    bootBackground();
    bootSkyUi();
    bootPreviewMode();
    bootInteractiveHelp();
    bootTouchGlow();
    bootHeroFrame();
    bootCelestialAtlasV2();
    bootCelestialAtlasV3();
    bootSolidShell();
    refreshSystemDetails();
    refreshNetworkHud();
    updateClock();
  
    function bootSelectedGearsOnly() {
      document.querySelectorAll(".tile, .mini-control").forEach(el => {
        el.addEventListener("click", () => {
          document.querySelectorAll(".tile.selected, .mini-control.selected").forEach(item => {
            if (item !== el) item.classList.remove("selected");
          });
          el.classList.add("selected");
        });
      });
    }

    bootSelectedGearsOnly();
  
    function forceCleanHomeBoot() {
      // v3 clean rule: home loads sober, always.
      document.body.classList.remove("show-advanced");
      const advancedBtn = document.getElementById("advancedPanelsBtn");
      if (advancedBtn) advancedBtn.classList.remove("active");

      const atlas = document.getElementById("celestialAtlasPanel");
      if (atlas) atlas.classList.remove("open");

      try {
        localStorage.setItem("seven-advanced-panels", "0");
      } catch (e) {}

      setStatus("Clean Home : accueil sobre actif.");
    }

    function toggleAdvancedPanels() {
      document.body.classList.toggle("show-advanced");
      const open = document.body.classList.contains("show-advanced");
      const btn = document.getElementById("advancedPanelsBtn");
      if (btn) btn.classList.toggle("active", open);
      try { localStorage.setItem("seven-advanced-panels", open ? "1" : "0"); } catch (e) {}
      setStatus(open ? "Advanced Panels ouverts." : "Accueil sobre rétabli.");
    }

    function openCelestialAtlas() {
      document.body.classList.add("show-advanced");
      const advancedBtn = document.getElementById("advancedPanelsBtn");
      if (advancedBtn) advancedBtn.classList.add("active");

      const panel = document.getElementById("celestialAtlasPanel");
      if (panel) {
        panel.classList.add("open");
        setStatus("Celestial Atlas ouvert.");
      }
    }

    forceCleanHomeBoot();
  
    function toggleReadabilityShield() {
      document.body.classList.toggle("readability-off");
      const on = !document.body.classList.contains("readability-off");
      const btn = document.getElementById("readabilityShieldBtn");
      if (btn) btn.classList.toggle("active", on);
      try { localStorage.setItem("seven-readability-shield", on ? "1" : "0"); } catch (e) {}
      setStatus(on ? "Bouclier lisibilité : ON" : "Bouclier lisibilité : OFF");
    }

    function bootReadabilityShield() {
      let enabled = "1";
      try { enabled = localStorage.getItem("seven-readability-shield") || "1"; } catch (e) {}
      document.body.classList.toggle("readability-off", enabled !== "1");
      const btn = document.getElementById("readabilityShieldBtn");
      if (btn) btn.classList.toggle("active", enabled === "1");
    }

    bootReadabilityShield();
  
    function bootTransformerBookViews() {
      try { localStorage.setItem("seven-terminal-bg-index", "0"); } catch (e) {}
      if (typeof applyBackground === "function") applyBackground(0);
      if (typeof renderAtlasGrid === "function") renderAtlasGrid("All");
      setStatus("Transformer Book Views : fonds choisis, sans brume ajoutée.");
    }

    bootTransformerBookViews();
  
    function updateTraceProCards() {
      const set = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
      };

      const os = typeof detectOsName === "function" ? detectOsName() : "inconnu";
      const browser = typeof detectBrowserName === "function" ? detectBrowserName() : "navigateur inconnu";
      const screenText = typeof getScreenInfo === "function" ? getScreenInfo() : `${screen.width}×${screen.height}`;
      const viewportText = typeof getViewportInfo === "function" ? getViewportInfo() : `viewport ${window.innerWidth}×${window.innerHeight}`;
      const timezone = typeof getTimezoneInfo === "function" ? getTimezoneInfo() : "inconnu";
      const language = typeof getLanguageInfo === "function" ? getLanguageInfo() : (navigator.language || "inconnu");
      const cpu = typeof getCpuInfo === "function" ? getCpuInfo() : (navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} threads` : "non disponible");
      const memory = typeof getMemoryInfo === "function" ? getMemoryInfo() : (navigator.deviceMemory ? `${navigator.deviceMemory} GB approx.` : "non disponible");
      const session = typeof getSessionInfo === "function" ? getSessionInfo() : `${location.protocol.replace(":", "")} · ${location.host || "local"}`;
      const online = navigator.onLine ? "en ligne" : "hors ligne";

      set("traceOs", os);
      set("tracePlatform", navigator.platform || "plateforme inconnue");
      set("traceBrowser", browser);
      set("traceAgent", typeof shortUserAgent === "function" ? shortUserAgent() : (navigator.userAgent || "indisponible").slice(0, 92));
      set("traceScreen", screenText);
      set("traceViewport", viewportText);
      set("traceTimezone", timezone);
      set("traceLanguage", language);
      set("traceCpu", cpu);
      set("traceMemory", memory);
      set("traceSession", session);
      set("traceOnline", online);
      set("traceStamp", new Date().toLocaleString());

      const batteryInfo = document.getElementById("batteryInfo");
      const batteryMode = document.getElementById("batteryMode");
      set("traceBattery", batteryInfo ? batteryInfo.textContent : "--");
      set("traceBatteryMode", batteryMode ? batteryMode.textContent : "détection…");

      const raw = document.getElementById("advancedSystemText");
      if (raw && typeof buildSystemDiagnosticText === "function") {
        raw.value = buildSystemDiagnosticText();
      }
    }

    const previousRefreshSystemDetails = typeof refreshSystemDetails === "function" ? refreshSystemDetails : null;
    async function refreshSystemDetailsPro() {
      if (previousRefreshSystemDetails) {
        await previousRefreshSystemDetails();
      }
      updateTraceProCards();
    }

    const previousToggleAdvancedSystem = typeof toggleAdvancedSystem === "function" ? toggleAdvancedSystem : null;
    function toggleAdvancedSystemPro() {
      if (previousToggleAdvancedSystem) {
        previousToggleAdvancedSystem();
      } else {
        const panel = document.getElementById("advancedSystemPanel");
        if (panel) panel.classList.toggle("open");
      }
      updateTraceProCards();
    }

    // Override public handlers after old functions are loaded.
    refreshSystemDetails = refreshSystemDetailsPro;
    toggleAdvancedSystem = toggleAdvancedSystemPro;

    function bootSystemTracePro() {
      updateTraceProCards();
      setTimeout(updateTraceProCards, 600);
    }

    bootSystemTracePro();
  
    function bootAtlas29RecoveryHero() {
      try {
        localStorage.setItem("seven-terminal-bg-index", "0");
        localStorage.removeItem("seven-hero-frame-index");
      } catch (e) {}
      document.body.classList.remove("no-hero-face");
      document.documentElement.style.setProperty("--hero-bg", 'url("./aerith_7_memory_cards_avatar_master.png")');
      if (typeof applyBackground === "function") applyBackground(0);
      if (typeof renderAtlasGrid === "function") renderAtlasGrid("All");
      setStatus("Celestial Atlas 2.9 : Recovery Hero actif.");
    }

    function cycleHeroFrame() {
      bootAtlas29RecoveryHero();
    }

    function randomHeroFrame() {
      bootAtlas29RecoveryHero();
    }

    function applyHeroFrame() {
      bootAtlas29RecoveryHero();
    }

    bootAtlas29RecoveryHero();
  
    function clampHeroFocus(value, min, max) {
      value = Number(value);
      if (Number.isNaN(value)) return min;
      return Math.max(min, Math.min(max, value));
    }

    function applyHeroFocus(x, y, zoom, save = true) {
      x = clampHeroFocus(x, 0, 100);
      y = clampHeroFocus(y, 0, 100);
      zoom = clampHeroFocus(zoom, 100, 180);

      document.documentElement.style.setProperty("--hero-x", x + "%");
      document.documentElement.style.setProperty("--hero-y", y + "%");
      document.documentElement.style.setProperty("--hero-zoom", zoom + "%");
      document.documentElement.style.setProperty("--hero-size", zoom <= 100 ? "cover" : zoom + "% auto");

      const xInput = document.getElementById("heroFocusX");
      const yInput = document.getElementById("heroFocusY");
      const zoomInput = document.getElementById("heroFocusZoom");
      const xValue = document.getElementById("heroFocusXValue");
      const yValue = document.getElementById("heroFocusYValue");
      const zoomValue = document.getElementById("heroFocusZoomValue");

      if (xInput) xInput.value = x;
      if (yInput) yInput.value = y;
      if (zoomInput) zoomInput.value = zoom;
      if (xValue) xValue.textContent = x + "%";
      if (yValue) yValue.textContent = y + "%";
      if (zoomValue) zoomValue.textContent = zoom + "%";

      if (save) {
        try {
          localStorage.setItem("seven-hero-focus", JSON.stringify({ x, y, zoom }));
        } catch (e) {}
      }
    }

    function setHeroFocusFromInputs() {
      const x = document.getElementById("heroFocusX")?.value || 50;
      const y = document.getElementById("heroFocusY")?.value || 34;
      const zoom = document.getElementById("heroFocusZoom")?.value || 100;
      applyHeroFocus(x, y, zoom, true);
      if (typeof setStatus === "function") setStatus("Hero Focus ajusté : X " + x + "% / Y " + y + "% / Zoom " + zoom + "%");
    }

    function nudgeHeroFocus(dx, dy) {
      const x = Number(document.getElementById("heroFocusX")?.value || 50) + dx;
      const y = Number(document.getElementById("heroFocusY")?.value || 34) + dy;
      const zoom = Number(document.getElementById("heroFocusZoom")?.value || 100);
      applyHeroFocus(x, y, zoom, true);
    }

    function resetHeroFocus() {
      applyHeroFocus(50, 34, 100, true);
      if (typeof setStatus === "function") setStatus("Hero Focus réinitialisé.");
    }

    function toggleHeroFocusPanel() {
      document.body.classList.toggle("show-hero-focus");
      const open = document.body.classList.contains("show-hero-focus");
      const btn = document.getElementById("heroFocusBtn");
      if (btn) btn.classList.toggle("active", open);
      try { localStorage.setItem("seven-hero-focus-panel", open ? "1" : "0"); } catch (e) {}
      if (typeof setStatus === "function") setStatus(open ? "Hero Focus ouvert." : "Hero Focus fermé.");
    }

    function bootHeroManualFocus() {
      let state = { x: 50, y: 34, zoom: 100 };
      try {
        const saved = JSON.parse(localStorage.getItem("seven-hero-focus") || "null");
        if (saved) state = { ...state, ...saved };
      } catch (e) {}

      applyHeroFocus(state.x, state.y, state.zoom, false);

      let open = "0";
      try { open = localStorage.getItem("seven-hero-focus-panel") || "0"; } catch (e) {}
      document.body.classList.toggle("show-hero-focus", open === "1");
      const btn = document.getElementById("heroFocusBtn");
      if (btn) btn.classList.toggle("active", open === "1");
    }

    bootHeroManualFocus();

  
    function syncHomeSystemTrace() {
      const pairs = [
        ["homeTraceStamp", "traceStamp"],
        ["homeTraceOs", "traceOs"],
        ["homeTracePlatform", "tracePlatform"],
        ["homeTraceBrowser", "traceBrowser"],
        ["homeTraceAgent", "traceAgent"],
        ["homeTraceScreen", "traceScreen"],
        ["homeTraceViewport", "traceViewport"],
        ["homeTraceTimezone", "traceTimezone"],
        ["homeTraceLanguage", "traceLanguage"]
      ];

      pairs.forEach(([homeId, sourceId]) => {
        const home = document.getElementById(homeId);
        const source = document.getElementById(sourceId);
        if (home && source) home.textContent = source.textContent;
      });
    }

    function refreshHomeSystemTrace() {
      try {
        if (typeof refreshSystemDetails === "function") refreshSystemDetails();
        if (typeof updateTraceProCards === "function") updateTraceProCards();
      } catch (e) {}
      setTimeout(syncHomeSystemTrace, 80);
      setTimeout(syncHomeSystemTrace, 700);
      if (typeof setStatus === "function") setStatus("Advanced System Trace accueil actualisé.");
    }

    async function copyHomeSystemDiagnostics() {
      if (typeof buildSystemDiagnosticText === "function" && typeof copyText === "function") {
        await copyText(buildSystemDiagnosticText());
        if (typeof setStatus === "function") setStatus("Diagnostic système copié.");
      }
    }

    function bootHomeSystemTrace() {
      refreshHomeSystemTrace();
      setTimeout(refreshHomeSystemTrace, 900);
    }

    bootHomeSystemTrace();