# Herald output budget

Herald's process is for rigour, not for volume. An agent running it burns most
of its budget on prose and on re-reading things it already knows. These caps are
binding for every Herald turn in this repo.

## Caps

| Output | Cap |
|---|---|
| Chat reply | ~150 words. A status tick: 1–2 lines. |
| Ledger `proven` | 300 chars. Numbers and IDs, not narrative. |
| PR body | 400 words. Link evidence, don't restate it. |
| PR comment | 150 words. |

## Rules

1. **Say it once.** A fact in the PR body does not go in a comment, the chat
   reply and the ledger. Put it where a reader will look for it and link the
   rest.
2. **Never re-narrate.** Don't restate what the last turn established. No
   "here's where things stand" recaps unless asked.
3. **Numbers over prose.** "6 failures vs main's 14" beats a paragraph.
4. **Read logs surgically.** Never pull a 500-line CI log to find a summary
   line. Fetch a short tail, or grep the specific assertion. A failed job's
   useful content is usually under 20 lines.
5. **A quiet tick is silent.** Nothing changed → say so in one line, or say
   nothing. Don't re-list the state.
6. **No status theatre.** Tables of green checkmarks nobody asked for, restated
   verification matrices, and "what's left" enumerations are the main leak.

## Ledger

Append-only, one JSON line per turn. `proven` carries the evidence that would
let someone else re-derive the claim — commit SHAs, run IDs, counts, file paths.
It is not a place to explain reasoning. If it needs more than 300 chars, the
detail belongs in the PR or a doc, referenced by ID.
