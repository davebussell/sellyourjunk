/* =========================================================
   THE SOURCE REGISTRY — the single place that decides what
   this site can and cannot see.

   Two rules, both load-bearing:

   1. A source is only queried when `wired` is true AND its
      credentials are present in the environment. A source
      that is declared but not wired returns nothing. It never
      returns a placeholder, a sample, or an approximation.
      There is no code path in this project that invents a
      listing, and there must not be: the entire history of
      this site is removing fabricated content that looked
      plausible enough to believe.

   2. Every source in `ABSENT` is rendered to the user, on
      every search, with the reason. A results page that shows
      only what it happens to have access to, and stays quiet
      about the largest venue in the country, is a more
      dangerous kind of dishonest than an empty page — the
      person walks away with a number and no idea what it
      excludes.

   Statuses are set by evidence, not optimism. `wired` flips to
   true only once a source has been confirmed to (a) exist,
   (b) admit us, (c) return the data we claim, and (d) permit
   us to display it.
   ========================================================= */

/**
 * Sources we intend to query. `wired` is false until the data-access
 * audit confirms all four conditions above and the integration is built
 * and tested against the live API.
 */
export const SOURCES = [
  {
    id: 'ebay',
    name: 'eBay',
    wired: false,
    env: ['EBAY_CLIENT_ID', 'EBAY_CLIENT_SECRET'],
    gives: ['live'],
    note: 'Active listings. Completed-sale access is a separate, restricted API.'
  },
  {
    id: 'discogs',
    name: 'Discogs',
    wired: false,
    env: ['DISCOGS_TOKEN'],
    gives: ['live', 'sold'],
    categories: ['music', 'books'],
    note: 'Records and music media only, but carries real sale history.'
  },
  {
    id: 'reverb',
    name: 'Reverb',
    wired: false,
    env: ['REVERB_TOKEN'],
    gives: ['live', 'sold'],
    categories: ['music'],
    note: 'Musical instruments and gear.'
  },
  {
    id: 'pricecharting',
    name: 'PriceCharting',
    wired: false,
    env: ['PRICECHARTING_TOKEN'],
    gives: ['sold'],
    categories: ['electronics', 'toys', 'books'],
    note: 'Games, cards and collectibles. Paid data.'
  }
];

/**
 * Marketplaces we cannot lawfully query, with the reason shown verbatim
 * to the user. These are not failures to retry — they are permanent gaps
 * in what this site can see, and hiding them would let someone mistake a
 * partial answer for the whole market.
 *
 * `why` is user-facing copy. Write it as an explanation, not an excuse.
 */
export const ABSENT = [
  {
    id: 'facebook-marketplace',
    name: 'Facebook Marketplace',
    why: 'No way for an outside site to search it. Meta provides no public listings API, '
       + 'and collecting them any other way is against its terms. For a lot of ordinary '
       + 'household things this is where most Canadians actually sell, so treat anything '
       + 'below as a partial picture and check there yourself.'
  },
  {
    id: 'kijiji',
    name: 'Kijiji',
    why: 'No public API for outside sites to search listings.'
  },
  {
    id: 'craigslist',
    name: 'Craigslist',
    why: 'Does not permit automated access by other sites.'
  }
];

/** True when a source is switched on and its credentials actually exist. */
export function ready(src, env = process.env) {
  if (!src.wired) return false;
  return (src.env || []).every(k => !!env[k]);
}

export function active(env = process.env) {
  return SOURCES.filter(s => ready(s, env));
}

/**
 * Sources that are declared and switched on but missing credentials, or
 * declared and not yet wired. Surfaced so an operator can see why a search
 * came back thin — and so it can never be mistaken for "no results exist".
 */
export function dormant(env = process.env) {
  return SOURCES.filter(s => !ready(s, env)).map(s => ({
    id: s.id,
    name: s.name,
    reason: !s.wired ? 'not yet connected'
                     : 'connected but missing credentials: ' + (s.env || []).filter(k => !env[k]).join(', ')
  }));
}

/**
 * The honest one-line summary of what a given search actually looked at.
 * The interface uses this verbatim rather than composing its own wording,
 * so the disclosure cannot drift from the truth as sources come and go.
 */
export function coverageSentence(env = process.env) {
  const on = active(env);
  if (!on.length) {
    return 'We are not connected to any marketplace yet, so we have nothing real to show you. '
         + 'We would rather show you nothing than make up listings.';
  }
  const names = on.map(s => s.name);
  const list = names.length === 1 ? names[0]
    : names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1];
  return 'We searched ' + list + '. We cannot see '
       + ABSENT.map(a => a.name).join(', ') + ', so this is part of the market, not all of it.';
}
