/* Seven Heaven: progressive visual identities for documentary views.
   Decorative only. Never use a ticker icon as proof of token identity, venue, or access. */
(() => {
  "use strict";
  if (typeof document === "undefined") return;
  const source = document.currentScript?.src || document.baseURI;
  const verified = Object.freeze({
    BTC: { name: "bitcoin", id: "bitcoin", file: "assets/crypto-logos/btc.svg" },
    ETH: { name: "ethereum", id: "ethereum", file: "assets/crypto-logos/eth.svg" },
    SOL: { name: "solana", id: "solana", file: "assets/crypto-logos/sol.svg" },
    XRP: { name: "xrp", id: "ripple", file: "assets/crypto-logos/xrp.svg" },
    BCH: { name: "bitcoin cash", id: "bitcoin-cash", file: "assets/crypto-logos/bch.svg" },
    DOGE: { name: "dogecoin", id: "dogecoin", file: "assets/crypto-logos/doge.svg" },
    CT: { name: "concrete", id: "concrete", file: "../administrator/assets/crypto/new-listings/concrete.png" }
  });
  const clean = v => String(v || "").trim().toLocaleLowerCase("fr");
  function badge({ symbol, name, id }) {
    const ticker = String(symbol || "").toUpperCase();
    if (!/^[A-Z0-9]{1,16}$/.test(ticker)) return null;
    const label = clean(name), identity = clean(id);
    const product = /tokenized|bstocks|xstocks|stock|\betf\b/i.test(label);
    const asset = verified[ticker];
    // Never verify a logo from a ticker alone: require a matching full name or CoinGecko ID.
    const match = !product && asset &&
      (label === asset.name || identity === asset.id || (ticker === "XRP" && label === "xrp"));
    const wrap = document.createElement("span");
    wrap.className = "seven-coin-mark" + (product ? " seven-coin-product" : "") +
      (match ? "" : " seven-coin-fallback");
    wrap.setAttribute("aria-hidden", "true");
    wrap.title = match ? "Repère visuel : " + name :
      "Sigle " + ticker + " — identité visuelle non certifiée";
    const initials = ticker.slice(0, 2);
    if (match) {
      const image = document.createElement("img");
      image.src = new URL(asset.file, source).href;
      image.alt = "";
      image.loading = "lazy";
      image.onerror = () => {
        wrap.classList.add("seven-coin-fallback");
        wrap.replaceChildren(document.createTextNode(initials));
      };
      wrap.append(image);
    } else {
      wrap.textContent = initials;
    }
    return wrap;
  }
  function decorate(target, identity) {
    if (target.querySelector(":scope > .seven-coin-mark")) return;
    const mark = badge(identity);
    if (mark) target.prepend(mark);
  }
  const cases = [
    ["#top250-rows tr td:nth-child(2)", el => {
      const m = el.textContent.trim().match(/^(.+?)\s*·\s*([A-Z0-9]{1,16})$/);
      return m ? { name: m[1], symbol: m[2] } : null;
    }],
    ["#coffre-radar-items summary strong, #candidates summary strong", el => {
      const m = el.textContent.trim().match(/^([A-Z0-9]{1,16})\s*·\s*(.+)$/);
      return m ? { symbol: m[1], name: m[2] } : null;
    }],
    ["#dynamic-rows td:first-child strong", el => ({
      symbol: el.textContent.trim(),
      id: el.closest("td")?.querySelector("small")?.textContent.trim() || ""
    })],
    ["[data-coin-symbol]", el => ({
      symbol: el.dataset.coinSymbol, name: el.dataset.coinName, id: el.dataset.coinId
    })]
  ];
  function refresh() {
    for (const [selector, parse] of cases) {
      for (const el of document.querySelectorAll(selector)) {
        if (el.firstElementChild?.classList.contains("seven-coin-mark")) continue;
        const identity = parse(el);
        if (identity) decorate(el, identity);
      }
    }
  }
  function start() {
    const style = document.createElement("style");
    style.textContent = '.seven-coin-mark{display:inline-grid;place-items:center;vertical-align:middle;width:25px;height:25px;margin-inline-end:8px;overflow:hidden;border:1px solid #4f8293;border-radius:50%;background:#12394e;color:#d9f8ff;font:800 10px/1 system-ui;flex:none}.seven-coin-mark img{width:100%;height:100%;object-fit:contain;display:block}.seven-coin-fallback{background:linear-gradient(140deg,#143c52,#0c293c)}.seven-coin-product{border-radius:7px;border-color:#94744d;color:#ffdd9d;background:#3a322c}[data-coin-symbol]>.seven-coin-mark{width:34px;height:34px;font-size:12px}';
    document.head.append(style);
    refresh();
    const roots = ["top250-rows", "coffre-radar-items", "candidates", "dynamic-rows"];
    let pending = false;
    for (const id of roots) {
      const el = document.getElementById(id);
      if (!el) continue;
      new MutationObserver(() => {
        if (pending) return;
        pending = true;
        queueMicrotask(() => { pending = false; refresh(); });
      }).observe(el, { childList: true, subtree: true });
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
