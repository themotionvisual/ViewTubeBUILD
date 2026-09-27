import fs from 'node:fs';
const read=(p)=>JSON.parse(fs.readFileSync(p,'utf8'));
const data={
  generatedAt:new Date().toISOString(),
  capabilities:read('governance/convergence/capability-coverage.json').capabilities||[],
  planFamilies:read('governance/convergence/plan-families.json').families||[],
  ideas:read('ideas/registry.json').ideas||[],
  openQuestions:read('governance/convergence/open-questions.json').questions||[],
  workflows:read('governance/convergence/workflows.json').workflows||[],
  improvements:read('governance/convergence/improvements.json').recommendations||[],
};
const incomplete=data.capabilities.filter(x=>!x.complete);
const control={
  schemaVersion:'viewtube.convergence-control-room.v1',
  generatedAt:data.generatedAt,
  counts:{
    capabilities:data.capabilities.length,
    incompleteCapabilities:incomplete.length,
    planFamilies:data.planFamilies.length,
    ideas:data.ideas.length,
    openQuestions:data.openQuestions.filter(x=>x.status!=='CLOSED').length,
    workflows:data.workflows.length,
    improvements:data.improvements.length,
  },
  highestPriorityCoverageGaps:incomplete.slice(0,10).map(x=>({capabilityId:x.id,missing:x.missing})),
};
fs.writeFileSync('governance/convergence/control-room.json',JSON.stringify(control,null,2)+'\n');
let md='# Convergence Control Room\n\n';
md+=`Generated: ${control.generatedAt}\n\n`;
md+='| Signal | Count |\n|---|---:|\n';
for(const [k,v] of Object.entries(control.counts)) md+=`| ${k} | ${v} |\n`;
md+='\n## Capability coverage gaps\n\n';
for(const x of control.highestPriorityCoverageGaps) md+=`- **${x.capabilityId}** — missing: ${x.missing.join(', ')}\n`;
fs.writeFileSync('docs/generated/CONVERGENCE_CONTROL_ROOM.md',md);
