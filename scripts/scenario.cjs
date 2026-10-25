const fs=require('node:fs'),path=require('node:path');
const {root,assert,equal,digest}=require('./transport.cjs');
const ids=['chain','cycle','priority','review'],firms=['amber','bronze','jade'],names=[...firms,'outside'];
const creditors=i=>names.filter(x=>x!==firms[i]);
const priorities=id=>firms.map((_,i)=>id==='priority'?creditors(i):['outside',...firms.filter((_,j)=>i!==j)]);
const orders=id=>priorities(id).map(row=>row.map(x=>names.indexOf(x)));
function statement(id,revision,restated=false){
 assert(ids.includes(id)&&/^[a-f0-9]{40}$/.test(revision),'Fixed scenario and fixture revision');
 const name=id+(restated?'-restated':'');
 const raw=fs.readFileSync(path.join(root,'statements',name+'.json'));
 return {url:'https://raw.githubusercontent.com/ehsanisildur-ux/rank-clear/'+revision+'/statements/'+name+'.json',sha256:digest(raw),source:JSON.parse(raw)};
}
const args=id=>['ehsanisildur-ux/rank-clear',priorities(id)];
function plan(id,revision){
 const a=statement(id,revision),b=statement(id,revision,true);
 return [
  {label:id+'-reject-hash',method:'ingest',args:[a.url,'f'.repeat(64)],error:'[EXTERNAL] Statement commitment mismatch'},
  {label:id+'-ingest',method:'ingest',args:[a.url,a.sha256]},
  {label:id+'-reject-replay',method:'ingest',args:[a.url,a.sha256],error:'[EXPECTED] Statement already recorded'},
  {label:id+'-reject-restated',method:'ingest',args:[b.url,b.sha256],error:'[EXPECTED] Snapshot ID already recorded'}
 ];
}
function numeric(id){
 const a=JSON.parse(fs.readFileSync(path.join(root,'tests',id+'-expected.json')));
 const cash=a.cash.map(x=>x.value),claims=Array.from({length:3},()=>Array(4).fill(0));
 a.claims.forEach((row,i)=>row.forEach((x,j)=>claims[i][names.indexOf(creditors(i)[j])]=x.value));
 return {cash,claims};
}
// Independent equation evaluation: subtract all more-senior NOMINAL claims.
function equation(cash,claims,order,p){
 return claims.map((row,i)=>row.map((claim,j)=>{
  if(i===j)return 0;
  const rank=order[i].indexOf(j);
  const senior=order[i].slice(0,rank).reduce((s,k)=>s+claims[i][k],0);
  const available=cash[i]+p.reduce((s,r)=>s+r[i],0);
  return Math.min(claim,Math.max(0,available-senior));
 }));
}
function fixedPoints(cash,claims,order){
 const cells=[];claims.forEach((row,i)=>row.forEach((v,j)=>{if(v>0)cells.push([i,j,v]);}));
 const p=Array.from({length:3},()=>Array(4).fill(0)),points=[];
 function visit(at){
  if(at===cells.length){if(equal(equation(cash,claims,order,p),p))points.push(p.map(row=>row.slice()));return;}
  const [i,j,max]=cells[at];for(let v=0;v<=max;v++){p[i][j]=v;visit(at+1);}
 }
 visit(0);assert(points.length>0,'At least one enumerated fixed point');return points;
}
function endpoint(cash,claims,order,p,greatest){
 const incoming=firms.map((_,i)=>p.reduce((s,row)=>s+row[i],0)),outgoing=p.map(row=>row.reduce((a,b)=>a+b,0));
 let current=greatest?claims.map(row=>row.slice()):claims.map(row=>row.map(()=>0));const trace=[current];
 for(let n=0;!equal(current,p);n++){
  assert(n<claims.flat().reduce((a,b)=>a+b,0)+1,'Bounded oracle trace');
  current=equation(cash,claims,order,current);trace.push(current);
 }
 assert(equal(equation(cash,claims,order,p),p),'Enumerated endpoint is fixed');
 return {payments:p,incoming,equity:cash.map((x,i)=>x+incoming[i]-outgoing[i]),defaults:outgoing.map((x,i)=>x<claims[i].reduce((a,b)=>a+b,0)),outside_recovery:p.reduce((s,row)=>s+row[3],0),trace};
}
function oracle(id,firm=-1,extra=0){
 const {cash,claims}=numeric(id),order=orders(id);
 if(cash.includes(null)||claims.flat().includes(null)){
  return {status:'REVIEW',unknown:cash.flatMap((x,i)=>x===null?['cash:'+firms[i]]:[]).concat(claims.flatMap((row,i)=>row.flatMap((x,j)=>x===null?[firms[i]+'->'+names[j]]:[])))};
 }
 if(firm>=0)cash[firm]+=extra;
 const points=fixedPoints(cash,claims,order);
 const lower=claims.map((row,i)=>row.map((_,j)=>Math.min(...points.map(p=>p[i][j]))));
 const upper=claims.map((row,i)=>row.map((_,j)=>Math.max(...points.map(p=>p[i][j]))));
 const least=endpoint(cash,claims,order,lower,false),greatest=endpoint(cash,claims,order,upper,true);
 assert(least.equity.every(x=>x>=0)&&greatest.equity.every(x=>x>=0),'Limited liability');
 for(const e of [least,greatest])assert(e.equity.reduce((a,b)=>a+b,0)+e.outside_recovery===cash.reduce((a,b)=>a+b,0),'External cash conservation');
 return {status:points.length===1?'UNIQUE':'MULTIPLE',cash,claims,least,greatest,possible_defaults:least.defaults,definite_defaults:greatest.defaults};
}
function validateState(state,id,revision,ingested){
 const expectedConfig={repository:'ehsanisildur-ux/rank-clear',firms,unit:'clearing-unit',priorities:orders(id)};
 assert(equal(Object.keys(state).sort(),['configuration','snapshots'])&&equal(state.configuration,expectedConfig)&&Array.isArray(state.snapshots),'Exact source and immutable priority config');
 assert(state.snapshots.length===(ingested?1:0),'Exact append count');
 if(!ingested)return;
 const r=state.snapshots[0],s=statement(id,revision),expected=JSON.parse(fs.readFileSync(path.join(root,'tests',id+'-expected.json')));
 assert(equal(Object.keys(r).sort(),['assessment','result','sha256','source','url'])&&r.url===s.url&&r.sha256===s.sha256&&equal(r.source,s.source),'Full fetched source binding');
 const a=r.assessment;assert(equal(Object.keys(a).sort(),['cash','claims'])&&a.cash.length===3&&a.claims.length===3,'Complete assessment');
 a.cash.forEach((cell,i)=>checkCell(cell,expected.cash[i],s.source.firms[i].cash));
 a.claims.forEach((row,i)=>{assert(row.length===3,'Complete creditor row');row.forEach((cell,j)=>checkCell(cell,expected.claims[i][j],s.source.firms[i].claims[j].text));});
 assert(equal(r.result,oracle(id)),'Complete independent enumerated clearing oracle');
}
function checkCell(cell,expected,text){
 assert(equal(Object.keys(cell).sort(),['quote','value'])&&cell.value===expected.value&&typeof cell.quote==='string'&&cell.quote.length>=12&&cell.quote.length<=500&&text.includes(cell.quote),'Exact independent quantity and material source anchor');
}
function queryPlan(id){return id==='review'?[]:firms.flatMap((_,firm)=>[0,1,4,8].map(extra=>({snapshot:0,firm,extra})));}
function expectedQuery(id,q){return {snapshot:id+'-snapshot',firm:firms[q.firm],extra:q.extra,result:oracle(id,q.firm,q.extra)};}
module.exports={ids,firms,priorities,orders,args,statement,plan,numeric,equation,fixedPoints,oracle,validateState,queryPlan,expectedQuery};
