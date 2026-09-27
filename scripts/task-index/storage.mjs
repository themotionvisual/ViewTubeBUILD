import fs from 'node:fs';
import path from 'node:path';
import {parseJsonl,nextTaskId} from './lib.mjs';

const writeJson=(file,value)=>{fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(value,null,2)+'\n')};
const readJson=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const shardIdForTask=task=>task?.module?.id||'unclassified';

export function writeInitialStore(root,index){
  fs.mkdirSync(path.join(root,'shards'),{recursive:true});
  const groups=new Map();
  for(const task of index.tasks){const id=shardIdForTask(task);if(!groups.has(id))groups.set(id,[]);groups.get(id).push(task);}
  const modules=[],moduleById=new Map((index.modules||[]).map(m=>[m.id,m]));
  for(const [id,tasks] of groups){
    const meta=moduleById.get(id)||{id,title:id==='unclassified'?'UNCLASSIFIED':id,subtitle:'',order:999},shard=`shards/${id}.json`;
    writeJson(path.join(root,shard),{schemaVersion:'viewtube.task-shard.v1',shardId:id,module:meta,tasks});
    modules.push({...meta,shard,taskCount:tasks.length});
  }
  modules.sort((a,b)=>(a.order??999)-(b.order??999)||a.id.localeCompare(b.id));
  const manifest={schemaVersion:'viewtube.task-index-manifest.v1',authority:'tasks/index/index.json + tasks/index/shards/*.json',generatedAt:index.generatedAt,idNamespace:index.idNamespace||'vt-',nextTaskId:index.nextTaskId||nextTaskId(index.tasks),migrationState:index.migrationState,truthRule:index.truthRule,sourceDonor:index.sourceDonor,taskCount:index.tasks.length,modules};
  writeJson(path.join(root,'index.json'),manifest);
  return manifest;
}
export function loadTaskStore(root){
  const manifest=readJson(path.join(root,'index.json')),tasks=[];
  for(const mod of manifest.modules||[]){const shard=readJson(path.join(root,mod.shard));for(const task of shard.tasks||[])tasks.push(task);}
  tasks.sort((a,b)=>Number(a.id.split('-')[1])-Number(b.id.split('-')[1]));
  const index={schemaVersion:'viewtube.task-index.v1',authority:manifest.authority,generatedAt:manifest.generatedAt,idNamespace:manifest.idNamespace,nextTaskId:manifest.nextTaskId,migrationState:manifest.migrationState,truthRule:manifest.truthRule,sourceDonor:manifest.sourceDonor,modules:(manifest.modules||[]).map(({shard,taskCount,...m})=>m),tasks};
  const aliases=fs.existsSync(path.join(root,'aliases.json'))?readJson(path.join(root,'aliases.json')):{schemaVersion:'viewtube.task-aliases.v1',aliases:{}};
  const evidence=parseJsonl(fs.existsSync(path.join(root,'evidence.jsonl'))?fs.readFileSync(path.join(root,'evidence.jsonl'),'utf8'):'');
  const history=parseJsonl(fs.existsSync(path.join(root,'history.jsonl'))?fs.readFileSync(path.join(root,'history.jsonl'),'utf8'):'');
  return{manifest,index,aliases,evidence,history};
}
export function writeMutationStore(root,state,{taskIds=[]}={}){
  const manifest=readJson(path.join(root,'index.json')),taskById=new Map(state.index.tasks.map(t=>[t.id,t]));
  const shardIds=[...new Set(taskIds.map(id=>shardIdForTask(taskById.get(id))).filter(Boolean))],files=[];
  for(const shardId of shardIds){
    const tasks=state.index.tasks.filter(t=>shardIdForTask(t)===shardId);
    let mod=manifest.modules.find(m=>m.id===shardId);
    if(!mod){mod={id:shardId,title:shardId==='unclassified'?'UNCLASSIFIED':shardId,subtitle:'',order:999,shard:`shards/${shardId}.json`,taskCount:0};manifest.modules.push(mod);}
    mod.taskCount=tasks.length;
    const rel=mod.shard||`shards/${shardId}.json`;
    writeJson(path.join(root,rel),{schemaVersion:'viewtube.task-shard.v1',shardId,module:{id:mod.id,title:mod.title,subtitle:mod.subtitle||'',order:mod.order??999},tasks});
    files.push(path.join(root,rel));
  }
  manifest.nextTaskId=state.index.nextTaskId;manifest.taskCount=state.index.tasks.length;
  manifest.modules.sort((a,b)=>(a.order??999)-(b.order??999)||a.id.localeCompare(b.id));
  writeJson(path.join(root,'index.json'),manifest);files.push(path.join(root,'index.json'));
  fs.writeFileSync(path.join(root,'evidence.jsonl'),state.evidence.map(x=>JSON.stringify(x)).join('\n')+(state.evidence.length?'\n':''));files.push(path.join(root,'evidence.jsonl'));
  fs.writeFileSync(path.join(root,'history.jsonl'),state.history.map(x=>JSON.stringify(x)).join('\n')+(state.history.length?'\n':''));files.push(path.join(root,'history.jsonl'));
  return{shards:shardIds,files};
}
