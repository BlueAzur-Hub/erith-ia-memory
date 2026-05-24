#!/usr/bin/env python3
# Seven Heaven Local Backend
# Lance Seven Heaven en local, synchronise YouTube, lit les rapports output.
# Aucune clé API n'est exposée dans l'interface.

from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import json
import subprocess
import urllib.parse
import os
import sys
import webbrowser

HOST = "127.0.0.1"
PORT = 8787

READER_DIR = Path(r"C:\Aerith_YouTube_Reader")
OUTPUT_DIR = READER_DIR / "output"

SCRIPT_CANDIDATES = [
    "export_blue_azur_youtube_data_v3.py",
    "export_blue_azur_youtube_data_v2.py",
    "export_blue_azur_youtube_data.py",
    "youtube_reader_v3.py",
]

TOP_VIDEO_FILES = [
    "blue_azur_top_videos_28d_enriched.json",
    "blue_azur_top_videos_28d.json",
]

FAMILY_FILES = [
    "blue_azur_memory_families_report.json",
]

BRIEF_FILES = [
    "blue_azur_memory_families_report.md",
    "blue_azur_youtube_strategy_report.md",
    "blue_azur_channel_snapshot.md",
]

class SevenHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def json_response(self, payload, status=200):
        data = json.dumps(payload, ensure_ascii=False, indent=2).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)

        if parsed.path == "/api/youtube/latest":
            return self.handle_latest()

        if parsed.path == "/api/youtube/sync":
            return self.handle_sync()

        return super().do_GET()

    def handle_sync(self):
        script = None
        for name in SCRIPT_CANDIDATES:
            candidate = READER_DIR / name
            if candidate.exists():
                script = candidate
                break

        if not script:
            return self.json_response({
                "ok": False,
                "error": "Aucun script YouTube Reader trouvé.",
                "reader_dir": str(READER_DIR),
                "candidates": SCRIPT_CANDIDATES,
            }, 404)

        try:
            result = subprocess.run(
                [sys.executable, str(script)],
                cwd=str(READER_DIR),
                capture_output=True,
                text=True,
                timeout=180
            )

            latest = self.collect_latest()
            return self.json_response({
                "ok": result.returncode == 0,
                "script": str(script),
                "returncode": result.returncode,
                "stdout": result.stdout[-4000:],
                "stderr": result.stderr[-4000:],
                "data": latest,
            })

        except subprocess.TimeoutExpired:
            return self.json_response({
                "ok": False,
                "error": "Synchronisation trop longue : timeout 180 secondes."
            }, 504)

        except Exception as exc:
            return self.json_response({
                "ok": False,
                "error": str(exc),
            }, 500)

    def handle_latest(self):
        return self.json_response({
            "ok": True,
            "data": self.collect_latest()
        })

    def read_json_first(self, filenames):
        for name in filenames:
            path = OUTPUT_DIR / name
            if path.exists():
                try:
                    return {"filename": name, "content": json.loads(path.read_text(encoding="utf-8"))}
                except Exception as exc:
                    return {"filename": name, "error": str(exc)}
        return None

    def read_md_all(self, filenames):
        reports = []
        for name in filenames:
            path = OUTPUT_DIR / name
            if path.exists():
                try:
                    reports.append({"filename": name, "content": path.read_text(encoding="utf-8")})
                except Exception as exc:
                    reports.append({"filename": name, "error": str(exc)})
        return reports

    def collect_latest(self):
        return {
            "reader_dir": str(READER_DIR),
            "output_dir": str(OUTPUT_DIR),
            "top_videos": self.read_json_first(TOP_VIDEO_FILES),
            "families": self.read_json_first(FAMILY_FILES),
            "briefs": self.read_md_all(BRIEF_FILES),
        }

def main():
    os.chdir(Path(__file__).parent)
    url = f"http://{HOST}:{PORT}/index.html"
    print("=========================================")
    print("SEVEN HEAVEN LOCAL BACKEND")
    print("=========================================")
    print("URL :", url)
    print("Reader :", READER_DIR)
    print("Output :", OUTPUT_DIR)
    print("Ctrl+C pour arrêter.")
    print("=========================================")
    webbrowser.open(url)
    server = ThreadingHTTPServer((HOST, PORT), SevenHandler)
    server.serve_forever()

if __name__ == "__main__":
    main()
