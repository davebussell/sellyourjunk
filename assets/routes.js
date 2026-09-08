/* =========================================================
   ROUTING — real URLs for each view.

   The b2bhighlights review flagged that everything lived at one
   URL. That cost three things at once: nobody could link to
   "How it works", every view shared a single title and
   description in search results, and any future analytics would
   have shown one pageview for the whole site.

   Each view now has a path, its own title, description and
   canonical. netlify.toml rewrites those paths to index.html
   with a 200 (a rewrite, not a redirect) so a deep link loads
   the real page rather than bouncing to the homepage first.

   Loads last, so it wraps the go() chain from app.js ->
   buyer.js -> verdict.js -> worth.js.
   ========================================================= */

const ROUTES = {
  home:     {path:'/',                  t:"We Pay for Junk — what it's worth, and where it should go",
             d:"We tell you exactly what your junk is worth and show you the best way to get rid of it in your area — sell, donate, recycle or haul. Free to use, always."},
  post:     {path:'/whats-it-worth',    t:"What's it worth? — We Pay for Junk",
             d:"Photograph anything you're getting rid of. We identify it, price it against what things like it actually sold for, and show you which local buyers want it."},
  how:      {path:'/how-it-works',      t:"How it works — We Pay for Junk",
             d:"Photo in, answer out. What it costs, who sees your address, what happens if nobody buys it, and which areas we cover in the western GTA."},
  feed:     {path:'/going-free',        t:"Going free near you — We Pay for Junk",
             d:"Things people are giving away in Mississauga, Etobicoke and Brampton. Free, first come, and every listing expires on its own."},
  market:   {path:'/marketplace',       t:"Everything going free near you — We Pay for Junk",
             d:"Every item people are giving away in Mississauga, Etobicoke and Brampton, with what each one is actually worth locally. Free, first come, and every listing expires on its own."},
  clearing: {path:'/clearing-a-home',   t:"Clearing a home — We Pay for Junk",
             d:"Emptying a house after a death, a move or a sale. Walk the rooms with your phone; we list everything, tell you what's worth money, and hand you one schedule."},
  orgs:     {path:'/for-organizations', t:"For organizations — We Pay for Junk",
             d:"Photographed, measured items before you send a truck, matched to a standing wants list you set once. Free for charities and community groups, permanently."},
  story:    {path:'/our-story',         t:"Our story — We Pay for Junk",
             d:"A house full of useful things and three days to empty it. Why this exists, and why we'll tell you to give something away even though we earn nothing when you do."},
  drop:     {path:'/the-drop',          t:"The Drop — for buyers | We Pay for Junk",
             d:"Dealers, recyclers and restorers: tell us what you buy in your own words and we'll find it. You only pay when we deliver a real seller."},
  receiver: {path:'/receiver-view',     t:"Receiver view — We Pay for Junk",
             d:"How a charity or community group sees the platform: standing wants, matched items, and 24 hours of first look."},
  inbox:    {path:'/your-listings',     t:"Your listings — We Pay for Junk",
             d:"How offers and pickup requests reach you, and why your address and phone number stay hidden until you approve someone."},
  report:   {path:'/sample-report',     t:"Sample diversion report — We Pay for Junk",
             d:"What a family gets at the end of a home clearing: where every item went, and how much was kept out of landfill."}
};

const PATH_TO_VIEW = Object.fromEntries(
  Object.entries(ROUTES).map(([v,r]) => [r.path, v]));

function normalisePath(p){
  p = (p || '/').replace(/\/+$/,'');       // trailing slash
  return p === '' ? '/' : p;
}

function setMeta(name, val, attr){
  attr = attr || 'name';
  let el = document.head.querySelector(`meta[${attr}="${name}"]`);
  if(!el){ el = document.createElement('meta'); el.setAttribute(attr,name); document.head.appendChild(el); }
  el.setAttribute('content', val);
}

function applyRouteMeta(v){
  const r = ROUTES[v]; if(!r) return;
  const url = 'https://wepayforjunk.com' + (r.path === '/' ? '/' : r.path);
  document.title = r.t;
  setMeta('description', r.d);
  setMeta('og:title', r.t, 'property');
  setMeta('og:description', r.d, 'property');
  setMeta('og:url', url, 'property');
  setMeta('twitter:title', r.t);
  setMeta('twitter:description', r.d);
  let c = document.head.querySelector('link[rel=canonical]');
  if(!c){ c = document.createElement('link'); c.rel='canonical'; document.head.appendChild(c); }
  c.href = url;
}

/* true only while we're reacting to the browser, so back/forward and the
   first paint don't push duplicate entries onto the history stack */
var ROUTE_SILENT = false;

if(typeof go === 'function'){
  const _goRoute = go;
  go = function(v){
    _goRoute(v);
    applyRouteMeta(v);
    if(ROUTE_SILENT) return;
    const p = ROUTES[v] ? ROUTES[v].path : '/';
    if(normalisePath(location.pathname) !== p){
      history.pushState({view:v}, '', p);
    }
  };
}

window.addEventListener('popstate', () => {
  const v = PATH_TO_VIEW[normalisePath(location.pathname)] || 'home';
  ROUTE_SILENT = true;
  try { go(v); } finally { ROUTE_SILENT = false; }
});

/* first paint: honour whatever path we were opened at */
(function initRoute(){
  const v = PATH_TO_VIEW[normalisePath(location.pathname)];
  if(v && v !== 'home'){
    ROUTE_SILENT = true;
    try { go(v); } finally { ROUTE_SILENT = false; }
    /* keep location.search: assets/market.js stores the marketplace's filter
       state there, and this line runs before market.js is parsed. */
    history.replaceState({view:v}, '', ROUTES[v].path + location.search);
  } else {
    applyRouteMeta('home');
  }
})();
