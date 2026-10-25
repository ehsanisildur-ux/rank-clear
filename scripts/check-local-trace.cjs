const fs=require('node:fs');
const {equal,assert}=require('./transport.cjs');
const {validateState,queryPlan,expectedQuery}=require('./scenario.cjs');
const value=JSON.parse(fs.readFileSync(0,'utf8'));
validateState(value.state,value.id,'a'.repeat(40),true);
const plan=queryPlan(value.id);
assert(plan.length===value.queries.length,'Direct VM read grid');
value.queries.forEach((result,i)=>assert(equal(result,expectedQuery(value.id,plan[i])),'Direct VM versus exhaustive JavaScript oracle'));
console.log('Direct VM snapshot and stress views match independent enumerated fixed points.');
