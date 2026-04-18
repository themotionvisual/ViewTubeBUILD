/**
 * GA4 Sync Service
 * Refactored to be a thin wrapper around SyncCoordinator
 */

import { syncCoordinator, type GA4SyncState } from "./SyncCoordinator"
import { ga4Service } from "./ga4Service"
import type { DataForgeRow } from "./DataEngine"

const GA4_STORAGE_KEY = "ga4_properties_cache"
const GA4_DATA_KEY = "ga4_analytics_cache"

class GA4SyncManager {
  /**
   * Initialize GA4 sync - load cached state
   */
  public async initialize(): Promise<void> {
    // Already handled by SyncCoordinator's implicit loading in syncGA4
    // But we can keep it for getState if needed
  }

  /**
   * Check if GA4 is connected
   */
  public isConnected(): boolean {
    const state = this.getState()
    return state.connected && state.selectedProperty !== null
  }

  /**
   * Get current sync state
   */
  public getState(): GA4SyncState {
    const cached = localStorage.getItem(GA4_STORAGE_KEY)
    const dataCached = localStorage.getItem(GA4_DATA_KEY)
    
    let state: GA4SyncState = {
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

    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        state = { ...state, ...parsed }
      } catch (e) {
        console.warn("GA4 Sync Wrapper: Corrupt ga4_properties_cache", e)
      }
    }

    if (dataCached) {
      try {
        state.data = JSON.parse(dataCached)
      } catch (e) {
        console.warn("GA4 Sync Wrapper: Corrupt ga4_analytics_cache", e)
      }
    }

    return state
  }

  /**
   * Connect to GA4 and list properties
   */
  public async connect(): Promise<boolean> {
    try {
      const properties = await ga4Service.listProperties()
      
      if (properties.length > 0) {
        const state = this.getState()
        state.connected = true
        state.properties = properties
        state.selectedProperty = properties[0].name
        
        localStorage.setItem(GA4_STORAGE_KEY, JSON.stringify({
          connected: state.connected,
          properties: state.properties,
          selectedProperty: state.selectedProperty,
          lastSynced: state.lastSynced,
        }))
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
    const state = this.getState()
    state.selectedProperty = propertyId
    localStorage.setItem(GA4_STORAGE_KEY, JSON.stringify({
      connected: state.connected,
      properties: state.properties,
      selectedProperty: state.selectedProperty,
      lastSynced: state.lastSynced,
    }))
  }

  /**
   * Get selected property ID
   */
  public getSelectedPropertyId(): string | null {
    return this.getState().selectedProperty
  }

  /**
   * Sync GA4 data for the selected property
   */
  public async syncData(startDate: string, endDate: string): Promise<boolean> {
    return syncCoordinator.syncGA4(startDate, endDate)
  }

  /**
   * Get GA4 data as UnifiedRow format for integration with Universal Data Hub
   */
  public getDataAsUnifiedRows(): DataForgeRow[] {
    const rows: DataForgeRow[] = []
    const data = this.getState().data

    // Convert traffic sources to unified format
    data.trafficSources.forEach((source, index) => {
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
    data.topPages.forEach((page, index) => {
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
    return this.getState().data.overview
  }

  /**
   * Get GA4 traffic sources
   */
  public getTrafficSources(): any[] {
    return this.getState().data.trafficSources
  }

  /**
   * Get GA4 top pages
   */
  public getTopPages(): any[] {
    return this.getState().data.topPages
  }

  /**
   * Get GA4 demographics
   */
  public getDemographics(): { ageGroups: any[]; countries: any[]; cities: any[] } {
    return this.getState().data.demographics
  }

  /**
   * Get GA4 conversions
   */
  public getConversions(): any[] {
    return this.getState().data.conversions
  }

  /**
   * Get last sync timestamp
   */
  public getLastSynced(): number | null {
    return this.getState().lastSynced
  }

  /**
   * Clear GA4 data
   */
  public clearData(): void {
    localStorage.removeItem(GA4_DATA_KEY)
  }

  /**
   * Disconnect from GA4
   */
  public disconnect(): void {
    this.clearData()
    localStorage.removeItem(GA4_STORAGE_KEY)
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
