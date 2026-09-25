import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const appRoutesSource = fs.readFileSync(path.resolve(process.cwd(), "src/app/AppRoutes.tsx"), "utf8")

describe("Creator Vault production route", () => {
 it("mounts the production CreatorVaultOS instead of redirecting to Reference Studio", () => {
  expect(appRoutesSource).toContain('const CreatorVaultOS = lazy(() => import("../views/CreatorVaultOS"))')
  expect(appRoutesSource).toContain('path="/vault" element={<CreatorVaultOS />}')
  expect(appRoutesSource).not.toContain('path="/vault"\n     element={<Navigate to="/reference-studio/toolbox-system" replace />}')
 })
})
