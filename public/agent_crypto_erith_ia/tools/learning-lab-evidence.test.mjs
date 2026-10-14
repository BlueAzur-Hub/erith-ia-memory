import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const ledger=JSON.parse(fs.readFileSync(new URL("../laboratoire/catalogue-preuves.json",import.meta.url),"utf8"));
const runtime=fs.readFileSync(new URL("../administrator/js/learning-lab.js",import.meta.url),"utf8");
const IDs=["bitcoin","concrete","quack-ai"];
const schema=JSON.parse(fs.readFileSync(new URL("../laboratoire/contrat-observation.schema.json",import.meta.url),"utf8"));
const example=JSON.parse(fs.readFileSync(new URL("../laboratoire/exemple-observation-ct.json",import.meta.url),"utf8"));
test("Catalog contains precisely the planned three stable identities",()=>{
  assert.equal(ledger.schema,"aerith.lab.evidence-catalog.v1");
  assert.deepEqual(ledger.assets.map(x=>x.id),IDs);
  assert.equal(ledger.policy.public_only,true);
  assert.equal(ledger.policy.account_data,false);
  assert.equal(ledger.policy.live_quote,false);
  assert.equal(ledger.policy.automatic_orders,false);
});
test("Every external claim has a human title, grounded URL and limits",()=>{
  let total=0;
  for(const a of ledger.assets){
    assert.match(a.symbol,/^[A-Z]{1,10}$/);
    assert.ok(a.primary_sources.length>=3);
    assert.ok(a.missing.length>=3);
    assert.ok(a.vault?.status && a.vault?.reason);
    assert.ok(a.study);
    for(const x of a.primary_sources){
      assert.match(x.url,/^https:\/\//);
      assert.ok(x.title&&x.evidence&&x.kind&&x.recency);
      total++;
    }
    for(const item of a.public_observations){
      assert.ok(item.observed_at && !Number.isNaN(Date.parse(item.observed_at)));
      assert.equal(item.source,"capture_utilisateur");
      assert.ok(item.warning);
      assert.ok(item.kind);
    }
  }
  assert.equal(total,12);
});
test("Market owner and display currency are never silently conflated",()=>{
 const concrete=ledger.assets.find(a=>a.id==="concrete");
 const spot=concrete.instruments.map(x=>x.instrument);
 assert.ok(spot.includes("CT-USDT"));
 assert.ok(spot.includes("CT-USDC"));
 assert.ok(concrete.public_observations.every(x=>x.market==="CT-USDT"));
 assert.match(concrete.public_observations.find(x=>x.kind==="ligne_24h").warning,/USD affiché/);
 assert.ok(ledger.ai_requirements.hard_guards.includes("usdt_is_not_usdc"));
 assert.ok(ledger.ai_requirements.hard_guards.includes("no_private_fields_in_public_files"));
});
test("Public register publishes no private position or API credentials",()=>{
 const s=JSON.stringify(ledger);
 for(const pattern of [/9[,.]99\s*CT/i,/3[,.]522\s*USDC/i,/0[,.]3525526/i,/api[_-]?secret/i,/private[_-]?key/i,/passphrase/i,/seed phrase/i,/account_id/i]){
   assert.doesNotMatch(s,pattern);
 }
});
test("Evidence tab is non-trading, read-only and has an honest offline fallback",()=>{
 assert.match(runtime,/\["preuves","Preuves IA"\]/);
 assert.match(runtime,/fetch\(CATALOG_PATH,\{credentials:"omit",cache:"no-cache"\}\)/);
 assert.match(runtime,/aucune donnée inventée/);
 assert.match(runtime,/state\.isConnected===false/);
 assert.match(runtime,/if\(asset!==selected \|\| tab!=="preuves"/);
 assert.doesNotMatch(runtime,/\b(placeOrder|submitOrder|sendOrder|tradeAPI)\s*\(/);
 new Function(runtime);
});

test("AI observation schema forbids trades and includes provenance and missingness",()=>{
 assert.equal(schema.properties.execution_allowed.const,false);
 assert.ok(schema.required.includes("observed_at"));
 assert.ok(schema.required.includes("source"));
 assert.ok(schema.properties.measurements);
 assert.ok(schema.properties.conversion);
 assert.ok(schema.properties.quality.enum.includes("not_verified"));
 assert.equal(schema.additionalProperties,false);
 assert.equal(example.schema,schema.properties.schema.const);
 assert.equal(example.execution_allowed,false);
 for(const key of schema.required)assert.ok(Object.hasOwn(example,key),"missing "+key);
 assert.equal(example.source.kind,"user_screenshot");
 assert.equal(example.received_at,null);
 assert.equal(example.instrument,"CT-USDT");
 assert.equal(example.quote,"USDT");
 assert.equal(example.measurements.best_bid,0.362);
 assert.equal(example.measurements.best_ask,0.36219);
 assert.ok(example.warnings.some(s=>s.includes("CT-USDC")));
 assert.equal(JSON.stringify(example).includes("0.3525526"),false);
});
