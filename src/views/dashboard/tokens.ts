export const DASHBOARD_SCHEMA_VERSION = 1
export const DASHBOARD_LAYOUT_STORAGE_KEY = "vt_dashboard_layout_v1"

export const DASHBOARD_TOKENS = {
  strokeLevel1: 4,
  strokeLevel2: 3,
  strokeLevel3: 2,
  radiusLg: 16,
  radiusMd: 12,
  radiusSm: 8,
  outerGap: 24,
  innerGap: 12,
  denseGap: 8,
  shadowOffset: 6,
  transition: "duration-[600ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
} as const

export const SIZE_BUCKET_ORDER = ["quarter", "third", "half", "full"] as const
