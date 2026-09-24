import fs from 'fs'; import path from 'path';
const ROOT='src';
const files=[];
(function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);
 if(e.isDirectory())walk(p); else if(/\.(ts|tsx)$/.test(e.name)&&!/\.(test|spec)\.tsx?$/.test(e.name)&&!/__tests__/.test(p))files.push(p);}})(ROOT);
const norm=(f)=>f.replace(/\\/g,'/');
const exists=(p)=>{for(const ext of ['','.ts','.tsx','/index.ts','/index.tsx']){if(fs.existsSync(p+ext)&&fs.statSync(p+ext).isFile())return norm(p+ext);}return null;};
const graph=new Map();
for(const f of files){
 const src=fs.readFileSync(f,'utf8'); const deps=new Set();
 const re=/(?:from\s+|import\s*\(\s*)["']([^"']+)["']/g; let m;
 while((m=re.exec(src))){const s=m[1]; if(!s.startsWith('.'))continue;
  const r=exists(path.join(path.dirname(f),s)); if(r)deps.add(r);}
 graph.set(norm(f),deps);
}
// entry points: main.tsx + App.tsx
const entries=['src/main.tsx','src/App.tsx'].filter(p=>graph.has(p));
const seen=new Set(); const stack=[...entries];
while(stack.length){const c=stack.pop(); if(seen.has(c))continue; seen.add(c);
 for(const d of (graph.get(c)||[]))if(!seen.has(d))stack.push(d);}
const brain=[...graph.keys()].filter(f=>f.startsWith('src/services/brain/'));
const dead=brain.filter(f=>!seen.has(f));
console.log('total modules scanned:',graph.size);
console.log('reachable from main/App:',seen.size);
console.log('\n--- brain modules NOT reachable from app entry ---');
dead.sort().forEach(f=>console.log(' ',f,fs.readFileSync(f,'utf8').split('\n').length+'L'));
console.log('\ndead brain modules:',dead.length,'of',brain.length);
const deadAll=[...graph.keys()].filter(f=>!seen.has(f));
console.log('\ntotal unreachable modules in src:',deadAll.length,'of',graph.size);
if(process.argv.includes('--list'))deadAll.sort().forEach(f=>console.log('  ',f));
