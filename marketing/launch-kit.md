# Perks Ledger — Launch Kit

Three ready-to-post drafts + tips. Attach `hero-light.png` and the perk-graph
screenshot (both in the repo under `.github/assets/`) wherever images are allowed.

---

## 1. Reddit — main post (r/CreditCards)

**Title:**
> I built a free tool that tracks every credit card perk in one place — it found subscriptions I was paying for that my cards already covered

**Body:**

Like a lot of you I have a drawer of cards with monthly/quarterly credits I kept
forgetting — the Uber Cash that expires silently, the Resy credit I remember on
the 31st, the Saks credit I found out about after it died.

So I built **Perks Ledger**: [perksledger.vercel.app](https://perksledger.vercel.app)

You add your cards (there's a built-in database of 41 US cards with the current
credit amounts — post-refresh Platinum/CSR/CSP included) and it turns everything
into a checklist:

- ✅ check off each credit as you use it — monthly/quarterly/semiannual credits reset themselves
- ⏳ "use it or lose it" warnings before things expire
- 📉 a running "left on the table this year" total (this one hurts)
- 🎯 welcome bonus tracker with $/day pacing
- 📅 one-click calendar reminders (.ics) before each reset window

The part I haven't seen anywhere else: it also tracks **memberships** (Verizon,
T-Mobile, Xfinity, Prime, Walmart+, Costco) and maps the *chains* between
everything. It's how I found out I was paying for Paramount+ while my Amex was
already covering Walmart+... which includes Paramount+. It flags stuff like
"Netflix is included with your T-Mobile plan, stop paying for it" and totals
what you're double-paying.

Honest disclosures:
- **Free, no signup, no bank linking.** Your data stays in your browser
  (localStorage) — there's literally no server. Export/import if you want backups.
- I verified benefit values against issuer pages this month, but issuers change
  things constantly — treat it as a checklist, not gospel, and tell me what's
  stale.
- It's a PWA — open it on your phone → Add to Home Screen and it works like an
  app, offline included.

Would love brutal feedback: what cards/perks am I missing, and what would make
you actually open it weekly?

---

## 2. Reddit — short version (tool/self-promo threads, r/churning sidebar rules)

> Free tool I made: **Perks Ledger** — add your cards + memberships, get every
> credit/perk as a checklist with reset countdowns, a "left on the table" total,
> and double-pay detection (it caught me paying for Paramount+ that Walmart+ via
> my Amex already included). No signup, no bank linking, data stays in your
> browser. [perksledger.vercel.app](https://perksledger.vercel.app) — feedback wanted,
> especially wrong/stale benefit data.

---

## 3. X / Twitter thread

**1/**
You're paying $700+ in annual fees and using maybe half the benefits.

I built a free tool that fixes that: Perks Ledger.

Add your cards → every credit, perk & discount becomes a checklist with reset
countdowns. [screenshot: hero]

**2/**
The part nobody else does: the Perk Graph.

My Amex pays for Walmart+.
Walmart+ includes Paramount+.
I was *also* paying for Paramount+.

It maps those chains across your cards, phone plan, and memberships — and totals
what you're double-paying. [screenshot: perk graph]

**3/**
Also in there:
• "left on the table this year" counter (painful)
• welcome-bonus pacing ($/day to hit the deadline)
• calendar reminders before credits reset
• Verizon/T-Mobile/Prime/Walmart+/Costco perks, not just cards

**4/**
Free. No signup. No bank linking. Your data never leaves your browser.

Works as an app on your phone (Add to Home Screen).

perksledger.vercel.app

Tell me what perks I'm missing 👇

---

## 4. TikTok / Shorts angle (30s script)

Hook (on screen: the "Left on the table: $1,158" panel):
> "Your credit card is quietly stealing back its annual fee. Here's how I stopped it."

Beat 1: "Premium cards bury you in monthly credits designed to be forgotten —
Uber Cash, dining credits, streaming credits. Miss a month, it's gone."

Beat 2 (screen: perk graph): "I built a free tool that tracks all of them — and
it found I was paying for Paramount+ twice. My Amex pays for Walmart+, Walmart+
includes Paramount+."

Beat 3: "No signup, no bank linking, works on your phone. Link in bio. It told
me I had $3,700 in credits still on the table this year."

---

## Posting tips

- **Read each sub's self-promo rules first.** r/CreditCards allows tool posts
  with disclosure ("I built this"); r/churning is stricter — use their weekly
  discussion/tools threads instead of a standalone post.
- **Disclose you built it, always.** Reddit rewards makers and destroys marketers.
- **Lead with the found-money story** (Paramount+ double-pay), not the feature list.
- **Stay in the comments for the first 3 hours** — answer everything, fix data
  errors people report *that day* and reply "fixed". That converts skeptics.
- **The privacy line is your shield**: no signup, no bank linking, no server.
  Say it early; it preempts the #1 objection.
- Best posting windows: weekday mornings US time (Tue–Thu).
- Afterward, mine every comment for: missing cards, stale values, feature asks.
  That's your roadmap, ranked by strangers.
