<div align="center">

<img src="icons/icon-192.png" width="88" alt="Perks Ledger icon">

# Perks Ledger

**Every credit, perk, and discount across your cards & memberships — tracked in one place.**

[![License: MIT](https://img.shields.io/badge/license-MIT-136147.svg)](LICENSE)
[![Single file](https://img.shields.io/badge/app-single%20HTML%20file-136147)](index.html)
[![Zero dependencies](https://img.shields.io/badge/dependencies-zero-2e8a6d)](build-pwa.js)
[![PWA](https://img.shields.io/badge/PWA-installable%20%C2%B7%20offline-1c4f8f)](#-put-it-on-your-phone)
[![Privacy](https://img.shields.io/badge/your%20data-never%20leaves%20your%20browser-5a2a63)](#-privacy)

[**Live demo**](https://raw.githack.com/seancheick/perksledger/main/dist/index.html) · [Put it on your phone](#-put-it-on-your-phone) · [Deploy your own](#-deploy-your-own) · [Roadmap](#-roadmap)

<br>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset=".github/assets/hero-dark.png">
  <img src=".github/assets/hero-light.png" alt="Perks Ledger — wallet, redemption stats, and the perk connections graph" width="920">
</picture>

</div>

---

People pay **$700+ annual fees** and redeem barely half of what those cards promise. Credits reset monthly, quarterly, semiannually — quietly. Memberships bundle perks nobody remembers. And the whole thing is interconnected: your Amex pays for Walmart+, Walmart+ includes Paramount+, and you're *still* paying for Paramount+ out of pocket.

Perks Ledger is the antidote: add what's in your wallet, and every credit, perk, discount, and hidden chain shows up as a checklist with reset countdowns, redemption math, and overlap detection.

## ✨ Features

| | |
|---|---|
| 💳 **Built-in database** | 41 popular U.S. credit cards + Verizon, T-Mobile, Xfinity Rewards, Amazon Prime, Walmart+, and Costco — benefit values verified **July 2026**, including the 2025–26 refreshes (Amex Platinum $895, CSR $795, CSP June '26, Bilt 2.0) |
| ✅ **Set-and-forget tracking** | Check off each perk per period; period-keyed storage means monthly/quarterly/half-year/annual credits reset themselves |
| ⏳ **Use it or lose it** | Unused dollar credits that reset soon get surfaced before they expire |
| 🕸 **Perk Graph** | Tell it what you pay for → it flags subscriptions your cards already cover, deals that are cheaper through your plans, and card → membership → subscription chains with one-click unlocks |
| 🎯 **Welcome-bonus pacing** | Spend target, deadline, and a live *$/day needed* number |
| 📉 **Money left behind** | A running "left on the table" total from periods that already ended — with clickable history dots to fix the record |
| 📅 **Calendar reminders** | One-click `.ics` export: recurring nudges before every reset window, amounts included |
| 🧾 **Custom everything** | Cards, memberships, and perks the database doesn't know; hide built-in perks your card doesn't have |
| 🌗 **Considered design** | Wallet-plate UI, banker's-green ledger aesthetic, full light/dark themes, responsive down to phones |
| 🔒 **Local-only data** | No accounts, no servers, no tracking — with export/import and a "download app + data" escape hatch |

## 🕸 The Perk Graph

The feature nobody else has. Perks Ledger models the *edges* between your money and your benefits:

<div align="center">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset=".github/assets/perk-graph-dark.png">
  <img src=".github/assets/perk-graph-light.png" alt="Perk connections panel showing covered subscriptions, deals, and unlock chains" width="880">
</picture>
</div>

- **"Already covered"** — you pay for Netflix; your T-Mobile plan includes it. Stop.
- **"Cheaper through your plan"** — Google AI Pro is $19.99/mo direct, $10/mo as a Verizon perk.
- **"Free unlock"** — your Platinum's credit pays for Walmart+, which includes Paramount+ or Peacock: a whole chain for $0, one click to add.
- **"Watch the drops"** — Perplexity Pro shows up as an occasional carrier freebie; check before you renew.

It totals what it finds (*"≈ $192/yr sitting in overlaps"*) and lists everything already free with your wallet that you're not using yet.

## 🚀 Getting started

Open the [**live demo**](https://raw.githack.com/seancheick/perksledger/main/dist/index.html), hit **+ Add card**, and add your wallet. That's it — data persists in your browser.

### 📱 Put it on your phone

1. Open the live demo link on your phone
2. **iPhone:** Share → *Add to Home Screen* · **Android:** menu ⋮ → *Add to Home screen / Install app*
3. It launches like a native app, works offline, and keeps your data on-device

### 💾 Own your copy

Inside the app: **Data → Download app + data** saves `perks-ledger.html` — the entire app *with your cards and history baked in*, as one file. Open it from any computer; it keeps saving there. Email it to yourself, drop it in Dropbox, whatever — it's yours.

## 🛠 Deploy your own

The app is a single HTML file; `dist/` and `docs/` contain the installable PWA build (manifest + offline service worker + icons).

| Host | How |
|---|---|
| **GitHub Pages** | Repo **Settings → Pages → Deploy from branch → `main` / `docs`** → live at `https://<you>.github.io/perksledger/` |
| **Vercel** | *Add New → Project → Import this repo* · Build command `node build-pwa.js --cdn-font` · Output directory `dist` |
| **Netlify / Cloudflare / any static host** | Serve the `dist/` folder. Done. |

Rebuild after editing `index.html`:

```bash
node build-pwa.js            # inline-font build (fully self-contained, works offline-first)
node build-pwa.js --cdn-font # smaller build that loads Fraunces from Google Fonts
```

No `npm install`. No framework. No dependencies.

## 🧑‍💻 How it's built

```
index.html      the entire app — data, logic, UI (vanilla JS, ~2,300 lines)
build-pwa.js    wraps it into an installable PWA in dist/ (zero-dep build script)
icons/          app icons
dist/ docs/     built PWA (docs/ exists so GitHub Pages can serve it directly)
```

Design notes: warm-paper + banker's-green "ledger" system with a wallet of gradient card plates; Fraunces for display type; period-keyed usage storage (`2026-07`, `2026-Q3`, `2026-H2`) so resets are free; the card/benefit database is plain JS objects — adding a card is a pull request, not a schema migration.

## 🔒 Privacy

Everything lives in `localStorage` in *your* browser. No sign-up, no backend, no analytics, no network calls at runtime (the CDN-font build fetches one font file — that's it). Export/import is a JSON blob you control.

## 🗺 Roadmap

- [ ] Monthly recap & wallet score
- [ ] Best-card-for-this-purchase cheat sheet
- [ ] Push reminders (PWA notifications)
- [ ] Household / player-2 shared wallets
- [ ] Community-verified benefit database with freshness dates
- [ ] Card ROI at renewal: keep / downgrade / cancel
- [ ] AI concierge over your own wallet

## ⚠️ A note on the numbers

Benefit values were verified against issuer pages and card guides in early **July 2026**. Issuers change these constantly — treat the app as your checklist and confirm amounts in your card's app before booking. Perks marked *Enroll* need one-time activation with the issuer. This is a tracking tool, not financial advice.

## 📄 License

[MIT](LICENSE) © 2026 Sean Cheick Baradji
