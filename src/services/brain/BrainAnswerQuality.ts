import type { BrainAnswerEvaluation, CreatorBrainResponse } from "../../types"
import {
 buildCreatorBrainLocalFallback,
 formatCreatorBrainResponse,
} from "../aiBrainCommandInterface"
import { validateBrainResponse } from "./BrainOrchestrator"
import {
 CREATOR_QUESTION_SUITE,
 GOLDEN_CHANNEL_SPECS,
 buildGoldenChannelFixture,
 goldenSpecById,
 type BrainGoldenChannelFixture,
 type BrainGoldenScenario,
} from "./fixtures"

/**
 * The golden answer-quality gate.
 *
 * It runs the canonical question suite against the synthetic fixtures, generates an
 * answer for each, and checks the guarantees that separate a useful answer from a
 * generic one: correct intent, real channel evidence used, no other-niche leakage,
 * no invented numbers, honest handling of missing data, question discipline, and no
 * two different channels receiving the same answer. Scores come from the existing
 * `validateBrainResponse`; this layer adds the structural, cross-answer checks.
 *
 * Generation is injectable so a structured-model path can be graded with the same
 * rig, but the default path is deterministic and needs no network or API key.
 */
export type BrainGoldenGenerator = (input: {
 scenario: BrainGoldenScenario
 fixture: BrainGoldenChannelFixture
}) => CreatorBrainResponse

export interface BrainGoldenScenarioResult {
 scenarioId: string
 fixtureId: string
 question: string
 expectedIntent: CreatorBrainResponse["mode"]
 actualIntent: CreatorBrainResponse["mode"]
 evaluation: BrainAnswerEvaluation
 evidenceTokensUsed: string[]
 forbiddenTokensLeaked: string[]
 unsupportedNumbers: string[]
 crossChannelDuplicateOf: string | null
 failures: string[]
 passed: boolean
}

export interface BrainGoldenSuiteReport {
 generatedAt: string
 total: number
 passed: number
 failed: number
 passRate: number
 /** Distinct-answer health: different questions on one channel that collapsed to the same text. */
 sameChannelDuplicates: number
 results: BrainGoldenScenarioResult[]
}

const answerText = (response: CreatorBrainResponse): string =>
 [
  response.headline,
  response.keyInsight,
  response.body,
  ...(response.modules || []).flatMap((module) => [module.title, module.body]),
  ...response.actions,
 ]
  .join(" ")
  .toLowerCase()

const answerFingerprint = (response: CreatorBrainResponse): string =>
 `${response.keyInsight} ${(response.modules || []).map((module) => module.body).join(" ")}`
  .replace(/\s+/g, " ")
  .trim()
  .toLowerCase()

const namesMissingEvidence = (text: string): boolean =>
 /\b(connect|sync|sign in|import|don'?t have|do not have|need|missing|once i|tell me)\b/.test(text)

/** The deterministic, no-model path: the same fallback a signed-out creator sees. */
export const deterministicBrainGenerator: BrainGoldenGenerator = ({ scenario, fixture }) =>
 formatCreatorBrainResponse(
  buildCreatorBrainLocalFallback(scenario.question, fixture.snapshot),
  fixture.snapshot,
  { requestText: scenario.question },
 )

const evaluateScenario = (
 scenario: BrainGoldenScenario,
 fixture: BrainGoldenChannelFixture,
 response: CreatorBrainResponse,
 crossChannelDuplicateOf: string | null,
): BrainGoldenScenarioResult => {
 const text = answerText(response)
 const evaluation = validateBrainResponse({
  response,
  snapshot: fixture.snapshot,
  growthContext: fixture.growthContext,
 })
 const isEmptyChannel = fixture.snapshot.evidencePack.dataStatus === "missing"
 const evidenceTokensUsed = fixture.expectedEvidenceTokens.filter((token) =>
  text.includes(token.toLowerCase()),
 )
 const forbiddenTokensLeaked = fixture.forbiddenEvidenceTokens.filter((token) =>
  text.includes(token.toLowerCase()),
 )

 const failures: string[] = []
 if (response.mode !== scenario.expectedIntent) {
  failures.push(`Wrong intent: expected ${scenario.expectedIntent}, got ${response.mode}.`)
 }
 if (!isEmptyChannel && fixture.expectedEvidenceTokens.length && evidenceTokensUsed.length === 0) {
  failures.push("Generic answer: uses none of this channel's evidence.")
 }
 if (isEmptyChannel && !namesMissingEvidence(text)) {
  failures.push("Empty channel answer does not name the missing evidence.")
 }
 if (forbiddenTokensLeaked.length) {
  failures.push(`Leaked another niche's language: ${forbiddenTokensLeaked.join(", ")}.`)
 }
 if (evaluation.unsupportedNumbers.length) {
  failures.push(`Contains unsupported numbers: ${evaluation.unsupportedNumbers.join(", ")}.`)
 }
 if (response.questions.length > 1) {
  failures.push("More than one follow-up question.")
 }
 if (response.questions.length === 1 && !scenario.mayAskQuestion) {
  failures.push("Asked a follow-up question where one is not warranted.")
 }
 if (crossChannelDuplicateOf) {
  failures.push(`Identical answer to a different channel (${crossChannelDuplicateOf}).`)
 }

 return {
  scenarioId: scenario.id,
  fixtureId: scenario.fixtureId,
  question: scenario.question,
  expectedIntent: scenario.expectedIntent,
  actualIntent: response.mode,
  evaluation,
  evidenceTokensUsed,
  forbiddenTokensLeaked,
  unsupportedNumbers: evaluation.unsupportedNumbers,
  crossChannelDuplicateOf,
  failures,
  passed: failures.length === 0,
 }
}

export const runBrainGoldenSuite = (
 options: { generate?: BrainGoldenGenerator; scenarios?: BrainGoldenScenario[] } = {},
): BrainGoldenSuiteReport => {
 const generate = options.generate || deterministicBrainGenerator
 const scenarios = options.scenarios || CREATOR_QUESTION_SUITE
 const fixtures = new Map(GOLDEN_CHANNEL_SPECS.map((spec) => [spec.id, buildGoldenChannelFixture(spec)]))

 const generated = scenarios.map((scenario) => {
  const spec = goldenSpecById(scenario.fixtureId)
  const fixture = (spec && fixtures.get(spec.id)) || buildGoldenChannelFixture(goldenSpecById(scenario.fixtureId)!)
  return { scenario, fixture, response: generate({ scenario, fixture }) }
 })

 // Fingerprint -> first scenario that produced it, for duplicate detection. The hard
 // rule is that two established (rich) channels in different niches must never get the
 // same answer; a brand-new sparse/empty channel sharing generic scaffolding is fine.
 const isRich = (fixtureId: string): boolean => fixtureId.endsWith("-rich")
 const seenByFingerprint = new Map<string, { scenarioId: string; fixtureId: string }>()
 let sameChannelDuplicates = 0

 const results = generated.map(({ scenario, fixture, response }) => {
  const fingerprint = answerFingerprint(response)
  const prior = seenByFingerprint.get(fingerprint)
  let crossChannelDuplicateOf: string | null = null
  if (prior) {
   if (prior.fixtureId === scenario.fixtureId) {
    sameChannelDuplicates += 1
   } else if (isRich(prior.fixtureId) && isRich(scenario.fixtureId)) {
    crossChannelDuplicateOf = prior.scenarioId
   }
  } else {
   seenByFingerprint.set(fingerprint, { scenarioId: scenario.id, fixtureId: scenario.fixtureId })
  }
  return evaluateScenario(scenario, fixture, response, crossChannelDuplicateOf)
 })

 const passed = results.filter((result) => result.passed).length
 return {
  generatedAt: new Date().toISOString(),
  total: results.length,
  passed,
  failed: results.length - passed,
  passRate: results.length ? passed / results.length : 0,
  sameChannelDuplicates,
  results,
 }
}
