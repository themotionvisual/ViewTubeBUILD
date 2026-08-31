export const DASHBOARD_SCHEMA_VERSION = 10
export const DASHBOARD_LAYOUT_STORAGE_KEY = "vt_dashboard_layout_v10"
export const DASHBOARD_LAYOUT_BACKUP_KEY = "vt_dashboard_layout_backup_v10"
export const LEGACY_DASHBOARD_LAYOUT_STORAGE_KEYS = [
  "vt_dashboard_layout_v9",
  "vt_dashboard_layout_v8",
  "vt_dashboard_layout_v7",
] as const

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
  transitionMs: 180,
} as const

export const SIZE_BUCKET_ORDER = ["quarter", "companion", "third", "between", "half", "two-thirds", "three-quarters", "full"] as const
export const HEIGHT_BUCKET_ORDER = ["short", "medium", "tall", "xtall", "massive"] as const
