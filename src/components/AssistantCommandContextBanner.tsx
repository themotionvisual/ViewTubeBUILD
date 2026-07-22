import React, { useMemo } from "react"
import { useLocation } from "react-router-dom"
import { getBrainCommandAction } from "../services/superToolActionPackets"
import type { SuperToolId } from "../types"

interface AssistantCommandContextBannerProps {
 targetToolId?: SuperToolId
 compact?: boolean
}

export const useAssistantCommandContext = (targetToolId?: SuperToolId) => {
 const location = useLocation()
 return useMemo(() => {
  const commandActionId = new URLSearchParams(location.search).get("commandActionId")
  const command = getBrainCommandAction(commandActionId)
  if (!command) return null
  if (targetToolId && command.targetToolId !== targetToolId) return null
  return command
 }, [location.search, targetToolId])
}

export const AssistantCommandContextBanner: React.FC<AssistantCommandContextBannerProps> = ({
 targetToolId,
 compact = false,
}) => {
 const command = useAssistantCommandContext(targetToolId)
 if (!command) return null

 return (
  <section className={`rounded-[18px] border-[4px] border-black bg-[#CCFF00] text-black shadow-[6px_6px_0px_0px_black] ${compact ? "p-4" : "p-5"}`}>
   <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
    <div>
     <div className="text-[10px] font-black uppercase tracking-[0.22em] text-black/55">
      Assistant Command Context
     </div>
     <div className="mt-1 text-2xl font-[1000] uppercase tracking-[-0.05em]">
      {command.targetToolId}
     </div>
     <p className="mt-2 text-sm font-bold leading-6 text-black/75">
      {command.assistantRequest || command.note}
     </p>
    </div>
    <div className="flex flex-wrap gap-2">
     <span className="rounded-[9px] border-[3px] border-black bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em]">
      {command.priority}
     </span>
     <span className="rounded-[9px] border-[3px] border-black bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em]">
      {command.confidence}
     </span>
     {command.workflowId ? (
      <span className="rounded-[9px] border-[3px] border-black bg-[#00F0FF] px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em]">
       Flow {command.workflowId.slice(0, 8)}
      </span>
     ) : null}
     {command.generationId ? (
      <span className="rounded-[9px] border-[3px] border-black bg-[#FFEA5A] px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em]">
       Gen {command.generationId.slice(0, 8)}
      </span>
     ) : null}
    </div>
   </div>
   {command.assistantResponse ? (
    <div className="mt-4 rounded-[14px] border-[3px] border-black bg-white p-3 text-xs font-bold leading-5 text-black/70">
     {command.assistantResponse}
    </div>
   ) : null}
  </section>
 )
}
