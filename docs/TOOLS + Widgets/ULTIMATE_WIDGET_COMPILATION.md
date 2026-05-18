# 🧩 THE DEFINITIVE VIEWTUBE WIDGET COMPENDIUM

> [!IMPORTANT]
> This document is the ultimate compilation of all widget-related knowledge, code, design rules, and future plans scraped from across the entire ViewTube workspace, plans, and active source code.

## 1. WIDGET ARCHITECTURE & CLASSIFICATIONS

Widgets in ViewTube serve to surface the highest-value functions as lightweight, instantly readable modules. They are structured generally as a lightweight “widget mode” route pulling their needed operations directly from the `GlobalDataContext` (e.g., `useBrain`).

:::sub By Complexity & Size
- **Micro Widgets** (< 100 lines): Simple display elements
- **Small Widgets** (100-300 lines): Interactive components
- **Medium Widgets** (300-500 lines): Complex functionality
- **Large Widgets** (500+ lines): Near-tool complexity
:::

:::sub By Function Type
- **Display**: Purely shows info (e.g., View/Sub Counters).
- **Input / Action**: Triggers operations (e.g., Search Bar, Notifications).
- **Navigation**: Guide user flow (e.g., Sidebar, Quick Actions).
- **Status**: Visual state indicators (e.g., Sync Status, Brain Link Row).
:::

---

## 2. LIVE IMPLEMENTATION SHOWCASE (ACTIVE WIDGETS)

Code analysis of the widget implementations reveals the execution of high-octane UI elements. Two major examples currently exist in the codebase:

:::sub 🌟 MiniCalendarWidget 
A complex 14-day telemetry and protocol tracker running out of a user footprint component.
* **Component Features**:
  - Live clock updater (Updates every 60 seconds).
  - 14-day "Telemetry Ribbon" mapped against the Calendar state inside `GlobalDataContext`.
  - A summary card for "Active Protocol" highlighting current day tasks.
  - Neo-brutalist avatar frame (`#CCFF00` highlights, black thick borders).
* **Technical Takeaways**:
  - Integrates direct mapping to `brain.calendarState?.dayTasks`.
  - Uses clever rotating hover classes and custom `custom-scrollbar` overflow arrays.
:::

:::sub 🌟 DailyAdviceWidget
AI-Driven Oracle component delivering distinct strategic insights using Gemini models.
* **Component Features**:
  - Requires Gemini API key; falls back to an offline "AlertTriangle" warning smoothly if unavailable.
  - Caches tip generation in `localStorage` (`vt_daily_oracle_advice` and timestamp) to avoid over-pinging.
  - Displays exactly 5 actionable single-sentence tips based on channel sub counts and total views tracking.
  - Generates UI paths dynamically so the user gets routed accurately per advice (e.g., `/shorts` or `/studio`).
* **Technical Takeaways**:
  - Exceptional use of prompt engineering strictly limiting output mapping to colors (`#FF83EA, #FF8AAF, #FFB570, #FFFF61, #4FFF5B, #40C6E9, #579AFF, #CC00FF`).
  - Utilizes markdown parser cleanup before running `JSON.parse` manually to prevent breakages.
:::

---

## 3. DESKTOP WIDGET CONCEPTS (PLANNED)

*Source: `VIEWTUBE_PLANS/08_DESKTOP_WIDGETS.md`*

The next tier of development aims to convert specific high-yield web components into standalone functional desktop widgets:
1. **Daily Metrics Tile**: At-a-glance views, subs, revenue, and watch hours.
2. **Upload Checklist**: Rapid-fire tracking of steps needed to publish the next video.
3. **Hook Generator Mini**: Quick drafting and iteration of video hooks.
4. **Thumbnail Score**: Instant drag-and-drop rating and AI tips.
5. **Comment Reply Drafts**: Quick access to latest un-reviewed AI drafts.

---

## 4. UI / UX DESIGN STANDARD: NEO-BRUTALISM

Widgets must adhere strictly to the Neo-Brutalist design mandate ensuring consistency.

### Widget CSS Standards
```css
/* Core Structural Shell */
.widget-container {
  @apply border-[4px] border-black rounded-[2rem];
  @apply shadow-[6px_6px_0px_0px_black];
  @apply bg-white dark:bg-gray-900;
  @apply p-4;
}

/* Hard-Edge Headers */
.widget-header {
  @apply font-[1000] uppercase tracking-tighter;
  @apply text-lg mb-3;
  @apply border-b-[3px] border-black pb-2;
}

/* Button Interactives */
.widget-button {
  @apply border-[3px] border-black rounded-xl;
  @apply shadow-[4px_4px_0px_0px_black];
  @apply hover:shadow-[2px_2px_0px_0px_black] hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-[#CCFF00];
  @apply transition-all duration-75;
}
```

**Core Widget Priority Palette**:
- **Primary**: `#ff3399` (Hot Pink)
- **Secondary**: `#ccff00` (Neon Green)
- **Accent**: `#00ccff` (Cyan)

---

## 5. LAUNCH READINESS & PERFORMANCE PROTOCOLS

*Source: `VIEWTUBE_PLANS/01_LAUNCH_READINESS.md`*

Before launch, Dashboard Widgets and all subsidiary tool components must follow these guardrails:
- **Empty States**: ALL widgets that do not have active user data MUST render a "clean empty state". Empty states typically feature a desaturated call-to-action or subtle placeholder rather than throwing null or leaving voids (`MiniCalendarWidget`'s "No Directives" state natively serves as a benchmark here).
- **Bundle Limits**: Heavy widgets should remain beneath ~50KB gzipped.
- **Lazy Loading**: Non-core/offscreen widgets should use lazy loading where possible. Render limits are < 50ms for small components.
- **Quota Risk**: AI/API-heavy widgets (like the `DailyAdviceWidget`) *must* employ caching strategies to survive quota ceilings.

---

## 6. THE REGISTRY INVENTORY (45+ KNOWN WIDGETS)

*Abstracted from `VIEWTUBE_WIDGETS_INVENTORY.md`*

### Phase 1: Launch Critical 
1. **Mini Calendar Widget** (`src/components/MiniCalendarWidget.tsx`)
2. **Daily Advice Widget** (`src/components/DailyAdviceWidget.tsx`)
3. **Sidebar / Tool Header / Modal Dialog / Loading & Empty States**
4. **Brain Link Row / Error Boundary / Icon System**

### Phase 2: High Priority (Analytics & UI)
- Notification Bell, Search Bar, Quick Actions
- Sparkline Widget, Gauge Widget, Progress Ring, Data Refresh

### Phase 3: Medium Priority 
- Thumbnail Preview Card, Video Preview Card, SEO Score, Viral Score
- Comment Previews, Sentiment Identifiers, Trend Alerts, Social Sharing

### Phase 4: Future Features
- Heatmap Mini, Radar Mini, Timeline Scrubber, Audio Waveform
- Keyword Suggesters, Custom QR Gen, Fan Badges
