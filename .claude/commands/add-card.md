---
description: Research a card or membership's current benefits and add it to the Perks Ledger database
---

Add **$ARGUMENTS** to the Perks Ledger database in `index.html`.

## Steps

1. **Research first — never from memory.** Web-search the card's CURRENT benefits:
   the issuer's own benefits page plus at least two independent guides
   (The Points Guy / Upgraded Points / NerdWallet / Bankrate). Benefits change
   constantly; note the credit amounts, reset cadence (monthly / quarterly /
   semiannual / annual / one-time / always-on), enrollment requirements, and
   any "through <date>" expirations.

2. **Follow the DB conventions** (the `DB` array in `index.html`):
   - Card fields: `id`, `name`, `issuer`, `fee`, `feeNote?`, `art:[c1,c2]`
     (two gradient hex stops matching the physical card), `ink:"l"|"d"` (text
     color on the art), `rates` (one-line earning summary), `kind:"svc"` for
     memberships only, `b:[…benefits]`.
   - Benefit fields: `id`, `n` (name), `c` (category: trv/din/ent/shp/wel/rid/
     air/sts/prt/oth), `f` (cadence: m/q/h/y/o/on), `a` (counted annual $ —
     0 for non-dollar or one-time perks), `per` (display string like
     "$25 / mo"), `d` (how to use it, specific), `e:1` if enrollment required,
     `thru:"12/31/27"` for expiring perks.
   - Insert under the correct issuer group (issuer must exist in
     `ISSUER_ORDER`, add it if new). Memberships go after the cards.
   - If a benefit covers or discounts a subscription in `SUBS`, add the
     mapping to `COVERS` / `DEALS` (and `DEAL_PM` for fixed-price deals) so
     the perk graph picks it up.

3. **Verify:** extract the `<script>` and run `node --check`; then a quick
   Playwright smoke test — search the new card in the Add modal, add it,
   confirm its perks render and the ledger math counts them.

4. **Build & ship:** `node build-pwa.js --cdn-font`, commit with a message
   citing the sources used, push to `main` (Vercel auto-deploys).

5. If this request came from a user email, reply is manual — but list the
   card in your final summary so Sean can tell them it shipped.
