import type {
 SuperToolId,
 WorkflowChain,
 WorkflowStep,
 WorkflowStepStatus,
 SuperToolSurface,
} from "@/types"

const WORKFLOW_STORAGE_KEY = "vt_supertool_workflows_v1"

const canUseStorage = () => typeof window !== "undefined" && typeof localStorage !== "undefined"

const readWorkflows = (): WorkflowChain[] => {
 if (!canUseStorage()) return []
 try {
  const raw = localStorage.getItem(WORKFLOW_STORAGE_KEY)
  const parsed = raw ? JSON.parse(raw) : []
  return Array.isArray(parsed) ? (parsed as WorkflowChain[]) : []
 } catch (error) {
  console.warn("[workflowEngine] Failed to read workflows", error)
  return []
 }
}

const writeWorkflows = (workflows: WorkflowChain[]) => {
 if (!canUseStorage()) return
 localStorage.setItem(WORKFLOW_STORAGE_KEY, JSON.stringify(workflows))
}

export const listWorkflowChains = (): WorkflowChain[] =>
 readWorkflows().sort((a, b) => b.updatedAt - a.updatedAt)

export const createWorkflowStep = (
 title: string,
 ownerSurface: SuperToolSurface,
 toolId?: SuperToolId | null,
 details?: string,
): WorkflowStep => ({
 id: crypto.randomUUID(),
 title,
 ownerSurface,
 toolId: toolId || null,
 details,
 status: "pending",
 artifactIds: [],
})

export const createWorkflowChain = (input: {
 title: string
 goal: string
 projectId?: string | null
 primaryToolId?: SuperToolId | null
 steps: WorkflowStep[]
 provenance?: string[]
}): WorkflowChain => {
 const now = Date.now()
 const chain: WorkflowChain = {
  id: crypto.randomUUID(),
  title: input.title,
  goal: input.goal,
  projectId: input.projectId || null,
  primaryToolId: input.primaryToolId || null,
  status: input.steps.some((step) => step.status === "active") ? "active" : "pending",
  createdAt: now,
  updatedAt: now,
  stepIds: input.steps.map((step) => step.id),
  steps: input.steps,
  artifactIds: [],
  provenance: input.provenance || [],
 }
 writeWorkflows([chain, ...readWorkflows()])
 return chain
}

export const updateWorkflowStep = (
 chainId: string,
 stepId: string,
 status: WorkflowStepStatus,
 details?: string,
): WorkflowChain | null => {
 let updatedChain: WorkflowChain | null = null
 const next = readWorkflows().map((chain) => {
  if (chain.id !== chainId) return chain
  const steps = chain.steps.map((step) =>
   step.id === stepId ? { ...step, status, details: details ?? step.details } : step,
  )
  updatedChain = {
   ...chain,
   steps,
   status:
    steps.some((step) => step.status === "blocked") ? "blocked"
    : steps.every((step) => step.status === "complete") ? "complete"
    : steps.some((step) => step.status === "active") ? "active"
    : "pending",
   updatedAt: Date.now(),
  }
  return updatedChain
 })
 writeWorkflows(next)
 return updatedChain
}

export const attachArtifactToWorkflow = (
 chainId: string,
 artifactId: string,
 provenanceNote?: string,
): WorkflowChain | null => {
 let updatedChain: WorkflowChain | null = null
 const next = readWorkflows().map((chain) => {
  if (chain.id !== chainId) return chain
  updatedChain = {
   ...chain,
   artifactIds: Array.from(new Set([...chain.artifactIds, artifactId])),
   provenance:
    provenanceNote ?
     Array.from(new Set([...chain.provenance, provenanceNote]))
    : chain.provenance,
   updatedAt: Date.now(),
  }
  return updatedChain
 })
 writeWorkflows(next)
 return updatedChain
}
