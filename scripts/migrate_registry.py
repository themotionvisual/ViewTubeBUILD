import sys

path = "src/views/dashboard/WidgetRegistry.ts"
with open(path, "r") as f:
    text = f.read()

lines = text.split('\n')
out = []
current_id = ""

for line in lines:
    import re
    id_match = re.search(r'id:\s*"([^"]+)"', line)
    if id_match:
        current_id = id_match.group(1)
        
    if "headerColor:" in line:
        default_h = "medium"
        min_h = "short"
        max_h = "tall"
        
        if current_id == "consistency-heatmap":
            default_h = "short"
            max_h = "short"
        elif current_id == "traffic-sources":
            default_h = "medium"
        elif current_id == "shorts-vs-long":
            min_h = "medium"
            
        indent = line.split("headerColor")[0]
        out.append(f'{indent}defaultHeight: "{default_h}",')
        out.append(f'{indent}minHeight: "{min_h}",')
        out.append(f'{indent}maxHeight: "{max_h}",')
        
    out.append(line)

with open(path, "w") as f:
    f.write('\n'.join(out))
    
print("WidgetRegistry updated with height buckets.")
