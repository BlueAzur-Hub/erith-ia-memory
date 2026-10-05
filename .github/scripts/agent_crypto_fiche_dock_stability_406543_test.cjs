const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {firefox}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const repo=process.env.REPO_ROOT||process.cwd();
const source=fs.readFileSync(path.join(repo,'public/agent_crypto_erith_ia/administrator/js/aether-role-visibility.js'),'utf8');
const start=source.indexOf('/* 40.6.543 R6 — ACTIVE MARKET FICHE PORTAL · DOCK AWARE */');
const end=source.indexOf('/* ==========================================================================\n   BUILD 40.6.83',start);
if(start<0||end<0)throw new Error('40.6.543 R6 block not found');
const block=source.slice(start,end);

(async()=>{
  const browser=await firefox.launch({headless:true});
  try{
    const page=await browser.newPage();
    await page.setContent(`
      <div id="marketWorkspaceGrid">
        <div id="atlasMarketCardDockHost"></div>
      </div>
      <aside id="atlasHelpLayer" data-market-help-coin-id="concrete" aria-hidden="false">
        <button type="button" data-market-card-mode="floating">Flottante</button>
        <button type="button" data-market-card-mode="dock">Latérale</button>
      </aside>
    `);
    await page.evaluate(()=>{
      const grid=document.getElementById('marketWorkspaceGrid');
      const host=document.getElementById('atlasMarketCardDockHost');
      const layer=document.getElementById('atlasHelpLayer');
      document.addEventListener('click',event=>{
        const button=event.target.closest?.('[data-market-card-mode]');
        if(!button)return;
        const mode=button.dataset.marketCardMode;
        if(mode==='dock'){
          grid.classList.add('market-card-dock-active');
          host.append(layer);
        }else if(mode==='floating'){
          grid.classList.remove('market-card-dock-active');
          document.body.append(layer);
        }
      });
    });
    await page.addScriptTag({content:block});

    const dock=page.locator('[data-market-card-mode="dock"]');
    const floating=page.locator('[data-market-card-mode="floating"]');

    await dock.click();
    await page.evaluate(()=>new Promise(r=>queueMicrotask(r)));
    let state=await page.evaluate(()=>({
      parent:document.getElementById('atlasHelpLayer').parentElement?.id||document.getElementById('atlasHelpLayer').parentElement?.tagName,
      dockActive:document.getElementById('marketWorkspaceGrid').classList.contains('market-card-dock-active'),
      z:document.getElementById('atlasHelpLayer').style.getPropertyValue('z-index'),
      mode:document.documentElement.dataset.marketFicheForeground406073R5||''
    }));
    assert.equal(state.parent,'atlasMarketCardDockHost','Latérale was re-parented back out of native dock');
    assert.equal(state.dockActive,true);
    assert.notEqual(state.z,'2147483647','floating z-index survived Latérale mode');
    assert.equal(state.mode,'dock');

    await floating.click();
    await page.evaluate(()=>new Promise(r=>queueMicrotask(r)));
    state=await page.evaluate(()=>({
      parent:document.getElementById('atlasHelpLayer').parentElement?.tagName,
      dockActive:document.getElementById('marketWorkspaceGrid').classList.contains('market-card-dock-active'),
      z:document.getElementById('atlasHelpLayer').style.getPropertyValue('z-index')
    }));
    assert.equal(state.parent,'BODY','Flottante did not return to body portal');
    assert.equal(state.dockActive,false);
    assert.equal(state.z,'2147483647');

    await dock.click();
    await page.evaluate(()=>new Promise(r=>queueMicrotask(r)));
    state=await page.evaluate(()=>({
      parent:document.getElementById('atlasHelpLayer').parentElement?.id,
      dockActive:document.getElementById('marketWorkspaceGrid').classList.contains('market-card-dock-active'),
      z:document.getElementById('atlasHelpLayer').style.getPropertyValue('z-index')
    }));
    assert.equal(state.parent,'atlasMarketCardDockHost','second Latérale transition failed');
    assert.equal(state.dockActive,true);
    assert.notEqual(state.z,'2147483647');

    console.log(JSON.stringify({pass:true,browser:'Firefox',checks:[
      'Latérale remains in atlasMarketCardDockHost',
      'dock mode releases floating max z-index',
      'Flottante preserves body-tail foreground portal',
      'Flottante -> Latérale transition remains repeatable'
    ]},null,2));
  }finally{
    await browser.close();
  }
})().catch(error=>{console.error(error);process.exit(1)});