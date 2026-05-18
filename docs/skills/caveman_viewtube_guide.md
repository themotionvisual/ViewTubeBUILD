# 🪨 Caveman x ViewTube: The Ultimate Survival Guide

Building a monolithic React app like **ViewTube** involves massive context files (`DataCoverageCatalog.ts`, `youtubeService.ts`), giant UI widget libraries, and a lot of planning artifacts. Loading all this into LLM context windows burns through tokens fast. 

**Caveman** fixes this by forcing the AI to cut out the fluff and communicate in pure, highly-dense technical signals. This guide explains how to get the most out of the Caveman skills specifically for ViewTube.

---

## 1. Core Levels: Choosing Your Grunt
You can switch my intensity at any time using `/caveman <level>`:

| Level | Best Used For (in ViewTube) | Example Output |
| :--- | :--- | :--- |
| `/caveman lite` | Generating the `Implementation Plan` artifacts before starting major component refactoring. | "Your `DataCoverageTable` re-renders due to a missing dependency in the `useMemo` hook. Add `masterTableRows` to fix it." |
| `/caveman full` *(Default)* | Standard pair-programming. Asking me why a Vite build is failing or how to type a strict React prop. | "Missing dependency in `useMemo` triggers re-render. Add `masterTableRows` to fix." |
| `/caveman ultra` | Rapidly chaining terminal commands, debugging endless React hydration errors, or raw code generation mode. | "`useMemo` missing dep → re-render. Add `masterTableRows`." |

*(There are also `wenyan` modes if you want to read ancient classical Chinese compressions).*

---

## 2. Caveman Skills: ViewTube Edition

These are targeted tools to compress everyday developer operations. Simply ask me to trigger them.

### `caveman-commit`
**The Problem:** Staging thousands of lines of UI refactors causes the AI to write massive novels for commit bodies. 
**The Fix:** Ask me to `/caveman-commit`. It forces the **Conventional Commits** format: highly truncated subjects (≤50 chars), and it *completely drops* the commit body unless there is a non-obvious *why*.
> **Example ViewTube Commit:**
> `refactor(ui): split data coverage table by scope`
> 
> `Needed separate table mappings for Shorts vs Long Formats to clarify visibility. Closes #45.`

### `caveman-review`
**The Problem:** Reviewing the complex `ResearchLab` or `youtubeService` diffs results in tons of hedged, conversational suggestions ("It looks like you might want to consider...").
**The Fix:** Use `/caveman-review`. One line per actionable finding. 
**Prefixes:** `🔴 bug:`, `🟡 risk:`, `🔵 nit:`, `❓ q:`
> **Example ViewTube Review:**
> `L1825: 🔴 bug: fetchVideoContentType declared twice. Delete duplicate.` 
> `L42: 🟡 risk: no retry on 429 quota fault. Wrap in withBackoff(3).`

### `caveman-compress`
**The Superpower:** The ViewTube project repository generates massive markdown planning files (like `ULTIMATE_PROJECT_CONSOLIDATION.md` and `CLAUDE.md`).
**The Fix:** We can run `/caveman-compress <filepath>`. It physically rewrites your natural-language memory files to be extremely terse, saving on average **~46% of input tokens** every single time you load context. 
- *Safe:* It never modifies code blocks, file paths, URLs, or scripts. 
- *Safe:* It backs up your original file as `FILE.original.md`.

---

## 3. Best Practices specific to ViewTube

1. **Auto-Clarity Override:** You don't have to worry about me being *too* terse when it matters. If you ask about dropping a database mapping, making a breaking change to the `DataCoverageCatalog`, or doing a complex migration, the Caveman protocol mandates that I drop out of caveman-mode to give you a clear, detailed, human-readable warning before returning to the grunt.
2. **Permanent Caveman Mode:** If you want me to act like this forever in our ViewTube sessions, take the snippet below and paste it directly into your global systemic prompt or project rules:
   ```markdown
   Terse like caveman. Technical substance exact. Only fluff die.
   Drop: articles, filler (just/really/basically), pleasantries, hedging.
   Fragments OK. Short synonyms. Code unchanged.
   Pattern: [thing] [action] [reason]. [next step].
   ACTIVE EVERY RESPONSE. No revert after many turns. No filler drift.
   Code/commits/PRs: normal. Off: "stop caveman" / "normal mode".
   ```
3. **Artifact Generation:** Caveman explicitly does *not* compress actual Code, Commits, or PRs. When I write your ViewTube `tsx` components, the code is verbose, perfectly typed, and absolutely normal!

<br>

> **Caveman TL;DR:** Token expensive. Wall of text bad. ViewTube code big. Caveman fix. 🪨
