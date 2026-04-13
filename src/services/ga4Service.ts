/**
 * Google Analytics 4 Service
 * Integrates GA4 Data API v1 for website analytics alongside YouTube data.
 * This completes the 4th pillar of the ViewTube analytics ecosystem.
 */

import { getAccessToken, logout, isAuthenticated } from "./authSession"

const GA4_BASE_URL = "https://analyticsdata.googleapis.com/v1beta"
const GA4_ADMIN_URL = "https://analyticsadmin.googleapis.com/v1beta"

export interface GA4Property {
  name: string
  property: string
  displayName: string
  createTime: string
  updateTime: string
  parent: string
}

export interface GA4ReportRequest {
  property: string
  dateRanges: Array<{
    startDate: string
    endDate: string
  }>
  metrics: Array<{ name: string }>
  dimensions?: Array<{ name: string }>
  orderBys?: Array<{
    metric?: { metricName: string }
    dimension?: { dimensionName: string }
    desc: boolean
  }>
  limit?: number
}

export interface GA4ReportResponse {
  rows?: Array<{
    dimensionValues: Array<{ value: string }>
    metricValues: Array<{ value: string }>
  }>
  totals?: Array<{
    dimensionValues: Array<{ value: string }>
    metricValues: Array<{ value: string }>
  }>
  rowCount: number
  metadata: {
    currencyCode: string
    timeZone: string
    dataLossFromOtherRow: boolean
  }
}

class GA4Service {
  private async request(url: string, options: RequestInit = {}) {
    const token = getAccessToken()
    if (!token) throw new Error("Not authenticated")

    const headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    }

    const response = await fetch(url, { ...options, headers })

    if (response.status === 401) {
      logout()
      throw new Error("Session expired")
    }

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || "GA4 API Request failed")
    }

    return response.json()
  }

  /**
   * List all GA4 properties accessible to the user
   */
  public async listProperties(): Promise<GA4Property[]> {
    try {
      const data = await this.request(`${GA4_ADMIN_URL}/properties`)
      return data.properties || []
    } catch (error) {
      console.warn("Failed to list GA4 properties:", error)
      return []
    }
  }

  /**
   * Get property details by ID
   */
  public async getProperty(propertyId: string): Promise<GA4Property | null> {
    try {
      const data = await this.request(`${GA4_ADMIN_URL}/properties/${propertyId}`)
      return data
    } catch (error) {
      console.warn(`Failed to get GA4 property ${propertyId}:`, error)
      return null
    }
  }

  /**
   * Run a GA4 report query
   */
  public async runReport(request: GA4ReportRequest): Promise<GA4ReportResponse> {
    const { property, ...reportConfig } = request
    const url = `${GA4_BASE_URL}/properties/${property}:runReport`
    
    try {
      const data = await this.request(url, {
        method: "POST",
        body: JSON.stringify(reportConfig),
        headers: { "Content-Type": "application/json" },
      })
      return data
    } catch (error) {
      console.warn("GA4 report failed:", error)
      throw error
    }
  }

  /**
   * Get basic website analytics (sessions, users, pageviews)
   */
  public async getWebsiteOverview(
    propertyId: string,
    startDate: string,
    endDate: string
  ): Promise<any> {
    const request: GA4ReportRequest = {
      property: propertyId,
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: "sessions" },
        { name: "activeUsers" },
        { name: "screenPageViews" },
        { name: "engagementRate" },
        { name: "averageSessionDuration" },
      ],
    }

    try {
      const response = await this.runReport(request)
      return this.parseReportResponse(response)
    } catch (error) {
      console.warn("Failed to get website overview:", error)
      return null
    }
  }

  /**
   * Get traffic source data (where visitors come from)
   */
  public async getTrafficSources(
    propertyId: string,
    startDate: string,
    endDate: string
  ): Promise<any[]> {
    const request: GA4ReportRequest = {
      property: propertyId,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "sessionSource" }, { name: "sessionMedium" }],
      metrics: [
        { name: "sessions" },
        { name: "activeUsers" },
        { name: "screenPageViews" },
      ],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 50,
    }

    try {
      const response = await this.runReport(request)
      return this.parseReportRows(response)
    } catch (error) {
      console.warn("Failed to get traffic sources:", error)
      return []
    }
  }

  /**
   * Get page-level analytics
   */
  public async getTopPages(
    propertyId: string,
    startDate: string,
    endDate: string,
    limit = 20
  ): Promise<any[]> {
    const request: GA4ReportRequest = {
      property: propertyId,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "screenPagePath" }, { name: "pageTitle" }],
      metrics: [
        { name: "screenPageViews" },
        { name: "activeUsers" },
        { name: "engagementRate" },
        { name: "averageSessionDuration" },
      ],
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit,
    }

    try {
      const response = await this.runReport(request)
      return this.parseReportRows(response)
    } catch (error) {
      console.warn("Failed to get top pages:", error)
      return []
    }
  }

  /**
   * Get user demographics (age, gender, location)
   */
  public async getUserDemographics(
    propertyId: string,
    startDate: string,
    endDate: string
  ): Promise<{
    ageGroups: any[]
    countries: any[]
    cities: any[]
  }> {
    // Age groups
    const ageRequest: GA4ReportRequest = {
      property: propertyId,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "age" }],
      metrics: [{ name: "activeUsers" }],
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
    }

    // Countries
    const countryRequest: GA4ReportRequest = {
      property: propertyId,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "country" }],
      metrics: [{ name: "activeUsers" }],
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
      limit: 20,
    }

    // Cities
    const cityRequest: GA4ReportRequest = {
      property: propertyId,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "city" }],
      metrics: [{ name: "activeUsers" }],
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
      limit: 20,
    }

    try {
      const [ageResponse, countryResponse, cityResponse] = await Promise.all([
        this.runReport(ageRequest),
        this.runReport(countryRequest),
        this.runReport(cityRequest),
      ])

      return {
        ageGroups: this.parseReportRows(ageResponse),
        countries: this.parseReportRows(countryResponse),
        cities: this.parseReportRows(cityResponse),
      }
    } catch (error) {
      console.warn("Failed to get demographics:", error)
      return { ageGroups: [], countries: [], cities: [] }
    }
  }

  /**
   * Get conversion events (goals completed)
   */
  public async getConversions(
    propertyId: string,
    startDate: string,
    endDate: string
  ): Promise<any[]> {
    const request: GA4ReportRequest = {
      property: propertyId,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "eventName" }],
      metrics: [{ name: "eventCount" }],
      orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
      limit: 20,
    }

    try {
      const response = await this.runReport(request)
      return this.parseReportRows(response)
    } catch (error) {
      console.warn("Failed to get conversions:", error)
      return []
    }
  }

  /**
   * Helper: Parse GA4 report response into normalized format
   */
  private parseReportResponse(response: GA4ReportResponse): any {
    if (!response.rows || response.rows.length === 0) {
      return {}
    }

    const result: any = {}
    const row = response.rows[0]
    
    row.metricValues.forEach((metric, index) => {
      const value = parseFloat(metric.value) || 0
      result[`metric_${index}`] = value
    })

    return result
  }

  /**
   * Helper: Parse GA4 report rows into array format
   */
  private parseReportRows(response: GA4ReportResponse): any[] {
    if (!response.rows || response.rows.length === 0) {
      return []
    }

    return response.rows.map(row => {
      const item: any = {}
      
      row.dimensionValues.forEach((dim, index) => {
        item[`dimension_${index}`] = dim.value
      })
      
      row.metricValues.forEach((metric, index) => {
        const value = parseFloat(metric.value) || 0
        item[`metric_${index}`] = value
      })

      return item
    })
  }

  /**
   * Check if GA4 is connected
   */
  public isGA4Connected(): boolean {
    return isAuthenticated()
  }
}

export const ga4Service = new GA4Service()

// Convenience exports
export const listGA4Properties = () => ga4Service.listProperties()
export const getGA4WebsiteOverview = (propertyId: string, startDate: string, endDate: string) => 
  ga4Service.getWebsiteOverview(propertyId, startDate, endDate)
export const getGA4TrafficSources = (propertyId: string, startDate: string, endDate: string) =>
  ga4Service.getTrafficSources(propertyId, startDate, endDate)
export const getGA4TopPages = (propertyId: string, startDate: string, endDate: string, limit?: number) =>
  ga4Service.getTopPages(propertyId, startDate, endDate, limit)
export const getGA4UserDemographics = (propertyId: string, startDate: string, endDate: string) =>
  ga4Service.getUserDemographics(propertyId, startDate, endDate)
export const getGA4Conversions = (propertyId: string, startDate: string, endDate: string) =>
  ga4Service.getConversions(propertyId, startDate, endDate)