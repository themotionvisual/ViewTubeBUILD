import re

with open("docs/Youtube API + Data/COMPILED_STATS.txt", "r", errors="ignore") as f:
    text = f.read()

# YouTube metrics often look like "estimatedMinutesWatched (watch_time_minutes)"
# Or list items like "- views"
items = set()

# Pattern 1: camelCaseName (snake_case_name)
matches1 = re.findall(r'([a-zA-Z]+)\s*\(([a-z_]+)\)', text)
for m in matches1:
    items.add((m[0], m[1]))

# Pattern 2: bullet point \u2022 camelCaseName
matches2 = re.findall(r'[\u2022\-\*]\s*([a-zA-Z_]+)', text)
for m in matches2:
    items.add((m, m))

with open("src/data/extracted_metrics.json", "w") as f:
    import json
    # serialize as JSON
    out = [{"name": i[0], "canonical": i[1]} for i in sorted(list(items), key=lambda x: x[0])]
    json.dump(out, f, indent=2)

print(f"Extracted {len(items)} metrics")
