import path from 'node:path';
import {validateTaskIndex} from './lib.mjs';
import {loadTaskStore} from './storage.mjs';

const root=path.resolve(process.argv.find(x=>x.startsWith('--root='))?.slice(7)||'tasks/index');
const store=loadTaskStore(root),issues=validateTaskIndex(store.index,{evidence:store.evidence});
const ids=new Set(store.index.tasks.map(t=>t.id));
for(const [alias,taskId] of Object.entries(store.aliases.aliases||{}))if(!ids.has(taskId))issues.push({code:'alias_missing_task',message:`Alias ${alias} targets missing ${taskId}`,alias,taskId});
const histIds=new Set(store.history.map(h=>h.historyId).filter(Boolean));
for(const task of store.index.tasks)for(const ref of task.historyRefs||[])if(!histIds.has(ref))issues.push({code:'missing_history_ref',message:`Task ${task.id} references missing history ${ref}`,taskId:task.id,historyId:ref});
const manifestCount=(store.manifest.modules||[]).reduce((n,m)=>n+(m.taskCount||0),0);
if(manifestCount!==store.index.tasks.length)issues.push({code:'manifest_count_mismatch',message:`Manifest task counts ${manifestCount} != loaded ${store.index.tasks.length}`});
const result={ok:issues.length===0,taskCount:store.index.tasks.length,shardCount:store.manifest.modules.length,aliasCount:Object.keys(store.aliases.aliases||{}).length,evidenceCount:store.evidence.length,historyCount:store.history.length,nextTaskId:store.index.nextTaskId,unreconciled:store.index.tasks.filter(t=>t.lifecycle===null).length,issues};
console.log(JSON.stringify(result,null,2));
if(!result.ok)process.exitCode=1;
