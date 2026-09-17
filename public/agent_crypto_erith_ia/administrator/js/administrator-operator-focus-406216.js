/* Agent-Crypto @erith.IA — 40.6.218 READABILITY FIRST
   Terrain 40.6.217 is functionally dense but operator-hostile: the canonical header is
   restored, yet the Gate-3 / Evidence area remains a wall of technical panels, small
   labels and internal vocabulary. This presentation-only pass adds one plain-French
   operator summary immediately before the Evidence dossier, keeps the technical dossier
   collapsed by default when it is a separate sibling, and preserves every underlying
   proof unchanged. No Market Core, Strategy A, Atlas, Oracle, Risk, Gate, storage,
   network or order behavior is changed. */
(() => {
  "use strict";
  const BUILD = "40.6.218";
  const ROOT_ID = "administratorOperatorFocus406218";
  const SUMMARY_ID = "administratorOperatorEvidenceSummary406218";
  const CREATOR_ID = "administratorCreatorShortcut406218";
  const DETAIL_CLASS = "aof218-details-visible";
  let queued = false;

  const byId = id => typeof document !== "undefined" ? document.getElementById(id) : null;
  const esc = v => String(v ?? "—").replace(/[&<>\"]/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'\"':"&quot;"}[m]));

  function cleanupLegacy() {
    [
      "administratorOperatorFocus406215",
      "administratorOperatorFocus406216",
      "administratorOperatorFocus406217",
      "administratorOperatorEvidenceSummary406217",
      "administratorCreatorShortcut406217"
    ].forEach(id => byId(id)?.remove());
  }

  function ensureStyle() {
    if (byId(`${ROOT_ID}Style`)) return;
    const style = document.createElement("style");
    style.id = `${ROOT_ID}Style`;
    style.textContent = `
      #${SUMMARY_ID}{margin:14px 0 14px!important;padding:16px!important;border:1px solid rgba(111,238,255,.28)!important;border-radius:14px!important;background:linear-gradient(135deg,rgba(5,20,31,.90),rgba(12,24,41,.78))!important;box-shadow:0 12px 30px rgba(0,0,0,.18)!important;color:#e8f5fa!important}
      #${SUMMARY_ID} .aof218-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap}
      #${SUMMARY_ID} .aof218-eyebrow{font:950 11px/1.2 system-ui,sans-serif;letter-spacing:.10em;text-transform:uppercase;color:#8fefff}
      #${SUMMARY_ID} h3{margin:4px 0 2px!important;font:950 20px/1.2 system-ui,sans-serif!important;color:#f7fbff!important}
      #${SUMMARY_ID} .aof218-sub{font:650 12px/1.5 system-ui,sans-serif;color:#9eb8c5;max-width:920px}
      #${SUMMARY_ID} .aof218-badge{padding:7px 10px;border:1px solid rgba(255,216,121,.28);border-radius:999px;background:rgba(255,216,121,.07);font:950 11px/1 system-ui,sans-serif;color:#ffe6a6;white-space:nowrap}
      #${SUMMARY_ID} .aof218-grid{display:grid;grid-template-columns:repeat(4,minmax(150px,1fr));gap:9px;margin-top:13px}
      #${SUMMARY_ID} .aof218-card{padding:11px 12px;border:1px solid rgba(255,255,255,.08);border-radius:11px;background:rgba(2,11,18,.34)}
      #${SUMMARY_ID} .aof218-card span{display:block;font:800 9px/1.2 system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#7898a7}
      #${SUMMARY_ID} .aof218-card b{display:block;margin-top:5px;font:950 15px/1.25 system-ui,sans-serif;color:#f2fbff}
      #${SUMMARY_ID} .aof218-card small{display:block;margin-top:3px;font:650 10px/1.35 system-ui,sans-serif;color:#90aab6}
      #${SUMMARY_ID} .aof218-card[data-state="ok"]{border-color:rgba(114,255,184,.22);box-shadow:inset 3px 0 0 rgba(114,255,184,.56)}
      #${SUMMARY_ID} .aof218-card[data-state="wait"]{border-color:rgba(255,218,121,.22);box-shadow:inset 3px 0 0 rgba(255,218,121,.54)}
      #${SUMMARY_ID} .aof218-next{margin-top:11px;padding:11px 12px;border-radius:10px;border:1px solid rgba(148,198,255,.16);background:rgba(74,117,177,.07);font:800 12px/1.5 system-ui,sans-serif;color:#dcecff}
      #${SUMMARY_ID} .aof218-next b{color:#aeefff}
      #${SUMMARY_ID} .aof218-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:11px}
      #${SUMMARY_ID} button,#${CREATOR_ID}{appearance:none;border:1px solid rgba(255,255,255,.15);border-radius:999px;background:rgba(255,255,255,.055);color:#e7f4fa;padding:8px 11px;font:900 10px/1 system-ui,sans-serif;cursor:pointer}
      #${SUMMARY_ID} button:hover,#${CREATOR_ID}:hover{border-color:rgba(120,238,255,.46);background:rgba(73,192,226,.13)}
      #${SUMMARY_ID} .aof218-primary{border-color:rgba(139,238,255,.34);background:rgba(75,190,223,.10)}
      #${SUMMARY_ID} details{margin-top:10px;border-top:1px solid rgba(255,255,255,.07);padding-top:8px}
      #${SUMMARY_ID} summary{cursor:pointer;font:850 10px/1.4 system-ui,sans-serif;color:#9db6c2}
      #${SUMMARY_ID} .aof218-glossary{margin-top:6px;font:650 10.5px/1.5 system-ui,sans-serif;color:#8da7b3}
      #${CREATOR_ID}{margin-left:6px;border-color:rgba(255,176,232,.28);color:#ffd2ef;vertical-align:middle}
      #strategyADossier.aof218-collapsed{display:none!important}
      #strategyAEvidenceSupplements.aof218-simple>section:not(#strategyAG3CascadeCheckpoint):not(#strategyAG3DurableDecisionEvidence):not(#strategyAG3T0WindowOverlapProof):not(#strategyAG3PostHorizonOutcome){display:none!important}
      #strategyAEvidenceSupplements{font-size:12px!important;line-height:1.55!important}
      #strategyAEvidenceSupplements .saesh-title{font-size:13px!important;letter-spacing:.055em!important}
      #strategyAEvidenceSupplements .saesh-sub,#strategyAEvidenceSupplements .saesh-state{font-size:11px!important;line-height:1.45!important}
      #strategyADossier [style*="font-size:7px"],#strategyADossier [style*="font-size: 7px"]{font-size:10px!important;line-height:1.45!important}
      #strategyADossier [style*="font-size:8px"],#strategyADossier [style*="font-size: 8px"]{font-size:10.5px!important;line-height:1.45!important}
      #strategyADossier [style*="font-size:9px"],#strategyADossier [style*="font-size: 9px"]{font-size:11px!important;line-height:1.45!important}
      .aerith10-loader-card::before{background-size:contain!important;background-position:center top!important;background-repeat:no-repeat!important;background-color:rgba(7,10,20,.88)!important;min-height:160px!important;max-height:none!important}
      @media(max-width:1050px){#${SUMMARY_ID} .aof218-grid{grid-template-columns:repeat(2,minmax(150px,1fr))}}
      @media(max-width:620px){#${SUMMARY_ID}{padding:12px!important}#${SUMMARY_ID} .aof218-grid{grid-template-columns:1fr}#${SUMMARY_ID} h3{font-size:17px!important}.aerith10-loader-card::before{min-height:120px!important}}
    `;
    document.head.appendChild(style);
  }

  function truth() {
    let cp = null, out = null;
    try { cp = globalThis.AgentCryptoStrategyAG3CascadeCheckpoint?.snapshot?.() || null; } catch (_) {}
    try { out = globalThis.AgentCryptoStrategyAG3PostHorizonOutcome?.snapshot?.() || null; } catch (_) {}
    const temporalCertified = cp?.temporal?.certified === true || cp?.checkpoint?.temporal_contract === "CERTIFIED";
    const joined = Number(cp?.dataset?.joined_count ?? cp?.checkpoint?.joined_rows ?? 0);
    const certifiedT0 = Number(cp?.t0?.certified_rows ?? cp?.checkpoint?.certified_t0 ?? joined ?? 0);
    const replayReady = cp?.dataset?.ready === true || cp?.dataset?.status === "READY_FOR_DECISION_REPLAY" || cp?.checkpoint?.replay_dataset === "READY_FOR_DECISION_REPLAY";
    const got = Number(out?.certified_horizons || 0);
    const total = Number(out?.expected_horizons || 0);
    const outcomeLabels = String(out?.outcome_labels || cp?.checkpoint?.outcome_labels || "NOT_CERTIFIED");
    return {cp,out,temporalCertified,joined,certifiedT0,replayReady,got,total,outcomeLabels};
  }

  function plainState(t) {
    if (!t.temporalCertified) return "Historique 24 h en cours de validation.";
    if (!t.replayReady && t.joined <= 0) return "Historique prêt. Il manque encore une décision raccordée au marché.";
    if (t.total > 0 && t.got < t.total) return `Le replay est prêt. ${t.got} résultat(s) futur(s) sur ${t.total} sont déjà observés ; les autres doivent simplement arriver avec le temps.`;
    if (t.total > 0 && t.got >= t.total) return "Les horizons futurs disponibles sont observés. Gate 3 reste néanmoins en validation : cela ne constitue pas un PASS automatique.";
    return "Le replay est prêt. Les résultats après décision sont en cours de collecte.";
  }

  function nextAction(t) {
    if (!t.temporalCertified) return "Laisser l’historique 24 h se compléter ; aucune manipulation technique n’est demandée.";
    if (!t.replayReady && t.joined <= 0) return "Conserver les décisions PAPER et attendre leur raccordement naturel à l’historique.";
    if (t.total > 0 && t.got < t.total) return `Attendre les ${Math.max(0,t.total-t.got)} horizon(s) encore manquant(s). Rien à forcer, aucun ordre réel.`;
    if (t.total > 0 && t.got >= t.total) return "Passer ensuite à la certification des résultats, sans transformer ces observations en score de performance rétroactif.";
    return "Continuer la collecte PAPER ; aucune action financière réelle n’est requise.";
  }

  function jump(name) {
    let target = null;
    if (name === "top") { window.scrollTo({top:0,behavior:"smooth"}); return true; }
    if (name === "creator") target = byId("aerith10-creator");
    if (name === "market") target = document.querySelector("#market-workspace,[data-window-key='market-workspace']");
    if (!target) return false;
    if (name === "creator" && "open" in target) target.open = true;
    target.scrollIntoView({behavior:"smooth",block:"start"});
    return true;
  }

  function ensureCreatorShortcut() {
    let button = byId(CREATOR_ID);
    const anchor = byId("atlasProjectsCluster");
    if (!anchor?.parentElement) return null;
    if (!button) {
      button = document.createElement("button");
      button.id = CREATOR_ID;
      button.type = "button";
      button.textContent = "Créatrice";
      button.setAttribute("aria-label","Ouvrir Aerith-10 Créatrice");
      button.addEventListener("click", () => jump("creator"));
    }
    if (button.parentElement !== anchor.parentElement || button.previousElementSibling !== anchor) anchor.insertAdjacentElement("afterend",button);
    return button;
  }

  function technicalTargets() {
    const supplements = byId("strategyAEvidenceSupplements");
    const dossier = byId("strategyADossier");
    const dossierSeparate = !!(dossier && supplements && !dossier.contains(supplements) && !supplements.contains(dossier));
    return {supplements,dossier,dossierSeparate};
  }

  function applyDetails(visible) {
    const {supplements,dossier,dossierSeparate} = technicalTargets();
    if (supplements) supplements.classList.toggle("aof218-simple", !visible);
    if (dossierSeparate && dossier) dossier.classList.toggle("aof218-collapsed", !visible);
    const root = byId(SUMMARY_ID);
    if (root) {
      root.classList.toggle(DETAIL_CLASS, visible);
      const btn = root.querySelector("[data-aof218-details]");
      if (btn) btn.textContent = visible ? "Masquer les détails techniques" : "Afficher les détails techniques";
      root.dataset.detailsVisible = visible ? "true" : "false";
    }
    return visible;
  }

  function exportDossier() {
    const dossier = byId("strategyADossier");
    const button = Array.from(dossier?.querySelectorAll?.("button") || []).find(b => /exporter\s+dossier/i.test(String(b.textContent || "")));
    if (button) { button.click(); return true; }
    return false;
  }

  function ensureEvidenceSummary() {
    const {supplements,dossier,dossierSeparate} = technicalTargets();
    const host = supplements || dossier;
    if (!host) return null;
    let root = byId(SUMMARY_ID);
    if (!root) {
      root = document.createElement("section");
      root.id = SUMMARY_ID;
      root.setAttribute("aria-label","Résumé lisible de Gate 3");
      root.addEventListener("click", event => {
        const action = event.target.closest?.("button[data-aof218]")?.dataset.aof218;
        if (action === "details") applyDetails(root.dataset.detailsVisible !== "true");
        if (action === "market") jump("market");
        if (action === "creator") jump("creator");
        if (action === "export") exportDossier();
      });
    }

    const t = truth();
    const outcomeText = t.total > 0 ? `${t.got} / ${t.total}` : "EN COURS";
    const outcomeState = t.total > 0 && t.got >= t.total ? "ok" : "wait";
    root.innerHTML = `
      <div class="aof218-head">
        <div><div class="aof218-eyebrow">Gate 3 · vue simple</div><h3>Où on en est, sans jargon</h3><div class="aof218-sub">${esc(plainState(t))}</div></div>
        <div class="aof218-badge">PAPER ONLY · G3 EN COURS</div>
      </div>
      <div class="aof218-grid">
        <div class="aof218-card" data-state="${t.temporalCertified ? "ok" : "wait"}"><span>Historique 24 h</span><b>${t.temporalCertified ? "PRÊT" : "EN COURS"}</b><small>${t.temporalCertified ? "fenêtre marché certifiée" : "validation temporelle en cours"}</small></div>
        <div class="aof218-card" data-state="${t.joined > 0 ? "ok" : "wait"}"><span>Décisions raccordées</span><b>${esc(t.joined)}</b><small>décision(s) PAPER reliée(s) à l’historique</small></div>
        <div class="aof218-card" data-state="${outcomeState}"><span>Résultats après décision</span><b>${esc(outcomeText)}</b><small>horizons futurs réellement observés</small></div>
        <div class="aof218-card" data-state="wait"><span>Gate 3</span><b>EN COURS</b><small>aucun PASS automatique, aucun ordre réel</small></div>
      </div>
      <div class="aof218-next"><b>Suite utile :</b> ${esc(nextAction(t))}</div>
      <div class="aof218-actions">
        <button type="button" class="aof218-primary" data-aof218="details">Afficher les détails techniques</button>
        <button type="button" data-aof218="market">Voir le marché</button>
        <button type="button" data-aof218="creator">Créatrice</button>
        <button type="button" data-aof218="export">Exporter le dossier</button>
      </div>
      <details><summary>Vocabulaire : T0, Gap, replay</summary><div class="aof218-glossary"><b>T0</b> = l’instant où Strategy A prend une décision PAPER. <b>Gap (min)</b> = l’écart en minutes entre cette décision et la donnée historique certifiée. <b>Replay</b> = rejouer la décision avec les informations disponibles à T0, sans utiliser ce qui s’est passé ensuite.</div></details>`;

    if (dossierSeparate && dossier?.parentElement) {
      if (root.nextElementSibling !== dossier) dossier.insertAdjacentElement("beforebegin",root);
    } else if (host.firstElementChild !== root) {
      host.prepend(root);
    }
    root.dataset.build = BUILD;
    root.dataset.detailsVisible = "false";
    applyDetails(false);
    return root;
  }

  function refresh(reason = "explicit") {
    if (typeof document === "undefined") return Object.freeze({build:BUILD,available:false});
    cleanupLegacy();
    ensureStyle();
    const creator = ensureCreatorShortcut();
    const summary = ensureEvidenceSummary();
    if (summary) summary.dataset.refreshReason = String(reason || "explicit");
    return Object.freeze({
      build:BUILD,
      readability_first:true,
      creator_shortcut_present:!!creator,
      evidence_summary_present:!!summary,
      technical_details_default_collapsed:true,
      canonical_header_preserved:true,
      body_start_owned:false,
      state_text:summary?.querySelector(".aof218-sub")?.textContent||""
    });
  }

  function schedule(reason = "event") {
    if (queued) return;
    queued = true;
    const run = () => { queued=false; refresh(reason); };
    try { requestAnimationFrame(() => requestAnimationFrame(run)); }
    catch (_) { queueMicrotask(run); }
  }

  globalThis.AgentCryptoAdministratorOperatorFocus = Object.freeze({
    build:BUILD,
    root_id:SUMMARY_ID,
    refresh,
    jump,
    truth,
    apply_details:applyDetails,
    presentation_only:true,
    mount:"EVIDENCE_READABILITY_FIRST",
    recurring_timer:false,
    observer:false,
    storage_write:false,
    business_network_request:false,
    market_core_modified:false,
    strategy_a_business_logic_modified:false,
    real_order:false
  });

  if (typeof document !== "undefined") {
    document.addEventListener("agent-crypto:evidence-refresh-complete", () => schedule("evidence-refresh-complete"));
    document.addEventListener("agent-crypto:evidence-data-changed", () => schedule("evidence-data-changed"));
    document.addEventListener("agent-crypto:market-series-updated", () => schedule("market-series-updated"));
    document.addEventListener("agent-crypto:g3-post-horizon-mounted", () => schedule("post-horizon-mounted"));
    window.addEventListener("pageshow", () => schedule("pageshow"));
    window.addEventListener("load", () => schedule("load"), {once:true});
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => schedule("dom-ready"), {once:true});
    else schedule("script-load");
  }
})();