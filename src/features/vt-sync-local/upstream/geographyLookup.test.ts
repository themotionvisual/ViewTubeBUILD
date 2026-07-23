import { describe, expect, it } from "vitest"

import {
 getVtSyncCountryFlag,
 getVtSyncCountryName,
 getVtSyncDmaName,
 getVtSyncStateName,
 normalizeVtSyncDmaCode,
 normalizeVtSyncStateCode,
} from "./geographyLookup"

describe("VT-SYNC geography lookups", () => {
 it("resolves countries and returns local flag-icons SVG class codes with truthful fallbacks", () => {
  expect(getVtSyncCountryName("us")).toBe("United States")
  expect(getVtSyncCountryName("XK")).toBe("Kosovo")
  expect(getVtSyncCountryName("ZZ")).toBe("Unknown or Direct Origin")
  expect(getVtSyncCountryName("Q1")).toBe("Q1")
  expect(getVtSyncCountryFlag("US")).toBe("us")
  expect(getVtSyncCountryFlag("XK")).toBe("xk")
  expect(getVtSyncCountryFlag("ZZ")).toBe("xx")
  expect(getVtSyncCountryFlag("Q1")).toBe("xx")
 })

 it("normalizes state codes without losing their display identity", () => {
  expect(normalizeVtSyncStateCode("ca")).toBe("US-CA")
  expect(normalizeVtSyncStateCode("US-NY")).toBe("US-NY")
  expect(getVtSyncStateName("CA")).toBe("California")
  expect(getVtSyncStateName("US-NY")).toBe("New York")
 })

 it("keeps DMA codes while resolving their named areas", () => {
  expect(normalizeVtSyncDmaCode(803)).toBe("803")
  expect(getVtSyncDmaName("501")).toBe("New York, NY")
  expect(getVtSyncDmaName(803)).toBe("Los Angeles, CA")
  expect(getVtSyncDmaName("999")).toBe("Unmapped DMA")
 })
})
