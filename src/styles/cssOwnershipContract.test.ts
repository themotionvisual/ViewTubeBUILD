import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { extname, join, relative, resolve } from 'node:path'

const src=resolve(process.cwd(),'src')
const walk=(dir:string):string[]=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>{const p=join(dir,e.name);return e.isDirectory()?walk(p):[p]})
const css=walk(src).filter(p=>extname(p)==='.css'&&!p.includes('_quarantine'))
const rel=(p:string)=>relative(process.cwd(),p).replaceAll('\\','/')
const widget=(p:string)=>p.includes('/views/dashboard/')
const toolbox=(p:string)=>p.includes('/styles/toolbox')||p.includes('/styles/subtoolbox')

describe('CSS ownership contract',()=>{
 it('keeps new toolbox styles from targeting widget/dashboard namespaces',()=>{
  const violations=css.filter(toolbox).flatMap(p=>{const s=readFileSync(p,'utf8');return /(\.widget-|\.vt-widget|\.dashboard-barrier)/.test(s)?[rel(p)]:[]})
  expect(violations,`Toolbox CSS must not style widget/dashboard selectors: ${violations.join(', ')}`).toEqual([])
 })
 it('keeps new widget styles from targeting toolbox/subtoolbox namespaces',()=>{
  const violations=css.filter(widget).flatMap(p=>{const s=readFileSync(p,'utf8');return /(\.toolbox-|\.subtoolbox-|\.vt-toolbox)/.test(s)?[rel(p)]:[]})
  // Legacy toolboxWidgetSystem.css is the migration monolith; it is the only temporary exception.
  expect(violations.filter(p=>!p.endsWith('/toolboxWidgetSystem.css')),`Widget CSS must not style toolbox selectors: ${violations.join(', ')}`).toEqual([])
 })
 it('prevents new dashboard CSS from importing application toolbox styles',()=>{
  const violations=css.filter(widget).flatMap(p=>{const s=readFileSync(p,'utf8');return /@import\s+["'][^"']*(toolbox-system|subtoolbox-system)\.css/.test(s)?[rel(p)]:[]})
  expect(violations).toEqual([])
 })
 it('documents the one legacy dashboard monolith exception until it is decomposed',()=>{
  const legacy=css.map(rel).filter(p=>p.endsWith('/toolboxWidgetSystem.css'))
  expect(legacy).toHaveLength(1)
 })
})
