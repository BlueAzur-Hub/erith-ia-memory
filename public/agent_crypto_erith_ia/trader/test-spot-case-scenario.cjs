'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const model=require('./spot-case-scenario-model.js');
const doc=JSON.parse(fs.readFileSync(path.join(__dirname,'../data/crypto/research/axis-robotics.json'),'utf8'));
const html=fs.readFileSync(path.join(__dirname,'axis-robotics-case-study.html'),'utf8');
assert.equal(model.realOrders,false);
assert.equal(model.storage,false);
assert.equal(model.privateAccount,false);
for(const budget of [10,100]){
  for(const entry of [0.11,0.15]){
    for(const exit of [0.25,0.4,0.45]){
      const r=model.spot({budgetUsdc:budget,entryUsd:entry,exitUsd:exit});
      const q=(budget/entry)*.999;
      assert(Math.abs(r.tokensAfterBuyFee-q)<1e-6);
      assert(Math.abs(r.exitNetUsd-q*exit*.999)<1e-6);
      assert(Math.abs(r.profitBeforeTaxUsd-(r.exitNetUsd-budget))<1e-8);
      assert(Math.abs(r.fiscalIllustrationDeductionUsd-
        Math.max(r.profitBeforeTaxUsd,0)*.314)<1e-7);
      assert.equal(r.profitAfterActualFrenchTaxUsd,null);
      assert.equal(r.priceScenarioActuallyOccurred,false);
      assert.equal(r.ordersEnabled,false);
      assert.equal(r.tradeApproved,false);
      assert.equal(r.realOrderAmountUsdc,0);
      assert.equal(r.spotPairVerified,false);
      assert.equal(r.feesVerified,false);
      assert.equal(r.realizedProfitUsd,null);
    }
  }
}
assert(Math.abs(model.spot({budgetUsdc:10,entryUsd:.15,exitUsd:.25}).exitNetUsd-16.63335)<1e-7);
assert(Math.abs(model.spot({budgetUsdc:100,entryUsd:.11,exitUsd:.4}).profitBeforeTaxUsd-262.909454545)<.00001);
assert.equal(model.spot({budgetUsdc:10,entryUsd:.4,exitUsd:.2}).profitableBeforeTax,false);
assert.throws(()=>model.spot({budgetUsdc:-10,entryUsd:.1,exitUsd:.4}));
assert.throws(()=>model.spot({budgetUsdc:10,entryUsd:0,exitUsd:.4}));
const below=model.presale({commitmentUsdc:10});
assert.equal(below.eligibleByMinimum,false);
assert.equal(below.baseAllocationAxis,0);
const sale=model.presale({commitmentUsdc:100});
assert.equal(sale.eligibleByMinimum,true);
assert(Math.abs(sale.acceptedUsdc-42.03)<1e-7);
assert(Math.abs(sale.refundUsdc-57.97)<1e-7);
assert(Math.abs(sale.baseAllocationAxis-420.3)<1e-7);
assert(Math.abs(sale.lockedBaseAxis-315.225)<1e-7);
assert(sale.tgeTheoreticalUnlockedAxis>209&&sale.tgeTheoreticalUnlockedAxis<211);
assert.equal(sale.ordersEnabled,false);
assert.equal(sale.actualAllocationVerified,false);
assert.equal(sale.tokenActuallySellableAtTge,false);
assert.equal(sale.profitUsd,null);
assert.equal(doc.case_study.presale.min_commitment_usdc,100);
assert.equal(doc.case_study.user_project_budget_usdc,10);
assert.equal(doc.case_study.paper_spot_scenarios.status,'PAPER_ONLY');
assert.deepEqual(doc.case_study.paper_spot_scenarios.budgets_usdc,[10,100]);
assert.deepEqual(doc.case_study.paper_spot_scenarios.entries_usd,[0.11,0.15]);
assert.deepEqual(doc.case_study.paper_spot_scenarios.exits_usd,[0.25,0.40,0.45]);
assert.equal(doc.case_study.paper_spot_scenarios.real_orders_enabled,false);
assert.equal(html.includes('spot-case-scenario-model.js'),true);
assert.equal(html.includes('Simulateur PAPER Spot'),true);
assert.equal(html.includes('proposition fiscale indicative'),false);
assert.equal(html.includes('31,4 %'),true);
assert.equal(html.includes('0,1 %'),true);
assert.equal(html.includes('100 USDC ≠ 1 000 AXIS'),true);
assert(!/localStorage|sessionStorage|indexedDB|setInterval\(/.test(html));
assert(!/fetch\([^)]*api\/v5\/trade/.test(html));
assert(!/fetch\(|XMLHttpRequest|localStorage|indexedDB|setInterval\(|Authorization|Bearer |api\/v5\/trade|method:\s*['"]POST/i.test(fs.readFileSync(path.join(__dirname,'spot-case-scenario-model.js'),'utf8')));
console.log('Seven AXIS scenario model 10/100 USDC: price paths, separate prorated presale, no automatic taxation and NO orders PASS');
