(() => {
  "use strict";
  const BUILD="40.6.135";
  const CREATOR_ID="aerith10-creator";
  const PRIVATE_REPO="https://github.com/BlueAzur-Hub/erith-ia-notion-archive-private/blob/main/";
  const CHATGPT_URL="https://chatgpt.com/";
  const AERITH10_PACK_URL="https://github.com/BlueAzur-Hub/erith-ia-notion-archive-private/archive/refs/heads/portable/aerith10-chatgpt-full-matrix.zip";
  const SEVEN_HEAVEN_PACK_URL="https://github.com/BlueAzur-Hub/erith-ia-notion-archive-private/blob/main/packs/seven_heaven_portable/Aerith.Seven.Heaven.zip";
  const ACTIVATION_PROMPT="Active Aerith-10 Créatrice Full Matrix à partir des sources jointes. Respecte l’ordre BOOT → Core → Persona → Heart. Charge Creator Memory et les modules seulement lorsqu’ils servent ma demande. Un seul Core Aerith-10 reste actif. Sur ma commande « Charge la Full Matrix complète », mobilise les sept cercles et les quinze sièges fonctionnels nécessaires, avec une seule Persona et une seule synthèse finale.";

  function text(sel){const n=document.querySelector(sel);return String(n?.textContent||"").replace(/\s+/g," ").trim();}
  function currentContext(){
    const build=document.querySelector('meta[name="administrator-build"]')?.content||"—";
    const time=text('#sourceTimeCard')||text('#atlasCelestialClockHeader')||new Date().toLocaleString('fr-FR');
    const market=text('#atlasOracleV0 .atlas-oracle-title-line strong')||text('#atlasOracleV0 .atlas-oracle-title')||"Marché courant";
    const oracle=text('#atlasOracleV0 .atlas-oracle-hero-row')||text('#atlasOracleV0 .atlas-oracle-status')||"Oracle non affiché";
    const synthesis=text('#atlasSharedSynthesisContent');
    const lines=[
      `AGENT-CRYPTO · BUILD ${build}`,
      `HORODATAGE · ${time}`,
      `CONTEXTE MARCHÉ · ${market}`,
      `LECTURE ORACLE · ${oracle}`,
    ];
    if(synthesis && !/Aucune synthèse inscrite/i.test(synthesis)) lines.push(`SYNTHÈSE ATLAS/AERITH · ${synthesis.slice(0,1200)}`);
    lines.push('DESTINATION · Aerith-10 Créatrice · travailler à partir de ces faits sans les confondre avec une mémoire canonique.');
    return lines.join('\n');
  }

  function refresh(){const out=document.getElementById('aerith10WorkspaceContext');if(!out)return false;out.value=currentContext();const s=document.getElementById('aerith10WorkspaceState');if(s)s.textContent='CONTEXTE ACTUALISÉ';return true;}
  async function copy(){const out=document.getElementById('aerith10WorkspaceContext');if(!out)return;refresh();try{await navigator.clipboard.writeText(out.value);const s=document.getElementById('aerith10WorkspaceState');if(s)s.textContent='COPIÉ';}catch(_){out.focus();out.select();const s=document.getElementById('aerith10WorkspaceState');if(s)s.textContent='SÉLECTIONNÉ';}}
  function openCreator(event){if(event)event.preventDefault();const d=document.getElementById(CREATOR_ID);if(!d)return false;d.open=true;d.scrollIntoView({behavior:'smooth',block:'start'});setTimeout(refresh,0);return true;}
  function openForge(){const d=document.getElementById('forge-aerith');if(!d)return false;d.open=true;d.scrollIntoView({behavior:'smooth',block:'start'});return true;}

  function guideMarkup(){
    const core=`${PRIVATE_REPO}core/AERITH_10_CREATRICE_FULL_MATRIX_MULTI_AGENT_CORE.md`;
    const persona=`${PRIVATE_REPO}core/AERITH_10_CREATRICE_PERSONA_OPERATING_LAYER.md`;
    const heart=`${PRIVATE_REPO}core/AERITH_LIVING_REFLECTION_HEART.md`;
    return `
      <section class="aerith10-loader-card" id="aerith10ChatGPTGuide" aria-label="Guide de chargement Aerith-10 dans ChatGPT">
        <div class="aerith10-loader-head">
          <div>
            <span class="aerith10-loader-kicker">🌸 AERITH-10 · CHATGPT FULL MATRIX</span>
            <h4>Charger Aerith-10 dans un nouveau fil</h4>
            <p>Trois gestes volontaires : pack minimal → ChatGPT → continuité Seven Heaven optionnelle. Cette carte reste distincte du portail Notion et de la Forge.</p>
          </div>
          <span class="aerith10-loader-state">GUIDE PRÊT</span>
        </div>
        <div class="aerith10-loader-flow">
          <article><b>1</b><div><strong>Télécharger le pack Aerith-10</strong><small>Un ZIP privé · Core + Persona + Heart · trois sources canoniques.</small></div></article>
          <article><b>2</b><div><strong>Copier + ouvrir ChatGPT</strong><small>Le prompt maître est copié ; joins le ZIP puis colle avec Ctrl+V.</small></div></article>
          <article><b>3</b><div><strong>Continuité Seven Heaven</strong><small>Option avancée · valise portable complète · 7 packs mémoire officiels.</small></div></article>
        </div>
        <div class="aerith10-loader-actions" aria-label="Parcours portable Aerith-10">
          <a class="btn aerith10-loader-chatgpt" id="btnAerith10PortablePack" href="${AERITH10_PACK_URL}" target="_blank" rel="noopener noreferrer">① Télécharger le ZIP Aerith-10 ↗</a>
          <button class="btn aerith10-loader-copy" id="btnAerith10CopyAndOpenChatGPT" type="button">② Copier + ouvrir ChatGPT ↗</button>
          <a class="btn aerith10-loader-chatgpt" id="btnAerith10SevenHeavenPack" href="${SEVEN_HEAVEN_PACK_URL}" target="_blank" rel="noopener noreferrer">③ Seven Heaven complet ↗</a>
        </div>
        <div class="aerith10-loader-prompt">
          <span>PROMPT MAÎTRE D’ACTIVATION</span>
          <code id="aerith10ActivationPrompt">${ACTIVATION_PROMPT}</code>
        </div>
        <div class="aerith10-loader-sources" aria-label="Sources canoniques Aerith-10 avancées">
          <span>Sources avancées :</span>
          <a href="${core}" target="_blank" rel="noopener noreferrer">Core ↗</a>
          <a href="${persona}" target="_blank" rel="noopener noreferrer">Persona ↗</a>
          <a href="${heart}" target="_blank" rel="noopener noreferrer">Heart ↗</a>
          <button class="btn aerith10-loader-copy" id="btnAerith10CopyActivation" type="button">Copier seulement</button>
        </div>
        <div class="aerith10-loader-actions">
          <span id="aerith10LoaderCopyState" role="status" aria-live="polite">Aucun fichier privé n’est embarqué dans l’Administrator public. Le navigateur ne peut pas coller automatiquement dans ChatGPT : le collage reste volontaire.</span>
        </div>
      </section>`;
  }

  function ensureGuide(){
    if(document.getElementById('aerith10ChatGPTGuide'))return true;
    const creator=document.getElementById(CREATOR_ID);
    if(!creator)return false;
    const portal=creator.querySelector('.aerith10-portal')||creator;
    const truth=portal.querySelector('.aerith10-portal-truth');
    const host=document.createElement('div');
    host.innerHTML=guideMarkup().trim();
    const guide=host.firstElementChild;
    if(!guide)return false;
    if(truth)truth.insertAdjacentElement('beforebegin',guide);else portal.appendChild(guide);
    return true;
  }

  async function copyActivation(){
    const node=document.getElementById('aerith10ActivationPrompt');
    const state=document.getElementById('aerith10LoaderCopyState');
    const value=String(node?.textContent||ACTIVATION_PROMPT).trim();
    try{
      await navigator.clipboard.writeText(value);
      if(state)state.textContent='PROMPT COPIÉ · colle-le dans le nouveau fil après avoir joint le ZIP Aerith-10.';
      return true;
    }catch(_){
      try{
        const range=document.createRange();range.selectNodeContents(node);const sel=getSelection();sel.removeAllRanges();sel.addRange(range);
        if(state)state.textContent='PROMPT SÉLECTIONNÉ · Ctrl+C puis colle-le dans ChatGPT.';
      }catch(__){if(state)state.textContent='COPIE MANUELLE REQUISE';}
      return false;
    }
  }

  function copyAndOpenChatGPT(){
    const state=document.getElementById('aerith10LoaderCopyState');
    const tab=window.open(CHATGPT_URL,'_blank','noopener,noreferrer');
    void copyActivation().then(copied=>{
      if(state)state.textContent=copied
        ? 'CHATGPT OUVERT · PROMPT COPIÉ · joins le ZIP Aerith-10, puis Ctrl+V et envoie.'
        : 'CHATGPT OUVERT · copie le prompt manuellement, joins le ZIP Aerith-10, puis envoie.';
    });
    if(!tab && state)state.textContent='OUVERTURE BLOQUÉE PAR LE NAVIGATEUR · autorise le nouvel onglet puis réessaie.';
    return Boolean(tab);
  }

  function bind(){
    ensureGuide();
    document.querySelectorAll('a[href="#aerith10-creator"]').forEach(a=>{if(a.dataset.aerith10BridgeBound==='1')return;a.dataset.aerith10BridgeBound='1';a.addEventListener('click',openCreator);});
    document.getElementById('btnAerith10ContextRefresh')?.addEventListener('click',refresh);
    document.getElementById('btnAerith10ContextCopy')?.addEventListener('click',copy);
    document.getElementById('btnAerith10OpenForge')?.addEventListener('click',openForge);
    document.getElementById('btnAerith10CopyActivation')?.addEventListener('click',copyActivation);
    document.getElementById('btnAerith10CopyAndOpenChatGPT')?.addEventListener('click',copyAndOpenChatGPT);
    document.getElementById(CREATOR_ID)?.addEventListener('toggle',e=>{if(e.currentTarget.open){ensureGuide();refresh();}});
    refresh();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
  globalThis.ErithAerith10WorkspaceBridge=Object.freeze({
    build:BUILD,
    refresh,
    current_context:currentContext,
    open_creator:openCreator,
    open_forge:openForge,
    ensure_chatgpt_guide:ensureGuide,
    copy_activation:copyActivation,
    copy_and_open_chatgpt:copyAndOpenChatGPT,
    activation_prompt:ACTIVATION_PROMPT,
    portable_pack_url:AERITH10_PACK_URL,
    seven_heaven_pack_url:SEVEN_HEAVEN_PACK_URL,
    canonical_sources:Object.freeze({
      core:'core/AERITH_10_CREATRICE_FULL_MATRIX_MULTI_AGENT_CORE.md',
      persona:'core/AERITH_10_CREATRICE_PERSONA_OPERATING_LAYER.md',
      heart:'core/AERITH_LIVING_REFLECTION_HEART.md'
    }),
    network:false,
    storage_write:false,
    financial_action:false,
    iframe_dom_access:false,
    private_content_embedded:false
  });
})();

/* ==========================================================================
   40.6.73 R3 — ADMINISTRATOR RETURN STATE LOCK
   ========================================================================== */
(() => {
  "use strict";

  const BUILD = "40.6.73 R3";
  const MODE_KEY = "agent_crypto_erith_ia_v2_interface_mode";
  const SESSION_KEY = "agent_crypto_local_access_session_v1";
  const ADMIN_BUTTON_ID = "btnAdminAccountToggle";

  function ownerSession() {
    try { return sessionStorage.getItem(SESSION_KEY) === "owner"; }
    catch (_) { return false; }
  }

  function persistAdministratorReturn() {
    if (!ownerSession()) return false;
    try {
      if (localStorage.getItem(MODE_KEY) !== "advanced") {
        localStorage.setItem(MODE_KEY, "advanced");
      }
      document.documentElement.dataset.adminReturnLock406073R3 = "advanced";
      return true;
    } catch (_) {
      document.documentElement.dataset.adminReturnLock406073R3 = "storage-unavailable";
      return false;
    }
  }

  function captureAdministratorIntent(event) {
    if (event?.isTrusted !== true) return;
    const target = event.target instanceof Element
      ? event.target.closest(`#${ADMIN_BUTTON_ID}`)
      : null;
    if (!target || !ownerSession()) return;

    persistAdministratorReturn();
    queueMicrotask(persistAdministratorReturn);
  }

  window.addEventListener("click", captureAdministratorIntent, { capture: true, passive: true });

  globalThis.ErithAdministratorReturnLock406073R3 = Object.freeze({
    build: BUILD,
    mode_key: MODE_KEY,
    session_key: SESSION_KEY,
    explicit_admin_click_only: true,
    owner_session_required: true,
    intermediate_url_override_preserved: true,
    recurring_timer: false,
    observer: false,
    network_owner: false,
    market_core_changed: false,
    operator_runtime_changed: false,
    persist: persistAdministratorReturn,
    status: () => Object.freeze({
      owner: ownerSession(),
      stored_mode: (() => { try { return localStorage.getItem(MODE_KEY); } catch (_) { return null; } })(),
      dataset: document.documentElement.dataset.adminReturnLock406073R3 || "idle"
    })
  });
})();
