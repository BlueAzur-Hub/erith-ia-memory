/* Agent-Crypto @erith.IA — historical Local Dialogue Presentation compatibility shim.
   From 40.6.112 the active implementation lives at:

     js/local-dialogue-presentation.js

   Git carries the historical 40.6.108 implementation. This file remains only
   because older immutable entries and the stable Version Truth loader still
   reference its historical path. It owns no presentation logic itself. */
(() => {
  "use strict";
  const KEY = "__ERITH_LOCAL_DIALOGUE_PRESENTATION_LOADING__";
  if (globalThis.AgentCryptoLocalDialoguePresentation?.owner === "local-dialogue-presentation" || globalThis[KEY]) return;
  if (document.querySelector('script[data-local-dialogue-presentation-canonical="true"]')) return;

  globalThis[KEY] = true;
  const script = document.createElement("script");
  script.src = "./js/local-dialogue-presentation.js?v=canonical-owner-1";
  script.async = false;
  script.dataset.localDialoguePresentationCanonical = "true";
  script.dataset.localDialoguePresentationCompatibilityShim = "historical-406108-to-canonical";
  script.addEventListener("load", () => { globalThis[KEY] = false; }, { once: true });
  script.addEventListener("error", () => { globalThis[KEY] = false; }, { once: true });
  document.head.appendChild(script);
})();
