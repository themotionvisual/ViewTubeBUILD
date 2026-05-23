import os
import re

GROUPS = {
    "analytics/MetricRegistry": [
        "metricAliasResolver",
        "dataCoverageCatalog",
        "dataCoverageInventory",
        "formulaRegistry",
        "channelDataGuideRegistry",
        "canonicalMetricResolver",
        "analyticsDatasetRegistry"
    ],
    "analytics/DataStore": [
        "canonicalAnalyticsStore",
        "analyticsContract",
        "canonicalStatsEngine",
        "unifiedSourceOfTruth"
    ],
    "analytics/Selectors": [
        "analyticsSelectors"
    ],
    "analytics/SyncPipeline": [
        "analyticsSyncRegistry",
        "analyticsRuntime",
        "analyticsCapabilityMatrix"
    ]
}

# Create reverse map mapping old basename to new basename path
remap = {}
for new_path, old_bases in GROUPS.items():
    for old_base in old_bases:
        remap[old_base] = new_path

SRC_DIR = "/Users/cwb/Downloads/viewtube/viewtubeX/src"

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # We need to replace imports of the old bases with the new ones.
    # An import could look like: import { ... } from "../services/analyticsContract"
    # or import { ... } from "./analyticsContract"
    # or import { ... } from "services/analyticsContract"
    
    lines = content.split('\n')
    out_lines = []
    changed = False
    
    for line in lines:
        if 'import ' in line or 'export ' in line:
            # Look for from "something" or from 'something'
            match = re.search(r'from\s+[\'"]([^\'"]+)[\'"]', line)
            if match:
                import_path = match.group(1)
                base = import_path.split('/')[-1]
                
                if base in remap:
                    new_base_path = remap[base] # e.g. analytics/DataStore
                    
                    # Compute the new path
                    # If it was "../services/analyticsContract", we want "../services/analytics/DataStore"
                    # If it was "./analyticsContract", we want "./analytics/DataStore" (if in services)
                    # or "../services/analytics/DataStore" if it was relying on paths being flat?
                    # Wait, if filepath is in `src/services`, and it imports `./analyticsContract`,
                    # then new path is `./analytics/DataStore`.
                    # If filepath is in `src/components`, and it imports `../services/analyticsContract`,
                    # then new path is `../services/analytics/DataStore`.
                    
                    # We can just replace the base with the new_base_path
                    new_import_path = '/'.join(import_path.split('/')[:-1] + [new_base_path])
                    # Fix cases where the original import had no slash: from "analyticsContract" (unlikely but possible)
                    if '/' not in import_path:
                        # Depending on where we are... if in services, it should be './analytics/DataStore'
                        if "src/services" in filepath:
                            new_import_path = "./" + new_base_path
                        else:
                            new_import_path = new_base_path
                            
                    # Remove redundant ./analytics/ if we are already inside analytics
                    if "src/services/analytics" in filepath:
                        if new_import_path.startswith("./analytics/"):
                            new_import_path = "./" + new_import_path.split("./analytics/")[1]
                        elif new_import_path.startswith("../services/analytics/"):
                            new_import_path = "../" + new_import_path.split("../services/analytics/")[1]
                            
                    new_line = line.replace(import_path, new_import_path)
                    if new_line != line:
                        changed = True
                    out_lines.append(new_line)
                    continue
        
        out_lines.append(line)
        
    if changed:
        with open(filepath, 'w') as f:
            f.write('\n'.join(out_lines))

for root, dirs, files in os.walk(SRC_DIR):
    for file in files:
        if file.endswith('.ts') or file.endswith('.tsx'):
            process_file(os.path.join(root, file))

print("Import fix complete!")
