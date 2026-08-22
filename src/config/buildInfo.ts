export interface ViewTubeBuildInfo {
  branch: string
  commit: string
  builtAt: string
  version: string
}

export const BUILD_INFO: Readonly<ViewTubeBuildInfo> = Object.freeze({
  branch: __VT_BRANCH__,
  commit: __VT_COMMIT__,
  builtAt: __VT_BUILD_TIME__,
  version: __VT_VERSION__,
})

let logged = false

export const logBuildInfo = (): void => {
  if (logged) return
  logged = true
  // The production console-strip plugin intentionally targets direct
  // `console.info` calls. This one names the exact running build and must
  // survive so screenshots and bug reports can be tied to deployed code.
  globalThis["console"]["info"]("[ViewTube build]", BUILD_INFO)
}
