"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs");
const {safeCoin,validatePng,CONTRACT}=require("./archive_neosoul_identity.cjs");
const example=()=>({id:"neosoul",name:"NeoSoul",symbol:"dna",
 platforms:{"binance-smart-chain":"0xA991F61940095AEA0724ef54077223B048c5CF7b"},
 image:{small:"https://coin-images.coingecko.com/coins/images/99999/small/neosoul.png"}});
test("only exact NeoSoul DNA and contract match official CoinGecko",()=>{
 const c=safeCoin(example());
 assert.equal(c.coinId,"neosoul");assert.equal(c.symbol,"DNA");assert.equal(c.contract,CONTRACT);
});
test("homonymous token or bad contract cannot inherit the DNA logo",()=>{
 for(const change of [{id:"dna-token"},{symbol:"CT"},{name:"Neo Soul"},{platforms:{"binance-smart-chain":"0x00"}}])
  assert.throws(()=>safeCoin({...example(),...change}),/unverified|disagree/);
});
test("remote logo cannot be hosted outside the verified image CDN",()=>{
 for(const u of ["http://coin-images.coingecko.com/coins/images/1/small/dna.png",
 "https://fake.coingecko.com/coins/images/1/small/dna.png",
 "https://coin-images.coingecko.com/other/images/1/small/dna.png"])
 assert.throws(()=>safeCoin({...example(),image:{small:u}}),/Untrusted/);
});
test("only finite PNG binaries accepted; no letter or fake logo fallback",()=>{
 const valid=Buffer.concat([Buffer.from("89504e470d0a1a0a","hex"),Buffer.alloc(100)]);
 assert.equal(validatePng(valid).length,108);
 assert.throws(()=>validatePng(Buffer.alloc(100)),/PNG/);
});
test("new listing resolves CoinGecko id but keeps Bitget provenance",()=>{
 const js=fs.readFileSync(require("node:path").join(__dirname,"../administrator/js/new-listings-native-category.js"),"utf8");
 assert.match(js,/DNA:Object\.freeze\(\{name:"NeoSoul",coingeckoId:"neosoul"\}\)/);
 assert.match(js,/provider=isCt\?"okx":"bitget"/);
 assert.match(js,/function safeIdentityImage/);
});
