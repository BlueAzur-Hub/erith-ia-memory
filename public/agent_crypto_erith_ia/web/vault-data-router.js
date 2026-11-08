/* Agent-Crypto: public vault reads independent of GitHub Pages. */
(()=>{"use strict";
 const BASE="https://raw.githubusercontent.com/BlueAzur-Hub/erith-ia-memory/main/";
 const PREFIX="public/agent_crypto_erith_ia/data/";
 const ADMIN_PUBLIC_JSON=new Set([
  "public/agent_crypto_erith_ia/administrator/data/new-listings-identities.json",
  "public/agent_crypto_erith_ia/administrator/data/new-listings-public-feed.json"
 ]);
 const native=globalThis.fetch.bind(globalThis);
 const observed={routed:0,bypassed:0};
 function route(input,method="GET"){
  if(!/^(GET|HEAD)$/i.test(String(method)))return null;
  try{
   const url=new URL(input instanceof Request?input.url:String(input),document.baseURI);
   if(url.origin!==location.origin)return null;
   // Route public archives plus exactly two public administration catalogs.
   const sitePrefix=url.pathname.startsWith("/erith-ia-memory/")?"/erith-ia-memory/":"/";
   const relative=url.pathname.slice(sitePrefix.length);
   if(!(relative.startsWith(PREFIX)||ADMIN_PUBLIC_JSON.has(relative))||
      relative.includes("\\")||/%(?:2f|5c)/i.test(relative))return null;
   const dest=new URL(relative,BASE);dest.search=url.search;
   return dest.href;
  }catch(_){return null;}
 }
 function routedFetch(input,init){
  const method=init?.method||(input instanceof Request?input.method:"GET");
  const dest=route(input,method);
  if(!dest){observed.bypassed++;return native(input,init);}
  const signal=init?.signal||(input instanceof Request?input.signal:undefined);
  const headers=new Headers(),original=new Headers(init?.headers||(input instanceof Request?input.headers:undefined));
  for(const name of ["accept","if-none-match","if-modified-since","range"]){
   if(original.has(name))headers.set(name,original.get(name));
  }
  observed.routed++;
  return native(dest,{method,mode:"cors",credentials:"omit",redirect:"error",cache:init?.cache||"default",signal,headers,referrerPolicy:"no-referrer"});
 }
 globalThis.fetch=routedFetch;
 globalThis.AgentCryptoVaultDataRouter=Object.freeze({route,stats:()=>Object.freeze({...observed}),read_only:true,private_access:false,public_source:BASE,revision:"runtime-pages"});
})();