import React, { Suspense, useMemo } from "react"
import { Navigate, useParams } from "react-router-dom"
import { getSuperToolView } from "../app/superToolViewRegistry"

/**
 * Renders one internal super-tool by id (`/tools/:toolId`).
 *
 * An unknown or editor-bound id falls back to the index rather than a blank
 * screen — the tool list is always a useful answer to "that isn't a tool".
 */
const SuperToolRoute: React.FC = () => {
 const { toolId } = useParams<{ toolId: string }>()
 // Selecting a component, not creating one: SUPER_TOOL_VIEWS is built once at
 // module load, so each id always resolves to the same lazy component and the
 // mounted tool is never torn down by a parent re-render. static-components
 // cannot see that through the lookup, hence the scoped disable at the JSX site.
 const View = useMemo(() => getSuperToolView(toolId || ""), [toolId])

 if (!View) return <Navigate to="/tools" replace />

 return (
  <Suspense
   fallback={
    <div className="mx-auto flex min-h-[60vh] max-w-[1600px] items-center justify-center">
     <div className="rounded-[22px] border-[4px] border-black bg-white px-8 py-6 font-black uppercase tracking-[0.2em] shadow-[8px_8px_0px_0px_black]">
      Loading tool…
     </div>
    </div>
   }>
   {/* eslint-disable-next-line react-hooks/static-components */}
   <View />
  </Suspense>
 )
}

export default SuperToolRoute
