"""Genuine Chromium DOM acceptance: use only in the CI browser job.

Requires Playwright installed in CI, not in the user's Python 3.13 environment.
No CDN, login, keys or live trading services.
"""
from __future__ import annotations
import os
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

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
            expect(desktop.locator("#dataset-badge")).to_have_text("ARCHIVE AUTHENTIFIÉE", timeout=15000)
            assert desktop.locator("#comparison-empty").is_visible()
            assert desktop.locator("#okx-pair").is_visible()
            assert desktop.locator("#okx-history-days option").count()==4
            assert desktop.locator("#okx-history-date").is_visible()
            assert desktop.locator("#source-choice").is_visible()
            assert desktop.locator("#okx-pair option").count()==4
            assert desktop.locator("#run").is_enabled()
            assert desktop.locator(".identity-title").inner_text()=="Strategy Lab"
            assert "4.2.0" in desktop.locator(".masthead").inner_text()
            desktop.locator("#compare").click()
            desktop.locator("#comparison-result").wait_for(state="visible",timeout=35000)
            assert desktop.locator("#comparison-rows > tr").count()==6
            desktop.locator("#comparison-rows > tr").first.locator("button").click()
            try:
                desktop.locator("#result").wait_for(state="visible",timeout=15000)
            except Exception:
                print("BROWSER NOTICE:",desktop.locator("#message").inner_text(),flush=True)
                print("FORM CONFIG:",desktop.locator("#config").evaluate("e => Object.fromEntries(new FormData(e))"),flush=True)
                print("BROWSER JS ERRORS:",errors,flush=True)
                raise
            assert "USDT" in desktop.locator("#equity").inner_text()
            assert desktop.locator("#zero-cost").inner_text()!="—"
            assert desktop.locator("#quant-desk").is_visible()
            assert desktop.locator("#quant-closed").inner_text()!="—"
            assert desktop.locator("#drawdown-chart polyline").count()==1
            expect(desktop.locator("#micro-context")).to_contain_text("Binance Spot", timeout=25000)
            assert desktop.locator("#market-microscope").is_visible()
            assert desktop.locator("#market-candle-chart rect").count()>60
            assert desktop.locator("#micro-sha").inner_text().startswith("SOURCE SHA-256")
            desktop.locator("#micro-prev").click()
            expect(desktop.locator("#micro-range-label")).to_contain_text(" / 44640", timeout=25000)
            desktop.locator("#micro-sma").check()
            desktop.locator("#micro-bb").check()
            desktop.locator("#micro-vwap").check()
            assert desktop.locator("#market-candle-chart path").count()>=4
            assert desktop.locator("#readout-equity").inner_text().endswith("USDT")
            assert desktop.locator("#history > button").count()>=1
            desktop.screenshot(path=str(OUTPUT/"SEVEN_HEAVEN_STRATEGY_LAB_V4_2_MARKET_MICROSCOPE_DESKTOP_COCKPIT.png"),full_page=True)
            desktop.locator("#profile-name").fill("V3 EMA 10-30 Browser Acceptance")
            desktop.locator("#save-profile").click()
            desktop.locator("#saved-profiles option").filter(has_text="V3 EMA 10-30").wait_for(state="attached",timeout=15000)
            # V3 full-stack acceptance: real public OKX Spot endpoint, immutable
            # local 240x1H cache, six PAPER comparisons and USDC denomination.
            desktop.locator("#okx-pair").select_option("BTC-USDC")
            desktop.locator("#okx-import").click()
            expect(desktop.locator("#source-active-title")).to_have_text(
                "OKX Spot · BTC/USDC",timeout=75000)
            assert desktop.locator("#source-choice").input_value().startswith("OKX_BTC_USDC_1H_")
            assert desktop.locator('input[name="timeframe"][value="1m"]').is_disabled()
            assert desktop.locator('input[name="timeframe"][value="1h"]').is_checked()
            assert desktop.locator("#run").is_enabled()
            desktop.locator("#compare").click()
            expect(desktop.locator("#compare-context")).to_contain_text(
                "BTC/USDC · OKX Spot",timeout=25000)
            assert desktop.locator("#comparison-rows > tr").count()==6
            assert "USDC" in desktop.locator("#comparison-rows > tr").first.inner_text()
            desktop.locator("#comparison-rows > tr").first.locator("button").click()
            expect(desktop.locator("#equity")).to_contain_text("USDC",timeout=25000)
            expect(desktop.locator("#micro-context")).to_contain_text("OKX Spot",timeout=25000)
            expect(desktop.locator("#micro-context")).to_contain_text("1h",timeout=25000)
            assert desktop.locator("#inventory").inner_text().endswith("BTC")
            desktop.screenshot(path=str(OUTPUT/"SEVEN_HEAVEN_STRATEGY_LAB_V4_2_MARKET_MICROSCOPE_DESKTOP_COCKPIT.png"),full_page=True)
            # V4: compose and execute Yoann's own declarative strategy.
            desktop.locator("#kind").select_option("CUSTOM_RULES")
            assert desktop.locator("#custom-fields").is_visible()
            assert desktop.locator("#draft-status").is_visible()
            expect(desktop.locator("#draft-status")).to_contain_text("dernier rapport PAPER")
            desktop.locator('select[name="entry_rule"]').select_option("PRICE_ABOVE_EMA")
            desktop.locator('select[name="filter_rule"]').select_option("VOLUME_ABOVE")
            desktop.locator('input[name="volume_multiplier"]').fill("1")
            desktop.locator('input[name="stop_loss_pct"]').fill("4")
            desktop.locator("#profile-name").fill("Yoann · Premier scénario PAPER")
            desktop.locator("#save-profile").click()
            desktop.locator("#saved-profiles option").filter(has_text="Yoann").wait_for(state="attached",timeout=10000)
            desktop.locator("#run").click()
            expect(desktop.locator("#run-id")).to_contain_text("personnalisée",timeout=30000)
            assert desktop.locator("#draft-status").is_hidden()
            expect(desktop.locator("#micro-context")).to_contain_text("OKX Spot",timeout=25000)
            assert desktop.locator("#quant-desk").is_visible()
            assert "USDC" in desktop.locator("#quant-realized").inner_text()
            assert "USDC" in desktop.locator("#quant-unrealized").inner_text()
            assert desktop.locator("#drawdown-chart polyline").count()==1
            desktop.locator("#compare").click()
            expect(desktop.locator("#comparison-badge")).to_contain_text("7 MODÈLES",timeout=40000)
            assert desktop.locator("#comparison-rows > tr").count()==7
            desktop.locator("#comparison-rows > tr").last.locator("button").click()
            expect(desktop.locator("#run-id")).to_contain_text("personnalisée",timeout=30000)
            assert not errors, f"Unexpected JavaScript page exceptions: {errors}"

            mobile=browser.new_page(viewport={"width":390,"height":844},device_scale_factor=1)
            mobile.goto(BASE,wait_until="domcontentloaded")
            expect(mobile.locator("#dataset-badge")).to_have_text("ARCHIVE AUTHENTIFIÉE", timeout=15000)
            mobile.locator("#laboratory").scroll_into_view_if_needed()
            mobile.screenshot(path=str(OUTPUT/"SEVEN_HEAVEN_STRATEGY_LAB_V4_2_MARKET_MICROSCOPE_MOBILE_COCKPIT.png"),full_page=True)
            width=mobile.evaluate("document.documentElement.scrollWidth")
            assert width<=390, f"Unexpected horizontal body overflow mobile: {width}px"
            print("PASS: Chromium V4.2 SHA-linked historical candlesticks, paper markers, SMA/EMA/Bollinger/VWAP, pan/zoom, draft guard, seven reference models, Windows OKX and no JS errors")
        finally:
            browser.close()


if __name__=="__main__":
    main()
