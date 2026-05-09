import sys

path = "/Users/cwb/Downloads/viewtube/src/views/dashboard/WidgetRenderer.tsx"
with open(path, "r") as f:
    lines = f.readlines()

# Fix SuperfanCardWidget (Double close)
# Line 337 was </div>, 338 was </div>, 339 was </WidgetShell>
# We want to remove one </div>.
if "</div>" in lines[336] and "</div>" in lines[337] and "</WidgetShell>" in lines[338]:
    print("Fixing SuperfanCardWidget...")
    lines.pop(337)

# Fix mini-calendar (Missing close)
# New indices after pop
# Original line 844: <div ... gap: "8px" ...>
# Original line 897: </div>
# Original line 898: </WidgetShell>
# We want to add a </div> between 897 and 898.

# Finding the mini-calendar block
for i, line in enumerate(lines):
    if 'widget.id === "mini-calendar"' in line:
        start_idx = i
        break
else:
    start_idx = -1

if start_idx != -1:
    for i in range(start_idx, len(lines)):
        if "</WidgetShell>" in lines[i]:
            if "</div>" not in lines[i-1]:
                 # This might be tricky if indentation is off.
                 # Let's check the previous line.
                 pass
            print(f"Fixing mini-calendar at line {i+1}...")
            lines.insert(i, "    </div>\n")
            break

with open(path, "w") as f:
    f.writelines(lines)
print("Done.")
