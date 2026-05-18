# Awesome Toolboxes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a standalone, highly polished HTML file containing 10 complex and intelligent creator toolboxes in a new branch of the `new-repo-temp` repository.

**Architecture:** A single-file HTML/CSS/JS application using Neobrutalist design. Interactive elements powered by Vanilla JS and GSAP.

**Tech Stack:** HTML5, CSS3 (Vanilla + Tailwind-like utility classes), JavaScript (ES6+), GSAP (via CDN), Lucide Icons (via CDN), Chart.js (via CDN).

---

### Task 1: Environment Setup & Branch Creation

**Files:**
- Create branch: `feature/awesome-toolboxes` in `../new-repo-temp/`

- [ ] **Step 1: Create and switch to new branch**
Run: `cd ../new-repo-temp && git checkout -b feature/awesome-toolboxes`

- [ ] **Step 2: Commit initial state**
```bash
git commit --allow-empty -m "chore: initialize awesome-toolboxes branch"
```

### Task 2: Core Layout & Shell

**Files:**
- Create: `../new-repo-temp/AWESOME_TOOLBOXES.html`

- [ ] **Step 1: Create base HTML structure with CDNs**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ViewTube Awesome Toolboxes</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/lucide@0.284.0/dist/umd/lucide.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
        body { font-family: 'Space Grotesk', sans-serif; background-color: #f0f0f0; }
        .brutalist-border { border: 4px solid black; }
        .brutalist-shadow { box-shadow: 8px 8px 0px 0px black; }
        .brutalist-shadow-sm { box-shadow: 4px 4px 0px 0px black; }
        .brutalist-card { background: white; border: 4px solid black; box-shadow: 8px 8px 0px 0px black; }
        .active-tab { background-color: #C9F830; }
    </style>
</head>
<body class="p-0 m-0 overflow-hidden">
    <div id="app" class="flex h-screen w-screen overflow-hidden">
        <!-- Sidebar -->
        <aside class="w-80 h-full brutalist-border bg-white z-20 flex flex-col">
            <header class="p-6 border-b-4 border-black bg-[#FFE357]">
                <h1 class="text-4xl font-[1000] tracking-tighter uppercase">ViewTube X</h1>
                <p class="text-xs font-black uppercase tracking-widest opacity-40">Awesome Toolboxes v1.0</p>
            </header>
            <nav id="nav-list" class="flex-1 overflow-y-auto p-4 space-y-3">
                <!-- Nav items will be injected here -->
            </nav>
        </aside>
        <!-- Main Content -->
        <main class="flex-1 h-full overflow-y-auto p-12 bg-[#f5f5f5] relative">
            <div id="content-area" class="max-w-6xl mx-auto space-y-12">
                <!-- Toolboxes will be injected here -->
            </div>
        </main>
    </div>
    <script>
        const tools = [
            { id: 'viral', name: 'Viral Architect', icon: 'zap', color: '#FF3399' },
            { id: 'retention', name: 'Retention Sentry', icon: 'eye', color: '#00D2FF' },
            { id: 'money', name: 'Monetization Multiplier', icon: 'dollar-sign', color: '#C9F830' },
            { id: 'global', name: 'Global Bridge', icon: 'globe', color: '#FCAF57' },
            { id: 'shorts', name: 'Shorts Studio', icon: 'smartphone', color: '#FF7497' },
            { id: 'community', name: 'Community Cultivator', icon: 'users', color: '#FFE357' },
            { id: 'oracle', name: 'Project Oracle', icon: 'calendar', color: '#CC99FF' },
            { id: 'interrogator', name: 'Algorithmic Interrogator', icon: 'search', color: '#4ADE80' },
            { id: 'persona', name: 'Persona Guardian', icon: 'shield', color: '#FF8AAF' },
            { id: 'mastermind', name: 'Storytelling Mastermind', icon: 'layout', color: '#4FFF5B' }
        ];

        function initNav() {
            const nav = document.getElementById('nav-list');
            tools.forEach(tool => {
                const btn = document.createElement('button');
                btn.className = `w-full p-4 brutalist-border brutalist-shadow-sm flex items-center gap-4 transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none bg-white text-left`;
                btn.innerHTML = `<i data-lucide="${tool.icon}" style="color: ${tool.color}"></i> <span class="font-black uppercase text-sm">${tool.name}</span>`;
                btn.onclick = () => scrollToTool(tool.id);
                nav.appendChild(btn);
            });
            lucide.createIcons();
        }

        function scrollToTool(id) {
            const el = document.getElementById(id);
            el.scrollIntoView({ behavior: 'smooth' });
            gsap.from(el, { scale: 1.02, duration: 0.5, ease: "elastic.out(1, 0.3)" });
        }

        initNav();
    </script>
</body>
</html>
```

- [ ] **Step 2: Commit shell**
```bash
git add AWESOME_TOOLBOXES.html
git commit -m "feat: add basic shell and layout for awesome toolboxes"
```

### Task 3: Implement Toolbox 1 & 2 (Viral & Retention)

**Files:**
- Modify: `../new-repo-temp/AWESOME_TOOLBOXES.html`

- [ ] **Step 1: Add Viral Architect & Retention Sentry Content**
Implement the HTML sections for these two tools with interactive JS for hook generation and chart rendering.

- [ ] **Step 2: Commit Task 3**
```bash
git commit -am "feat: implement Viral Architect and Retention Sentry"
```

### Task 4: Implement Toolbox 3 & 4 (Money & Global)

**Files:**
- Modify: `../new-repo-temp/AWESOME_TOOLBOXES.html`

- [ ] **Step 1: Add Monetization Multiplier & Global Bridge Content**
Implement interactive sponsorship calculator and world map visualization.

- [ ] **Step 2: Commit Task 4**
```bash
git commit -am "feat: implement Monetization Multiplier and Global Bridge"
```

### Task 5: Implement Toolbox 5 & 6 (Shorts & Community)

**Files:**
- Modify: `../new-repo-temp/AWESOME_TOOLBOXES.html`

- [ ] **Step 1: Add Instant Shorts Studio & Community Cultivator Content**
Implement vertical preview and sentiment heatmap.

- [ ] **Step 2: Commit Task 5**
```bash
git commit -am "feat: implement Shorts Studio and Community Cultivator"
```

### Task 6: Implement Toolbox 7 & 8 (Oracle & Interrogator)

**Files:**
- Modify: `../new-repo-temp/AWESOME_TOOLBOXES.html`

- [ ] **Step 1: Add Project Oracle & Algorithmic Interrogator Content**
Implement launch roadmap and natural language query simulation.

- [ ] **Step 2: Commit Task 6**
```bash
git commit -am "feat: implement Project Oracle and Algorithmic Interrogator"
```

### Task 7: Implement Toolbox 9 & 10 (Persona & Mastermind)

**Files:**
- Modify: `../new-repo-temp/AWESOME_TOOLBOXES.html`

- [ ] **Step 1: Add Persona Guardian & Storytelling Mastermind Content**
Implement voice alignment radar and beat board.

- [ ] **Step 2: Commit Task 7**
```bash
git commit -am "feat: implement Persona Guardian and Storytelling Mastermind"
```

### Task 8: Final Polish & Branch Merge/Push

**Files:**
- Modify: `../new-repo-temp/AWESOME_TOOLBOXES.html`

- [ ] **Step 1: Add final styles, animations, and responsive fixes**

- [ ] **Step 2: Verify all tools work in the single HTML file**

- [ ] **Step 3: Final Commit and Branch Status**
```bash
git status
git log -n 5
```
