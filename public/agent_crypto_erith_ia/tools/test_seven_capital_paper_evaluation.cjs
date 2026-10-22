'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),
 crypto=require('node:crypto');
const paper=require('./seven_capital_paper_evaluation.cjs');
const ledger=require('./seven_capital_spot_journal.cjs');
const utc='2026-10-22';
const base='2026-10-22T01:07:49.671Z';
const b0='2026-10-22T01:07:50.051Z',b1='2026-10-22T05:07:50.051Z';
const stamp1='2026-10-22T05:07:49.671Z';
const stamp2='2026-10-22T09:07:49.671Z';
const c={id:utc,date_utc:utc,first_seen_at_utc:base,
 source_times_utc:['2026-10-22T00:39:45.009Z','2026-10-22T00:40:43.689Z'],
 selected:[{coin_id:'aethir',symbol:'ATH',source_at_utc:'2026-10-22T00:39:45.009Z'},
 {coin_id:'collector-crypt',symbol:'CARDS',source_at_utc:'2026-10-22T00:39:45.009Z'}]};
const entry=(symbol,status='PUBLIC_BOOK_AND_SIZE_PAPER_SCREEN_PASSED')=>({
 coin_id:symbol==='ATH'?'aethir':'collector-crypt',symbol,
 pair:symbol+'-USDC',quote:'USDC',
 status,public_book_at_utc:b0,
 bid_usdc:'0.9',ask_usdc:'1.0',bid_qty_base:'50',ask_qty_base:'50',
 min_size:'1',lot_step:'0.01',tick_step:'0.1',
 hypothetical_buy_qty_base:'10',hypothetical_sellable_base:'9.99',
 assumed_buy_fee_pct:0.1,assumed_sell_fee_pct:0.1,
 exact_contract_identity_proven:false,account_fee_currency_verified:false,
 market_fill_proven:false
});
const future=(bid='1.1',qty='100',date=b1)=>({
 ...entry('ATH'),public_book_at_utc:date,bid_usdc:bid,ask_usdc:'1.2',
 bid_qty_base:qty,ask_qty_base:'100',status:'PUBLIC_BOOK_AND_SIZE_PAPER_SCREEN_PASSED'
});
function archive(root,market,at,kind,seq){
 const date=at.replace(/[:.]/g,'');
 const f='observations/'+date+'--'+utc+'.json';
 const doc={schema:ledger.ENTRY,cohort_id:utc,recorded_at_utc:at,kind,
  venue:'OKX',instrument_type:'SPOT',quote:'USDC',budget_usdc:10,
  markets:market,orders_enabled:false,real_orders:0,paper_fills:0,
  net_profit_usdc:null,position_opened:false,position_closed:false};
 const b=JSON.stringify(doc,null,2)+'\n';
 fs.mkdirSync(path.join(root,'observations'),{recursive:true});
 fs.writeFileSync(path.join(root,f),b,{flag:'wx'});
 seq.push({cohort_id:utc,file:f,
  sha256:crypto.createHash('sha256').update(b).digest('hex'),
  recorded_at_utc:at,kind});
 return f;
}
function fixture(more=[]){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'seven-paper-'));
 const index=ledger.empty();index.cohorts.push(c);
 archive(root,[entry('ATH'),entry('CARDS','TOP_ASK_DEPTH_INSUFFICIENT')],
   base,'FIRST_PUBLIC_SCREEN',index.records);
 for(const x of more)archive(root,[x,entry('CARDS','TOP_ASK_DEPTH_INSUFFICIENT')],
   x===more[0]?stamp1:stamp2,'LATER_PUBLIC_BID',index.records);
 fs.writeFileSync(path.join(root,'index.json'),JSON.stringify(index,null,2)+'\n');
 return {root,index};
}
test('main public archive, if present: awaiting bid ATH, entry refusal CARDS, zero fills',()=>{
 const root=path.resolve(__dirname,'../data/trader_flux/seven_capital_spot');
 if(!fs.existsSync(path.join(root,'index.json')))return;
 const r=paper.evaluate(root);assert.equal(r.orders_enabled,false);
 assert.equal(r.paper_fills,0);assert.equal(r.paper_realized_profit_usdc,null);
 assert.equal(r.budget_per_alternative_usdc,10);
 const all=r.cohorts.flatMap(x=>x.candidates);
 if(r.cohorts.some(x=>x.cohort_id==='2026-10-22'&&x.observations===1)){
  assert.equal(all.find(x=>x.coin_id==='aethir')?.status,'AWAITING_FUTURE_BOOK');
  assert.equal(all.find(x=>x.coin_id==='collector-crypt')?.status,'ENTRY_REJECTED');
 }
});
test('subsequent BID produces conditional PnL, never a completed trade',()=>{
 const {root}=fixture([future()]);
 try{
  const r=paper.run(root);
  const a=r.cohorts[0].candidates.find(x=>x.symbol==='ATH');
  const blocked=r.cohorts[0].candidates.find(x=>x.symbol==='CARDS');
  assert.equal(a.status,'LATEST_BID_EVALUABLE');
  assert.equal(a.entry_gross_qty_base,'10');
  assert.equal(a.entry_net_sellable_base,'9.99');
  assert.equal(a.hypothetical_exit_net_usdc,'10.978011');
  assert.equal(a.hypothetical_pnl_usdc,'0.978011');
  assert.equal(a.hypothetical_final_budget_usdc,'10.978011');
  assert.equal(a.real_profit_usdc,null);
  assert.equal(a.paper_fills,0);
  assert.equal(a.position_opened,false);
  assert.equal(a.position_closed,false);
  assert.equal(blocked.status,'ENTRY_REJECTED');
  assert.equal(blocked.hypothetical_pnl_usdc,null);
  assert.equal(r.counts.exit_evaluable,1);
  assert.equal(r.counts.entry_rejected,1);
  assert.equal(r.cohorts[0].not_a_combined_30_usdc_portfolio,true);
  const serialized=fs.readFileSync(path.join(root,'paper_evaluation.json'),'utf8');
  paper.run(root);
  assert.equal(fs.readFileSync(path.join(root,'paper_evaluation.json'),'utf8'),serialized);
 }finally{fs.rmSync(root,{recursive:true,force:true})}
});
test('future bid too shallow never produces net PnL',()=>{
 const {root}=fixture([future('1.1','5')]);
 try{
  const a=paper.evaluate(root).cohorts[0].candidates[0];
  assert.equal(a.status,'EXIT_NOT_EVALUABLE');
  assert.equal(a.hypothetical_pnl_usdc,null);
 }finally{fs.rmSync(root,{recursive:true,force:true})}
});
test('future bid older than entry book is rejected',()=>{
 const {root}=fixture([future('1.1','100',b0)]);
 try{
  const a=paper.evaluate(root).cohorts[0].candidates[0];
  assert.equal(a.status,'EXIT_NOT_EVALUABLE');
  assert.equal(a.hypothetical_pnl_usdc,null);
 }finally{fs.rmSync(root,{recursive:true,force:true})}
});
test('last observation must be evaluated; cannot cherry-pick earlier gain',()=>{
 const {root}=fixture([future(),future('0.8','100','2026-10-22T09:07:50.051Z')]);
 try{
  const a=paper.evaluate(root).cohorts[0].candidates[0];
  assert.equal(a.status,'LATEST_BID_EVALUABLE');
  assert.equal(a.latest_bid_usdc,'0.8');
  assert.equal(a.hypothetical_pnl_usdc,'-2.015992');
 }finally{fs.rmSync(root,{recursive:true,force:true})}
});
test('old archive changed without matching SHA must fail closed',()=>{
 const {root,index}=fixture();
 try{
  const f=path.join(root,index.records[0].file);
  fs.appendFileSync(f,'\n');
  assert.throws(()=>paper.evaluate(root),/modifiée/);
 }finally{fs.rmSync(root,{recursive:true,force:true})}
});
test('first observation without second only marks research waiting',()=>{
 const {root}=fixture();
 try{
  const a=paper.evaluate(root).cohorts[0].candidates[0];
  assert.equal(a.status,'AWAITING_FUTURE_BOOK');
  assert.equal(a.hypothetical_pnl_usdc,null);
 }finally{fs.rmSync(root,{recursive:true,force:true})}
});

test('fixed 4/24/48h horizon starts from first observation, with waiting and rejection',()=>{
 const {root}=fixture([future()]);
 try{
  const report=paper.evaluate(root),cohort=report.cohorts[0];
  assert.deepEqual(report.horizon_hours,[4,24,48]);
  assert.equal(cohort.horizons.length,3);
  const four=cohort.horizons[0];
  assert.equal(four.hours,4);
  assert.equal(four.no_hindsight_selection,true);
  assert.equal(four.selection,'FIRST_ARCHIVED_RECORD_AT_OR_AFTER_TARGET');
  assert.equal(four.candidates[0].status,'LATEST_BID_EVALUABLE');
  assert.equal(four.candidates[0].hypothetical_pnl_usdc,'0.978011');
  assert.equal(four.candidates[1].status,'ENTRY_REJECTED');
  for(const h of cohort.horizons.slice(1)){
   assert.equal(h.candidates[0].status,'AWAITING_HORIZON');
   assert.equal(h.candidates[0].hypothetical_pnl_usdc,null);
   assert.equal(h.candidates[1].status,'ENTRY_REJECTED');
  }
 }finally{fs.rmSync(root,{recursive:true,force:true})}
});
test('horizons never report a future price from the initial snapshot',()=>{
 const {root}=fixture();
 try{
  const h=paper.evaluate(root).cohorts[0].horizons;
  assert.deepEqual(h.map(x=>x.candidates[0].status),
   ['AWAITING_HORIZON','AWAITING_HORIZON','AWAITING_HORIZON']);
  assert(h.every(x=>x.candidates[0].hypothetical_pnl_usdc===null));
 }finally{fs.rmSync(root,{recursive:true,force:true})}
});
