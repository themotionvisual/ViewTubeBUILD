import { beforeEach, describe, expect, it } from "vitest"
import type { Project } from "@/types"
import { listContentBuildEvents, resetContentBuildRepositoryForTests } from "./ContentBuildRepository"
import { syncProjectToContentBuild } from "./ProjectContentBuildBridge"

const project = (overrides: Partial<Project> = {}): Project => ({
 id: "project-a",
 name: "Napoleon — The Last Charge",
 status: "active",
 concept: "The final cavalry charge",
 niche: "Napoleonic history",
 plan: {
  concept: "The final cavalry charge",
  niche: "Napoleonic history",
  subject: "Austerlitz",
  intention: "Eyewitness-driven history",
  audiencePromise: "Understand the battle through people who saw it",
  visualStyle: "cinematic historical painting",
  packagingIntent: "specific curiosity without clickbait",
 },
 ...overrides,
})

describe("Project ContentBuild bridge", () => {
 beforeEach(() => {
  resetContentBuildRepositoryForTests()
 })

 it("creates a stable ContentBuild from a legacy Project", () => {
  const first = syncProjectToContentBuild(project())
  const second = syncProjectToContentBuild(project())

  expect(first.id).toBe("cb:project:project-a")
  expect(second.id).toBe(first.id)
  expect(second.profile).toMatchObject({
   subject: "Austerlitz",
   niche: "Napoleonic history",
   intention: "Eyewitness-driven history",
   audiencePromise: "Understand the battle through people who saw it",
   style: { visualStyle: "cinematic historical painting" },
   strategy: { packagingIntent: "specific curiosity without clickbait" },
  })

  expect(listContentBuildEvents(first.id).filter(event => event.eventType === "build.created")).toHaveLength(1)
 })

 it("prefers an explicit Project contentBuildId", () => {
  const build = syncProjectToContentBuild(project({ contentBuildId: "cb-custom" }))
  expect(build.id).toBe("cb-custom")
  expect(build.legacyProjectId).toBe("project-a")
 })

 it("records profile changes without creating a second build", () => {
  const first = syncProjectToContentBuild(project())
  const changed = syncProjectToContentBuild(project({
   plan: {
    concept: "The final cavalry charge",
    niche: "Napoleonic history",
    intention: "A tighter eyewitness reconstruction",
   },
  }))

  expect(changed.id).toBe(first.id)
  expect(changed.profile.intention).toBe("A tighter eyewitness reconstruction")
  expect(listContentBuildEvents(first.id).map(event => event.eventType)).toContain("profile.updated")
 })

 it.each([
  ["ideation", "idea"],
  ["planned", "concept"],
  ["scripting", "script"],
  ["production", "media"],
  ["review", "review"],
  ["ready", "scheduled"],
  ["published", "published"],
  ["completed", "evaluation"],
  ["archived", "archived"],
 ] as const)("maps project status %s to ContentBuild stage %s", (status, expectedStage) => {
  const build = syncProjectToContentBuild(project({ id: `project-${status}`, status }))
  expect(build.stage).toBe(expectedStage)
 })

 it("does not reset lifecycle progress when a Project is moved to the orthogonal blocked lane", () => {
  const producing = syncProjectToContentBuild(project({ status: "production" }))
  const blocked = syncProjectToContentBuild(project({ contentBuildId: producing.id, status: "blocked" }))

  expect(producing.stage).toBe("media")
  expect(blocked.stage).toBe("media")
 })
})
