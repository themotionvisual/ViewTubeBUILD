import crypto from 'node:crypto';

export const LIFECYCLES=['IDEA','CANDIDATE','ACCEPTED','PLANNED','READY','IN_PROGRESS','VERIFYING','DONE','DEFERRED','REJECTED','SUPERSEDED'];
export const HEALTH_FLAGS=['BLOCKED','NEEDS_DEBUGGING','NEEDS_CLARIFICATION','AT_RISK','STALE'];
export const PRIORITIES=['P0','P1','P2','P3','P4'];
export const TASK_KINDS=['FEATURE','INTEGRATION','BUG','OPTIMIZATION','MIGRATION','REFACTOR','CERTIFICATION','DOCUMENTATION','RESEARCH','IDEA','DONOR','CLEANUP','RELEASE'];
export const MATURITY_VALUES=['NONE','PLANNED','PARTIAL','IMPLEMENTED','VERIFIED','NOT_APPLICABLE'];
export const MATURITY_AXES=['architecture','backend','frontend','integration','tests','runtime','responsive','documentation','release'];
export const LEGACY_STATUS={0:'Not Started',1:'Started',2:'Nearly Finished',3:'Finished',4:'Urgent',5:'Needs Clarification',6:'Deferred',7:'Needs Debugging'};

export function extractConstJson(html,constName){
  const marker=`const ${constName}=`,startMarker=html.indexOf(marker);
  if(startMarker<0)throw new Error(`Missing ${marker}`);
  const start=startMarker+marker.length;
  let inString=false,escaped=false,depth=0,started=false;
  for(let i=start;i<html.length;i++){
    const ch=html[i];
    if(inString){if(escaped)escaped=false;else if(ch==='\\')escaped=true;else if(ch==='"')inString=false;continue;}
    if(ch==='"'){inString=true;continue;}
    if(ch==='{'||ch==='['){depth++;started=true;}
    else if(ch==='}'||ch===']'){depth--;if(started&&depth===0)return JSON.parse(html.slice(start,i+1));}
  }
  throw new Error(`Unterminated ${constName}`);
}
export function sha256Text(text){return crypto.createHash('sha256').update(text).digest('hex');}
export function taskNumber(id){const m=/^vt-(\d+)$/.exec(String(id).toLowerCase());return m?Number(m[1]):null;}
export function formatTaskId(n){return `vt-${String(n).padStart(4,'0')}`;}
export function nextTaskId(tasks){return formatTaskId(Math.max(0,...tasks.map(t=>taskNumber(t.id)||0))+1);}
function emptyRelationships(){return{parent:[],children:[],requires:[],blocks:[],relatedTo:[],duplicateOf:[],mergedInto:[],supersedes:[],supersededBy:[],splitFrom:[],implementsCapability:[],verifies:[],discoveredBy:[],derivedFrom:[]};}

export function importLegacyHtml(html,{sourceName='legacy-task-index.html',importedAt='2026-09-27',sourceRole='historical donor / identity source'}={}){
  const roadmap=extractConstJson(html,'ROADMAP'),backend=extractConstJson(html,'AI_BACKEND_REFERENCE'),sourceSha256=sha256Text(html),taskRefs=backend.taskRefs||{};
  const tasks=[],aliases={},modules=[];
  for(let mi=0;mi<roadmap.length;mi++){
    const mod=roadmap[mi],meta={id:mod.moduleId,title:mod.displayTitle||mod.title||mod.moduleId,subtitle:mod.subtitle||'',order:mi};
    modules.push(meta);
    for(let ti=0;ti<(mod.tasks||[]).length;ti++){
      const legacy=mod.tasks[ti],id=String(legacy.id).toLowerCase(),backendRef=taskRefs[id]||null;
      for(const alias of backendRef?.legacyLedgerCodes||[])aliases[alias]=id;
      tasks.push({
        id,title:legacy.text,detail:legacy.detail||null,kind:null,lifecycle:null,health:[],priority:null,
        quickWin:Boolean(legacy.defaultQuickWin),quickWinSource:legacy.defaultQuickWin?'legacy-default':null,
        owner:null,domains:[],masterTools:[],programs:[],capabilities:[],creatorLifecycle:[],
        module:{...meta,taskOrder:ti},maturity:null,acceptance:[],verificationProfile:{required:[],optional:[]},evidenceRefs:[],
        relationships:emptyRelationships(),sourceRefs:[{type:'LEGACY_TASK_INDEX',source:sourceName,sha256:sourceSha256}],
        legacyStatusClaim:{code:legacy.initialStatus,label:LEGACY_STATUS[legacy.initialStatus]||`Unknown ${legacy.initialStatus}`,assessment:'CLAIMED',source:sourceName,importedAt},
        legacyContext:backendRef?{...backendRef}:null,reconciliationRequired:true,
        nextAction:{kind:'RECONCILE',description:'Reconcile this legacy task against current main, governing authorities, active missions/PRs, and evidence before assigning canonical lifecycle.'},
        historyRefs:['HIST-LEGACY-IMPORT-2026-09-27'],createdAt:null,updatedAt:importedAt
      });
    }
  }
  const ids=new Set(tasks.map(t=>t.id));
  return{
    index:{schemaVersion:'viewtube.task-index.v1',authority:'tasks/index/index.json + tasks/index/shards/*.json',generatedAt:importedAt,idNamespace:'vt-',nextTaskId:nextTaskId(tasks),migrationState:'legacy-import-unreconciled',truthRule:'Task identity is canonical. Imported status is historical CLAIMED context only until Task Authority reconciliation establishes canonical lifecycle/evidence.',sourceDonor:{name:sourceName,sha256:sourceSha256,role:sourceRole},modules,tasks},
    aliases:{schemaVersion:'viewtube.task-aliases.v1',generatedAt:importedAt,aliases},
    backendSummary:{purpose:backend.purpose||null,rules:backend.rules||[],sourcePriority:backend.sourcePriority||[],memorySummary:backend.memorySummary||[],artifactIndex:backend.artifactIndex||[],mergeLog:backend.mergeLog||[],legacyAliasSummary:backend.legacyAliasSummary||null,taskRefCount:Object.keys(taskRefs).length,unmatchedBackendRefs:Object.keys(taskRefs).filter(id=>!ids.has(id))}
  };
}
function issue(code,message,extra={}){return{code,message,...extra};}
export function parseJsonl(text){return String(text||'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean).map((line,i)=>{try{return JSON.parse(line)}catch(error){throw new Error(`Invalid JSONL line ${i+1}: ${error.message}`)}});}
export function validateTaskIndex(index,{evidence=[]}={}){
  const issues=[];
  if(index?.schemaVersion!=='viewtube.task-index.v1')issues.push(issue('invalid_schema','schemaVersion must be viewtube.task-index.v1'));
  if(!Array.isArray(index?.tasks))return[...issues,issue('missing_tasks','tasks must be an array')];
  const ids=new Set(),taskById=new Map();
  for(const task of index.tasks){
    if(!/^vt-\d{4,}$/i.test(task.id||''))issues.push(issue('invalid_task_id',`Invalid task id ${task.id}`,{taskId:task.id}));
    if(ids.has(task.id))issues.push(issue('duplicate_task_id',`Duplicate task id ${task.id}`,{taskId:task.id}));
    ids.add(task.id);taskById.set(task.id,task);
    if(!task.title)issues.push(issue('missing_title',`Task ${task.id} requires title`,{taskId:task.id}));
    if(task.lifecycle!==null&&task.lifecycle!==undefined&&!LIFECYCLES.includes(task.lifecycle))issues.push(issue('invalid_lifecycle',`Task ${task.id} has invalid lifecycle ${task.lifecycle}`,{taskId:task.id}));
    if(task.kind!==null&&task.kind!==undefined&&!TASK_KINDS.includes(task.kind))issues.push(issue('invalid_kind',`Task ${task.id} has invalid kind ${task.kind}`,{taskId:task.id}));
    if(task.priority!==null&&task.priority!==undefined&&!PRIORITIES.includes(task.priority))issues.push(issue('invalid_priority',`Task ${task.id} has invalid priority ${task.priority}`,{taskId:task.id}));
    for(const flag of task.health||[])if(!HEALTH_FLAGS.includes(flag))issues.push(issue('invalid_health',`Task ${task.id} has invalid health flag ${flag}`,{taskId:task.id}));
    if(task.maturity)for(const axis of MATURITY_AXES)if(task.maturity[axis]!==undefined&&!MATURITY_VALUES.includes(task.maturity[axis]))issues.push(issue('invalid_maturity',`Task ${task.id} invalid ${axis} maturity`,{taskId:task.id,axis}));
    if(task.lifecycle===null&&!task.reconciliationRequired)issues.push(issue('unreconciled_without_flag',`Task ${task.id} has null lifecycle but is not reconciliationRequired`,{taskId:task.id}));
  }
  const expectedNext=nextTaskId(index.tasks);
  if(index.nextTaskId!==expectedNext)issues.push(issue('invalid_next_task_id',`nextTaskId ${index.nextTaskId} should be ${expectedNext}`));
  const evidenceById=new Map(evidence.map(e=>[e.evidenceId,e]));
  for(const task of index.tasks){
    for(const ref of task.evidenceRefs||[])if(!evidenceById.has(ref))issues.push(issue('missing_evidence_ref',`Task ${task.id} references missing evidence ${ref}`,{taskId:task.id,evidenceId:ref}));
    if(task.lifecycle==='DONE'){
      if(!(task.acceptance||[]).length)issues.push(issue('done_without_acceptance',`Task ${task.id} is DONE without acceptance criteria`,{taskId:task.id}));
      const proven=(task.evidenceRefs||[]).map(id=>evidenceById.get(id)).filter(e=>e?.assessment==='PROVEN');
      if(!proven.length)issues.push(issue('done_without_proven_evidence',`Task ${task.id} is DONE without PROVEN evidence`,{taskId:task.id}));
      for(const gate of task.verificationProfile?.required||[])if(!proven.some(e=>e.gate===gate))issues.push(issue('done_missing_required_gate',`Task ${task.id} DONE missing PROVEN gate ${gate}`,{taskId:task.id,gate}));
    }
    const rel=task.relationships||{};
    for(const key of ['parent','children','requires','blocks','relatedTo','duplicateOf','mergedInto','supersedes','supersededBy','splitFrom','verifies','discoveredBy','derivedFrom'])for(const target of rel[key]||[])if(/^vt-/i.test(target)&&!taskById.has(target))issues.push(issue('missing_relationship_target',`Task ${task.id} ${key} missing ${target}`,{taskId:task.id,target,key}));
  }
  return issues;
}
const TRANSITIONS={null:LIFECYCLES,IDEA:['CANDIDATE','DEFERRED','REJECTED','SUPERSEDED'],CANDIDATE:['ACCEPTED','DEFERRED','REJECTED','SUPERSEDED'],ACCEPTED:['PLANNED','DEFERRED','REJECTED','SUPERSEDED'],PLANNED:['READY','IN_PROGRESS','DEFERRED','SUPERSEDED'],READY:['IN_PROGRESS','DEFERRED','SUPERSEDED'],IN_PROGRESS:['VERIFYING','DEFERRED','SUPERSEDED'],VERIFYING:['DONE','IN_PROGRESS','DEFERRED','SUPERSEDED'],DONE:['IN_PROGRESS','VERIFYING','SUPERSEDED'],DEFERRED:['CANDIDATE','ACCEPTED','PLANNED','READY','IN_PROGRESS','SUPERSEDED'],REJECTED:['CANDIDATE','SUPERSEDED'],SUPERSEDED:[]};
const clone=v=>JSON.parse(JSON.stringify(v));
export function applyTaskMutation({index,evidence=[],history=[]},proposal,{actor='Task Authority',now='2026-09-27T14:00:00Z'}={}){
  if(proposal?.schemaVersion!=='viewtube.task-mutation-proposal.v1')throw new Error('Invalid task mutation proposal schemaVersion');
  const nextIndex=clone(index),nextEvidence=clone(evidence),nextHistory=clone(history);
  let task,created=false;
  if(proposal.taskId){task=nextIndex.tasks.find(t=>t.id===proposal.taskId.toLowerCase());if(!task)throw new Error(`Unknown task ${proposal.taskId}`);}
  else{
    if(!proposal.candidateTitle)throw new Error('New task mutation requires candidateTitle');
    const id=nextTaskId(nextIndex.tasks);
    task={id,title:proposal.candidateTitle,detail:null,kind:'IDEA',lifecycle:'CANDIDATE',health:[],priority:null,quickWin:false,quickWinSource:null,owner:null,domains:[],masterTools:[],programs:[],capabilities:[],creatorLifecycle:[],module:null,maturity:null,acceptance:[],verificationProfile:{required:[],optional:[]},evidenceRefs:[],relationships:emptyRelationships(),sourceRefs:[],legacyStatusClaim:null,legacyContext:null,reconciliationRequired:false,nextAction:{kind:'DEFINE',description:'Define owner, acceptance criteria, and implementation/verification plan.'},historyRefs:[],createdAt:now,updatedAt:now};
    nextIndex.tasks.push(task);created=true;
  }
  const changes=proposal.proposedChanges||{};
  if(changes.lifecycle!==undefined){
    if(!LIFECYCLES.includes(changes.lifecycle))throw new Error(`Invalid lifecycle ${changes.lifecycle}`);
    const from=task.lifecycle===undefined?null:task.lifecycle;
    if(from!==changes.lifecycle&&!(TRANSITIONS[from]||[]).includes(changes.lifecycle))throw new Error(`Invalid lifecycle transition ${from} -> ${changes.lifecycle}`);
  }
  const allowed=['title','detail','kind','lifecycle','health','priority','quickWin','owner','domains','masterTools','programs','capabilities','creatorLifecycle','maturity','acceptance','verificationProfile','relationships','nextAction','reconciliationRequired'];
  for(const key of Object.keys(changes))if(!allowed.includes(key))throw new Error(`Unsupported task field mutation ${key}`);
  Object.assign(task,clone(changes));
  if(changes.lifecycle!==undefined&&task.lifecycle!==null)task.reconciliationRequired=false;
  const addedEvidence=[];
  for(const e of proposal.evidence||[]){
    const evidenceId=e.evidenceId||`EV-${String(nextEvidence.length+1).padStart(6,'0')}`;
    if(nextEvidence.some(x=>x.evidenceId===evidenceId))throw new Error(`Duplicate evidence id ${evidenceId}`);
    const rec={schemaVersion:'viewtube.task-evidence.v1',evidenceId,taskId:task.id,type:e.type||'ARTIFACT',assessment:e.assessment||'CLAIMED',gate:e.gate||null,claim:e.claim||'',ref:e.ref||null,observedAt:e.observedAt||now,source:e.source||actor};
    nextEvidence.push(rec);task.evidenceRefs.push(evidenceId);addedEvidence.push(rec);
  }
  if(task.lifecycle==='DONE'){
    if(!(task.acceptance||[]).length)throw new Error('DONE requires acceptance criteria');
    const allEvidence=task.evidenceRefs.map(id=>nextEvidence.find(e=>e.evidenceId===id)).filter(Boolean),proven=allEvidence.filter(e=>e.assessment==='PROVEN');
    if(!proven.length)throw new Error('DONE requires PROVEN evidence');
    for(const gate of task.verificationProfile?.required||[])if(!proven.some(e=>e.gate===gate))throw new Error(`DONE requires PROVEN verification gate ${gate}`);
  }
  task.updatedAt=now;
  nextIndex.tasks.sort((a,b)=>(taskNumber(a.id)||0)-(taskNumber(b.id)||0));
  nextIndex.nextTaskId=nextTaskId(nextIndex.tasks);
  const historyId=`HIST-${now.replace(/[-:TZ.]/g,'').slice(0,14)}-${task.id.toUpperCase()}`;
  const historyRec={schemaVersion:'viewtube.task-history.v1',historyId,taskId:task.id,at:now,actor,proposalId:proposal.proposalId||null,created,reason:proposal.reason||'',changes:clone(changes),evidenceRefs:addedEvidence.map(e=>e.evidenceId)};
  nextHistory.push(historyRec);task.historyRefs.push(historyId);
  return{index:nextIndex,evidence:nextEvidence,history:nextHistory,task:clone(task),historyRecord:historyRec};
}
