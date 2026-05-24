/* Seven Heaven Local Backend Bridge
   Fonctionne seulement depuis http://127.0.0.1:8787/index.html
*/

(function () {
  const API = "http://127.0.0.1:8787/api/youtube";

  function byId(id) { return document.getElementById(id); }
  function num(v) { const n = Number(v || 0); return Number.isFinite(n) ? n : 0; }
  function fmt(v) { return Math.round(num(v)).toLocaleString("fr-FR"); }
  function metric(video, key) { return num(video && video.analytics ? video.analytics[key] : 0); }

  function setText(id, text) {
    const el = byId(id);
    if (el) el.textContent = text;
  }

  function renderData(payload) {
    const data = payload && payload.data ? payload.data : payload;
    const top = data && data.top_videos ? data.top_videos.content : null;
    const families = data && data.families ? data.families.content : null;
    const briefs = data && Array.isArray(data.briefs) ? data.briefs : [];

    if (Array.isArray(top)) {
      setText("ytMetricVideos", `${top.length} vidéos chargées`);
      const sorted = top.slice().sort((a, b) => metric(b, "views") - metric(a, "views"));
      const v = sorted[0];
      if (v) {
        const title = v.title || "Titre non récupéré";
        const fam = v.memoryFamily || "Autre / à classifier";
        const views = fmt(metric(v, "views"));
        const watch = fmt(metric(v, "estimatedMinutesWatched"));
        const target = byId("ytTopVideo");
        if (target) target.innerHTML = `<b>${title}</b><br>${fam}<br>${views} vues · ${watch} min watchtime`;
        setText("ytAction", `Reproduire le signal fort : ${fam} · ${title}`);
      }
    }

    if (families && typeof families === "object") {
      const entries = Object.entries(families).sort((a, b) => num((b[1] || {}).views) - num((a[1] || {}).views));
      setText("ytMetricFamilies", `${entries.length} familles`);
      const first = entries[0];
      if (first) {
        const [name, stats] = first;
        const target = byId("ytTopFamily");
        if (target) target.innerHTML = `<b>${name}</b><br>${fmt(stats.views)} vues · ${fmt(stats.watchtime || stats.estimatedMinutesWatched)} min watchtime`;
      }
    }

    if (briefs.length) {
      setText("ytBriefStatus", `${briefs.length} brief(s) chargé(s)`);
      const box = byId("ytBriefText");
      if (box) box.value = briefs.map(b => `# ${b.filename}\n\n${b.content || b.error || ""}`).join("\n\n---\n\n");
    }

    setText("ytStatus", "Données chargées automatiquement");
  }

  async function loadLatest() {
    setText("ytStatus", "Lecture backend local...");
    const res = await fetch(`${API}/latest`);
    const payload = await res.json();
    renderData(payload);
  }

  async function syncYoutube() {
    setText("ytStatus", "Synchronisation YouTube...");
    const res = await fetch(`${API}/sync`);
    const payload = await res.json();
    if (!payload.ok) {
      setText("ytStatus", "Erreur sync");
      const box = byId("ytBriefText");
      if (box) box.value = JSON.stringify(payload, null, 2);
      return;
    }
    renderData(payload.data ? payload : payload);
    setText("ytStatus", "Synchronisation terminée");
  }

  function install() {
    const input = byId("youtubeFilesInput");
    const holder = input ? input.closest("label") : null;

    if (holder && !byId("syncYoutubeBtn")) {
      const button = document.createElement("button");
      button.className = "tile primary";
      button.id = "syncYoutubeBtn";
      button.type = "button";
      button.style.maxWidth = "220px";
      button.innerHTML = "<strong>Synchroniser YouTube</strong><span>Backend local</span>";
      holder.insertAdjacentElement("afterend", button);
    }

    const sync = byId("syncYoutubeBtn");
    if (sync) sync.addEventListener("click", syncYoutube);

    const load = byId("ytAutoLoadBtn");
    if (load) load.addEventListener("click", loadLatest);

    loadLatest().catch(() => {
      setText("ytStatus", "Backend local non lancé");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", install);
  } else {
    install();
  }
})();
