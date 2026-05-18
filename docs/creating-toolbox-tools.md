---
name: creating-toolbox-tools
description: Use when adding or modifying interactive AI tools in the viewtubeX Studio Hub or Reference Studio views to ensure consistent Neo-Brutalist styling and structural compliance.
---

# Creating Toolbox Tools

## Overview
Tools in viewtubeX follow a strict "Neo-Brutalist" (Pop) aesthetic defined by thick black borders, offset shadows, and high-contrast palette colors. To maintain consistency, you MUST use the shared UI primitives and layout constants.

## Core Mandate
**NEVER use manual Tailwind classes for standard inputs, buttons, or layouts.** Always use the `toolboxSystem` constants.

## When to Use
- Adding a new tool to `StudioHub.tsx` or `ReferenceStudio.tsx`
- Refactoring existing tools to match the current design system
- Creating sub-toolboxes or nested components inside a tool

## Implementation Pattern

### 1. Structural Primitives (`src/components/Toolbox.tsx`)
- `ToolboxScaffold`: The top-level container for a tool. Handles the title, subtitle, icon, and collapse logic.
- `SubToolbox`: A nested container for specific input groups or result sections.
- `AccordionContainer`: Use for expandable lists of results (e.g., list of generated titles).

### 2. Layout Constants (`src/components/toolboxSystem.ts`)
Always use these constants for spacing and component styling:
- `toolboxSystem.shellRow`: The horizontal container for input/result split.
- `toolboxSystem.inputColumn`: The left column (typically 1/3 width) for inputs.
- `toolboxSystem.resultPanel`: The right panel (typically 2/3 width) for outputs.
- `toolboxSystem.inputBase`: The standard style for text inputs, textareas, and selects.
- `toolboxActionButton(color)`: A function that returns classes for the primary action button.

### 3. Iconography
- Use `CustomIcon` for the main `ToolboxScaffold` icon.
- Use `lucide-react` directly for smaller icons inside buttons or labels.

## Step-by-Step Guide
### Step 1: Component Scaffold
Create `src/views/MyNewTool.tsx` following this structure:

```tsx
import React, { useState } from "react"
import { Sparkles, Zap, Loader2 } from "lucide-react"
import { ToolboxScaffold, SubToolbox } from "../components/Toolbox"
import { toolboxSystem, toolboxActionButton } from "../components/toolboxSystem"
import { CustomIcon } from "../components/CustomIcon"

const MyNewTool: React.FC<{ 
  collapsible?: boolean
  isOpenInitial?: boolean
  paletteIndex?: number 
}> = ({ 
  collapsible = false, 
  isOpenInitial = true, 
  paletteIndex = 0 
}) => {
  const [isOpen, setIsOpen] = useState(isOpenInitial)
  const [loading, setLoading] = useState(false)

  return (
    <ToolboxScaffold
      title="MY TOOL"
      subtitle="Brief description of purpose"
      icon={<CustomIcon name="zap" size={40} />}
      headerColor="bg-[#CCFF00]" 
      iconBoxColor="bg-[#FF3399]"
      paletteIndex={paletteIndex}
      collapsible={collapsible}
      isOpen={isOpen}
      onToggle={() => setIsOpen(!isOpen)}
    >
```

      <div className={toolboxSystem.shellRow}>
        {/* Input Side */}
        <div className={toolboxSystem.inputColumn}>
          <SubToolbox title="Input Group" icon={<Sparkles size={20} />}>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className={toolboxSystem.label}>Target Niche</label>
                <input className={toolboxSystem.inputBase} placeholder="e.g. Cooking" />
              </div>
              <button className={toolboxActionButton("bg-[#CCFF00]")}>
                {loading ? <Loader2 className="animate-spin" /> : <Zap />}
                Generate
              </button>
            </div>
          </SubToolbox>
        </div>

        {/* Result Side */}
        <div className={toolboxSystem.resultPanel}>
          {/* Result cards or lists go here */}
        </div>
      </div>
    </ToolboxScaffold>
  )
}
```

### Step 2: Integration
Register the tool in `src/views/StudioHub.tsx`:
1. Import the component.
2. Add to the `Accordion Modules` section.
3. Assign a unique `paletteIndex`.

## Common Mistakes
- **Manual Borders**: Using `border-[4px]` instead of using components that provide them.
- **Color Drift**: Picking colors that aren't part of the "Pop" palette.
- **Inconsistent Shadows**: Using standard Tailwind `shadow-md` instead of the project's specific offset shadows (e.g., `shadow-[6px_6px_0px_0px_black]`).
- **Ignoring layout constants**: Not using `shellRow` or `inputColumn`, leading to misaligned tools.
