import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const base = process.env.PREVIEW_URL || process.env.VERCEL_URL || 'http://localhost:5173';
const share = process.env.VERCEL_SHARE_URL || '';
const root = base.startsWith('http') ? base : `https://${base}`;
const out = 'artifacts/phase5-built-ui';
await fs.mkdir(out, { recursive: true });

const targets = [
  { name: 'storyboard-studio', paths: ['/storyboard-studio', '/studio/storyboard', '/studio?tool=storyboard-studio'] },
  { name: 'video-publisher', paths: ['/video-publisher', '/studio/video-publisher', '/studio?tool=video-publisher'] },
  { name: 'community-posts', paths: ['/community-posts', '/studio/community-posts', '/studio?tool=community-posts'] },
  { name: 'creator-canvas', paths: ['/creator-canvas-os', '/studio/creator-canvas-os', '/data-transparency?internalTool=creator-canvas-os'] },
  { name: 'project-command', paths: ['/project-command-kanban', '/projects', '/data-transparency?internalTool=project-command-kanban'] },
  { name: 'brain', paths: ['/ai-brain', '/brain'] },
];
const viewports=[{label:'desktop',width:1440,height:1000},{label:'mobile',width:390,height:844}];
const browser=await chromium.launch({headless:true});
const manifest=[];
for(const vp of viewports){
 const context=await browser.newContext({viewport:{width:vp.width,height:vp.height}});const page=await context.newPage();
 if(share){try{await page.goto(share,{waitUntil:'networkidle',timeout:45000});await page.waitForTimeout(1200)}catch(e){console.warn('Share authentication navigation failed:',e.message)}}
 for(const target of targets){let captured=false;for(const path of target.paths){const url=new URL(path,root).toString();try{const response=await page.goto(url,{waitUntil:'networkidle',timeout:30000});await page.waitForTimeout(1800);const text=(await page.locator('body').innerText()).slice(0,5000);const auth=/vercel authentication|log in to vercel|continue with github|sso-api/i.test(`${page.url()} ${text}`);const bad=!response||response.status()>=400||auth||/404|not found|page does not exist/i.test(text);if(bad)continue;const file=`${out}/${target.name}-${vp.label}.png`;await page.screenshot({path:file,fullPage:true});manifest.push({target:target.name,viewport:vp.label,path,url:page.url(),file,status:response.status(),authenticated:true});captured=true;break}catch(e){console.warn(target.name,path,e.message)}}if(!captured)manifest.push({target:target.name,viewport:vp.label,error:'No authenticated candidate route rendered successfully.'})}
 await context.close();
}
await browser.close();await fs.writeFile(`${out}/manifest.json`,JSON.stringify(manifest,null,2));console.log(JSON.stringify(manifest,null,2));
if(!manifest.some(x=>x.file))process.exitCode=2;
