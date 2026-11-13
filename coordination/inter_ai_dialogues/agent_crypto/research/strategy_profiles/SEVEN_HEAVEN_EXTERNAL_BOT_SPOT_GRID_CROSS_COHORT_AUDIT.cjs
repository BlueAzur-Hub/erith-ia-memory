#!/usr/bin/env node
"use strict";
/*
 * Seven Heaven | Reproducible, offline cross-cohort Spot Grid proof audit.
 * Reads ONLY historical public proof JSON already checked into this repository.
 * It does not execute Hummingbot, Freqtrade, exchange APIs or any trading order.
 * Run at repository root OR elsewhere:
 * node coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/SEVEN_HEAVEN_EXTERNAL_BOT_SPOT_GRID_CROSS_COHORT_AUDIT.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const FILES = Object.freeze({
  quarter: {
    name: "SEVEN_HEAVEN_SPOT_GRID_BTC_2024_2025_Q1_CONTINUOUS_REPLAY_2026_11_11_PROOFS.json",
    blob: "da0145e0d99546326b720d15a07e160dc0c05ca6"
  },
  ten_month: {
    name: "SEVEN_HEAVEN_SPOT_GRID_CONTINUOUS_BTC_2026_JAN_OCT_PROOFS.json",
    blob: "3044008b4347771dccb064a24957f8459b821249"
  }
});
const round = n => Number(n.toFixed(4));
const near = (actual, expected, tol = 0.001) =>
  assert(Math.abs(actual - expected) <= tol, "Inconsistent capital and return");
function loadPinned(spec) {
  const bytes = fs.readFileSync(path.join(__dirname, spec.name));
  const blob = crypto.createHash("sha1").update(Buffer.from("blob " + bytes.length + "\0"))
    .update(bytes).digest("hex");
  assert.equal(blob, spec.blob, "Frozen Git blob changed: " + spec.name);
  return JSON.parse(bytes.toString("utf8"));
}
function get(map, key) {
  assert(Object.prototype.hasOwnProperty.call(map, key), "Missing scenario: " + key);
  return map[key];
}
function main() {
  const quarter = loadPinned(FILES.quarter);
  const ten = loadPinned(FILES.ten_month);
  assert.equal(quarter.schema, "seven.heaven.spot-grid-quarterly-independent-two-years.v1");
  assert.equal(ten.schema, "seven.heaven.crypto.spot-grid-ten-month-continuous.v1");
  assert.equal(quarter.minutes_total, 260640);
  assert.equal(ten.minutes_verified, 437760);
  assert.equal(quarter.assumptions.fills_not_observed, true);
  assert.equal(ten.results.length, 10);
  const indexed = Object.fromEntries(ten.results.map(x => [x.strategy, x]));
  assert.equal(Object.keys(indexed).length, 10, "Duplicate 2026 strategy identifiers");
  for (const r of ten.results) {
    near(r.equity, 1000 * (1 + r.return_pct / 100));
    assert(r.max_drawdown_daily_pct <= 0);
    if (r.strategy.startsWith("GRID")) assert.equal(r.hypothetical_fills_only, true);
  }
  const quarterly = {};
  for (const year of [2024, 2025]) {
    const grid = get(quarter.results, year + "::FIXED::TOUCH::20::1");
    const hold = get(quarter.results, year + "::HOLD::50");
    near(grid.net_capital_end_usdt, 1000 * (1 + grid.return_pct / 100));
    assert(grid.max_daily_drawdown_pct <= 0 && hold.max_daily_drawdown_pct <= 0);
    quarterly[year] = {
      grid_return_pct: grid.return_pct,
      hold50_return_pct: hold.return_pct,
      grid_minus_hold50_pp: round(grid.return_pct - hold.return_pct),
      grid_daily_dd_pct: grid.max_daily_drawdown_pct,
      hold50_daily_dd_pct: hold.max_daily_drawdown_pct,
      drawdown_gap_pp: round(grid.max_daily_drawdown_pct - hold.max_daily_drawdown_pct),
      grid_closed_cycles_pnl_usdt: grid.closed_cycle_pnl_usdt,
      grid_open_inventory_pnl_usdt: grid.open_inventory_pnl_usdt
    };
  }
  const g = get(indexed, "GRID_FIXED_TOUCH");
  const h = get(indexed, "HOLD_50");
  const reset = get(indexed, "GRID_MONTHLY_RESET_TOUCH");
  const stress = get(indexed, "GRID_COSTS_X2_FIXED_TOUCH");
  const close = get(indexed, "GRID_FIXED_CLOSE");
  const result = {
    schema: "seven.heaven.crypto.external-bot-strategy-proof-audit.v1",
    asof_utc: "2026-11-13",
    source_blob_sha: { quarter: FILES.quarter.blob, ten_month: FILES.ten_month.blob },
    original_data_scope: { quarter_minutes: quarter.minutes_total, ten_month_minutes: ten.minutes_verified },
    quarterly,
    ten_months_2026: {
      grid_fixed_return_pct: g.return_pct,
      hold50_return_pct: h.return_pct,
      grid_minus_hold50_pp: round(g.return_pct - h.return_pct),
      grid_daily_dd_pct: g.max_drawdown_daily_pct,
      hold50_daily_dd_pct: h.max_drawdown_daily_pct,
      grid_minus_hold50_drawdown_pp: round(g.max_drawdown_daily_pct - h.max_drawdown_daily_pct),
      monthly_reset_minus_fixed_pp: round(reset.return_pct - g.return_pct),
      double_cost_minus_standard_pp: round(stress.return_pct - g.return_pct),
      touch_minus_close_pp: round(g.return_pct - close.return_pct),
      grid_hypothetical_cycles_pnl_usdt: g.hypothetical_closed_cycle_pnl_usdt,
      grid_total_net_pnl_usdt: Number((g.equity - 1000).toFixed(6)),
      grid_inventory_qty_btc: g.end_btc_qty,
      grid_cash_usdt: g.end_cash_usdt,
      grid_completed_cycles: g.hypothetical_completed_cycles
    },
    warnings: [
      "Historical PAPER only; fills were not observed",
      "Binance BTCUSDT 1-minute, not OKX BTCUSDC",
      "Mixed windows and grid widths, not the same cohort",
      "Not an execution of Freqtrade or Hummingbot",
      "Maker/taker and queue-specific OKX fills not tested"
    ]
  };
  console.log(JSON.stringify(result, null, 2));
}
main();
