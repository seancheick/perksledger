#!/usr/bin/env node
/* Lints the card database inside index.html (zero dependencies).
   Usage: node scripts/lint-db.js        → exits 1 on errors, prints warnings too. */
const fs = require("fs"), path = require("path"), vm = require("vm");
const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const m = html.match(/<script>\s*"use strict";([\s\S]*?)<\/script>/);
if(!m) { console.error("app <script> not found"); process.exit(1); }
/* Evaluate only the reference-data part of the script (everything before the state section). */
const dataSrc = m[1].split("/* =============== state =============== */")[0];
const ctx = {};
vm.runInNewContext(dataSrc + "\n;this.out={DB,CATS,FREQ,PPY,ISSUER_ORDER,SUBS,COVERS,DEALS,DEAL_PM,EARN_CATS,CUR,MERCHANTS,ROTATING};", ctx);
const { DB, CATS, FREQ, PPY, ISSUER_ORDER, SUBS, COVERS, DEALS, DEAL_PM, EARN_CATS, CUR, MERCHANTS, ROTATING } = ctx.out;

const errors = [], warns = [];
const today = new Date();
const ids = new Set();
const brands = new Set(Object.values(MERCHANTS).map(x=>x.m).filter(Boolean));
function thru(t){ const r = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/.exec(t||""); if(!r) return null; const y = +r[3]<100? 2000 + +r[3] : +r[3]; return new Date(y, +r[1]-1, +r[2]+1); }

for(const c of DB){
  const at = c.id;
  if(ids.has(c.id)) errors.push(`${at}: duplicate card id`); ids.add(c.id);
  if(!ISSUER_ORDER.includes(c.issuer)) errors.push(`${at}: issuer "${c.issuer}" missing from ISSUER_ORDER`);
  if(!Array.isArray(c.art) || c.art.length!==2 || !c.art.every(h=>/^#[0-9a-f]{6}$/i.test(h))) errors.push(`${at}: art must be two #rrggbb colours`);
  if(!["l","d"].includes(c.ink)) errors.push(`${at}: ink must be "l" or "d"`);
  if(c.kind!=="svc"){
    if(!CUR[c.cur]) errors.push(`${at}: missing/unknown cur "${c.cur}"`);
    if(!["visa","mc","amex","disc"].includes(c.net)) errors.push(`${at}: missing/unknown net "${c.net}"`);
    if(!Array.isArray(c.earn)) errors.push(`${at}: missing earn[]`);
    else {
      for(const r of c.earn){
        if(!EARN_CATS[r.k]) errors.push(`${at}: earn category "${r.k}" unknown`);
        if(!(r.x>0)) errors.push(`${at}: earn multiplier must be > 0`);
        if(r.m && !brands.has(r.m)) errors.push(`${at}: earn brand "${r.m}" has no MERCHANTS entry`);
      }
      if(c.earn.length && !c.earn.some(r=>r.k==="other")) warns.push(`${at}: earn has no "other" base rate`);
    }
    for(const d of (c.down||[])) if(!DB.some(x=>x.id===d)) errors.push(`${at}: downgrade target "${d}" not in DB`);
  }
  const bids = new Set();
  for(const b of c.b){
    const w = `${at}.${b.id}`;
    if(bids.has(b.id)) errors.push(`${w}: duplicate benefit id`); bids.add(b.id);
    if(!CATS[b.c]) errors.push(`${w}: bad category "${b.c}"`);
    if(!FREQ[b.f]) errors.push(`${w}: bad cadence "${b.f}"`);
    if(typeof b.a!=="number" || b.a<0) errors.push(`${w}: a must be a number ≥ 0`);
    if(b.a>0 && !PPY[b.f]) errors.push(`${w}: counted $ only allowed on m/q/h/y cadences`);
    if(b.yr && (b.yr!=="cm" || b.f!=="y")) errors.push(`${w}: yr:"cm" only valid on yearly perks`);
    if(b.pv){
      if(b.f!=="m") errors.push(`${w}: pv only valid on monthly perks`);
      const over = Object.entries(b.pv); const rest = (b.a - over.reduce((s,[,v])=>s+v,0))/(12-over.length);
      if(!(rest>0)) errors.push(`${w}: pv leaves no value for the other months`);
    }
    /* `a` should match the first "$N / period" in `per` */
    const pm = /^\$([\d,.]+)\s*\/\s*(mo|quarter|half|yr)\b/.exec(b.per||"");
    if(b.a>0 && pm && !b.pv){
      const n = +pm[1].replace(/,/g,""), mult = {mo:12, quarter:4, half:2, yr:1}[pm[2]];
      if(Math.abs(n*mult - b.a) > 1) warns.push(`${w}: a=${b.a} but per "${b.per}" implies ${n*mult}`);
    }
    if(b.thru){ const t = thru(b.thru); if(!t) errors.push(`${w}: thru "${b.thru}" not M/D/YY`); else if(t<=today) warns.push(`${w}: thru ${b.thru} has passed (auto-hidden in app — update or remove)`); }
    if(!b.d) warns.push(`${w}: no description`);
  }
}
for(const [map, name] of [[COVERS,"COVERS"],[DEALS,"DEALS"]]){
  for(const [k, subs] of Object.entries(map)){
    const [cid, bid] = k.split(".");
    const c = DB.find(x=>x.id===cid);
    if(!c || !c.b.some(b=>b.id===bid)) errors.push(`${name}["${k}"]: no such card.benefit`);
    for(const s of subs) if(!SUBS[s]) errors.push(`${name}["${k}"]: unknown subscription "${s}"`);
  }
}
for(const k of Object.keys(DEAL_PM)) if(!DEALS[k]) errors.push(`DEAL_PM["${k}"]: not in DEALS`);
for(const [q, cards] of Object.entries(ROTATING)){
  if(!/^\d{4}-Q[1-4]$/.test(q)) errors.push(`ROTATING key "${q}" must look like 2026-Q4`);
  for(const [cid, r] of Object.entries(cards)){
    if(!DB.some(x=>x.id===cid)) errors.push(`ROTATING ${q}: unknown card "${cid}"`);
    for(const k of r.ks) if(!EARN_CATS[k]) errors.push(`ROTATING ${q}.${cid}: unknown earn category "${k}"`);
  }
}
for(const [name, v] of Object.entries(MERCHANTS)) if(!EARN_CATS[v.k]) errors.push(`MERCHANTS["${name}"]: unknown category "${v.k}"`);

const nCards = DB.filter(c=>c.kind!=="svc").length, nSvc = DB.length - nCards;
for(const w of warns) console.log("warn  " + w);
for(const e of errors) console.log("ERROR " + e);
console.log(`\n${nCards} cards + ${nSvc} memberships · ${errors.length} errors · ${warns.length} warnings`);
process.exit(errors.length? 1 : 0);
