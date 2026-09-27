import test from 'node:test';
import assert from 'node:assert/strict';
import {
  similarityScore,
  findSimilarRecords,
  chooseConvergenceAction,
  consolidateIdeas,
  evaluateCapabilityCoverage,
  validateWorkPacket,
} from './convergence.mjs';

test('findSimilarRecords clusters semantically overlapping plans', () => {
  const records = [
    { id:'PLAN-WIDGET-A', title:'Widget primitive mobile responsiveness', summary:'Fix mobile widget overflow and shared primitive sizing', capabilityIds:['CAP-WIDGET-SURFACES'] },
    { id:'PLAN-WIDGET-B', title:'Responsive widget primitive cleanup', summary:'Standardize widget primitive sizing and prevent mobile overflow', capabilityIds:['CAP-WIDGET-SURFACES'] },
    { id:'PLAN-VAULT', title:'Vault import station', summary:'Batch asset import and metadata', capabilityIds:['CAP-ASSET-LINEAGE'] },
  ];
  const hits = findSimilarRecords(records[0], records.slice(1), { threshold:0.35 });
  assert.equal(hits.length, 1);
  assert.equal(hits[0].record.id, 'PLAN-WIDGET-B');
  assert.ok(hits[0].score >= 0.35);
});

test('chooseConvergenceAction prefers reuse over creating a new system', () => {
  assert.equal(chooseConvergenceAction({ similarity:0.86, sameCapability:true, sameOwner:true }), 'MERGE');
  assert.equal(chooseConvergenceAction({ similarity:0.62, sameCapability:true, sameOwner:false }), 'ADAPT');
  assert.equal(chooseConvergenceAction({ similarity:0.18, sameCapability:false, sameOwner:false }), 'CREATE_REVIEW');
});

test('consolidateIdeas merges duplicates and preserves all provenance', () => {
  const ideas = [
    { id:'IDEA-1', title:'Mobile widget overflow audit', summary:'Audit widget mobile overflow', category:'Widgets', subcategory:'Responsive', capabilityIds:['CAP-WIDGET-SURFACES'], sourceRefs:['conversation:A'] },
    { id:'IDEA-2', title:'Audit mobile overflow in widgets', summary:'Find responsive overflow problems in widgets', category:'Widgets', subcategory:'Responsive', capabilityIds:['CAP-WIDGET-SURFACES'], sourceRefs:['conversation:B'] },
    { id:'IDEA-3', title:'Vault duplicate finder', summary:'Find duplicate assets in Vault', category:'Vault', subcategory:'Cleanup', capabilityIds:['CAP-ASSET-LINEAGE'], sourceRefs:['plan:C'] },
  ];
  const result = consolidateIdeas(ideas, { threshold:0.34 });
  assert.equal(result.groups.length, 2);
  const widget = result.groups.find(g => g.capabilityIds.includes('CAP-WIDGET-SURFACES'));
  assert.deepEqual(new Set(widget.sourceIdeaIds), new Set(['IDEA-1','IDEA-2']));
  assert.deepEqual(new Set(widget.sourceRefs), new Set(['conversation:A','conversation:B']));
});

test('evaluateCapabilityCoverage reports missing governance surfaces', () => {
  const result = evaluateCapabilityCoverage({
    id:'CAP-X', authority:'docs/x.md', codeOwners:['src/x/**'], taskRefs:[], tests:[], uiSurfaces:['X'], guideRefs:[], verificationRefs:[]
  });
  assert.equal(result.complete, false);
  assert.ok(result.missing.includes('taskRefs'));
  assert.ok(result.missing.includes('tests'));
  assert.ok(result.missing.includes('guideRefs'));
  assert.ok(result.missing.includes('verificationRefs'));
});

test('validateWorkPacket requires capability routing and prior-art evidence', () => {
  const issues = validateWorkPacket({
    packetId:'VT-WORK-1', title:'Build another widget tool', capabilityIds:[], existingWorkChecked:[], convergenceDecision:null
  });
  assert.ok(issues.includes('capabilityIds'));
  assert.ok(issues.includes('existingWorkChecked'));
  assert.ok(issues.includes('convergenceDecision'));
});

test('similarityScore rewards same capability and shared implementation concepts', () => {
  const score = similarityScore(
    {title:'Thumbnail package experiment manager',summary:'ABC title thumbnail experiment variants',capabilityIds:['CAP-PACKAGING']},
    {title:'Packaging experiment lab',summary:'title and thumbnail A/B/C variants and experiment outcomes',capabilityIds:['CAP-PACKAGING']}
  );
  assert.ok(score > 0.4);
});
