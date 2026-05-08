import {
 createReportingJob,
 listReportingJobs,
 listReports,
} from "./youtubeAnalyticsFetcher"
import type { AccountContext, AdapterOutcome } from "./apiCapabilityRegistry"

export type ReportingAdapterResult<T> = {
 outcome: AdapterOutcome
 data: T | null
 reason?: string
}

const unsupported = <T>(reason: string): ReportingAdapterResult<T> => ({
 outcome: "unsupported",
 data: null,
 reason,
})

const ok = <T>(data: T): ReportingAdapterResult<T> => ({
 outcome: "ok",
 data,
})

const degraded = <T>(reason: string): ReportingAdapterResult<T> => ({
 outcome: "degraded",
 data: null,
 reason,
})

const guardContentOwner = (accountContext: AccountContext) =>
 accountContext === "content_owner"

export const youtubeReportingAdapter = {
 async createJob(
  accountContext: AccountContext,
  reportTypeId: string,
  name: string,
 ): Promise<ReportingAdapterResult<any>> {
  if (!guardContentOwner(accountContext)) {
   return unsupported(
    "Reporting jobs are available only for content owner accounts.",
   )
  }
  try {
   return ok(await createReportingJob(reportTypeId, name))
  } catch (error: any) {
   return degraded(error?.message || "Failed to create reporting job.")
  }
 },

 async getJobs(accountContext: AccountContext): Promise<ReportingAdapterResult<any>> {
  if (!guardContentOwner(accountContext)) {
   return unsupported(
    "Reporting jobs are available only for content owner accounts.",
   )
  }
  try {
   return ok(await listReportingJobs())
  } catch (error: any) {
   return degraded(error?.message || "Failed to list reporting jobs.")
  }
 },

 async getReports(
  accountContext: AccountContext,
  jobId: string,
 ): Promise<ReportingAdapterResult<any>> {
  if (!guardContentOwner(accountContext)) {
   return unsupported(
    "Reporting reports are available only for content owner accounts.",
   )
  }
  try {
   return ok(await listReports(jobId))
  } catch (error: any) {
   return degraded(error?.message || "Failed to list reports.")
  }
 },
}

