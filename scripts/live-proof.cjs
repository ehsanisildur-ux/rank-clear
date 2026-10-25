const fs=require('node:fs'),path=require('node:path');
const {root,assert,equal,sourceHash,invoke,read,rpc,receipt,save}=require('./transport.cjs');
const {ids,args,statement,plan,validateState,queryPlan,expectedQuery}=require('./scenario.cjs');
async function main(){
 const id=process.env.RANK_SCENARIO;assert(ids.includes(id),'Select one complete scenario');
 const accounts=JSON.parse(process.env.RANK_ACCOUNTS||'[]');assert(accounts.length===1,'One disposable CI caller');
 const account=accounts[0];process.env.RANK_ACCOUNT=account.name;
 assert(await rpc('eth_chainId',[])==='0xf22f','StudioNet only');
 const revision=fs.readFileSync(path.join(root,'config/fixture-revision.txt'),'utf8').trim();
 const hash=await invoke(id+'-deployment',['deploy','--contract','contracts/rank_clear.py','--args',...args(id).map(x=>typeof x==='string'?x:JSON.stringify(x))]);
 const deployment=await receipt(id+'-deployment',hash,true);
 const contract=(deployment.to_address||deployment.recipient);assert(/^0x[a-fA-F0-9]{40}$/.test(contract),'Deployed contract address');
 const d={id,network:'studionet',chain_id:61999,contract,deployment:hash,caller:account.address,args:args(id),fixture_revision:revision,source_sha256:sourceHash};
 save('suite',[d]);let before=await read(id+'-initial',['call',contract,'get_state']);validateState(before,id,revision,false);save(id+'-initial-state',before);
 const trace=[];let ingested=false;
 for(const item of plan(id,revision)){
  const h=await invoke(item.label,['write',contract,item.method,'--args',...item.args]);
  await receipt(item.label,h,!item.error);
  const state=await read(item.label+'-state',['call',contract,'get_state']);
  if(item.error)assert(equal(before,state),'Rejected call leaves entire snapshot log unchanged');else ingested=true;
  validateState(state,id,revision,ingested);trace.push({...item,transaction:h,state_before:before,state});save(id+'-trace',trace);before=state;
 }
 save(id+'-final-state',before);
 const queries=[];
 for(const q of queryPlan(id)){
  const out=await read(id+'-stress-'+q.firm+'-'+q.extra,['call',contract,'stress','--args',String(q.snapshot),String(q.firm),String(q.extra)]);
  assert(equal(out,expectedQuery(id,q)),'Live view matches independent exhaustive fixed-point oracle');
  queries.push({...q,result:out});save(id+'-queries',queries);
 }
 save(id+'-queries',queries);
 console.log('PASSED '+id+': five finalized receipts, complete snapshots and '+queries.length+' stress views.');
}
main().catch(e=>{console.error(e.stack);process.exitCode=1;});
