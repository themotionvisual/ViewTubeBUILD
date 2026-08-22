/// <reference types="vite/client" />

declare module "*.jsx" {
  import type { ComponentType } from "react"
  const component: ComponentType<Record<string, never>>
  export default component
}

declare const __VT_BRANCH__: string
declare const __VT_COMMIT__: string
declare const __VT_BUILD_TIME__: string
declare const __VT_VERSION__: string
