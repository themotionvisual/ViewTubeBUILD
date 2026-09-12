import { describe, expect, it } from "vitest"
import {
 isSurprisingSubstitution,
 resolveModelForCapability,
 type ModelCapability,
} from "../modelRouting"

const resolve = (preference: string, capability: ModelCapability) =>
 resolveModelForCapability({ preference, capability })

describe("resolveModelForCapability", () => {
 it("reports the blanket text policy overriding a creator's pro preference", () => {
  const resolution = resolve("gemini-3.1-pro", "text")
  expect(resolution.served).toBe("gemini-3.1-flash-lite")
  expect(resolution.substituted).toBe(true)
  expect(resolution.reason).toBe("capability_policy_override")
  expect(isSurprisingSubstitution(resolution)).toBe(true)
 })

 it("does not call it a substitution when the policy matches the preference", () => {
  const resolution = resolve("gemini-3.1-flash-lite", "text")
  expect(resolution.substituted).toBe(false)
  expect(resolution.reason).toBe("honoured")
  expect(isSurprisingSubstitution(resolution)).toBe(false)
 })

 it("treats a modality requirement as unsurprising", () => {
  const resolution = resolve("gemini-3.1-pro", "image")
  expect(resolution.served).toBe("gemini-3.1-flash-image-preview")
  expect(resolution.substituted).toBe(true)
  expect(resolution.reason).toBe("capability_requires_model")
  // A text model cannot make an image; the creator is not owed a warning for this.
  expect(isSurprisingSubstitution(resolution)).toBe(false)
 })

 it("honours the preference for capabilities with no policy", () => {
  for (const capability of ["tts", "live"] as const) {
   const resolution = resolve("gemini-3.1-pro", capability)
   expect(resolution.served).toBe("gemini-3.1-pro")
   expect(resolution.substituted).toBe(false)
  }
 })

 it("always reports both the requested and served model so measurements are attributable", () => {
  const capabilities: ModelCapability[] = [
   "text", "image", "video", "thinking", "analysis", "fast-text", "audio", "tts", "live",
  ]
  for (const capability of capabilities) {
   const resolution = resolve("gemini-3.1-flash", capability)
   expect(resolution.requested).toBe("gemini-3.1-flash")
   expect(resolution.served).toBeTruthy()
   expect(resolution.capability).toBe(capability)
  }
 })

 it("preserves the documented hybrid routing policy", () => {
  expect(resolve("gemini-3.1-flash", "thinking").served).toBe("gemini-3.1-pro-preview")
  expect(resolve("gemini-3.1-flash", "analysis").served).toBe("gemini-3.1-pro-preview")
  expect(resolve("gemini-3.1-flash", "video").served).toBe("gemini-3-flash-preview")
  expect(resolve("gemini-3.1-flash", "audio").served).toBe("gemini-3-flash-preview")
 })
})
