import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const read=(p)=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const issues=[];
const unique=(items,label)=>{
  const ids=new Set();
  for(const item of items||[]){
    if(!item.id){issues.push(`${label}: missing id`);continue;}
    if(ids.has(item.id)) issues.push(`${label}: duplicate id ${item.id}`);
    ids.add(item.id);
  }
};

const plans=read('governance/convergence/plan-families.json');
const ownership=read('governance/convergence/code-ownership.json');
const questions=read('governance/convergence/open-questions.json');
const workflows=read('governance/convergence/workflows.json');
const skills=read('governance/convergence/skill-workflow-map.json');
const improvements=read('governance/convergence/improvements.json');
const coverage=read('governance/convergence/capability-coverage.json');
const ideas=read('ideas/registry.json');

unique(plans.families,'plan families');
unique(ownership.records,'code ownership');
unique(questions.questions,'open questions');
unique(workflows.workflows,'workflows');
unique(improvements.recommendations,'improvements');
unique(ideas.ideas,'ideas');

for(const f of plans.families||[]){
  if(!f.survivor) issues.push(`plan family ${f.id}: missing survivor`);
  if(!f.capabilityIds?.length) issues.push(`plan family ${f.id}: missing capabilityIds`);
}
for(const i of ideas.ideas||[]){
  if(!i.category || !i.subcategory) issues.push(`idea ${i.id}: missing category/subcategory`);
  if(!i.targetType || !i.targetId) issues.push(`idea ${i.id}: missing target routing`);
  if(!i.sourceRefs?.length) issues.push(`idea ${i.id}: missing provenance`);
}
for(const w of workflows.workflows||[]){
  if(!w.skillIds?.length) issues.push(`workflow ${w.id}: missing skillIds`);
}
for(const map of skills.mappings||[]){
  if(!map.workflowId || !map.skillIds?.length) issues.push('skill/workflow map: incomplete mapping');
}

const summary={
  ok:issues.length===0,
  issues,
  counts:{
    planFamilies:plans.families?.length||0,
    codeOwnership:ownership.records?.length||0,
    openQuestions:questions.questions?.length||0,
    workflows:workflows.workflows?.length||0,
    improvements:improvements.recommendations?.length||0,
    capabilities:coverage.capabilities?.length||0,
    ideas:ideas.ideas?.length||0,
  },
};
process.stdout.write(JSON.stringify(summary,null,2)+'\n');
if(issues.length) process.exitCode=1;
