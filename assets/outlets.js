/* =========================================================
   OUTLETS — connects what someone adds to the site to the real,
   verified organizations behind the /donate and /sell guides.

   The Verdict currently answers "what is it worth" with fictional
   buyers. This answers "so where do I actually take it" with
   organizations that were each checked against their own website.
   Same data, one build step, no second list to maintain.

   Three things this deliberately does NOT do:

   - No geolocation. The guides refused to publish "2.4 km away"
     because there is no postcode field and a distance from an
     unstated origin is a claim about where the reader is standing.
     The city is chosen by the reader, and it lives in the URL
     rather than storage, because the privacy policy says plainly
     that this site sets no cookies and stores nothing.

   - No wish-list charities. Shepherds of Good Hope wants
     toothbrushes and new underwear, not a dresser. build-outlets.py
     routes those to 'wishlist' so they appear on the city guide,
     where someone can choose to help, but never in a match.

   - No promises about pickup. An organization whose site does not
     state a collection service renders as "ask them", never as a
     silent no. Roughly a third of the dataset is a genuine unknown.
   ========================================================= */

var OUTLETS = {
  data: null,
  loading: null,
  city: '',
  host: null,
  cats: []
};

/* The rest of the site already speaks in its own category words. Rather than
   retag anything, translate at the boundary. market.js prices by kind,
   worth.js keys its teaser, verdict.js keys its demo items. */
const OUTLET_ALIAS = {
  sport: 'bike', textile: 'clothing', elec: 'electronics', car: 'vehicle',
  dresser: 'furniture', sofa: 'furniture', fridge: 'appliance', piano: 'music',
  sew: 'tools', 'books-media': 'books', 'building-reuse': 'building',
  'furniture-bank': 'furniture', 'thrift-chain': 'clothing'
};
function outletCats(input){
  const raw = Array.isArray(input) ? input : [input];
  const out = [];
  raw.forEach(function(x){
    const c = OUTLET_ALIAS[x] || x;
    if (c && out.indexOf(c) === -1) out.push(c);
  });
  return out;
}

/* 56KB of verified organizations is not worth loading for a visitor who never
   asks the question, so it arrives on first use and only once. */
function outletsLoad(){
  if (OUTLETS.data) return Promise.resolve(OUTLETS.data);
  if (OUTLETS.loading) return OUTLETS.loading;
  OUTLETS.loading = new Promise(function(resolve){
    const s = document.createElement('script');
    s.src = '/assets/outlets-data.js';
    s.onload = function(){ OUTLETS.data = window.OUTLET_DATA || null; resolve(OUTLETS.data); };
    s.onerror = function(){ OUTLETS.data = null; resolve(null); };   // degrade, never throw
    document.head.appendChild(s);
  });
  return OUTLETS.loading;
}

function outletsCityList(){
  const d = OUTLETS.data; if (!d) return [];
  return Object.keys(d.cities)
    .map(function(k){ return {slug:k, name:d.cities[k].n, prov:d.cities[k].p}; })
    .sort(function(a,b){ return a.name.localeCompare(b.name); });
}

/* Match on ANY overlapping category, not all: an organization that takes
   furniture is a real answer for a dresser even though it does not take the
   other four things the item also happens to be tagged with. */
function outletsFor(cats, city){
  const d = OUTLETS.data;
  if (!d || !d.cities[city]) return {donate:[], sell:[], recycle:[], total:0};
  const want = outletCats(cats);
  const groups = {donate:[], sell:[], recycle:[]};
  d.cities[city].o.forEach(function(o){
    if (o.r === 'wishlist') return;                 // never match a needs list
    if (!o.c || !o.c.length) return;
    if (want.length && !o.c.some(function(c){ return want.indexOf(c) > -1; })) return;
    if (groups[o.r]) groups[o.r].push(o);
  });
  /* Collectors first — "will they come to me" is the question that decides
     whether a person with a sofa does anything at all. */
  const rank = {free:0, paid:1, conditional:1, unknown:2, none:3};
  Object.keys(groups).forEach(function(k){
    groups[k].sort(function(a,b){
      return (a.g||0) - (b.g||0)
          || (rank[a.p] - rank[b.p])
          || a.n.localeCompare(b.n);
    });
  });
  groups.total = groups.donate.length + groups.sell.length + groups.recycle.length;
  return groups;
}

const OUTLET_PICK = {
  free:        ['free',        'collects free'],
  paid:        ['paid',        'collects, for a fee'],
  conditional: ['conditional', 'collects, conditions'],
  none:        ['none',        'drop off'],
  unknown:     ['unknown',     'ask them']
};

/* Only the deals a reader can be surprised by. "Buys outright" needs no badge
   — it is what everyone assumes is on offer. The other four are all cases of
   walking in expecting cash and leaving with something else. */
const OUTLET_DEAL = {
  'pawn-loan':         'pawn loan, not a sale',
  'both':              'sells or lends — ask which',
  'consignment-split': 'consignment — paid when it sells',
  'trade-credit':      'store credit, not cash',
  'by-weight':         'paid by weight'
};

function outletRow(o){
  const p = OUTLET_PICK[o.p] || OUTLET_PICK.unknown;
  let flag = o.x === 1 ? '<span class="ot-flag">not a charity</span>' : '';
  /* The guides carry the full explanation of what a pawn ticket commits you to.
     The widget has room for one clause, so it spends it on the distinction that
     costs people their property: this may be a loan, not a sale. */
  if (o.w === 1) flag += '<span class="ot-flag warn">may be a loan, not a sale</span>';
  const deal = OUTLET_DEAL[o.deal]
    ? '<span class="ot-deal">' + OUTLET_DEAL[o.deal] + '</span>' : '';
  return '<li class="ot-row">'
    + '<a href="' + o.u + '" target="_blank" rel="noopener nofollow">' + o.n + '</a>'
    + flag + deal
    + '<span class="ot-pick ' + p[0] + '">' + p[1] + '</span>'
    + (o.d ? '<span class="ot-note">' + o.d + '</span>' : '')
    + '</li>';
}

function outletsRender(){
  const host = OUTLETS.host; if (!host) return;
  const cities = outletsCityList();

  if (!cities.length){
    host.innerHTML = '<div class="ot-box"><p class="ot-fail">We could not load the local directory '
      + 'just now. The city guides are still there: <a href="/donate">every city we cover</a>.</p></div>';
    return;
  }

  const chips = cities.map(function(c){
    return '<button type="button" class="ot-chip' + (c.slug === OUTLETS.city ? ' on' : '') + '" '
         + 'data-ot-city="' + c.slug + '">' + c.name + '</button>';
  }).join('');

  let body;
  if (!OUTLETS.city){
    body = '<p class="ot-ask">Pick your city and we will show you who near you actually takes this '
         + '— every one checked against its own website, none of them paying us to be listed.</p>';
  } else {
    const g = outletsFor(OUTLETS.cats, OUTLETS.city);
    const cityName = (OUTLETS.data.cities[OUTLETS.city] || {}).n || '';
    if (!g.total){
      body = '<p class="ot-ask">Nothing in our ' + cityName + ' list takes this specific thing. '
           + 'That is a gap in our directory, not proof nobody wants it — '
           + '<a href="/donate/' + OUTLETS.city + '">the full ' + cityName + ' guide</a> '
           + 'has everyone we have verified there.</p>';
    } else {
      const sec = [];
      if (g.sell.length)
        sec.push('<div class="ot-sec"><h5>Sell it</h5><ul>'
          + g.sell.slice(0,4).map(outletRow).join('') + '</ul></div>');
      if (g.donate.length)
        sec.push('<div class="ot-sec"><h5>Give it away</h5><ul>'
          + g.donate.slice(0,4).map(outletRow).join('') + '</ul></div>');
      if (g.recycle.length)
        sec.push('<div class="ot-sec"><h5>Recycle it</h5><ul>'
          + g.recycle.slice(0,2).map(outletRow).join('') + '</ul></div>');
      const more = [];
      if (g.sell.length)
        more.push('<a class="ot-more" href="/sell/' + OUTLETS.city + '">'
          + 'All ' + g.sell.length + ' buyers in ' + cityName + ' &rarr;</a>');
      if (g.donate.length + g.recycle.length)
        more.push('<a class="ot-more" href="/donate/' + OUTLETS.city + '">'
          + 'All ' + (g.donate.length + g.recycle.length) + ' places in ' + cityName
          + ' that take it free &rarr;</a>');
      body = sec.join('') + '<div class="ot-mores">' + more.join('') + '</div>';
    }
  }

  host.innerHTML =
    '<div class="ot-box">'
    + '<div class="ot-head"><h4>Where to take it near you</h4>'
    + '<span class="ot-sub">Real organizations, verified against their own sites</span></div>'
    + '<div class="ot-chips">' + chips + '</div>'
    + body
    + '</div>';
}

/* Mount into any container. cats accepts the site's own category words. */
function outletsMount(hostId, cats){
  const host = document.getElementById(hostId); if (!host) return;
  OUTLETS.host = host;
  OUTLETS.cats = outletCats(cats);
  host.innerHTML = '<div class="ot-box"><p class="ot-ask">Loading the local directory…</p></div>';
  outletsLoad().then(function(){
    if (!OUTLETS.city){
      const u = new URLSearchParams(location.search).get('city');
      if (u && OUTLETS.data && OUTLETS.data.cities[u]) OUTLETS.city = u;
    }
    outletsRender();
  });
}

/* Delegated so a re-render never has to rebind. The city goes in the URL, not
   in storage — same reasoning as the marketplace filters, and it keeps the
   "we store nothing" line in the privacy policy true. */
document.addEventListener('click', function(e){
  const b = e.target.closest && e.target.closest('[data-ot-city]');
  if (!b) return;
  OUTLETS.city = b.dataset.otCity;
  try {
    const u = new URL(location.href);
    u.searchParams.set('city', OUTLETS.city);
    history.replaceState(history.state, '', u.pathname + u.search);
  } catch (err) { /* URL rewriting is a convenience, never a requirement */ }
  outletsRender();
});
