import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const ROOT = process.cwd()
const args = process.argv.slice(2)
const taskArg = args.find((arg) => arg.startsWith('--task-index='))
const outArg = args.find((arg) => arg.startsWith('--out='))
const taskIndexPath = taskArg ? path.resolve(taskArg.slice('--task-index='.length)) : null
const outPath = path.resolve(outArg ? outArg.slice('--out='.length) : 'src/data/crownTodayGenerated.ts')
const taskIdPattern = /vt-\d{4,}/gi

const safeGit = (...gitArgs) => {
  try { return execFileSync('git', gitArgs, { cwd: ROOT, encoding: 'utf8' }).trim() }
  catch { return '' }
}

const parseTaskIndex = () => {
  if (!taskIndexPath) return { supplied: false, exists: false, path: null, taskIds: [], statusCounts: {}, note: 'No canonical Task Index path supplied.' }
  if (!fs.existsSync(taskIndexPath)) return { supplied: true, exists: false, path: taskIndexPath, taskIds: [], statusCounts: {}, note: 'Supplied canonical Task Index path is unavailable in this checkout.' }
  const text = fs.readFileSync(taskIndexPath, 'utf8')
  const taskIds = [...new Set(text.match(taskIdPattern) || [])].map((id) => id.toLowerCase()).sort()
  const statuses = ['FINISHED','NEARLY FINISHED','STARTED','URGENT','NEEDS DEBUGGING','DEFERRED','NEEDS CLARIFICATION','UNKNOWN']
  const statusCounts = Object.fromEntries(statuses.map((status) => [status, (text.match(new RegExp(status.replace(' ', '\\s+'), 'gi')) || []).length]))
  return { supplied: true, exists: true, path: taskIndexPath, taskIds, statusCounts, note: 'Read-only lexical projection. The source Task Index remains authoritative; this generator never mutates it.' }
}

const recent = safeGit('log', '-8', '--pretty=format:%H%x09%h%x09%s%x09%aI').split('\n').filter(Boolean).map((line) => {
  const [sha, shortSha, subject, authoredAt] = line.split('\t')
  const prMatch = subject.match(/#(\d+)/)
  return { sha, shortSha, subject, authoredAt, pr: prMatch ? Number(prMatch[1]) : null }
})

const branch = safeGit('branch', '--show-current') || 'unknown'
const headSha = safeGit('rev-parse', 'HEAD') || 'unknown'
const taskIndex = parseTaskIndex()
const payload = {
  schemaVersion: 'viewtube.crown-today-generated.v1',
  generatedAt: new Date().toISOString(),
  readOnly: true,
  code: { branch, headSha, recent },
  taskIndex,
  truthRule: 'Generated evidence is a read-only projection. Git history proves committed code state only; Task Index status remains owned by the canonical Task Index.'
}

const source = `export const CROWN_TODAY_GENERATED = ${JSON.stringify(payload, null, 2)} as const\n`
fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, source)
console.log(JSON.stringify({ outPath: path.relative(ROOT, outPath), headSha, branch, tasks: taskIndex.taskIds.length, recentCommits: recent.length }, null, 2))
