import { ContextPacket } from "../types"
import { getBrainMemory } from "./brainEngine"

export const consultBrainSync = (toolId: string): ContextPacket => {
 const schema = getBrainMemory()
 return {
  identityAndAspirations: schema.identityAndAspirations,
  contentDNA: schema.contentDNA,
  performanceLedger: schema.performanceLedger,
  futureStateMap: schema.futureStateMap,
  learnedPreferences: "Data extracted from recent interactions.",
  strategicAdvice: schema.strategicAdvice,
 }
}

export const annotateSystemPrompt = (basePrompt: string, packet: ContextPacket): string => {
 return `
${basePrompt}

--- [GLOBAL USER CONTEXT / BRAIN INJECTION] ---
IDENTITY & ASPIRATIONS: ${packet.identityAndAspirations}
CONTENT DNA: ${packet.contentDNA}
PERFORMANCE LEDGER: ${packet.performanceLedger}
FUTURE STATE MAP: ${packet.futureStateMap}
LEARNED PREFERENCES: ${packet.learnedPreferences}
${packet.strategicAdvice ? `STRATEGIC ADVICE: ${packet.strategicAdvice}` : ""}
-----------------------------------------------
`
}
