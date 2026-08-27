# ViewTube Universal Tool Handoffs + Suggested Chains

## Decision

Action packets and workflow chains are a ViewTube-wide protocol. They are not owned by unfinished Super Tools.

The first-class participants are the production Studio Hub tools that already exist: Video Manager, Video Publisher, Content Analysis, Thumbnail Studio, Community Posts, Comment Responder, End-Screen Architect, Pre-Launch Priming, Hook Generator, and Tactics Engine. The current Studio Hub mounts those ten tools directly. Super Tools, dashboard widgets, analytics visuals, Projects, Vault, Brain, and VT_E1 can join the same protocol as their integration points mature.

## Core model

`Tool or Widget -> ViewTubeActionPacket -> compatible destination -> result/artifact -> workflow/project -> Brain reflection`

A packet carries a typed payload, creator/channel/project/video context, evidence, provenance, and suggested destinations. It does not force a destination. The creator can accept a suggested next tool, choose another compatible destination, save the packet to Vault, or stop the chain.

## Immediate examples

1. Thumbnail Studio -> Video Publisher -> Video Manager
   - Send the approved thumbnail forward without re-uploading or reselecting it.
   - Preserve which Thumbnail Studio generation produced it.

2. Generated image -> Vault -> Community Posts
   - Any image generated in a ViewTube tool can become an image post or image-poll asset.
   - Vault is optional when the creator wants a direct handoff, but should preserve reusable assets.

3. Script -> Projects/Calendar -> Storyboard Studio -> VT_E1
   - A script can become a scheduled project, then a storyboard, then an editor timeline/input packet.
   - The script, storyboard, and generated assets can all be preserved in Vault.

4. Content Analysis -> Hook Generator -> Thumbnail Studio -> Pre-Launch Priming
   - The same evidence packet follows the creative decisions so the hook and thumbnail do not lose the reason they were proposed.

5. Comment Responder -> Brain -> Projects/Calendar
   - A useful audience request can become a content opportunity and then a scheduled project.

6. Video Manager -> Content Analysis -> End-Screen Architect -> Video Manager
   - Analyze a source video, select the strongest next-video destination, build the end-screen plan, and attach the plan back to the canonical video context.

7. Tactics Engine -> Hook Generator / Thumbnail Studio -> Projects
   - Convert strategy into a concrete experiment rather than leaving it as advice.

8. Vault -> VT_E1
   - Send images, B-roll, scripts, storyboards, audio, captions, or other production assets into the active editor context while retaining provenance.

## Suggested-chain UX

Every integrated tool should eventually expose a compact `SEND TO` / `NEXT` control after producing a useful output.

The menu should rank:
- recommended next step;
- other compatible tools;
- save to Vault;
- add to Project;
- ask Brain what to do next.

Suggested chains should be contextual rather than hard-coded navigation. A thumbnail should rank Publisher and Video Manager. A script should rank Project, Storyboard, Editor, and Vault. An image should rank Community Posts, Thumbnail Studio, Editor, and Vault. An analysis result should rank Brain, Tactics, Hook Generator, Thumbnail Studio, and Projects.

## Widgets

Dashboard widgets are not second-class. A widget may be:
- an evidence source;
- a packet producer;
- a packet consumer;
- a lightweight action/capability inside a chain.

Examples: an opportunity widget can send an opportunity to Projects; an audience-request widget can send a request to Brain or a script tool; a revival widget can send a selected video to Thumbnail Studio, Content Analysis, or Community Posts; a launch widget can receive the publish package and track its first 72 hours.

The widget registry should eventually declare `accepts`, `produces`, and `suggestedHandoffs` using the same payload vocabulary as Studio tools.

## Compatibility with existing Super Tool code

`superToolActionPackets.ts` remains valid for existing Super Tool callers. New production integrations should use the universal `ViewTubeActionPacket` contract in `src/services/viewTubeToolChains.ts`. Once enough consumers are migrated, `createSuperToolActionPacket()` can become a compatibility wrapper around the universal packet rather than a separate architecture.

## Safety and creator control

A chain recommendation is not permission to perform an external write. Sending context between ViewTube tools is an internal handoff. Posting a comment, publishing/uploading, modifying external data, or other external mutations must still pass the relevant creator approval and User Control gates.

## Next implementation section

1. Add a reusable `SendToMenu` UI component.
2. Wire Thumbnail Studio output -> Publisher / Video Manager / Vault.
3. Wire Community Posts to accept image packets.
4. Wire Video Manager selection -> Content Analysis / End-Screen Architect / Brain.
5. Wire Comment Responder audience requests -> Brain / Projects / Community Posts.
6. Wire script/storyboard outputs -> Projects / Storyboard / Editor / Vault.
7. Extend WidgetRegistry with handoff metadata.
8. Let Brain rank compatible destinations using channel profile + current project + evidence + User Controls.
9. Record accepted/rejected suggestions so Brain can learn preferred workflows when creator learning is enabled.
10. Add a workflow-chain viewer showing source, transformations, destination, artifacts, evidence, and current status.
