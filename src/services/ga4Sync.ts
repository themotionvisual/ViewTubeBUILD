/**
 * GA4 Sync Service
 * Handles synchronization of GA4 data with the ViewTube data ecosystem.
 * Integrates with GlobalDataContext and Universal Data Hub.
 */

import { ga4Service, type GA4Property } from "./ga4Service"
import type { DataForgeRow } from "./dataForge"

const GA4_STORAGE_KEY = "ga4_properties_cache"
const GA4_DATA_KEY = "ga4_analytics_cache"

export interface GA4SyncState {
  connected: boolean
  properties: GA4Property[]
  selectedProperty: string | null
  lastSynced: number | null
  data: GA4AnalyticsData
}

export interface GA4AnalyticsData {
  overview: any
  trafficSources: any[]
  topPages: any[]
  demographics: {
    ageGroups: any[]
    countries: any[]
    cities: any[]
  }
  conversions: any[]
}

class GA4SyncManager {
  private state: GA4SyncState = {
    connected: false,
    properties: [],
    selectedProperty: null,
    lastSynced: null,
    data: {
      overview: null,
      trafficSources: [],
      topPages: [],
      demographics: {
        ageGroups: [],
        countries: [],
        cities: [],
      },
      conversions: [],
    },
  }

  /**
   * Initialize GA4 sync - load cached state
   */
  public async initialize(): Promise<void> {
    try {
      const cached = localStorage.getItem(GA4_STORAGE_KEY)
      if (cached) {
        const parsed = JSON.parse(cached)
        this.state = { ...this.state, ...parsed }
      }
    } catch (error) {
      console.warn("Failed to load GA4 cache:", error)
    }
  }

  /**
   * Check if GA4 is connected
   */
  public isConnected(): boolean {
    return this.state.connected && this.state.selectedProperty !== null
  }

  /**
   * Get current sync state
   */
  public getState(): GA4SyncState {
    return { ...this.state }
  }

  /**
   * Connect to GA4 and list properties
   */
  public async connect(): Promise<boolean> {
    try {
      const properties = await ga4Service.listProperties()
      
      if (properties.length > 0) {
        this.state.connected = true
        this.state.properties = properties
        this.state.selectedProperty = properties[0].name
        
        this.persistState()
        return true
      }
      
      return false
    } catch (error) {
      console.warn("GA4 connection failed:", error)
      return false
    }
  }

  /**
   * Select a GA4 property
   */
  public selectProperty(propertyId: string): void {
    this.state.selectedProperty = propertyId
    this.persistState()
  }

  /**
   * Get selected property ID
   */
  public getSelectedPropertyId(): string | null {
    return this.state.selectedProperty
  }

  /**
   * Sync GA4 data for the selected property
   */
  public async syncData(startDate: string, endDate: string): Promise<boolean> {
    if (!this.state.selectedProperty) {
      console.warn("No GA4 property selected")
      return false
    }

    try {
      const propertyId = this.state.selectedProperty

      // Fetch all GA4 data in parallel
      const [overview, trafficSources, topPages, demographics, conversions] = await Promise.all([
        ga4Service.getWebsiteOverview(propertyId, startDate, endDate),
        ga4Service.getTrafficSources(propertyId, startDate, endDate),
        ga4Service.getTopPages(propertyId, startDate, endDate),
        ga4Service.getUserDemographics(propertyId, startDate, endDate),
        ga4Service.getConversions(propertyId, startDate, endDate),
      ])

      this.state.data = {
        overview,
        trafficSources,
        topPages,
        demographics,
        conversions,
      }

      this.state.lastSynced = Date.now()
      this.persistData()
      this.persistState()

      // Dispatch custom event for other components to listen
      window.dispatchEvent(new CustomEvent("ga4_data_synced", {
        detail: this.state.data
      }))

      return true
    } catch (error) {
      console.error("GA4 sync failed:", error)
      return false
    }
  }

  /**
   * Get GA4 data as UnifiedRow format for integration with Universal Data Hub
   */
  public getDataAsUnifiedRows(): DataForgeRow[] {
    const rows: DataForgeRow[] = []

    // Convert traffic sources to unified format
    this.state.data.trafficSources.forEach((source, index) => {
      rows.push({
        _id: `ga4_traffic_${index}`,
        _sourceFile: "GA4 Traffic Sources",
        _userTag: "traffic",
        "Video title": source.dimension_0 || "Unknown Source",
        "Video ID": `ga4_source_${source.dimension_0}`,
        Dimension: source.dimension_1 || "Direct",
        Date: new Date().toISOString().split("T")[0],
        "Duration (sec)": 0,
        Type: "Long",
        titleLength: (source.dimension_0 || "").length,
        Views: source.metric_0 || 0,
        "Watch Time (Hours)": source.metric_2 ? source.metric_2 / 60 : 0,
        Revenue: 0,
        "Subscribers Gained": source.metric_1 || 0,
        "AVD (Sec)": 0,
        "AVP (%)": 0,
        "CTR (%)": 0,
        Impressions: 0,
        RPM: 0,
        Likes: 0,
        Comments: 0,
        Shares: 0,
        engagementRate: 0,
      })
    })

    // Convert top pages to unified format
    this.state.data.topPages.forEach((page, index) => {
      rows.push({
        _id: `ga4_page_${index}`,
        _sourceFile: "GA4 Top Pages",
        _userTag: "long",
        "Video title": page.dimension_1 || page.dimension_0 || "Unknown Page",
        "Video ID": `ga4_page_${index}`,
        Dimension: page.dimension_0 || "Page",
        Date: new Date().toISOString().split("T")[0],
        "Duration (sec)": page.metric_3 || 0,
        Type: "Long",
        titleLength: (page.dimension_1 || page.dimension_0 || "").length,
        Views: page.metric_0 || 0,
        "Watch Time (Hours)": 0,
        Revenue: 0,
        "Subscribers Gained": page.metric_1 || 0,
        "AVD (Sec)": page.metric_3 || 0,
        "AVP (%)": 0,
        "CTR (%)": 0,
        Impressions: 0,
        RPM: 0,
        Likes: 0,
        Comments: 0,
        Shares: 0,
        engagementRate: 0,
      })
    })

    return rows
  }

  /**
   * Get GA4 overview metrics
   */
  public getOverview(): any {
    return this.state.data.overview
  }

  /**
   * Get GA4 traffic sources
   */
  public getTrafficSources(): any[] {
    return this.state.data.trafficSources
  }

  /**
   * Get GA4 top pages
   */
  public getTopPages(): any[] {
    return this.state.data.topPages
  }

  /**
   * Get GA4 demographics
   */
  public getDemographics(): { ageGroups: any[]; countries: any[]; cities: any[] } {
    return this.state.data.demographics
  }

  /**
   * Get GA4 conversions
   */
  public getConversions(): any[] {
    return this.state.data.conversions
  }

  /**
   * Get last sync timestamp
   */
  public getLastSynced(): number | null {
    return this.state.lastSynced
  }

  /**
   * Clear GA4 data
   */
  public clearData(): void {
    this.state.data = {
      overview: null,
      trafficSources: [],
      topPages: [],
      demographics: {
        ageGroups: [],
        countries: [],
        cities: [],
      },
      conversions: [],
    }
    this.state.lastSynced = null
    localStorage.removeItem(GA4_DATA_KEY)
  }

  /**
   * Disconnect from GA4
   */
  public disconnect(): void {
    this.state.connected = false
    this.state.properties = []
    this.state.selectedProperty = null
    this.clearData()
    localStorage.removeItem(GA4_STORAGE_KEY)
  }

  /**
   * Persist state to localStorage
   */
  private persistState(): void {
    try {
      const toStore = {
        connected: this.state.connected,
        properties: this.state.properties,
        selectedProperty: this.state.selectedProperty,
        lastSynced: this.state.lastSynced,
      }
      localStorage.setItem(GA4_STORAGE_KEY, JSON.stringify(toStore))
    } catch (error) {
      console.warn("Failed to persist GA4 state:", error)
    }
  }

  /**
   * Persist data to localStorage
   */
  private persistData(): void {
    try {
      localStorage.setItem(GA4_DATA_KEY, JSON.stringify(this.state.data))
    } catch (error) {
      console.warn("Failed to persist GA4 data:", error)
    }
  }
}

export const ga4Sync = new GA4SyncManager()

// Convenience exports
export const initGA4Sync = () => ga4Sync.initialize()
export const connectGA4 = () => ga4Sync.connect()
export const syncGA4Data = (startDate: string, endDate: string) => ga4Sync.syncData(startDate, endDate)
export const getGA4SyncState = () => ga4Sync.getState()
export const isGA4Connected = () => ga4Sync.isConnected()
export const getGA4UnifiedRows = () => ga4Sync.getDataAsUnifiedRows()
export const disconnectGA4 = () => ga4Sync.disconnect()
