import os
import re

GROUPS = {
    "MetricRegistry.ts": [
        "metricAliasResolver.ts",
        "dataCoverageCatalog.ts",
        "dataCoverageInventory.ts",
        "formulaRegistry.ts",
        "channelDataGuideRegistry.ts",
        "canonicalMetricResolver.ts",
        "analyticsDatasetRegistry.ts"
    ],
    "DataStore.ts": [
        "canonicalAnalyticsStore.ts",
        "analyticsContract.ts",
        "canonicalStatsEngine.ts",
        "unifiedSourceOfTruth.ts"
    ],
    "Selectors.ts": [
        "analyticsSelectors.ts"
    ],
    "SyncPipeline.ts": [
        "analyticsSyncRegistry.ts",
        "analyticsRuntime.ts",
        "analyticsCapabilityMatrix.ts"
    ]
}

SRC_DIR = "/Users/cwb/Downloads/viewtube/viewtubeX/src/services"
OUT_DIR = os.path.join(SRC_DIR, "analytics")

if not os.path.exists(OUT_DIR):
    os.makedirs(OUT_DIR)

# Build a map of old_file -> new_file
file_map = {}
for new_file, old_files in GROUPS.items():
    for old_file in old_files:
        base = old_file.replace('.ts', '')
        file_map[base] = new_file.replace('.ts', '')
        file_map['./' + base] = new_file.replace('.ts', '')

# Helper to process a file
def process_file(filepath, current_target):
    with open(filepath, 'r') as f:
        content = f.read()

    # Find all imports
    lines = content.split('\n')
    out_lines = []
    
    in_import = False
    import_buffer = []
    
    for line in lines:
        if in_import:
            import_buffer.append(line)
            if 'from ' in line or 'from"' in line or "from '" in line:
                in_import = False
                out_lines.extend(process_import_statement('\n'.join(import_buffer), current_target))
                import_buffer = []
        elif line.startswith('import ') and ('from ' not in line and 'from"' not in line and "from '" not in line):
            in_import = True
            import_buffer.append(line)
        elif line.startswith('import '):
            out_lines.extend(process_import_statement(line, current_target))
        else:
            out_lines.append(line)
            
    return '\n'.join(out_lines)

def process_import_statement(stmt, current_target):
    # e.g., import { A } from './analyticsContract'
    match = re.search(r'from\s+[\'"]([^\'"]+)[\'"]', stmt)
    if not match:
        return [stmt]
    
    mod_path = match.group(1)
    
    # If it's importing from one of the files we are moving
    if mod_path in file_map:
        target = file_map[mod_path]
        if target == current_target:
            # Internal import, remove it
            return []
        else:
            # Cross-group import, update the path
            new_stmt = stmt.replace(mod_path, f"./{target}")
            return [new_stmt]
            
    # If it's a relative import to parent dir
    if mod_path.startswith('../'):
        new_stmt = stmt.replace(mod_path, f"../{mod_path}")
        return [new_stmt]
    elif mod_path.startswith('./'):
        # It's importing something else in src/services
        # We moved from src/services to src/services/analytics
        # So we need to prepend ../
        new_stmt = stmt.replace(mod_path, f"../{mod_path[2:]}")
        return [new_stmt]
        
    return [stmt]

for new_file, old_files in GROUPS.items():
    combined = []
    for old_file in old_files:
        old_path = os.path.join(SRC_DIR, old_file)
        if os.path.exists(old_path):
            combined.append(f"// --- BEGIN {old_file} ---")
            combined.append(process_file(old_path, new_file.replace('.ts', '')))
            combined.append(f"// --- END {old_file} ---\n")
    
    with open(os.path.join(OUT_DIR, new_file), 'w') as f:
        f.write('\n'.join(combined))

print("Merge complete!")
