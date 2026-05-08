import {
 fetchAnalytics,
 fetchChannelAnalytics,
 fetchGlobalLifetimeAnalytics,
 fetchDemographicAnalytics,
 fetchTrafficSourceAnalytics,
 fetchDailyAnalytics,
 fetchGeographyAnalytics,
} from "./youtubeAnalyticsFetcher"
import type { AdapterOutcome } from "./apiCapabilityRegistry"

export type AnalyticsAdapterResult<T> = {
 outcome: AdapterOutcome
 data: T | null
 reason?: string
}

const ok = <T>(data: T): AnalyticsAdapterResult<T> => ({
 outcome: "ok",
 data,
})

const degraded = <T>(
 reason: string,
 data: T | null = null,
): AnalyticsAdapterResult<T> => ({
 outcome: "degraded",
 data,
 reason,
})

export const youtubeAnalyticsAdapter = {
 async getVideoAnalytics(
  startDate: string,
  endDate: string,
  channelId?: string,
  options: Parameters<typeof fetchAnalytics>[3] = {},
 ) {
  try {
   return ok(await fetchAnalytics(startDate, endDate, channelId, options))
  } catch (error: any) {
   return degraded(error?.message || "Failed to fetch video analytics.")
  }
 },

 async getChannelDaily(startDate: string, endDate: string, channelId?: string) {
  try {
   return ok(await fetchChannelAnalytics(startDate, endDate, channelId))
  } catch (error: any) {
   return degraded(error?.message || "Failed to fetch channel analytics.")
  }
 },

 async getGlobalLifetime(startDate: string, endDate: string, channelId?: string) {
  try {
   return ok(await fetchGlobalLifetimeAnalytics(startDate, endDate, channelId))
  } catch (error: any) {
   return degraded(error?.message || "Failed to fetch global lifetime analytics.")
  }
 },

 async getDemographics(startDate: string, endDate: string, channelId?: string) {
  try {
   return ok(await fetchDemographicAnalytics(startDate, endDate, channelId))
  } catch (error: any) {
   return degraded(error?.message || "Failed to fetch demographics.")
  }
 },

 async getTrafficSources(startDate: string, endDate: string, channelId?: string) {
  try {
   return ok(await fetchTrafficSourceAnalytics(startDate, endDate, channelId))
  } catch (error: any) {
   return degraded(error?.message || "Failed to fetch traffic sources.")
  }
 },

 async getDeviceMix(startDate: string, endDate: string, channelId?: string) {
  try {
   return ok(await fetchDailyAnalytics(startDate, endDate, channelId))
  } catch (error: any) {
   return degraded(error?.message || "Failed to fetch device analytics.")
  }
 },

 async getRetention(startDate: string, endDate: string, channelId?: string) {
  try {
   return ok(await fetchGeographyAnalytics(startDate, endDate, channelId))
  } catch (error: any) {
   return degraded(error?.message || "Failed to fetch retention analytics.")
  }
 },
}
