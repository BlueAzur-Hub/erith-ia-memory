const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {firefox}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 const browser=await firefox.launch({headless:true});
 try{
   const page=await browser.newPage({viewport:{width:1600,height:900}});
   const css=fs.readFileSync(path.join(process.cwd(),'public/agent_crypto_erith_ia/administrator/style.css'),'utf8');
   await page.setContent(`<style>${css}</style><div id="marketWorkspaceGrid" class="market-workspace-grid market-card-dock-active"><main id="market">MARKET</main><aside id="atlasMarketCardDockHost" class="atlas-market-card-dock-host">CARD<br>${'x<br>'.repeat(100)}</aside></div>`);
   const s=await page.evaluate(()=>{
     const grid=document.getElementById('marketWorkspaceGrid');
     const host=document.getElementById('atlasMarketCardDockHost');
     const gr=getComputedStyle(grid),hr=getComputedStyle(host),rect=host.getBoundingClientRect();
     return {cols:gr.gridTemplateColumns,width:rect.width,position:hr.position,overflowY:hr.overflowY,maxHeight:hr.maxHeight};
   });
   assert.ok(s.width>=320 && s.width<=391,`dock width ${s.width}`);
   assert.equal(s.position,'sticky');
   assert.ok(['auto','scroll'].includes(s.overflowY));
   console.log(JSON.stringify({pass:true,browser:'Firefox',geometry:s},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
