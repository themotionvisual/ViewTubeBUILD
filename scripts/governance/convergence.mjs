const STOP = new Set(['a','an','and','the','to','of','for','in','on','with','by','or','as','at','from','into','is','are','be','this','that','it','all','new','system']);

function tokens(value='') {
  return new Set(String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g,' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .filter(t => !STOP.has(t)));
}

function jaccard(a,b){
  if (!a.size && !b.size) return 1;
  const intersection=[...a].filter(x=>b.has(x)).length;
  const union=new Set([...a,...b]).size;
  return union ? intersection/union : 0;
}

function overlap(a=[],b=[]){
  const A=new Set(a||[]), B=new Set(b||[]);
  return [...A].some(x=>B.has(x));
}

export function similarityScore(a,b){
  const textA=tokens(`${a?.title||''} ${a?.summary||''} ${a?.details||''}`);
  const textB=tokens(`${b?.title||''} ${b?.summary||''} ${b?.details||''}`);
  const text=jaccard(textA,textB);
  const sameCap=overlap(a?.capabilityIds,b?.capabilityIds);
  const sameCategory=Boolean(a?.category && b?.category && String(a.category).toLowerCase()===String(b.category).toLowerCase());
  const sameSub=Boolean(a?.subcategory && b?.subcategory && String(a.subcategory).toLowerCase()===String(b.subcategory).toLowerCase());
  return Math.min(1, text*0.62 + (sameCap?0.25:0) + (sameCategory?0.08:0) + (sameSub?0.05:0));
}

export function findSimilarRecords(target, records, {threshold=0.42}={}){
  return (records||[])
    .map(record=>({record,score:similarityScore(target,record)}))
    .filter(x=>x.score>=threshold)
    .sort((a,b)=>b.score-a.score);
}

export function chooseConvergenceAction({similarity=0,sameCapability=false,sameOwner=false}={}){
  if (sameCapability && sameOwner && similarity>=0.75) return 'MERGE';
  if (sameCapability && sameOwner && similarity>=0.5) return 'EXTEND';
  if (sameCapability && !sameOwner && similarity>=0.5) return 'ADAPT';
  if (!sameCapability && similarity>=0.7) return 'GENERALIZE';
  if (sameCapability && similarity>=0.3) return 'COMBINE';
  return 'CREATE_REVIEW';
}

function uniq(items=[]){ return [...new Set((items||[]).filter(Boolean))]; }

export function consolidateIdeas(ideas, {threshold=0.44}={}){
  const groups=[];
  for (const idea of ideas||[]) {
    let best=null;
    for (const group of groups) {
      const score=similarityScore(idea,group.representative);
      if (score>=threshold && (!best || score>best.score)) best={group,score};
    }
    if (!best) {
      groups.push({
        groupId:`IDEA-GROUP-${String(groups.length+1).padStart(4,'0')}`,
        title:idea.title,
        summary:idea.summary||'',
        category:idea.category||'Uncategorized',
        subcategory:idea.subcategory||'General',
        capabilityIds:uniq(idea.capabilityIds),
        sourceIdeaIds:[idea.id],
        sourceRefs:uniq(idea.sourceRefs),
        ideaCount:1,
        representative:{...idea},
      });
      continue;
    }
    const g=best.group;
    g.capabilityIds=uniq([...g.capabilityIds,...(idea.capabilityIds||[])]);
    g.sourceIdeaIds=uniq([...g.sourceIdeaIds,idea.id]);
    g.sourceRefs=uniq([...g.sourceRefs,...(idea.sourceRefs||[])]);
    g.ideaCount=g.sourceIdeaIds.length;
  }
  return {groups};
}

export function evaluateCapabilityCoverage(capability={}){
  const required=['authority','codeOwners','taskRefs','tests','uiSurfaces','guideRefs','verificationRefs'];
  const missing=required.filter(key=>{
    const v=capability[key];
    if (Array.isArray(v)) return v.length===0;
    return !v;
  });
  return {
    capabilityId:capability.id||null,
    complete:missing.length===0,
    missing,
    covered:required.filter(x=>!missing.includes(x)),
    coverageRatio:(required.length-missing.length)/required.length,
  };
}

export function validateWorkPacket(packet={}){
  const issues=[];
  if (!packet.packetId) issues.push('packetId');
  if (!packet.title) issues.push('title');
  if (!Array.isArray(packet.capabilityIds) || packet.capabilityIds.length===0) issues.push('capabilityIds');
  if (!Array.isArray(packet.existingWorkChecked) || packet.existingWorkChecked.length===0) issues.push('existingWorkChecked');
  if (!packet.convergenceDecision) issues.push('convergenceDecision');
  return issues;
}
