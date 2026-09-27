# Toolbox / Workflow Candidate Map

**Status:** proposal-only reconciliation map  
**Baseline:** 3ed2bc91f324338fd110a160d65ddbed93806142  
**Permanent Task IDs:** intentionally not allocated

| Candidate | Work family | Existing authority / prior art | Proposed relationship | Primary acceptance |
| --- | --- | --- | --- | --- |
| C1 | Widget → Toolbox promotion contract | Widget Master + Toolbox UI Master | EXTEND | shared open/resume/context contract used by 2+ pairs |
| C2 | Registry handoff metadata | Universal Tool Handoffs + VIEWTUBE_TOOL_CAPABILITIES + WidgetRegistry | EXTEND / PARTIAL | accepts/produces already exist; add required-context/mutation/resume + WidgetRegistry bridge |
| C3 | Universal operation identity | ActionPacket → GenerationRecord/Vault/ContentBuild foundation + system convergence | CONTINUATION / PARTIAL | existing receipts converge on one operation/workflow identity |
| C4 | Workflow recipe registry | 8 existing VIEWTUBE_SUGGESTED_TOOL_CHAINS + new specification | EXTEND / PARTIAL | forty recipes generalize existing templates and remain non-task records |
| C5 | Workflow chain viewer | WorkflowChainBuilder + workflowEngine + universal handoff receipts | CONVERGE / PARTIAL | existing chain UI shows exact packet/artifact/evidence/outcome trace |
| C6 | Brain destination ranking | rankWorkflowTargets preference ranking + Brain/context systems | CONTINUATION / PARTIAL | add bounded Project/evidence/required-context ranking with manual override |
| C7 | Handoff preference feedback | viewTubeWorkflowLearning + SendToMenu | IMPLEMENTED FOUNDATION / CONNECT | accepted/rejected signals already gated; certify + connect to governed outcomes |
| C8 | Core tool promotion wave | Widget Master consolidation + existing Studio tools | MERGE / RESTRUCTURE | explicit widget/toolbox capability matrices and no duplicate owners |
| C9 | Domain workbench consolidation | Widget Master section 4 | CONTINUATION | absorbed capabilities retain owners and persisted-layout migration |
| C10 | Identity continuity certification | Projects/ContentBuild + Asset Engine + ActionPacket | VERIFICATION / INTEGRATION | exact IDs survive supported handoffs |
| C11 | Outcome/evaluation closure | Integrated Application + Outcomes/Learning | CONTINUATION | consequential chain closes action→outcome→evaluation |
| C12 | Responsive/state certification | Widget Master + Toolbox UI + Verification | CONTINUATION | desktop/narrow/portrait/landscape/state matrix verified |

## Promotion candidate disposition targets

| Surface/family | Likely disposition before audit |
| --- | --- |
| UI Reference Library | PROMOTE_TOOLBOX / reduce Dashboard footprint |
| Video Director | WIDGET_PLUS_TOOLBOX |
| Video Publisher | WIDGET_PLUS_TOOLBOX |
| Video Manager | WIDGET_PLUS_TOOLBOX |
| Video Autopsy | WIDGET_PLUS_TOOLBOX |
| Daily Oracle | WIDGET_PLUS_TOOLBOX |
| Brain Hub | WIDGET_PLUS_TOOLBOX |
| Comment Responder / Operator | MERGE_WORKBENCH + compact widget |
| Longform Optimization | WIDGET_PLUS_TOOLBOX or merge into optimization workbench |
| Video Asset Engine | WIDGET_PLUS_TOOLBOX |
| Thumbnail Lab / ThumbAI / A-B | MERGE_WORKBENCH + compact widget |
| Settings widget | KEEP_WIDGET + existing Settings workspace handoff |
| Metadata/SEO family | MERGE_WORKBENCH |
| Retention family | MERGE_WORKBENCH |
| Keyword family | MERGE_WORKBENCH |
| Calendar/scheduler family | MERGE_WORKBENCH |
| Audience segmentation family | MERGE_WORKBENCH |
| Discovery/distribution family | MERGE_WORKBENCH |
| Monetization family | MERGE_WORKBENCH |
| Opportunity Radar | KEEP_WIDGET + full Opportunity Intelligence workbench |

These are audit hypotheses, not final dispositions.

## Recipe-to-work-family compression

The forty workflow recipes mainly exercise seven reusable seams:

1. evidence/opportunity → Project;
2. Project/script/storyboard → assets/editor;
3. editor/timeline → generation → canonical asset → editor;
4. package/variant → Publisher/Manager;
5. published snapshot → analytics → evaluation;
6. comments/audience → Brain/Project/Community;
7. asset/package slot → Vault reuse or conditional generation.

Implementation should strengthen those seams first. A recipe that can run over existing seams should not receive bespoke architecture.
