"""Genuine Chromium DOM acceptance: use only in the CI browser job.

Requires Playwright installed in CI, not in the user's Python 3.13 environment.
No CDN, login, keys or live trading services.
"""
from __future__ import annotations
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE="http://127.0.0.1:8777"
OUTPUT=Path(os.environ["RUNNER_TEMP"])/"seven-lab-evidence"
OUTPUT.mkdir(parents=True,exist_ok=True)


def main():
    with sync_playwright() as p:
        browser=p.chromium.launch(channel="chrome",headless=True,args=["--no-sandbox"])
        try:
            desktop=browser.new_page(viewport={"width":1536,"height":960},device_scale_factor=1)
            errors=[]
            desktop.on("pageerror",lambda err:errors.append(str(err)))
            desktop.goto(BASE,wait_until="domcontentloaded")
            desktop.wait_for_function("document.querySelector(\u0027#dataset-badge\u0027)?.textContent.trim() === \u0027ARCHIVE AUTHENTIFIÉE\u0027", timeout=15000)
            assert desktop.locator("#comparison-empty").is_visible()
            assert desktop.locator("#run").is_enabled()
            assert desktop.locator(".identity-title").inner_text()=="Strategy Lab"
            assert "2.0.0" in desktop.locator(".masthead").inner_text()
            desktop.locator("#compare").click()
            desktop.locator("#comparison-result").wait_for(state="visible",timeout=35000)
            assert desktop.locator("#comparison-rows > tr").count()==6
            desktop.locator("#comparison-rows > tr").first.locator("button").click()
            desktop.locator("#result").wait_for(state="visible",timeout=30000)
            assert "USDT" in desktop.locator("#equity").inner_text()
            assert desktop.locator("#zero-cost").inner_text()!="—"
            assert desktop.locator("#readout-equity").inner_text().endswith("USDT")
            assert desktop.locator("#history > button").count()>=1
            desktop.screenshot(path=str(OUTPUT/"SEVEN_HEAVEN_STRATEGY_LAB_V2_PREMIUM_DESKTOP_COCKPIT.png"),full_page=True)
            desktop.locator("#profile-name").fill("V2 EMA 10-30 Browser Acceptance")
            desktop.locator("#save-profile").click()
            desktop.locator("#saved-profiles option").filter(has_text="V2 EMA 10-30").wait_for(timeout=15000)
            assert not errors, f"Unexpected JavaScript page exceptions: {errors}"

            mobile=browser.new_page(viewport={"width":390,"height":844},device_scale_factor=1)
            mobile.goto(BASE,wait_until="domcontentloaded")
            mobile.wait_for_function("document.querySelector(\u0027#dataset-badge\u0027)?.textContent.trim() === \u0027ARCHIVE AUTHENTIFIÉE\u0027", timeout=15000)
            mobile.locator("#laboratory").scroll_into_view_if_needed()
            mobile.screenshot(path=str(OUTPUT/"SEVEN_HEAVEN_STRATEGY_LAB_V2_PREMIUM_MOBILE_COCKPIT.png"),full_page=True)
            width=mobile.evaluate("document.documentElement.scrollWidth")
            assert width<=390, f"Unexpected horizontal body overflow mobile: {width}px"
            print("PASS: real Chromium V2 buttons, historical 6-way comparison, per-row replay, profile save, desktop/mobile rendering and no script errors")
        finally:
            browser.close()


if __name__=="__main__":
    main()
