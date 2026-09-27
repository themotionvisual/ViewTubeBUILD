import fs from 'node:fs';
const registry=JSON.parse(fs.readFileSync('ideas/registry.json','utf8'));
const groups=new Map();
for(const idea of registry.ideas||[]){
  const cat=idea.category||'Uncategorized';
  const sub=idea.subcategory||'General';
  if(!groups.has(cat)) groups.set(cat,new Map());
  if(!groups.get(cat).has(sub)) groups.get(cat).set(sub,[]);
  groups.get(cat).get(sub).push(idea);
}
let out='# ViewTube Master Ideas\n\n**Generated from:** `ideas/registry.json`  \n**Role:** consolidated unique idea projection; source lists remain provenance.\n\n';
for(const [cat,subs] of [...groups.entries()].sort(([a],[b])=>a.localeCompare(b))){
  out+=`## ${cat}\n\n`;
  for(const [sub,ideas] of [...subs.entries()].sort(([a],[b])=>a.localeCompare(b))){
    out+=`### ${sub}\n\n`;
    for(const idea of ideas.sort((a,b)=>a.title.localeCompare(b.title))){
      out+=`- **${idea.title}** — ${idea.summary}  \n  Target: \`${idea.targetType}:${idea.targetId}\` · Status: \`${idea.status}\` · Source: ${idea.sourceRefs.join(', ')}\n`;
    }
    out+='\n';
  }
}
fs.writeFileSync('ideas/MASTER_IDEAS.md',out);
