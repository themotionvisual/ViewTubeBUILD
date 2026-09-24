export type CreatorCommandTask = {
  id?: string
  text: string
  completed?: boolean
}

export const describeCreatorTasks = (tasks: readonly CreatorCommandTask[]) => {
  const normalized = tasks.filter((task) => task && typeof task.text === "string" && task.text.trim())
  const done = normalized.filter((task) => Boolean(task.completed)).length
  const focus = normalized.find((task) => !task.completed) || null

  return {
    total: normalized.length,
    done,
    open: Math.max(0, normalized.length - done),
    focus,
  }
}

export const formatFocusTime = (seconds: number) => {
  const safe = Math.max(0, Math.floor(Number.isFinite(seconds) ? seconds : 0))
  const minutes = Math.floor(safe / 60).toString().padStart(2, "0")
  const remainder = (safe % 60).toString().padStart(2, "0")
  return `${minutes}:${remainder}`
}
