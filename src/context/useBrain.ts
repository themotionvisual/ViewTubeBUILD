import { useContext } from "react"
import { GlobalDataContext, fallbackContext } from "./GlobalDataContext"

let hasWarnedFallback = false

export const useBrain = () => {
 const context = useContext(GlobalDataContext)
 if (!context) {
  if (!hasWarnedFallback) {
   hasWarnedFallback = true
   console.warn(
    "useBrain fallback used (likely HMR boundary mismatch). Reloading the page will restore provider state.",
   )
  }
  return fallbackContext
 }
 return context
}
