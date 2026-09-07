/*
  Agent-Crypto Administrator — Strategy A Auto/Paper ↔ Lifecycle bridge
  Build: 40.4.297
  Responsibility: synchronize the actual local Paper execution owner with the
  corrected deterministic Lifecycle state machine. Accounting remains owned by
  Paper 40.4.263/40.4.264. No network, no real order, no wallet, no credentials.
*/
(() => {
  "use strict";
  const BUILD="40.4.297";
  const SCHEMA="agent_crypto_strategy_a_auto_lifecycle_bridge_v1";
  const BRIDGED=new Map();
  let blockedReason=null;
  const clone=v=>{try{return JSON.parse(JSON.stringify(v));}catch(_){return null;}};
  const num=(v,f=0)=>Number.isFinite(Number(v))?Number(v):f;
  const lifecycle=()=>globalThis.AgentCryptoStrategyAPaperLifecycle404295||null;
  function apiReady(){const a=lifecycle();return !!(a?.create&&a?.risk_approve&&a?.submit&&a?.acknowledge&&a?.fill&&a?.reconcile&&a?.protect&&a?.close);}
  function preflight(){return {schema:SCHEMA,build:BUILD,ready:apiReady()&&!blockedReason,api_available:apiReady(),blocked_reason:blockedReason,paper_only:true,accounting_owner:"40.4.263/40.4.264",lifecycle_owner:"40.4.295",real_orders:false,network:false};}
  function fail(reason,error=null){blockedReason=String(reason||"LIFECYCLE_BRIDGE_ERROR");return {ok:false,reason:blockedReason,error:error?String(error?.message||error):null,bridge_blocked:true};}
  function onOpen({proposal=null,risk=null,fill=null}={}){
    try{
      if(!apiReady())return fail("LIFECYCLE_API_UNAVAILABLE");
      const executionId=String(fill?.execution_id||"").trim();
      if(!executionId)return fail("EXECUTION_ID_MISSING");
      if(BRIDGED.has(executionId))return {ok:true,duplicate:true,execution_id:executionId,state:clone(BRIDGED.get(executionId))};
      const fillPrice=num(fill?.fill_price_eur),qty=num(fill?.quantity_btc);
      const assetNotional=fillPrice>0&&qty>0?fillPrice*qty:Math.max(0,num(fill?.authorized_notional_eur)-num(fill?.entry_fee_eur));
      if(!(assetNotional>0)&&!(fillPrice>0))return fail("EXECUTION_FACTS_INCOMPLETE");
      const a=lifecycle();
      let env=a.create({decision_id:String(proposal?.proposal_id||risk?.proposal_id||executionId),trade_id:executionId,proposal_id:proposal?.proposal_id||risk?.proposal_id||null,risk_id:risk?.risk_id||fill?.risk_id||null,symbol:fill?.symbol||"BTC",authorized_notional_eur:assetNotional});
      if(env?.state!=="PROPOSAL")return fail("LIFECYCLE_CREATE_REFUSED");
      env=a.risk_approve(env,String(risk?.decision||"ACCEPT"));
      env=a.submit(env); env=a.acknowledge(env); env=a.fill(env,assetNotional,fillPrice);
      if(!["FILLED","PARTIAL"].includes(String(env?.state)))return fail(`LIFECYCLE_OPEN_SYNC_${String(env?.state||"UNKNOWN")}`);
      const row={schema:SCHEMA,build:BUILD,execution_id:executionId,opened_at:new Date().toISOString(),paper_authorized_notional_eur:num(fill?.authorized_notional_eur),asset_notional_eur:assetNotional,entry_fee_eur:num(fill?.entry_fee_eur),fill_price_eur:fillPrice,quantity_btc:qty,envelope:env,status:"OPEN_SYNCED",paper_only:true};
      BRIDGED.set(executionId,row);return {ok:true,execution_id:executionId,state:clone(row)};
    }catch(error){return fail("LIFECYCLE_OPEN_SYNC_EXCEPTION",error);}
  }
  function onClose({reconciliation=null}={}){
    try{
      const executionId=String(reconciliation?.execution_id||"").trim();
      if(!executionId)return fail("RECONCILIATION_EXECUTION_ID_MISSING");
      const row=BRIDGED.get(executionId);if(!row)return fail("LIFECYCLE_OPEN_STATE_MISSING");
      const a=lifecycle();if(!apiReady())return fail("LIFECYCLE_API_UNAVAILABLE");
      let env=row.envelope;
      env=a.reconcile(env,{state:"FILLED",filled_notional_eur:num(env?.filled_notional_eur)});
      if(env?.state!=="RECONCILED")return fail(`LIFECYCLE_RECONCILE_${String(env?.state||"UNKNOWN")}`);
      // Paper-only protection means lifecycle closure was internally reconciled;
      // it is NOT an exchange stop or live market protection claim.
      env=a.protect(env,true); if(env?.state!=="PROTECTED")return fail("LIFECYCLE_PROTECTION_STATE_INVALID");
      env=a.close(env,"ACTUAL_LOCAL_PAPER_RECONCILIATION"); if(env?.state!=="CLOSED")return fail("LIFECYCLE_CLOSE_STATE_INVALID");
      row.closed_at=new Date().toISOString();row.reconciliation_id=reconciliation?.reconciliation_id||null;row.net_pnl_eur=Number.isFinite(Number(reconciliation?.net_pnl_eur))?Number(reconciliation.net_pnl_eur):null;row.envelope=env;row.status="CLOSED_SYNCED";BRIDGED.set(executionId,row);
      return {ok:true,execution_id:executionId,state:clone(row)};
    }catch(error){return fail("LIFECYCLE_CLOSE_SYNC_EXCEPTION",error);}
  }
  function clearBlockForOperatorReview(){blockedReason=null;return preflight();}
  function read(){return [...BRIDGED.values()].map(clone);}
  function summary(){const rows=read();return {schema:SCHEMA,build:BUILD,total:rows.length,open:rows.filter(r=>r.status==="OPEN_SYNCED").length,closed:rows.filter(r=>r.status==="CLOSED_SYNCED").length,blocked_reason:blockedReason,ready:apiReady()&&!blockedReason,paper_only:true,real_orders:false};}
  const api=Object.freeze({build:BUILD,schema:SCHEMA,preflight,on_open:onOpen,on_close:onClose,read,summary,operator_clear_bridge_block:clearBlockForOperatorReview,paper_only:true,real_orders:false,network:false,storage_write:false,accounting_owner_changed:false,lifecycle_shadow_connected:true});
  globalThis.AgentCryptoStrategyAAutoLifecycleBridge404297=api;
})();
