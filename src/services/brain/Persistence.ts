import type {
  AIBrainConversationTurn,
  BrainGenerationRecord,
  AIBrainLearningEntry,
  BrainMemorySchema,
  BrainOnboardingBootstrapRun,
  BrainQuestionSet,
  BrainSignal,
  ChannelEvidencePacket,
  ChannelKnowledgeModel,
  ToolContextPack,
} from "../../types"

const DB_NAME = "ViewTubeBrainDB"
const DB_VERSION = 4
const STORE_SCHEMA = "brain_schema"
const STORE_SIGNALS = "brain_signals"
const STORE_AI_BRAIN_LEARNING = "ai_brain_learning_entries"
const STORE_AI_BRAIN_CONVERSATION_TURNS = "ai_brain_conversation_turns"
const STORE_BOOTSTRAP_RUNS = "brain_onboarding_bootstrap_runs"
const STORE_EVIDENCE_PACKETS = "brain_channel_evidence_packets"
const STORE_KNOWLEDGE_MODELS = "brain_channel_knowledge_models"
const STORE_QUESTION_SETS = "brain_question_sets"
const STORE_TOOL_CONTEXT_PACKS = "brain_tool_context_packs"
const STORE_GENERATION_RECORDS = "brain_generation_records"

type ChannelScopedRecord = {
  channelId?: string | null
  createdAt?: string
  updatedAt?: string
  startedAt?: string
  completedAt?: string | null
}

const ensureStore = (
  db: IDBDatabase,
  name: string,
  options?: IDBObjectStoreParameters,
) => {
  if (!db.objectStoreNames.contains(name)) {
    db.createObjectStore(name, options)
  }
}

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      ensureStore(db, STORE_SCHEMA)
      ensureStore(db, STORE_SIGNALS, { keyPath: "id" })
      ensureStore(db, STORE_AI_BRAIN_LEARNING, { keyPath: "id" })
      ensureStore(db, STORE_AI_BRAIN_CONVERSATION_TURNS, { keyPath: "id" })
      ensureStore(db, STORE_BOOTSTRAP_RUNS, { keyPath: "id" })
      ensureStore(db, STORE_EVIDENCE_PACKETS, { keyPath: "id" })
      ensureStore(db, STORE_KNOWLEDGE_MODELS, { keyPath: "id" })
      ensureStore(db, STORE_QUESTION_SETS, { keyPath: "id" })
      ensureStore(db, STORE_TOOL_CONTEXT_PACKS, { keyPath: "id" })
      ensureStore(db, STORE_GENERATION_RECORDS, { keyPath: "id" })
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

const putRecord = async <T>(storeName: string, record: T): Promise<void> => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite")
    const store = transaction.objectStore(storeName)
    const request = store.put(record)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

const getAllRecords = async <T>(storeName: string): Promise<T[]> => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readonly")
    const store = transaction.objectStore(storeName)
    const request = store.getAll()
    request.onsuccess = () => resolve(request.result || [])
    request.onerror = () => reject(request.error)
  })
}

const getLatestByChannel = async <T extends ChannelScopedRecord>(
  storeName: string,
  channelId?: string | null,
): Promise<T | null> => {
  const records = await getAllRecords<T>(storeName)
  const channelRecords =
    channelId === undefined
      ? records
      : records.filter((record) => (record.channelId || null) === channelId)

  return (
    channelRecords.sort((a, b) => {
      const aTime = a.completedAt || a.updatedAt || a.createdAt || a.startedAt || ""
      const bTime = b.completedAt || b.updatedAt || b.createdAt || b.startedAt || ""
      return bTime.localeCompare(aTime)
    })[0] || null
  )
}

export const getBrainSchemaDB = async (): Promise<BrainMemorySchema | null> => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_SCHEMA, "readonly")
    const store = transaction.objectStore(STORE_SCHEMA)
    const request = store.get("current")
    request.onsuccess = () => resolve(request.result || null)
    request.onerror = () => reject(request.error)
  })
}

export const saveBrainSchemaDB = async (
  schema: BrainMemorySchema,
): Promise<void> => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_SCHEMA, "readwrite")
    const store = transaction.objectStore(STORE_SCHEMA)
    const request = store.put(schema, "current")
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export const getBrainSignalsDB = async (): Promise<BrainSignal[]> => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_SIGNALS, "readonly")
    const store = transaction.objectStore(STORE_SIGNALS)
    const request = store.getAll()
    request.onsuccess = () => resolve(request.result || [])
    request.onerror = () => reject(request.error)
  })
}

export const addBrainSignalDB = async (signal: BrainSignal): Promise<void> => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_SIGNALS, "readwrite")
    const store = transaction.objectStore(STORE_SIGNALS)
    const request = store.add(signal)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export const clearBrainSignalsDB = async (): Promise<void> => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_SIGNALS, "readwrite")
    const store = transaction.objectStore(STORE_SIGNALS)
    const request = store.clear()
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export const saveAIBrainLearningEntryDB = (
  entry: AIBrainLearningEntry,
): Promise<void> => putRecord(STORE_AI_BRAIN_LEARNING, entry)

export const listAIBrainLearningEntriesDB = async (
  channelId?: string | null,
): Promise<AIBrainLearningEntry[]> => {
  const records = await getAllRecords<AIBrainLearningEntry>(STORE_AI_BRAIN_LEARNING)
  const filtered =
    channelId === undefined
      ? records
      : records.filter((record) => (record.channelId || null) === channelId)

  return filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export const getAIBrainLearningEntryDB = async (
  id: string,
): Promise<AIBrainLearningEntry | null> => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_AI_BRAIN_LEARNING, "readonly")
    const store = transaction.objectStore(STORE_AI_BRAIN_LEARNING)
    const request = store.get(id)
    request.onsuccess = () => resolve(request.result || null)
    request.onerror = () => reject(request.error)
  })
}

export const saveAIBrainConversationTurnDB = (
  turn: AIBrainConversationTurn,
): Promise<void> => putRecord(STORE_AI_BRAIN_CONVERSATION_TURNS, turn)

export const listAIBrainConversationTurnsDB = async (
  channelId?: string | null,
): Promise<AIBrainConversationTurn[]> => {
  const records = await getAllRecords<AIBrainConversationTurn>(STORE_AI_BRAIN_CONVERSATION_TURNS)
  const filtered =
    channelId === undefined
      ? records
      : records.filter((record) => (record.channelId || null) === channelId)

  return filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export const saveBootstrapRunDB = (
  run: BrainOnboardingBootstrapRun,
): Promise<void> => putRecord(STORE_BOOTSTRAP_RUNS, run)

export const getLatestBootstrapRunDB = (
  channelId?: string | null,
): Promise<BrainOnboardingBootstrapRun | null> =>
  getLatestByChannel(STORE_BOOTSTRAP_RUNS, channelId)

export const saveChannelEvidencePacketDB = (
  packet: ChannelEvidencePacket,
): Promise<void> => putRecord(STORE_EVIDENCE_PACKETS, packet)

export const getLatestChannelEvidencePacketDB = (
  channelId?: string | null,
): Promise<ChannelEvidencePacket | null> =>
  getLatestByChannel(STORE_EVIDENCE_PACKETS, channelId)

export const saveChannelKnowledgeModelDB = (
  model: ChannelKnowledgeModel,
): Promise<void> => putRecord(STORE_KNOWLEDGE_MODELS, model)

export const getLatestChannelKnowledgeModelDB = (
  channelId?: string | null,
): Promise<ChannelKnowledgeModel | null> =>
  getLatestByChannel(STORE_KNOWLEDGE_MODELS, channelId)

export const saveBrainQuestionSetDB = (
  questionSet: BrainQuestionSet,
): Promise<void> => putRecord(STORE_QUESTION_SETS, questionSet)

export const getLatestBrainQuestionSetDB = (
  channelId?: string | null,
): Promise<BrainQuestionSet | null> =>
  getLatestByChannel(STORE_QUESTION_SETS, channelId)

export const saveToolContextPackDB = (
  pack: ToolContextPack,
): Promise<void> => putRecord(STORE_TOOL_CONTEXT_PACKS, pack)

export const getLatestToolContextPackDB = (
  channelId?: string | null,
): Promise<ToolContextPack | null> =>
  getLatestByChannel(STORE_TOOL_CONTEXT_PACKS, channelId)

export const saveGenerationRecordDB = (
  record: BrainGenerationRecord,
): Promise<void> => putRecord(STORE_GENERATION_RECORDS, record)

export const getLatestGenerationRecordDB = (
  channelId?: string | null,
): Promise<BrainGenerationRecord | null> =>
  getLatestByChannel(STORE_GENERATION_RECORDS, channelId)
