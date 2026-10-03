/* Agent-Crypto — 40.6.514 USD DEFAULT SURFACE ROUTER + CT NEW LISTING
   Presentation/data-routing layer only. Market Core 38.15.11 business logic stays unchanged.
   - USD is the default display currency.
   - EUR remains operator-selectable.
   - USD values are direct-source values only; no silent EUR->USD relabel.
   - Main historical chart uses CoinGecko in the active display currency and a currency-scoped cache key.
   - Market USD cap/volume enrichment is direct CoinGecko Top 250, bounded and non-destructive.
   - Concrete (CT) is an external/new OKX listing lane and is never injected into canonical Top 250/1000 ranks.
*/
(()=>{
  "use strict";
  const BUILD="40.6.514";
  const USD_REFRESH_MS=5*60*1000;
  const ctState={status:"idle",symbol:"CT",name:"Concrete",instrument:"CT-USDC",last:null,open24h:null,high24h:null,low24h:null,volBase24h:null,volQuote24h:null,change24h:null,observedAt:null,error:null,selected:false};
  let usdMarketPromise=null,usdMarketAt=0,usdMarketError=null;

  const positive=v=>Number.isFinite(Number(v))&&Number(v)>0;
  const displayCurrency=()=>String(globalThis.AgentCryptoQuoteCurrencyArchitecture?.snapshot?.().displayCurrency||"USD").toUpperCase()==="EUR"?"EUR":"USD";
  const formatMoney=(value,currency=displayCurrency())=>{
    const n=Number(value);if(!Number.isFinite(n))return "—";
    return typeof atlasFormatCurrency==="function"?atlasFormatCurrency(n,currency):new Intl.NumberFormat("fr-FR",{style:"currency",currency,maximumFractionDigits:Math.abs(n)>=1000?2:6}).format(n);
  };
  const formatCompact=(value,currency=displayCurrency())=>{
    const n=Number(value);if(!Number.isFinite(n))return "—";
    return new Intl.NumberFormat("fr-FR",{style:"currency",currency,notation:"compact",maximumFractionDigits:2}).format(n);
  };
  const spotUsdForCoin=coin=>{
    if(!coin)return null;
    const direct=state?.dataBroker?.spotBook?.quotes?.[coin.id]?.usd;
    if(positive(direct))return Number(direct);
    if(positive(coin.priceUsd))return Number(coin.priceUsd);
    return null;
  };
  const spotEurForCoin=coin=>{
    if(!coin)return null;
    const direct=state?.dataBroker?.spotBook?.quotes?.[coin.id]?.eur;
    if(positive(direct))return Number(direct);
    const eur=Number(coin.marketPriceEur??coin.priceEur??coin.price);
    return positive(eur)?eur:null;
  };
  const displayPriceForCoin=coin=>displayCurrency()==="USD"?spotUsdForCoin(coin):spotEurForCoin(coin);
  const usdChange24ForCoin=coin=>{
    const value=state?.dataBroker?.spotBook?.quotes?.[coin?.id]?.change24hUsd;
    return Number.isFinite(Number(value))?Number(value):Number.isFinite(Number(coin?.change24hUsd))?Number(coin.change24hUsd):null;
  };
  const displayChange24ForCoin=coin=>displayCurrency()==="USD"?(usdChange24ForCoin(coin)??(Number.isFinite(Number(coin?.change24h))?Number(coin.change24h):null)):(Number.isFinite(Number(coin?.change24h))?Number(coin.change24h):null);
  const usdMarketCapForCoin=coin=>positive(coin?.marketCapUsd)?Number(coin.marketCapUsd):null;
  const usdVolumeForCoin=coin=>positive(coin?.volume24hUsd)?Number(coin.volume24hUsd):null;

  async function ensureUsdMarket(force=false){
    if(typeof SourceAdapter!=="object"||typeof SourceAdapter.coingeckoTop250Usd!=="function")return false;
    if(!Array.isArray(state?.coins)||state.coins.length<1)return false;
    const now=Date.now();
    const ready=state.coins.filter(c=>positive(c.priceUsd)&&positive(c.marketCapUsd)&&positive(c.volume24hUsd)).length;
    if(!force&&ready>=Math.min(40,state.coins.length)&&now-usdMarketAt<USD_REFRESH_MS)return true;
    if(usdMarketPromise)return usdMarketPromise;
    usdMarketPromise=(async()=>{
      try{
        const result=await SourceAdapter.coingeckoTop250Usd();
        const byId=new Map((result?.markets||[]).map(row=>[row.id,row]));
        let merged=0;
        state.coins=state.coins.map(coin=>{
          const row=byId.get(coin.id);if(!row)return coin;
          merged+=1;
          return {...coin,
            priceUsd:positive(row.priceUsd)?Number(row.priceUsd):coin.priceUsd,
            high24hUsd:Number.isFinite(Number(row.high24hUsd))?Number(row.high24hUsd):coin.high24hUsd,
            low24hUsd:Number.isFinite(Number(row.low24hUsd))?Number(row.low24hUsd):coin.low24hUsd,
            marketCapUsd:Number.isFinite(Number(row.marketCapUsd))?Number(row.marketCapUsd):coin.marketCapUsd,
            volume24hUsd:Number.isFinite(Number(row.volume24hUsd))?Number(row.volume24hUsd):coin.volume24hUsd,
            change1hUsd:Number.isFinite(Number(row.change1h))?Number(row.change1h):coin.change1hUsd,
            change24hUsd:Number.isFinite(Number(row.change24h))?Number(row.change24h):coin.change24hUsd,
            change7dUsd:Number.isFinite(Number(row.change7d))?Number(row.change7d):coin.change7dUsd,
            change30dUsd:Number.isFinite(Number(row.change30d))?Number(row.change30d):coin.change30dUsd,
            usdUpdatedAt:result.generatedAt||new Date().toISOString(),
            quoteCurrencies:[...new Set([...(Array.isArray(coin.quoteCurrencies)?coin.quoteCurrencies:[]),"EUR","USD"])]
          };
        });
        if(state.dataBroker?.market?.status==="ready"){
          state.dataBroker.market.quoteCurrencies=["EUR","USD"];
          state.dataBroker.market.usdTimestamp=result.generatedAt||new Date().toISOString();
          state.dataBroker.market.usdAssets=merged;
        }
        usdMarketAt=now;usdMarketError=null;
        refreshPresentation();
        return merged>0;
      }catch(error){usdMarketError=String(error?.message||error);return false;}
      finally{usdMarketPromise=null;}
    })();
    return usdMarketPromise;
  }

  function withDisplayFormatter(fn,ctx,args){
    if(displayCurrency()!=="USD")return fn.apply(ctx,args);
    const original=atlasFormatEUR;
    try{atlasFormatEUR=atlasFormatUSD;return fn.apply(ctx,args);}finally{atlasFormatEUR=original;}
  }

  function patchCompactDetail(coin){
    const value=document.getElementById("detailCompactPrice");
    if(value){
      const label=value.previousElementSibling;
      if(label)label.textContent=`Prix ${displayCurrency()}`;
      const price=displayPriceForCoin(coin);
      value.textContent=positive(price)?formatMoney(price):"—";
    }
  }

  function patchAssetDetail(coin,result){
    const grid=document.getElementById("assetDetailGrid");if(!grid||!coin)return;
    const rows=[...grid.children];
    const find=label=>rows.find(row=>row.querySelector("b")?.textContent?.trim()===label);
    const usd=find("Prix spot USD"),eur=find("Prix spot EUR"),last=find("Dernier point"),gap=find("Écart spot/courbe");
    if(usd&&eur&&displayCurrency()==="USD"){
      usd.dataset.displayPrimary="1";eur.dataset.displaySecondary="1";
      if(usd.compareDocumentPosition(eur)&Node.DOCUMENT_POSITION_PRECEDING)eur.parentNode?.insertBefore(usd,eur);
    }else if(usd&&eur){eur.dataset.displayPrimary="1";usd.dataset.displaySecondary="1";}
    const metrics=result?.integrity?.metrics||{};
    if(last&&Number.isFinite(Number(metrics.lastPrice))){
      const span=last.querySelector("span");if(span)span.textContent=`${formatMoney(metrics.lastPrice)} · ${Number.isFinite(Number(metrics.lastTimestamp))?atlasChartLabelFull(metrics.lastTimestamp):"—"}`;
    }
    if(gap&&Number.isFinite(Number(metrics.lastPrice))){
      const spot=displayPriceForCoin(coin);const pct=positive(spot)?Math.abs(Number(metrics.lastPrice)-spot)/spot*100:null;
      const span=gap.querySelector("span");if(span)span.textContent=Number.isFinite(pct)?`${pct.toFixed(2)} %`:"non calculé";
    }
  }

  function patchMarketRows(){
    const currency=displayCurrency();
    document.querySelectorAll("#marketRows tr[data-id]").forEach(row=>{
      const coin=state.coins.find(c=>c.id===row.dataset.id);if(!coin)return;
      const cells=row.children;
      if(cells[5])cells[5].textContent=currency==="USD"?(usdMarketCapForCoin(coin)!==null?formatCompact(coin.marketCapUsd,"USD"):"USD en attente"):typeof atlasFormatMarketCapEUR==="function"?atlasFormatMarketCapEUR(coin.marketCap):formatCompact(coin.marketCap,"EUR");
      if(cells[6])cells[6].textContent=currency==="USD"?(usdVolumeForCoin(coin)!==null?formatCompact(coin.volume24hUsd,"USD"):"USD en attente"):formatCompact(coin.volume24h,"EUR");
    });
    document.querySelectorAll("#marketRows tr[data-market-extended-id403115],#marketRows tr[data-market-external403100]").forEach(row=>{
      if(row.dataset.ctNewListing514==="1")return;
      const id=row.dataset.marketExtendedId403115||row.dataset.marketExternal403100;
      let coin=null;try{coin=typeof atlasMarketUniverseFind==="function"?atlasMarketUniverseFind(id):null;}catch(_){}
      const cells=row.children;
      if(currency==="USD"){
        const price=positive(coin?.priceUsd)?formatMoney(coin.priceUsd,"USD"):"— USD";
        const p=cells[2]?.querySelector("strong");if(p)p.textContent=price;
        if(cells[5])cells[5].textContent=positive(coin?.marketCapUsd)?formatCompact(coin.marketCapUsd,"USD"):"— USD";
        if(cells[6])cells[6].textContent=positive(coin?.volume24hUsd)?formatCompact(coin.volume24hUsd,"USD"):"— USD";
      }
    });
  }

  function patchMarketFlow(){
    document.querySelectorAll("#tickerTrack [data-ticker-id]").forEach(item=>{
      const coin=state.coins.find(c=>c.id===item.dataset.tickerId);if(!coin)return;
      const price=item.querySelector(".ticker-price");const value=displayPriceForCoin(coin);
      if(price)price.textContent=positive(value)?formatMoney(value):"—";
      const change=item.querySelector(".ticker-change");const ch=displayChange24ForCoin(coin);
      if(change&&Number.isFinite(ch))change.textContent=typeof atlasFmtMarketPct==="function"?atlasFmtMarketPct(ch):`${ch>=0?"+":""}${ch.toFixed(2)} %`;
    });
  }

  function patchChartLabels(){
    const currency=displayCurrency();
    const shell=document.querySelector("#analyste .chart-shell");
    if(shell?.dataset?.chartSummary)shell.dataset.chartSummary=shell.dataset.chartSummary.replace(/Prix (EUR|USD)/g,`Prix ${currency}`).replace(/\b(EUR|USD)\b/g,currency);
    const chart=state?.chartEngineV2?.realChart;
    if(chart?.data?.datasets){chart.data.datasets.forEach(ds=>{if(typeof ds.label==="string")ds.label=ds.label.replace(/\b(EUR|USD)\b/g,currency);});}
    const cap=document.getElementById("chartCaption");if(cap){cap.innerHTML=cap.innerHTML.replace(/Prix (EUR|USD)/g,`Prix ${currency}`);cap.setAttribute("aria-label",(cap.getAttribute("aria-label")||cap.textContent||"").replace(/Prix (EUR|USD)/g,`Prix ${currency}`));}
    const overlay=document.getElementById("atlasChartInsightOverlay");if(overlay)overlay.innerHTML=overlay.innerHTML.replace(/Prix (EUR|USD)/g,`Prix ${currency}`).replace(/\bCoinGecko (EUR|USD)\b/g,`CoinGecko ${currency}`);
    if(typeof atlasWorkspaceRenderStrip==="function")atlasWorkspaceRenderStrip();
  }

  function patchOracle(){
    if(displayCurrency()!=="USD")return;
    let coin=null;try{coin=typeof atlasOracleSelectCoin==="function"?atlasOracleSelectCoin():getSelectedCoin();}catch(_){coin=typeof getSelectedCoin==="function"?getSelectedCoin():null;}
    const node=document.getElementById("atlasOraclePrice");const price=spotUsdForCoin(coin);
    if(node&&coin&&positive(price))node.textContent=formatMoney(price,"USD");
  }

  function patchLectureCss(){
    if(document.getElementById("usdDefaultSurfaceRouter406514Style"))return;
    const style=document.createElement("style");style.id="usdDefaultSurfaceRouter406514Style";
    style.textContent=`
#detailPanel [id*="Price"],#detailPanel .detail-compact-strip b,#detailPanel .detail-grid span,#atlasOkxMicrostructure{font-variant-numeric:tabular-nums lining-nums}
#detailPanel .atlas-detail-subwindow summary small{color:#a8bac4!important;letter-spacing:.01em}
#detailPanel .atlas-detail-subwindow summary em{font-weight:850}
#assetDetailGrid>[data-display-primary="1"]{border-color:rgba(104,232,239,.36)!important;background:rgba(58,190,205,.08)!important}
#assetDetailGrid>[data-display-secondary="1"]{opacity:.82}
#atlasOkxMicrostructure[data-freshness="OFFLINE"] .oms-kpis,#atlasOkxMicrostructure[data-freshness="OFFLINE"] .oms-body{opacity:.58;filter:saturate(.7)}
#atlasOkxMicrostructure[data-freshness="STALE"] .oms-kpis,#atlasOkxMicrostructure[data-freshness="STALE"] .oms-body{opacity:.76}
`;
    document.head.appendChild(style);
  }

  async function fetchCt(){
    if(ctState.status==="loading")return false;
    ctState.status="loading";ctState.error=null;renderCtRow();
    try{
      const response=await fetch("https://www.okx.com/api/v5/market/ticker?instId=CT-USDC",{cache:"no-store"});
      const json=await response.json();
      const row=Array.isArray(json?.data)?json.data[0]:null;
      if(!response.ok||String(json?.code)!=="0"||!row)throw new Error(`OKX CT-USDC ${response.status} / ${json?.code??"?"}`);
      const last=Number(row.last),open=Number(row.open24h);
      ctState.last=positive(last)?last:null;ctState.open24h=positive(open)?open:null;ctState.high24h=positive(row.high24h)?Number(row.high24h):null;ctState.low24h=positive(row.low24h)?Number(row.low24h):null;
      ctState.volBase24h=positive(row.vol24h)?Number(row.vol24h):null;ctState.volQuote24h=positive(row.volCcy24h)?Number(row.volCcy24h):null;
      ctState.change24h=positive(last)&&positive(open)?(last-open)/open*100:null;
      ctState.observedAt=positive(row.ts)?new Date(Number(row.ts)).toISOString():new Date().toISOString();ctState.status="ready";ctState.error=null;
    }catch(error){ctState.status="offline";ctState.error=String(error?.message||error);}
    renderCtRow();return ctState.status==="ready";
  }

  function ctRowMarkup(){
    const price=positive(ctState.last)?`${new Intl.NumberFormat("fr-FR",{maximumFractionDigits:6}).format(ctState.last)} USDC`:ctState.status==="loading"?"Chargement…":"—";
    const move=Number.isFinite(Number(ctState.change24h))?`${ctState.change24h>=0?"+":""}${ctState.change24h.toFixed(2)} %`:"—";
    const volume=positive(ctState.volQuote24h)?`${new Intl.NumberFormat("fr-FR",{notation:"compact",maximumFractionDigits:2}).format(ctState.volQuote24h)} USDC`:"—";
    const status=ctState.status==="ready"?"OKX LIVE":ctState.status==="loading"?"OKX · chargement":"OKX · hors ligne";
    const tone=Number(ctState.change24h);const cls=Number.isFinite(tone)?(tone>0?"pos":tone<0?"neg":"neutral"):"neutral";
    return `<tr class="asset-row atlas-market-external-row" data-ct-new-listing514="1" tabindex="0" role="button" aria-label="Concrete CT · nouveau listing OKX · CT/USDC">
<td>NEW</td><td><div class="coin-cell"><i class="market-identity-rail"></i><div><strong class="market-coin-name">Concrete</strong><br><small>CT</small><br><span class="asset-badge">NOUVEAU · OKX</span></div></div></td>
<td><div class="price-dual"><strong>${price}</strong><small>${status} · CT/USDC${ctState.observedAt?` · ${new Date(ctState.observedAt).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}`:""}</small></div></td>
<td class="${cls}"><span class="market-move-pill ${cls}">${move}</span></td><td>—</td><td class="market-col-advanced">hors classement</td><td class="market-col-advanced">${volume}</td><td class="spark-cell"><small>CT/USDC</small></td><td class="market-col-advanced">—</td><td class="market-col-advanced">Observer · nouveau</td>
<td><div class="market-row-actions"><button type="button" data-ct-action="select">Sélectionner</button><button type="button" data-ct-action="candles">Bougies</button><button type="button" data-ct-action="depth">Profondeur</button><a href="https://www.okx.com/trade-spot/ct-usdc" target="_blank" rel="noopener noreferrer">OKX ↗</a></div></td></tr>`;
  }

  function renderCtRow(){
    const q=String(document.getElementById("searchInput")?.value||"").trim().toUpperCase();
    if(q!=="CT"&&q!=="CONCRETE")return;
    if(typeof renderMarketTable==="function")renderMarketTable();
  }

  function selectCt(){ctState.selected=true;document.documentElement.dataset.externalCryptoSymbol="CT";const input=document.getElementById("searchInput");if(input)input.value="CT";return true;}
  function clearCt(){ctState.selected=false;delete document.documentElement.dataset.externalCryptoSymbol;}

  function installCtMenu(){
    const host=document.querySelector("#marketTools .filter-chips");if(!host||document.getElementById("atlasCtNewListing406514"))return;
    const button=document.createElement("button");button.type="button";button.id="atlasCtNewListing406514";button.className="filter-btn";button.textContent="Nouveaux · CT";button.title="Concrete (CT) · nouveau listing OKX · paire native CT/USDC";
    button.addEventListener("click",()=>{selectCt();button.classList.add("active");void fetchCt();if(typeof renderMarketTable==="function")renderMarketTable();});host.appendChild(button);
    const input=document.getElementById("searchInput");input?.addEventListener("keydown",event=>{if(event.key!=="Enter")return;const q=String(input.value||"").trim().toUpperCase();if(q==="CT"||q==="CONCRETE"){event.preventDefault();selectCt();void fetchCt();if(typeof renderMarketTable==="function")renderMarketTable();}});
    document.addEventListener("click",event=>{
      const action=event.target.closest?.("[data-ct-action]")?.dataset?.ctAction;if(!action)return;
      event.preventDefault();event.stopPropagation();selectCt();
      if(action==="candles"){globalThis.AgentCryptoMarketMicroscope?.setMode?.("candles");void globalThis.AgentCryptoMarketMicroscope?.load?.();}
      else if(action==="depth"){globalThis.AgentCryptoOkxMicrostructure?.setOpen?.(true);}
    });
  }

  const originalExternalRow=atlasMarketExternalRowMarkup;
  atlasMarketExternalRowMarkup=function(rawQuery){const q=String(rawQuery||"").trim().toUpperCase();if(q==="CT"||q==="CONCRETE")return ctRowMarkup();return originalExternalRow(rawQuery);};
  const originalUniverseFiltered=atlasMarketUniverseFiltered;
  atlasMarketUniverseFiltered=function(){const q=String(document.getElementById("searchInput")?.value||"").trim().toUpperCase();if(q==="CT"||q==="CONCRETE")return [];return originalUniverseFiltered();};

  const originalQuotePriceText=atlasCurrentQuotePriceText;
  atlasCurrentQuotePriceText=function(quote){if(displayCurrency()!=="USD")return originalQuotePriceText(quote);const price=spotUsdForCoin(quote?.coin);return positive(price)?formatMoney(price,"USD"):"—";};
  const originalQuoteChangeText=atlasCurrentQuoteChangeText;
  atlasCurrentQuoteChangeText=function(quote){if(displayCurrency()!=="USD")return originalQuoteChangeText(quote);const change=usdChange24ForCoin(quote?.coin);if(!Number.isFinite(change))return originalQuoteChangeText(quote);const value=typeof fmtPct==="function"?fmtPct(change):`${change>=0?"+":""}${change.toFixed(2)} %`;return quote?.status==="conserved"?`≈ ${value}`:value;};
  const originalQuoteTitle=atlasCurrentQuoteTitle;
  atlasCurrentQuoteTitle=function(quote){if(displayCurrency()!=="USD")return originalQuoteTitle(quote);const coin=quote?.coin;const price=spotUsdForCoin(coin);if(!positive(price))return "Prix USD indisponible";const timestamp=state?.dataBroker?.spotBook?.quotes?.[coin?.id]?.timestamp||coin?.usdUpdatedAt||coin?.lastUpdated||state?.timestamp;return `USD direct · CoinGecko · ${atlasExactTimestampLabel(timestamp)}`;};

  const originalSnapshotSurface=atlasMarketSnapshotSurface;
  atlasMarketSnapshotSurface=function(coin,now=Date.now()){const base=originalSnapshotSurface(coin,now);if(displayCurrency()!=="USD")return base;const ch=usdChange24ForCoin(coin);return {...base,priceUsd:spotUsdForCoin(coin),change24h:Number.isFinite(ch)?ch:base.change24h,directChange24h:Number.isFinite(ch)?ch:base.directChange24h,truthLabel:positive(spotUsdForCoin(coin))?"DIRECT · CoinGecko USD":base.truthLabel};};

  const originalSelectedSpot=atlasSelectedSpotFor;
  atlasSelectedSpotFor=function(coin){const base=originalSelectedSpot(coin);if(!coin)return base;const direct=state?.dataBroker?.spotBook?.quotes?.[coin.id]||{};return {...(base||{}),coinId:coin.id,eur:positive(direct.eur)?Number(direct.eur):spotEurForCoin(coin),usd:positive(direct.usd)?Number(direct.usd):spotUsdForCoin(coin),timestamp:direct.timestamp||base?.timestamp||coin.usdUpdatedAt||coin.lastUpdated||state.timestamp,source:displayCurrency()==="USD"?"CoinGecko USD direct":base?.source||"CoinGecko EUR"};};

  const originalRenderCompact=atlasRenderCompactDetailSummary;
  atlasRenderCompactDetailSummary=function(coin=null){const out=originalRenderCompact(coin);patchCompactDetail(coin);return out;};
  const originalRenderAssetDetail=atlasRenderAssetDetail;
  atlasRenderAssetDetail=function(c,period,result=null,mode="loading"){const out=withDisplayFormatter(originalRenderAssetDetail,this,arguments);patchCompactDetail(c);patchAssetDetail(c,result);return out;};

  const originalRenderMarketTable=renderMarketTable;
  renderMarketTable=function(){const out=originalRenderMarketTable.apply(this,arguments);patchMarketRows();return out;};
  const originalPatchMarketRow=atlasPatchMarketRowSnapshot;
  atlasPatchMarketRowSnapshot=function(row,coin,selection){const out=originalPatchMarketRow.apply(this,arguments);patchMarketRows();return out;};
  const originalMarketFlow=atlasRenderMarketFlowRibbon;
  atlasRenderMarketFlowRibbon=function(){const out=originalMarketFlow.apply(this,arguments);patchMarketFlow();return out;};

  const originalChartStorageKey=atlasChartStorageKey;
  atlasChartStorageKey=function(c,days,family=atlasChartPreferredSourceFamily(c)){return `${originalChartStorageKey(c,days,family)}:${displayCurrency().toLowerCase()}`;};
  const originalPreferredFamily=atlasChartPreferredSourceFamily;
  atlasChartPreferredSourceFamily=function(coinOrId){return displayCurrency()==="USD"?"coingecko":originalPreferredFamily(coinOrId);};
  const originalCoinGeckoChart=fetchCoinGeckoChartDirect;
  fetchCoinGeckoChartDirect=async function(c,days,options={}){
    if(displayCurrency()!=="USD")return originalCoinGeckoChart(c,days,options);
    const period=Number(days||1),apiDays=atlasChartApiDays(period);
    const url=`https://api.coingecko.com/api/v3/coins/${encodeURIComponent(c.id)}/market_chart?vs_currency=usd&days=${encodeURIComponent(apiDays)}&precision=full`;
    const payload=await atlasFetchJson(url,{signal:options.signal,timeoutMs:Number(options.timeoutMs||ATLAS_CHART_DIRECT_TIMEOUT_MS)});
    const prices=atlasNormalizeChartPayload(payload),volumeSeries=atlasNormalizeVolumePayload(payload);
    const validationCoin={...c,price:spotUsdForCoin(c)??c.priceUsd??c.price};
    const integrity=atlasValidateChartSeries({c:validationCoin,days:period,prices,payload,sourceMode:"coingecko-direct"});
    if(!integrity.ok)throw new Error(`série CoinGecko USD refusée · ${integrity.reason}`);
    return {series:prices,volumeSeries,source:"CoinGecko market_chart USD · direct",blocked:false,kind:"coingecko-direct",sourceMode:"coingecko-direct",sourceFamily:"coingecko",quoteCurrency:"USD",periodDays:period,apiDays,pointCount:prices.length,generatedAt:new Date(integrity.metrics.lastTimestamp).toISOString(),integrity};
  };
  const originalAxisLabel=atlasChartAxisPriceLabel;
  atlasChartAxisPriceLabel=function(value,view="price"){if(view==="base100"||displayCurrency()!=="USD")return originalAxisLabel(value,view);return formatMoney(value,"USD");};

  try{const original=drawLineChart;drawLineChart=function(){const out=withDisplayFormatter(original,this,arguments);patchChartLabels();return out;};}catch(_){}
  try{const original=atlasRenderSingleCaption;atlasRenderSingleCaption=function(){const out=withDisplayFormatter(original,this,arguments);patchChartLabels();return out;};}catch(_){}
  try{const original=atlasChartOverlaySolo;atlasChartOverlaySolo=function(){const out=withDisplayFormatter(original,this,arguments);patchChartLabels();return out;};}catch(_){}
  try{const original=atlasExternalChartTooltip;atlasExternalChartTooltip=function(){return withDisplayFormatter(original,this,arguments);};}catch(_){}
  try{const original=atlasChartV2RenderLegend;atlasChartV2RenderLegend=function(){return withDisplayFormatter(original,this,arguments);};}catch(_){}

  const originalOracle=atlasRenderOracleV0;
  atlasRenderOracleV0=function(){const out=originalOracle.apply(this,arguments);patchOracle();return out;};

  const originalBrokerCommit=atlasBrokerCommitMarket;
  atlasBrokerCommitMarket=function(snapshot,mode){const out=originalBrokerCommit(snapshot,mode);if(displayCurrency()==="USD")queueMicrotask(()=>void ensureUsdMarket(false));return out;};

  function refreshPresentation(){
    try{renderMarketTable();}catch(_){}
    try{renderTicker();}catch(_){}
    try{const coin=getSelectedCoin();atlasRenderCompactDetailSummary(coin);if(state.dataBroker?.chart?.status==="ready"&&coin)atlasRenderAssetDetail(coin,Number(state.chartPeriodDays||1),state.dataBroker.chart.result,"valid");}catch(_){}
    try{if(state.chartViewV2?.oracle!==false)atlasRenderOracleV0();}catch(_){}
    patchChartLabels();patchMarketRows();patchMarketFlow();
  }

  function restartChartForCurrency(){
    try{state.chartRenderToken+=1;state.chartEngineV2?.controller?.abort?.();state.dataBroker.chart={...state.dataBroker.chart,status:"idle",result:null,contextKey:null};if(typeof atlasStartSelectedChart==="function")atlasStartSelectedChart(30,false);}catch(_){}
  }

  function onCurrencyChanged(){
    document.documentElement.dataset.displayCurrency406514=displayCurrency();
    if(displayCurrency()==="USD")void ensureUsdMarket(false);
    refreshPresentation();restartChartForCurrency();
    try{globalThis.AgentCryptoMarketMicroscope?.load?.();}catch(_){}
  }

  function boot(){
    patchLectureCss();installCtMenu();
    document.documentElement.dataset.displayCurrency406514=displayCurrency();
    if(displayCurrency()==="USD")void ensureUsdMarket(false);
    refreshPresentation();
  }

  window.addEventListener("agent-crypto:quote-architecture-changed",onCurrencyChanged,{passive:true});
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();

  globalThis.AgentCryptoUsdDefaultSurfaceRouter=Object.freeze({
    build:BUILD,displayCurrency,ensureUsdMarket,refresh:refreshPresentation,
    ct:Object.freeze({snapshot:()=>Object.freeze({...ctState}),fetch:fetchCt,select:selectCt,clear:clearCt,selectedSymbol:()=>ctState.selected?"CT":null}),
    snapshot:()=>Object.freeze({build:BUILD,display_currency:displayCurrency(),usd_market_at:usdMarketAt||null,usd_market_error:usdMarketError,ct:{...ctState},market_core:"38.15.11",market_core_modified:false,real_order:false}),
    usd_default:true,eur_switch_preserved:true,direct_usd_only:true,market_core_changed:false,strategy_changed:false,real_order:false,new_recurring_timer:false,mutation_observer:false
  });
  globalThis.AgentCryptoNewListing=globalThis.AgentCryptoUsdDefaultSurfaceRouter.ct;
})();