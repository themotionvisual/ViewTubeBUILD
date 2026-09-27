import fs from 'node:fs';
import { findSimilarRecords } from './convergence.mjs';

const args=process.argv.slice(2);
const get=(name, fallback=null)=>{
  const i=args.indexOf(name);
  return i>=0 ? args[i+1] : fallback;
};
const registryPath=get('--registry');
const id=get('--id');
const threshold=Number(get('--threshold','0.42'));
if(!registryPath || !id){
  console.error('Usage: node scripts/governance/find-similar-records.mjs --registry <json> --id <record-id> [--threshold 0.42]');
  process.exit(2);
}
const json=JSON.parse(fs.readFileSync(registryPath,'utf8'));
const list=json.ideas || json.families || json.records || json.recommendations || json.items || [];
const target=list.find(x=>x.id===id);
if(!target){
  console.error(`Record not found: ${id}`);
  process.exit(2);
}
const hits=findSimilarRecords(target,list.filter(x=>x.id!==id),{threshold});
process.stdout.write(JSON.stringify({targetId:id,threshold,hits:hits.map(x=>({id:x.record.id,title:x.record.title,score:x.score}))},null,2)+'\n');
