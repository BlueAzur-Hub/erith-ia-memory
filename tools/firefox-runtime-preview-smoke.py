#!/usr/bin/env python3
"""Firefox headless smoke of the *isolated* PR runtime; no OKX credentials or orders."""
import argparse
import functools
import http.server
import json
import pathlib
import threading
from urllib.parse import urljoin

from playwright.sync_api import sync_playwright

PREFIX = "public/agent_crypto_erith_ia/"
class QuietHTTP(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--site", default="_runtime_pages")
    parser.add_argument("--evidence", default="_firefox_evidence")
    opts = parser.parse_args()
    site = pathlib.Path(opts.site).resolve()
    evidence = pathlib.Path(opts.evidence).resolve()
    evidence.mkdir(parents=True, exist_ok=True)
    results = []
    handler = functools.partial(QuietHTTP, directory=str(site))
    server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    base = f"http://127.0.0.1:{server.server_port}/"
    report = {"mode": "Firefox automated headless, PR isolated, read-only",
              "source": "local built Pages candidate, remote public GitHub Raw",
              "production_pages_modified": False,
              "private_bridge": "not used", "checks": results}
    try:
        with sync_playwright() as playwright:
            browser = playwright.firefox.launch(headless=True)
            context = browser.new_context(locale="fr-FR",
                                          viewport={"width": 1600, "height": 900},
                                          service_workers="block")
            context.set_default_timeout(65000)
            def check(name, relative, verifier, screenshot=None):
                p = context.new_page()
                url = urljoin(base, PREFIX + relative)
                item = {"name": name, "url": relative, "result": "FAIL"}
                try:
                    response = p.goto(url, wait_until="domcontentloaded", timeout=65000)
                    if response is None or response.status != 200:
                        raise AssertionError(f"Preview HTML HTTP {response.status if response else 'none'}")
                    p.wait_for_function("() => !!window.AgentCryptoVaultDataRouter", timeout=15000)
                    verifier(p)
                    item["result"] = "PASS"
                    if screenshot:
                        p.screenshot(path=str(evidence / screenshot), full_page=False, timeout=20000)
                except Exception as exc:
                    item["error"] = (str(exc) or type(exc).__name__)[:650]
                    try:
                        p.screenshot(path=str(evidence / (name + "-FAIL.png")), timeout=9000)
                    except Exception:
                        pass
                finally:
                    results.append(item)
                    p.close()
            def trader(p):
                assert p.title() == "ERITH.IA · Trading Desk — 40.6.640"
                p.locator("#traderInterfaceRuntime").wait_for()
                p.wait_for_function("""() => {
                    const frame = document.querySelector('#traderInterfaceRuntime');
                    return frame && frame.contentDocument &&
                        frame.contentDocument.documentElement.dataset.agentCryptoLoadedBuild === '40.6.640';
                }""", timeout=60000)
                frame = p.frame_locator("#traderInterfaceRuntime")
                frame.locator("html").wait_for()
                assert frame.locator("html").get_attribute("data-agent-crypto-surface") == "trader"
                assert frame.locator("html").get_attribute("data-agent-crypto-loaded-build") == "40.6.640"
            def inventory(p):
                p.locator("#summary").wait_for()
                p.wait_for_function("() => document.querySelector('#summary')?.textContent.includes('Dans le Top250')",
                                    timeout=65000)
                assert p.locator("#assets tr").count() == 250
                assert "Sans source" in p.locator("#summary").inner_text()
                assert p.evaluate("""() => AgentCryptoVaultDataRouter.stats().routed""") >= 2
            def catalogue(p):
                p.wait_for_function("() => document.querySelector('#catalog-output')?.textContent.includes('bitcoin :')",
                                    timeout=65000)
                assert "USDT" in p.locator("body").inner_text()
            def verified(p):
                p.locator("#reader-form button").click()
                p.wait_for_function("() => /SHA-256 vérifié|Archive refusée/.test(document.querySelector('#summary')?.textContent || '')",
                                    timeout=65000)
                summary = p.locator("#summary").inner_text()
                assert "SHA-256 vérifié" in summary, summary
                assert p.locator("#rows tr").count() == 12
                assert p.evaluate("""() => AgentCryptoVaultDataRouter.stats().routed""") >= 3
            def vault(p):
                # R9 is intentionally nested in a closed <details> panel.
                button = p.locator("#r9-read")
                button.wait_for(state="attached")
                button.locator("xpath=ancestor::details[1]").evaluate("(node) => node.open = true")
                assert p.locator("#top250-coverage").count() == 1
                assert p.evaluate("""() => AgentCryptoVaultDataRouter.route(
                  new URL('../data/historical_archive_prototype/compact_v1/index.json', location.href).href
                )""").startswith("https://raw.githubusercontent.com/BlueAzur-Hub/")
                button.click()
                p.wait_for_function("""() => {
                  const node = document.querySelector('#r9-status');
                  return node && (node.classList.contains('good') || node.classList.contains('bad'));
                }""", timeout=65000)
                status = p.locator("#r9-status")
                assert status.get_attribute("class") == "good", status.inner_text()
                assert "SHA-256 et OHLCV" in status.inner_text()
            check("trader", "trader/trading-desk.html", trader, "trader.png")
            check("inventory", "trader/historical-inventory.html", inventory, "inventory.png")
            check("catalogue", "trader/source-catalogue.html", catalogue)
            check("verified", "trader/verified-reader.html", verified, "verified-btc.png")
            check("vault", "administrator/historical-vault.html", vault, "coffre.png")
            context.close()
            browser.close()
    finally:
        server.shutdown()
        server.server_close()
        report["result"] = "PASS" if all(t["result"] == "PASS" for t in results) else "FAIL"
        (evidence / "firefox-report.json").write_text(
            json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))
    if report["result"] != "PASS":
        raise SystemExit(1)

if __name__ == "__main__":
    main()
