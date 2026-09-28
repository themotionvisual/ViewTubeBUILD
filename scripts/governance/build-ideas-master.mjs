import fs from 'node:fs';

const registry=JSON.parse(fs.readFileSync('ideas/registry.json','utf8'));
const masters=(registry.ideas||[]).filter(idea=>idea.lifecycle!=='MERGED');
const sourceItems=registry.sourceItems||[];
const groups=new Map();

for(const idea of masters){
  const cat=idea.category||'Uncategorized';
  const sub=idea.subcategory||'General';
  if(!groups.has(cat)) groups.set(cat,new Map());
  if(!groups.get(cat).has(sub)) groups.get(cat).set(sub,[]);
  groups.get(cat).get(sub).push(idea);
}

const byId=new Map((registry.ideas||[]).map(idea=>[idea.id,idea]));
let out='# ViewTube Master Ideas\n\n';
out+='**Generated from:** `ideas/registry.json`  \n';
out+='**Role:** reviewed consolidated master-idea projection; source lists and merged aliases remain provenance.  \n';
out+=`**Master ideas:** ${masters.length} · **Source items:** ${sourceItems.length} · **Merged aliases:** ${(registry.ideas||[]).filter(i=>i.lifecycle==='MERGED').length}\n\n`;

for(const [cat,subs] of [...groups.entries()].sort(([a],[b])=>a.localeCompare(b))){
  out+=`## ${cat}\n\n`;
  for(const [sub,ideas] of [...subs.entries()].sort(([a],[b])=>a.localeCompare(b))){
    out+=`### ${sub}\n\n`;
    for(const idea of ideas.sort((a,b)=>a.title.localeCompare(b.title))){
      const sourceCount=(idea.sourceItemIds||[]).length;
      out+=`- **${idea.title}** — ${idea.summary}  \n`;
      out+=`  Target: \`${idea.targetType}:${idea.targetId}\` · Status: \`${idea.status}\` · Review: \`${idea.reviewState||'UNREVIEWED'}\` · Source items: ${sourceCount}\n`;

      if(idea.mergedFromIdeaIds?.length){
        const aliases=idea.mergedFromIdeaIds.map(id=>{
          const donor=byId.get(id);
          return donor?`${id} (${donor.title})`:id;
        });
        out+=`  Consolidates: ${aliases.join('; ')}\n`;
      }

      if((idea.requirements||[]).length>1){
        out+='  Retained requirements:\n';
        for(const req of idea.requirements){
          out+=`  - ${req.text} [${(req.sourceItemIds||[]).join(', ')}]\n`;
        }
      }

      if(idea.relationships?.length){
        out+='  Linked ideas:\n';
        for(const rel of idea.relationships){
          const other=byId.get(rel.ideaId);
          out+=`  - ${rel.type}: ${rel.ideaId}${other?` — ${other.title}`:''}\n`;
        }
      }

      if(idea.sourceRefs?.length){
        out+=`  Source refs: ${idea.sourceRefs.join(', ')}\n`;
      }
      out+='\n';
    }
  }
}

fs.writeFileSync('ideas/MASTER_IDEAS.md',out);
