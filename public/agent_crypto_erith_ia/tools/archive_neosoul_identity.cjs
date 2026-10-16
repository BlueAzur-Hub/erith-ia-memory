#!/usr/bin/env node
"use strict";
/* Only store a real CoinGecko NeoSoul logo verified by ID, symbol AND chain contract.
 * No synthesized logo, no third-party assets, no intervention in Market Core or Trader.
 */
const fs=require("node:fs"),path=require("node:path");
const ROOT=path.join(__dirname,".."),REGISTRY=path.join(ROOT,"administrator/data/new-listings-identities.json");
const TARGET=path.join(ROOT,"administrator/assets/crypto/new-listings/neosoul.png");
const CONTRACT="0xa991f61940095aea0724ef54077223b048c5cf7b";
const ID="neosoul",SYMBOL="DNA";
function safeCoin(raw){
 if(raw?.id!==ID||String(raw.symbol).toUpperCase()!==SYMBOL||raw.name!=="NeoSoul")
  throw Error("NeoSoul ID, symbol and name disagree");
 const contracts=[
  ...Object.values(raw.platforms||{}),
  ...Object.values(raw.detail_platforms||{}).map(x=>x?.contract_address)
 ].filter(Boolean).map(x=>String(x).toLowerCase());
 if(!contracts.includes(CONTRACT))throw Error("NeoSoul BNB contract unverified");
 const image=raw.image?.small||raw.image?.large;
 if(typeof image!=="string")throw Error("Missing official CoinGecko image");
 const url=new URL(image);
 if(url.protocol!=="https:"||url.hostname!=="coin-images.coingecko.com"||!/^\/coins\/images\/\d+\//.test(url.pathname))
  throw Error("Untrusted logo origin");
 return {url:url.toString(),contract:CONTRACT,coinId:ID,symbol:SYMBOL};
}
function validatePng(data){
 const bin=Buffer.from(data);
 if(bin.length<80||bin.length>1000000||!bin.subarray(0,8).equals(Buffer.from("89504e470d0a1a0a","hex")))
  throw Error("Logo not a reasonable PNG image");
 return bin;
}
async function get(url,type){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);
 try{
  const res=await fetch(url,{headers:{"Accept":type,"User-Agent":"ERITH-Aether-verified-public-logo/1.0"},signal:controller.signal});
  if(!res.ok)throw Error("CoinGecko HTTP "+res.status);
  return type==="application/json"?res.json():res.arrayBuffer();
 }finally{clearTimeout(timer);}
}
async function main(){
 const json=await get("https://api.coingecko.com/api/v3/coins/neosoul?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false","application/json");
 const coin=safeCoin(json);
 const png=validatePng(await get(coin.url,"image/png"));
 const registry=JSON.parse(fs.readFileSync(REGISTRY,"utf8"));
 if(registry.schema!=="agent_crypto_new_listings_identity_registry_v1"||!registry.identities)
  throw Error("Unknown identity registry schema");
 registry.identities.neosoul={
  symbol:"DNA",displayName:"NeoSoul",canonicalName:"NeoSoul",coingeckoId:"neosoul",
  image:"./assets/crypto/new-listings/neosoul.png",verified:true,
  verifiedAt:new Date().toISOString().slice(0,10),
  provenance:"Verified CoinGecko id+symbol+BNB contract; original CoinGecko small PNG",
  logoStorage:"github-binary-asset",logoSource:"CoinGecko",logoSourceCoinId:"neosoul",
  contract:"0xA991F61940095AEA0724ef54077223B048c5CF7b"
 };
 fs.mkdirSync(path.dirname(TARGET),{recursive:true});
 fs.writeFileSync(TARGET,png);
 fs.writeFileSync(REGISTRY,JSON.stringify(registry,null,2)+"\n");
 console.log("PASS verified NeoSoul logo",png.length,"bytes",coin.url);
}
if(require.main===module)main().catch(e=>{console.error("NO LOGO PUBLISHED:",String(e.message||e));process.exitCode=1});
module.exports={safeCoin,validatePng,CONTRACT};
