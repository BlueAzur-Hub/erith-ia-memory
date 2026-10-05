const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {firefox}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.join(process.cwd(),'public/agent_crypto_erith_ia/administrator');
const assets=['concrete.png','magic-hash.png','marscat-token.png','pons.png','canopy.png'];
const server=http.createServer((req,res)=>{
  const rel=decodeURIComponent((req.url||'/').replace(/^\//,''));
  const file=path.join(root,rel);
  if(!file.startsWith(root)||!fs.existsSync(file)){res.statusCode=404;return res.end('not found');}
  res.setHeader('Content-Type',file.endsWith('.png')?'image/png':'text/html');
  fs.createReadStream(file).pipe(res);
});
server.listen(0,'127.0.0.1',async()=>{
  const port=server.address().port;
  const browser=await firefox.launch({headless:true});
  try{
    const page=await browser.newPage();
    const html='<html><body>'+assets.map((f,i)=>`<img id="i${i}" src="http://127.0.0.1:${port}/assets/crypto/new-listings/${f}" loading="eager" width="32" height="32">`).join('')+'</body></html>';
    await page.setContent(html);
    await page.waitForFunction(()=>[...document.images].every(img=>img.complete&&img.naturalWidth===32&&img.naturalHeight===32));
    const state=await page.evaluate(()=>[...document.images].map(img=>({src:img.src,w:img.naturalWidth,h:img.naturalHeight,complete:img.complete})));
    assert.equal(state.length,5);
    for(const row of state){assert.equal(row.w,32);assert.equal(row.h,32);assert.equal(row.complete,true);}
    console.log(JSON.stringify({pass:true,browser:'Firefox',images:state},null,2));
  }finally{
    await browser.close(); server.close();
  }
}).on('error',e=>{console.error(e);process.exit(1)});
