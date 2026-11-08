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
test("public Spot listing catalogs are routed without enabling private admin paths",async()=>{
 const {ctx,calls}=client();
 const site="https://blueazur-hub.github.io/erith-ia-memory/";
 const raw="https://raw.githubusercontent.com/BlueAzur-Hub/erith-ia-memory/main/";
 for(const name of ["new-listings-identities.json","new-listings-public-feed.json"]){
  const path="public/agent_crypto_erith_ia/administrator/data/"+name;
  const url=site+path;
  assert.equal(ctx.AgentCryptoVaultDataRouter.route(url),raw+path);
  assert.equal(ctx.AgentCryptoVaultDataRouter.route(url,"POST"),null);
  await ctx.fetch(url,{headers:{Authorization:"Bearer SECRET",Accept:"application/json"}});
  const call=calls.at(-1);
  assert.equal(call[0],raw+path);
  assert.equal(call[1].credentials,"omit");
  assert.equal(call[1].headers.has("authorization"),false);
 }
 assert.equal(ctx.AgentCryptoVaultDataRouter.route(site+"public/agent_crypto_erith_ia/administrator/data/private.json"),null);
 assert.equal(ctx.AgentCryptoVaultDataRouter.route("https://bad.invalid/erith-ia-memory/public/agent_crypto_erith_ia/administrator/data/new-listings-identities.json"),null);
});
