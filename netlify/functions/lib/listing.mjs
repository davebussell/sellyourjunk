/* =========================================================
   THE NORMALIZED LISTING, and the coverage record that
   travels with every search.

   Every marketplace describes an item differently. eBay has
   itemSummaries, Discogs has releases, an auction house has
   lots. This is the one shape the interface renders, so a
   provider's only job is to map into it.

   The coverage record is not incidental — it is the product.
   A search that quietly returns eBay results lets someone
   conclude their sofa is worth what eBay says, when the
   venue most Canadians would actually sell it on was never
   queried. Every response therefore carries what we asked,
   what answered, what failed, and what we cannot see at all.
   The interface is required to render that.
   ========================================================= */

/** A listing we are prepared to show someone. */
export function listing(o) {
  const miss = ['id', 'title', 'url', 'marketplace', 'state'].filter(k => !o[k]);
  if (miss.length) throw new Error('listing missing ' + miss.join(', '));
  if (o.state !== 'live' && o.state !== 'sold')
    throw new Error('listing.state must be live or sold, got ' + o.state);
  // A sold listing with no date is close to useless and actively misleading:
  // "sold for $40" reads as recent when it may be from 2019.
  if (o.state === 'sold' && !o.soldAt)
    throw new Error('sold listing needs soldAt: an undated sale reads as a current price');

  return {
    id: String(o.id),
    title: String(o.title),
    url: String(o.url),
    state: o.state,
    soldAt: o.soldAt || null,
    price: o.price == null ? null : {
      amount: Number(o.price.amount),
      currency: o.price.currency || 'CAD',
      // Set only when we converted it ourselves, so the interface can say so
      // rather than presenting a converted figure as the sale price.
      converted: !!o.price.converted,
      originalAmount: o.price.originalAmount ?? null,
      originalCurrency: o.price.originalCurrency ?? null
    },
    shipping: o.shipping ?? null,
    condition: o.condition ?? null,
    image: o.image ?? null,
    location: o.location ?? null,
    marketplace: o.marketplace,
    // 'exact' only where the source matched a real product identity (a
    // barcode, a catalogue number, a model). Most used junk has none, so
    // 'similar' is the honest default and the interface must not round it up.
    match: o.match === 'exact' ? 'exact' : 'similar'
  };
}

/**
 * What a provider reports about its own run. `notCovered` is separate
 * from `failed` on purpose: a provider that errored might work next time,
 * a marketplace we have no lawful route into never will, and telling a
 * user "temporarily unavailable" about the second one is a lie.
 */
export function coverage() {
  const queried = [], failed = [], notCovered = [];
  return {
    ok(source, count, opts = {}) {
      queried.push({
        id: source.id, name: source.name, count,
        hasSold: !!opts.hasSold,
        soldWindow: opts.soldWindow ?? null,
        fetchedAt: opts.fetchedAt ?? null,
        cached: !!opts.cached
      });
    },
    fail(source, reason) {
      failed.push({ id: source.id, name: source.name, reason: String(reason).slice(0, 300) });
    },
    absent(source, why) {
      notCovered.push({ id: source.id, name: source.name, why });
    },
    build(extra = {}) {
      return {
        queried, failed, notCovered,
        totalShown: queried.reduce((n, q) => n + q.count, 0),
        soldDataFrom: queried.filter(q => q.hasSold).map(q => q.name),
        ...extra
      };
    }
  };
}

/** Sort for display: live before sold, then most recent, then cheapest. */
export function rank(items) {
  return items.slice().sort((a, b) => {
    if (a.state !== b.state) return a.state === 'live' ? -1 : 1;
    if (a.state === 'sold' && a.soldAt && b.soldAt) return b.soldAt.localeCompare(a.soldAt);
    const pa = a.price ? a.price.amount : Infinity;
    const pb = b.price ? b.price.amount : Infinity;
    return pa - pb;
  });
}

/**
 * Descriptive statistics over sold listings only.
 *
 * Deliberately refuses to produce a number from a handful of sales. The
 * whole reason this site exists is that it would rather say "we do not
 * know" than publish a confident figure it cannot support, and three
 * data points is not a price — it is an anecdote with a mean.
 */
export const MIN_SOLD_FOR_STATS = 5;

export function soldStats(items) {
  const sold = items
    .filter(i => i.state === 'sold' && i.price && Number.isFinite(i.price.amount))
    .map(i => i.price.amount)
    .sort((a, b) => a - b);

  if (sold.length < MIN_SOLD_FOR_STATS) {
    return {
      enough: false,
      n: sold.length,
      need: MIN_SOLD_FOR_STATS,
      why: sold.length === 0
        ? 'We found no completed sales for this, so we are not going to estimate one.'
        : 'Only ' + sold.length + ' completed ' + (sold.length === 1 ? 'sale' : 'sales')
          + ' found. That is too few to call it a price, so we are showing you the '
          + 'sales themselves instead of an average.'
    };
  }
  const at = q => sold[Math.min(sold.length - 1, Math.floor(q * (sold.length - 1)))];
  return {
    enough: true,
    n: sold.length,
    low: at(0.25),
    median: at(0.5),
    high: at(0.75),
    min: sold[0],
    max: sold[sold.length - 1]
  };
}
