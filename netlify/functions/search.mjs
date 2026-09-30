/* =========================================================
   /api/search — one query, every marketplace we can lawfully
   reach, plus an honest account of the ones we cannot.

   Runs server-side for three reasons: marketplace API
   credentials cannot ship to a browser, most of these APIs
   send no CORS headers, and their rate limits need a cache
   in front of them.

   The response always carries `coverage`. The interface is
   required to render it. A results list without it would let
   someone read four eBay sales as the market rate for their
   sofa, when the place most Canadians would actually sell one
   was never searched.
   ========================================================= */

import { rank, soldStats, coverage } from './lib/listing.mjs';
import { SOURCES, ABSENT, active, dormant, coverageSentence } from './lib/sources.mjs';

const PROVIDERS = {
  // Filled in as each source is confirmed and built. A provider is a
  // function (query, signal) -> { listings, meta }. Until one exists here
  // its source stays dark; nothing substitutes for it.
};

const MAX_RESULTS = 60;
const TIMEOUT_MS = 8000;

export default async function handler(req) {
  const url = new URL(req.url);
  const q = (url.searchParams.get('q') || '').trim();

  if (!q) {
    return json({ error: 'Add ?q= to search for something.' }, 400);
  }
  if (q.length > 200) {
    return json({ error: 'That search is too long.' }, 400);
  }

  const on = active();
  const cov = coverage();
  ABSENT.forEach(a => cov.absent(a, a.why));

  // Nothing connected yet. Say exactly that, and say it as the answer —
  // not as an error the interface might swallow and render as "no results",
  // which would read as "your item is worthless" rather than "we did not look".
  if (!on.length) {
    return json({
      query: q,
      listings: [],
      stats: { enough: false, n: 0, why: 'We have not connected any marketplace yet.' },
      coverage: cov.build({
        sentence: coverageSentence(),
        dormant: dormant(),
        connected: false
      })
    });
  }

  const settled = await Promise.allSettled(on.map(async src => {
    const provider = PROVIDERS[src.id];
    if (!provider) throw new Error('no provider implementation');
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), TIMEOUT_MS);
    try {
      return { src, ...(await provider(q, ctl.signal)) };
    } finally {
      clearTimeout(t);
    }
  }));

  let listings = [];
  settled.forEach((r, i) => {
    const src = on[i];
    if (r.status === 'rejected') {
      cov.fail(src, r.reason && r.reason.message ? r.reason.message : r.reason);
      return;
    }
    const got = r.value.listings || [];
    listings = listings.concat(got);
    cov.ok(src, got.length, {
      hasSold: got.some(l => l.state === 'sold'),
      soldWindow: r.value.meta && r.value.meta.soldWindow,
      fetchedAt: r.value.meta && r.value.meta.fetchedAt,
      cached: !!(r.value.meta && r.value.meta.cached)
    });
  });

  const ranked = rank(listings).slice(0, MAX_RESULTS);

  return json({
    query: q,
    listings: ranked,
    // Computed over everything we found, not just the page we return, so
    // the figure does not silently change with the display limit.
    stats: soldStats(listings),
    coverage: cov.build({
      sentence: coverageSentence(),
      dormant: dormant(),
      connected: true,
      truncated: listings.length > ranked.length ? listings.length - ranked.length : 0
    })
  });
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      // Marketplace prices move slowly enough that a minute of shared cache
      // is free accuracy, and it keeps us inside everyone's rate limits.
      'cache-control': status === 200 ? 'public, max-age=60, s-maxage=300' : 'no-store'
    }
  });
}

export const config = { path: '/api/search' };
