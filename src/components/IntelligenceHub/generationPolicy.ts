export type IntelligenceAiFailureCode =
 | "AI_NOT_CONFIGURED"
 | "AI_AUTH_INVALID"
 | "AI_PERMISSION_DENIED"
 | "AI_QUOTA_EXHAUSTED"
 | "AI_RATE_LIMITED"
 | "AI_UPSTREAM_UNAVAILABLE"
 | "AI_TIMEOUT"
 | "AI_REQUEST_INVALID"
 | "AI_GENERATION_FAILED"
 | "AI_UNKNOWN"

export type IntelligenceAiFailure = {
 code: IntelligenceAiFailureCode
 message: string
 retryable: boolean
 recoveryAction: "configure_ai" | "retry" | "try_later" | "inspect_request"
 requestId?: string
}

export class IntelligenceGenerationError extends Error {
 readonly failure: IntelligenceAiFailure
 readonly generationId?: string
 readonly details?: unknown

 constructor(failure: IntelligenceAiFailure, generationId?: string, details?: unknown) {
  super(failure.message)
  this.name = "IntelligenceGenerationError"
  this.failure = failure
  this.generationId = generationId
  this.details = details
 }
}

const errorRecord = (error: unknown): Record<string, unknown> =>
 error && typeof error === "object" ? error as Record<string, unknown> : {}

const errorStatus = (error: unknown): number | undefined => {
 const record = errorRecord(error)
 const nested = errorRecord(record.error)
 const response = errorRecord(record.response)
 const status = Number(record.status || record.statusCode || nested.status || nested.code || response.status)
 return Number.isFinite(status) ? status : undefined
}

export const classifyIntelligenceAiFailure = (error: unknown): IntelligenceAiFailure => {
 if (error instanceof IntelligenceGenerationError) return error.failure
 const record = errorRecord(error)
 const nested = errorRecord(record.error)
 const message = error instanceof Error ? error.message : String(record.message || nested.message || error || "AI generation failed.")
 const normalized = message.toLowerCase()
 const status = errorStatus(error)
 const requestId = String(record.requestId || nested.requestId || "").trim() || undefined

 if (/api key is missing|not configured|configure (gemini|ai)|key vault/.test(normalized)) {
  return { code: "AI_NOT_CONFIGURED", message: "Gemini is not configured. Add a Gemini API key in Settings before generating a report.", retryable: false, recoveryAction: "configure_ai", requestId }
 }
 if (/quota|billing|resource[_ -]?exhausted|insufficient credits/.test(normalized)) {
  return { code: "AI_QUOTA_EXHAUSTED", message: "Gemini quota is unavailable for this report. Review AI billing or quota before retrying.", retryable: false, recoveryAction: "configure_ai", requestId }
 }
 if (status === 401 || /api[_ -]?key[_ -]?invalid|invalid api key|unauthenticated/.test(normalized)) {
  return { code: "AI_AUTH_INVALID", message: "Gemini rejected the configured API key. Update the key in Settings.", retryable: false, recoveryAction: "configure_ai", requestId }
 }
 if (status === 403 || /permission denied|forbidden|not authorized/.test(normalized)) {
  return { code: "AI_PERMISSION_DENIED", message: "Gemini access is not authorized for this request. Review the configured AI account and permissions.", retryable: false, recoveryAction: "configure_ai", requestId }
 }
 if (status === 429 || /rate limit|too many requests/.test(normalized)) {
  return { code: "AI_RATE_LIMITED", message: "Gemini is temporarily rate limited. Try the report again shortly.", retryable: true, recoveryAction: "try_later", requestId }
 }
 if (/timed out|timeout/.test(normalized)) {
  return { code: "AI_TIMEOUT", message: "Gemini did not finish this report step in time.", retryable: true, recoveryAction: "retry", requestId }
 }
 if ((status !== undefined && status >= 500) || /service unavailable|upstream|temporarily unavailable|internal server error/.test(normalized)) {
  return { code: "AI_UPSTREAM_UNAVAILABLE", message: "Gemini is temporarily unavailable. Try the report again later.", retryable: true, recoveryAction: "try_later", requestId }
 }
 if (status === 400 || /invalid argument|bad request|malformed|invalid payload/.test(normalized)) {
  return { code: "AI_REQUEST_INVALID", message: "The report request was rejected. Review the generated request diagnostics before retrying.", retryable: false, recoveryAction: "inspect_request", requestId }
 }
 return { code: "AI_UNKNOWN", message: message || "AI generation failed.", retryable: false, recoveryAction: "inspect_request", requestId }
}

export type IntelligenceGenerationReadiness = {
 ready: boolean
 action: "generate" | "configure_ai" | "connect_channel"
 buttonLabel: "GENERATE REPORT" | "CONFIGURE AI" | "CONNECT CHANNEL"
 message?: string
}

export const resolveIntelligenceGenerationReadiness = ({
 aiConfigured,
 channelId,
}: {
 aiConfigured: boolean
 channelId: string | null
}): IntelligenceGenerationReadiness => {
 if (!channelId) return { ready: false, action: "connect_channel", buttonLabel: "CONNECT CHANNEL", message: "Connect a YouTube channel before generating an intelligence report." }
 if (!aiConfigured) return { ready: false, action: "configure_ai", buttonLabel: "CONFIGURE AI", message: "Add a Gemini API key in Settings before generating an intelligence report." }
 return { ready: true, action: "generate", buttonLabel: "GENERATE REPORT" }
}

export const resolveIntelligenceReportStatus = ({
 completedCount,
 degradedCount,
 failedCount,
 warningCount,
}: {
 completedCount: number
 degradedCount: number
 failedCount: number
 warningCount: number
}): "complete" | "degraded" | "failed" => {
 const usableCount = completedCount + degradedCount
 if (usableCount === 0) return "failed"
 if (degradedCount > 0 || failedCount > 0 || warningCount > 0) return "degraded"
 return "complete"
}
