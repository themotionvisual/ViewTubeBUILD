import sys

path = "/Users/cwb/Downloads/viewtube/src/views/dashboard/WidgetRenderer.tsx"
with open(path, "r") as f:
    text = f.read()

# Target block for consistency-heatmap
start_marker = 'if (widget.id === "consistency-heatmap") {'
end_marker = '   }' # end of the if block

# Find the block
start_idx = text.find(start_marker)
if start_idx != -1:
    # Find the closing brace of the if block
    # We look for the next '   }' after the return (
    return_idx = text.find('return (', start_idx)
    close_idx = text.find('   }', return_idx)
    
    # New content matching Image 1
    new_block = """  if (widget.id === "consistency-heatmap") {
    const cDays = data.consistencyDays || []
    return (
     <WidgetShell {...common} title="UPLOAD CONSISTENCY" icon={<CalendarDays size={22} />}>
      <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between", padding: "4px" }}>
       <span style={{ fontSize: "10px", fontWeight: 1000, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
        Last 14 Days
       </span>
       <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 28px)", gap: "6px", marginBottom: "auto" }}>
        {cDays.map((day) => {
         let bgStyle = "#f5f5f5"
         let brdStyle = "1.5px solid #000"
         let brdDashed = false
         
         if (day.active) {
          if (day.hasLong && day.hasShort) bgStyle = "#4FFF5B"
          else if (day.hasLong) bgStyle = "#00D2FF"
          else if (day.hasShort) bgStyle = "#FFE32E"
         } else if (day.isToday) {
          bgStyle = "transparent"
          brdStyle = "2.5px solid #FF3399"
         } else if (day.isFuture) {
          bgStyle = "transparent"
          brdStyle = "1.5px solid #000"
          brdDashed = true
         }
         
         return (
          <div key={day.dateStr} style={{ 
           width: "28px",
           height: "28px",
           background: bgStyle, 
           border: brdStyle, 
           borderStyle: brdDashed ? "dashed" : "solid",
           borderRadius: "6px",
           display: "flex", alignItems: "center", justifyContent: "center",
           position: "relative"
          }}>
           {day.isToday && (
             <span style={{ fontSize: "6px", fontWeight: 1000, color: "#FF3399", textTransform: "uppercase", position: "absolute", bottom: "2px" }}>Today</span>
           )}
          </div>
         )
        })}
       </div>
       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
         <div style={{ width: "10px", height: "10px", background: "#00D2FF", border: "1.5px solid #000", borderRadius: "2px" }} />
         <span style={{ fontSize: "8px", fontWeight: 1000, textTransform: "uppercase" }}>Long</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
         <div style={{ width: "10px", height: "10px", background: "#FFE32E", border: "1.5px solid #000", borderRadius: "2px" }} />
         <span style={{ fontSize: "8px", fontWeight: 1000, textTransform: "uppercase" }}>Short</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
         <div style={{ width: "10px", height: "10px", background: "#4FFF5B", border: "1.5px solid #000", borderRadius: "2px" }} />
         <span style={{ fontSize: "8px", fontWeight: 1000, textTransform: "uppercase" }}>Both</span>
        </div>
       </div>
      </div>
     </WidgetShell>
    )
  }"""
    
    # Replace
    new_text = text[:start_idx] + new_block + text[close_idx+4:]
    with open(path, "w") as f:
        f.write(new_text)
    print("Consistency Heatmap block replaced.")
else:
    print("Could not find start marker.")
    sys.exit(1)
