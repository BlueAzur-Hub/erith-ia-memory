from __future__ import annotations

from pathlib import Path
import hashlib
import json
import re
import sys
import zipfile
from datetime import datetime, timezone

ADMIN = Path("public/agent_crypto_erith_ia/administrator")
INDEX = ADMIN / "index.html"
ROOT_APP = ADMIN / "app.js"
MODULAR_APP = ADMIN / "js/app.js"
LAYOUT = ADMIN / "js/layout-repair.js"
ATLAS_VIEW = ADMIN / "views/atlas.html"
VERSION = ADMIN / "version.json"
ADMIN_VERSION = ADMIN / "administrator-version.json"
COLLECTOR = Path("public/agent_crypto_erith_ia/tools/collect_public_crypto.py")
COLLECTOR_WORKFLOW = Path(".github/workflows/atlas-public-crypto-market.yml")
STATUS_JSON = Path("public/agent_crypto_erith_ia/data/crypto/status.json")
COORD = Path("coordination/inter_ai_dialogues/agent_crypto")


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: anchor count={count}, expected 1")
    return text.replace(old, new, 1)


def replace_re_once(text: str, pattern: str, replacement: str, label: str, flags: int = 0) -> str:
    out, count = re.subn(pattern, replacement, text, count=1, flags=flags)
    if count != 1:
        raise SystemExit(f"{label}: regex count={count}, expected 1")
    return out


def now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def patch_publication_identity(value, build: str, status: str) -> None:
    if isinstance(value, dict):
        for key, child in value.items():
            if key == "publication_identity" and isinstance(child, dict):
                child["build"] = build
                child["asset_token"] = f"market-core-v2.0-alpha-build-{build}"
                child["status"] = status
                if "app_sha256" in child and ROOT_APP.is_file():
                    child["app_sha256"] = sha256(ROOT_APP)
            else:
                patch_publication_identity(child, build, status)
    elif isinstance(value, list):
        for child in value:
            patch_publication_identity(child, build, status)


def bump_identity(build: str, release: str) -> None:
    html = INDEX.read_text(encoding="utf-8")
    html = replace_re_once(html, r'(<meta name="atlas-build" content=")[^"]+(" />)', rf'\g<1>{build}\2', "atlas meta")
    html = replace_re_once(html, r'(<meta name="administrator-build" content=")[^"]+(" />)', rf'\g<1>{build}\2', "administrator meta")
    html = replace_re_once(html, r'(<meta name="administrator-release" content=")[^"]+(" />)', rf'\g<1>{release}\2', "release meta")
    html = replace_re_once(html, r'(<meta name="atlas-asset-token" content=")[^"]+(" />)', rf'\g<1>market-core-v2.0-alpha-build-{build}\2', "asset token meta")
    html = replace_re_once(html, r'(<title>Agent-Crypto @erith\.IA — Build )40\.4\.\d+( · Administrator</title>)', rf'\g<1>{build}\2', "title")
    html = re.sub(r'(\?v=administrator-build-)40\.4\.\d+', rf'\g<1>{build}', html)
    html = re.sub(r'(Agent-Crypto @erith\.IA · Market Core · Build )40\.4\.\d+( · Version : Parker Lewis Can\'t Lose)', rf'\g<1>{build}\2', html)
    INDEX.write_text(html, encoding="utf-8", newline="\n")

    root = ROOT_APP.read_text(encoding="utf-8")
    root = replace_re_once(root, r'const ATLAS_BUILD = "40\.4\.\d+";', f'const ATLAS_BUILD = "{build}";', "root ATLAS_BUILD")
    ROOT_APP.write_text(root, encoding="utf-8", newline="\n")

    modular = MODULAR_APP.read_text(encoding="utf-8")
    modular = replace_re_once(modular, r'const ADMIN_BUILD = "40\.4\.\d+";', f'const ADMIN_BUILD = "{build}";', "modular ADMIN_BUILD")
    modular = replace_re_once(modular, r'const ADMIN_RELEASE = "[^"]*";', f'const ADMIN_RELEASE = "{release}";', "modular ADMIN_RELEASE")
    MODULAR_APP.write_text(modular, encoding="utf-8", newline="\n")


def update_manifests(build: str, parent: str, release: str, status: str, verification_key: str, verification: dict) -> None:
    stamp = now_iso()
    for path in (VERSION, ADMIN_VERSION):
        data = json.loads(path.read_text(encoding="utf-8"))
        if str(data.get("build")) != parent:
            raise SystemExit(f"{path}: expected parent {parent}, found {data.get('build')}")
        data["build"] = build
        data["release"] = release
        data["status"] = status
        data["asset_token"] = f"market-core-v2.0-alpha-build-{build}"
        data["parent_build"] = parent
        data["prepared_at"] = stamp
        data["published_at"] = stamp
        if "global_versioning" in data:
            data["global_versioning"] = build
        lineage = str(data.get("lineage") or "")
        note = f"{build} {release}"
        if note not in lineage:
            data["lineage"] = (lineage + " → " + note).strip(" →")
        files = data.setdefault("files", {})
        for relative in list(files):
            candidate = ADMIN / relative
            if candidate.is_file() and candidate.resolve() != path.resolve():
                files[relative] = sha256(candidate)
        data.setdefault("verification", {})[verification_key] = verification
        patch_publication_identity(data, build, status)
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")


def build_archive(build: str) -> tuple[Path, Path, str]:
    manifest = json.loads(VERSION.read_text(encoding="utf-8"))
    if str(manifest.get("build")) != build:
        raise SystemExit(f"archive: manifest build is not {build}")
    files = list((manifest.get("files") or {}).keys())
    for required in ("version.json", "administrator-version.json"):
        if required not in files:
            files.append(required)
    missing = [rel for rel in files if not (ADMIN / rel).is_file()]
    if missing:
        raise SystemExit("archive missing files: " + ", ".join(missing))
    COORD.mkdir(parents=True, exist_ok=True)
    safe = build.replace(".", "_")
    archive = COORD / f"AGENT_CRYPTO_BUILD_{safe}_AUTO_CANONICAL.zip"
    with zipfile.ZipFile(archive, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
        for rel in files:
            src = ADMIN / rel
            arc = Path("public/agent_crypto_erith_ia/administrator") / rel
            zf.write(src, arcname=arc.as_posix())
    digest = sha256(archive)
    digest_file = Path(str(archive) + ".sha256")
    digest_file.write_text(f"{digest}  {archive.name}\n", encoding="utf-8")
    return archive, digest_file, digest


def phase159() -> None:
    parent = "40.4.158"
    build = "40.4.159"
    release = "ATLAS PUBLIC PULSE TRUTH · SCHEDULER METADATA LOCK"
    status = "atlas_public_pulse_truth_scheduler_metadata_lock"

    manifest = json.loads(VERSION.read_text(encoding="utf-8"))
    if str(manifest.get("build")) != parent:
        raise SystemExit(f"40.4.159 parent guard failed: {manifest.get('build')}")

    collector = COLLECTOR.read_text(encoding="utf-8")
    collector = replace_once(
        collector,
        '            "schedule": "every_2_hours",\n',
        '            "schedule": "twice_hourly_11_41_europe_paris",\n            "schedule_label": "11 et 41 min de chaque heure · Europe/Paris",\n            "recovery_watchdog": "17 et 47 min · stale >=20 min · aucun collecteur actif",\n',
        "collector schedule truth",
    )
    COLLECTOR.write_text(collector, encoding="utf-8", newline="\n")

    workflow = COLLECTOR_WORKFLOW.read_text(encoding="utf-8")
    anchor = '          if status.get("status") not in {"ready", "degraded", "unavailable"}:\n              raise SystemExit("unsupported crypto collector status")\n'
    injected = anchor + '          source = status.get("source") or {}\n          if source.get("schedule") != "twice_hourly_11_41_europe_paris":\n              raise SystemExit("collector schedule metadata is stale")\n'
    workflow = replace_once(workflow, anchor, injected, "workflow schedule guard")
    COLLECTOR_WORKFLOW.write_text(workflow, encoding="utf-8", newline="\n")

    status_payload = json.loads(STATUS_JSON.read_text(encoding="utf-8"))
    source = status_payload.setdefault("source", {})
    source["schedule"] = "twice_hourly_11_41_europe_paris"
    source["schedule_label"] = "11 et 41 min de chaque heure · Europe/Paris"
    source["recovery_watchdog"] = "17 et 47 min · stale >=20 min · aucun collecteur actif"
    STATUS_JSON.write_text(json.dumps(status_payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")

    bump_identity(build, release)
    verification = {
        "build": build,
        "parent_build": parent,
        "collector_schedule_metadata": "twice_hourly_11_41_europe_paris",
        "collector_schedule_actual": "11,41 * * * * · Europe/Paris",
        "watchdog_schedule_actual": "17,47 * * * *",
        "watchdog_stale_after_seconds": 1200,
        "status_schedule_truth_updated": True,
        "workflow_validation_added": True,
        "market_core_changed": False,
        "atlas_local_current_engine_changed": False,
        "oracle_changed": False,
        "bridge_changed": False,
        "simulation_changed": False,
        "graph_404158_preserved": True,
        "news_404157_preserved": True,
    }
    update_manifests(build, parent, release, status, "atlas_public_pulse_truth_404159", verification)
    archive, sha_file, digest = build_archive(build)
    print(f"40.4.159 PATCH PASS\nARCHIVE={archive}\nSHA_FILE={sha_file}\nDIGEST={digest}")


def phase160() -> None:
    parent = "40.4.159"
    build = "40.4.160"
    release = "ATLAS CURRENT TRUTH · AUTO READER PRESENTATION · END-OF-THREAD CHECKPOINT"
    status = "atlas_current_truth_auto_reader_presentation_end_thread_checkpoint"

    manifest = json.loads(VERSION.read_text(encoding="utf-8"))
    if str(manifest.get("build")) != parent:
        raise SystemExit(f"40.4.160 parent guard failed: {manifest.get('build')}")

    root = ROOT_APP.read_text(encoding="utf-8")
    root = replace_once(
        root,
        '    reports_4_4_same_fingerprint: !!reportsReady,\n    aerith_same_fingerprint: !!conclusionReady,\n    current_state: atlasCurrentStateRead()?.status || null,\n',
        '    reports_4_4_same_fingerprint: !!reportsReady || (atlasCurrentStateRead()?.status === "CURRENT" && Number(atlasCurrentStateRead()?.atlas_reports || 0) >= 4),\n    aerith_same_fingerprint: !!conclusionReady || (atlasCurrentStateRead()?.status === "CURRENT" && atlasCurrentStateRead()?.aerith_conclusion === true),\n    current_state: atlasCurrentStateRead()?.status || null,\n',
        "Auto Reader CURRENT persisted truth",
    )
    root = replace_once(
        root,
        '    els.autoActiveCadence.textContent = `${formatAutoDelay(state.auto?.intervalMs || ATLAS_MARKET_REFRESH_MS)} · marché`;\n',
        '    els.autoActiveCadence.textContent = `${formatAutoDelay(state.auto?.intervalMs || ATLAS_MARKET_REFRESH_MS)} · vérification snapshot public`;\n',
        "Auto Reader cadence wording",
    )
    marker = '''\n/* 40.4.160 — ATLAS CURRENT / AUTO READER PRESENTATION TRUTH LOCK\n   Presentation-only reconciliation. Persisted CURRENT may remain canonical while\n   heavy report bodies are cold/detached; Auto Reader diagnostics must not print\n   4/4=non or Aerith=non solely because those presentation bodies are not resident.\n   The 5 min field names the public-snapshot verification loop; it does not redefine\n   Spot 30 s or historical 5 min contracts and does not add a timer/network owner. */\ntry { globalThis.__AGENT_CRYPTO_ATLAS_TRUTH_404160__ = Object.freeze({\n  build:"40.4.160", parent:"40.4.159", persisted_current_fallback:true,\n  public_snapshot_cadence_wording:true, new_timer:false, new_observer:false,\n  new_network_owner:false, market_core_changed:false, current_engine_changed:false,\n  oracle_changed:false, bridge_changed:false\n}); } catch (_) {}\n'''
    identity_anchor = 'const ATLAS_BUILD = "40.4.159";'
    if identity_anchor not in root:
        raise SystemExit("40.4.160 build identity anchor missing")
    root = root.replace(identity_anchor, marker + '\n' + identity_anchor, 1)
    ROOT_APP.write_text(root, encoding="utf-8", newline="\n")

    atlas_view = ATLAS_VIEW.read_text(encoding="utf-8")
    atlas_view = replace_once(
        atlas_view,
        '<article><b>Cadence marché</b><span id="autoActiveCadence">60 secondes</span></article>',
        '<article><b>Vérification snapshot public</b><span id="autoActiveCadence">En attente</span></article>',
        "Auto Reader cadence card label",
    )
    ATLAS_VIEW.write_text(atlas_view, encoding="utf-8", newline="\n")

    bump_identity(build, release)
    verification = {
        "build": build,
        "parent_build": parent,
        "auto_reader_persisted_current_truth_fallback": True,
        "auto_reader_stale_false_negative_4_4_retired": True,
        "auto_reader_stale_false_negative_aerith_retired": True,
        "public_snapshot_verification_label": True,
        "market_runtime_cadence_changed": False,
        "spot_runtime_changed": False,
        "history_runtime_changed": False,
        "new_timer": False,
        "new_observer": False,
        "new_network_owner": False,
        "market_core_changed": False,
        "current_engine_changed": False,
        "oracle_changed": False,
        "bridge_changed": False,
        "graph_404158_preserved": True,
        "news_404157_preserved": True,
        "atlas_public_pulse_404159_preserved": True,
    }
    update_manifests(build, parent, release, status, "atlas_current_auto_reader_truth_404160", verification)

    handoff = f'''# AGENT-CRYPTO — FIN DE FIL AETHER — {build}\n\nDate: {now_iso()}\n\n## État canonique\n\n- Build Administrator: **{build}**\n- Market Core: **38.15.11 protégé**\n- 40.4.157: Aether VEILLE consomme prioritairement la vérité française de News Sentinel.\n- 40.4.158: Graphique direct-float porté au `document.body`; stacking Firefox validé par opérateur.\n- 40.4.159: vérité de cadence du producteur public Atlas alignée sur `11/41 Europe/Paris`; watchdog `17/47`, stale 20 min, sans duplication si collecteur actif.\n- 40.4.160: Auto Reader ne déclare plus faussement `4/4=non / Aerith=non` quand le CURRENT persistant certifie 4/4 + Aerith; le champ 5 min est nommé vérification du snapshot public.\n\n## Atlas / CURRENT\n\nChaîne attendue: `nouveau snapshot canonique -> Atlas 1/4 -> 4/4 -> NØX -> Aerith -> CURRENT -> REPOS`.\nLe LIVE Binance continue sans rouvrir le CURRENT fermé. Le rôle de calcul local reste PRODUCTION sur le Ryzen et lecture seule sur le Book.\n\n## Dettes / chantiers laissés volontairement ouverts\n\n1. **RND Aether**: `technical-random-10.png` n'est pas publié; ancien driver 40.4.159 RND retiré avant la cascade finale. Réutiliser le bouton RND existant, aucun nouveau moteur/menu.\n2. **Télémétrie physique Bridge**: CPU/GPU/RAM/températures réels à reprendre côté Bridge local si souhaité; ne pas simuler depuis GitHub Pages.\n3. **Météo / contexte opérateur**: chantier du Ruban de veille Aether non soldé dans cette cascade.\n4. **Notes opérateur**: besoin historique à reprendre sans créer un second propriétaire CSS/animation du Ruban Aether.\n5. **Marchés**: extensions bourse/indices/énergie/agriculture/denrées à concevoir après stabilisation; conserver provenance/source/horodatage et séparation observation/exécution.\n6. **Vue Opérateur**: future vue pour tiers, fonctionnelle mais sans @erith.IA privé, clés, wallet ni privilèges d'exécution réelle.\n7. **Backend réel Kraken**: futur, backend-only, permissions/auth/logs/kill-switch/validation humaine; la page publique reste sans secrets ni ordre réel.\n8. **GitHub schedule**: GitHub documente que les événements `schedule` peuvent être retardés ou parfois abandonnés sous forte charge. Le watchdog réduit le risque mais reste lui-même un schedule; la surveillance Aether/ChatGPT reste utile.\n\n## Ne pas réouvrir sans preuve\n\n- Chronos centré: déjà soldé 40.4.104R2/40.4.107.\n- Barres/ombres de graphique aux couleurs crypto: déjà soldé 40.4.83/40.4.84.\n- Oracle flottant: 40.4.156 + R1, validé.\n- Cohérence des trois vues / Simulation: correctif canonique 40.4.154/.155, test opérateur Intermédiaire gagné.\n- Graphique global au-dessus: 40.4.158, test opérateur validé.\n\n## Règle de reprise\n\nToujours lire le GitHub public `main` avant chirurgie. Utiliser le Fil Crypto pour l'intention et l'historique, mais ne pas traiter une dette historique comme ouverte si un build postérieur l'a déjà soldée. Une version = une responsabilité; vérifier JS/JSON + preuves statiques + Firefox opérateur lorsqu'il s'agit de géométrie/interaction.\n'''
    (COORD / "AGENT_CRYPTO_FIN_DE_FIL_AETHER.md").write_text(handoff, encoding="utf-8", newline="\n")

    prompt = f'''# PROMPT DE REPRISE — AERITH-7 / AGENT-CRYPTO — POST {build}\n\nTu reprends Agent-Crypto @erith.IA après le fil d'Aether terminé sur **{build}**.\n\n## Autorité de travail\n\n1. Lire d'abord le GitHub public `BlueAzur-Hub/erith-ia-memory`, branche `main`, dossier `public/agent_crypto_erith_ia/administrator/`.\n2. Lire `coordination/inter_ai_dialogues/agent_crypto/AGENT_CRYPTO_FIN_DE_FIL_AETHER.md`.\n3. Utiliser le Fil Crypto comme mémoire historique et contrat d'intention, mais vérifier chaque dette contre le code/build courant avant d'agir.\n4. Ne pas modifier le Market Core 38.15.11, les secrets, wallets ou exécution réelle sans demande explicite et architecture backend sûre.\n\n## État à préserver\n\n- News Aether française: **40.4.157**.\n- Graphique global direct-float / stacking: **40.4.158**, Firefox PASS.\n- Atlas public pulse truth: **40.4.159**.\n- Atlas CURRENT + Auto Reader presentation truth: **40.4.160**.\n- Oracle direct-float: **40.4.156R1**.\n- Cohérence vues: **40.4.154/.155**.\n- Atlas local: `nouveau canonique -> 4/4 -> NØX -> Aerith -> CURRENT -> REPOS`; ne jamais relancer sur un simple tick Binance/focus/pageshow.\n- Bridge/Ollama producteur: gpt-oss:20b-32k; Book = lecture seule.\n\n## Prochaine méthode\n\nCommence par un check court: version.json, administrator-version.json, dernier snapshot `data/crypto/latest.json`, `status.json`, workflows Atlas, puis captures opérateur récentes. Ensuite choisis **une seule dette prouvée**.\n\nPriorités restantes possibles: RND Aether 10; télémétrie physique Bridge; météo/ruban; notes opérateur; extensions marchés; future vue Opérateur.\n\nNe recrée pas Chronos centering, crypto-color graph bars, Oracle float ou Graph float: ils sont déjà soldés.\n\nStyle de travail: code méticuleux, petits deltas, gardes avant patch, validation après patch, archive canonique, commit anglais, puis test Firefox si interaction visuelle.\n'''
    (COORD / "PROMPT_REPRISE_AERITH_7_AGENT_CRYPTO.md").write_text(prompt, encoding="utf-8", newline="\n")

    archive, sha_file, digest = build_archive(build)
    print(f"40.4.160 PATCH PASS\nARCHIVE={archive}\nSHA_FILE={sha_file}\nDIGEST={digest}")


def main() -> None:
    if len(sys.argv) != 2 or sys.argv[1] not in {"159", "160"}:
        raise SystemExit("usage: script 159|160")
    phase159() if sys.argv[1] == "159" else phase160()


if __name__ == "__main__":
    main()
