'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const page=fs.readFileSync(path.join(root,'trader/axis-robotics-case-study.html'),'utf8');
const data=JSON.parse(fs.readFileSync(path.join(root,'data/crypto/research/axis-robotics.json'),'utf8'));
const native=fs.readFileSync(path.join(root,'administrator/js/new-listings-native-category.js'),'utf8');
const knowledge=fs.readFileSync(path.join(root,'laboratoire/crypto-knowledge.html'),'utf8');
assert.equal(data.schema,'erith.crypto.asset-research-dossier.v1');
assert.equal(data.coin_id,'axis-robotics');
assert.equal(data.orders_enabled,false);
const study=data.case_study;
assert.equal(study.schema,'erith.crypto.human-case-decision.v1');
assert.equal(study.mode,'DOCUMENTARY_PAPER_ONLY');
assert.equal(study.decision,'OBSERVE_NO_BUY');
assert.equal(study.real_order_amount_usdc,0);
assert.equal(study.user_project_budget_usdc,10);
assert.equal(study.cost_reserve_usdc,0.94);
assert.equal(study.presale.price_usd_per_axis,0.1);
assert.equal(study.presale.min_commitment_usdc,100);
assert.equal(study.presale.min_commitment_accessible_to_budget,false);
assert.equal(study.presale.required_kyc,true);
assert.equal(study.presale.allocation_not_guaranteed,true);
assert.equal(study.observed_market.operator_screenshot_not_live,true);
assert(Math.abs(study.observed_market.price_usd_approx/study.presale.price_usd_per_axis-
  study.observed_market.implied_ratio_vs_sale_price)<1e-9);
assert(Math.abs((study.observed_market.implied_ratio_vs_sale_price-1)*100-
  study.observed_market.implied_pct_above_sale_price)<1e-9);
assert.equal(study.organization.sale_issuer_jurisdiction,'British Virgin Islands');
assert.equal(study.supply.total_tokens,1000000000);
assert.equal(study.supply.circulating_tokens_at_source,165000000);
assert.equal(study.supply.locked_percent,83.5);
assert.equal(study.market_evidence?.okx?.axis_usdc_spot_verified,undefined);
// Canonical source still owns market evidence; new human verdict must not override it.
assert.equal(data.market_evidence.okx.axis_usdc_spot_verified,false);
assert.equal(study.account_access,false);
assert.equal(study.orders_enabled,false);
assert.equal(study.profit_usdc,null);
assert(Array.isArray(study.decision_factors)&&study.decision_factors.length>=5);
assert(Array.isArray(study.conditions_to_revisit)&&study.conditions_to_revisit.length>=3);
for(const source of [study.presale.source,study.presale.legal,
 study.products.official_funding_source,study.supply.source]){
 assert(source.startsWith('https://'),'Every report claim needs a public source');
}
assert(page.includes('<title>ERITH.IA · Cas d\'école AXIS'));
assert(page.includes('100 USDC'));
assert(page.includes('≈ +154,1 %'));
assert(page.includes('Achat réel'));
assert(page.includes('0 USDC'));
assert(page.includes('source')); 
assert(page.includes('axis-robotics.json'));
assert(page.includes("d.case_study.decision!==\"OBSERVE_NO_BUY\""));
assert(page.includes("credentials:\"omit\""));
assert(!/fetch\([^)]*api\/v5\/trade\/order/.test(page));
assert(!/localStorage|sessionStorage|indexedDB|setInterval\(/.test(page));
assert(native.includes('../trader/axis-robotics-case-study.html'));
assert(knowledge.includes('../trader/axis-robotics-case-study.html'));
assert(knowledge.includes('hors des 20 candidats du Radar fixe'));
const scripts=[...page.matchAll(/<script>([\s\S]*?)<\/script>/g)];
assert.equal(scripts.length,1,'One read-only script, no new framework or timer');
new Function(scripts[0][1]);
console.log('AXIS case study: source contracts, initial-sale inaccessibility, dated price, reserve, no orders, both navigation links PASS');
