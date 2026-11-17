"use strict";
(() => {
  const $ = id => document.getElementById(id);
  const root = $("historical-vault");
  if (!root) return;

  const api = async (path, body) => {
    const options = body === undefined ? {} : {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(body)
    };
    const response = await fetch(path, options);
    let data = {};
    try { data = await response.json(); } catch (_) {}
    if (!response.ok) throw new Error(data.error || `Erreur HTTP ${response.status}`);
    return data;
  };
  const fmt = n => Number(n).toLocaleString("fr-FR");
  const html = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  let state = null;
  let busyKey = "";

  function yearCells(asset) {
    const years = asset.indexed_years || {};
    return Object.keys(years).sort().map(year => {
      const months = Number(years[year]);
      const complete = months === 12;
      return `<span class="vault-year-chip${complete ? " complete" : " partial"}" title="${months} mois vérifiés en ${html(year)}">${html(year)} · ${months}/12</span>`;
    }).join("");
  }

  function renderYearAction(asset, item) {
    const key = `${asset.symbol}-${item.year}`;
    if (busyKey === key) {
      return `<button class="historical-install-button" type="button" disabled>Vérification en cours…</button>`;
    }
    if (item.installed) {
      return `<button class="historical-use-button" type="button" data-use-source="${html(item.source_id)}">Utiliser ${item.year}</button>`;
    }
    return `<button class="historical-install-button" type="button" data-install-symbol="${html(asset.symbol)}" data-install-year="${item.year}">Installer ${item.year}</button>`;
  }

  function render() {
    if (!state) return;
    const s = state.summary || {};
    $("historical-vault-assets").textContent = fmt(s.archive_assets || 0);
    $("historical-vault-12m").textContent = fmt(s.assets_with_12_consecutive_months || 0);
    $("historical-vault-24m").textContent = fmt(s.assets_with_24_consecutive_months || 0);
    $("historical-vault-minutes").textContent = fmt(s.source_catalog_minutes || 0);
    const installed = state.assets.reduce((n, a) => n + (a.years || []).filter(y => y.installed).length, 0);
    $("historical-vault-state").textContent = installed ? `${installed} année${installed > 1 ? "s" : ""} installée${installed > 1 ? "s" : ""}` : "10 années installables";

    $("historical-vault-list").innerHTML = state.assets.map(asset => {
      const years = (asset.years || []).map(item => `
        <div class="historical-install-row ${item.installed ? "installed" : "indexed"}">
          <div><strong>${item.year}</strong><span>${item.installed ? `${fmt(item.rows_1h)} bougies 1h · installées` : "12 mois indexés · non installés"}</span></div>
          <span class="historical-status-chip ${item.installed ? "ready" : "remote"}">${item.installed ? "LOCAL · UTILISABLE" : "INDEXÉ"}</span>
          ${renderYearAction(asset, item)}
        </div>`).join("");
      return `<article class="historical-asset-card" role="listitem" data-historical-asset="${html(asset.symbol)}">
        <div class="historical-asset-head">
          <div><span class="historical-rank">#${html(asset.rank)}</span><h3>${html(asset.symbol)} <small>${html(asset.pair)}</small></h3></div>
          <span class="historical-depth-badge">${fmt(asset.verified_months)} mois vérifiés</span>
        </div>
        <div class="historical-depth-line">
          <span>${html(asset.first_verified_closed_month)} → ${html(asset.last_verified_closed_month)}</span>
          <strong>${fmt(asset.longest_contiguous_months)} mois consécutifs max.</strong>
        </div>
        <div class="historical-year-map" aria-label="Mois vérifiés par année">${yearCells(asset)}</div>
        <div class="historical-install-grid">${years}</div>
      </article>`;
    }).join("");

    const src = state.source || {};
    $("historical-vault-proof-body").innerHTML = `
      <p><strong>Snapshot canonique :</strong> <code>${html(src.path)}</code></p>
      <p><strong>Git blob :</strong> <code>${html(src.git_blob_sha)}</code> · schéma <code>${html(src.schema)}</code>.</p>
      <p><strong>Limite V1 :</strong> les profondeurs anciennes restent des preuves d’index. Seules les années 2024/2025 complètes des cinq actifs affichés sont installables automatiquement. Une année installée est revalidée par le chargeur local avant d’apparaître dans la Bibliothèque de marchés.</p>`;

    root.querySelectorAll("[data-install-symbol]").forEach(button => button.addEventListener("click", install));
    root.querySelectorAll("[data-use-source]").forEach(button => button.addEventListener("click", useInstalled));
  }

  async function refresh(message = "") {
    try {
      state = await api("/api/historical-vault");
      render();
      $("historical-vault-message").textContent = message || "Index chargé. Les lignes INDEXÉES ne deviennent simulables qu’après installation et vérification locale.";
      $("historical-vault-message").className = "historical-vault-message";
    } catch (error) {
      $("historical-vault-message").textContent = error.message;
      $("historical-vault-message").className = "historical-vault-message error";
    }
  }

  async function install(event) {
    const button = event.currentTarget;
    const symbol = button.dataset.installSymbol;
    const year = Number(button.dataset.installYear);
    if (!symbol || !Number.isInteger(year) || busyKey) return;
    busyKey = `${symbol}-${year}`;
    render();
    $("historical-vault-message").textContent = `${symbol} ${year} : validation du shard annuel local V3 (fallback Binance Public Data uniquement si nécessaire)…`;
    $("historical-vault-message").className = "historical-vault-message working";
    try {
      const result = await api("/api/historical-vault-install", {symbol, year});
      state = result.vault;
      busyKey = "";
      render();
      $("historical-vault-message").textContent = `${symbol} ${year} installé : source 1h locale vérifiée, disponible dans la Bibliothèque de marchés. Provenance et SHA conservés ; aucun ordre réel.`;
      $("historical-vault-message").className = "historical-vault-message success";
      window.dispatchEvent(new CustomEvent("seven-historical-source-installed", {detail: {source_id: result.source.id, symbol, year}}));
    } catch (error) {
      busyKey = "";
      render();
      $("historical-vault-message").textContent = error.message;
      $("historical-vault-message").className = "historical-vault-message error";
    }
  }

  function useInstalled(event) {
    const sourceId = event.currentTarget.dataset.useSource;
    if (!sourceId) return;
    window.dispatchEvent(new CustomEvent("seven-historical-source-installed", {detail: {source_id: sourceId, select_only: true}}));
    $("historical-vault-message").textContent = "Source locale transmise au Navigateur. Elle reste PAPER uniquement.";
    $("historical-vault-message").className = "historical-vault-message success";
    document.getElementById("guided-mode")?.scrollIntoView({behavior:"smooth", block:"start"});
  }

  window.addEventListener("seven-historical-vault-refresh", () => refresh());
  globalThis.SevenHistoricalVault = Object.freeze({refresh, schema:"seven.historical_vault.v1"});
  refresh();
})();
