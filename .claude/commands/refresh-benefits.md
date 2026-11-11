---
description: Quarterly sweep — re-verify every card & membership benefit against current issuer data
---

Re-verify the entire Perks Ledger benefit database in `index.html` against
current issuer data, then ship the corrections. Run this every quarter
(a scheduled GitHub Action opens a reminder issue Jan/Apr/Jul/Oct 1).

## Process

1. **Inventory.** Extract every entry from the `DB` array (~68 cards &
   memberships). Group by issuer.

2. **Research in parallel.** For each issuer group, web-search current
   benefits: annual fees, credit amounts, cadences, new perks, killed perks,
   and `thru` dates that have passed. Use the issuer's official page plus at
   least one independent guide per card. Fan out subagents (or a Workflow if
   the user opted in) — one per issuer group — to cover all groups
   efficiently. Pay special attention to:
   - refresh announcements (fee changes usually mean benefit changes)
   - expired `thru:` dates — `node scripts/lint-db.js` lists them
   - whether yearly credits reset on the calendar or cardmember year (`yr:"cm"`)
   - `earn` rates, the `ROTATING` 5% quarters (add the next quarter once announced)
     and `MERCHANTS` acceptance notes
   - limited-time perks that became permanent (or vice versa)
   - the `SUBS` catalog prices (streaming prices move yearly) and
     `COVERS`/`DEALS` mappings still being accurate

3. **Produce a diff table first** (card · perk · old → new · source), then
   apply the edits to `index.html` following the conventions in
   `.claude/commands/add-card.md`.

4. **Bump the freshness stamps:**
   - `DATA_VERIFIED` constant at the top of the app script
   - the README's "verified **<date>**" line
   - the footer's static fallback text if the wording changed

5. **Verify & ship:** `node scripts/lint-db.js` (0 errors); `node --check` the extracted script; Playwright smoke
   test (add 3 changed cards, confirm values render); `node build-pwa.js
   --cdn-font`; commit "Quarterly benefits refresh — <Month Year>" with the
   diff table in the commit body; push to `main` (auto-deploys).

6. **Close the reminder issue** with a link to the commit and the diff table.
