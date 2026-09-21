import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const source=(path:string)=>readFileSync(resolve(process.cwd(),path),'utf8')

describe('runtime CSS system isolation',()=>{
  it('application bootstrap does not import Toolbox or Dashboard component CSS',()=>{
    const main=source('src/main.tsx')
    expect(main).not.toMatch(/toolbox-system\.css|subtoolbox-system\.css|toolbox-entry\.css|widget-entry\.css|toolboxWidgetSystem\.css/)
  })

  it('DashboardBarrier owns the Widget entry point and no Toolbox entry',()=>{
    const barrier=source('src/views/dashboard/DashboardBarrier.tsx')
    expect(barrier).toContain('import "./widget-entry.css"')
    expect(barrier).not.toMatch(/toolbox-entry\.css|toolbox-system\.css|subtoolbox-system\.css/)
    expect(barrier).toContain('vtw-dashboard')
  })

  it('Widget entry does not import application Toolbox/Subtoolbox styles',()=>{
    const entry=source('src/views/dashboard/widget-entry.css')
    expect(entry).not.toMatch(/styles\/toolbox-entry|styles\/toolbox-system|styles\/subtoolbox-system/)
  })

  it('Toolbox entry does not import Dashboard/Widget styles',()=>{
    const entry=source('src/styles/toolbox-entry.css')
    expect(entry).not.toMatch(/views\/dashboard|widget-entry|toolboxWidgetSystem/)
  })

  it('canonical Toolbox and standalone SubToolbox primitives own the Toolbox entry',()=>{
    expect(source('src/components/Toolbox.tsx')).toContain("../styles/toolbox-entry.css")
    expect(source('src/components/subtoolbox/SubToolboxPrimitives.tsx')).toContain("../../styles/toolbox-entry.css")
    expect(source('src/components/subtoolbox/SubToolboxLayouts.tsx')).toContain("../../styles/toolbox-entry.css")
    expect(source('src/components/subtoolbox/SubToolboxSplitPrimitives.tsx')).toContain("../../styles/toolbox-entry.css")
  })

  it('tracks the remaining index.css Subtoolbox bridge as migration debt',()=>{
    const index=source('src/index.css')
    // Delete this assertion together with the import once all legacy direct
    // consumers are certified. Until then it prevents the bridge from being
    // mistaken for permanent architecture.
    expect(index).toContain('@import "./styles/subtoolbox-system.css"')
  })
})
