/* =========================================================
   STRESS MODE — proves the feed holds up at 1,000 items.

   THIS FILE IS DELETABLE. Nothing else depends on it existing;
   market.js feature-detects window.mkStress and hides the button
   if it is missing. It is never the default, never in the
   sitemap, and never linked from anywhere but the one button in
   the marketplace's demo banner.

   Every item it makes carries gen:true, which puts an amber
   "Placeholder" pill on the card and switches the banner to the
   amber warning. That is deliberate: 988 generated listings
   shown as inventory would be exactly the fabricated-activity
   problem this site has already had to clean up twice.

   Seeded, not random. Math.random() would reshuffle the whole
   feed on every keystroke-triggered reindex and make the demo
   impossible to talk about.
   ========================================================= */

/* mulberry32 — 32-bit, seeded, ~4 lines, good enough to look organic */
function mkRng(seed){
  let a = seed >>> 0;
  return function(){
    a = (a + 0x6D2B79F5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* Real category price bands. `worth` is what a LOCAL BUYER hands over —
   the same axis the hand-written table in market.js uses, so a generated
   card and a real one never contradict each other. Several bands are
   deliberately worth nothing, because most junk is. */
const MK_STRESS_BANDS = [
  {kind:'furniture', ico:'sofa',    n:['Two-seat sofa','Sectional, three-piece','Loveseat, fabric','Recliner armchair'],
   worth:'Usually nothing', top:0, d:'Almost no buyer will take upholstery', v:'give', cat:'truck'},
  {kind:'furniture', ico:'dresser', n:['Pine chest of drawers','Six-drawer dresser','Bedside table pair','Wardrobe, flat-pack'],
   worth:'$0 – $80', top:80, d:'Pine is the cheap end. Teak and walnut are where the money is.', v:'give', cat:'truck'},
  {kind:'furniture', ico:'shelf',   n:['Oak bookcase','Shelving unit, five tier','Bookshelf, tall'],
   worth:'$40 – $150', top:150, d:'A dealer, if the oak is solid and not veneer', v:'depends', cat:'truck'},
  {kind:'furniture', ico:'table',   n:['Pine dining table','Coffee table, glass top','Writing desk','Console table'],
   worth:'$0 – $60', top:60, d:'Softwood dining sets are the hardest furniture there is to sell', v:'give', cat:'truck'},
  {kind:'furniture', ico:'chair',   n:['Four dining chairs','Office chair','Two stacking chairs'],
   worth:'Usually nothing', top:0, d:'Chairs without their table are a repair job, not a purchase', v:'give', cat:'car'},
  {kind:'appliance', ico:'fridge',  n:['Bar fridge','Chest freezer','Washing machine','Tumble dryer','Dishwasher'],
   worth:'$20 – $60', top:60, d:'A scrapper pays for the metal either way. A student pays more, if it runs.', v:'depends', cat:'truck'},
  {kind:'vehicle',   ico:'car',     n:['2009 sedan — does not run','Estate car, no plates','Hatchback, dead engine'],
   worth:'$250 – $600', top:600, d:'Salvage yard, towed free, paid on collection', v:'sell', cat:'truck'},
  {kind:'sport',     ico:'bike',    n:['Road bike, steel frame','Mountain bike, 26 inch',"Kids' bike, 20 inch",'Hybrid commuter bike'],
   worth:'$0 – $110', top:110, d:'Pre-1990 steel is worth real money. A big-box frame is worth about thirty dollars.', v:'depends', cat:'car'},
  {kind:'tools',     ico:'sew',     n:['Sewing machine, mechanical','Overlocker','Sewing machine in cabinet'],
   worth:'$20 – $60', top:60, d:'A collector or a repair shop, if it still stitches straight', v:'depends', cat:'car'},
  {kind:'tools',     ico:'box',     n:['Boxes of hand tools','Power drill and bits','Toolbox, filled','Workbench vice'],
   worth:'$30 – $180', top:180, d:'Consistently underestimated. Contractors take the whole lot in one trip.', v:'sell', cat:'car'},
  {kind:'kitchen',   ico:'kitchen', n:['Boxes of kitchenware','Dinner service, twelve place','Pots and pans, mixed','Stand mixer'],
   worth:'Usually nothing', top:0, d:'As a lot it is worth less than the trip to collect it', v:'give', cat:'car'},
  {kind:'kitchen',   ico:'lamp',    n:['Brass table lamp','Floor lamp','Pair of bedside lamps'],
   worth:'$45 – $120', top:120, d:'A vintage dealer, if the wiring is sound', v:'depends', cat:'car'},
  {kind:'textile',   ico:'fabric',  n:['Boxes of quilting fabric','Curtains, lined','Bedding and linens','Wool, assorted'],
   worth:'Usually nothing', top:0, d:'No buyer takes fabric by the box. A quilting guild will take all of it.', v:'give', cat:'car'}
];

const MK_STRESS_WHERE = [
  'Lakeview, Mississauga','Port Credit, Mississauga','Cooksville, Mississauga',
  'Streetsville, Mississauga','Malton, Mississauga','Clarkson, Mississauga',
  'Etobicoke South','Etobicoke North','Mimico, Etobicoke','Alderwood, Etobicoke',
  'Brampton North','Brampton West','Bramalea, Brampton'
];
const MK_STRESS_COND = [
  'Good — light wear','Works, needs a clean','Very good','Fair — scratched',
  'Needs a small repair','Unused, still boxed','Solid, surface marks','Well used but sound'
];

/* Returns N listing objects in DATA's exact shape, plus the extra
   fields market.js needs to index them. Deterministic for a given
   (count, now) pair. Ids start at 10000 so they can never collide
   with the twelve real ones. */
function mkStress(count, now){
  const rnd = mkRng(20260908);
  const H = 3600e3, out = [];
  for(let i = 0; i < count; i++){
    const band = MK_STRESS_BANDS[(rnd() * MK_STRESS_BANDS.length) | 0];
    const name = band.n[(rnd() * band.n.length) | 0];
    const hours = 2 + rnd() * 118;                       // 2h .. 5 days
    const porch = band.cat === 'car' && rnd() < 0.34;
    out.push({
      id: 10000 + i,
      t: name,
      ico: band.ico,
      cat: band.cat,
      where: MK_STRESS_WHERE[(rnd() * MK_STRESS_WHERE.length) | 0],
      cond: MK_STRESS_COND[(rnd() * MK_STRESS_COND.length) | 0],
      due: now + hours * H,
      porch: porch,
      orgOnly: !porch && rnd() < 0.2,
      claimed: rnd() < 0.08,
      by: 'a local reuse charity',
      _mk: {kind:band.kind, pay:'Free', worth:band.worth, top:band.top,
            worthD:band.d, verdict:band.v}
    });
  }
  return out;
}
