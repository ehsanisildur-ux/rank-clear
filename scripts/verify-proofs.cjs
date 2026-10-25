const fs=require('node:fs'),path=require('node:path');
const {root,assert,equal,digest,sourceHash,rpc,read,receiptSummary,save}=require('./transport.cjs');
const {decodeReceipt}=require('./receipt-calldata.cjs');
const {ids,args,plan,validateState,queryPlan,expectedQuery}=require('./scenario.cjs');
const load=name=>JSON.parse(fs.readFileSync(path.join(root,'proofs',name+'.json')));
async function main(){
 const offline=process.argv.includes('--offline'),selected=process.env.RANK_SCENARIO||'all',chosen=selected==='all'?ids:[selected];
 assert(chosen.every(x=>ids.includes(x)),'Known verification scope');
 const suite=load('suite'),journal=load('transactions'),revision=fs.readFileSync(path.join(root,'config/fixture-revision.txt'),'utf8').trim();
 const code=fs.readFileSync(path.join(root,'contracts/rank_clear.py'));assert(journal.source_sha256===sourceHash&&suite.length===chosen.length,'Complete source-bound suite');
 if(!offline)assert(await rpc('eth_chainId',[])==='0xf22f','StudioNet only');
 const hashes=new Set(),summary={scope:selected,mode:offline?'offline-artifact':'fresh-rpc-and-state',verified_at:new Date().toISOString(),source_sha256:sourceHash,instances:[],transactions:[]};
 async function verify(label,hash,d,expected,error){
  const saved=load(label+'-receipt'),r=offline?saved:await rpc('eth_getTransactionByHash',[hash]),s=receiptSummary(r),votes=Object.keys(r.consensus_data.votes).length;
  assert(!hashes.has(hash)&&journal.hashes[label]===hash,'Unique journaled transaction');hashes.add(hash);
  assert(s.hash===hash&&s.status==='FINALIZED'&&s.result==='MAJORITY_AGREE'&&s.agree>votes/2&&votes===s.agree+s.disagree+s.idle&&votes===r.consensus_data.validators.length+1,'Full final votes and strict majority');
  assert((r.to_address||r.recipient).toLowerCase()===d.contract.toLowerCase()&&(r.from_address||r.sender).toLowerCase()===d.caller,'Actual signer and contract');
  assert(equal(saved.data,r.data)&&equal(saved.consensus_data.votes,r.consensus_data.votes)&&equal(await decodeReceipt(r),expected),'Decoded actual signed calldata and preserved votes');
  assert(error?s.execution==='ERROR':['SUCCESS','FINISHED_WITH_RETURN'].includes(s.execution),'Exact expected execution result');
  if(label.endsWith('-deployment'))assert(code.equals(Buffer.from(r.data.contract_code,'base64')),'Exact deployment code bytes');
  if(error){const raw=Buffer.from(r.consensus_data.leader_receipt[0].result,'base64');assert(raw[0]===1&&raw.subarray(1).toString('utf8')===error,'Exact expected error bytes');}
  summary.transactions.push({label,...s,recorded_voters:votes,round_count:r.num_of_rounds,rotation_count:r.rotation_count});
 }
 for(let i=0;i<suite.length;i++){
  const d=suite[i],id=chosen[i];assert(d.id===id&&d.network==='studionet'&&d.chain_id===61999&&d.source_sha256===sourceHash&&d.fixture_revision===revision&&equal(d.args,args(id))&&/^0x[0-9a-f]{40}$/.test(d.caller),'Fixed deployment scope');
  await verify(id+'-deployment',d.deployment,d,{args:d.args});
  let before=load(id+'-initial-state');validateState(before,id,revision,false);
  const trace=load(id+'-trace'),items=plan(id,revision);assert(trace.length===items.length,'Complete scenario interaction plan');let ingested=false;
  for(let j=0;j<items.length;j++){
   const item=items[j],t=trace[j];assert(Object.keys(item).every(k=>equal(item[k],t[k]))&&equal(t.state_before,before),'Exact trace and state linkage');
   await verify(item.label,t.transaction,d,{method:item.method,args:item.args},item.error);
   if(item.error)assert(equal(before,t.state),'Full rejection rollback');else ingested=true;
   validateState(t.state,id,revision,ingested);before=t.state;
  }
  assert(equal(before,load(id+'-final-state')),'Final source-bound clearing state');
  const queries=load(id+'-queries'),expected=queryPlan(id);assert(queries.length===expected.length,'Complete read-only stress grid');
  for(let j=0;j<queries.length;j++){
   const q=queries[j],planned=expected[j];assert(Object.keys(planned).every(k=>q[k]===planned[k])&&equal(q.result,expectedQuery(id,planned)),'Exact independent stress envelope');
   if(!offline){const out=await read(id+'-fresh-stress-'+j,['call',d.contract,'stress','--args',String(q.snapshot),String(q.firm),String(q.extra)]);assert(equal(out,q.result),'Fresh stress view');}
  }
  if(!offline){assert(code.equals(Buffer.from(await rpc('gen_getContractCode',[d.contract]),'base64')),'Fresh live source');const state=await read(id+'-fresh-final',['call',d.contract,'get_state']);assert(equal(state,before),'Fresh complete final source, assessment and clearing state');}
  summary.instances.push({id,contract:d.contract,status:before.snapshots[0].result.status,stress_queries:queries.length});
 }
 assert(hashes.size===5*suite.length&&Object.keys(journal.hashes).length===hashes.size&&(selected!=='all'||hashes.size===20),'Exactly the planned primary receipt set');
 summary.transaction_calldata_checked=true;summary.rejection_bytes_checked=true;summary.independent_fixed_point_oracle=true;
 if(!offline){summary.live_state_match=true;save(selected==='all'?'verification':'verification-'+selected,summary);}
 console.log(JSON.stringify(summary,null,2));
}
main().catch(e=>{console.error(e.stack);process.exitCode=1;});
