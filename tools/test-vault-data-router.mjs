import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const src=fs.readFileSync(new URL("../public/agent_crypto_erith_ia/web/vault-data-router.js",import.meta.url),"utf8");
function client(){
 const calls=[],ctx={URL,Request,Headers,document:{baseURI:"https://blueazur-hub.github.io/erith-ia-memory/public/agent_crypto_erith_ia/administrator/index.html"},location:{origin:"https://blueazur-hub.github.io"},fetch:async (...args)=>{calls.push(args);return{ok:true}}};
 ctx.globalThis=ctx;vm.runInNewContext(src,ctx);return{ctx,calls};
}
test("archive goes to Raw; OKX and Bridge do not",()=>{
 const{ctx}=client(),good="https://blueazur-hub.github.io/erith-ia-memory/public/agent_crypto_erith_ia/data/historical_archive_prototype/compact_v1/index.json";
 assert.equal(ctx.AgentCryptoVaultDataRouter.route(good),"https://raw.githubusercontent.com/BlueAzur-Hub/erith-ia-memory/main/public/agent_crypto_erith_ia/data/historical_archive_prototype/compact_v1/index.json");
 assert.equal(ctx.AgentCryptoVaultDataRouter.route("https://api.okx.com/api/v5/market/ticker?instId=CT-USDT"),null);
 assert.equal(ctx.AgentCryptoVaultDataRouter.route("http://127.0.0.1:8787/auth/login","POST"),null);
});
test("fetch stays read-only and strips auth",async()=>{
 const{ctx,calls}=client(),u="https://blueazur-hub.github.io/erith-ia-memory/public/agent_crypto_erith_ia/data/oracle_evidence/manifest.json";
 await ctx.fetch(u,{headers:{Authorization:"Bearer NEVER_LEAK",Accept:"application/json"}});
 assert.equal(calls.length,1);assert.match(calls[0][0],/^https:\/\/raw\.githubusercontent\.com/);
 assert.equal(calls[0][1].credentials,"omit");assert.equal(calls[0][1].headers.has("authorization"),false);
 await ctx.fetch(u,{method:"POST"});assert.equal(calls[1][0],u);
});