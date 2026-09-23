import { describe, expect, it } from "vitest"
import {
  contentBuildStageForProjectStatus,
  projectLaneForStatus,
  projectStatusForLane,
  videoPackageStatusForContentBuildStage,
} from "./projectLifecycleVocabulary"

describe("Project lifecycle vocabulary", () => {
  it.each([
    ["ideation", "ideas"],
    ["planned", "planned"],
    ["production", "in-progress"],
    ["review", "review"],
    ["ready", "ready"],
    ["blocked", "blocked"],
    ["published", "published"],
  ] as const)("maps Project status %s to Board lane %s", (status, lane) => {
    expect(projectLaneForStatus(status)).toBe(lane)
  })

  it.each([
    ["ideas", "ideation"],
    ["planned", "planned"],
    ["in-progress", "production"],
    ["review", "review"],
    ["ready", "ready"],
    ["blocked", "blocked"],
    ["published", "published"],
  ] as const)("maps Board lane %s back to semantic Project status %s", (lane, status) => {
    expect(projectStatusForLane(lane)).toBe(status)
  })

  it.each([
    ["ideation", "idea"],
    ["research", "research"],
    ["planned", "concept"],
    ["scripting", "script"],
    ["storyboard", "storyboard"],
    ["production", "media"],
    ["packaging", "package"],
    ["editing", "edit"],
    ["review", "review"],
    ["ready", "scheduled"],
    ["published", "published"],
    ["launch", "launch"],
    ["monitor", "monitor"],
    ["completed", "evaluation"],
    ["learning", "learning"],
    ["archived", "archived"],
  ] as const)("maps Project status %s to ContentBuild stage %s", (status, stage) => {
    expect(contentBuildStageForProjectStatus(status)).toBe(stage)
  })

  it("treats blocked as an orthogonal Board condition and preserves current ContentBuild stage", () => {
    expect(contentBuildStageForProjectStatus("blocked", { currentStage: "media" })).toBe("media")
    expect(contentBuildStageForProjectStatus("blocked", { currentStage: "review" })).toBe("review")
  })

  it("lets an explicit canonical ContentBuild stage override coarse Project status", () => {
    expect(contentBuildStageForProjectStatus("production", { explicitStage: "storyboard" })).toBe("storyboard")
  })

  it.each([
    ["idea", "idea"],
    ["research", "developing"],
    ["concept", "developing"],
    ["outline", "developing"],
    ["script", "scripted"],
    ["storyboard", "storyboarded"],
    ["media", "producing"],
    ["edit", "producing"],
    ["package", "packaging"],
    ["review", "review"],
    ["scheduled", "scheduled"],
    ["published", "published"],
    ["launch", "published"],
    ["monitor", "measuring"],
    ["evaluation", "measuring"],
    ["learning", "measuring"],
    ["archived", "archived"],
  ] as const)("describes ContentBuild stage %s as Video Package status %s", (stage, status) => {
    expect(videoPackageStatusForContentBuildStage(stage)).toBe(status)
  })
})
