import React from "react"

export type AnalyticsVisualHeaderColorPair = {
  icon: string
  title: string
}

export type AnalyticsVisualStyle = {
  iconKey?: string
  headerColorPair?: AnalyticsVisualHeaderColorPair
  controllerColors?: {
    previous: string
    middle: string
    next: string
  }
}

const AnalyticsVisualStyleContext = React.createContext<AnalyticsVisualStyle | undefined>(undefined)

export const AnalyticsVisualStyleProvider: React.FC<React.PropsWithChildren<{
  value?: AnalyticsVisualStyle
}>> = ({ value, children }) => (
  <AnalyticsVisualStyleContext.Provider value={value}>
    {children}
  </AnalyticsVisualStyleContext.Provider>
)

export const useAnalyticsVisualStyle = () => React.useContext(AnalyticsVisualStyleContext)
