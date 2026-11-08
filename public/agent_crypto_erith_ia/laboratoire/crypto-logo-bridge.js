/* Seven Heaven · Document logos from the existing public CoinGecko Top 250 snapshot.
   Logos are visual aids, not verified exchange instruments or permissions. */
(() => {
  "use strict";
  if (typeof document === "undefined") return;
  const base = document.currentScript?.src || document.baseURI;
  const norm = x => String(x || "").trim().toLocaleLowerCase("fr");
  const local = {
    BTC: ["bitcoin","bitcoin","btc.svg"], ETH: ["ethereum","ethereum","eth.svg"],
    SOL: ["solana","solana","sol.svg"], XRP: ["ripple","xrp","xrp.svg"],
    BCH: ["bitcoin-cash","bitcoin cash","bch.svg"], DOGE: ["dogecoin","dogecoin","doge.svg"]
  };
  let byID = null, byPair = null;
  const product = name => /tokenized|bstocks|xstocks|stock|\betf\b/i.test(name);
  function identity(el, type) {
    let symbol = "", name = "", id = "";
    if (type === "top") {
      const m = el.textContent.trim().match(/^(.+?)\s*·\s*([A-Z0-9]{1,16})$/);
      if (!m) return null;
      symbol = el.parentElement.dataset.coinSymbol || m[2];
      name = el.parentElement.dataset.coinName || m[1];
      id = el.parentElement.dataset.coinId || "";
    } else if (type === "watch") {
      symbol = el.textContent.trim();
      name = el.closest("a")?.querySelector("span")?.textContent.trim() || "";
    } else if (type === "dynamic") {
      symbol = el.textContent.trim();
      id = el.dataset.coinId || el.closest("td")?.querySelector("small")?.textContent.trim() || "";
    } else if (type === "direct") {
      symbol = el.dataset.coinSymbol || "";
      name = el.dataset.coinName || "";
      id = el.dataset.coinId || "";
    } else {
      const m = el.textContent.trim().match(/^([A-Z0-9]{1,16})\s*·\s*(.+)$/);
      if (!m) return null;
      symbol = el.dataset.coinSymbol || m[1];
      name = el.dataset.coinName || m[2];
      id = el.dataset.coinId || "";
    }
    return /^[A-Z0-9]{1,16}$/.test(symbol) ? { symbol, name, id } : null;
  }
  function localURL(v) {
    const record = local[v.symbol];
    return record && !product(v.name) &&
      (v.id ? norm(v.id) === record[0] : norm(v.name) === record[1])
      ? new URL("assets/crypto-logos/" + record[2], base).href : null;
  }
  function snapshotURL(v) {
    if (!byID || product(v.name)) return null;
    const row = v.id ? byID.get(norm(v.id)) : byPair.get(norm(v.symbol) + "|" + norm(v.name));
    if (!row || norm(row.symbol) !== norm(v.symbol) ||
        (v.id && norm(row.id) !== norm(v.id)) ||
        (v.name && norm(row.name) !== norm(v.name))) return null;
    try {
      const url = new URL(row.image);
      if (url.protocol !== "https:" || url.hostname !== "coin-images.coingecko.com" ||
          !url.pathname.startsWith("/coins/images/")) return null;
      return url.href;
    } catch (_) { return null; }
  }
  function paint(mark, v) {
    const remote = snapshotURL(v), fallback = localURL(v);
    function initials() {
      mark.classList.add("seven-coin-fallback");
      mark.textContent = v.symbol.slice(0, 2);
    }
    function image(path, backup) {
      const img = document.createElement("img");
      img.alt = ""; img.loading = "lazy"; img.decoding = "async";
      img.onerror = () => backup ? image(backup, null) : initials();
      mark.classList.remove("seven-coin-fallback");
      mark.replaceChildren(img);
      img.src = path;
    }
    if (remote) image(remote, fallback);
    else if (fallback) image(fallback, null);
    else initials();
  }
  const rules = [
    ["#top250-rows tr td:nth-child(2)", "top"],
    ["#coffre-radar-items summary strong", "card"],
    ["#candidates summary strong", "card"],
    ["#dynamic-rows td:first-child strong", "dynamic"],
    [".link-grid .link-tile strong", "watch"],
    ["[data-coin-symbol]:not(.seven-coin-mark):not(strong):not(tr)", "direct"]
  ];
  function refresh() {
    for (const [selector, type] of rules) {
      for (const el of document.querySelectorAll(selector)) {
        if (el.dataset.sevenLogoReady === "1") continue;
        const v = identity(el, type);
        if (!v) continue;
        el.dataset.sevenLogoReady = "1";
        const mark = document.createElement("span");
        mark.className = "seven-coin-mark seven-coin-fallback" +
          (product(v.name) ? " seven-coin-product" : "");
        mark.setAttribute("aria-hidden", "true");
        mark.title = "Repère visuel " + v.symbol + " — pas une preuve de marché";
        mark.dataset.coinSymbol = v.symbol;
        mark.dataset.coinName = v.name;
        mark.dataset.coinId = v.id;
        el.prepend(mark);
        paint(mark, v);
      }
    }
  }
  async function load() {
    try {
      const response = await fetch(new URL("../data/crypto/latest.json", base), {
        credentials: "omit", cache: "no-store"
      });
      if (!response.ok) return;
      const data = await response.json();
      if (data.schema !== "agent_crypto_public_market_snapshot_v1" ||
          data.assets_count !== 250 || !Array.isArray(data.coins) ||
          data.coins.length !== 250) return;
      const ids = new Map(), pairs = new Map(), duplicates = new Set();
      for (const coin of data.coins) {
        if (!coin?.id || !coin.symbol || !coin.name) continue;
        ids.set(norm(coin.id), coin);
        const k = norm(coin.symbol) + "|" + norm(coin.name);
        if (pairs.has(k)) duplicates.add(k);
        else pairs.set(k, coin);
      }
      for (const k of duplicates) pairs.delete(k);
      byID = ids; byPair = pairs;
      for (const mark of document.querySelectorAll(".seven-coin-mark")) {
        paint(mark, {
          symbol: mark.dataset.coinSymbol,
          name: mark.dataset.coinName,
          id: mark.dataset.coinId
        });
      }
    } catch (_) { /* Keep existing local logos and readable initials offline. */ }
  }
  function start() {
    const style = document.createElement("style");
    style.textContent = '.seven-coin-mark{display:inline-grid!important;place-items:center;vertical-align:middle;width:26px;height:26px;margin-inline-end:8px;overflow:hidden;border:1px solid #4f8293;border-radius:50%;background:#12394e;color:#d9f8ff;font:800 10px/1 system-ui;flex:none}.seven-coin-mark img{width:100%;height:100%;object-fit:contain;display:block}.seven-coin-fallback{background:linear-gradient(140deg,#143c52,#0c293c)}.seven-coin-product{border-radius:7px;border-color:#94744d;color:#ffdd9d;background:#3a322c}[data-coin-symbol]>.seven-coin-mark{width:31px;height:31px}.link-tile strong>.seven-coin-mark{width:28px;height:28px}';
    document.head.append(style);
    refresh();
    let pending = false;
    for (const id of ["top250-rows", "coffre-radar-items", "candidates", "dynamic-rows"]) {
      const root = document.getElementById(id);
      if (!root) continue;
      new MutationObserver(() => {
        if (pending) return;
        pending = true;
        queueMicrotask(() => { pending = false; refresh(); });
      }).observe(root, { childList: true, subtree: true });
    }
    void load();
  }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();