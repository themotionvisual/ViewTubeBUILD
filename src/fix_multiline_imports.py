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

remap = {}
for new_path, old_bases in GROUPS.items():
    for old_base in old_bases:
        remap[old_base] = new_path

SRC_DIR = "/Users/cwb/Downloads/viewtube/viewtubeX/src"

def process_file(filepath):
    # ignore backup directory
    if "src/services_backup" in filepath or filepath.endswith(".backup") or " copy" in filepath:
        return
        
    with open(filepath, 'r') as f:
        content = f.read()

    changed = False
    
    # We look for all occurrences of `from "../services/analyticsSelectors"` etc.
    # regex matches: from<whitespace>['"]<path>['"]
    # The path will be something like ../services/analyticsSelectors or ./analyticsContract
    
    def replacer(match):
        nonlocal changed
        full_match = match.group(0)
        import_path = match.group(1)
        base = import_path.split('/')[-1]
        
        if base in remap:
            new_base_path = remap[base]
            
            # Reconstruct the new path
            new_import_path = '/'.join(import_path.split('/')[:-1] + [new_base_path])
            if '/' not in import_path:
                if "src/services" in filepath:
                    new_import_path = "./" + new_base_path
                else:
                    new_import_path = new_base_path
                    
            if "src/services/analytics" in filepath:
                if new_import_path.startswith("./analytics/"):
                    new_import_path = "./" + new_import_path.split("./analytics/")[1]
                elif new_import_path.startswith("../services/analytics/"):
                    new_import_path = "../" + new_import_path.split("../services/analytics/")[1]
                    
            if new_import_path != import_path:
                changed = True
                return full_match.replace(import_path, new_import_path)
                
        return full_match

    new_content = re.sub(r'from\s+[\'"]([^\'"]+)[\'"]', replacer, content)
    
    if changed:
        with open(filepath, 'w') as f:
            f.write(new_content)

for root, dirs, files in os.walk(SRC_DIR):
    for file in files:
        if file.endswith('.ts') or file.endswith('.tsx'):
            process_file(os.path.join(root, file))

print("Multiline import fix complete!")
