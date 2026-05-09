import sys

path = "/Users/cwb/Downloads/viewtube/src/views/dashboard/WidgetRenderer.tsx"
with open(path, "r") as f:
    lines = f.readlines()

# Line numbers are 1-based, so subtract 1 for indices.
start_idx = 544 # Line 545
end_idx = 654   # Line 655

# Ensure we are at the right place
if 'if (widget.id === "consistency-heatmap") {' in lines[start_idx] or 'if (widget.id === "consistency-heatmap") {' in lines[544]:
    print(f"Found consistency-heatmap block at {start_idx+1}")
else:
    # Fallback search
    for i, line in enumerate(lines):
        if 'if (widget.id === "consistency-heatmap") {' in line:
            start_idx = i
            print(f"Found consistency-heatmap block at {start_idx+1} (fallback)")
            break
    else:
        print("Could not find start marker.")
        sys.exit(1)

# Find the end marker (the ad-stack-intelligence if block)
ad_stack_idx = -1
for i in range(start_idx, len(lines)):
    if 'if (widget.id === "ad-stack-intelligence") {' in lines[i]:
        ad_stack_idx = i
        break

if ad_stack_idx == -1:
    print("Could not find ad-stack-intelligence marker.")
    sys.exit(1)

# The end of the corrupted block is everything before ad_stack_idx
# and some whitespace.

new_segment = [
    '   // 29.5 UPLOAD CONSISTENCY\n',
    '   if (widget.id === "consistency-heatmap") {\n',
    '    const cDays = data.consistencyDays || []\n',
    '    return (\n',
    '     <WidgetShell {...common} title="UPLOAD CONSISTENCY" icon={<CalendarDays size={22} />}>\n',
    '      <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between", padding: "4px" }}>\n',
    '       <span style={{ fontSize: "10px", fontWeight: 1000, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>\n',
    '        Last 14 Days\n',
    '       </span>\n',
    '       <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 28px)", gap: "6px", marginBottom: "auto" }}>\n',
    '        {cDays.map((day) => {\n',
    '         let bgStyle = "#f5f5f5"\n',
    '         let brdStyle = "1.5px solid #000"\n',
    '         let brdDashed = false\n',
    '         \n',
    '         if (day.active) {\n',
    '          if (day.hasLong && day.hasShort) bgStyle = "#4FFF5B"\n',
    '          else if (day.hasLong) bgStyle = "#00D2FF"\n',
    '          else if (day.hasShort) bgStyle = "#FFE32E"\n',
    '         } else if (day.isToday) {\n',
    '          bgStyle = "transparent"\n',
    '          brdStyle = "2.5px solid #FF3399"\n',
    '         } else if (day.isFuture) {\n',
    '          bgStyle = "transparent"\n',
    '          brdStyle = "1.5px solid #000"\n',
    '          brdDashed = true\n',
    '         }\n',
    '         \n',
    '         return (\n',
    '          <div key={day.dateStr} style={{ \n',
    '           width: "28px",\n',
    '           height: "28px",\n',
    '           background: bgStyle, \n',
    '           border: brdStyle, \n',
    '           borderStyle: brdDashed ? "dashed" : "solid",\n',
    '           borderRadius: "6px",\n',
    '           display: "flex", alignItems: "center", justifyContent: "center",\n',
    '           position: "relative"\n',
    '          }}>\n',
    '           {day.isToday && (\n',
    '             <span style={{ fontSize: "6px", fontWeight: 1000, color: "#FF3399", textTransform: "uppercase", position: "absolute", bottom: "2px" }}>Today</span>\n',
    '           )}\n',
    '          </div>\n',
    '         )\n',
    '        })}\n',
    '       </div>\n',
    '       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "8px" }}>\n',
    '        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>\n',
    '         <div style={{ width: "10px", height: "10px", background: "#00D2FF", border: "1.5px solid #000", borderRadius: "2px" }} />\n',
    '         <span style={{ fontSize: "8px", fontWeight: 1000, textTransform: "uppercase" }}>Long</span>\n',
    '        </div>\n',
    '        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>\n',
    '         <div style={{ width: "10px", height: "10px", background: "#FFE32E", border: "1.5px solid #000", borderRadius: "2px" }} />\n',
    '         <span style={{ fontSize: "8px", fontWeight: 1000, textTransform: "uppercase" }}>Short</span>\n',
    '        </div>\n',
    '        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>\n',
    '         <div style={{ width: "10px", height: "10px", background: "#4FFF5B", border: "1.5px solid #000", borderRadius: "2px" }} />\n',
    '         <span style={{ fontSize: "8px", fontWeight: 1000, textTransform: "uppercase" }}>Both</span>\n',
    '        </div>\n',
    '       </div>\n',
    '      </div>\n',
    '     </WidgetShell>\n',
    '    )\n',
    '   }\n',
    '\n'
]

# Replacement
final_lines = lines[:start_idx] + new_segment + lines[ad_stack_idx:]

with open(path, "w") as f:
    f.writelines(final_lines)
print("WidgetRenderer.tsx repaired successfully.")
