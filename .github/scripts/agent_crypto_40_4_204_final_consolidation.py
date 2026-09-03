#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
import re
from datetime import datetime, timezone
from pathlib import Path

BASE = Path("public/agent_crypto_erith_ia/administrator")
COORD = Path("coordination/inter_ai_dialogues/agent_crypto")
BUILD = "40.4.204"
PARENT = "40.4.203"
ENGINE = "38.15.11"
RELEASE = "FINAL MARKET OBSERVATORY CONSOLIDATION · DOMAIN SEMANTIC TRUTH · LAZY/MATH LOCK"
STATUS = "final_market_observatory_consolidation_semantic_truth_404204"
TOKEN = f"market-core-v2.0-alpha-build-{BUILD}"
NOW = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def read(path: Path) -> str:
    if not path.is_file():
        raise SystemExit(f"missing file: {path}")
    return path.read_text(encoding="utf-8")


def write(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


def sub1(text: str, pattern: str, repl: str, label: str, flags: int = 0) -> str:
    out, count = re.subn(pattern, repl, text, count=1, flags=flags)
    if count != 1:
        raise SystemExit(f"patch failed {label}: expected 1, got {count}")
    return out


def replace_build_constant(path: Path, name: str) -> None:
    text = read(path)
    text = sub1(text, rf'const\s+{re.escape(name)}\s*=\s*"40\.4\.\d+"\s*;', f'const {name} = "{BUILD}";', f"{path}:{name}")
    write(path, text)


def patch_market_stack() -> None:
    path = BASE / "js/market-stack.js"
    text = read(path)
    text = sub1(text, r'const BUILD = "40\.4\.\d+";', f'const BUILD = "{BUILD}";', "market-stack BUILD")

    if "function syncMetalsSemanticTruth404204" not in text:
        anchor = "  function syncPanels(domain){\n"
        helper = r'''  function syncMetalsSemanticTruth404204(parallel, metalsDetail, parallelRailHost){
    /* 40.4.204 — semantic truth without geometry mutation.
       Metals remains the physical rail/shell owner, but its native content must
       leave the accessibility/export tree while a parallel domain owns the view.
       visibility:hidden preserves the exact measured footprint. */
    const metalsFoundation = byId("atlasParallelMarketFoundation");
    if(metalsFoundation){
      metalsFoundation.inert = !!parallel;
      if(parallel) metalsFoundation.setAttribute("aria-hidden","true");
      else metalsFoundation.removeAttribute("aria-hidden");
    }
    if(metalsDetail){
      Array.from(metalsDetail.children).forEach(node => {
        if(node === parallelRailHost) return;
        node.inert = !!parallel;
        if(parallel) node.setAttribute("aria-hidden","true");
        else node.removeAttribute("aria-hidden");
      });
    }
    if(parallelRailHost){
      parallelRailHost.inert = !parallel;
      parallelRailHost.setAttribute("aria-hidden", parallel ? "false" : "true");
    }
    document.documentElement.dataset.domainSemanticTruth404204 = parallel ? "parallel-owned" : "native-owned";
  }

'''
        if anchor not in text:
            raise SystemExit("syncPanels anchor missing")
        text = text.replace(anchor, helper + anchor, 1)

    call_anchor = '''    if(metalsDetail){
      metalsDetail.setAttribute("aria-label", parallel ? `Lecture ${specFor(domain).title}` : "Lecture Métaux");
    }

    forceHidden(cryptoToolbar, domain !== "crypto");'''
    call_repl = '''    if(metalsDetail){
      metalsDetail.setAttribute("aria-label", parallel ? `Lecture ${specFor(domain).title}` : "Lecture Métaux");
    }
    syncMetalsSemanticTruth404204(parallel, metalsDetail, parallelRailHost);

    forceHidden(cryptoToolbar, domain !== "crypto");'''
    if "syncMetalsSemanticTruth404204(parallel, metalsDetail, parallelRailHost);" not in text:
        if call_anchor not in text:
            raise SystemExit("semantic call anchor missing")
        text = text.replace(call_anchor, call_repl, 1)

    old = "      parallel_status_row_removed:true, parallel_toolbar_single_slot:true, parallel_rail_single_owner:true,\n"
    new = "      parallel_status_row_removed:true, parallel_toolbar_single_slot:true, parallel_rail_single_owner:true,\n      domain_semantic_truth_404204:true, native_metals_semantic_cold_when_parallel:true, geometry_mutation_404204:false,\n"
    if "domain_semantic_truth_404204:true" not in text:
        if old not in text:
            raise SystemExit("runtime truth anchor missing")
        text = text.replace(old, new, 1)
    write(path, text)


def patch_parallel_css() -> None:
    path = BASE / "parallel-markets.css"
    text = read(path)
    if "40.4.204 — DOMAIN SEMANTIC TRUTH" not in text:
        text += r'''

/* =========================================================
   40.4.204 — DOMAIN SEMANTIC TRUTH
   Parallel domains reuse the proven physical Metals footprint, but native
   Metals content must not leak into accessibility/text exports. Visibility
   preserves layout geometry; the parallel overlay remains the sole semantic
   owner. No chart/data/Market Core/Atlas/Oracle behavior change.
   ========================================================= */
html[data-cyclic-market-mode="parallel"] #atlasParallelMarketFoundation{
  visibility:hidden!important;pointer-events:none!important
}
html[data-cyclic-market-mode="parallel"] #atlasMetalsDetailPanel>:not(#atlasParallelDomainRailHost404189){
  visibility:hidden!important;pointer-events:none!important
}
html[data-cyclic-market-mode="parallel"] #atlasParallelDomainRailHost404189{
  visibility:visible!important;pointer-events:auto!important
}
'''
    write(path, text)


def patch_index() -> None:
    path = BASE / "index.html"
    text = read(path)
    text = sub1(text, r'(<meta name="atlas-build" content=")[^"]+(" />)', rf'\g<1>{BUILD}\2', "meta atlas")
    text = sub1(text, r'(<meta name="administrator-build" content=")[^"]+(" />)', rf'\g<1>{BUILD}\2', "meta admin")
    text = sub1(text, r'(<meta name="administrator-release" content=")[^"]+(" />)', rf'\g<1>{RELEASE}\2', "meta release")
    text = sub1(text, r'(<meta name="atlas-asset-token" content=")[^"]+(" />)', rf'\g<1>{TOKEN}\2', "meta token")
    text = sub1(text, r'<title>Agent-Crypto @erith\.IA — Build [^ ]+ · Administrator</title>', f'<title>Agent-Crypto @erith.IA — Build {BUILD} · Administrator</title>', "title")
    text = sub1(text, r'(src="\./app\.js\?v=administrator-build-)[^"]+("\s*></script>)', rf'\g<1>{BUILD}\2', "root cache")
    text = sub1(text, r'(src="\./js/app\.js\?v=administrator-build-)[^"]+("\s*></script>)', rf'\g<1>{BUILD}\2', "admin cache")
    text = sub1(text, r'(href="\./parallel-markets\.css\?v=)[^"]+(" />)', rf'\g<1>{BUILD}\2', "parallel css cache")
    text = sub1(text, r'(href="\./market-reading-depth\.css\?v=)[^"]+(" />)', rf'\g<1>{BUILD}\2', "reading css cache")
    text = sub1(text, r'(src="\./js/market-reading-depth\.js\?v=administrator-build-)[^"]+("\s*></script>)', rf'\g<1>{BUILD}\2', "reading js cache")
    # Optional cache identities: update if present, do not create duplicate owners.
    text = re.sub(r'(src="\./js/market-stack\.js\?v=(?:administrator-build-)?)[^"]+("\s*></script>)', rf'\g<1>{BUILD}\2', text, count=1)
    text = re.sub(r'(src="\./js/parallel-markets\.js\?v=(?:administrator-build-)?)[^"]+("\s*></script>)', rf'\g<1>{BUILD}\2', text, count=1)
    text = sub1(text, r'(id="footerRelease"[^>]*>[^<]*Market Core · Build )[^ ]+( · Version : Parker Lewis Can\'t Lose</span>)', rf'\g<1>{BUILD}\2', "footer")
    write(path, text)


def patch_manifests() -> None:
    version_path = BASE / "version.json"
    mirror_path = BASE / "administrator-version.json"
    build_path = BASE / "build.json"
    version = json.loads(read(version_path))
    mirror = json.loads(read(mirror_path))
    build = json.loads(read(build_path))

    version.update({"build": BUILD, "release": RELEASE, "status": STATUS, "asset_token": TOKEN, "parent_build": PARENT, "prepared_at": NOW, "published_at": NOW})
    if isinstance(version.get("engine"), dict): version["engine"]["reference_build"] = ENGINE
    lineage = str(version.get("lineage") or "")
    if "40.4.204 final semantic truth" not in lineage:
        version["lineage"] = lineage + " → 40.4.204 final semantic truth + market reading checkpoint lock"
    version["final_checkpoint"] = {
        "market_observatory": True,
        "geometry_checkpoint": "40.4.189/40.4.195 preserved",
        "market_reading_depth": "40.4.199→40.4.203 preserved",
        "domain_semantic_truth": True,
        "historical_lazy": True,
        "historical_math_core": True,
        "prediction": False,
        "orders": False,
        "market_core_modified": False
    }

    mirror.update({"build": BUILD, "global_versioning": BUILD, "release": RELEASE, "status": STATUS, "asset_token": TOKEN, "parent_build": PARENT, "prepared_at": NOW, "published_at": NOW})
    mirror.setdefault("contracts", {})["market_observatory_final_404204"] = {
        "geometry": "40.4.189/40.4.195 locked",
        "deep_reading": "40.4.199→40.4.203 cumulative",
        "domain_semantic_truth": True,
        "native_metals_hidden_semantically_only_when_parallel": True,
        "visibility_preserves_geometry": True,
        "long_history_lazy": True,
        "historical_math_core": True,
        "new_timer": False,
        "new_observer": False,
        "orders_allowed": False,
        "market_core": ENGINE
    }

    build.update({"build": BUILD, "release": RELEASE, "published": True, "status": STATUS})
    if isinstance(build.get("engine"), dict): build["engine"]["reference_build"] = ENGINE

    write(build_path, json.dumps(build, ensure_ascii=False, indent=2) + "\n")
    write(mirror_path, json.dumps(mirror, ensure_ascii=False, indent=2) + "\n")

    files = version.get("files")
    if not isinstance(files, dict) or not files:
        raise SystemExit("version.json files map missing")
    for rel in [
        "index.html", "app.js", "js/app.js", "js/market-stack.js", "js/parallel-markets.js",
        "parallel-markets.css", "js/market-reading-depth.js", "market-reading-depth.css",
        "administrator-version.json", "build.json"
    ]:
        files.setdefault(rel, "")
    for rel in list(files):
        target = BASE / rel
        if not target.is_file():
            raise SystemExit(f"hash target missing: {rel}")
        files[rel] = hashlib.sha256(target.read_bytes()).hexdigest()
    write(version_path, json.dumps(version, ensure_ascii=False, indent=2) + "\n")


def write_handoff_docs() -> None:
    final_doc = f'''# AGENT-CRYPTO — FIN DE FIL AETHER

Version canonique de clôture : **{BUILD}**  
Date : {NOW}  
Market Core : **{ENGINE} — PROTÉGÉ**

## 1. Checkpoint final

La branche Administrator est clôturée sur **40.4.204 — {RELEASE}**.

Le checkpoint conserve sans déplacement la géométrie opérateur validée : Crypto reste le maître physique ; le cycle est **Crypto → Métaux → Indices → Énergie → Cross → Crypto**. Le slot Marché, la hauteur/largeur des graphes, le rail droit, les origines X/Y et la fluidité Firefox acquise en 40.4.189/40.4.195 ne doivent pas être réouverts sans preuve de régression.

## 2. Cascade soldée dans ce fil

- **40.4.197** — fondation Historical Depth lazy pour Indices.
- **40.4.198** — historiques longs Métaux/Énergie + Version Truth ; futures continus explicitement séparés du spot.
- **40.4.199** — Market Reading Depth Foundation sous le graphique ; Métaux enrichi.
- **40.4.200** — Indices Deep Reading.
- **40.4.201** — Energy Deep Reading ; WTI/Brent et Natural Gas séparés.
- **40.4.202** — Cross-Market Long Memory ; dates communes et corrélations observées.
- **40.4.203** — Historical Math Core : rendement, volatilité, drawdown, récupération/CAGR lorsque mesurables.
- **40.4.204** — consolidation finale : vérité sémantique des domaines + nettoyage publication + checkpoint lock.

## 3. Architecture de lecture profonde

La lecture profonde est déterministe et construite à partir de données mesurées. Elle n'utilise pas un LLM runtime pour inventer une interprétation financière. Les longues fenêtres **5a / 10a / MAX** restent chargées à la demande et mises en cache pour la session. Aucun historique long n'est requis au boot.

Les règles restent : **Base 100 = comparaison relative**, devises non neutralisées implicitement, **futures continus ≠ spot**, **corrélation ≠ causalité**, aucune moyenne inter-source artificielle, aucune prévision, aucune exécution.

## 4. Dette finale soldée en 40.4.204

Le rail et le squelette Métaux restent les propriétaires physiques éprouvés des domaines parallèles. Avant 40.4.204, leur DOM natif pouvait encore apparaître dans certains exports texte/accessibilité sous Indices, Énergie ou Cross. 40.4.204 le rend sémantiquement froid (`visibility:hidden`, `inert`, `aria-hidden`) uniquement pendant la propriété parallèle, sans `display:none`, sans reconstruction et sans mutation de géométrie. Le retour Métaux restaure son contenu natif.

La release retire aussi le workflow de cascade temporaire vide et le bytecode Python 40.4.198 accidentel, et remet le `status` des manifestes sur l'identité réelle 40.4.204.

## 5. Vérités protégées

- Market Core : **{ENGINE}**, inchangé.
- Aucun nouveau chart engine.
- Aucun nouveau timer/MutationObserver/storage owner pour Market Reading Depth.
- Aucun ordre financier.
- Bridge / Backend / Atlas / Oracle non chirurgiés par 40.4.204.
- Aether reste sur la ligne canonique des cinq marchés.

## 6. Limites connues — pas des régressions

- L'univers CoinGecko peut rester partiel (ex. 249/250) : afficher la vérité, ne pas compléter artificiellement.
- Les historiques Métaux/Énergie longs sont des futures continus fournisseur ; le spot courant reste séparé.
- Cross mélange volontairement des familles et origines différentes ; alignement sur dates communes et provenance explicite obligatoires.
- Web Classic conserve sa propre identité historique distincte de l'ENGINE Administrator.

## 7. Règle de reprise

Au prochain fil, lire d'abord `main`, `version.json`, ce document et le prompt de reprise. Ne pas traiter une dette historique comme ouverte si un build postérieur l'a soldée. Pour toute nouvelle évolution : **une dette → un propriétaire → une chirurgie → une preuve**. Toute nouvelle profondeur doit continuer sous le graphique ou par chargement à l'appel ; ne pas recharger le rail droit ni rouvrir la géométrie sans nécessité démontrée.
'''
    write(COORD / "AGENT_CRYPTO_FIN_DE_FIL_AETHER.md", final_doc)

    prompt = f'''# PROMPT DE REPRISE — AETHER / AGENT-CRYPTO

Version de reprise : **{BUILD}**  
Autorité de départ : GitHub public `BlueAzur-Hub/erith-ia-memory` → `public/agent_crypto_erith_ia/administrator/`.

Tu reprends Agent-Crypto après le checkpoint final **40.4.204**.

## À charger en priorité

1. `public/agent_crypto_erith_ia/administrator/version.json`
2. `coordination/inter_ai_dialogues/agent_crypto/AGENT_CRYPTO_FIN_DE_FIL_AETHER.md`
3. `public/agent_crypto_erith_ia/administrator/js/market-stack.js`
4. `public/agent_crypto_erith_ia/administrator/js/parallel-markets.js`
5. `public/agent_crypto_erith_ia/administrator/js/market-reading-depth.js`
6. le Fil Crypto uniquement pour l'intention/historique lorsque nécessaire.

## Contrats non négociables sans preuve

- **Market Core {ENGINE} protégé.**
- Géométrie 40.4.189/40.4.195 verrouillée : même sélecteur Marché, mêmes dimensions, même rail, même origine, aucune transition de coque.
- Cycle exact : Crypto → Métaux → Indices → Énergie → Cross → Crypto.
- Historical Depth long = lazy à l'appel ; pas au boot.
- Deep Reading = mesures déterministes, explicables, observation uniquement.
- Futures continus Métaux/Énergie séparés du spot.
- Cross : dates communes ; corrélation ≠ causalité.
- Aucun prix inventé, aucune prévision présentée comme mesure, aucun ordre financier.

## État au départ

- Crypto : cockpit natif riche + Math Core V3.
- Métaux : cockpit natif + 5a/10a/MAX + lecture profonde.
- Indices : 5/5 + 5a/10a/MAX + lecture profonde.
- Énergie : 3/3 + 5a/10a/MAX + lecture profonde.
- Cross : 5/5 + mémoire longue + corrélations + lecture profonde.
- 40.4.204 empêche le DOM Métaux natif de contaminer sémantiquement les domaines parallèles tout en conservant son empreinte physique.
- Version Truth est gardée par `.github/scripts/agent_crypto_version_truth_guard.py`.

## Première action du prochain fil

Avant toute chirurgie, vérifier le build réellement publié et demander/observer le retour Firefox si la demande touche l'interface. Si 40.4.204 est saine, considérer ce checkpoint comme base canonique. Ne pas créer une 40.4.205 uniquement pour “nettoyer” sans dette observable : la prochaine version doit répondre à une demande fonctionnelle explicite de Christophe.
'''
    write(COORD / "PROMPT_REPRISE_AETHER_AGENT_CRYPTO.md", prompt)


def main() -> None:
    # Assert starting product truth. Unrelated data/archive commits are allowed.
    manifest = json.loads(read(BASE / "version.json"))
    if str(manifest.get("build")) != PARENT:
        raise SystemExit(f"expected parent build {PARENT}, got {manifest.get('build')}")
    if str(manifest.get("engine", {}).get("reference_build")) != ENGINE:
        raise SystemExit("protected Market Core drift before patch")

    patch_market_stack()
    patch_parallel_css()
    patch_index()
    replace_build_constant(BASE / "app.js", "ATLAS_BUILD")

    admin = BASE / "js/app.js"
    text = read(admin)
    text = sub1(text, r'const ADMIN_BUILD = "40\.4\.\d+";', f'const ADMIN_BUILD = "{BUILD}";', "ADMIN_BUILD")
    text = sub1(text, r'const ADMIN_RELEASE = "[^"]+";', f'const ADMIN_RELEASE = "{RELEASE}";', "ADMIN_RELEASE")
    if f'const ENGINE_BUILD = "{ENGINE}";' not in text:
        raise SystemExit("protected ENGINE_BUILD drift")
    write(admin, text)

    replace_build_constant(BASE / "js/parallel-markets.js", "BUILD")
    replace_build_constant(BASE / "js/market-reading-depth.js", "BUILD")
    patch_manifests()
    write_handoff_docs()

    print(json.dumps({"ok": True, "build": BUILD, "release": RELEASE, "engine": ENGINE, "semantic_truth": True}, ensure_ascii=False))


if __name__ == "__main__":
    main()
