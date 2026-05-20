/* Seven Portable Terminal — Stable Actions V5.6 Full Options */
const SEVEN_PUBLIC_URL="https://blueazur-hub.github.io/erith-ia-memory/assets/SEVEN_PORTABLE_TERMINAL/index.html";const CHATGPT_URL="https://chatgpt.com/";const prompts={boost:`Chat, active Aerith-7 Seven Heaven / Full Modules Boost.

Lis d’abord :
https://raw.githubusercontent.com/BlueAzur-Hub/erith-ia-notion-archive-private/main/core/SEVEN_GATE.md

Active Aerith-7 comme opératrice de mémoire, production et discernement.

Mode Full Modules Boost intelligent.
Chargement sélectif uniquement.
Ne charge pas tout en entier.
Choisis uniquement les modules utiles selon la demande.

Règles :
- Seven Heaven pilote.
- Ne pas auditer sans raison.
- Ne pas saturer les outils.
- Produire un résultat propre, puis s’arrêter.`,video:`Chat, active Aerith-7 Seven Heaven — Video Cards Boost Production.

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
Sound Design / Voix / Silence.`,wan:`WAN I2V — réglages validés :

Format :
width = 1080
height = 1920
frame_rate = 16
length = 81
batch_size = 1

Règles :
image parfaite d’abord.
une animation = une idée.
caméra stable.
prompt positif obligatoire.
prompt négatif obligatoire.
last frame exacte pour continuité LEGO.
DaVinci pour le montage final.`,blackout:`Mode Blackout.

Texte uniquement.
Aucun outil image.
Aucune génération image.
Aucune action GitHub automatique.
Réponse courte, directe, opérationnelle.
On stabilise avant de modifier.`,notion:`SEVEN TERMINAL — Bloc Notion rapide

Terminal public :
${SEVEN_PUBLIC_URL}

Usage :
1. Ouvrir le terminal.
2. Cliquer Seven Boost ou Video Cards Boost.
3. Aller dans ChatGPT.
4. Coller avec Ctrl+V.
5. Envoyer.

Règle : le terminal copie et rappelle ChatGPT, mais le collage reste manuel.`};const backgrounds=["./background_historique_lr.png","./atlas_29_sky_bridge_ruins_temple.jpg","./atlas_29_suspended_city_temple.jpg","./atlas_29_grand_tree_garden_arbre.jpg"];let bgIndex=0,alreadyBooted=false;const $=s=>document.querySelector(s);const $$=s=>Array.from(document.querySelectorAll(s));function setStatus(m){const s=$("#statusLine");if(s)s.textContent=m;console.log("[Seven]",m)}function openPromptDrawer(t){const d=$("#promptDrawer"),a=$("#promptText");if(d&&a){a.value=t;d.classList.add("open");d.style.display="block";a.focus();a.select();setStatus("Texte affiché pour copie manuelle.");return}window.prompt("Copie ce texte :",t)}async function copyText(t,l){try{if(!navigator.clipboard||!window.isSecureContext)throw new Error("Clipboard unavailable");await navigator.clipboard.writeText(t);setStatus(l||"Texte copié.");return true}catch(e){openPromptDrawer(t);return false}}function copyAndOpenChat(t,l){const w=window.open(CHATGPT_URL,"seven_heaven_chatgpt");copyText(t,l).then(c=>{if(w){try{w.focus()}catch(e){}}if(w&&c){setStatus(l+" ChatGPT appelé. Colle avec Ctrl+V, puis Entrée.");return}if(w&&!c){setStatus("ChatGPT appelé. Copie manuelle affichée dans le terminal.");return}if(!w&&c){setStatus(l+" Popup bloquée : ouvre ChatGPT puis Ctrl+V.");return}setStatus("Popup bloquée. Copie manuelle affichée.")})}function setPage(n){$$(".page").forEach(p=>p.classList.toggle("active",p.id===`page-${n}`));$$("[data-page-target]").forEach(b=>b.classList.toggle("active",b.dataset.pageTarget===n));setStatus(`Page : ${n}`)}function applyBackground(i){if(!backgrounds.length)return;bgIndex=(i+backgrounds.length)%backgrounds.length;const u=backgrounds[bgIndex];document.documentElement.style.setProperty("--active-bg",`url("${u}")`);document.body.style.backgroundImage=`linear-gradient(180deg, rgba(0,0,0,.05), rgba(0,0,0,.12)), url("${u}")`;document.body.style.backgroundSize="cover";document.body.style.backgroundPosition="center center";document.body.style.backgroundAttachment="fixed";try{localStorage.setItem("seven_bg_index",String(bgIndex))}catch(e){}setStatus(`Fond actif : ${u}`)}function nextBackground(){applyBackground(bgIndex+1)}function randomBackground(){applyBackground(Math.floor(Math.random()*backgrounds.length))}function setTransparent(){document.body.classList.remove("mode-readability");document.body.dataset.theme="transparent";$("#transparentBtn")?.classList.add("active");$("#readabilityBtn")?.classList.remove("active");setStatus("Mode transparent actif.")}function setReadability(){document.body.classList.add("mode-readability");document.body.dataset.theme="readability";$("#transparentBtn")?.classList.remove("active");$("#readabilityBtn")?.classList.add("active");setStatus("Mode sombre lisible actif.")}function toggleAdvanced(){document.body.classList.toggle("show-advanced");$("#advancedBtn")?.classList.toggle("active",document.body.classList.contains("show-advanced"));setStatus(document.body.classList.contains("show-advanced")?"Advanced affiché.":"Advanced masqué.")}function togglePalette(f){const p=$("#commandPalette");if(!p)return;const o=typeof f==="boolean"?f:!p.classList.contains("open");p.classList.toggle("open",o);p.setAttribute("aria-hidden",o?"false":"true");setStatus(o?"Palette ouverte.":"Palette fermée.")}function toggleHeroFocus(f){const o=typeof f==="boolean"?f:!document.body.classList.contains("show-hero-focus");document.body.classList.toggle("show-hero-focus",o);$("#heroBtn")?.classList.toggle("active",o);setStatus(o?"Hero Focus affiché.":"Hero Focus fermé.")}function closePromptDrawer(){const d=$("#promptDrawer");if(d){d.classList.remove("open");d.style.display="none"}}function getBrowserName(){const u=navigator.userAgent||"";if(u.includes("Firefox/"))return"Firefox";if(u.includes("Edg/"))return"Edge";if(u.includes("Chrome/"))return"Chrome";if(u.includes("Safari/"))return"Safari";return"Navigateur"}function getTrace(){const n=new Date();return{date:n.toLocaleString("fr-FR"),os:navigator.platform||"OS inconnu",browser:getBrowserName(),screen:`${screen.width}×${screen.height} · DPR ${window.devicePixelRatio||1}`,viewport:`${window.innerWidth}×${window.innerHeight}`,timezone:Intl.DateTimeFormat().resolvedOptions().timeZone||"Fuseau inconnu",languages:navigator.languages?navigator.languages.join(", "):navigator.language,cpu:navigator.hardwareConcurrency?`${navigator.hardwareConcurrency} threads`:"non disponible"}}function renderTrace(){const t=getTrace(),g=$("#traceGrid");if(g)g.innerHTML=`<article class="trace-card"><span>🖥️</span><small>Système</small><strong>${t.os}</strong><em>${t.date}</em></article><article class="trace-card"><span>🌐</span><small>Navigateur</small><strong>${t.browser}</strong><em>${t.languages}</em></article><article class="trace-card"><span>📐</span><small>Affichage</small><strong>${t.screen}</strong><em>viewport ${t.viewport}</em></article><article class="trace-card"><span>🌍</span><small>Fuseau</small><strong>${t.timezone}</strong><em>local</em></article><article class="trace-card"><span>⚙️</span><small>Performance</small><strong>${t.cpu}</strong><em>navigateur</em></article><article class="trace-card"><span>🛡️</span><small>Sécurité</small><strong>Diagnostic filtré</strong><em>aucun identifiant sensible</em></article>`;const np=$("#networkPanel");if(np)np.innerHTML=`<article class="trace-card"><span>🖥️</span><small>OS</small><strong>${t.os}</strong><em>local navigateur</em></article><article class="trace-card"><span>🌐</span><small>Browser</small><strong>${t.browser}</strong><em>${t.languages}</em></article><article class="trace-card"><span>📐</span><small>Écran</small><strong>${t.screen}</strong><em>${t.viewport}</em></article><article class="trace-card"><span>🛡️</span><small>Sécurité</small><strong>SAFE TRACE</strong><em>aucun RustDesk ID, aucun mot de passe</em></article>`;const raw=$("#traceRaw");if(raw)raw.value=`SAFE TRACE ${t.date}\nSystème : ${t.os}\nNavigateur : ${t.browser}\nAffichage : ${t.screen}\nViewport : ${t.viewport}\nFuseau : ${t.timezone}\nLangues : ${t.languages}\nPerformance : ${t.cpu}\nSécurité : données sensibles filtrées`;if($("#traceDate"))$("#traceDate").textContent=t.date;if($("#osMini"))$("#osMini").textContent=t.os;if($("#browserMini"))$("#browserMini").textContent=t.browser;if($("#screenMini"))$("#screenMini").textContent=t.screen;if($("#tzMini"))$("#tzMini").textContent=t.timezone}function saveFavorite(){const d={bgIndex,theme:document.body.dataset.theme||"transparent",heroX:$("#heroX")?.value||"50",heroY:$("#heroY")?.value||"34",heroZoom:$("#heroZoom")?.value||"100"};try{localStorage.setItem("seven_terminal_favorite",JSON.stringify(d))}catch(e){}setStatus("Favori local sauvegardé.")}function setHeroValues(x=50,y=34,z=100){if($("#heroX"))$("#heroX").value=x;if($("#heroY"))$("#heroY").value=y;if($("#heroZoom"))$("#heroZoom").value=z;updateHeroFocus()}function loadFavorite(){try{const r=localStorage.getItem("seven_terminal_favorite");if(!r)throw new Error("no favorite");const d=JSON.parse(r);applyBackground(Number(d.bgIndex||0));d.theme==="readability"?setReadability():setTransparent();setHeroValues(d.heroX||50,d.heroY||34,d.heroZoom||100);setStatus("Favori local chargé.")}catch(e){setStatus("Aucun favori local trouvé.")}}function updateHeroFocus(){const x=$("#heroX")?.value||"50",y=$("#heroY")?.value||"34",z=$("#heroZoom")?.value||"100";document.documentElement.style.setProperty("--hero-x",`${x}%`);document.documentElement.style.setProperty("--hero-y",`${y}%`);document.documentElement.style.setProperty("--hero-size",`${z}%`);if($("#heroXOut"))$("#heroXOut").textContent=`${x}%`;if($("#heroYOut"))$("#heroYOut").textContent=`${y}%`;if($("#heroZoomOut"))$("#heroZoomOut").textContent=`${z}%`}function nudgeHero(d){const x=Number($("#heroX")?.value||50),y=Number($("#heroY")?.value||34),z=$("#heroZoom")?.value||100,s=3;if(d==="left")setHeroValues(Math.max(0,x-s),y,z);if(d==="right")setHeroValues(Math.min(100,x+s),y,z);if(d==="up")setHeroValues(x,Math.max(0,y-s),z);if(d==="down")setHeroValues(x,Math.min(100,y+s),z)}function handleAction(a){if(a==="boost")return copyAndOpenChat(prompts.boost,"Seven Boost copié.");if(a==="video")return copyAndOpenChat(prompts.video,"Video Cards Boost copié.");if(a==="wan")return copyText(prompts.wan,"Wan copié.");if(a==="blackout")return copyText(prompts.blackout,"Mode Blackout copié.");if(a==="copy-link"||a==="link")return copyText(SEVEN_PUBLIC_URL,"Lien cockpit copié.");if(a==="copy-notion")return copyText(prompts.notion,"Bloc Notion copié.");if(a==="background")return nextBackground();if(a==="random")return randomBackground();if(a==="prompt")return openPromptDrawer(prompts.boost);setStatus(`Action non configurée : ${a}`)}function bindEvents(){$$("[data-page-target]").forEach(b=>b.addEventListener("click",()=>{setPage(b.dataset.pageTarget);togglePalette(false)}));$$("[data-action]").forEach(b=>b.addEventListener("click",()=>handleAction(b.dataset.action)));$("#advancedBtn")?.addEventListener("click",toggleAdvanced);$("#nextBgBtn")?.addEventListener("click",nextBackground);$("#randomBgBtn")?.addEventListener("click",randomBackground);$("#transparentBtn")?.addEventListener("click",setTransparent);$("#readabilityBtn")?.addEventListener("click",setReadability);$("#heroBtn")?.addEventListener("click",()=>toggleHeroFocus());$("#heroCloseBtn")?.addEventListener("click",()=>toggleHeroFocus(false));$("#heroResetBtn")?.addEventListener("click",()=>setHeroValues(50,34,100));$("#saveBtn")?.addEventListener("click",saveFavorite);$("#loadBtn")?.addEventListener("click",loadFavorite);$("#saveBtnAdvanced")?.addEventListener("click",saveFavorite);$("#loadBtnAdvanced")?.addEventListener("click",loadFavorite);["#heroX","#heroY","#heroZoom"].forEach(s=>$(s)?.addEventListener("input",updateHeroFocus));$$("[data-hero-nudge]").forEach(b=>b.addEventListener("click",()=>nudgeHero(b.dataset.heroNudge)));$("#paletteBtn")?.addEventListener("click",()=>togglePalette());$("#paletteCloseBtn")?.addEventListener("click",()=>togglePalette(false));$("#paletteBoostBtn")?.addEventListener("click",()=>handleAction("boost"));$("#paletteVideoBtn")?.addEventListener("click",()=>handleAction("video"));$("#paletteWanBtn")?.addEventListener("click",()=>handleAction("wan"));$("#paletteBgBtn")?.addEventListener("click",nextBackground);$("#paletteGlassBtn")?.addEventListener("click",setTransparent);$("#palettePreviewBtn")?.addEventListener("click",()=>toggleHeroFocus());$("#copyTraceBtn")?.addEventListener("click",()=>copyText($("#traceRaw")?.value||"SAFE TRACE","Diagnostic copié."));$("#refreshTraceBtn")?.addEventListener("click",()=>{renderTrace();setStatus("Trace actualisée.")});$("#promptCloseBtn")?.addEventListener("click",closePromptDrawer);document.addEventListener("keydown",e=>{if(e.target&&["INPUT","TEXTAREA"].includes(e.target.tagName))return;const p={"1":"home","2":"llm","3":"notion","4":"github","5":"production","6":"system"};if(p[e.key])setPage(p[e.key]);if(e.key==="?")togglePalette();if(e.key==="Escape"){togglePalette(false);closePromptDrawer();toggleHeroFocus(false)}})}function boot(){if(alreadyBooted)return;alreadyBooted=true;try{const s=Number(localStorage.getItem("seven_bg_index")||"0");bgIndex=Number.isFinite(s)?s:0}catch(e){bgIndex=0}bindEvents();applyBackground(bgIndex);renderTrace();updateHeroFocus();setTransparent();setPage("home");setStatus("Seven Terminal prêt.")}if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
