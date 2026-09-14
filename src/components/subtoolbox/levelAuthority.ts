import type React from "react"
import { TOOLBOX_LEVEL_TOKENS, type ToolboxStructuralLevel } from "./tokens"

/**
 * Bridge between the documented structural hierarchy and rendered components.
 * Components ask for a level; this module supplies geometry. This prevents
 * feature/page code from restating stroke/radius/height/shadow values.
 */
export const getToolboxLevelCssVars = (
  level: ToolboxStructuralLevel,
): React.CSSProperties => {
  const token = TOOLBOX_LEVEL_TOKENS[level]
  return {
    ["--vt-level-height" as any]: `${token.height}px`,
    ["--vt-level-stroke" as any]: `${token.stroke}px`,
    ["--vt-level-radius" as any]: `${token.radius}px`,
    ["--vt-level-shadow-offset" as any]: `${token.shadowOffset}px`,
    ["--vt-level-title-size" as any]: `${token.titleSize}px`,
    ["--vt-level-title-weight" as any]: token.titleWeight,
  }
}

export const getToolboxLevelStyle = (
  level: ToolboxStructuralLevel,
  shadowColor = "rgba(0,0,0,0.35)",
): React.CSSProperties => {
  const token = TOOLBOX_LEVEL_TOKENS[level]
  return {
    ...getToolboxLevelCssVars(level),
    height: `${token.height}px`,
    borderWidth: `${token.stroke}px`,
    borderStyle: "solid",
    borderColor: "black",
    borderRadius: `${token.radius}px`,
    boxShadow: `${token.shadowOffset}px ${token.shadowOffset}px 0 0 ${shadowColor}`,
    fontSize: `${token.titleSize}px`,
    fontWeight: token.titleWeight,
  }
}

/** Square split-left rails always equal the row height at their structural level. */
export const getToolboxRailStyle = (
  level: ToolboxStructuralLevel,
): React.CSSProperties => {
  const token = TOOLBOX_LEVEL_TOKENS[level]
  return {
    width: `${token.height}px`,
    minWidth: `${token.height}px`,
    height: `${token.height}px`,
    borderRight: `${token.stroke}px solid black`,
  }
}

/** Internal dividers inherit the structural stroke of the boundary they represent. */
export const getToolboxDividerStyle = (
  level: ToolboxStructuralLevel,
  edge: "top" | "right" | "bottom" | "left" = "bottom",
): React.CSSProperties => {
  const token = TOOLBOX_LEVEL_TOKENS[level]
  const property = `border${edge[0].toUpperCase()}${edge.slice(1)}` as keyof React.CSSProperties
  return { [property]: `${token.stroke}px solid black` }
}

export const TOOLBOX_LEVEL_ORDER: readonly ToolboxStructuralLevel[] = [
  "toolbox",
  "l0",
  "compact",
  "l1",
  "l2",
] as const
