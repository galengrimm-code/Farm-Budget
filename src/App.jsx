import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "./supabase";

// ═══════════════════════════════════════════════════════════════════════════
// DATA MODEL — fully dynamic, no hardcoded crop/product lists
// ═══════════════════════════════════════════════════════════════════════════
function defaultData(year) {
  return {
    year,
    crops: [
      { id: "c1", name: "Corn", acres: 491, budgetYield: 212, actualYield: null, budgetPrice: 4.404, actualPrice: null, color: "#D97706", seedBag: 80000, seedRate: 32000, seedPrice: 310, marketGroup: "corn", dryingPerBu: 0.06, irrInches: 0 },
      { id: "c2", name: "IRR Corn", acres: 808, budgetYield: 229, actualYield: null, budgetPrice: 4.404, actualPrice: null, color: "#B45309", seedBag: 80000, seedRate: 33500, seedPrice: 310, marketGroup: "corn", dryingPerBu: 0.06, irrInches: 3.15 },
      { id: "c3", name: "Non-GMO Beans", acres: 115, budgetYield: 70, actualYield: null, budgetPrice: 14.00, actualPrice: null, color: "#059669", seedBag: 140000, seedRate: 165000, seedPrice: 80, marketGroup: "beans", dryingPerBu: 0.06, irrInches: 0 },
      { id: "c4", name: "Beans", acres: 862, budgetYield: 70, actualYield: null, budgetPrice: 10.40, actualPrice: null, color: "#10B981", seedBag: 140000, seedRate: 135000, seedPrice: 80, marketGroup: "beans", dryingPerBu: 0, irrInches: 0 },
      { id: "c5", name: "IRR Beans", acres: 1167, budgetYield: 74, actualYield: null, budgetPrice: 10.40, actualPrice: null, color: "#047857", seedBag: 140000, seedRate: 130000, seedPrice: 80, marketGroup: "beans", dryingPerBu: 0, irrInches: 3.15 },
      { id: "c6", name: "Amylose", acres: 761, budgetYield: 158, actualYield: null, budgetPrice: 6.643, actualPrice: null, color: "#7C3AED", seedBag: 80000, seedRate: 0, seedPrice: 0, marketGroup: "amylose", dryingPerBu: 0.06, irrInches: 0 },
    ],
    incomeItems: [
      { id: "i1", name: "Government Payments", perAc: 33.10 },
      { id: "i2", name: "Indemnity Payments", perAc: 0 },
      { id: "i3", name: "Miscellaneous Income", perAc: 28.36 },
    ],
    fertProducts: [
      { id: "f1", name: "11-52-0", pricePerTon: 750, unit: "/Ton", mult: 1, rates: { c1: 35, c2: 35, c3: 0, c4: 35, c5: 0, c6: 35 } },
      { id: "f2", name: "NH3", pricePerTon: 610, unit: "/Ton", mult: 1.18, rates: { c1: 170, c2: 170, c3: 0, c4: 0, c5: 0, c6: 130 } },
      { id: "f3", name: "0-0-60", pricePerTon: 380, unit: "/Ton", mult: 1, rates: { c1: 50, c2: 50, c3: 120, c4: 120, c5: 150, c6: 50 } },
      { id: "f4", name: "Gypsum", pricePerTon: 240, unit: "/Ton", mult: 1, rates: { c1: 75, c2: 75, c3: 75, c4: 75, c5: 75, c6: 75 } },
      { id: "f5", name: "Micro Nutrients", pricePerTon: 2800, unit: "/Ton", mult: 1, rates: { c1: 1, c2: 1, c3: 0, c4: 0, c5: 0, c6: 1 } },
      { id: "f6", name: "UAN", pricePerLb: 0.50, unit: "/Lb N", isPerLb: true, mult: 1, rates: { c1: 0, c2: 60, c3: 0, c4: 0, c5: 0, c6: 0 } },
      { id: "f7", name: "Urea", pricePerTon: 415, unit: "/Ton", mult: 1, rates: { c1: 0, c2: 20, c3: 0, c4: 0, c5: 0, c6: 0 } },
      { id: "f8", name: "Manure", pricePerTon: 105, unit: "/Ton", mult: 1, rates: { c1: 0, c2: 0, c3: 0, c4: 0, c5: 0, c6: 0 } },
    ],
    fertFlats: [
      { id: "ff1", name: "Lime", total: 250 },
      { id: "ff2", name: "Foliar Fert", total: 10003 },
      { id: "ff3", name: "Fert Reconcile", total: 39000 },
    ],
    herbPasses: [
      { id: "h1", name: "Fall Pass Corn", costPerAc: 4, flags: { c1: 1, c2: 1, c3: 0, c4: 0, c5: 0, c6: 1 } },
      { id: "h2", name: "Pre Pass Corn", costPerAc: 26, flags: { c1: 0, c2: 0, c3: 0, c4: 0, c5: 0, c6: 1 } },
      { id: "h3", name: "Post Pass Corn", costPerAc: 24, flags: { c1: 1, c2: 1, c3: 0, c4: 0, c5: 0, c6: 0.5 } },
      { id: "h4", name: "Fall Pass Beans", costPerAc: 4, flags: { c1: 0, c2: 0, c3: 0, c4: 0, c5: 0, c6: 0 } },
      { id: "h5", name: "Pre Pass Beans", costPerAc: 35, flags: { c1: 0, c2: 0, c3: 1, c4: 1, c5: 1, c6: 0 } },
      { id: "h6", name: "Post Pass Beans", costPerAc: 21, flags: { c1: 0, c2: 0, c3: 1, c4: 1, c5: 1, c6: 0 } },
      { id: "h7", name: "2nd Post Beans", costPerAc: 10, flags: { c1: 0, c2: 0, c3: 1, c4: 1, c5: 1, c6: 0 } },
      { id: "h8", name: "Post Grass", costPerAc: 27, flags: { c1: 0, c2: 0, c3: 0, c4: 0, c5: 0, c6: 0 } },
    ],
    herbReconcile: -45000,
    insectProducts: [
      { id: "ip1", name: "HeadLine", costPerAc: 28, flags: { c1: 1, c2: 1, c3: 0, c4: 0, c5: 0, c6: 1 } },
      { id: "ip2", name: "Priaxore + Hero", costPerAc: 18, flags: { c1: 0, c2: 0, c3: 1, c4: 1, c5: 1, c6: 0 } },
      { id: "ip3", name: "Alfa Guard", costPerAc: 12, flags: { c1: 0, c2: 0, c3: 0, c4: 0, c5: 0, c6: 1 } },
    ],
    irrCostPerInch: 9,
    overheadItems: [
      { id: "o1", name: "Repairs", total: 298000, group: "Machinery" },
      { id: "o2", name: "Gas/Fuel/Oil", total: 134500, group: "Machinery" },
      { id: "o3", name: "Equipment Payments", total: 252992, group: "Machinery" },
      { id: "o4", name: "Capital Purchase", total: 210000, group: "Machinery" },
      { id: "o5", name: "Machine Hire", total: 35000, group: "Machinery" },
      { id: "o6", name: "Fertilizer Application", total: 25000, group: "Machinery" },
      { id: "o7", name: "Hauling (Amylose)", total: 10000, group: "Machinery", amyloseOnly: true },
      { id: "o8", name: "Crop Insurance", total: 95000, group: "Insurance" },
      { id: "o9", name: "General Farm Insurance", total: 49000, group: "Insurance" },
      { id: "o10", name: "Crop Consulting", total: 25000, group: "Consulting" },
      { id: "o11", name: "Grid Sampling", total: 7500, group: "Consulting" },
      { id: "o12", name: "Miscellaneous", total: 63075, group: "Other" },
      { id: "o13", name: "Cover Crops", total: 15404, group: "Other" },
      { id: "o14", name: "Vehicle Expense", total: 14000, group: "Other" },
      { id: "o15", name: "Classes/Meetings", total: 5001, group: "Other" },
      { id: "o16", name: "Labor", total: 350000, group: "Labor" },
      { id: "o17", name: "Farm Utilities", total: 16000, group: "Taxes/Util" },
      { id: "o18", name: "Property Taxes", total: 9500, group: "Taxes/Util" },
      { id: "o19", name: "Interest on Op Note", total: 155860, group: "Interest" },
    ],
    rentPerCrop: { c1: 252.89, c2: 267.47, c3: 252.89, c4: 252.89, c5: 267.47, c6: 252.89 },
    marketingGroups: [
      { id: "corn", name: "Corn", cropIds: ["c1","c2"], color: "#D97706" },
      { id: "beans", name: "Soybeans", cropIds: ["c3","c4","c5"], color: "#10B981" },
      { id: "amylose", name: "Amylose", cropIds: ["c6"], color: "#7C3AED" },
    ],
    contracts: {
      corn: [
        { id: 1, desc: "AIO Flex program cost .13 enrolled 12-12-24", delDate: "Dec", units: 25000, cash: 4.10, basis: -0.25, futures: 4.35, delivered: false },
        { id: 2, desc: "Ag Partners 5-3-24", delDate: "Oct", units: 30000, cash: 4.50, basis: -0.40, futures: 4.90, delivered: false },
        { id: 3, desc: "Ag Partners 7-10-24 reown 50K at $4.46", delDate: "Oct", units: 70000, cash: 4.17, basis: -0.33, futures: 4.50, delivered: false },
        { id: 4, desc: "Harvest delivery", delDate: "Oct", units: 165000, cash: 4.50, basis: -0.05, futures: 4.55, delivered: false },
      ],
      beans: [
        { id: 1, desc: "AIO Flex program cost .15 enrolled 12-12-24", delDate: "Nov", units: 20000, cash: 9.10, basis: -0.50, futures: 9.60, delivered: false },
        { id: 2, desc: "Ag Partners Order", delDate: "Nov", units: 10000, cash: 10.65, basis: -0.25, futures: 10.90, delivered: false },
        { id: 3, desc: "Ag Partners 10-22-25", delDate: "Nov", units: 8000, cash: 9.80, basis: -0.55, futures: 10.35, delivered: false },
        { id: 4, desc: "Cargill KC Spot", delDate: "Nov", units: 6145, cash: 9.95, basis: -0.35, futures: 10.30, delivered: false },
        { id: 5, desc: "Remaining Ag Partners harvest delivery", delDate: "Nov", units: 5557, cash: 9.99, basis: -0.50, futures: 10.49, delivered: false },
        { id: 6, desc: "Ag Partners order 10-27-25", delDate: "Jan", units: 10000, cash: 10.72, basis: -0.15, futures: 10.87, delivered: false },
        { id: 7, desc: "Ag Partners order 10-27-26", delDate: "Jan", units: 10000, cash: 11.05, basis: -0.10, futures: 11.15, delivered: false },
        { id: 8, desc: "Ag Partners", delDate: "Jan", units: 5000, cash: 11.34, basis: -0.15, futures: 11.49, delivered: false },
        { id: 9, desc: "Ag Partners", delDate: "Jan", units: 65000, cash: 11.45, basis: -0.15, futures: 11.60, delivered: false },
      ],
      amylose: [
        { id: 1, desc: "9-23-24", delDate: "Dec", units: 25000, cash: 6.66, basis: 2.16, futures: 4.50, delivered: false },
        { id: 2, desc: "Split with Jay", delDate: "Dec", units: 10000, cash: 6.60, basis: 2.14, futures: 4.46, delivered: false },
      ],
    },
    cashRents: [
      { id: 1, owner: "Amberwell", farm: "Betty North", acres: 143, rentAc: 275, type: "Fixed", bonus: 0, cat: "cash" },
      { id: 2, owner: "Doug", farm: "Dad", acres: 503, rentAc: 190, type: "Base @ 190", bonus: 55, cat: "cash" },
      { id: 3, owner: "Gernon", farm: "G&O", acres: 102, rentAc: 140, type: "Base + 31% share", bonus: 91.58, cat: "share" },
      { id: 4, owner: "Gernon", farm: "WCG", acres: 244, rentAc: 140, type: "Base + 31% share", bonus: 146.52, cat: "share" },
      { id: 5, owner: "Gernon", farm: "Stover", acres: 44, rentAc: 140, type: "Base + 31% share", bonus: 132.37, cat: "share" },
      { id: 6, owner: "J Six", farm: "J Six", acres: 61.1, rentAc: 210, type: "Fixed", bonus: 20, cat: "cash" },
      { id: 7, owner: "Keith", farm: "Hoffmans", acres: 74, rentAc: 190, type: "Base @ 190", bonus: 60, cat: "cash" },
      { id: 8, owner: "Keith", farm: "Twombly", acres: 155, rentAc: 180, type: "Flex Base 165", bonus: 50, cat: "cash" },
      { id: 9, owner: "Keith", farm: "Hupperts", acres: 59, rentAc: 180, type: "Flex Base 180", bonus: 80, cat: "cash" },
      { id: 10, owner: "Keith", farm: "Cashmans", acres: 48, rentAc: 175, type: "Flex Base 175", bonus: 65, cat: "cash" },
      { id: 11, owner: "Keith", farm: "Fergus", acres: 69, rentAc: 200, type: "", bonus: 0, cat: "cash" },
      { id: 12, owner: "Keith", farm: "Kraigs", acres: 40, rentAc: 200, type: "", bonus: 15, cat: "cash" },
      { id: 13, owner: "Keith&Galen", farm: "Rake", acres: 49, rentAc: 220, type: "Base + 32% share", bonus: 30, cat: "share" },
      { id: 14, owner: "Kings", farm: "Kraigs", acres: 24, rentAc: 200, type: "", bonus: 0, cat: "cash" },
      { id: 15, owner: "Kohl", farm: "Smiths", acres: 143, rentAc: 185, type: "Base @ 185", bonus: 65, cat: "cash" },
      { id: 16, owner: "Kurt", farm: "Kurts", acres: 118, rentAc: 195, type: "Base @ 195", bonus: 55, cat: "cash" },
      { id: 17, owner: "Meyer", farm: "Meyer", acres: 628, rentAc: 290, type: "3yr Fixed 24-26", bonus: 0, cat: "cash" },
      { id: 18, owner: "Paul Shmidgall", farm: "Bettys South", acres: 59, rentAc: 280, type: "Fixed", bonus: 0, cat: "cash" },
      { id: 19, owner: "PF", farm: "Jones", acres: 84, rentAc: 505, type: "Contract for deed", bonus: 0, cat: "owned" },
      { id: 20, owner: "PF", farm: "Bills", acres: 23, rentAc: 311.22, type: "Payment", bonus: 0, cat: "owned" },
      { id: 21, owner: "PF", farm: "Jones 18ac", acres: 17, rentAc: 516.35, type: "Payment", bonus: 0, cat: "owned" },
      { id: 22, owner: "PF", farm: "Pyles", acres: 73, rentAc: 275.74, type: "Payment", bonus: 0, cat: "owned" },
      { id: 23, owner: "Plamann", farm: "Plamann", acres: 215, rentAc: 205, type: "Fixed", bonus: 25, cat: "cash" },
      { id: 24, owner: "Saylor", farm: "Preston", acres: 356, rentAc: 190, type: "Flex Base 190", bonus: 63, cat: "cash" },
      { id: 25, owner: "Saylor", farm: "Giffillian", acres: 121, rentAc: 205, type: "Flex Base 205", bonus: 9, cat: "cash" },
      { id: 26, owner: "Saylor", farm: "Bottom", acres: 62, rentAc: 210, type: "Flex Base 210", bonus: 32, cat: "cash" },
      { id: 27, owner: "Witt", farm: "Witt", acres: 239, rentAc: 230, type: "Fixed", bonus: 0, cat: "cash" },
    ],
    grainTickets: [],
    capitalPlan: [],
    wishList: [],
    inventoryProducts: [
      { id: "p1", name: "Soybeans", unit: "bu" },
      { id: "p8", name: "Non-GMO Soybeans", unit: "bu" },
      { id: "p2", name: "Amylose", unit: "bu" },
      { id: "p3", name: "Reg Corn", unit: "bu" },
      { id: "p4", name: "Dyed Diesel", unit: "gal" },
      { id: "p5", name: "Clear Diesel", unit: "gal" },
      { id: "p6", name: "Propane", unit: "gal" },
      { id: "p7", name: "NH3", unit: "ton" },
    ],
    inventorySnapshots: [],
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// CALCULATION ENGINE
// ═══════════════════════════════════════════════════════════════════════════
const ta = (d) => d.crops.reduce((s, c) => s + (c.acres || 0), 0);
const calcSeed = (c) => c.seedRate && c.seedBag ? (c.seedPrice / c.seedBag) * c.seedRate : 0;
const calcFert = (d, cid) => {
  const t = ta(d); let total = 0;
  (d.fertProducts || []).forEach(p => {
    const lbs = p.rates?.[cid] || 0; if (!lbs) return;
    const m = p.mult || 1;
    total += p.isPerLb ? lbs * (p.pricePerLb || 0) : ((p.pricePerTon || 0) / 2000) * lbs * m;
  });
  if (t > 0) (d.fertFlats || []).forEach(f => { total += (f.total || 0) / t; });
  return total;
};
const calcHerb = (d, cid) => {
  const t = ta(d);
  let total = (d.herbPasses || []).reduce((s, p) => s + (p.flags?.[cid] || 0) * (p.costPerAc || 0), 0);
  if (t > 0 && d.herbReconcile) total += (d.herbReconcile || 0) / t;
  return total;
};
const calcInsect = (d, cid) => (d.insectProducts || []).reduce((s, p) => s + (p.flags?.[cid] || 0) * (p.costPerAc || 0), 0);
const calcIrr = (d, c) => (c.irrInches || 0) * (d.irrCostPerInch || 0);
const calcDrying = (c) => (c.budgetYield || 0) * (c.dryingPerBu || 0);

function calcOverhead(d, cid, group) {
  const t = ta(d); if (t <= 0) return 0;
  return d.overheadItems.filter(o => o.group === group && !o.amyloseOnly).reduce((s, o) => s + (o.total || 0), 0) / t;
}
function calcAmyloseExtra(d, cid) {
  const amCrop = d.crops.find(c => c.id === cid);
  if (!amCrop) return 0;
  return d.overheadItems.filter(o => o.amyloseOnly).reduce((s, o) => s + (o.total || 0), 0) / (amCrop.acres || 1);
}

function getLines(d, cid) {
  const c = d.crops.find(cr => cr.id === cid);
  const t = ta(d);
  const machBase = calcOverhead(d, cid, "Machinery");
  const isAmylose = c?.marketGroup === "amylose";
  return [
    { key: "seed", label: "Seed", val: calcSeed(c) },
    { key: "herb", label: "Herbicide", val: calcHerb(d, cid) },
    { key: "insect", label: "Insecticide/Fungicide", val: calcInsect(d, cid) },
    { key: "fert", label: "Fertilizer & Lime", val: calcFert(d, cid) },
    { key: "consult", label: "Consulting/Sampling", val: calcOverhead(d, cid, "Consulting") },
    { key: "cropIns", label: "Crop/Gen Insurance", val: calcOverhead(d, cid, "Insurance") },
    { key: "drying", label: "Drying", val: calcDrying(c) },
    { key: "misc", label: "Miscellaneous", val: calcOverhead(d, cid, "Other") },
    { key: "taxes", label: "Taxes/Utilities", val: calcOverhead(d, cid, "Taxes/Util") },
    { key: "mach", label: "Machinery Expense", val: machBase + (isAmylose ? calcAmyloseExtra(d, cid) : 0) },
    { key: "labor", label: "Labor", val: calcOverhead(d, cid, "Labor") },
    { key: "irr", label: "Irrigation", val: calcIrr(d, c) },
    { key: "rent", label: "Land Charge / Rent", val: d.rentPerCrop?.[cid] || 0 },
    { key: "interest", label: "Interest on ½ Nonland", val: calcOverhead(d, cid, "Interest") },
  ];
}
const cropIncome = (d, c) => (c.budgetYield || 0) * (c.budgetPrice || 0) + (d.incomeItems || []).reduce((s, i) => s + (i.perAc || 0), 0);
const cropCost = (d, cid) => getLines(d, cid).reduce((s, l) => s + l.val, 0);

// ═══════════════════════════════════════════════════════════════════════════
// FORMATTING & STYLES
// ═══════════════════════════════════════════════════════════════════════════
const fmt = (n, dec = 0) => n == null || isNaN(n) ? "—" : Number(n).toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
const fmtD = (n) => n == null || isNaN(n) ? "—" : "$" + fmt(n, 2);
const fmtK = (n) => "$" + fmt(n / 1000, 0) + "K";
const C = { bg: "#0F1419", card: "#1A2332", border: "#2F3336", text: "#E7E9EA", muted: "#71767B", green: "#10B981", red: "#EF4444", amber: "#D97706", purple: "#7C3AED" };
const badge = (color) => ({ display: "inline-block", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600, background: color + "22", color, border: `1px solid ${color}44` });

// Responsive hook — sets CSS custom properties based on viewport width
function useResponsive() {
  useEffect(() => {
    const update = () => {
      const m = window.innerWidth < 768;
      const r = document.documentElement.style;
      r.setProperty("--pad-main", m ? "10px" : "42px");
      r.setProperty("--pad-hdr", m ? "12px 14px" : "20px 42px");
      r.setProperty("--pad-nav", m ? "0 8px" : "0 42px");
      r.setProperty("--pad-card", m ? "14px" : "28px");
      r.setProperty("--pad-cell", m ? "8px 8px" : "14px 18px");
      r.setProperty("--font-tbl", m ? "14px" : "19px");
      r.setProperty("--font-th", m ? "11px" : "17px");
      r.setProperty("--font-td", m ? "14px" : "18px");
      r.setProperty("--font-tab", m ? "14px" : "17px");
      r.setProperty("--pad-tab", m ? "12px 12px" : "16px 24px");
      r.setProperty("--max-w", m ? "100%" : "2200px");
      r.setProperty("--grid-4", m ? "2" : "4");
      r.setProperty("--grid-3", m ? "1" : "3");
      r.setProperty("--hdr-dir", m ? "column" : "row");
      r.setProperty("--stat-val", m ? "26px" : "36px");
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
}

const s = {
  app: { fontFamily: "'Source Sans 3','Segoe UI',sans-serif", background: C.bg, color: C.text, minHeight: "100vh", fontSize: 17 },
  hdr: { background: "linear-gradient(135deg, #1A2332 0%, #0F1419 100%)", borderBottom: `1px solid ${C.border}`, padding: "var(--pad-hdr)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14, flexDirection: "var(--hdr-dir)" },
  nav: { display: "flex", gap: 2, padding: "var(--pad-nav)", background: C.bg, borderBottom: `1px solid ${C.border}`, overflowX: "auto" },
  tab: (a) => ({ padding: "var(--pad-tab)", cursor: "pointer", fontSize: "var(--font-tab)", fontWeight: a ? 700 : 500, color: a ? C.text : C.muted, background: "none", border: "none", borderBottom: `2px solid ${a ? C.amber : "transparent"}`, whiteSpace: "nowrap" }),
  main: { padding: "var(--pad-main)", maxWidth: "var(--max-w)", margin: "0 auto" },
  card: { background: C.card, borderRadius: 12, padding: "var(--pad-card)", border: `1px solid ${C.border}` },
  grid: (c) => ({ display: "grid", gridTemplateColumns: c === 4 ? "repeat(var(--grid-4), 1fr)" : c === 3 ? "repeat(var(--grid-3), 1fr)" : `repeat(${c}, 1fr)`, gap: 18 }),
  title: { fontSize: 22, fontWeight: 700, marginBottom: 18, color: C.text },
  tbl: { width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: "var(--font-tbl)" },
  th: { textAlign: "left", padding: "var(--pad-cell)", color: C.muted, fontWeight: 600, fontSize: "var(--font-th)", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: `1px solid ${C.border}`, background: C.card, whiteSpace: "nowrap" },
  thR: { textAlign: "right", padding: "var(--pad-cell)", color: C.muted, fontWeight: 600, fontSize: "var(--font-th)", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: `1px solid ${C.border}`, background: C.card, whiteSpace: "nowrap" },
  td: { padding: "var(--pad-cell)", borderBottom: `1px solid rgba(47,51,54,0.4)`, color: C.text, fontSize: "var(--font-td)" },
  tdR: { padding: "var(--pad-cell)", borderBottom: `1px solid rgba(47,51,54,0.4)`, textAlign: "right", fontVariantNumeric: "tabular-nums", color: C.text, fontSize: "var(--font-td)" },
  btn: { padding: "8px 18px", borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: "pointer", border: "none" },
  btnP: { background: C.amber, color: "#fff" }, btnG: { background: C.border, color: C.muted }, btnD: { background: "#7F1D1D", color: "#FCA5A5" },
  tog: (a) => ({ padding: "8px 18px", borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: "pointer", background: a ? C.amber : C.border, color: a ? "#fff" : C.muted, border: "none" }),
};
function Stat({ label, value, sub, color }) {
  return <div style={s.card}><div style={{ fontSize: 14, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginBottom: 6 }}>{label}</div><div style={{ fontSize: "var(--stat-val)", fontWeight: 700, color: color || C.text }}>{value}</div>{sub && <div style={{ fontSize: 15, color: C.muted, marginTop: 4 }}>{sub}</div>}</div>;
}

// ═══════════════════════════════════════════════════════════════════════════
// EDITABLE CELL
// ═══════════════════════════════════════════════════════════════════════════
function E({ value, onSave, dec = 2, prefix = "$", f = "number", style: st = {}, ph = "—" }) {
  const [ed, setEd] = useState(false);
  const [dr, setDr] = useState("");
  const ref = useRef(null);
  const start = () => { setDr(value != null ? String(value) : ""); setEd(true); };
  useEffect(() => { if (ed && ref.current) ref.current.focus(); }, [ed]);
  const commit = () => { setEd(false); if (dr === "") { onSave(f === "text" ? "" : null); return; } if (f === "text") { onSave(dr); return; } const n = parseFloat(dr); if (!isNaN(n)) onSave(n); };
  if (f === "bool") return <span onClick={() => onSave(!value)} style={{ cursor: "pointer", ...st }}><span style={badge(value ? C.green : C.amber)}>{value ? "Delivered" : "Open"}</span></span>;
  if (ed) return <input ref={ref} value={dr} onChange={e => setDr(e.target.value)} onBlur={commit} onKeyDown={e => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEd(false); }} style={{ background: C.bg, border: `1px solid ${C.amber}`, borderRadius: 4, color: C.text, padding: "2px 6px", width: f === "text" ? 180 : 80, fontSize: 13, fontVariantNumeric: "tabular-nums", outline: "none", ...st }} />;
  let d = ph; if (value != null && value !== "") { if (f === "number") d = prefix + fmt(value, dec); else if (f === "int") d = fmt(value, 0); else d = String(value); }
  return <span onClick={start} title="Click to edit" style={{ cursor: "pointer", borderBottom: "1px dashed rgba(113,118,123,0.4)", paddingBottom: 1, ...st }}>{d}</span>;
}
const Calc = ({ value, dec = 2, prefix = "$", color }) => <span style={{ fontVariantNumeric: "tabular-nums", color: color || C.text }}>{prefix}{fmt(value, dec)}</span>;

// ═══════════════════════════════════════════════════════════════════════════
// COLLAPSIBLE SECTION
// ═══════════════════════════════════════════════════════════════════════════
function Sec({ title, emoji, children, btext, open: defOpen = false }) {
  const [open, setOpen] = useState(defOpen);
  return <div style={{ background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, marginBottom: 12, overflow: "hidden" }}>
    <div style={{ padding: "12px 16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", userSelect: "none" }} onClick={() => setOpen(!open)}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 16 }}>{emoji}</span><span style={{ fontSize: 14, fontWeight: 700 }}>{title}</span>{btext && <span style={badge(C.amber)}>{btext}</span>}</div>
      <span style={{ color: C.muted, fontSize: 18, transform: open ? "rotate(180deg)" : "none", transition: "0.2s" }}>▾</span>
    </div>{open && <div style={{ padding: "0 16px 16px", overflowX: "auto" }}>{children}</div>}</div>;
}

// ═══════════════════════════════════════════════════════════════════════════
// AUTH HOOK
// ═══════════════════════════════════════════════════════════════════════════
function useAuth() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);
  const signIn = () => supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } });
  const signOut = () => supabase.auth.signOut();
  return { user, authLoading, signIn, signOut };
}

// ═══════════════════════════════════════════════════════════════════════════
// STORAGE HOOK (Supabase)
// ═══════════════════════════════════════════════════════════════════════════
function useStorage(userId) {
  const [years, setYears] = useState([]); const [yr, setYr] = useState(2025); const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true); const [ss, setSs] = useState("saved"); const tmr = useRef(null);

  const save = useCallback(async (d) => {
    if (!userId) return;
    setSs("saving");
    try {
      const { error } = await supabase.from("farm_data").upsert(
        { user_id: userId, year: d.year, data: d, updated_at: new Date().toISOString() },
        { onConflict: "user_id,year" }
      );
      if (error) throw error;
      setSs("saved");
    } catch { setSs("error"); }
  }, [userId]);

  const dsave = useCallback((d) => { setSs("unsaved"); if (tmr.current) clearTimeout(tmr.current); tmr.current = setTimeout(() => save(d), 1200); }, [save]);

  const loadYrs = useCallback(async () => {
    if (!userId) return [];
    try {
      const { data: rows, error } = await supabase.from("farm_data").select("year").eq("user_id", userId).order("year", { ascending: false });
      if (error) throw error;
      if (rows?.length) { const y = rows.map(r => r.year); setYears(y); return y; }
    } catch {}
    return [];
  }, [userId]);

  const loadYr = useCallback(async (y) => {
    if (!userId) return null;
    try {
      const { data: row, error } = await supabase.from("farm_data").select("data").eq("user_id", userId).eq("year", y).single();
      if (error) throw error;
      if (row?.data) { setData(row.data); setYr(y); return row.data; }
    } catch {}
    const d = defaultData(y); setData(d); setYr(y); return d;
  }, [userId]);

  const upd = useCallback((fn) => { setData(prev => { const n = fn(JSON.parse(JSON.stringify(prev))); dsave(n); return n; }); }, [dsave]);

  const copyYr = useCallback(async (from, to) => {
    if (!userId) return;
    let src;
    try {
      const { data: row } = await supabase.from("farm_data").select("data").eq("user_id", userId).eq("year", from).single();
      src = row?.data || defaultData(from);
    } catch { src = defaultData(from); }
    const cp = JSON.parse(JSON.stringify(src)); cp.year = to;
    cp.crops.forEach(c => { c.actualYield = null; c.actualPrice = null; });
    cp.contracts = {}; cp.marketingGroups.forEach(g => { cp.contracts[g.id] = []; }); cp.grainTickets = []; cp.capitalPlan = []; cp.wishList = []; cp.inventorySnapshots = [];
    await save(cp);
    setYears(p => [...new Set([to, ...p])].sort((a, b) => b - a)); setData(cp); setYr(to);
  }, [userId, save]);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    (async () => {
      setLoading(true);
      const y = await loadYrs();
      if (y.length) await loadYr(y[0]);
      else { const d = defaultData(2025); await save(d); setYears([2025]); setData(d); }
      setLoading(false);
    })();
  }, [userId]);

  const seedHistory = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch("/seed-payload.json");
      const seedData = await res.json();
      for (const [yearStr, yearData] of Object.entries(seedData)) {
        const y = parseInt(yearStr);
        console.log(`Seeding ${y}...`);
        const { error } = await supabase.from("farm_data").upsert(
          { user_id: userId, year: y, data: yearData, updated_at: new Date().toISOString() },
          { onConflict: "user_id,year" }
        );
        if (error) console.error(`Error seeding ${y}:`, error.message);
        else console.log(`✓ Seeded ${y}`);
      }
      const y = await loadYrs();
      if (y.length) await loadYr(y[0]);
    } catch(e) { console.error("Seed error:", e); }
    setLoading(false);
  }, [userId, save, loadYrs, loadYr]);

  return { years, yr, data, loading, ss, loadYr, upd, copyYr, seedHistory };
}

// ═══════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════
function Dash({ d }) {
  const t = ta(d), tI = d.crops.reduce((a, c) => a + cropIncome(d, c) * c.acres, 0), tC = d.crops.reduce((a, c) => a + cropCost(d, c.id) * c.acres, 0), net = tI - tC;
  return <div>
    <div style={{ ...s.grid(4), marginBottom: 24 }}>
      <Stat label="Total Planted Acres" value={fmt(t, 1)} sub={`${d.crops.length} crop types`} />
      <Stat label="Projected Gross Income" value={fmtK(tI)} sub={`${fmtD(tI/t)}/ac`} color={C.green} />
      <Stat label="Total Costs" value={fmtK(tC)} sub={`${fmtD(tC/t)}/ac`} color={C.red} />
      <Stat label="Net Returns" value={fmtK(net)} sub={`${fmtD(net/t)}/ac`} color={net>=0?C.green:C.red} />
    </div>
    <div style={{ ...s.card, marginBottom: 24 }}><div style={s.title}>Crop P&L Summary</div>
      <table style={s.tbl}><thead><tr><th style={s.th}>Crop</th><th style={s.thR}>Acres</th><th style={s.thR}>Income/ac</th><th style={s.thR}>Cost/ac</th><th style={s.thR}>Return/ac</th><th style={s.thR}>Total Net</th></tr></thead>
      <tbody>{d.crops.map(c => { const i = cropIncome(d, c), co = cropCost(d, c.id), r = i - co; return <tr key={c.id}><td style={s.td}><span style={{ borderLeft: `3px solid ${c.color}`, paddingLeft: 8 }}>{c.name}</span></td><td style={s.tdR}>{fmt(c.acres)}</td><td style={s.tdR}>{fmtD(i)}</td><td style={s.tdR}>{fmtD(co)}</td><td style={{ ...s.tdR, color: r>=0?C.green:C.red, fontWeight: 600 }}>{fmtD(r)}</td><td style={{ ...s.tdR, color: r>=0?C.green:C.red }}>{fmtK(r * c.acres)}</td></tr>; })}</tbody></table>
    </div>
    <div style={s.card}><div style={s.title}>Marketing Position</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>{(d.marketingGroups||[]).map(g => {
        const prod = d.crops.filter(c => g.cropIds.includes(c.id)).reduce((a, c) => a + c.acres * c.budgetYield, 0);
        const con = (d.contracts[g.id] || []).reduce((a, c) => a + c.units, 0);
        const pct = prod > 0 ? (con / prod) * 100 : 0;
        return <div key={g.id}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ fontSize: 13, fontWeight: 600 }}>{g.name}</span><span style={{ fontSize: 12, color: C.muted }}>{fmt(con)} / {fmt(prod)} bu ({pct.toFixed(1)}%)</span></div>
          <div style={{ background: C.border, borderRadius: 6, height: 24, overflow: "hidden" }}><div style={{ width: `${Math.min(pct,100)}%`, height: "100%", background: g.color, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 8, fontSize: 11, fontWeight: 700, color: "#fff" }}>{pct > 8 ? pct.toFixed(0)+"%" : ""}</div></div></div>;
      })}</div>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════════════════
// CROP BUDGETS TAB
// ═══════════════════════════════════════════════════════════════════════════
function BudgetsTab({ d, upd }) {
  const u = (fn) => upd(p => { fn(p); return p; }); const t = ta(d);
  const ci = (idx) => d.crops[idx]?.id;
  const addCrop = () => u(p => { const nid = "c" + (Date.now() % 100000); p.crops.push({ id: nid, name: "New Crop", acres: 0, budgetYield: 0, actualYield: null, budgetPrice: 0, actualPrice: null, color: "#6B7280", seedBag: 80000, seedRate: 0, seedPrice: 0, marketGroup: "", dryingPerBu: 0, irrInches: 0 }); p.rentPerCrop[nid] = 0; });
  const delCrop = (idx) => u(p => { const cid = p.crops[idx].id; p.crops.splice(idx, 1); delete p.rentPerCrop[cid]; });

  return <div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
      <div style={s.title}>Budget Summary — {d.year}</div>
      <div style={{ display: "flex", gap: 8 }}><span style={{ fontSize: 11, color: C.muted, alignSelf: "center" }}>Calculated from inputs below</span><button style={{ ...s.btn, ...s.btnP }} onClick={addCrop}>+ Add Crop</button></div>
    </div>
    <div style={{ ...s.card, marginBottom: 16, overflowX: "auto" }}>
      <table style={s.tbl}><thead><tr><th style={{ ...s.th, minWidth: 160 }}>Line Item</th>
        {d.crops.map((c, i) => <th key={c.id} style={{ ...s.thR, minWidth: 90 }}><span style={{ borderLeft: `3px solid ${c.color}`, paddingLeft: 6 }}><E value={c.name} f="text" onSave={v => u(p => { p.crops[i].name = v; })} prefix="" style={{ fontWeight: 600, fontSize: 11 }} /></span></th>)}
      </tr></thead><tbody>
        <tr><td style={{ ...s.td, fontWeight: 600 }}>Planted Acres</td>{d.crops.map((c, i) => <td key={c.id} style={s.tdR}><E value={c.acres} onSave={v => u(p => { p.crops[i].acres = v; })} dec={1} prefix="" f="plain" /></td>)}</tr>
        <tr><td style={{ ...s.td, fontWeight: 600 }}>Seeds/bag</td>{d.crops.map((c, i) => <td key={c.id} style={s.tdR}><E value={c.seedBag} onSave={v => u(p => { p.crops[i].seedBag = v; })} dec={0} prefix="" f="int" /></td>)}</tr>
        <tr><td style={{ ...s.td, fontWeight: 600 }}>Color</td>{d.crops.map((c, i) => <td key={c.id} style={s.tdR}><input type="color" value={c.color} onChange={e => u(p => { p.crops[i].color = e.target.value; })} style={{ width: 30, height: 20, border: "none", background: "none", cursor: "pointer" }} /></td>)}</tr>
        <tr><td colSpan={d.crops.length+1} style={{ ...s.td, fontWeight: 700, color: C.green, fontSize: 11, textTransform: "uppercase", padding: "12px 10px 4px" }}>Income</td></tr>
        <tr><td style={{ ...s.td, paddingLeft: 18 }}>Yield (bu/ac)</td>{d.crops.map((c, i) => <td key={c.id} style={s.tdR}><E value={c.budgetYield} onSave={v => u(p => { p.crops[i].budgetYield = v; })} dec={1} prefix="" f="plain" /></td>)}</tr>
        <tr><td style={{ ...s.td, paddingLeft: 18 }}>Price/bu</td>{d.crops.map((c, i) => <td key={c.id} style={s.tdR}><E value={c.budgetPrice} onSave={v => u(p => { p.crops[i].budgetPrice = v; })} dec={3} /></td>)}</tr>
        {(d.incomeItems||[]).map((item, ii) => <tr key={item.id}><td style={{ ...s.td, paddingLeft: 18 }}><E value={item.name} f="text" onSave={v => u(p => { p.incomeItems[ii].name = v; })} prefix="" /></td>{d.crops.map(c => <td key={c.id} style={s.tdR}><E value={item.perAc} onSave={v => u(p => { p.incomeItems[ii].perAc = v; })} /></td>)}</tr>)}
        <tr><td style={{ ...s.td, paddingLeft: 18 }}><button style={{ ...s.btn, ...s.btnG, fontSize: 11, padding: "2px 8px" }} onClick={() => u(p => { p.incomeItems.push({ id: "i" + Date.now(), name: "New Item", perAc: 0 }); })}>+ income item</button></td></tr>
        <tr style={{ background: "rgba(16,185,129,0.08)" }}><td style={{ ...s.td, fontWeight: 700, color: C.green }}>Total Returns/ac</td>{d.crops.map(c => <td key={c.id} style={{ ...s.tdR, fontWeight: 700, color: C.green }}><Calc value={cropIncome(d, c)} /></td>)}</tr>
        <tr><td colSpan={d.crops.length+1} style={{ ...s.td, fontWeight: 700, color: C.red, fontSize: 11, textTransform: "uppercase", padding: "14px 10px 4px" }}>Expenses (calculated)</td></tr>
        {getLines(d, d.crops[0]?.id).map(l => <tr key={l.key}><td style={{ ...s.td, paddingLeft: 18 }}>{l.label}</td>{d.crops.map(c => <td key={c.id} style={s.tdR}><Calc value={getLines(d, c.id).find(x => x.key === l.key)?.val || 0} /></td>)}</tr>)}
        <tr style={{ background: "rgba(239,68,68,0.08)" }}><td style={{ ...s.td, fontWeight: 700, color: C.red }}>Total Costs/ac</td>{d.crops.map(c => <td key={c.id} style={{ ...s.tdR, fontWeight: 700, color: C.red }}><Calc value={cropCost(d, c.id)} /></td>)}</tr>
        <tr style={{ background: "rgba(217,119,6,0.1)" }}><td style={{ ...s.td, fontWeight: 700, color: C.amber, fontSize: 14 }}>Returns Over Costs</td>{d.crops.map(c => { const r = cropIncome(d, c) - cropCost(d, c.id); return <td key={c.id} style={{ ...s.tdR, fontWeight: 700, fontSize: 14, color: r>=0?C.green:C.red }}>{fmtD(r)}</td>; })}</tr>
        <tr><td style={{ ...s.td, color: C.muted }}>Delete crop</td>{d.crops.map((c, i) => <td key={c.id} style={s.tdR}><button onClick={() => { if(confirm(`Delete ${c.name}?`)) delCrop(i); }} style={{ ...s.btn, ...s.btnD, padding: "2px 8px", fontSize: 10 }}>✕</button></td>)}</tr>
      </tbody></table>
    </div>

    {/* INPUT SECTIONS */}
    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Input Tables — click to expand</div>

    <Sec title="Seed Inputs" emoji="🌱" btext={`Avg ${fmtD(d.crops.reduce((a,c) => a + calcSeed(c)*c.acres, 0)/t)}/ac`}>
      <table style={s.tbl}><thead><tr><th style={s.th}>Input</th>{d.crops.map(c => <th key={c.id} style={s.thR}><span style={{ borderLeft: `3px solid ${c.color}`, paddingLeft: 6 }}>{c.name}</span></th>)}</tr></thead><tbody>
        <tr><td style={s.td}>Seeding Rate</td>{d.crops.map((c, i) => <td key={c.id} style={s.tdR}><E value={c.seedRate} onSave={v => u(p => { p.crops[i].seedRate = v; })} dec={0} prefix="" f="int" /></td>)}</tr>
        <tr><td style={s.td}>Seed $/bag</td>{d.crops.map((c, i) => <td key={c.id} style={s.tdR}><E value={c.seedPrice} onSave={v => u(p => { p.crops[i].seedPrice = v; })} /></td>)}</tr>
        <tr style={{ background: "rgba(217,119,6,0.06)" }}><td style={{ ...s.td, fontWeight: 700, color: C.amber }}>Seed Cost/ac</td>{d.crops.map(c => <td key={c.id} style={{ ...s.tdR, fontWeight: 700, color: C.amber }}><Calc value={calcSeed(c)} /></td>)}</tr>
      </tbody></table></Sec>

    <Sec title="Fertilizer & Lime" emoji="🧪" btext={`Avg ${fmtD(d.crops.reduce((a,c) => a + calcFert(d,c.id)*c.acres, 0)/t)}/ac`}>
      <table style={s.tbl}><thead><tr><th style={s.th}>Product</th><th style={s.thR}>Price</th><th style={s.th}>Unit</th><th style={s.thR}>Mult</th>{d.crops.map(c => <th key={c.id} style={s.thR}><span style={{ borderLeft: `3px solid ${c.color}`, paddingLeft: 6 }}>lbs</span></th>)}<th style={s.th}></th></tr></thead><tbody>
        {(d.fertProducts||[]).map((p, pi) => <tr key={p.id}><td style={s.td}><E value={p.name} f="text" onSave={v => u(x => { x.fertProducts[pi].name = v; })} prefix="" /></td>
          <td style={s.tdR}><E value={p.isPerLb ? p.pricePerLb : p.pricePerTon} onSave={v => u(x => { if (p.isPerLb) x.fertProducts[pi].pricePerLb = v; else x.fertProducts[pi].pricePerTon = v; })} /></td>
          <td style={s.td}><E value={p.unit} f="text" onSave={v => u(x => { x.fertProducts[pi].unit = v; })} prefix="" style={{ fontSize: 11 }} /></td>
          <td style={s.tdR}><E value={p.mult} onSave={v => u(x => { x.fertProducts[pi].mult = v; })} dec={2} prefix="" f="plain" /></td>
          {d.crops.map(c => <td key={c.id} style={s.tdR}><E value={p.rates?.[c.id] || 0} onSave={v => u(x => { if (!x.fertProducts[pi].rates) x.fertProducts[pi].rates = {}; x.fertProducts[pi].rates[c.id] = v; })} dec={0} prefix="" f="int" /></td>)}
          <td style={s.td}><button onClick={() => u(x => { x.fertProducts.splice(pi, 1); })} style={{ ...s.btn, ...s.btnD, padding: "2px 6px", fontSize: 10 }}>✕</button></td></tr>)}
        {(d.fertFlats||[]).map((f, fi) => <tr key={f.id}><td style={s.td}><E value={f.name} f="text" onSave={v => u(x => { x.fertFlats[fi].name = v; })} prefix="" /><span style={{ fontSize: 10, color: C.muted, marginLeft: 4 }}>(flat)</span></td>
          <td colSpan={3} style={s.tdR}><E value={f.total} onSave={v => u(x => { x.fertFlats[fi].total = v; })} dec={0} /><span style={{ fontSize: 10, color: C.muted, marginLeft: 4 }}>total</span></td>
          {d.crops.map(c => <td key={c.id} style={{ ...s.tdR, color: C.muted, fontSize: 11 }}>{t > 0 ? fmtD((f.total || 0) / t) : "—"}</td>)}
          <td style={s.td}><button onClick={() => u(x => { x.fertFlats.splice(fi, 1); })} style={{ ...s.btn, ...s.btnD, padding: "2px 6px", fontSize: 10 }}>✕</button></td></tr>)}
        <tr style={{ background: "rgba(217,119,6,0.06)" }}><td colSpan={4} style={{ ...s.td, fontWeight: 700, color: C.amber }}>Total Fert/ac</td>{d.crops.map(c => <td key={c.id} style={{ ...s.tdR, fontWeight: 700, color: C.amber }}><Calc value={calcFert(d, c.id)} /></td>)}<td></td></tr>
      </tbody></table>
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}><button style={{ ...s.btn, ...s.btnP }} onClick={() => u(p => { p.fertProducts.push({ id: "f"+Date.now(), name: "New Product", pricePerTon: 0, unit: "/Ton", mult: 1, rates: {} }); })}>+ Product</button><button style={{ ...s.btn, ...s.btnG }} onClick={() => u(p => { p.fertFlats.push({ id: "ff"+Date.now(), name: "New Flat", total: 0 }); })}>+ Flat Total</button></div></Sec>

    <Sec title="Herbicide Passes" emoji="🌿" btext={`Avg ${fmtD(d.crops.reduce((a,c) => a + calcHerb(d,c.id)*c.acres, 0)/t)}/ac`}>
      <table style={s.tbl}><thead><tr><th style={s.th}>Pass</th><th style={s.thR}>$/ac</th>{d.crops.map(c => <th key={c.id} style={s.thR}><span style={{ borderLeft: `3px solid ${c.color}`, paddingLeft: 6 }}>Apply</span></th>)}<th></th></tr></thead><tbody>
        {(d.herbPasses||[]).map((p, pi) => <tr key={p.id}><td style={s.td}><E value={p.name} f="text" onSave={v => u(x => { x.herbPasses[pi].name = v; })} prefix="" /></td><td style={s.tdR}><E value={p.costPerAc} onSave={v => u(x => { x.herbPasses[pi].costPerAc = v; })} /></td>
          {d.crops.map(c => <td key={c.id} style={s.tdR}><E value={p.flags?.[c.id] || 0} onSave={v => u(x => { if (!x.herbPasses[pi].flags) x.herbPasses[pi].flags = {}; x.herbPasses[pi].flags[c.id] = v; })} dec={1} prefix="" f="plain" /></td>)}
          <td style={s.td}><button onClick={() => u(x => { x.herbPasses.splice(pi, 1); })} style={{ ...s.btn, ...s.btnD, padding: "2px 6px", fontSize: 10 }}>✕</button></td></tr>)}
        <tr style={{ background: "rgba(217,119,6,0.06)" }}><td colSpan={2} style={{ ...s.td, fontWeight: 700, color: C.amber }}>Total/ac</td>{d.crops.map(c => <td key={c.id} style={{ ...s.tdR, fontWeight: 700, color: C.amber }}><Calc value={calcHerb(d, c.id)} /></td>)}<td></td></tr>
      </tbody></table><div style={{ display: "flex", gap: 16, alignItems: "center", marginTop: 8, flexWrap: "wrap" }}><button style={{ ...s.btn, ...s.btnP }} onClick={() => u(p => { p.herbPasses.push({ id: "h"+Date.now(), name: "New Pass", costPerAc: 0, flags: {} }); })}>+ Add Pass</button><span style={{ fontSize: 12, color: C.muted }}>Herb Reconcile (flat $):</span><E value={d.herbReconcile || 0} onSave={v => u(p => { p.herbReconcile = v; })} dec={0} /><span style={{ fontSize: 11, color: C.muted }}>({t > 0 ? fmtD((d.herbReconcile||0)/t) : "—"}/ac)</span></div></Sec>

    <Sec title="Insecticide/Fungicide" emoji="🐛">
      <table style={s.tbl}><thead><tr><th style={s.th}>Product</th><th style={s.thR}>$/ac</th>{d.crops.map(c => <th key={c.id} style={s.thR}><span style={{ borderLeft: `3px solid ${c.color}`, paddingLeft: 6 }}>Apply</span></th>)}<th></th></tr></thead><tbody>
        {(d.insectProducts||[]).map((p, pi) => <tr key={p.id}><td style={s.td}><E value={p.name} f="text" onSave={v => u(x => { x.insectProducts[pi].name = v; })} prefix="" /></td><td style={s.tdR}><E value={p.costPerAc} onSave={v => u(x => { x.insectProducts[pi].costPerAc = v; })} /></td>
          {d.crops.map(c => <td key={c.id} style={s.tdR}><E value={p.flags?.[c.id] || 0} onSave={v => u(x => { if (!x.insectProducts[pi].flags) x.insectProducts[pi].flags = {}; x.insectProducts[pi].flags[c.id] = v; })} dec={0} prefix="" f="int" /></td>)}
          <td style={s.td}><button onClick={() => u(x => { x.insectProducts.splice(pi, 1); })} style={{ ...s.btn, ...s.btnD, padding: "2px 6px", fontSize: 10 }}>✕</button></td></tr>)}
        <tr style={{ background: "rgba(217,119,6,0.06)" }}><td colSpan={2} style={{ ...s.td, fontWeight: 700, color: C.amber }}>Total/ac</td>{d.crops.map(c => <td key={c.id} style={{ ...s.tdR, fontWeight: 700, color: C.amber }}><Calc value={calcInsect(d, c.id)} /></td>)}<td></td></tr>
      </tbody></table><button style={{ ...s.btn, ...s.btnP, marginTop: 8 }} onClick={() => u(p => { p.insectProducts.push({ id: "ip"+Date.now(), name: "New Product", costPerAc: 0, flags: {} }); })}>+ Add Product</button></Sec>

    <Sec title="Irrigation & Drying" emoji="💧">
      <table style={s.tbl}><thead><tr><th style={s.th}>Input</th>{d.crops.map(c => <th key={c.id} style={s.thR}><span style={{ borderLeft: `3px solid ${c.color}`, paddingLeft: 6 }}>{c.name}</span></th>)}</tr></thead><tbody>
        <tr><td style={s.td}>Irr Inches: <E value={d.irrCostPerInch} onSave={v => u(p => { p.irrCostPerInch = v; })} /> /in</td>{d.crops.map((c, i) => <td key={c.id} style={s.tdR}><E value={c.irrInches} onSave={v => u(p => { p.crops[i].irrInches = v; })} dec={1} prefix="" f="plain" /> → <Calc value={calcIrr(d, c)} /></td>)}</tr>
        <tr><td style={s.td}>Drying $/bu</td>{d.crops.map((c, i) => <td key={c.id} style={s.tdR}><E value={c.dryingPerBu} onSave={v => u(p => { p.crops[i].dryingPerBu = v; })} dec={3} /> → <Calc value={calcDrying(c)} /></td>)}</tr>
      </tbody></table></Sec>

    <Sec title="Fixed Overhead" emoji="🏗️" btext={`$${fmt(d.overheadItems.reduce((a,o) => a + (o.total||0), 0))} total`}>
      <table style={s.tbl}><thead><tr><th style={s.th}>Group</th><th style={s.th}>Item</th><th style={s.thR}>Total $</th><th style={s.thR}>$/ac</th><th></th></tr></thead><tbody>
        {d.overheadItems.map((o, oi) => <tr key={o.id}>
          <td style={s.td}><E value={o.group} f="text" onSave={v => u(p => { p.overheadItems[oi].group = v; })} prefix="" style={{ fontSize: 11, color: C.amber }} /></td>
          <td style={s.td}><E value={o.name} f="text" onSave={v => u(p => { p.overheadItems[oi].name = v; })} prefix="" /></td>
          <td style={s.tdR}><E value={o.total} onSave={v => u(p => { p.overheadItems[oi].total = v; })} dec={0} /></td>
          <td style={{ ...s.tdR, color: C.muted }}>{o.amyloseOnly ? fmtD(o.total / (d.crops.find(c => c.marketGroup === "amylose")?.acres || 1)) + " (amylose)" : t > 0 ? fmtD(o.total / t) : "—"}</td>
          <td style={s.td}><button onClick={() => u(p => { p.overheadItems.splice(oi, 1); })} style={{ ...s.btn, ...s.btnD, padding: "2px 6px", fontSize: 10 }}>✕</button></td></tr>)}
      </tbody></table><button style={{ ...s.btn, ...s.btnP, marginTop: 8 }} onClick={() => u(p => { p.overheadItems.push({ id: "o"+Date.now(), name: "New Item", total: 0, group: "Other" }); })}>+ Add Item</button>
      <div style={{ marginTop: 16, fontWeight: 700, fontSize: 13 }}>Rent per Crop ($/ac)</div>
      <div style={{ display: "flex", gap: 16, marginTop: 8, flexWrap: "wrap" }}>{d.crops.map((c, i) => <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ borderLeft: `3px solid ${c.color}`, paddingLeft: 6, fontSize: 12 }}>{c.name}:</span><E value={d.rentPerCrop?.[c.id] || 0} onSave={v => u(p => { if (!p.rentPerCrop) p.rentPerCrop = {}; p.rentPerCrop[c.id] = v; })} /></div>)}</div></Sec>
  </div>;
}

// ═══════════════════════════════════════════════════════════════════════════
// MARKETING TAB
// ═══════════════════════════════════════════════════════════════════════════
function MktTab({ d, upd, gid }) {
  const g = d.marketingGroups.find(m => m.id === gid); if (!g) return null;
  const u = (fn) => upd(p => { fn(p); return p; });
  const cts = d.contracts[gid] || []; const prod = d.crops.filter(c => g.cropIds.includes(c.id)).reduce((a, c) => a + c.acres * c.budgetYield, 0);
  const tU = cts.reduce((a, c) => a + c.units, 0), tD = cts.reduce((a, c) => a + c.units * c.cash, 0), pct = prod > 0 ? (tU/prod)*100 : 0;
  const tF = cts.reduce((a, c) => a + c.units * (c.futures || 0), 0), tB = cts.reduce((a, c) => a + c.units * (c.basis || 0), 0);
  let bal = prod;
  return <div>
    <div style={s.title}>{g.name} Marketing Plan</div>
    <div style={{ ...s.grid(3), marginBottom: 24 }}><Stat label="Production" value={fmt(prod)+" bu"} /><Stat label="Contracted" value={fmt(tU)+" bu"} sub={`${pct.toFixed(1)}% sold`} color={g.color} /><Stat label="Revenue" value={fmtK(tD)} sub={`Rem: ${fmt(prod-tU)} bu`} /></div>
    <div style={{ ...s.grid(3), marginBottom: 24 }}><Stat label="Avg Cash Price" value={tU>0?fmtD(tD/tU):"—"} /><Stat label="Avg Futures" value={tU>0?fmtD(tF/tU):"—"} /><Stat label="Avg Basis" value={tU>0?fmtD(tB/tU):"—"} color={tU>0&&(tB/tU)<0?C.red:C.green} /></div>
    <div style={s.card}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}><span style={{ fontWeight: 600 }}>Contracts</span><button style={{ ...s.btn, ...s.btnP }} onClick={() => u(p => { if(!p.contracts[gid]) p.contracts[gid]=[]; const mx = p.contracts[gid].reduce((m,c)=>Math.max(m,c.id),0); p.contracts[gid].push({id:mx+1,desc:"New",delDate:"",units:0,cash:0,basis:0,futures:0,delivered:false}); })}>+ Add</button></div>
    <table style={s.tbl}><thead><tr><th style={s.th}>#</th><th style={{ ...s.th, minWidth: 200 }}>Description</th><th style={s.th}>Del.</th><th style={s.thR}>Units</th><th style={s.thR}>Cash</th><th style={s.thR}>Basis</th><th style={s.thR}>Futures</th><th style={s.thR}>$ Amt</th><th style={s.thR}>Balance</th><th style={s.th}>Status</th><th></th></tr></thead><tbody>
      <tr><td colSpan={8} style={{ ...s.td, color: C.muted }}>Beginning Balance</td><td style={{ ...s.tdR, fontWeight: 600, color: g.color }}>{fmt(prod)}</td><td colSpan={2}></td></tr>
      {cts.map((c, i) => { bal -= c.units; return <tr key={c.id}><td style={{ ...s.td, color: C.muted }}>{c.id}</td><td style={s.td}><E value={c.desc} f="text" onSave={v => u(p => { p.contracts[gid][i].desc = v; })} prefix="" /></td><td style={s.td}><E value={c.delDate} f="text" onSave={v => u(p => { p.contracts[gid][i].delDate = v; })} prefix="" /></td><td style={s.tdR}><E value={c.units} f="int" onSave={v => u(p => { p.contracts[gid][i].units = v; })} prefix="" /></td><td style={s.tdR}><E value={c.cash} onSave={v => u(p => { p.contracts[gid][i].cash = v; })} dec={3} /></td><td style={{ ...s.tdR, color: c.basis<0?C.red:C.green }}><E value={c.basis} onSave={v => u(p => { p.contracts[gid][i].basis = v; })} dec={3} /></td><td style={s.tdR}><E value={c.futures} onSave={v => u(p => { p.contracts[gid][i].futures = v; })} dec={3} /></td><td style={s.tdR}>{fmtK(c.units*c.cash)}</td><td style={{ ...s.tdR, fontWeight: 600 }}>{fmt(bal)}</td><td style={s.td}><E value={c.delivered} f="bool" onSave={v => u(p => { p.contracts[gid][i].delivered = v; })} /></td><td style={s.td}><button onClick={() => u(p => { p.contracts[gid].splice(i, 1); })} style={{ ...s.btn, ...s.btnD, padding: "2px 6px", fontSize: 10 }}>✕</button></td></tr>; })}
    </tbody></table></div></div>;
}

// ═══════════════════════════════════════════════════════════════════════════
// GRAIN TICKETS TAB
// ═══════════════════════════════════════════════════════════════════════════
// Spreadsheet-style cell: always-visible input, Tab/Enter navigation
const TCOLS = [
  { key: "date", label: "Date", w: 100, type: "text", align: "left" },
  { key: "crop", label: "Crop", w: 90, type: "text", align: "left" },
  { key: "farm", label: "Farm", w: 120, type: "text", align: "left" },
  { key: "bushels", label: "Bushels", w: 85, type: "num", dec: 2, align: "right" },
  { key: "wetWeight", label: "Wet Wt", w: 75, type: "num", dec: 0, align: "right" },
  { key: "moisture", label: "Moist %", w: 70, type: "num", dec: 2, align: "right" },
  { key: "testWeight", label: "TW", w: 60, type: "num", dec: 1, align: "right" },
  { key: "fm", label: "FM %", w: 60, type: "num", dec: 2, align: "right" },
  { key: "destination", label: "Destination", w: 120, type: "text", align: "left" },
  { key: "notes", label: "Notes", w: 140, type: "text", align: "left" },
];
const cellSt = (focused, align) => ({
  background: focused ? "#1E2D3D" : C.bg,
  border: focused ? `2px solid ${C.amber}` : `1px solid ${C.border}`,
  borderRadius: 3,
  color: C.text,
  padding: focused ? "3px 5px" : "4px 6px",
  width: "100%",
  fontSize: 13,
  fontVariantNumeric: "tabular-nums",
  fontFamily: "'Source Sans 3','Segoe UI',sans-serif",
  outline: "none",
  textAlign: align || "left",
  boxSizing: "border-box",
});

// RFC 4180 CSV parser — handles quoted fields with embedded commas
function parseCSVRows(text) {
  const rows = []; let row = []; let cell = ""; let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQ) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') { inQ = false; }
      else { cell += ch; }
    } else {
      if (ch === '"') { inQ = true; }
      else if (ch === ",") { row.push(cell.trim()); cell = ""; }
      else if (ch === "\n" || (ch === "\r" && text[i + 1] === "\n")) {
        row.push(cell.trim()); cell = "";
        if (row.some(c => c)) rows.push(row);
        row = [];
        if (ch === "\r") i++;
      } else { cell += ch; }
    }
  }
  if (cell || row.length) { row.push(cell.trim()); if (row.some(c => c)) rows.push(row); }
  return rows;
}

// Auto-detect CSV column → ticket field mapping
const FIELD_DEFS = [
  { key: "date", label: "Date", match: ["date"] },
  { key: "crop", label: "Crop", match: ["commodity", "crop"] },
  { key: "bushels", label: "Bushels", match: ["net amount", "gross amount", "bushels", "bu"] },
  { key: "wetWeight", label: "Wet Weight", match: ["gross weight", "wet weight"] },
  { key: "moisture", label: "Moisture %", match: ["moisture corn", "moisture"] },
  { key: "testWeight", label: "Test Weight", match: ["test weight"] },
  { key: "fm", label: "FM %", match: ["bcfm", "foreign material", "fm"] },
  { key: "farm", label: "Farm", match: ["applied field names", "farm", "field"] },
  { key: "destination", label: "Destination", match: ["location", "destination"] },
  { key: "notes", label: "Notes", match: ["reference", "notes", "truck name"] },
];
function autoDetectMapping(headers) {
  const lh = headers.map(h => h.toLowerCase());
  const mapping = {};
  FIELD_DEFS.forEach(fd => {
    // Try each alias in priority order — first alias that hits wins
    for (const m of fd.match) {
      const exact = lh.findIndex(h => h === m);
      if (exact !== -1) { mapping[fd.key] = exact; return; }
    }
    for (const m of fd.match) {
      const partial = lh.findIndex(h => h.includes(m));
      if (partial !== -1) { mapping[fd.key] = partial; return; }
    }
  });
  return mapping;
}
function mapCropName(raw) {
  const l = (raw || "").toLowerCase();
  if (l.includes("amylose")) return "amylose";
  if (l.includes("bean") || l.includes("soy")) return "beans";
  if (l.includes("corn")) return "corn";
  return l || "corn";
}
const selectSt = {
  background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6,
  color: C.text, padding: "8px 12px", fontSize: 13, outline: "none",
  width: "100%", cursor: "pointer", appearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2371767B' d='M2 4l4 4 4-4'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center",
};

function TicketsTab({ d, upd }) {
  const u = (fn) => upd(p => { fn(p); return p; });
  const [filter, setFilter] = useState("all");
  const [sortCol, setSortCol] = useState(null); // TCOLS key or "dryBushels"
  const [sortAsc, setSortAsc] = useState(true);
  const [importStep, setImportStep] = useState(0); // 0=closed, 1=upload, 2=map+preview
  const [quickAdd, setQuickAdd] = useState(false);
  const [qaForm, setQaForm] = useState({ date: "", crop: "beans", bushels: "", wetWeight: "", moisture: "", testWeight: "", fm: "", destination: "Cargill KC", farm: "", notes: "" });
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [csvData, setCsvData] = useState([]);
  const [colMapping, setColMapping] = useState({});
  const [dragOver, setDragOver] = useState(false);
  const [focusCell, setFocusCell] = useState(null); // {row, col}
  const gridRef = useRef({});  // gridRef.current["r-c"] = input element
  const fileRef = useRef(null);
  const tickets = d.grainTickets || [];
  const base = filter === "all" ? tickets : tickets.filter(t => t.crop === filter);
  const filtered = sortCol ? [...base].sort((a, b) => {
    const col = TCOLS.find(c => c.key === sortCol);
    let av = sortCol === "dryBushels" ? (a.dryBushels || a.bushels || 0) : a[sortCol];
    let bv = sortCol === "dryBushels" ? (b.dryBushels || b.bushels || 0) : b[sortCol];
    if (col?.type === "num" || sortCol === "dryBushels") { av = Number(av) || 0; bv = Number(bv) || 0; }
    else { av = String(av || "").toLowerCase(); bv = String(bv || "").toLowerCase(); }
    return av < bv ? (sortAsc ? -1 : 1) : av > bv ? (sortAsc ? 1 : -1) : 0;
  }) : base;
  const totalBu = filtered.reduce((a, t) => a + (t.dryBushels || t.bushels || 0), 0);
  const toggleSort = (key) => { if (sortCol === key) { setSortAsc(!sortAsc); } else { setSortCol(key); setSortAsc(true); } };
  const cropGroups = [{ id: "all", name: "All Tickets" }, ...d.marketingGroups];

  const emptyTicket = () => ({ id: Date.now() + Math.random(), date: new Date().toISOString().slice(0, 10), crop: filter === "all" ? "corn" : filter, bushels: 0, wetWeight: 0, moisture: 0, testWeight: 0, fm: 0, dryBushels: 0, farm: "", destination: "", notes: "" });

  const recalcDry = (t) => {
    t.dryBushels = (t.moisture > 15.5 && t.bushels > 0) ? t.bushels * (1 - (t.moisture - 15.5) * 0.012) : t.bushels;
  };

  const focusTo = useCallback((row, col) => {
    setFocusCell({ row, col });
    setTimeout(() => {
      const el = gridRef.current[`${row}-${col}`];
      if (el) { el.focus(); el.select?.(); }
    }, 0);
  }, []);

  const handleNav = useCallback((row, col, e) => {
    const isTab = e.key === "Tab";
    const isEnter = e.key === "Enter";
    const isShiftTab = isTab && e.shiftKey;
    if (!isTab && !isEnter) return;
    e.preventDefault();

    if (isShiftTab) {
      // Move backward
      if (col > 0) { focusTo(row, col - 1); }
      else if (row > 0) { focusTo(row - 1, TCOLS.length - 1); }
      return;
    }
    if (isTab) {
      // Move forward in row
      if (col < TCOLS.length - 1) { focusTo(row, col + 1); }
      else {
        // Last column — add new row if on last row, then move to first col of next
        if (row >= filtered.length - 1) {
          u(p => { if (!p.grainTickets) p.grainTickets = []; p.grainTickets.push(emptyTicket()); });
        }
        setTimeout(() => focusTo(row + 1, 0), 50);
      }
      return;
    }
    if (isEnter) {
      // Move down same column, add row if needed
      if (row >= filtered.length - 1) {
        u(p => { if (!p.grainTickets) p.grainTickets = []; p.grainTickets.push(emptyTicket()); });
      }
      setTimeout(() => focusTo(row + 1, col), 50);
    }
  }, [filtered.length, filter, focusTo, u]);

  const updateCell = useCallback((idx, key, rawVal) => {
    u(p => {
      const t = p.grainTickets[idx]; if (!t) return;
      const col = TCOLS.find(c => c.key === key);
      if (col?.type === "num") { const n = parseFloat(rawVal); t[key] = isNaN(n) ? 0 : n; }
      else { t[key] = rawVal; }
      recalcDry(t);
    });
  }, [u]);

  // CSV import — multi-step with column mapping
  const processCSVText = (text) => {
    const rows = parseCSVRows(text);
    if (rows.length < 2) return;
    const headers = rows[0];
    const data = rows.slice(1);
    setCsvHeaders(headers);
    setCsvData(data);
    setColMapping(autoDetectMapping(headers));
    setImportStep(2);
  };
  const handleFile = (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = (ev) => processCSVText(ev.target.result);
    r.readAsText(f);
  };
  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) { const r = new FileReader(); r.onload = (ev) => processCSVText(ev.target.result); r.readAsText(f); }
  };
  const buildTickets = () => {
    return csvData.map((row, i) => {
      const get = (key) => colMapping[key] != null ? (row[colMapping[key]] || "") : "";
      const t = {
        id: Date.now() + i + Math.random(),
        date: get("date").slice(0, 10),
        crop: mapCropName(get("crop")),
        bushels: parseFloat(get("bushels")) || 0,
        wetWeight: parseFloat(get("wetWeight")) || 0,
        moisture: parseFloat(get("moisture")) || 0,
        testWeight: parseFloat(get("testWeight")) || 0,
        fm: parseFloat(get("fm")) || 0,
        farm: get("farm"),
        destination: get("destination"),
        notes: get("notes"),
      };
      recalcDry(t);
      return t;
    });
  };
  const handleImport = () => {
    const nt = buildTickets();
    if (nt.length) {
      u(p => { if (!p.grainTickets) p.grainTickets = []; p.grainTickets.push(...nt); });
    }
    setImportStep(0); setCsvHeaders([]); setCsvData([]); setColMapping({});
  };
  const cancelImport = () => { setImportStep(0); setCsvHeaders([]); setCsvData([]); setColMapping({}); };
  const qaRefs = useRef({});
  const qaSubmit = () => {
    const t = {
      id: Date.now() + Math.random(),
      date: qaForm.date, crop: qaForm.crop,
      bushels: parseFloat(qaForm.bushels) || 0,
      wetWeight: parseFloat(qaForm.wetWeight) || 0,
      moisture: parseFloat(qaForm.moisture) || 0,
      testWeight: parseFloat(qaForm.testWeight) || 0,
      fm: parseFloat(qaForm.fm) || 0,
      farm: qaForm.farm, destination: qaForm.destination, notes: qaForm.notes,
    };
    recalcDry(t);
    u(p => { if (!p.grainTickets) p.grainTickets = []; p.grainTickets.push(t); });
    // Reset number fields but keep date/crop/destination/farm for next ticket
    setQaForm(prev => ({ ...prev, bushels: "", wetWeight: "", moisture: "", testWeight: "", fm: "", notes: "" }));
    setTimeout(() => qaRefs.current.bushels?.focus(), 50);
  };

  const addAndFocus = () => {
    u(p => { if (!p.grainTickets) p.grainTickets = []; p.grainTickets.push(emptyTicket()); });
    setTimeout(() => focusTo(filtered.length, 0), 50);
  };

  return <div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
      <div style={s.title}>Grain Tickets — {d.year}</div>
      <div style={{ display: "flex", gap: 8 }}>
        <button style={{ ...s.btn, ...s.btnG }} onClick={() => importStep ? cancelImport() : setImportStep(1)}>
          {importStep ? "Cancel Import" : "Import CSV"}
        </button>
        <button style={{ ...s.btn, ...s.btnG }} onClick={() => setQuickAdd(!quickAdd)}>
          {quickAdd ? "Close Quick Add" : "Quick Add"}
        </button>
        <button style={{ ...s.btn, ...s.btnP }} onClick={addAndFocus}>+ Add Ticket</button>
      </div>
    </div>

    {/* Quick Add — optimized for punching in paper tickets */}
    {quickAdd && <div style={{ ...s.card, marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 700 }}>Quick Add Ticket</div>
        <div style={{ fontSize: 13, color: C.muted }}>Enter values from paper ticket, then Save & Next</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12, marginBottom: 16 }}>
        {[
          { key: "date", label: "Date", placeholder: "MM/DD/YY", type: "text" },
          { key: "crop", label: "Crop", type: "select", options: [["beans","Soybeans"],["corn","Corn"],["amylose","Amylose"]] },
          { key: "bushels", label: "Net Bushels", placeholder: "981.00", type: "num" },
          { key: "wetWeight", label: "Gross Weight (lb)", placeholder: "88120", type: "num" },
          { key: "moisture", label: "Moisture %", placeholder: "11.90", type: "num" },
          { key: "testWeight", label: "Test Weight", placeholder: "55.5", type: "num" },
          { key: "fm", label: "FM %", placeholder: "0.2", type: "num" },
          { key: "destination", label: "Destination", placeholder: "Cargill KC", type: "text" },
          { key: "farm", label: "Farm", placeholder: "", type: "text" },
          { key: "notes", label: "Notes", placeholder: "", type: "text" },
        ].map(f => (
          <div key={f.key}>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 4, fontWeight: 600, textTransform: "uppercase" }}>{f.label}</div>
            {f.type === "select" ? (
              <select
                value={qaForm[f.key]}
                onChange={e => setQaForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                style={{ ...selectSt, padding: "10px 12px" }}
              >
                {f.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            ) : (
              <input
                ref={el => { qaRefs.current[f.key] = el; }}
                value={qaForm[f.key]}
                onChange={e => setQaForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                onKeyDown={e => { if (e.key === "Enter") qaSubmit(); }}
                placeholder={f.placeholder}
                style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, padding: "10px 12px", fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box", fontVariantNumeric: "tabular-nums" }}
              />
            )}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <button style={{ ...s.btn, ...s.btnP, padding: "10px 24px", fontSize: 15 }} onClick={qaSubmit}>Save & Next</button>
        <button style={{ ...s.btn, ...s.btnG }} onClick={() => setQuickAdd(false)}>Done</button>
        <div style={{ fontSize: 13, color: C.muted }}>Keeps date/crop/destination for the next ticket</div>
      </div>
    </div>}

    {/* Step 1: Upload */}
    {importStep === 1 && <div style={{ ...s.card, marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <div style={{ background: C.amber, color: "#fff", width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700 }}>1</div>
        <div style={{ fontSize: 16, fontWeight: 700 }}>Upload CSV File</div>
        <div style={{ fontSize: 13, color: C.muted }}>Supports Ingredion exports and standard CSV formats</div>
      </div>
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? C.amber : C.border}`,
          borderRadius: 12, padding: "40px 24px", textAlign: "center",
          cursor: "pointer", transition: "border-color 0.2s, background 0.2s",
          background: dragOver ? "rgba(217,119,6,0.06)" : "transparent",
        }}
      >
        <div style={{ fontSize: 32, marginBottom: 8, opacity: 0.6 }}>CSV</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 4 }}>Drop a CSV file here or click to browse</div>
        <div style={{ fontSize: 13, color: C.muted }}>Columns will be auto-detected and mapped</div>
        <input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleFile} style={{ display: "none" }} />
      </div>
    </div>}

    {/* Step 2: Map columns + Preview */}
    {importStep === 2 && <div style={{ ...s.card, marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{ background: C.amber, color: "#fff", width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700 }}>2</div>
        <div style={{ fontSize: 16, fontWeight: 700 }}>Map Columns</div>
        <div style={{ fontSize: 13, color: C.muted }}>{csvData.length} rows found in CSV</div>
      </div>

      {/* Column mapping grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24, maxWidth: 700 }}>
        {FIELD_DEFS.map(fd => (
          <div key={fd.key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 110, fontSize: 13, fontWeight: 600, color: C.text, flexShrink: 0 }}>{fd.label}</div>
            <select
              value={colMapping[fd.key] ?? ""}
              onChange={e => setColMapping(prev => ({ ...prev, [fd.key]: e.target.value === "" ? undefined : Number(e.target.value) }))}
              style={selectSt}
            >
              <option value="">— skip —</option>
              {csvHeaders.map((h, i) => <option key={i} value={i}>{h}</option>)}
            </select>
          </div>
        ))}
      </div>

      {/* Preview */}
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.04em" }}>Preview (first 5 rows)</div>
      <div style={{ overflowX: "auto", marginBottom: 20 }}>
        <table style={{ ...s.tbl, fontSize: 13 }}>
          <thead><tr>
            {FIELD_DEFS.filter(fd => colMapping[fd.key] != null).map(fd => (
              <th key={fd.key} style={{ ...s.th, fontSize: 12, padding: "8px 10px" }}>{fd.label}</th>
            ))}
          </tr></thead>
          <tbody>
            {csvData.slice(0, 5).map((row, ri) => (
              <tr key={ri}>
                {FIELD_DEFS.filter(fd => colMapping[fd.key] != null).map(fd => {
                  let val = row[colMapping[fd.key]] || "";
                  if (fd.key === "crop") val = mapCropName(val);
                  if (fd.key === "date") val = val.slice(0, 10);
                  return <td key={fd.key} style={{ ...s.td, fontSize: 13, padding: "6px 10px" }}>{val}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <button style={{ ...s.btn, ...s.btnP, padding: "10px 24px", fontSize: 15 }} onClick={handleImport}>
          Import {csvData.length} Tickets
        </button>
        <button style={{ ...s.btn, ...s.btnG }} onClick={cancelImport}>Cancel</button>
        <button style={{ ...s.btn, ...s.btnG }} onClick={() => setImportStep(1)}>Back</button>
      </div>
    </div>}

    <div style={{ ...s.grid(4), marginBottom: 24 }}>
      <Stat label="Total Tickets" value={filtered.length} sub={filter !== "all" ? filter : "all crops"} />
      <Stat label="Total Bushels" value={fmt(totalBu)} color={C.amber} />
      <Stat label="Unique Farms" value={[...new Set(filtered.map(t => t.farm).filter(Boolean))].length} />
      <Stat label="Unique Destinations" value={[...new Set(filtered.map(t => t.destination).filter(Boolean))].length} />
    </div>

    <div style={{ display: "flex", gap: 4, marginBottom: 16, background: C.border, borderRadius: 8, padding: 4, width: "fit-content" }}>
      {cropGroups.map(g => <button key={g.id} style={s.tog(filter === g.id)} onClick={() => setFilter(g.id)}>{g.name}</button>)}
    </div>

    <div style={{ ...s.card, padding: 12 }}>
      <div style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>
        <strong>Tab</strong> → next cell &nbsp;|&nbsp; <strong>Enter</strong> → move down &nbsp;|&nbsp; <strong>Shift+Tab</strong> → previous cell &nbsp;|&nbsp; Tab past last cell adds a new row
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ ...s.tbl, borderCollapse: "collapse" }}>
          <thead><tr>
            <th style={{ ...s.th, width: 30, padding: "6px 4px" }}>#</th>
            {TCOLS.map(col => <th key={col.key} onClick={() => toggleSort(col.key)} style={{ ...s.th, width: col.w, textAlign: col.align, padding: "6px 4px", cursor: "pointer", userSelect: "none" }}>{col.label}{sortCol === col.key ? (sortAsc ? " ▲" : " ▼") : ""}</th>)}
            <th onClick={() => toggleSort("dryBushels")} style={{ ...s.th, width: 55, textAlign: "right", padding: "6px 4px", cursor: "pointer", userSelect: "none" }}>Dry Bu{sortCol === "dryBushels" ? (sortAsc ? " ▲" : " ▼") : ""}</th>
            <th style={{ ...s.th, width: 30 }}></th>
          </tr></thead>
          <tbody>
            {filtered.length === 0 && <tr><td colSpan={TCOLS.length + 3} style={{ ...s.td, textAlign: "center", color: C.muted, padding: 32 }}>Click "+ Add Ticket" or press Tab to start entering tickets</td></tr>}
            {filtered.map((t, ri) => {
              const idx = tickets.indexOf(t);
              const isFocusRow = focusCell?.row === ri;
              return <tr key={t.id} style={{ background: isFocusRow ? "rgba(217,119,6,0.04)" : "transparent" }}>
                <td style={{ ...s.td, color: C.muted, fontSize: 10, padding: "2px 4px", textAlign: "center" }}>{ri + 1}</td>
                {TCOLS.map((col, ci) => {
                  const isFocused = focusCell?.row === ri && focusCell?.col === ci;
                  const val = t[col.key];
                  return <td key={col.key} style={{ padding: "1px 2px", borderBottom: `1px solid rgba(47,51,54,0.3)` }}>
                    <input
                      ref={el => { gridRef.current[`${ri}-${ci}`] = el; }}
                      value={val != null ? String(val) : ""}
                      onChange={e => updateCell(idx, col.key, e.target.value)}
                      onFocus={() => setFocusCell({ row: ri, col: ci })}
                      onKeyDown={e => handleNav(ri, ci, e)}
                      style={cellSt(isFocused, col.align)}
                    />
                  </td>;
                })}
                <td style={{ ...s.tdR, fontWeight: 600, color: C.amber, padding: "2px 6px", fontSize: 12, whiteSpace: "nowrap" }}>{fmt(t.dryBushels || t.bushels, 1)}</td>
                <td style={{ padding: "2px 2px" }}><button onClick={() => u(p => { p.grainTickets.splice(idx, 1); })} style={{ ...s.btn, ...s.btnD, padding: "1px 5px", fontSize: 10 }}>✕</button></td>
              </tr>;
            })}
            {filtered.length > 0 && <tr style={{ background: "rgba(217,119,6,0.08)" }}>
              <td style={{ ...s.td, fontWeight: 700, color: C.amber, padding: "6px 4px" }}></td>
              <td colSpan={2} style={{ ...s.td, fontWeight: 700, color: C.amber, padding: "6px 4px" }}>TOTAL ({filtered.length})</td>
              <td style={{ ...s.tdR, fontWeight: 700, padding: "6px 4px" }}>{fmt(filtered.reduce((a,t) => a + (t.bushels||0), 0), 1)}</td>
              <td colSpan={6}></td>
              <td style={{ ...s.tdR, fontWeight: 700, color: C.amber, padding: "6px 4px" }}>{fmt(totalBu, 1)}</td>
              <td></td>
            </tr>}
          </tbody>
        </table>
      </div>
    </div>

    {/* Farm summary */}
    {filtered.length > 0 && <div style={{ ...s.card, marginTop: 16 }}>
      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>By Farm</div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {[...new Set(filtered.map(t => t.farm).filter(Boolean))].sort().map(farm => {
          const farmTickets = filtered.filter(t => t.farm === farm);
          const farmBu = farmTickets.reduce((a, t) => a + (t.dryBushels || t.bushels || 0), 0);
          const owner = d.cashRents.find(r => r.farm === farm)?.owner || "";
          return <div key={farm} style={{ background: C.bg, borderRadius: 8, padding: "8px 14px", border: `1px solid ${C.border}`, minWidth: 120 }}>
            <div style={{ fontWeight: 700, fontSize: 13 }}>{farm}</div>
            {owner && <div style={{ fontSize: 11, color: C.muted }}>{owner}</div>}
            <div style={{ fontSize: 16, fontWeight: 700, color: C.amber, marginTop: 4 }}>{fmt(farmBu)} bu</div>
            <div style={{ fontSize: 11, color: C.muted }}>{farmTickets.length} tickets</div>
          </div>;
        })}
      </div>
    </div>}
  </div>;
}

// ═══════════════════════════════════════════════════════════════════════════
// CASH RENTS TAB
// ═══════════════════════════════════════════════════════════════════════════
const RENT_CATS = [
  { id: "cash", label: "Cash Rent", color: C.green },
  { id: "owned", label: "Owned", color: C.amber },
  { id: "share", label: "Share Crop", color: C.purple },
  { id: "custom", label: "Custom", color: "#3B82F6" },
];
function RentsTab({ d, upd }) {
  const u = (fn) => upd(p => { fn(p); return p; }); const r = d.cashRents || [];
  const tAc = r.reduce((a,r) => a + r.acres, 0), tB = r.reduce((a,r) => a + r.rentAc*r.acres, 0), tBn = r.reduce((a,r) => a + (r.rentAc+r.bonus)*r.acres, 0);
  const byCat = RENT_CATS.map(cat => {
    const items = r.filter(x => (x.cat || "cash") === cat.id);
    const ac = items.reduce((a, x) => a + x.acres, 0);
    const cost = items.reduce((a, x) => a + (x.rentAc + x.bonus) * x.acres, 0);
    return { ...cat, items, ac, cost };
  });
  return <div><div style={s.title}>Cash Rents & Land — {d.year}</div>
    {/* Acre breakdown by category */}
    <div style={{ ...s.grid(4), marginBottom: 24 }}>
      {byCat.map(cat => (
        <Stat key={cat.id} label={cat.label} value={fmt(cat.ac, 1) + " ac"} sub={cat.ac > 0 ? `${cat.items.length} farms — $${fmt(cat.cost)}` : `${cat.items.length} farms`} color={cat.color} />
      ))}
    </div>
    <div style={{ ...s.grid(4), marginBottom: 24 }}><Stat label="Total Acres" value={fmt(tAc, 1)} sub={`${r.length} farms`} /><Stat label="Total Base" value={"$"+fmt(tB)} sub={`Avg ${fmtD(tAc>0?tB/tAc:0)}/ac`} /><Stat label="w/ Bonus" value={"$"+fmt(tBn)} color={C.amber} /><Stat label="Bonus Exposure" value={"$"+fmt(tBn-tB)} color={C.red} /></div>
    <div style={s.card}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}><span style={{ fontWeight: 600 }}>All Leases</span><button style={{ ...s.btn, ...s.btnP }} onClick={() => u(p => { const mx = p.cashRents.reduce((m,r)=>Math.max(m,r.id),0); p.cashRents.push({id:mx+1,owner:"New",farm:"Farm",acres:0,rentAc:0,type:"",bonus:0,cat:"cash"}); })}>+ Add</button></div>
    <div style={{ overflowX: "auto" }}><table style={s.tbl}><thead><tr><th style={s.th}>Category</th><th style={s.th}>Owner</th><th style={s.th}>Farm</th><th style={s.thR}>Acres</th><th style={s.thR}>Rent/ac</th><th style={s.thR}>Base</th><th style={s.th}>Type</th><th style={s.thR}>Bonus</th><th style={s.thR}>w/ Bonus</th><th></th></tr></thead><tbody>
      {r.map((r, i) => { const cat = RENT_CATS.find(c => c.id === (r.cat || "cash")) || RENT_CATS[0]; return <tr key={r.id}><td style={s.td}><select value={r.cat || "cash"} onChange={e => u(p => { p.cashRents[i].cat = e.target.value; })} style={{ background: C.bg, border: `1px solid ${cat.color}44`, borderRadius: 4, color: cat.color, padding: "4px 8px", fontSize: 13, fontWeight: 600, outline: "none", cursor: "pointer" }}>{RENT_CATS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}</select></td><td style={{ ...s.td, fontWeight: 600 }}><E value={r.owner} f="text" onSave={v => u(p => { p.cashRents[i].owner = v; })} prefix="" /></td><td style={s.td}><E value={r.farm} f="text" onSave={v => u(p => { p.cashRents[i].farm = v; })} prefix="" /></td><td style={s.tdR}><E value={r.acres} onSave={v => u(p => { p.cashRents[i].acres = v; })} dec={1} prefix="" f="plain" /></td><td style={s.tdR}><E value={r.rentAc} onSave={v => u(p => { p.cashRents[i].rentAc = v; })} /></td><td style={s.tdR}>{"$"+fmt(r.rentAc*r.acres)}</td><td style={s.td}><E value={r.type} f="text" onSave={v => u(p => { p.cashRents[i].type = v; })} prefix="" /></td><td style={s.tdR}><E value={r.bonus} onSave={v => u(p => { p.cashRents[i].bonus = v; })} /></td><td style={{ ...s.tdR, fontWeight: 600, color: C.amber }}>{"$"+fmt((r.rentAc+r.bonus)*r.acres)}</td><td style={s.td}><button onClick={() => u(p => { p.cashRents.splice(i, 1); })} style={{ ...s.btn, ...s.btnD, padding: "2px 6px", fontSize: 10 }}>✕</button></td></tr>; })}
      <tr style={{ background: "rgba(217,119,6,0.08)" }}><td></td><td colSpan={2} style={{ ...s.td, fontWeight: 700, color: C.amber }}>TOTAL</td><td style={{ ...s.tdR, fontWeight: 700 }}>{fmt(tAc, 1)}</td><td style={{ ...s.tdR, fontWeight: 700 }}>{tAc>0?fmtD(tB/tAc):"—"}</td><td style={{ ...s.tdR, fontWeight: 700 }}>{"$"+fmt(tB)}</td><td></td><td></td><td style={{ ...s.tdR, fontWeight: 700, color: C.amber }}>{"$"+fmt(tBn)}</td><td></td></tr>
    </tbody></table></div></div></div>;
}

// ═══════════════════════════════════════════════════════════════════════════
// CAPITAL PURCHASE PLAN TAB
// ═══════════════════════════════════════════════════════════════════════════
function CapitalTab({ d, upd }) {
  const u = (fn) => upd(p => { fn(p); return p; });
  const items = d.capitalPlan || [];
  const wish = d.wishList || [];
  const yr = d.year;
  const viewYears = [yr - 1, yr, yr + 1, yr + 2];

  // Stats for current year
  const curItems = items.filter(it => it.year === yr);
  const totEst = curItems.reduce((a, it) => a + (it.estimated || 0), 0);
  const totAct = curItems.reduce((a, it) => a + (it.actual || 0), 0);
  const variance = totAct - totEst;

  return <div>
    <div style={s.title}>Capital Purchase Plan — {yr}</div>
    <div style={{ ...s.grid(4), marginBottom: 24 }}>
      <Stat label={`${yr} Estimated`} value={"$" + fmt(totEst)} />
      <Stat label={`${yr} Actual`} value={"$" + fmt(totAct)} color={C.amber} />
      <Stat label="Variance" value={(variance >= 0 ? "+" : "") + "$" + fmt(Math.abs(variance))} color={variance > 0 ? C.red : C.green} sub={totEst > 0 ? `${((variance / totEst) * 100).toFixed(1)}%` : ""} />
      <Stat label="Total Items" value={items.length} sub={`Wish list: ${wish.length}`} />
    </div>

    {/* Year sections */}
    {viewYears.map(y => {
      const yItems = items.filter(it => it.year === y);
      const yEst = yItems.reduce((a, it) => a + (it.estimated || 0), 0);
      const yAct = yItems.reduce((a, it) => a + (it.actual || 0), 0);
      const isActive = y === yr;
      return <div key={y} style={{ ...s.card, marginBottom: 16, borderLeft: isActive ? `3px solid ${C.amber}` : undefined }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontWeight: 700, fontSize: 18, color: isActive ? C.amber : C.text }}>{y}</span>
            {y < yr && <span style={badge(C.muted)}>Past</span>}
            {y === yr && <span style={badge(C.amber)}>Current</span>}
            {y > yr && <span style={badge(C.green)}>Planned</span>}
            <span style={{ fontSize: 13, color: C.muted }}>{yItems.length} items — Est: ${fmt(yEst)} / Actual: ${fmt(yAct)}</span>
          </div>
          <button style={{ ...s.btn, ...s.btnP }} onClick={() => u(p => {
            if (!p.capitalPlan) p.capitalPlan = [];
            const mx = p.capitalPlan.reduce((m, it) => Math.max(m, it.id || 0), 0);
            p.capitalPlan.push({ id: mx + 1, year: y, item: "", estimated: 0, actual: 0 });
          })}>+ Add Item</button>
        </div>
        {yItems.length === 0 && <div style={{ color: C.muted, fontSize: 14, padding: "8px 0" }}>No items planned for {y}</div>}
        {yItems.length > 0 && <table style={s.tbl}><thead><tr>
          <th style={s.th}>Item</th>
          <th style={s.thR}>Estimated</th>
          <th style={s.thR}>Actual</th>
          <th style={s.thR}>Variance</th>
          <th style={{ ...s.th, width: 100 }}>Move To</th>
          <th style={{ ...s.th, width: 40 }}></th>
        </tr></thead><tbody>
          {yItems.map(it => {
            const idx = items.indexOf(it);
            const v = (it.actual || 0) - (it.estimated || 0);
            return <tr key={it.id}>
              <td style={{ ...s.td, fontWeight: 600 }}><E value={it.item} f="text" onSave={v => u(p => { p.capitalPlan[idx].item = v; })} prefix="" /></td>
              <td style={s.tdR}><E value={it.estimated} onSave={v => u(p => { p.capitalPlan[idx].estimated = v; })} dec={0} /></td>
              <td style={s.tdR}><E value={it.actual} onSave={v => u(p => { p.capitalPlan[idx].actual = v; })} dec={0} /></td>
              <td style={{ ...s.tdR, color: it.actual ? (v > 0 ? C.red : C.green) : C.muted }}>{it.actual ? (v >= 0 ? "+$" : "-$") + fmt(Math.abs(v)) : "—"}</td>
              <td style={s.td}>
                <select value={it.year} onChange={e => u(p => { p.capitalPlan[idx].year = parseInt(e.target.value); })} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 4, color: C.text, padding: "4px 8px", fontSize: 13, outline: "none", cursor: "pointer" }}>
                  {viewYears.map(vy => <option key={vy} value={vy}>{vy}</option>)}
                </select>
              </td>
              <td style={s.td}><button onClick={() => u(p => { p.capitalPlan.splice(idx, 1); })} style={{ ...s.btn, ...s.btnD, padding: "2px 6px", fontSize: 10 }}>✕</button></td>
            </tr>;
          })}
          <tr style={{ background: "rgba(217,119,6,0.08)" }}>
            <td style={{ ...s.td, fontWeight: 700, color: C.amber }}>TOTAL</td>
            <td style={{ ...s.tdR, fontWeight: 700 }}>{"$" + fmt(yEst)}</td>
            <td style={{ ...s.tdR, fontWeight: 700 }}>{"$" + fmt(yAct)}</td>
            <td style={{ ...s.tdR, fontWeight: 700, color: (yAct - yEst) > 0 ? C.red : C.green }}>{yAct ? (yAct - yEst >= 0 ? "+$" : "-$") + fmt(Math.abs(yAct - yEst)) : "—"}</td>
            <td colSpan={2}></td>
          </tr>
        </tbody></table>}
      </div>;
    })}

    {/* Wish List */}
    <div style={{ ...s.card, marginTop: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontWeight: 700, fontSize: 18 }}>Wish List</span>
          <span style={{ fontSize: 13, color: C.muted }}>Ideas & brainstorming — not on the plan yet</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ ...s.btn, ...s.btnP }} onClick={() => u(p => {
            if (!p.wishList) p.wishList = [];
            const mx = p.wishList.reduce((m, it) => Math.max(m, it.id || 0), 0);
            p.wishList.push({ id: mx + 1, item: "", estCost: 0, notes: "" });
          })}>+ Add Item</button>
        </div>
      </div>
      {wish.length === 0 && <div style={{ color: C.muted, fontSize: 14, padding: "8px 0" }}>No wish list items yet</div>}
      {wish.length > 0 && <table style={s.tbl}><thead><tr>
        <th style={s.th}>Item</th>
        <th style={s.thR}>Est. Cost</th>
        <th style={s.th}>Notes</th>
        <th style={{ ...s.th, width: 120 }}>Move to Plan</th>
        <th style={{ ...s.th, width: 40 }}></th>
      </tr></thead><tbody>
        {wish.map((it, i) => <tr key={it.id}>
          <td style={{ ...s.td, fontWeight: 600 }}><E value={it.item} f="text" onSave={v => u(p => { p.wishList[i].item = v; })} prefix="" /></td>
          <td style={s.tdR}><E value={it.estCost} onSave={v => u(p => { p.wishList[i].estCost = v; })} dec={0} /></td>
          <td style={s.td}><E value={it.notes} f="text" onSave={v => u(p => { p.wishList[i].notes = v; })} prefix="" /></td>
          <td style={s.td}>
            <select value="" onChange={e => {
              const targetYr = parseInt(e.target.value);
              if (isNaN(targetYr)) return;
              u(p => {
                if (!p.capitalPlan) p.capitalPlan = [];
                const mx = p.capitalPlan.reduce((m, x) => Math.max(m, x.id || 0), 0);
                p.capitalPlan.push({ id: mx + 1, year: targetYr, item: it.item, estimated: it.estCost || 0, actual: 0 });
                p.wishList.splice(i, 1);
              });
            }} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 4, color: C.text, padding: "4px 8px", fontSize: 13, outline: "none", cursor: "pointer" }}>
              <option value="">—</option>
              {viewYears.map(vy => <option key={vy} value={vy}>{vy}</option>)}
            </select>
          </td>
          <td style={s.td}><button onClick={() => u(p => { p.wishList.splice(i, 1); })} style={{ ...s.btn, ...s.btnD, padding: "2px 6px", fontSize: 10 }}>✕</button></td>
        </tr>)}
      </tbody></table>}
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════════════════
// CURRENT INVENTORY TAB
// ═══════════════════════════════════════════════════════════════════════════
function InventoryTab({ d, upd }) {
  const u = (fn) => upd(p => { fn(p); return p; });
  const products = d.inventoryProducts || [];
  const snaps = d.inventorySnapshots || [];
  const [showAdd, setShowAdd] = useState(false);
  const [newProd, setNewProd] = useState("");

  const addSnapshot = () => {
    u(p => {
      if (!p.inventorySnapshots) p.inventorySnapshots = [];
      const mx = p.inventorySnapshots.reduce((m, s) => Math.max(m, s.id || 0), 0);
      const items = {};
      products.forEach(pr => { items[pr.id] = { price: 0, qty: 0 }; });
      p.inventorySnapshots.push({ id: mx + 1, date: new Date().toISOString().slice(0, 10), label: "", items });
    });
  };

  const addProduct = () => {
    if (!newProd.trim()) return;
    u(p => {
      if (!p.inventoryProducts) p.inventoryProducts = [];
      const mx = p.inventoryProducts.reduce((m, pr) => Math.max(m, parseInt(pr.id.replace("p", "")) || 0), 0);
      const id = "p" + (mx + 1);
      p.inventoryProducts.push({ id, name: newProd.trim(), unit: "" });
      // Add to existing snapshots
      (p.inventorySnapshots || []).forEach(s => { if (!s.items[id]) s.items[id] = { price: 0, qty: 0 }; });
    });
    setNewProd("");
    setShowAdd(false);
  };

  // Latest snapshot total for stats
  const latest = snaps.length > 0 ? snaps[snaps.length - 1] : null;
  const latestTotal = latest ? products.reduce((a, pr) => a + (latest.items?.[pr.id]?.price || 0) * (latest.items?.[pr.id]?.qty || 0), 0) : 0;
  const first = snaps.length > 0 ? snaps[0] : null;
  const firstTotal = first ? products.reduce((a, pr) => a + (first.items?.[pr.id]?.price || 0) * (first.items?.[pr.id]?.qty || 0), 0) : 0;

  return <div>
    <div style={s.title}>Current Inventory — {d.year}</div>
    <div style={{ ...s.grid(4), marginBottom: 24 }}>
      <Stat label="Snapshots" value={snaps.length} sub="Benchmarks this year" />
      <Stat label="Products Tracked" value={products.length} />
      <Stat label="Latest Value" value={"$" + fmt(latestTotal)} color={C.amber} sub={latest ? latest.date + (latest.label ? " — " + latest.label : "") : "No snapshots"} />
      <Stat label="Change" value={snaps.length >= 2 ? (latestTotal - firstTotal >= 0 ? "+$" : "-$") + fmt(Math.abs(latestTotal - firstTotal)) : "—"} color={snaps.length >= 2 ? (latestTotal >= firstTotal ? C.green : C.red) : C.muted} sub={snaps.length >= 2 ? `Since ${first.date}` : "Need 2+ snapshots"} />
    </div>

    {/* Products management */}
    <div style={{ ...s.card, marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontWeight: 600 }}>Products</span>
        <div style={{ display: "flex", gap: 8 }}>
          {showAdd ? <div style={{ display: "flex", gap: 6 }}>
            <input value={newProd} onChange={e => setNewProd(e.target.value)} onKeyDown={e => { if (e.key === "Enter") addProduct(); }} placeholder="Product name" style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 4, color: C.text, padding: "4px 8px", fontSize: 13, outline: "none", width: 160 }} />
            <button style={{ ...s.btn, ...s.btnP, padding: "4px 10px", fontSize: 12 }} onClick={addProduct}>Add</button>
            <button style={{ ...s.btn, ...s.btnG, padding: "4px 10px", fontSize: 12 }} onClick={() => { setShowAdd(false); setNewProd(""); }}>Cancel</button>
          </div> : <button style={{ ...s.btn, ...s.btnP }} onClick={() => setShowAdd(true)}>+ Add Product</button>}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {products.map((pr, i) => <div key={pr.id} style={{ background: C.bg, borderRadius: 6, padding: "6px 12px", border: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>{pr.name}</span>
          {pr.unit && <span style={{ fontSize: 12, color: C.muted }}>({pr.unit})</span>}
          <button onClick={() => u(p => { p.inventoryProducts.splice(i, 1); })} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 11, padding: 0 }}>✕</button>
        </div>)}
      </div>
    </div>

    {/* Add snapshot button */}
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
      <span style={{ fontWeight: 700, fontSize: 18 }}>Inventory Benchmarks</span>
      <button style={{ ...s.btn, ...s.btnP }} onClick={addSnapshot}>+ New Snapshot</button>
    </div>

    {/* Snapshots */}
    {snaps.length === 0 && <div style={{ ...s.card, color: C.muted, fontSize: 14, textAlign: "center", padding: 32 }}>No inventory snapshots yet. Click "+ New Snapshot" to record your first benchmark.</div>}
    {[...snaps].reverse().map((snap, ri) => {
      const si = snaps.length - 1 - ri;
      const total = products.reduce((a, pr) => a + (snap.items?.[pr.id]?.price || 0) * (snap.items?.[pr.id]?.qty || 0), 0);
      return <div key={snap.id} style={{ ...s.card, marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <input type="date" value={snap.date || ""} onChange={e => u(p => { p.inventorySnapshots[si].date = e.target.value; })} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 4, color: C.text, padding: "6px 10px", fontSize: 14, outline: "none" }} />
            <input value={snap.label || ""} onChange={e => u(p => { p.inventorySnapshots[si].label = e.target.value; })} placeholder="Label (e.g. Month-end, Year-end)" style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 4, color: C.text, padding: "6px 10px", fontSize: 14, outline: "none", width: 240 }} />
            <span style={{ fontWeight: 700, fontSize: 18, color: C.amber }}>{"$" + fmt(total)}</span>
          </div>
          <button onClick={() => u(p => { p.inventorySnapshots.splice(si, 1); })} style={{ ...s.btn, ...s.btnD, padding: "4px 10px", fontSize: 11 }}>Delete</button>
        </div>
        <table style={s.tbl}><thead><tr>
          <th style={s.th}>Product</th>
          <th style={s.thR}>Market Value</th>
          <th style={s.thR}>Quantity</th>
          <th style={s.thR}>Gross Amount</th>
        </tr></thead><tbody>
          {products.map(pr => {
            const it = snap.items?.[pr.id] || { price: 0, qty: 0 };
            const gross = (it.price || 0) * (it.qty || 0);
            return <tr key={pr.id}>
              <td style={{ ...s.td, fontWeight: 600 }}>{pr.name}</td>
              <td style={s.tdR}><E value={it.price} onSave={v => u(p => { if (!p.inventorySnapshots[si].items[pr.id]) p.inventorySnapshots[si].items[pr.id] = { price: 0, qty: 0 }; p.inventorySnapshots[si].items[pr.id].price = v; })} dec={2} /></td>
              <td style={s.tdR}><E value={it.qty} onSave={v => u(p => { if (!p.inventorySnapshots[si].items[pr.id]) p.inventorySnapshots[si].items[pr.id] = { price: 0, qty: 0 }; p.inventorySnapshots[si].items[pr.id].qty = v; })} dec={0} prefix="" f="int" /></td>
              <td style={{ ...s.tdR, fontWeight: 600, color: gross > 0 ? C.text : C.muted }}>{"$" + fmt(gross)}</td>
            </tr>;
          })}
          <tr style={{ background: "rgba(217,119,6,0.08)" }}>
            <td style={{ ...s.td, fontWeight: 700, color: C.amber }}>TOTAL</td>
            <td style={s.tdR}></td>
            <td style={s.tdR}></td>
            <td style={{ ...s.tdR, fontWeight: 700, color: C.amber }}>{"$" + fmt(total)}</td>
          </tr>
        </tbody></table>
      </div>;
    })}

    {/* Comparison table if 2+ snapshots */}
    {snaps.length >= 2 && <div style={{ ...s.card, marginTop: 16 }}>
      <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 12 }}>Inventory Trend</div>
      <div style={{ overflowX: "auto" }}><table style={s.tbl}><thead><tr>
        <th style={s.th}>Product</th>
        {snaps.map(snap => <th key={snap.id} style={s.thR}>{snap.date}{snap.label ? " " + snap.label : ""}</th>)}
      </tr></thead><tbody>
        {products.map(pr => <tr key={pr.id}>
          <td style={{ ...s.td, fontWeight: 600 }}>{pr.name}</td>
          {snaps.map(snap => {
            const it = snap.items?.[pr.id] || {};
            return <td key={snap.id} style={s.tdR}>{"$" + fmt((it.price || 0) * (it.qty || 0))}</td>;
          })}
        </tr>)}
        <tr style={{ background: "rgba(217,119,6,0.08)" }}>
          <td style={{ ...s.td, fontWeight: 700, color: C.amber }}>TOTAL</td>
          {snaps.map(snap => {
            const t = products.reduce((a, pr) => a + (snap.items?.[pr.id]?.price || 0) * (snap.items?.[pr.id]?.qty || 0), 0);
            return <td key={snap.id} style={{ ...s.tdR, fontWeight: 700, color: C.amber }}>{"$" + fmt(t)}</td>;
          })}
        </tr>
      </tbody></table></div>
    </div>}
  </div>;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════
export default function App() {
  useResponsive();
  const auth = useAuth();
  const st = useStorage(auth.user?.id);
  const [tab, setTab] = useState("dash");
  const [showYM, setShowYM] = useState(false);
  const [newYr, setNewYr] = useState("");

  // Auth loading
  if (auth.authLoading) return <div style={{ ...s.app, display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}><div style={{ textAlign: "center" }}><img src="/icon-192x192.png" alt="Precision Farms" style={{ width: 64, height: 64, borderRadius: 12, marginBottom: 16 }} /><div style={{ color: C.muted }}>Loading...</div></div></div>;

  // Not signed in
  if (!auth.user) return <div style={{ ...s.app, display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
    <link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
    <div style={{ textAlign: "center" }}>
      <img src="/icon-192x192.png" alt="Precision Farms" style={{ width: 80, height: 80, borderRadius: 16, marginBottom: 20 }} />
      <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Precision Farms</div>
      <div style={{ fontSize: 14, color: C.muted, marginBottom: 32, textTransform: "uppercase", letterSpacing: "0.05em" }}>Crop Budget Dashboard</div>
      <button onClick={auth.signIn} style={{ ...s.btn, ...s.btnP, padding: "14px 32px", fontSize: 16, borderRadius: 10, display: "inline-flex", alignItems: "center", gap: 10 }}>
        <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.0 24.0 0 0 0 0 21.56l7.98-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
        Sign in with Google
      </button>
    </div>
  </div>;

  // Data loading
  if (st.loading) return <div style={{ ...s.app, display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}><div style={{ textAlign: "center" }}><img src="/icon-192x192.png" alt="Precision Farms" style={{ width: 64, height: 64, borderRadius: 12, marginBottom: 16 }} /><div style={{ color: C.muted }}>Loading data...</div></div></div>;
  if (!st.data) return null;
  const d = st.data;
  const tabs = [{ id: "dash", label: "Dashboard" }, { id: "budgets", label: "Crop Budgets" }, ...(d.marketingGroups||[]).map(g => ({ id: "mkt_" + g.id, label: g.name })), { id: "tickets", label: "Grain Tickets" }, { id: "rents", label: "Cash Rents" }, { id: "capital", label: "Capital Plan" }, { id: "inventory", label: "Inventory" }];

  return <div style={s.app}>
    <link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
    <header style={s.hdr}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "space-between", width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src="/icon-192x192.png" alt="Precision Farms" style={{ width: 42, height: 42, borderRadius: 8 }} />
          <div><div style={{ fontSize: 22, fontWeight: 700 }}>Precision Farms</div><div style={{ fontSize: 13, color: C.muted, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>Crop Budget Dashboard</div></div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 11, color: st.ss==="saved"?C.green:st.ss==="saving"?C.amber:C.red }}>{st.ss==="saved"?"✓ Saved":st.ss==="saving"?"Saving...":"Unsaved"}</div>
          <button style={{ ...s.btn, ...s.btnG, padding: "4px 10px", fontSize: 11 }} onClick={auth.signOut}>Sign Out</button>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 4, background: C.border, borderRadius: 8, padding: 4, overflowX: "auto" }}>{[...st.years].sort((a,b)=>a-b).map(yr => <button key={yr} style={s.tog(yr===st.yr)} onClick={() => st.loadYr(yr)}>{yr}</button>)}</div>
        <button style={{ ...s.btn, ...s.btnP }} onClick={() => { setNewYr(String(st.yr + 1)); setShowYM(true); }}>+ Year</button>
        <button style={{ ...s.btn, background: "#7C3AED", color: "#fff", fontSize: 12, padding: "6px 12px" }} onClick={() => { if (confirm("Seed historical data for 2020-2026? This will overwrite existing years.")) st.seedHistory(); }}>Seed</button>
      </div>
    </header>
    {showYM && <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={() => setShowYM(false)}>
      <div style={{ ...s.card, width: "min(380px, 90vw)", padding: 32 }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Create New Crop Year</div>
        <input value={newYr} onChange={e => setNewYr(e.target.value)} style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 12px", color: C.text, fontSize: 16, outline: "none", boxSizing: "border-box", marginBottom: 12 }} />
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 20 }}>Copies budgets from <strong style={{ color: C.text }}>{st.yr}</strong>. Contracts and tickets start empty.</div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}><button style={{ ...s.btn, ...s.btnG }} onClick={() => setShowYM(false)}>Cancel</button><button style={{ ...s.btn, ...s.btnP }} onClick={async () => { const y = parseInt(newYr); if (!isNaN(y) && y > 2000 && y < 2100) { await st.copyYr(st.yr, y); setShowYM(false); } }}>Create {newYr}</button></div>
      </div></div>}
    <nav style={s.nav}>{tabs.map(t => <button key={t.id} style={s.tab(tab===t.id)} onClick={() => setTab(t.id)}>{t.label}</button>)}</nav>
    <main style={s.main}>
      {tab === "dash" && <Dash d={d} />}
      {tab === "budgets" && <BudgetsTab d={d} upd={st.upd} />}
      {(d.marketingGroups||[]).map(g => tab === "mkt_"+g.id && <MktTab key={g.id} d={d} upd={st.upd} gid={g.id} />)}
      {tab === "tickets" && <TicketsTab d={d} upd={st.upd} />}
      {tab === "rents" && <RentsTab d={d} upd={st.upd} />}
      {tab === "capital" && <CapitalTab d={d} upd={st.upd} />}
      {tab === "inventory" && <InventoryTab d={d} upd={st.upd} />}
    </main>
  </div>;
}
