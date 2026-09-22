import { describe, expect, it } from "vitest"
import type { Project } from "../../types"
import {
 hydrateProjectWorkspace,
 statusForLane,
 type ProjectWorkspaceState,
} from "./projectWorkspace"

const emptyState:ProjectWorkspaceState={
 version:1,
 projects:{},
 view:"board",
 query:"",
 priorityFilter:"all",
 ownerFilter:"all",
 showArchived:false,
}

const project=(overrides:Partial<Project>={}):Project=>({
 id:"project-1",
 name:"Project One",
 status:"ideation",
 plan:{concept:"",niche:"",projectPriority:"high"},
 ...overrides,
})

describe("project workspace ownership",()=>{
 it("hydrates Board priority from canonical project metadata",()=>{
  const hydrated=hydrateProjectWorkspace(emptyState,[project()])
  expect(hydrated.projects["project-1"].priority).toBe("high")
 })

 it("preserves an existing Board override over the project default",()=>{
  const seeded:ProjectWorkspaceState={
   ...emptyState,
   projects:{
    "project-1":{
     projectId:"project-1",
     lane:"ideas",
     order:0,
     priority:"urgent",
     owner:"",
     tags:[],
     archived:false,
     updatedAt:"2026-09-21T00:00:00.000Z",
    },
   },
  }
  const hydrated=hydrateProjectWorkspace(seeded,[project()])
  expect(hydrated.projects["project-1"].priority).toBe("urgent")
 })

 it.each([
  ["ideas","ideation"],
  ["planned","planned"],
  ["in-progress","production"],
  ["review","review"],
  ["ready","ready"],
  ["blocked","blocked"],
  ["published","published"],
 ] as const)("maps Board lane %s to semantic project status %s",(lane,status)=>{
  expect(statusForLane(lane)).toBe(status)
 })
})
