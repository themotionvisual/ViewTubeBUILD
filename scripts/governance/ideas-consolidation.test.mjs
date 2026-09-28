import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const registry=JSON.parse(fs.readFileSync('ideas/registry.json','utf8'));

test('ideas registry v2 maps every source item to one active master', () => {
  assert.equal(registry.schemaVersion,'viewtube.ideas-registry.v2');
  const masters=new Map((registry.ideas||[]).filter(i=>i.lifecycle==='MASTER').map(i=>[i.id,i]));
  const sourceIds=new Set();

  for(const sourceItem of registry.sourceItems||[]){
    assert.ok(!sourceIds.has(sourceItem.id),`duplicate source item ${sourceItem.id}`);
    sourceIds.add(sourceItem.id);
    assert.ok(masters.has(sourceItem.masterIdeaId),`${sourceItem.id} maps to missing/non-master ${sourceItem.masterIdeaId}`);
  }

  for(const source of registry.sourceLists||[]){
    const actual=(registry.sourceItems||[]).filter(item=>item.sourceListId===source.id).length;
    assert.equal(actual,source.itemCount,`${source.id} itemCount mismatch`);
  }
});

test('master requirements preserve every mapped source item', () => {
  const sourceItems=registry.sourceItems||[];
  for(const idea of (registry.ideas||[]).filter(i=>i.lifecycle==='MASTER')){
    const mapped=sourceItems.filter(item=>item.masterIdeaId===idea.id).map(item=>item.id).sort();
    const declared=[...(idea.sourceItemIds||[])].sort();
    assert.deepEqual(declared,mapped,`${idea.id} sourceItemIds mismatch`);

    const requirementSources=new Set((idea.requirements||[]).flatMap(req=>req.sourceItemIds||[]));
    for(const sourceId of mapped){
      assert.ok(requirementSources.has(sourceId),`${idea.id} does not retain requirement for ${sourceId}`);
    }
  }
});

test('merged idea aliases are reversible and never remain relationship endpoints', () => {
  const ideas=new Map((registry.ideas||[]).map(i=>[i.id,i]));
  for(const idea of registry.ideas||[]){
    if(idea.lifecycle!=='MERGED') continue;
    const survivor=ideas.get(idea.mergedInto);
    assert.ok(survivor,`${idea.id} missing survivor`);
    assert.equal(survivor.lifecycle,'MASTER',`${idea.id} points to non-master survivor`);
  }

  for(const relation of registry.relationshipDecisions||[]){
    assert.equal(ideas.get(relation.ideaA)?.lifecycle,'MASTER',`${relation.id} ideaA is not master`);
    assert.equal(ideas.get(relation.ideaB)?.lifecycle,'MASTER',`${relation.id} ideaB is not master`);
  }
});

test('operation convergence example preserves donor lineage', () => {
  const operation=(registry.ideas||[]).find(i=>i.id==='IDEA-APP-020');
  assert.equal(operation?.lifecycle,'MASTER');
  assert.ok(operation.mergedFromIdeaIds?.includes('IDEA-APP-021'));
  assert.ok(operation.mergedFromIdeaIds?.includes('IDEA-WFI-003'));
  assert.ok((operation.sourceItemIds||[]).length>=3);
});
