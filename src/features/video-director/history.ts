import { z } from "zod"
import {
  VideoDirectorProjectSchema,
  type VideoDirectorProject,
} from "./projectSchema"

export const VIDEO_DIRECTOR_HISTORY_KEY = "viewtube_video_director_history_v1"
export const VIDEO_DIRECTOR_HISTORY_LIMIT = 60

export const VideoDirectorCommitSchema = z.object({
  id: z.string().trim().min(1),
  parentId: z.string().trim().min(1).nullable(),
  branchId: z.string().trim().min(1),
  label: z.string().max(500).default("Edit"),
  actor: z.enum(["user", "ai", "recipe", "system"]).default("user"),
  changedPaths: z.array(z.string().trim().min(1)).max(512).default([]),
  createdAt: z.string().datetime(),
  project: VideoDirectorProjectSchema,
}).strict()

export type VideoDirectorCommit = z.infer<typeof VideoDirectorCommitSchema>

const canUseStorage = () =>
  typeof window !== "undefined" && typeof localStorage !== "undefined"

const makeId = (prefix: string) =>
  `${prefix}-${globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(16).slice(2, 8)}`}`

export const readVideoDirectorHistory = (): VideoDirectorCommit[] => {
  if (!canUseStorage()) return []
  try {
    const raw = JSON.parse(localStorage.getItem(VIDEO_DIRECTOR_HISTORY_KEY) || "[]")
    if (!Array.isArray(raw)) return []
    return raw.flatMap((entry) => {
      const parsed = VideoDirectorCommitSchema.safeParse(entry)
      return parsed.success ? [parsed.data] : []
    })
  } catch {
    return []
  }
}

const writeHistory = (history: VideoDirectorCommit[]) => {
  if (!canUseStorage()) return false
  try {
    localStorage.setItem(
      VIDEO_DIRECTOR_HISTORY_KEY,
      JSON.stringify(history.slice(-VIDEO_DIRECTOR_HISTORY_LIMIT)),
    )
    return true
  } catch (error) {
    console.warn("[VideoDirector] could not persist directing history", error)
    return false
  }
}

export const commitVideoDirectorProject = ({
  project,
  label = "Edit",
  actor = "user",
  changedPaths = [],
  branchId,
}: {
  project: VideoDirectorProject
  label?: string
  actor?: VideoDirectorCommit["actor"]
  changedPaths?: string[]
  branchId?: string
}): VideoDirectorCommit => {
  const history = readVideoDirectorHistory()
  const activeBranchId = branchId || history.at(-1)?.branchId || makeId("branch")
  const parent = [...history].reverse().find((entry) => entry.branchId === activeBranchId)

  const commit = VideoDirectorCommitSchema.parse({
    id: makeId("commit"),
    parentId: parent?.id || null,
    branchId: activeBranchId,
    label,
    actor,
    changedPaths,
    createdAt: new Date().toISOString(),
    project: structuredClone(project),
  })

  writeHistory([...history, commit])
  return commit
}

export const branchVideoDirectorHistory = (
  fromCommitId: string,
  label = "Branch",
): VideoDirectorCommit | null => {
  const history = readVideoDirectorHistory()
  const source = history.find((entry) => entry.id === fromCommitId)
  if (!source) return null

  const commit = VideoDirectorCommitSchema.parse({
    ...source,
    id: makeId("commit"),
    parentId: source.id,
    branchId: makeId("branch"),
    label,
    actor: "user",
    createdAt: new Date().toISOString(),
    project: structuredClone(source.project),
  })

  writeHistory([...history, commit])
  return commit
}

export const restoreVideoDirectorCommit = (
  commitId: string,
): VideoDirectorProject | null => {
  const commit = readVideoDirectorHistory().find((entry) => entry.id === commitId)
  return commit ? structuredClone(commit.project) : null
}

export const clearVideoDirectorHistory = (): void => {
  if (!canUseStorage()) return
  localStorage.removeItem(VIDEO_DIRECTOR_HISTORY_KEY)
}
