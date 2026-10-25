// Assemble hosted fresh checks only after an independent local offline replay.
const fs=require('node:fs'),path=require('node:path');
const {root,assert,equal,sourceHash,save}=require('./transport.cjs');
const {ids}=require('./scenario.cjs');
const load=name=>JSON.parse(fs.readFileSync(path.join(root,'proofs',name+'.json')));
const offline=load('offline-verification'),provenance=load('provenance');
assert(offline.scope==='all'&&offline.mode==='offline-artifact'&&offline.source_sha256===sourceHash&&offline.transactions.length===20,'Complete independent offline replay required');
const reports=ids.map(id=>load('verification-'+id));
reports.forEach((r,i)=>assert(r.scope===ids[i]&&r.mode==='fresh-rpc-and-state'&&r.source_sha256===sourceHash&&r.live_state_match===true&&r.transactions.length===5&&provenance.runs[i].scenario===ids[i],'Exact successful hosted fresh verification'));
assert(equal(reports.flatMap(r=>r.transactions),offline.transactions)&&equal(reports.flatMap(r=>r.instances),offline.instances),'Offline replay agrees with every hosted transaction and snapshot');
const summary={...offline,mode:'merged-hosted-fresh-rpc-and-state',verified_at:reports.map(r=>r.verified_at).sort().at(-1),merged_at:new Date().toISOString(),live_state_match:true,local_offline_replay_checked:true,verification_origins:reports.map((r,i)=>({scope:r.scope,workflow_url:provenance.runs[i].url,verified_at:r.verified_at})),local_fresh_rpc_note:'The additional local fresh RPC attempt failed with fetch failed before completing. Live source, receipt, full-state and stress-view checks were performed by the four linked hosted workflows at their recorded verification times. The merge is not a new live RPC check.'};
save('verification',summary);
console.log('Combined four hosted fresh reports, independently matched against all twenty offline-replayed receipts.');
