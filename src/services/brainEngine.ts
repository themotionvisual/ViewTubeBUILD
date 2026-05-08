import { BrainSignal, ContextPacket, BrainMemorySchema } from "../types"
import { getAiClient, getActiveModel, executeWithRetry, cleanJsonString } from "./gemini"
import * as db from "./brainPersistence"

let brainCache: BrainMemorySchema | null = null;

const DEFAULT_SCHEMA: BrainMemorySchema = {
 identityAndAspirations: "User is a YouTube creator exploring their niche.",
 contentDNA: "Standard YouTube format, no strong visual style defined yet.",
 performanceLedger: "Awaiting analytics data.",
 futureStateMap: "Focusing on consistent uploads.",
 interactionCount: 0,
 lastReflection: Date.now(),
 tools: []
}

export const getBrainMemory = (): BrainMemorySchema => {
 return brainCache || DEFAULT_SCHEMA;
}

// Initialization call - should be called at app boot
export const initializeBrain = async () => {
 try {
  const saved = await db.getBrainSchemaDB();
  brainCache = saved ? { ...DEFAULT_SCHEMA, ...saved } : DEFAULT_SCHEMA;
 } catch (e) {
  brainCache = DEFAULT_SCHEMA;
 }
}

export const saveBrainMemory = async (schema: BrainMemorySchema) => {
 brainCache = schema;
 await db.saveBrainSchemaDB(schema);
}

export const emitSignal = async (toolId: string, action: string, payload: any) => {
 const schema = { ...getBrainMemory(), tools: [...getBrainMemory().tools] }
 
 if (!schema.tools.includes(toolId)) {
  schema.tools.push(toolId)
 }
 
 schema.interactionCount += 1
 await saveBrainMemory(schema)

 const signal: BrainSignal = {
  id: crypto.randomUUID(),
  toolId,
  action,
  payload,
  timestamp: Date.now()
 }

 await db.addBrainSignalDB(signal);

 const TIME_THRESHOLD = 24 * 60 * 60 * 1000
 if (schema.interactionCount >= 5 || (Date.now() - schema.lastReflection > TIME_THRESHOLD)) {
  // Trigger asynchronously
  setTimeout(() => {
   reflectAndCompress().catch(e => console.error("Reflection background task failed:", e))
  }, 0)
 }
}

export const consultBrain = async (toolId: string, requestDetails?: any): Promise<ContextPacket> => {
 const schema = getBrainMemory()
 
 const packet: ContextPacket = {
  identityAndAspirations: schema.identityAndAspirations,
  contentDNA: schema.contentDNA,
  performanceLedger: schema.performanceLedger,
  futureStateMap: schema.futureStateMap,
  learnedPreferences: "Data extracted from recent interactions.",
  strategicAdvice: schema.strategicAdvice
 }
 
 return packet
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

export const reflectAndCompress = async () => {
 const signals = await db.getBrainSignalsDB();
 if (signals.length === 0) return

 const schema = getBrainMemory()
 
 const prompt = `
  You are the "ViewTube Brain" Central Intelligence Layer.
  Your task is to compress recent tool interactions into the permanent Global User Context.
  
  CURRENT STATE:
  ${JSON.stringify({
   identityAndAspirations: schema.identityAndAspirations,
   contentDNA: schema.contentDNA,
   performanceLedger: schema.performanceLedger,
   futureStateMap: schema.futureStateMap
  }, null, 2)}
  
  RECENT TOOL SIGNALS:
  ${JSON.stringify(signals, null, 2)}
  
  Identify user preference patterns and update the state.
  
  CRITICAL: Look for "Conflict Signals":
  - If user stated goals (Aspirations) clash with current performance (Ledger), suggest a pivot in futureStateMap.
  - If contentDNA is inconsistent across tools, consolidate into a "Primary Style" and "Secondary Style".
  - If tool feedback (THUMBS_DOWN) highlights recurring failures, document them as "Anti-Patterns" in Content DNA.

  Return a new JSON object with ONLY these 5 updated string fields:
  - identityAndAspirations
  - contentDNA
  - performanceLedger
  - futureStateMap
  - strategicAdvice (A 1-sentence "OODA Loop" directive for the user)
  
  Make the summaries dense, strategic, and highly actionable for AI agents.
  Use a "Hard-Sharp" tone: direct, unsentimental, and data-driven.
 `

 try {
  const result = await executeWithRetry(async () => {
   const ai = getAiClient()
   const modelId = getActiveModel("analysis")
   const res = await ai.models.generateContent({
    model: modelId,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
     responseMimeType: "application/json",
    }
   })
   const text = cleanJsonString(res.text || "")
   return JSON.parse(text)
  })

  const newSchema = { 
   ...schema, 
   ...result, 
   interactionCount: 0, 
   lastReflection: Date.now() 
  }
  await saveBrainMemory(newSchema)
  await db.clearBrainSignalsDB();
 } catch (error) {
  console.error("[BrainEngine] Reflection failed:", error)
 }
}
