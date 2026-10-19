/* Seven Heaven · pure Bitget Spot native 1D integrity validator.
   This module never fetches, caches, converts, selects an asset or places orders. */
(()=>{"use strict";
const DAY=86400000, HEX=/^[a-f0-9]{64}$/;
function check(value,reason){if(!value)throw Error("Bitget 1D : "+reason);}
function validate(payload,entry){
 check(entry?.id==="quack-ai"&&entry.symbol==="Q"&&entry.market==="QUSDT"&&
  entry.venue==="Bitget Spot"&&entry.bar==="1D"&&entry.quote==="USDT"&&
  HEX.test(entry.sha256||""),"identité de source Q manquante");
 check(payload?.schema==="aerith.bitget.native-exchange-daily-history.verified-response.v1"&&
  payload.exchange==="Bitget Spot"&&payload.market==="QUSDT"&&
  payload.quote==="USDT"&&payload.native_interval==="1D","source native incompatible");
 check(payload.owner?.id==="quack-ai"&&payload.owner?.symbol==="Q"&&
  payload.owner?.rank===entry.rank,"identité Q discordante");
 check(payload.filled_by_our_collector===false&&
  payload.canonical_1m_federation_modified===false&&
  payload.native_daily_timezone_not_normalized===true&&
  payload.historical_source_exhaustion_proven===false,
  "archive fabriquée ou portée historique déclarée à tort");
 const rows=payload.native_daily_rows;
 check(Array.isArray(rows)&&rows.length===entry.native_candles&&
  payload.native_candles===entry.native_candles,"nombre de journées incohérent");
 const offset=entry.native_session_start_modulo_utc_day_ms;
 check(Number.isInteger(offset)&&[0,57600000].includes(offset)&&
  payload.native_session_start_modulo_utc_day_ms===offset,
  "horaire de session original modifié");
 let before=null,gaps=0;
 for(const row of rows){
  check(Array.isArray(row)&&row.length===7&&row.every(v=>typeof v==="string"),
    "sept champs originaux attendus");
  const time=Number(row[0]),numbers=row.slice(1).map(Number);
  check(Number.isSafeInteger(time)&&time>0&&time%DAY===offset,
   "date native illisible ou déplacée");
  check(numbers.every(Number.isFinite),"nombre non fini");
  const [open,high,low,close,baseVolume,quoteVolume]=numbers;
  check(Math.min(open,high,low,close)>0&&
   high>=Math.max(open,low,close)&&low<=Math.min(open,high,close)&&
   baseVolume>=0&&quoteVolume>=0,"prix ou volumes incohérents");
  if(before!==null){const span=time-before;
   check(span>=DAY&&span%DAY===0,"chronologie ou doublon invalide");
   gaps+=span/DAY-1;}
  before=time;
 }
 check(Number(rows[0][0])===entry.earliest_source_ms&&
  before===entry.latest_source_ms,"bornes natives discordantes");
 check(gaps===entry.gaps_within_observed_span&&
  gaps===payload.calendar_days_without_native_bars,"lacunes non déclarées");
 check(Array.isArray(payload.native_source_response_sha256)&&
  payload.native_source_response_sha256.length>0&&
  payload.native_source_response_sha256.every(v=>HEX.test(v))&&
  payload.source_response_digests_are_exchange_signed===false,
  "preuve de provenance incorrecte");
 return Object.freeze({id:"quack-ai",symbol:"Q",market:"QUSDT",venue:"Bitget Spot",
  quote:"USDT",resolution:"1D",sessionsUtcModuloMs:offset,
  points:rows.length,gaps,firstMs:Number(rows[0][0]),lastMs:before,
  sha256:entry.sha256,live:false,verifiedSourceFormat:true,
  warning:"Validation de structure uniquement : SHA-256 du fichier GZIP à vérifier séparément avant tout usage.",
  rows:rows.slice(-12).map(r=>r.slice())});
}
globalThis.AgentCryptoBitgetDailyValidator=Object.freeze({validate,read_only:true,real_orders:false});
})();
