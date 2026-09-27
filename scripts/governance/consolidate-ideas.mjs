import fs from 'node:fs';
import { consolidateIdeas } from './convergence.mjs';

const args=process.argv.slice(2);
const get=(name,fallback=null)=>{
  const i=args.indexOf(name);
  return i>=0?args[i+1]:fallback;
};
const input=get('--input');
const threshold=Number(get('--threshold','0.44'));
if(!input){
  console.error('Usage: node scripts/governance/consolidate-ideas.mjs --input <ideas-json> [--threshold 0.44]');
  process.exit(2);
}
const json=JSON.parse(fs.readFileSync(input,'utf8'));
const ideas=json.ideas||json.items||json;
if(!Array.isArray(ideas)){
  console.error('Input must be an array or contain ideas/items array');
  process.exit(2);
}
const result=consolidateIdeas(ideas,{threshold});
process.stdout.write(JSON.stringify({threshold,...result},null,2)+'\n');
