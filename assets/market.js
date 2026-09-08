/* =========================================================
   THE MARKETPLACE — one feed, every item, and what it's worth.

   Design notes that are load-bearing, not decoration:

   ONE FEED. /going-free 301s here. #v-feed stays in the DOM
   because app.js's renderFeeds_inner() writes to #full-feed
   unguarded at parse time and would throw if it vanished.

   PRICES ARE HAND-WRITTEN, one row per listing id. Mapping ico
   to a category table priced quilting fabric as "Tools, $60-300",
   which is a fabricated appraisal wearing real authority.

   EVERY ITEM IS FREE. There is no checkout in this codebase —
   the only CTA is openClaim() -> doClaim(), which hands the item
   over for nothing. An asking price above a "Claim a pickup
   time" button would be a lie the code tells. So "What you pay"
   reads Free, and the local price lives in the second cell,
   which is where this site's honesty has always lived.

   LINEAR SCAN, NOT INDEXES. ~56k cheap predicate calls at
   n=1000 is well under a millisecond. An inverted index would
   optimise a cost that does not exist.

   CHUNKED APPEND, NOT VIRTUALISATION. .feed-grid is auto-fill
   with stretched rows; absolute positioning turns that into
   masonry, breaks Ctrl+F and print, and fights Lenis.
   ========================================================= */

/* ---------------------------------------------------------------
   PRICES. `worth` is what a LOCAL BUYER would hand the owner: a
   category-typical GTA range, not an appraisal of the individual
   item, and the banner says so. `top` is the numeric ceiling and
   exists only to power the "Worth the most" sort.

   Two numbers, never one. Ranges, never point prices. Where the
   honest answer is nothing, it says nothing — which is seven of
   these twelve.
   --------------------------------------------------------------- */
const MK_PRICE = {
  1:  {kind:'tools',     pay:'Free', worth:'$20 – $60',      top:60,
       worthD:'A collector or a repair shop, if it still stitches straight', verdict:'depends'},
  2:  {kind:'furniture', pay:'Free', worth:'Usually nothing', top:0,
       worthD:'Almost no buyer will take upholstery', verdict:'give'},
  3:  {kind:'textile',   pay:'Free', worth:'Usually nothing', top:0,
       worthD:'No buyer takes fabric by the box. A quilting guild will take all six.', verdict:'give'},
  4:  {kind:'furniture', pay:'Free', worth:'$0 – $60',        top:60,
       worthD:'Softwood dining sets are the hardest furniture there is to sell', verdict:'give'},
  5:  {kind:'kitchen',   pay:'Free', worth:'$45 – $120',      top:120,
       worthD:'A vintage dealer, for the three together, if the wiring is sound', verdict:'depends'},
  6:  {kind:'sport',     pay:'Free', worth:'Usually nothing', top:0,
       worthD:'Nobody buys kids’ bikes. A neighbour with a seven-year-old takes it today.', verdict:'give'},
  7:  {kind:'vehicle',   pay:'Free', worth:'$250 – $600',     top:600,
       worthD:'Salvage yard, towed free, paid on collection', verdict:'sell'},
  8:  {kind:'appliance', pay:'Free', worth:'$20 – $60',       top:60,
       worthD:'A scrapper pays for the metal either way. A student pays more, if it runs.', verdict:'depends'},
  9:  {kind:'furniture', pay:'Free', worth:'$40 – $150',      top:150,
       worthD:'A dealer, if the oak is solid and not veneer', verdict:'depends'},
  10: {kind:'furniture', pay:'Free', worth:'$0 – $80',        top:80,
       worthD:'Pine is the cheap end. Teak and walnut are where the money is.', verdict:'give'},
  11: {kind:'kitchen',   pay:'Free', worth:'Usually nothing', top:0,
       worthD:'As a lot it is worth less than the trip to collect it', verdict:'give'},
  12: {kind:'furniture', pay:'Free', worth:'Usually nothing', top:0,
       worthD:'Wobbly chairs are a repair job, not a purchase', verdict:'give'}
};

const MK_KINDS = [
  ['furniture','Furniture'], ['appliance','Appliances'], ['vehicle','Vehicles'],
  ['sport','Bikes & sport'], ['tools','Tools & workshop'], ['kitchen','Kitchen & household'],
  ['textile','Fabric & textiles'], ['electronics','Electronics'], ['other','Everything else']
];
const MK_KIND_LABEL = Object.fromEntries(MK_KINDS);

/* Areas are derived from the `where` strings that already exist. There is no
   geolocation and no postcode field, so a "2.4 km away" badge would be a
   fabricated claim about where the reader is standing. */
const MK_AREAS = [['mississauga','Mississauga'],['etobicoke','Etobicoke'],['brampton','Brampton']];
const MK_AREA_LABEL = Object.fromEntries(MK_AREAS);
function mkArea(where){
  const w = (where || '').toLowerCase();
  if(w.indexOf('mississauga') > -1) return 'mississauga';
  if(w.indexOf('etobicoke')   > -1) return 'etobicoke';
  if(w.indexOf('brampton')    > -1) return 'brampton';
  return 'other';
}

/* Folded into the haystack at index time, so they cost nothing per keystroke */
const MK_SYN = {
  sofa:'couch chesterfield settee sectional', shelf:'bookshelf bookcase shelving',
  dresser:'chest drawers bureau', fridge:'refrigerator freezer appliance',
  sew:'sewing singer machine', table:'desk dining', chair:'seat seating',
  lamp:'light lighting', bike:'bicycle cycle', car:'auto vehicle automobile',
  fabric:'cloth textile quilting material', kitchen:'kitchenware crockery dishes pots'
};

/* ---------------- module state ---------------- */
var MK = {
  built:false, on:false, items:[], byId:Object.create(null), view:[], counts:null,
  q:'', qT:[], f:{kind:[],carry:[],pickup:[],when:[],area:[],pay:[],avail:[]},
  sort:'soon', dense:'comfort', shown:0, autoLeft:0, stress:0, now:0,
  live:new Set(), tick:null, sentIO:null, clockIO:null, _uT:null, _qT:null
};
const MK_CHUNK = 36;
const MK_AUTO_PAGES = 4;
const MK_SORT_DEFAULT = 'soon';
const MK_SEED = DATA.slice();      /* the real twelve, captured before any stress push */

const MK_SORTS = {
  soon:    {label:'Going soonest',  cmp:function(a,b){ return a.ref.due - b.ref.due }},
  longest: {label:'Longest left',   cmp:function(a,b){ return b.ref.due - a.ref.due }},
  worth:   {label:'Worth the most', cmp:function(a,b){ return (b.top - a.top) || (a.ref.due - b.ref.due) }},
  az:      {label:'A – Z',          cmp:function(a,b){ return a.ref.t.localeCompare(b.ref.t) }}
};

/* nested thresholds: an item belongs to every ceiling at or above it */
function mkWhenOf(r){
  const h = (r.ref.due - MK.now) / 3600e3;
  if(h <= 0) return [];
  const out = [];
  if(h <=  6) out.push('6');
  if(h <= 24) out.push('24');
  if(h <= 72) out.push('72');
  return out;
}

/* Multi-select iff the values are disjoint; single-select iff they nest.
   "Within 6 hours OR within 72 hours" is just "within 72 hours", so a
   multi-select control on `when` would lie about what it does. */
const MK_AXES = [
  {k:'kind',   label:'What it is',      multi:true,  of:function(r){return [r.kind]},  opts:MK_KINDS},
  {k:'carry',  label:'Getting it home', multi:true,  of:function(r){return [r.carry]},
   opts:[['car','Fits in a car'],['truck','Needs a truck']]},
  {k:'pickup', label:'Pickup',          multi:true,  of:function(r){return r.pickup},
   opts:[['porch','Porch pickup'],['orgs','Orgs first · 24h']]},
  {k:'when',   label:'Going in',        multi:false, of:mkWhenOf,
   opts:[['6','Six hours'],['24','Today'],['72','Three days']]},
  {k:'area',   label:'Area',            multi:true,  of:function(r){return [r.area]},  opts:MK_AREAS},
  {k:'pay',    label:'What you pay',    multi:true,  of:function(r){return [r.pay]},
   opts:[['free','Free'],['ask','Asking a price']]},
  {k:'avail',  label:'Availability',    multi:true,  of:function(r){return r.ref.claimed?[]:['open']},
   opts:[['open','Hide claimed']]}
];

/* ---------------- index ---------------- */
function mkIndex(){
  MK.items = []; MK.byId = Object.create(null);
  for(let i = 0; i < DATA.length; i++){
    const it = DATA[i];
    const p = it._mk || MK_PRICE[it.id];
    if(!p) continue;                                  /* never invent a price */
    const kindLabel = MK_KIND_LABEL[p.kind] || 'Everything else';
    const area = mkArea(it.where);
    const pickup = it.porch ? ['porch'] : (it.orgOnly ? ['orgs'] : []);
    const rec = {
      id:it.id, ref:it,                               /* a REFERENCE, never a copy */
      kind:p.kind, kindLabel:kindLabel,
      area:area, areaLabel:MK_AREA_LABEL[area] || '',
      carry:it.cat, pickup:pickup,
      pay:'free', payV:p.pay, worth:p.worth, worthD:p.worthD,
      verdict:p.verdict, top:p.top, gen:!!it._mk, hay:''
    };
    rec.hay = (it.t + ' ' + it.cond + ' ' + it.where + ' ' + kindLabel + ' ' +
               p.pay + ' ' + p.worth + ' ' +
               (it.cat === 'car' ? 'fits in a car' : 'needs a truck two people') + ' ' +
               pickup.join(' ') + ' ' + (it.porch ? 'porch pickup' : '') + ' ' +
               (it.orgOnly ? 'orgs first' : '') + ' ' +
               (MK_SYN[it.ico] || '')).toLowerCase();
    MK.items.push(rec);
    MK.byId[it.id] = rec;
  }
}

/* ---------------- filter + count in one pass ---------------- */
function mkAxisPass(rec, ax){
  const sel = MK.f[ax.k];
  if(!sel || !sel.length) return true;
  const vals = ax.of(rec);
  for(let i = 0; i < vals.length; i++) if(sel.indexOf(vals[i]) > -1) return true;
  return false;
}
function mkPass(rec, skip){
  const t = MK.qT;
  for(let i = 0; i < t.length; i++) if(rec.hay.indexOf(t[i]) === -1) return false;
  for(let a = 0; a < MK_AXES.length; a++){
    const ax = MK_AXES[a];
    if(ax.k === skip) continue;
    if(!mkAxisPass(rec, ax)) return false;
  }
  return true;
}

/* The relaxation is the whole point: each option's count is computed with
   its OWN axis excluded, so ticking "Furniture" leaves its siblings showing
   the real number you would get by switching to them, not zero. */
function mkCompute(){
  MK.now = Date.now();
  const counts = Object.create(null), out = [];
  for(let a = 0; a < MK_AXES.length; a++){
    const ax = MK_AXES[a];
    for(let o = 0; o < ax.opts.length; o++) counts[ax.k + ':' + ax.opts[o][0]] = 0;
  }
  const items = MK.items;
  for(let i = 0; i < items.length; i++){
    const rec = items[i];
    for(let a = 0; a < MK_AXES.length; a++){
      const ax = MK_AXES[a];
      if(!mkPass(rec, ax.k)) continue;
      const vals = ax.of(rec);
      for(let v = 0; v < vals.length; v++){
        const key = ax.k + ':' + vals[v];
        if(key in counts) counts[key]++;
      }
    }
    if(mkPass(rec, null)) out.push(rec);
  }
  out.sort(MK_SORTS[MK.sort].cmp);
  MK.view = out; MK.counts = counts;
  return counts;
}

/* An axis renders only if at least two of its options can yield something
   AND there is enough inventory to make choosing worthwhile. This is what
   stops the rail being longer than the results at n=12. */
function mkAxisVisible(ax, counts){
  if((MK.f[ax.k] || []).length) return true;          /* never hide an active axis */
  let nonZero = 0;
  for(let o = 0; o < ax.opts.length; o++) if(counts[ax.k + ':' + ax.opts[o][0]] > 0) nonZero++;
  return nonZero >= 2 && MK.items.length >= 3 * nonZero;
}

/* ---------------- glyphs (never ic() inside a card) ---------------- */
const MK_G = {
  pin:'<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path d="M20 10c0 5-5.5 10.2-7.4 11.8a1 1 0 0 1-1.2 0C9.5 20.2 4 15 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>',
  ok: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>'
};

function mkEsc(s){
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* one source of countdown truth: remain() from app.js, plus a repaint period */
function mkRemain(due){
  const r = remain(due);
  r.period = r.hrs >= 48 ? 3600e3 : (r.hrs >= 1 ? 60e3 : 1000);
  return r;
}

/* ---------------- the card ---------------- */
function mkCard(rec){
  const it = rec.ref, r = mkRemain(it.due);
  const src = (typeof PIC !== 'undefined' && (PIC[it.ico] || PIC.box)) || '';
  const pill = it.porch ? '<span class="tagpill porch">Porch pickup</span>'
             : (it.orgOnly ? '<span class="tagpill">Orgs first · 24h</span>' : '');
  const gen = rec.gen ? '<span class="tagpill gen">Placeholder</span>' : '';
  return '<article class="lc mk-card" data-id="' + it.id + '">'
   + '<div class="lc-photo">'
   +   '<img src="' + src + '" alt="" loading="lazy" decoding="async"'
   +   ' onload="this.classList.add(&quot;in&quot;);this.parentNode.classList.add(&quot;loaded&quot;)">'
   +   '<span class="ph-grade"></span>'
   /* .mk-clock + data-mk-due, never .clock[data-due]: app.js runs an
      uncleared document-wide interval over that selector every second. */
   +   '<span class="clock mk-clock ' + r.cls + '" data-mk-due="' + it.due + '">'
   +     '<span class="pip"></span>' + r.txt + '</span>'
   +   (gen || pill)
   + '</div>'
   + '<div class="lc-body">'
   +   '<h4><a class="mk-t" href="/marketplace?item=' + it.id + '">' + mkEsc(it.t) + '</a></h4>'
   +   '<div class="lc-meta">' + MK_G.pin + ' ' + mkEsc(it.where) + '</div>'
   +   '<div class="lc-meta">' + mkEsc(it.cond) + '</div>'
   +   (it.memory ? '<div class="memory">“' + mkEsc(it.memory) + '”</div>' : '')
   +   '<div class="twonum mk-num">'
   +     '<div class="num"><div class="k">What you pay</div><div class="v">' + rec.payV + '</div></div>'
   +     '<div class="num buyer"><div class="k">What a buyer would pay</div>'
   +       '<div class="v">' + rec.worth + '</div></div>'
   +   '</div>'
   +   '<div class="lc-meta">'
   +     '<span class="chip ' + it.cat + '">' + (it.cat === 'car' ? 'Fits in a car' : 'Needs a truck') + '</span>'
   +     (it.cat === 'truck' ? '<span class="chip">Two people</span>' : '')
   +   '</div>'
   +   '<div class="lc-foot">' + (it.claimed
        ? '<div class="claimed">' + MK_G.ok + ' Claimed by ' + mkEsc(it.by || 'someone') + '</div>'
        : '<button class="btn sm" style="flex:1" data-mk-claim="' + it.id + '">'
          + (it.porch ? 'Take it' : 'Claim a pickup time') + '</button>')
   +   '</div>'
   + '</div></article>';
}

/* ---------------- chrome painting ---------------- */
function mkAxisSelLabel(ax){
  const sel = MK.f[ax.k] || [];
  const names = ax.opts.filter(function(o){ return sel.indexOf(o[0]) > -1 })
                       .map(function(o){ return o[1] });
  return names.join(' or ') || ax.label;
}

function mkPaintRail(counts){
  const rail = document.getElementById('mk-rail');
  let h = '<div class="mk-railhead"><h5 style="margin:0">Narrow it down</h5></div>';
  for(let a = 0; a < MK_AXES.length; a++){
    const ax = MK_AXES[a];
    if(!mkAxisVisible(ax, counts)) continue;
    const sel = MK.f[ax.k] || [];
    let chips = '';
    for(let o = 0; o < ax.opts.length; o++){
      const v = ax.opts[o][0], label = ax.opts[o][1];
      const n = counts[ax.k + ':' + v] || 0;
      const on = sel.indexOf(v) > -1;
      if(!n && !on) {
        chips += '<button type="button" class="mk-chip zero" data-k="' + ax.k + '" data-v="' + v +
                 '" aria-disabled="true">' + label + ' <span class="n">0</span></button>';
      } else {
        chips += '<button type="button" class="mk-chip' + (on ? ' on' : '') + '" data-k="' + ax.k +
                 '" data-v="' + v + '" aria-pressed="' + (on ? 'true' : 'false') + '">' +
                 label + ' <span class="n">' + n + '</span></button>';
      }
    }
    h += '<div class="mk-group"><h5>' + ax.label + '</h5><div class="mk-chips">' + chips + '</div></div>';
  }
  h += '<button type="button" class="btn ghost sm mk-sheet-done" id="mk-sheet-done">Show ' +
       MK.view.length + ' item' + (MK.view.length === 1 ? '' : 's') + '</button>';
  rail.innerHTML = h;
}

function mkPaintPills(){
  const box = document.getElementById('mk-pills');
  let h = '';
  if(MK.q) h += '<span class="mk-pill">“' + mkEsc(MK.q) + '”<button type="button" data-mk-dropq aria-label="Clear search">×</button></span>';
  for(let a = 0; a < MK_AXES.length; a++){
    const ax = MK_AXES[a], sel = MK.f[ax.k] || [];
    for(let s = 0; s < sel.length; s++){
      const opt = ax.opts.find(function(o){ return o[0] === sel[s] });
      if(!opt) continue;
      h += '<span class="mk-pill">' + opt[1] + '<button type="button" data-mk-off="' + ax.k +
           '|' + opt[0] + '" aria-label="Remove ' + opt[1] + '">×</button></span>';
    }
  }
  if(h) h += '<button type="button" class="mk-pill" data-mk-clear style="font-weight:700">Clear all</button>';
  box.innerHTML = h;
}

function mkPaintCount(){
  const n = MK.view.length, total = MK.items.length;
  const el = document.getElementById('mk-count');
  const shownTxt = (MK.shown < n) ? ('Showing <b>' + MK.shown + '</b> of ') : 'Showing all ';
  el.innerHTML = n
    ? shownTxt + '<b>' + n + '</b> item' + (n === 1 ? '' : 's') +
      (n < total ? ' · filtered from ' + total : '') +
      ' · soonest deadline first unless you say otherwise'
    : '';
  const live = document.getElementById('mk-live');
  if(live) live.textContent = n + ' item' + (n === 1 ? '' : 's') + ' match';
}

/* Name the single filter costing the most, and offer to drop it by name. */
function mkCulprit(){
  let best = null;
  if(MK.qT.length){
    const save = MK.qT; MK.qT = [];
    let n = 0;
    for(let i = 0; i < MK.items.length; i++) if(mkPass(MK.items[i], null)) n++;
    MK.qT = save;
    if(n) best = {k:'q', n:n, label:'“' + MK.q + '”'};
  }
  for(let a = 0; a < MK_AXES.length; a++){
    const ax = MK_AXES[a];
    const sel = MK.f[ax.k]; if(!sel || !sel.length) continue;
    let n = 0;
    for(let i = 0; i < MK.items.length; i++) if(mkPass(MK.items[i], ax.k)) n++;
    if(n && (!best || n > best.n)) best = {k:ax.k, n:n, label:mkAxisSelLabel(ax)};
  }
  return best;
}

function mkEmptyHTML(){
  const c = mkCulprit();
  if(c){
    return '<div class="mk-none"><h3>Nothing matches all of those.</h3>' +
      '<p>The one doing the damage is <b>' + c.label + '</b> — dropping it gives you ' +
      c.n + ' item' + (c.n === 1 ? '' : 's') + '.</p>' +
      '<button class="btn" data-mk-drop="' + c.k + '">Drop ' + c.label + '</button>' +
      '<button class="btn ghost" data-mk-clear>Clear all filters</button></div>';
  }
  return '<div class="mk-none"><h3>Nothing here right now.</h3>' +
    '<p>Twelve sample listings cover a lot of ground thinly. On a real day this area might have three or four.</p>' +
    '<button class="btn ghost" data-mk-clear>Clear all filters</button>' +
    '<button class="btn" data-mk-post>Post something instead</button></div>';
}

function mkPaintEnd(){
  const end = document.getElementById('mk-end');
  const n = MK.view.length;
  if(!n){ end.innerHTML = ''; return; }
  if(MK.shown < n){
    if(MK.autoLeft > 0){ end.innerHTML = ''; return; }
    const next = Math.min(MK_CHUNK, n - MK.shown);
    end.innerHTML = '<button class="btn ghost" id="mk-more" type="button">Show the next ' +
                    next + ' of ' + n + '</button>';
    return;
  }
  end.innerHTML = n > MK_CHUNK
    ? '<p class="mk-endline">That is all ' + n + '. If scrolling this far was the only way to find ' +
      'what you wanted, the filters above are not doing their job — tell us what you were looking for.</p>'
    : '';
}

/* ---------------- render ---------------- */
function mkCards(from, to){
  const parts = new Array(to - from);
  for(let i = from; i < to; i++) parts[i - from] = mkCard(MK.view[i]);
  return parts.join('');
}

function mkRender(){
  const counts = mkCompute();
  mkPaintRail(counts);
  mkPaintPills();
  const grid = document.getElementById('mk-grid');
  grid.className = 'mk-grid ' + MK.dense;
  if(!MK.view.length){
    grid.innerHTML = mkEmptyHTML();
    MK.shown = 0; mkPaintCount(); mkPaintEnd();
    return;
  }
  MK.shown = Math.min(MK.shown || MK_CHUNK, MK.view.length);
  grid.innerHTML = mkCards(0, MK.shown);
  mkObserveClocks(grid);
  mkPaintCount(); mkPaintEnd(); mkArmSentinel();
}

/* insertAdjacentHTML, never innerHTML += — the latter re-parses everything
   already rendered, recreates every <img> and restarts every shimmer, which
   makes each Show-more slower than the last. */
function mkAppend(){
  if(MK.shown >= MK.view.length) return;
  const from = MK.shown, to = Math.min(from + MK_CHUNK, MK.view.length);
  const grid = document.getElementById('mk-grid');
  grid.insertAdjacentHTML('beforeend', mkCards(from, to));
  MK.shown = to;
  mkObserveClocks(grid, from);
  mkPaintCount(); mkPaintEnd(); mkArmSentinel();
  if(window.lenis) lenis.resize();
  return grid.querySelectorAll('.mk-card')[from];
}

/* Called after any external mutation of DATA (a claim). Re-renders in place,
   preserving MK.shown and the scroll position — losing your place the instant
   you act on something is the worst thing a browse feed can do. */
function mkRefresh(){
  if(!MK.on || !MK.built) return;
  const y = window.scrollY;
  mkIndex();
  mkRender();
  window.scrollTo({top:y, behavior:'instant'});
}

/* ---------------- sentinel ---------------- */
function mkArmSentinel(){
  const s = document.getElementById('mk-sentinel');
  if(!s || !MK.sentIO) return;
  MK.sentIO.unobserve(s);
  /* IntersectionObserver reports CHANGES. After an append the sentinel is
     often still intersecting and would never fire again, so unobserve and
     re-observe on the next frame. Do not lose this in a refactor. */
  if(MK.shown < MK.view.length && MK.autoLeft > 0){
    requestAnimationFrame(function(){ if(MK.on) MK.sentIO.observe(s) });
  }
}

/* ---------------- clocks ---------------- */
function mkObserveClocks(grid, fromIndex){
  if(!MK.clockIO) return;
  if(fromIndex == null){ MK.live.clear(); MK.clockIO.disconnect(); }
  const cards = grid.querySelectorAll('.mk-card');
  for(let i = (fromIndex || 0); i < cards.length; i++){
    const c = cards[i].querySelector('.mk-clock');
    if(c) MK.clockIO.observe(c);
  }
}

/* Created lazily on first market entry, so a visitor who never opens the
   marketplace never pays for a second site-wide interval. */
function mkStartTick(){
  if(MK.tick) return;
  MK.tick = setInterval(function(){
    if(!MK.on || document.hidden || !MK.live.size) return;
    const now = Date.now();
    MK.live.forEach(function(el){
      /* a stored next-due timestamp, NOT a % 30 modulo: setInterval drifts
         and is coalesced, so a modulo gate silently freezes clocks. */
      if(now < (el._nx || 0)) return;
      const r = mkRemain(+el.dataset.mkDue);
      if(el._cls !== r.cls){ el.className = 'clock mk-clock ' + r.cls; el._cls = r.cls; }
      /* write the text node, not innerHTML — innerHTML would destroy and
         recreate the .pip span on every card, every second. */
      if(el._txt !== r.txt){ el.lastChild.nodeValue = r.txt; el._txt = r.txt; }
      el._nx = now + r.period;
    });
  }, 1000);
}

/* ---------------- URL state ---------------- */
function mkEncode(){
  const p = [];
  if(MK.q) p.push('q=' + encodeURIComponent(MK.q).replace(/%20/g,'+'));
  for(let a = 0; a < MK_AXES.length; a++){
    const ax = MK_AXES[a], sel = MK.f[ax.k];
    if(sel && sel.length){
      const ordered = ax.opts.map(function(o){ return o[0] })
                             .filter(function(v){ return sel.indexOf(v) > -1 });
      p.push(ax.k + '=' + ordered.join(','));
    }
  }
  if(MK.sort  !== MK_SORT_DEFAULT) p.push('sort=' + MK.sort);
  if(MK.dense !== 'comfort')       p.push('view=' + MK.dense);
  if(MK.stress)                    p.push('stress=' + MK.stress);
  return p.length ? '?' + p.join('&') : '';
}

function mkDecode(search){
  const u = new URLSearchParams(search || '');
  MK.q  = (u.get('q') || '').trim().toLowerCase();
  MK.qT = MK.q ? MK.q.split(/\s+/) : [];
  for(let a = 0; a < MK_AXES.length; a++){
    const ax = MK_AXES[a], raw = u.get(ax.k);
    const valid = ax.opts.map(function(o){ return o[0] });
    let v = raw ? raw.split(',').filter(function(x){ return valid.indexOf(x) > -1 }) : [];
    if(!ax.multi) v = v.slice(-1);              /* nested thresholds: keep one */
    MK.f[ax.k] = v;
  }
  const s = u.get('sort');  MK.sort  = MK_SORTS[s] ? s : MK_SORT_DEFAULT;
  const d = u.get('view');  MK.dense = (d === 'compact') ? 'compact' : 'comfort';
  const n = parseInt(u.get('stress'), 10);
  MK.stress = (n > 0 && n <= 2000) ? n : 0;
  return parseInt(u.get('item'), 10) || 0;
}

/* Only the history write is debounced. Compute is ~1ms; debouncing that
   would only add latency to the thing users judge as responsiveness.
   Safari throws SecurityError past ~100 history writes in 30s. */
function mkSyncURL(){
  clearTimeout(MK._uT);
  MK._uT = setTimeout(function(){
    if(!MK.on) return;                          /* never rewrite the URL from another view */
    history.replaceState({view:'market'}, '', ROUTES.market.path + mkEncode());
  }, 400);
}

function mkSyncChrome(){
  const q = document.getElementById('mk-q');   if(q) q.value = MK.q;
  const s = document.getElementById('mk-sort'); if(s) s.value = MK.sort;
  document.querySelectorAll('.mk-dbtn').forEach(function(b){
    b.classList.toggle('on', b.dataset.dense === MK.dense);
  });
  const demo = document.getElementById('mk-demo');
  const txt  = document.getElementById('mk-demo-txt');
  const btn  = document.getElementById('mk-stress-btn');
  if(demo && txt && btn){
    if(MK.stress){
      demo.classList.add('stress');
      txt.innerHTML = '<b>Stress test.</b> ' + MK.stress + ' generated placeholder listings have been ' +
        'added to the twelve real samples so you can see how the feed behaves at scale. Every generated ' +
        'card is marked <b>Placeholder</b>. None of it is inventory.';
      btn.textContent = 'Back to the twelve samples';
    } else {
      demo.classList.remove('stress');
      txt.textContent = 'Sample data — nothing below is a real listing. Prices are typical GTA ranges ' +
        'for the category, not appraisals of the individual item.';
      btn.textContent = 'See how this behaves with 1,000 items';
    }
    btn.style.display = (typeof mkStress === 'function') ? '' : 'none';
  }
}

/* ---------------- stress ---------------- */
function mkApplyStress(n){
  DATA.length = 0;
  for(let i = 0; i < MK_SEED.length; i++) DATA.push(MK_SEED[i]);
  if(n && typeof mkStress === 'function'){
    const gen = mkStress(n, Date.now());
    for(let i = 0; i < gen.length; i++) DATA.push(gen[i]);
  }
}

/* ---------------- chrome build (once) ---------------- */
function mkBuildChrome(){
  const sortSel = document.getElementById('mk-sort');
  let so = '';
  Object.keys(MK_SORTS).forEach(function(k){
    so += '<option value="' + k + '">' + MK_SORTS[k].label + '</option>';
  });
  sortSel.innerHTML = so;

  MK.clockIO = new IntersectionObserver(function(es){
    for(let i = 0; i < es.length; i++){
      const el = es[i].target;
      if(es[i].isIntersecting){ el._nx = 0; MK.live.add(el); } else MK.live.delete(el);
    }
  }, {root:null, rootMargin:'300px 0px'});

  MK.sentIO = new IntersectionObserver(function(es){
    if(!MK.on || MK.autoLeft <= 0) return;
    for(let i = 0; i < es.length; i++) if(es[i].isIntersecting){
      MK.autoLeft--; mkAppend(); return;
    }
  }, {root:null, rootMargin:'900px 0px'});

  /* the sheet backdrop, mobile only */
  const bg = document.createElement('div');
  bg.className = 'mk-sheet-bg'; bg.id = 'mk-sheet-bg';
  document.body.appendChild(bg);
  bg.addEventListener('click', function(){ mkSheet(false) });

  /* --- delegated: the rail --- */
  document.getElementById('mk-rail').addEventListener('click', function(e){
    const done = e.target.closest('#mk-sheet-done');
    if(done){ mkSheet(false); return; }
    const b = e.target.closest('.mk-chip[data-k]'); if(!b) return;
    if(b.getAttribute('aria-disabled') === 'true') return;
    const ax = MK_AXES.find(function(x){ return x.k === b.dataset.k });
    if(!ax) return;
    const v = b.dataset.v, sel = MK.f[ax.k];
    if(!ax.multi){
      MK.f[ax.k] = (sel[0] === v) ? [] : [v];
    } else {
      const i = sel.indexOf(v);
      if(i > -1) sel.splice(i, 1); else sel.push(v);
    }
    MK.shown = MK_CHUNK; MK.autoLeft = MK_AUTO_PAGES;
    mkRender(); mkSyncURL();
  });

  /* --- delegated: pills, grid, empty state, show-more --- */
  document.getElementById('v-market').addEventListener('click', function(e){
    const off = e.target.closest('[data-mk-off]');
    if(off){
      const parts = off.dataset.mkOff.split('|');
      const sel = MK.f[parts[0]], i = sel.indexOf(parts[1]);
      if(i > -1) sel.splice(i, 1);
      MK.shown = MK_CHUNK; MK.autoLeft = MK_AUTO_PAGES; mkRender(); mkSyncURL(); return;
    }
    if(e.target.closest('[data-mk-dropq]')){
      MK.q = ''; MK.qT = []; document.getElementById('mk-q').value = '';
      MK.shown = MK_CHUNK; MK.autoLeft = MK_AUTO_PAGES; mkRender(); mkSyncURL(); return;
    }
    const drop = e.target.closest('[data-mk-drop]');
    if(drop){
      const k = drop.dataset.mkDrop;
      if(k === 'q'){ MK.q = ''; MK.qT = []; document.getElementById('mk-q').value = ''; }
      else MK.f[k] = [];
      MK.shown = MK_CHUNK; MK.autoLeft = MK_AUTO_PAGES; mkRender(); mkSyncURL(); return;
    }
    if(e.target.closest('[data-mk-clear]')){ mkClearAll(); return; }
    if(e.target.closest('[data-mk-post]')){ go('post'); return; }
    const claim = e.target.closest('[data-mk-claim]');
    if(claim){ e.preventDefault(); e.stopPropagation(); openClaim(+claim.dataset.mkClaim); return; }
    const more = e.target.closest('#mk-more');
    if(more){
      MK.autoLeft = MK_AUTO_PAGES;
      const first = mkAppend();
      /* focus moves only on a genuine click, never from the observer —
         auto-focus on a scroll-triggered append yanks focus out of the
         search box mid-typing. */
      if(first){ const a = first.querySelector('.mk-t'); if(a) a.focus(); }
      return;
    }
    const t = e.target.closest('.mk-t');
    if(t){ e.preventDefault(); openDetail(+t.closest('.mk-card').dataset.id); }
  });

  /* --- search --- */
  document.getElementById('mk-q').addEventListener('input', function(e){
    const v = e.target.value.trim().toLowerCase();
    clearTimeout(MK._qT);
    MK._qT = setTimeout(function(){
      MK.q = v; MK.qT = v ? v.split(/\s+/) : [];
      MK.shown = MK_CHUNK; MK.autoLeft = MK_AUTO_PAGES;
      mkRender(); mkSyncURL();
    }, 120);
  });

  /* --- sort + density: both preserve MK.shown --- */
  document.getElementById('mk-sort').addEventListener('change', function(e){
    MK.sort = MK_SORTS[e.target.value] ? e.target.value : MK_SORT_DEFAULT;
    mkRender(); mkSyncURL();
  });
  document.querySelectorAll('.mk-dbtn').forEach(function(b){
    b.addEventListener('click', function(){
      MK.dense = b.dataset.dense;
      document.querySelectorAll('.mk-dbtn').forEach(function(x){ x.classList.toggle('on', x === b) });
      mkRender(); mkSyncURL();
    });
  });

  document.getElementById('mk-sheet-open').addEventListener('click', function(){ mkSheet(true) });
  document.getElementById('mk-stress-btn').addEventListener('click', function(){
    MK.stress = MK.stress ? 0 : 1000;
    mkApplyStress(MK.stress);
    mkIndex();
    MK.shown = MK_CHUNK; MK.autoLeft = MK_AUTO_PAGES;
    mkSyncChrome(); mkRender(); mkSyncURL();
    window.scrollTo({top:0, behavior:'instant'});
  });

  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && document.getElementById('mk-rail').classList.contains('open')) mkSheet(false);
  });

  icons();                                     /* exactly once, for static chrome only */
}

function mkClearAll(){
  MK.q = ''; MK.qT = [];
  const q = document.getElementById('mk-q'); if(q) q.value = '';
  for(let a = 0; a < MK_AXES.length; a++) MK.f[MK_AXES[a].k] = [];
  MK.shown = MK_CHUNK; MK.autoLeft = MK_AUTO_PAGES;
  mkRender(); mkSyncURL();
}

function mkSheet(open){
  const rail = document.getElementById('mk-rail'), bg = document.getElementById('mk-sheet-bg');
  rail.classList.toggle('open', open);
  if(bg) bg.classList.toggle('on', open);
  if(window.lenis){ open ? lenis.stop() : lenis.start(); }
}

/* ---------------- entry ---------------- */
function mkEnter(item){
  const grid = document.getElementById('mk-grid'); if(!grid) return;
  if(!MK.built){ mkBuildChrome(); MK.built = true; }
  mkApplyStress(MK.stress);
  mkIndex();
  MK.shown = MK_CHUNK; MK.autoLeft = MK_AUTO_PAGES;
  MK.live.forEach(function(el){ el._nx = 0 });   /* clocks stale from being away */
  mkStartTick();
  mkSyncChrome();
  mkRender();
  if(item && MK.byId[item]) openDetail(item);
}

/* Canonical seventh go() wrapper. Delegate FIRST — routes.js has already
   pushed the bare /marketplace path by the time we run, which is exactly
   what "a fresh nav click is a clean slate" should do. ROUTE_SILENT is true
   during popstate and first paint only, which is precisely the distinction
   this codec needs. */
if(typeof go === 'function'){
  const _goMkt = go;
  go = function(v){
    _goMkt(v);
    MK.on = (v === 'market');
    if(!MK.on) return;
    let item = 0;
    if(typeof ROUTE_SILENT !== 'undefined' && ROUTE_SILENT){
      item = mkDecode(location.search);          /* shared link or back/forward: URL wins */
    } else {
      mkDecode('');                              /* deliberate nav: clean slate */
    }
    mkEnter(item);
  };
}

/* routes.js runs initRoute() at parse time, BEFORE this file loads, so a deep
   link straight to /marketplace calls a go() that does not yet include the
   wrapper above. Idempotent catch-up — the worth.js pattern. */
window.addEventListener('load', function(){
  const host = document.getElementById('v-market');
  if(!host || !host.classList.contains('on')) return;
  MK.on = true;
  mkEnter(mkDecode(location.search));
});

/* renderFeeds() is this codebase's "something changed" signal — doClaim,
   gotIt, approveRequest and sendRelay all mutate DATA and then call it.
   Wrapping it is what makes a claim appear on a marketplace card, and it
   also keeps the retired legacy feeds from ever rendering 1,000 placeholders. */
if(typeof renderFeeds === 'function'){
  const _mkRF = renderFeeds;
  renderFeeds = function(){
    if(MK.stress){
      const all = DATA.slice();
      DATA.length = 0;
      for(let i = 0; i < MK_SEED.length; i++) DATA.push(MK_SEED[i]);
      try { _mkRF(); }
      finally { DATA.length = 0; for(let i = 0; i < all.length; i++) DATA.push(all[i]); }
    } else {
      _mkRF();
    }
    mkRefresh();
  };
}

/* A card that advertises two numbers and then opens a modal with less
   information reads as broken on the first tap. */
if(typeof openDetail === 'function'){
  const _mkOD = openDetail;
  openDetail = function(id){
    _mkOD(id);
    const rec = MK.byId[id]; if(!rec) return;
    const inner = document.getElementById('modal-inner'); if(!inner) return;
    if(inner.querySelector('.mk-dt')) return;
    const body = inner.querySelector('.dt-body') || inner.lastElementChild;
    if(!body) return;
    const v = (typeof VERDICT_META !== 'undefined' && VERDICT_META[rec.verdict]) || null;
    body.insertAdjacentHTML('beforeend',
      '<div class="mk-dt">' +
      (v ? '<span class="wp-verdict ' + rec.verdict + '" style="margin-top:18px">' + ic(v.ic) + v.txt + '</span>' : '') +
      '<div class="twonum" style="margin-top:12px">' +
        '<div class="num"><div class="k">What you pay</div><div class="v">' + rec.payV + '</div>' +
          '<div class="d">Free, first come. There is no catch and nobody checks whether you qualify.</div></div>' +
        '<div class="num buyer"><div class="k">What a buyer would pay</div><div class="v">' + rec.worth + '</div>' +
          '<div class="d">' + rec.worthD + '</div></div>' +
      '</div>' +
      '<p style="font-size:.82rem;color:var(--clay);margin:12px 0 0">Typical ranges for the GTA. ' +
      'Yours depends on condition, age and what it actually is.</p></div>');
    icons();
  };
}
