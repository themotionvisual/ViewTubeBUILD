import fs from 'node:fs';
import { evaluateCapabilityCoverage } from './convergence.mjs';

const caps=JSON.parse(fs.readFileSync('docs/architecture/capabilities.json','utf8'));
const owners=JSON.parse(fs.readFileSync('governance/convergence/code-ownership.json','utf8'));
const homes=JSON.parse(fs.readFileSync('governance/convergence/capability-homes.json','utf8'));

const records=caps.capabilities.map(cap=>{
  const ownership=owners.records.filter(r=>(r.capabilityIds||[]).includes(cap.id));
  const home=homes.homes.find(h=>h.capabilityId===cap.id);
  const record={
    id:cap.id,
    name:cap.name,
    authority:cap.authority,
    home:home?.path||null,
    codeOwners:[...new Set(ownership.flatMap(r=>r.patterns||[]))],
    taskRefs:[],
    tests:[],
    uiSurfaces:cap.masterTools||[],
    guideRefs:[],
    verificationRefs:[],
  };
  return {...record,...evaluateCapabilityCoverage(record),lastAudited:'2026-09-27'};
});

fs.writeFileSync('governance/convergence/capability-coverage.json',JSON.stringify({
  schemaVersion:'viewtube.capability-coverage.v1',
  lastEdited:'2026-09-27',
  source:'docs/architecture/capabilities.json',
  capabilities:records
},null,2)+'\n');
