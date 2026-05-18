"use client"

import React from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { LucideIcon, LayoutGrid, Type, Layers, Navigation, Box, MessageSquare, LineChart } from "lucide-react"
import * as AimodelselectorPrimitives from "@/components/ui/AIModelSelector"
import * as ChanneltreePrimitives from "@/components/ui/ChannelTree"
import * as DailystatsPrimitives from "@/components/ui/DailyStats"
import * as FormfieldPrimitives from "@/components/ui/FormField"
import * as KpistatcardPrimitives from "@/components/ui/KPIStatCard"
import * as StylechipPrimitives from "@/components/ui/StyleChip"
import * as TogglePrimitives from "@/components/ui/Toggle"
import * as VideocardPrimitives from "@/components/ui/VideoCard"
import * as AccordionPrimitives from "@/components/ui/accordion"
import * as AlertPrimitives from "@/components/ui/alert"
import * as AlertDialogPrimitives from "@/components/ui/alert-dialog"
import * as AspectRatioPrimitives from "@/components/ui/aspect-ratio"
import * as AvatarPrimitives from "@/components/ui/avatar"
import * as BadgePrimitives from "@/components/ui/badge"
import * as BreadcrumbPrimitives from "@/components/ui/breadcrumb"
import * as ButtonPrimitives from "@/components/ui/button"
import * as ButtonGroupPrimitives from "@/components/ui/button-group"
import * as CalendarPrimitives from "@/components/ui/calendar"
import * as CardPrimitives from "@/components/ui/card"
import * as CarouselPrimitives from "@/components/ui/carousel"
import * as ChartPrimitives from "@/components/ui/chart"
import * as CheckboxPrimitives from "@/components/ui/checkbox"
import * as CollapsiblePrimitives from "@/components/ui/collapsible"
import * as CommandPrimitives from "@/components/ui/command"
import * as ContextMenuPrimitives from "@/components/ui/context-menu"
import * as DialogPrimitives from "@/components/ui/dialog"
import * as DrawerPrimitives from "@/components/ui/drawer"
import * as DropdownMenuPrimitives from "@/components/ui/dropdown-menu"
import * as EmptyPrimitives from "@/components/ui/empty"
import * as FieldPrimitives from "@/components/ui/field"
import * as FormPrimitives from "@/components/ui/form"
import * as HoverCardPrimitives from "@/components/ui/hover-card"
import * as InputPrimitives from "@/components/ui/input"
import * as InputGroupPrimitives from "@/components/ui/input-group"
import * as InputOtpPrimitives from "@/components/ui/input-otp"
import * as ItemPrimitives from "@/components/ui/item"
import * as KbdPrimitives from "@/components/ui/kbd"
import * as LabelPrimitives from "@/components/ui/label"
import * as MenubarPrimitives from "@/components/ui/menubar"
import * as NavigationMenuPrimitives from "@/components/ui/navigation-menu"
import * as PaginationPrimitives from "@/components/ui/pagination"
import * as PopoverPrimitives from "@/components/ui/popover"
import * as ProgressPrimitives from "@/components/ui/progress"
import * as RadioGroupPrimitives from "@/components/ui/radio-group"
import * as ResizablePrimitives from "@/components/ui/resizable"
import * as ScrollAreaPrimitives from "@/components/ui/scroll-area"
import * as SelectPrimitives from "@/components/ui/select"
import * as SeparatorPrimitives from "@/components/ui/separator"
import * as SheetPrimitives from "@/components/ui/sheet"
import * as SidebarPrimitives from "@/components/ui/sidebar"
import * as SkeletonPrimitives from "@/components/ui/skeleton"
import * as SliderPrimitives from "@/components/ui/slider"
import * as SonnerPrimitives from "@/components/ui/sonner"
import * as SpinnerPrimitives from "@/components/ui/spinner"
import * as SwitchPrimitives from "@/components/ui/switch"
import * as TablePrimitives from "@/components/ui/table"
import * as TabsPrimitives from "@/components/ui/tabs"
import * as TextareaPrimitives from "@/components/ui/textarea"
import * as ToastPrimitives from "@/components/ui/toast"
import * as ToasterPrimitives from "@/components/ui/toaster"
import * as ToggleGroupPrimitives from "@/components/ui/toggle-group"
import * as TooltipPrimitives from "@/components/ui/tooltip"


const CATEGORIES: Record<string, string[]> = {
    "Primitives": ["button", "badge", "kbd", "skeleton", "spinner", "separator"],
    "Form Elements": ["input", "textarea", "select", "checkbox", "radio-group", "switch", "slider", "input-otp", "input-group", "field", "label"],
    "Layout & Structure": ["card", "sidebar", "table", "tabs", "accordion", "collapsible", "resizable", "aspect-ratio", "breadcrumb", "pagination"],
    "Navigation": ["navigation-menu", "menubar", "dropdown-menu", "context-menu"],
    "Overlays": ["dialog", "alert-dialog", "sheet", "drawer", "popover", "tooltip", "hover-card", "command"],
    "Feedback & Status": ["progress", "toast", "alert", "empty"],
    "Advanced": ["chart", "calendar", "carousel"]
}

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "Primitives": LayoutGrid,
  "Form Elements": Type,
  "Layout & Structure": Layers,
  "Navigation": Navigation,
  "Overlays": Box,
  "Feedback & Status": MessageSquare,
  "Advanced": LineChart
}

export default function ComponentAudit() {
  return (
    <div className="dashboard-barrier flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar Navigation */}
      <div className="w-64 border-r bg-muted/30 flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-xl font-black uppercase tracking-tighter">Library Audit</h1>
          <p className="text-xs text-muted-foreground font-bold">55 PRIMITIVES • HARD-SHARP SYSTEM</p>
        </div>
        <ScrollArea className="flex-1 p-4">
          <nav className="space-y-2">
            {Object.keys(CATEGORY_ICONS).map(cat => {
              const Icon = CATEGORY_ICONS[cat];
              return (
                <button key={cat} className="flex items-center gap-3 w-full px-3 py-2 text-sm font-bold rounded-md hover:bg-accent transition-colors">
                  <Icon size={16} />
                  {cat}
                </button>
              )
            })}
          </nav>
        </ScrollArea>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden flex flex-col">
        <header className="h-16 border-b bg-background flex items-center px-8 justify-between">
          <div className="flex items-center gap-4">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-black uppercase">Visual Fidelity: 100%</span>
          </div>
          <Button size="sm" variant="outline">Export Specs</Button>
        </header>
        
        <ScrollArea className="flex-1">
          <div className="p-8 space-y-12 max-w-6xl mx-auto">
            {Object.entries(CATEGORIES).map(([category, components]) => (
              <section key={category} className="space-y-6">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-black uppercase tracking-tight">{category}</h2>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {components.map(comp => (
                    <Card key={comp} className="overflow-hidden border-2">
                      <CardHeader className="bg-muted/50 py-3 border-b">
                        <CardTitle className="text-xs font-mono uppercase opacity-70">
                          {comp}.tsx
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6 flex flex-wrap gap-4 items-center justify-center min-h-[120px]">
                        {/* Component visualization placeholder - would be populated with actual variant loops */}
                        {comp === "button" ? <Button>Sample Button</Button> : <div className="text-sm font-bold text-muted-foreground italic">Interactive Preview Pending...</div>}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </ScrollArea>
      </main>
    </div>
  )
}
