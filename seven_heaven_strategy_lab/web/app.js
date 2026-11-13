"use strict";

(() => {
  const $ = id => document.getElementById(id);
  const config = $("config");
  const format = (n, max = 2) => Number(n).toLocaleString("fr-FR", {maximumFractionDigits: max});
  const signed = (n, max = 2) => (n > 0 ? "+" : "") + format(n, max);
  const money = n => format(n, 2) + " USDT";
  const day = timestamp => new Date(timestamp * 1000).toISOString().slice(0, 16).replace("T", " ");
  let profiles = [];

  async function api(path, body) {
    const settings = body === undefined
      ? {cache: "no-store"}
      : {method: "POST", cache: "no-store", headers: {"Content-Type": "application/json"},
         body: JSON.stringify(body)};
    let response;
    try {
      response = await fetch(path, settings);
    } catch (_) {
      throw new Error("Serveur local inaccessible. Lance le laboratoire depuis son programme Docker ou Python.");
    }
    let payload;
    try {
      payload = await response.json();
    } catch (_) {
      throw new Error("Le serveur n'a pas renvoyé de rapport lisible.");
    }
    if (!response.ok) throw new Error(payload.error || "Opération impossible");
    return payload;
  }

  function notice(text, tone = "") {
    const box = $("message");
    box.textContent = text;
    box.className = "notice" + (tone ? " " + tone : "");
  }

  function setBusy(id, busy, text) {
    const button = $(id);
    if (!button.dataset.original) button.dataset.original = button.textContent;
    button.disabled = busy;
    button.textContent = busy ? text : button.dataset.original;
  }

  function comma(number) {
    const raw = String(number).trim().replace(",", ".");
    if (!raw || !/^-?\d+(\.\d+)?$/.test(raw)) throw new Error("Nombre incorrect : " + number);
    const n = Number(raw);
    if (!Number.isFinite(n)) throw new Error("Nombre incorrect : " + number);
    return n;
  }

  function getParams() {
    const entries = new FormData(config);
    const raw = name => entries.get(name);
    return {
      kind: raw("kind"),
      capital: comma(raw("capital")),
      // UI percentages to decimal fractions: 0,10 % -> 0.001.
      fee: comma(raw("fee_pct")) / 100,
      slippage: comma(raw("slippage_pct")) / 100,
      ema_fast: comma(raw("ema_fast")),
      ema_slow: comma(raw("ema_slow")),
      bb_period: comma(raw("bb_period")),
      bb_sigma: comma(raw("bb_sigma")),
      dca_every: comma(raw("dca_every")),
      dca_quote: comma(raw("dca_quote")),
    };
  }

  function setParams(p) {
    const values = {
      kind: p.kind,
      capital: p.capital,
      fee_pct: format(p.fee * 100, 2),
      slippage_pct: format(p.slippage * 100, 2),
      ema_fast: p.ema_fast,
      ema_slow: p.ema_slow,
      bb_period: p.bb_period,
      bb_sigma: p.bb_sigma,
      dca_every: p.dca_every,
      dca_quote: p.dca_quote
    };
    for (const [name, value] of Object.entries(values)) {
      const field = config.elements.namedItem(name);
      if (field) field.value = String(value);
    }
    showFields();
  }

  function showFields() {
    const kind = $("kind").value;
    $("ema-fields").hidden = kind !== "EMA_CROSS";
    $("bb-fields").hidden = kind !== "BOLLINGER";
    $("dca-fields").hidden = kind !== "DCA";
  }

  async function refreshDataset() {
    const result = await api("/api/datasets");
    const dataset = result.datasets[0];
    const present = dataset.available === true;
    $("dataset-badge").textContent = present ? "Archive authentifiée" : "Non chargée";
    $("dataset-badge").className = "pill" + (present ? " ready" : "");
    $("dataset-state").textContent = present
      ? "44 640 bougies conservées localement · SHA-256 conforme · aucun téléchargement nécessaire."
      : "Téléchargement public sur demande, vérifié par SHA-256. Aucune connexion à un compte.";
    $("run").disabled = !present;
    return present;
  }

  async function refreshProfiles() {
    const data = await api("/api/profiles");
    profiles = data.profiles;
    const select = $("saved-profiles");
    select.replaceChildren(new Option("Choisir un profil…", ""));
    for (const p of profiles) {
      select.append(new Option(p.name + " · " + p.params.kind, p.id));
    }
  }

  function rowText(cells, container) {
    const tr = document.createElement("tr");
    cells.forEach(value => {
      const td = document.createElement("td");
      td.textContent = String(value);
      tr.append(td);
    });
    container.append(tr);
  }

  function plot(points) {
    const svg = $("equity-chart");
    svg.replaceChildren();
    if (!points.length) return;
    const ns = "http://www.w3.org/2000/svg";
    const make = (tag, attrs, label) => {
      const el = document.createElementNS(ns, tag);
      Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, String(v)));
      if (label != null) el.textContent = label;
      svg.append(el);
      return el;
    };
    const values = points.map(p => p.equity);
    const min = Math.min(...values), max = Math.max(...values);
    const range = Math.max(max - min, 1);
    const low = min - range * .12, high = max + range * .12;
    const h = 185, left = 10, right = 708;
    const xy = (p, i) => [
      left + i / Math.max(1, points.length - 1) * (right - left),
      12 + (high - p.equity) / (high - low) * h
    ];
    for (let j = 0; j < 4; j++) {
      const y = 14 + j * 61;
      make("line", {x1: left, y1: y, x2: right, y2: y, stroke: "#29415a", "stroke-width": 1});
    }
    const coords = points.map((p, i) => xy(p, i).map(n => n.toFixed(2)).join(",")).join(" ");
    const yZero = xy(points[0], 0)[1];
    make("line", {x1: left, y1: yZero, x2: right, y2: yZero,
      stroke: "#74859b", "stroke-dasharray": "4 6", opacity: ".5"});
    make("polyline", {points: coords, fill: "none", stroke: "#71e3cb",
      "stroke-width": "2.5", "stroke-linecap": "round", "stroke-linejoin": "round"});
    make("text", {x: 12, y: 213, fill: "#9cb0c5", "font-size": 12}, "Début");
    make("text", {x: 705, y: 213, fill: "#9cb0c5", "font-size": 12, "text-anchor": "end"}, "Fin");
  }

  function render(record) {
    const report = record.run, results = report.results, baseline = record.baselines;
    $("empty-result").hidden = true;
    $("result").hidden = false;
    $("run-id").textContent = report.params.kind + " · " + report.data.rows + " bougies";
    $("equity").textContent = money(results.equity_final);
    const perf = $("return");
    perf.textContent = signed(results.return_pct, 2) + " %";
    perf.className = "performance" + (results.return_pct < 0 ? " negative" : "");
    $("drawdown").textContent = format(results.max_drawdown_pct, 2) + " %";
    $("fees").textContent = money(results.fees_paid_usdt);
    $("cash").textContent = money(results.cash_final);
    $("inventory").textContent = format(results.base_inventory_btc, 8) + " BTC";
    $("counts").textContent = results.buy_events + " / " + results.sell_events;
    $("rejected").textContent = String(results.rejected_orders);
    $("hold50").textContent = signed(baseline.HOLD_50.return_pct, 2) + " %";
    $("holdcash").textContent = signed(baseline.CASH.return_pct, 2) + " %";
    plot(report.series);
    const table = $("trades");
    table.replaceChildren();
    report.trades.slice(-12).reverse().forEach(trade =>
      rowText([day(trade.timestamp), trade.side, format(trade.qty, 8),
        format(trade.price, 2), format(trade.fee, 4)], table));
    if (!report.trades.length) {
      rowText(["Aucune opération fictive", "—", "—", "—", "—"], table);
    }
  }

  async function refreshHistory() {
    const listing = await api("/api/results");
    const root = $("history");
    root.replaceChildren();
    if (!listing.runs.length) {
      const text = document.createElement("span");
      text.className = "muted";
      text.textContent = "Aucune simulation enregistrée.";
      root.append(text);
      return;
    }
    listing.runs.slice(0, 12).forEach(r => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "history-item";
      const label = document.createElement("span");
      label.textContent = r.kind + " · " + new Date(r.created_utc).toLocaleString("fr-FR");
      const val = document.createElement("strong");
      val.textContent = signed(r.results.return_pct) + " %";
      button.append(label, val);
      button.addEventListener("click", async () => {
        try {
          const old = await api("/api/results/" + r.id);
          render(old);
          notice("Rapport historique rechargé. Aucune nouvelle opération.");
        } catch (e) { notice(e.message, "error"); }
      });
      root.append(button);
    });
  }

  $("kind").addEventListener("change", showFields);
  $("saved-profiles").addEventListener("change", event => {
    const found = profiles.find(x => x.id === event.target.value);
    if (found) { setParams(found.params); $("profile-name").value = found.name; }
  });

  $("import").addEventListener("click", async () => {
    setBusy("import", true, "Vérification de l'archive…");
    notice("Récupération de notre archive publique et contrôle de toutes les bougies…");
    try {
      await api("/api/import-reference", {});
      await refreshDataset();
      notice("Archive contrôlée : 44 640 bougies authentifiées. Le laboratoire peut simuler.", "success");
    } catch (e) { notice(e.message, "error"); }
    finally { setBusy("import", false); }
  });

  config.addEventListener("submit", async event => {
    event.preventDefault();
    setBusy("run", true, "Simulation PAPER en cours…");
    notice("Calcul local des signaux, frais et positions fictives…");
    try {
      const data = await api("/api/run", {params: getParams()});
      render(data.report);
      await refreshHistory();
      notice("Simulation terminée et enregistrée localement. Aucun ordre réel.", "success");
    } catch (e) { notice(e.message, "error"); }
    finally { setBusy("run", false); }
  });

  $("save-profile").addEventListener("click", async () => {
    const name = $("profile-name").value.trim();
    if (!name) return notice("Choisis d'abord un nom pour enregistrer ton profil.", "error");
    setBusy("save-profile", true, "Enregistrement…");
    try {
      await api("/api/profiles", {name, params: getParams()});
      await refreshProfiles();
      notice("Profil " + name + " enregistré sur ton espace local.", "success");
    } catch (e) { notice(e.message, "error"); }
    finally { setBusy("save-profile", false); }
  });

  (async () => {
    showFields();
    try {
      await api("/api/health");
      const [present] = await Promise.all([refreshDataset(), refreshProfiles(), refreshHistory()]);
      notice(present
        ? "Seven Heaven Strategy Lab prêt. Source historique vérifiée en local."
        : "Laboratoire prêt. Première étape : charger l'archive historique depuis notre GitHub.", "success");
    } catch (e) {
      $("run").disabled = true;
      notice(e.message, "error");
    }
  })();
})();
