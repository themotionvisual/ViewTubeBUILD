import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { extname, join, relative, resolve } from 'node:path'

const ROOT=resolve(process.cwd(),'src')
const OUT=resolve(process.cwd(),'docs/architecture')
const QUARANTINE_SEGMENT=['_','quarantine'].join('')
const walk=(dir)=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>{const p=join(dir,e.name);return e.isDirectory()?walk(p):[p]})
const files=walk(ROOT).filter(p=>extname(p)==='.css'&&!p.includes('/node_modules/')&&!p.split(/[\\/]/).includes(QUARANTINE_SEGMENT))
const norm=p=>relative(process.cwd(),p).replaceAll('\\','/')
const owner=p=>p.includes('/views/dashboard/')?'WIDGET':p.includes('/remotion-editor/')||p.includes('/editor/')?'EDITOR':p.includes('/styles/toolbox')||p.includes('/components/Toolbox')?'TOOLBOX':p.includes('/styles/subtoolbox')||p.includes('/components/subtoolbox')?'TOOLBOX':p.endsWith('/index.css')?'FOUNDATION':p.includes('/views/')||p.includes('/features/')?'PAGE':'FOUNDATION'
const selectorRoots=s=>[...s.matchAll(/(?:^|\})\s*([^@}{][^{]+)\{/gm)].flatMap(m=>m[1].split(',')).map(x=>x.trim().split(/[\s>+~:.#\[]/).filter(Boolean)[0]).filter(Boolean)
const imports=s=>[...s.matchAll(/@import\s+["']([^"']+)["']/g)].map(m=>m[1])
const variables=(s,mode)=>[...s.matchAll(mode==='defined'?/(--[\w-]+)\s*:/g:/var\((--[\w-]+)/g)].map(m=>m[1])
const cross=(o,s)=>{const hits=[];if(o==='WIDGET'&&/(\.toolbox-|\.subtoolbox-|\.vt-toolbox)/.test(s))hits.push('widget->toolbox selector');if(o==='TOOLBOX'&&/(\.widget-|\.vt-widget|\.dashboard-barrier)/.test(s))hits.push('toolbox->widget selector');if(o==='FOUNDATION'&&/(\.widget-|\.vt-widget|\.toolbox-|\.subtoolbox-)/.test(s))hits.push('foundation owns component selector');return hits}
const report=files.map(p=>{const s=readFileSync(p,'utf8'),o=owner(norm(p));return{path:norm(p),owner:o,bytes:Buffer.byteLength(s),lines:s.split('\n').length,imports:imports(s),important:(s.match(/!important/g)||[]).length,media:(s.match(/@media/g)||[]).length,containers:(s.match(/@container/g)||[]).length,selectorRoots:[...new Set(selectorRoots(s))].sort(),variablesDefined:[...new Set(variables(s,'defined'))].sort(),variablesConsumed:[...new Set(variables(s,'used'))].sort(),violations:cross(o,s)}})
const summary={generatedAt:new Date().toISOString(),cssFiles:report.length,bytes:report.reduce((n,x)=>n+x.bytes,0),lines:report.reduce((n,x)=>n+x.lines,0),important:report.reduce((n,x)=>n+x.important,0),owners:Object.fromEntries(['FOUNDATION','TOOLBOX','PAGE','WIDGET','EDITOR'].map(o=>[o,report.filter(x=>x.owner===o).length])),violations:report.flatMap(x=>x.violations.map(v=>({path:x.path,owner:x.owner,violation:v})))}
mkdirSync(OUT,{recursive:true});writeFileSync(join(OUT,'css-network.json'),JSON.stringify({summary,files:report},null,2))
const md=['# ViewTube CSS Network Audit','',`Generated: ${summary.generatedAt}`,'',`CSS files: ${summary.cssFiles}  `,`Lines: ${summary.lines}  `,`Bytes: ${summary.bytes}  `,`!important: ${summary.important}`,'','## Ownership',...Object.entries(summary.owners).map(([k,v])=>`- ${k}: ${v}`),'','## Cross-system violations',...(summary.violations.length?summary.violations.map(v=>`- \`${v.path}\`: ${v.violation}`):['- None detected by namespace rules.']),'','## Files','',...report.map(x=>`- **${x.owner}** \`${x.path}\` — ${x.lines} lines, ${x.important} !important, ${x.media} media, ${x.containers} container${x.violations.length?` — **${x.violations.join(', ')}**`:''}`)]
writeFileSync(join(OUT,'css-network.md'),md.join('\n'))
console.log(JSON.stringify(summary,null,2))
