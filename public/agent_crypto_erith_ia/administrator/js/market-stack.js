(() => {
            "use strict";

            const BUILD = "40.4.168";
            const REVISION = "R1";
            const CONTRACT = "CRYPTO_SKELETON_MIRROR_404168R1";
            const ORDER = Object.freeze([
              Object.freeze({ id:"crypto", label:"CRYPTO", title:"Crypto", inert:false, native:"crypto" }),
              Object.freeze({ id:"metals", label:"MÉTAUX", title:"Métaux précieux et industriels", inert:false, native:"metals" }),
              Object.freeze({ id:"indices", label:"INDICES", title:"Indices / Bourse", inert:true, description:"Domaine préparé uniquement. Aucun symbole, fournisseur, historique ou graphique n’est activé avant audit Source Truth." }),
              Object.freeze({ id:"energy", label:"ÉNERGIE", title:"Énergie & matières premières", inert:true, description:"Pétrole, gaz et matières premières restent inertes jusqu’à qualification des unités, marchés, licences, historiques et fraîcheur." }),
              Object.freeze({ id:"cross-market", label:"CROSS", title:"Cross-Market Observatory", inert:true, description:"Couche transversale finale. Base 100 uniquement au-dessus de domaines déjà validés." })
            ]);

            let current = "crypto", nativeBypass = false;
            const byId = id => document.getElementById(id);
            const specFor = id => ORDER.find(x => x.id === id) || ORDER[0];
            const indexOf = id => Math.max(0, ORDER.findIndex(x => x.id === id));
            const nextOf = id => ORDER[(indexOf(id)+1)%ORDER.length];

            function nativeDomain(){ const b=byId("atlasMarketDomainSwitch"); return String(b?.dataset?.domain||"crypto")==="metals"?"metals":"crypto"; }
            function forceHidden(node, hidden){ if(!node)return; node.classList.toggle("atlas-market-force-hidden-404168",hidden); if(hidden)node.setAttribute("aria-hidden","true"); else node.removeAttribute("aria-hidden"); }

            function captureCryptoGeometry(){
              if(current!=="crypto") return;
              const shell=document.querySelector("#analyste .chart-shell"), rail=byId("detailPanel"), toolbar=document.querySelector("#analyste .chart-v2-recovery-line"), deck=byId("analyste");
              if(!shell||!deck) return;
              const sr=shell.getBoundingClientRect(), rr=rail?.getBoundingClientRect(), tr=toolbar?.getBoundingClientRect();
              if(sr.height>240) deck.style.setProperty("--atlas-market-master-shell-h",`${Math.round(sr.height)}px`);
              if(rr?.height>240) deck.style.setProperty("--atlas-market-master-rail-h",`${Math.round(rr.height)}px`);
              if(rr?.width>220) deck.style.setProperty("--atlas-market-master-rail-w",`${Math.round(rr.width)}px`);
              if(tr?.height>28) deck.style.setProperty("--atlas-market-master-toolbar-h",`${Math.round(tr.height)}px`);
              document.documentElement.dataset.cryptoSkeletonGeometry404168="captured";
            }

            function installFixedAnchor(){
              const deck=byId("analyste"), button=byId("atlasMarketDomainSwitch"); if(!deck||!button)return false;
              let slot=byId("atlasFixedMarketAnchorSlot404168");
              if(!slot){ slot=document.createElement("div"); slot.id="atlasFixedMarketAnchorSlot404168"; slot.className="atlas-fixed-market-anchor-slot-404168"; slot.setAttribute("aria-label","Sélecteur cyclique de marché"); deck.prepend(slot); }
              if(button.parentElement!==slot) slot.appendChild(button);
              button.classList.add("atlas-fixed-market-anchor-button-404168");
              button.dataset.fixedMarketAnchor404168="locked";
              return true;
            }

            function ensureHosts(){
              const chartShell=document.querySelector("#analyste .chart-shell"), recovery=document.querySelector("#analyste .chart-v2-recovery-line"), metalsDetail=byId("atlasMetalsDetailPanel");
              if(!chartShell||!recovery||!metalsDetail||!installFixedAnchor())return false;
              if(!byId("atlasCyclicMarketInertStage404168")){
                const stage=document.createElement("section"); stage.id="atlasCyclicMarketInertStage404168"; stage.className="atlas-cyclic-market-inert-stage-404168"; stage.hidden=true;
                stage.innerHTML=`<div class="atlas-cyclic-market-inert-grid-404168" aria-live="polite"><div class="atlas-cyclic-market-inert-hero-404168"><small>ERITH.IA · MARKETS OBSERVATORY</small><h3 data-cyclic-market-title>DOMAINE FUTUR</h3><p data-cyclic-market-description>Aucune donnée active.</p><div class="atlas-cyclic-market-inert-line-404168"></div></div><div class="atlas-cyclic-market-inert-gates-404168"><span><small>SOURCE TRUTH</small><b>NON QUALIFIÉE</b></span><span><small>HISTORIQUE</small><b>NON CONNECTÉ</b></span><span><small>UNITÉS</small><b>À VALIDER</b></span><span><small>MOTEUR</small><b>INERT</b></span></div><footer><b>AUCUN PRIX INVENTÉ</b><span>Squelette Crypto miroir · contenu métier non activé.</span></footer></div>`;
                chartShell.appendChild(stage);
              }
              if(!byId("atlasCyclicMarketMirrorToolbar404168")){
                const t=document.createElement("div"); t.id="atlasCyclicMarketMirrorToolbar404168"; t.className="atlas-cyclic-market-mirror-toolbar-404168"; t.hidden=true;
                t.innerHTML=`<span class="mirror-group"><small>VUE</small><b>Prix</b><b class="active">Base 100</b></span><span class="mirror-group"><small>PÉRIODE</small><b>24h</b><b>7j</b><b>30j</b><b>90j</b><b>1a</b></span><span class="mirror-group"><small>SECTION</small><b data-cyclic-market-toolbar-state>Source Truth requise</b></span>`;
                recovery.appendChild(t);
              }
              if(!byId("atlasCyclicMarketInertDetail404168")){
                const d=document.createElement("article"); d.id="atlasCyclicMarketInertDetail404168"; d.className="panel glass atlas-cyclic-market-inert-detail-404168"; d.hidden=true;
                d.innerHTML=`<header><span class="eyebrow">DÉTAIL ACTIF</span><strong data-cyclic-market-detail-title>Marché futur</strong><small>Observation seulement · aucune donnée inventée</small></header><div class="atlas-cyclic-market-inert-detail-state-404168"><span><small>État</small><b>PLANNED · INERT</b></span><span><small>Collecte</small><b>AUCUNE</b></span></div><section><b>Conditions d’activation</b><p>Source, unité, historique, fraîcheur, fallback et Source Truth doivent être validés.</p></section><section><b>Routeur</b><p data-cyclic-market-detail-next>Cliquer sur MARCHÉ pour continuer la boucle.</p></section>`;
                metalsDetail.insertAdjacentElement("afterend",d);
              }
              return true;
            }

            function setInertContent(domain){
              const s=specFor(domain), stage=byId("atlasCyclicMarketInertStage404168"), toolbar=byId("atlasCyclicMarketMirrorToolbar404168"), detail=byId("atlasCyclicMarketInertDetail404168");
              const title=stage?.querySelector("[data-cyclic-market-title]"), desc=stage?.querySelector("[data-cyclic-market-description]"), state=toolbar?.querySelector("[data-cyclic-market-toolbar-state]"), detailTitle=detail?.querySelector("[data-cyclic-market-detail-title]"), next=detail?.querySelector("[data-cyclic-market-detail-next]");
              if(title)title.textContent=s.title; if(desc)desc.textContent=s.description||"Domaine non activé."; if(state)state.textContent=`${s.label} · SOURCE TRUTH REQUISE`; if(detailTitle)detailTitle.textContent=`Lecture ${s.title}`; if(next)next.textContent=`Suivant : ${nextOf(domain).title}. Cliquer sur MARCHÉ pour continuer.`;
            }

            function syncPanels(domain){
              const inert=specFor(domain).inert, cryptoDetail=byId("detailPanel"), metalsDetail=byId("atlasMetalsDetailPanel"), inertDetail=byId("atlasCyclicMarketInertDetail404168"), cryptoToolbar=document.querySelector("#analyste .chart-v2-toolbar"), metalsToolbar=byId("atlasMetalsUnifiedToolbar"), mirrorToolbar=byId("atlasCyclicMarketMirrorToolbar404168"), stage=byId("atlasCyclicMarketInertStage404168");
              forceHidden(cryptoDetail,domain!=="crypto"); forceHidden(metalsDetail,domain!=="metals"); forceHidden(cryptoToolbar,inert||domain==="metals"); forceHidden(metalsToolbar,inert||domain==="crypto");
              if(stage)stage.hidden=!inert; if(mirrorToolbar)mirrorToolbar.hidden=!inert; if(inertDetail)inertDetail.hidden=!inert; if(inert)setInertContent(domain);
            }

            function updateButton(domain){
              const b=byId("atlasMarketDomainSwitch"), v=byId("atlasMarketDomainSwitchValue"); if(!b||!v)return; const s=specFor(domain), n=nextOf(domain); v.textContent=s.label; b.dataset.cyclicMarketDomain=s.id; b.dataset.cyclicMarketNext=n.id; b.setAttribute("aria-label",`Marché ${s.title}. Cliquer pour afficher ${n.title}.`); b.title=`Suivant : ${n.title}`;
            }

            function ensureNativeDomain(target){ const b=byId("atlasMarketDomainSwitch"); if(!b||!["crypto","metals"].includes(target)||nativeDomain()===target)return; nativeBypass=true; try{b.click();}catch(_){} nativeBypass=false; }

            function applyDomain(domain,options={}){
              const s=specFor(domain); current=s.id; const html=document.documentElement; html.dataset.cyclicMarketDomain=s.id; html.dataset.cyclicMarketMode=s.inert?"inert":"active"; html.dataset.cyclicMarketRevision=REVISION; html.dataset.marketSkeleton="crypto-master-mirror";
              if(!s.inert&&!options.nativeAlreadyHandled)ensureNativeDomain(s.native);
              requestAnimationFrame(()=>{ syncPanels(s.id); updateButton(s.id); if(s.id==="crypto")captureCryptoGeometry(); });
            }

            function onMarketSwitchClick(event){
              if(nativeBypass)return; const next=nextOf(current);
              if(current==="crypto")captureCryptoGeometry();
              if(current==="crypto"&&next.id==="metals"){
                current="metals"; document.documentElement.dataset.cyclicMarketDomain="metals"; document.documentElement.dataset.cyclicMarketMode="active"; document.documentElement.dataset.marketSkeleton="crypto-master-mirror";
                requestAnimationFrame(()=>{syncPanels("metals");updateButton("metals");}); return;
              }
              event.preventDefault(); event.stopImmediatePropagation(); applyDomain(next.id);
            }

            function init(){
              document.getElementById("atlasTrueMarketStackMetals404167R1")?.remove(); document.getElementById("atlasMarketCascade404167")?.remove();
              if(!ensureHosts()){document.documentElement.dataset.cryptoSkeletonMirror404168="missing-owner";return;}
              current=nativeDomain(); const b=byId("atlasMarketDomainSwitch"); b.dataset.cryptoSkeletonMirror404168="bound"; b.addEventListener("click",onMarketSwitchClick,true); applyDomain(current,{nativeAlreadyHandled:true}); requestAnimationFrame(captureCryptoGeometry);
              document.documentElement.dataset.cryptoSkeletonMirror404168="ready";
              globalThis.ErithCryptoSkeletonMirror404168=Object.freeze({build:BUILD,revision:REVISION,contract:CONTRACT,order:ORDER.map(x=>x.id),current:()=>current,next:()=>applyDomain(nextOf(current).id),go:d=>applyDomain(specFor(d).id),master:"crypto",mirrors:["metals","indices","energy","cross-market"],fixed_anchor:true,geometry_from_crypto:true,native_crypto_metals_reused:true,single_cockpit_surface:true,new_chart_engine:false,new_fetch_owner:false,new_timer:false,new_observer:false,new_storage_owner:false});
            }
            if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
          })();
          