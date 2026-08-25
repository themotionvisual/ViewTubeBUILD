import { describe, expect, it } from "vitest"
import {
 classifyIntelligenceAiFailure,
 resolveIntelligenceGenerationReadiness,
 resolveIntelligenceReportStatus,
} from "./generationPolicy"

describe("Intelligence Hub generation policy", () => {
 it("blocks generation until both channel and Gemini are ready", () => {
  expect(resolveIntelligenceGenerationReadiness({ aiConfigured: true, channelId: null })).toMatchObject({ ready: false, action: "connect_channel" })
  expect(resolveIntelligenceGenerationReadiness({ aiConfigured: false, channelId: "channel-a" })).toMatchObject({ ready: false, action: "configure_ai" })
  expect(resolveIntelligenceGenerationReadiness({ aiConfigured: true, channelId: "channel-a" })).toMatchObject({ ready: true, action: "generate" })
 })

 it("never retries setup, permission, quota, or invalid-request failures", () => {
  expect(classifyIntelligenceAiFailure(new Error("Gemini API key is missing")).retryable).toBe(false)
  expect(classifyIntelligenceAiFailure({ status: 403, message: "Permission denied" }).retryable).toBe(false)
  expect(classifyIntelligenceAiFailure({ status: 429, message: "Resource exhausted: quota" }).retryable).toBe(false)
  expect(classifyIntelligenceAiFailure({ status: 400, message: "Invalid argument" }).retryable).toBe(false)
 })

 it("retries only transient failures", () => {
  expect(classifyIntelligenceAiFailure({ status: 429, message: "Rate limit exceeded" }).retryable).toBe(true)
  expect(classifyIntelligenceAiFailure({ status: 503, message: "Service unavailable" }).retryable).toBe(true)
  expect(classifyIntelligenceAiFailure(new Error("stage timed out")).retryable).toBe(true)
 })

 it("treats partially usable output as degraded and zero usable sections as failed", () => {
  expect(resolveIntelligenceReportStatus({ completedCount: 0, degradedCount: 0, failedCount: 12, warningCount: 4 })).toBe("failed")
  expect(resolveIntelligenceReportStatus({ completedCount: 8, degradedCount: 2, failedCount: 2, warningCount: 1 })).toBe("degraded")
  expect(resolveIntelligenceReportStatus({ completedCount: 12, degradedCount: 0, failedCount: 0, warningCount: 0 })).toBe("complete")
 })
})
