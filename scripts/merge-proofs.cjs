const fs=require('node:fs'),path=require('node:path');
const {root,assert,sourceHash,save}=require('./transport.cjs');
const {ids,plan}=require('./scenario.cjs');
const dirs=process.argv.slice(2);assert(dirs.length===4,'Pass four run-<ID> artifact directories in chain/cycle/priority/review order');
const suite=[],hashes={},runs=[];
ids.forEach((id,i)=>{
 const dir=path.resolve(dirs[i]),load=n=>JSON.parse(fs.readFileSync(path.join(dir,n+'.json'))),s=load('suite'),j=load('transactions'),v=load('verification-'+id);
 assert(s.length===1&&s[0].id===id&&s[0].source_sha256===sourceHash&&j.source_sha256===sourceHash&&v.source_sha256===sourceHash&&v.live_state_match&&v.transactions.length===5,'Complete final-source artifact');
 const labels=[id+'-deployment',...plan(id,s[0].fixture_revision).map(x=>x.label)];
 assert(Object.keys(j.hashes).length===5,'Exact scenario journal');
 labels.forEach(label=>{assert(!hashes[label]&&j.hashes[label],'Unique receipt');hashes[label]=j.hashes[label];});
 for(const file of [...labels.map(x=>x+'-receipt.json'),id+'-initial-state.json',id+'-final-state.json',id+'-trace.json',id+'-queries.json','verification-'+id+'.json'])fs.copyFileSync(path.join(dir,file),path.join(root,'proofs',file));
 fs.copyFileSync(path.join(dir,'cloud-direct-tests.xml'),path.join(root,'proofs',id+'-direct-tests.xml'));
 const run=path.basename(dir).match(/^run-(\d+)$/)?.[1];assert(run,'Workflow run directory');
 runs.push({scenario:id,workflow_run:run,url:'https://github.com/ehsanisildur-ux/rank-clear/actions/runs/'+run});suite.push(s[0]);
});
save('suite',suite);save('transactions',{source_sha256:sourceHash,hashes});save('provenance',{repository:'ehsanisildur-ux/rank-clear',source_sha256:sourceHash,runs});
console.log('Merged twenty primary receipts; run offline and fresh verification.');
