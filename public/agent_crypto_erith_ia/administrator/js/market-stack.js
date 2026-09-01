(() => {
            "use strict";

            const BUILD = "40.4.167";
            const REVISION = "R3";
            const CONTRACT = "FIXED_MARKET_ANCHOR_404167R3";
            const ORDER = Object.freeze([
              Object.freeze({ id: "crypto", label: "CRYPTO", title: "Crypto", inert: false, native: "crypto" }),
              Object.freeze({ id: "metals", label: "MÉTAUX", title: "Métaux précieux et industriels", inert: false, native: "metals" }),
              Object.freeze({ id: "indices", label: "INDICES", title: "Indices / Bourse", inert: true, description: "Domaine préparé uniquement. Aucun symbole, fournisseur, historique ou graphique n’est activé avant audit Source Truth." }),
              Object.freeze({ id: "energy", label: "ÉNERGIE", title: "Énergie & matières premières", inert: true, description: "Pétrole, gaz et matières premières restent inertes jusqu’à qualification des unités, marchés, licences, historiques et fraîcheur." }),
              Object.freeze({ id: "cross-market", label: "CROSS", title: "Cross-Market Observatory", inert: true, description: "Couche transversale finale. Base 100 et mesures comparables seulement au-dessus de domaines déjà validés." })
            ]);

            let current = "crypto";
            let nativeBypass = false;
            const byId = id => document.getElementById(id);
            const specFor = id => ORDER.find(item => item.id === id) || ORDER[0];
            const indexOf = id => Math.max(0, ORDER.findIndex(item => item.id === id));
            const nextOf = id => ORDER[(indexOf(id) + 1) % ORDER.length];

            function nativeDomain() {
              const button = byId("atlasMarketDomainSwitch");
              return String(button?.dataset?.domain || "crypto") === "metals" ? "metals" : "crypto";
            }

            function forceHidden(node, hidden) {
              if (!node) return;
              node.classList.toggle("atlas-market-force-hidden-404167r3", hidden);
              if (hidden) node.setAttribute("aria-hidden", "true");
              else node.removeAttribute("aria-hidden");
            }

            function installFixedAnchor() {
              const deck = byId("analyste");
              const button = byId("atlasMarketDomainSwitch");
              if (!deck || !button) return false;
              let slot = byId("atlasFixedMarketAnchorSlot404167R3");
              if (!slot) {
                slot = document.createElement("div");
                slot.id = "atlasFixedMarketAnchorSlot404167R3";
                slot.className = "atlas-fixed-market-anchor-slot-404167r3";
                slot.setAttribute("aria-label", "Sélecteur cyclique de marché");
                deck.prepend(slot);
              }
              if (button.parentElement !== slot) slot.appendChild(button);
              button.classList.add("atlas-fixed-market-anchor-button-404167r3");
              button.dataset.fixedMarketAnchor404167R3 = "locked";
              return true;
            }

            function ensureHosts() {
              const chartShell = document.querySelector("#analyste .chart-shell");
              const recoveryLine = document.querySelector("#analyste .chart-v2-recovery-line");
              const metalsDetail = byId("atlasMetalsDetailPanel");
              if (!chartShell || !recoveryLine || !metalsDetail || !installFixedAnchor()) return false;

              if (!byId("atlasCyclicMarketInertStage404167R3")) {
                const stage = document.createElement("section");
                stage.id = "atlasCyclicMarketInertStage404167R3";
                stage.className = "atlas-cyclic-market-inert-stage-404167r3";
                stage.hidden = true;
                stage.innerHTML = `<div class="atlas-cyclic-market-inert-grid-404167r3" aria-live="polite"><div class="atlas-cyclic-market-inert-hero-404167r3"><small>ERITH.IA · MARKETS OBSERVATORY</small><h3 data-cyclic-market-title>DOMAINE FUTUR</h3><p data-cyclic-market-description>Aucune donnée active.</p><div class="atlas-cyclic-market-inert-line-404167r3" aria-hidden="true"></div></div><div class="atlas-cyclic-market-inert-gates-404167r3"><span><small>SOURCE TRUTH</small><b>NON QUALIFIÉE</b></span><span><small>HISTORIQUE</small><b>NON CONNECTÉ</b></span><span><small>UNITÉS</small><b>À VALIDER</b></span><span><small>MOTEUR</small><b>INERT</b></span></div><footer><b>AUCUN PRIX INVENTÉ</b><span>Emplacement de routage uniquement.</span></footer></div>`;
                chartShell.appendChild(stage);
              }

              if (!byId("atlasCyclicMarketMirrorToolbar404167R3")) {
                const toolbar = document.createElement("div");
                toolbar.id = "atlasCyclicMarketMirrorToolbar404167R3";
                toolbar.className = "atlas-cyclic-market-mirror-toolbar-404167r3";
                toolbar.hidden = true;
                toolbar.innerHTML = `<span class="mirror-group"><small>VUE</small><b>Prix</b><b class="active">Base 100</b></span><span class="mirror-group"><small>PÉRIODE</small><b>24h</b><b>7j</b><b>30j</b><b>90j</b><b>1a</b></span><span class="mirror-group"><small>SECTION</small><b data-cyclic-market-toolbar-state>Source Truth requise</b></span>`;
                recoveryLine.appendChild(toolbar);
              }

              if (!byId("atlasCyclicMarketInertDetail404167R3")) {
                const detail = document.createElement("article");
                detail.id = "atlasCyclicMarketInertDetail404167R3";
                detail.className = "panel glass atlas-cyclic-market-inert-detail-404167r3";
                detail.hidden = true;
                detail.innerHTML = `<header><span class="eyebrow">DÉTAIL ACTIF</span><strong data-cyclic-market-detail-title>Marché futur</strong><small>Observation seulement · aucune donnée inventée</small></header><div class="atlas-cyclic-market-inert-detail-state-404167r3"><span><small>État</small><b>PLANNED · INERT</b></span><span><small>Collecte</small><b>AUCUNE</b></span></div><section><b>Conditions d’activation</b><p>Source, unité, historique, fraîcheur, fallback et Source Truth doivent être validés.</p></section><section><b>Routeur</b><p data-cyclic-market-detail-next>Cliquer sur MARCHÉ pour continuer la boucle.</p></section>`;
                metalsDetail.insertAdjacentElement("afterend", detail);
              }
              return true;
            }

            function setInertContent(domain) {
              const spec = specFor(domain);
              const stage = byId("atlasCyclicMarketInertStage404167R3");
              const toolbar = byId("atlasCyclicMarketMirrorToolbar404167R3");
              const detail = byId("atlasCyclicMarketInertDetail404167R3");
              stage?.querySelector("[data-cyclic-market-title]") && (stage.querySelector("[data-cyclic-market-title]").textContent = spec.title);
              stage?.querySelector("[data-cyclic-market-description]") && (stage.querySelector("[data-cyclic-market-description]").textContent = spec.description || "Domaine non activé.");
              toolbar?.querySelector("[data-cyclic-market-toolbar-state]") && (toolbar.querySelector("[data-cyclic-market-toolbar-state]").textContent = `${spec.label} · SOURCE TRUTH REQUISE`);
              detail?.querySelector("[data-cyclic-market-detail-title]") && (detail.querySelector("[data-cyclic-market-detail-title]").textContent = `Lecture ${spec.title}`);
              detail?.querySelector("[data-cyclic-market-detail-next]") && (detail.querySelector("[data-cyclic-market-detail-next]").textContent = `Suivant : ${nextOf(domain).title}. Cliquer sur MARCHÉ pour continuer.`);
            }

            function syncPanels(domain) {
              const inert = specFor(domain).inert;
              const cryptoDetail = byId("detailPanel");
              const metalsDetail = byId("atlasMetalsDetailPanel");
              const inertDetail = byId("atlasCyclicMarketInertDetail404167R3");
              const cryptoToolbar = document.querySelector("#analyste .chart-v2-toolbar");
              const metalsToolbar = byId("atlasMetalsUnifiedToolbar");
              const mirrorToolbar = byId("atlasCyclicMarketMirrorToolbar404167R3");
              const stage = byId("atlasCyclicMarketInertStage404167R3");

              forceHidden(cryptoDetail, domain !== "crypto");
              forceHidden(metalsDetail, domain !== "metals");
              forceHidden(cryptoToolbar, inert || domain === "metals");
              forceHidden(metalsToolbar, inert || domain === "crypto");

              if (stage) stage.hidden = !inert;
              if (mirrorToolbar) mirrorToolbar.hidden = !inert;
              if (inertDetail) inertDetail.hidden = !inert;
              if (inert) setInertContent(domain);
            }

            function updateButton(domain) {
              const button = byId("atlasMarketDomainSwitch");
              const value = byId("atlasMarketDomainSwitchValue");
              if (!button || !value) return;
              const spec = specFor(domain), next = nextOf(domain);
              value.textContent = spec.label;
              button.dataset.cyclicMarketDomain = spec.id;
              button.dataset.cyclicMarketNext = next.id;
              button.setAttribute("aria-label", `Marché ${spec.title}. Cliquer pour afficher ${next.title}.`);
              button.title = `Suivant : ${next.title}`;
            }

            function ensureNativeDomain(target) {
              const button = byId("atlasMarketDomainSwitch");
              if (!button || !["crypto","metals"].includes(target) || nativeDomain() === target) return;
              nativeBypass = true;
              try { button.click(); } catch (_) {}
              nativeBypass = false;
            }

            function applyDomain(domain, options = {}) {
              const spec = specFor(domain);
              current = spec.id;
              document.documentElement.dataset.cyclicMarketDomain = spec.id;
              document.documentElement.dataset.cyclicMarketMode = spec.inert ? "inert" : "active";
              document.documentElement.dataset.cyclicMarketRevision = REVISION;
              if (!spec.inert && !options.nativeAlreadyHandled) ensureNativeDomain(spec.native);
              requestAnimationFrame(() => {
                syncPanels(spec.id);
                updateButton(spec.id);
              });
            }

            function onMarketSwitchClick(event) {
              if (nativeBypass) return;
              const next = nextOf(current);
              if (current === "crypto" && next.id === "metals") {
                current = "metals";
                document.documentElement.dataset.cyclicMarketDomain = "metals";
                document.documentElement.dataset.cyclicMarketMode = "active";
                requestAnimationFrame(() => { syncPanels("metals"); updateButton("metals"); });
                return;
              }
              event.preventDefault();
              event.stopImmediatePropagation();
              applyDomain(next.id);
            }

            function init() {
              document.getElementById("atlasTrueMarketStackMetals404167R1")?.remove();
              document.getElementById("atlasMarketCascade404167")?.remove();
              if (!ensureHosts()) { document.documentElement.dataset.fixedMarketAnchor404167R3 = "missing-owner"; return; }
              current = nativeDomain();
              const button = byId("atlasMarketDomainSwitch");
              button.dataset.fixedMarketAnchor404167R3 = "bound";
              button.addEventListener("click", onMarketSwitchClick, true);
              applyDomain(current, { nativeAlreadyHandled: true });
              document.documentElement.dataset.fixedMarketAnchor404167R3 = "ready";
              globalThis.ErithFixedMarketAnchor404167R3 = Object.freeze({ build:BUILD, revision:REVISION, contract:CONTRACT, order:ORDER.map(x=>x.id), current:()=>current, next:()=>applyDomain(nextOf(current).id), fixed_anchor:true, single_cockpit_surface:true, new_chart_engine:false, new_fetch_owner:false, new_timer:false, new_observer:false, new_storage_owner:false });
            }

            if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once:true }); else init();
          })();
          