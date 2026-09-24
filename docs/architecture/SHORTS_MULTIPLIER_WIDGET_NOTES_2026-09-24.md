# Shorts Multiplier Widget — Captured Product Notes

Date: 2026-09-24  
Status: queued after dashboard widget certification

## Source-derived requirements

This document captures the handwritten requirements supplied during the dashboard widget finalization work. It preserves the intent of those notes and does not treat inferred details as implemented behavior.

### Core job

Create a **Shorts Multiplier** widget that takes a prepared or already-published YouTube Short and creates multiple repost-ready variants without YouTube recognizing them as exact copies.

The creator selects a source Short and chooses how many frames to remove from the beginning and/or end of the video. The source notes specify **1–10 frames**, with any combination of beginning/end trimming.

The widget should:
- recreate/export the video as a new file;
- use a new filename;
- recreate/save the associated metadata and packaging;
- generate a complete set of YouTube publishing outputs;
- prepare a publishing schedule for the variant group;
- allow intervals ranging roughly from **2 days to 2 months**.

The notes explicitly mention using the **Remotion video editor/rendering system** as part of the implementation path.

## Rendering/backend requirement

The widget needs a real rendering backend rather than a UI-only transformation.

After the multiplied Shorts have finished rendering, the widget should transition to a results/publishing page.

## Post-render results page

The handwritten layout calls for a list of rendered modules with these approximate proportions and fields:

- each result row/module roughly **3:1–4:1**;
- a **full-height thumbnail** on the left;
- a main information column with the **title occupying the full top row**;
- beneath the title, two half-width columns for **description** and **tags**;
- a **publishing date/time control**, potentially implemented with a dropdown + calendar;
- a final control/button that expands the video/package to expose the rest of the YouTube publishing selections/options.

This results surface should support review of the entire generated repost package before scheduling/publishing.

## Product intent

The stated purpose is to let creators repost a Short multiple times with small render-level differences so each output is not an exact binary/frame-identical copy of the source while retaining the original creative/package structure.

## Integration targets

Likely ViewTube integration owners, inferred from the existing architecture:

- Remotion/editor rendering pipeline
- Video Package / ContentBuild
- Video Publisher / Publishing Command
- scheduling controls
- metadata/title/description/tag package generation
- thumbnail/package review
- post-render handoff to Publisher

These integration targets are architectural inferences from the current app and were not all explicitly named in the handwritten notes.

## Sequencing

Do not interrupt the current dashboard widget certification/finalization work. Once the current widget cohort is certified and visible, treat Shorts Multiplier as the next dedicated widget feature program.
