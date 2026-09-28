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
  return ids;
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
const ideaIds=unique(ideas.ideas,'ideas');
const sourceItemIds=unique(ideas.sourceItems||[],'idea source items');
unique(ideas.mergeRecords||[],'idea merge records');
unique(ideas.relationshipDecisions||[],'idea relationship decisions');

for(const f of plans.families||[]){
  if(!f.survivor) issues.push(`plan family ${f.id}: missing survivor`);
  if(!f.capabilityIds?.length) issues.push(`plan family ${f.id}: missing capabilityIds`);
}
for(const i of ideas.ideas||[]){
  if(!i.category || !i.subcategory) issues.push(`idea ${i.id}: missing category/subcategory`);
  if(!i.targetType || !i.targetId) issues.push(`idea ${i.id}: missing target routing`);
  if(!i.sourceRefs?.length) issues.push(`idea ${i.id}: missing provenance`);

  if(String(ideas.schemaVersion||'').endsWith('.v2')){
    if(!['MASTER','MERGED'].includes(i.lifecycle)) issues.push(`idea ${i.id}: invalid lifecycle ${i.lifecycle}`);
    if(i.lifecycle==='MERGED'){
      if(!i.mergedInto) issues.push(`idea ${i.id}: merged lifecycle without mergedInto`);
      if(i.mergedInto===i.id) issues.push(`idea ${i.id}: self merge`);
      const target=(ideas.ideas||[]).find(x=>x.id===i.mergedInto);
      if(!target) issues.push(`idea ${i.id}: mergedInto missing target ${i.mergedInto}`);
      else if(target.lifecycle!=='MASTER') issues.push(`idea ${i.id}: mergedInto target ${i.mergedInto} is not MASTER`);
    }
    if(i.lifecycle==='MASTER'){
      if(!Array.isArray(i.sourceItemIds) || !i.sourceItemIds.length) issues.push(`idea ${i.id}: master missing sourceItemIds`);
      if(!Array.isArray(i.requirements) || !i.requirements.length) issues.push(`idea ${i.id}: master missing requirements`);
      const reqSourceIds=new Set((i.requirements||[]).flatMap(r=>r.sourceItemIds||[]));
      for(const sourceId of i.sourceItemIds||[]){
        if(!sourceItemIds.has(sourceId)) issues.push(`idea ${i.id}: unknown source item ${sourceId}`);
        if(!reqSourceIds.has(sourceId)) issues.push(`idea ${i.id}: source item ${sourceId} has no retained requirement mapping`);
      }
    }
  }
}

if(String(ideas.schemaVersion||'').endsWith('.v2')){
  const masters=new Set((ideas.ideas||[]).filter(i=>i.lifecycle==='MASTER').map(i=>i.id));
  const sourceLists=new Map((ideas.sourceLists||[]).map(s=>[s.id,s]));

  for(const si of ideas.sourceItems||[]){
    if(!si.sourceListId || !sourceLists.has(si.sourceListId)) issues.push(`source item ${si.id}: unknown sourceListId ${si.sourceListId}`);
    if(!si.sourceRef) issues.push(`source item ${si.id}: missing sourceRef`);
    if(!si.masterIdeaId || !masters.has(si.masterIdeaId)) issues.push(`source item ${si.id}: invalid masterIdeaId ${si.masterIdeaId}`);
    if(!si.requirement) issues.push(`source item ${si.id}: missing requirement`);
  }

  for(const source of ideas.sourceLists||[]){
    const actual=(ideas.sourceItems||[]).filter(si=>si.sourceListId===source.id).length;
    if(actual!==source.itemCount) issues.push(`source list ${source.id}: itemCount=${source.itemCount}, mapped=${actual}`);
  }

  for(const merge of ideas.mergeRecords||[]){
    if(!masters.has(merge.survivorIdeaId)) issues.push(`merge ${merge.id}: invalid survivor ${merge.survivorIdeaId}`);
    for(const donorId of merge.mergedIdeaIds||[]){
      const donor=(ideas.ideas||[]).find(i=>i.id===donorId);
      if(!donor) issues.push(`merge ${merge.id}: missing donor ${donorId}`);
      else if(donor.mergedInto!==merge.survivorIdeaId) issues.push(`merge ${merge.id}: donor ${donorId} does not point to survivor`);
    }
  }

  for(const rel of ideas.relationshipDecisions||[]){
    if(!ideaIds.has(rel.ideaA)||!ideaIds.has(rel.ideaB)) issues.push(`idea relationship ${rel.id}: unknown idea reference`);
    if(rel.ideaA===rel.ideaB) issues.push(`idea relationship ${rel.id}: self relationship`);
  }
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
    ideaRecords:ideas.ideas?.length||0,
    masterIdeas:(ideas.ideas||[]).filter(i=>i.lifecycle!=='MERGED').length,
    mergedIdeaAliases:(ideas.ideas||[]).filter(i=>i.lifecycle==='MERGED').length,
    ideaSourceLists:ideas.sourceLists?.length||0,
    ideaSourceItems:ideas.sourceItems?.length||0,
    ideaMergeRecords:ideas.mergeRecords?.length||0,
  },
};
process.stdout.write(JSON.stringify(summary,null,2)+'\n');
if(issues.length) process.exitCode=1;
