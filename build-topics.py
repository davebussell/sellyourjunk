#!/usr/bin/env python3
"""
Build the item-category guides: /donate/<city>/<item> and /sell/<city>/<item>.

Search Console says the demand is item + city, not "where to donate".
Real queries already ranking: "donate furniture london" (position 8),
"who buys non working appliances near me" (6), "furniture donation cole
harbour" (4), "posner metals price list" (9). Nobody searched a bare
"where to donate".

The city guides answer "everything in Toronto". These answer "furniture in
Toronto", which is the question people actually type.

Nothing here invents an organization. Every page is a filtered view of the
same verified records behind /donate/<city> and /sell/<city>, plus category
editorial that was separately researched and fact-checked.

  python build-topics.py          build
  python build-topics.py --dry    report what would be built, write nothing
"""
import json, os, sys, importlib.util

ROOT = os.path.dirname(os.path.abspath(__file__))

_spec = importlib.util.spec_from_file_location('guides', os.path.join(ROOT, 'build-guides.py'))
_g = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(_g)
head, FOOT, IC, E, tel, SITE = _g.head, _g.FOOT, _g.IC, _g.E, _g.tel, _g.SITE
city_label, fit_title = _g.city_label, _g.fit_title

_bo = importlib.util.spec_from_file_location('outlets', os.path.join(ROOT, 'build-outlets.py'))
_o = importlib.util.module_from_spec(_bo); _bo.loader.exec_module(_o)

# A page needs enough real organizations to be worth landing on. Below this
# it is a thin page dressed as a guide, which is both useless to the reader
# and the exact pattern search engines demote as a doorway. The guard is the
# point: we would rather publish 120 good pages than 364 padded ones.
MIN_ORGS = 3

# slug, display noun, the phrase people actually search
ITEMS = [
    ('furniture',          'furniture',           'furniture'),
    ('appliances',         'appliances',          'appliances'),
    ('electronics',        'electronics',         'electronics and computers'),
    ('clothes',            'clothes',             'clothes and textiles'),
    ('kitchenware',        'kitchenware',         'kitchenware and housewares'),
    ('tools',              'tools',               'tools'),
    ('bikes',              'bikes',               'bikes and sports gear'),
    ('cars',               'cars',                'cars and vehicles'),
    ('books',              'books',               'books, records and media'),
    ('building-materials', 'building materials',  'building and renovation materials'),
    ('scrap-metal',        'scrap metal',         'scrap metal'),
    ('toys',               'toys',                'toys and baby equipment'),
    ('instruments',        'musical instruments', 'musical instruments'),
]
# page slug -> the canonical category key used by the tagger
TO_CAT = {
    'furniture': 'furniture', 'appliances': 'appliance', 'electronics': 'electronics',
    'clothes': 'clothing', 'kitchenware': 'kitchen', 'tools': 'tools', 'bikes': 'bike',
    'cars': 'vehicle', 'books': 'books', 'building-materials': 'building',
    'scrap-metal': 'metal', 'toys': 'toys', 'instruments': 'music',
}
ITEM_BY_SLUG = {s: (s, n, p) for s, n, p in ITEMS}

PICK = _g.PICK
DEAL = {
    'sell-outright': ('sell', 'Buys outright'), 'pawn-loan': ('pawn', 'Pawn loan'),
    'both': ('pawn', 'Buys or lends'), 'consignment-split': ('consign', 'Consignment'),
    'by-weight': ('weight', 'Paid by weight'), 'quote-first': ('quote', 'Quote first'),
    'trade-credit': ('credit', 'Store credit, not cash'),
}
COLLECT = {'conditional': ('cond', 'May collect — ask'), 'no': ('no', 'Bring it to them'),
           'unknown': ('unk', 'Not stated — ask')}


def load(p):
    f = os.path.join(ROOT, p)
    return json.load(open(f, encoding='utf-8')) if os.path.exists(f) else None


def cats_of(o, key):
    """Re-tag from source so we keep the full record, not the slim index entry."""
    if o.get('takesAnything'):
        return list(_o.CATS)
    c = _o.tag(o.get(key) or [])
    if not c and key == 'buys' and _o.HOUSEHOLD.search(' '.join(o.get('buys') or [])):
        c = ['furniture', 'kitchen', 'electronics', 'appliance', 'books', 'toys']
    return c


def collect_index():
    """{city: {'n','prov','donate':{cat:[orgs]}, 'sell':{cat:[orgs]}, ...}}"""
    don, sell = load('data/donations.json'), load('data/sell-outlets.json')
    idx = {}
    for m in (don or {}).get('metros', []):
        e = idx.setdefault(m['slug'], {'n': m['name'], 'prov': m.get('prov', ''),
                                       'donate': {}, 'sell': {}, 'reg': '', 'local': ''})
        for o in m['orgs']:
            if o.get('kind') == 'wishlist' or o.get('wishlist'):
                continue
            for c in cats_of(o, 'accepts'):
                e['donate'].setdefault(c, []).append(o)
    for m in (sell or {}).get('metros', []):
        e = idx.setdefault(m['slug'], {'n': m['name'], 'prov': m.get('prov', ''),
                                       'donate': {}, 'sell': {}, 'reg': '', 'local': ''})
        e['reg'] = m.get('regulationNote', '')
        for o in m['orgs']:
            for c in cats_of(o, 'buys'):
                e['sell'].setdefault(c, []).append(o)
    return idx


# ---------------------------------------------------------------- rendering

def org_donate(o):
    p = PICK.get(o.get('pickup', 'unknown'), PICK['unknown'])
    rows = []
    if o.get('accepts'):
        rows.append(('Takes', ', '.join(o['accepts'])))
    if o.get('refuses'):
        rows.append(("Won't take", ', '.join(o['refuses'])))
    if o.get('pickupNote'):
        rows.append(('Collection', o['pickupNote']))
    if o.get('singleAddress'):
        rows.append(('Where', o['singleAddress']))
    elif o.get('locationsNote'):
        rows.append(('Where', o['locationsNote']))
    flags = ''
    if o.get('notCharity'):
        flags += f'<div class="g-flag not-charity">{IC["info"]}<span>{E(o["notCharity"])}</span></div>'
    if o.get('restricted'):
        flags += f'<div class="g-flag restricted">{IC["info"]}<span>{E(o["restricted"])}</span></div>'
    foot = [f'<a class="btn sm" href="{E(o["url"])}" target="_blank" rel="noopener nofollow">Visit their site &rarr;</a>']
    if o.get('phone'):
        foot.append(f'<a class="g-tel" href="tel:{E(tel(o["phone"]))}">{IC["phone"]}{E(o["phone"])}</a>')
    return f'''      <article class="g-org">
        <div class="g-org-top">
          <h3><a href="{E(o["url"])}" target="_blank" rel="noopener nofollow">{E(o["name"])}</a></h3>
          <span class="g-pick {p[0]}">{IC["truck"]}{p[1]}</span>
        </div>
        <div class="g-rows">
{chr(10).join(f'          <div class="g-row"><span class="k">{E(k)}</span><span class="v">{E(v)}</span></div>' for k, v in rows)}
        </div>
{flags}        <div class="g-org-foot">{"".join(foot)}</div>
      </article>
'''


def org_sell(o):
    d = DEAL.get(o.get('deal'), DEAL['quote-first'])
    c = COLLECT.get(o.get('collects'), COLLECT['unknown'])
    rows = []
    if o.get('buys'):
        rows.append(('Buys', ', '.join(o['buys'])))
    if o.get('refuses'):
        rows.append(("Won't take", ', '.join(o['refuses'])))
    if o.get('dealNote'):
        rows.append(('The deal', o['dealNote']))
    if o.get('singleAddress'):
        rows.append(('Where', o['singleAddress']))
    elif o.get('locationsNote'):
        rows.append(('Where', o['locationsNote']))
    flags = ''
    if o.get('nameNote'):
        flags += f'<div class="g-flag restricted">{IC["info"]}<span>{E(o["nameNote"])}</span></div>'
    if o.get('noPremises'):
        flags += (f'<div class="g-flag restricted">{IC["info"]}<span><b>No public premises listed.</b> '
                  'We could not find a street address or phone on their site.</span></div>')
    if o.get('caution'):
        flags += f'<div class="g-flag not-charity">{IC["info"]}<span>{E(o["caution"])}</span></div>'
    foot = [f'<a class="btn sm" href="{E(o["url"])}" target="_blank" rel="noopener nofollow">Visit their site &rarr;</a>']
    if o.get('phone'):
        foot.append(f'<a class="g-tel" href="tel:{E(tel(o["phone"]))}">{IC["phone"]}{E(o["phone"])}</a>')
    return f'''      <article class="g-org">
        <div class="g-org-top">
          <h3><a href="{E(o["url"])}" target="_blank" rel="noopener nofollow">{E(o["name"])}</a></h3>
          <span class="s-deal {d[0]}">{d[1]}</span>
          <span class="s-col {c[0]}">{c[1]}</span>
        </div>
        <div class="g-rows">
{chr(10).join(f'          <div class="g-row"><span class="k">{E(k)}</span><span class="v">{E(v)}</span></div>' for k, v in rows)}
        </div>
{flags}        <div class="g-org-foot">{"".join(foot)}</div>
      </article>
'''


# What the organizations on a page say they will not take, grouped into themes
# so the page can count them. Every one of these is computed from the orgs'
# own refuses lists, each checked against that organization's website - which
# is why this replaced the researched prose about what "most charities" do.
REFUSE_THEMES = [
    ('mattresses and box springs', r'mattress|box ?spring'),
    ('upholstered furniture',      r'upholster|sofa|couch|chesterfield|cushion'),
    ('particleboard or flat-pack', r'particle ?board|mdf|flat ?pack|ikea|melamine|laminate'),
    ('large appliances',           r'large appliance|major appliance|fridge|freezer|washer|dryer|stove'),
    ('tube televisions',           r'crt|tube (?:tv|television)|projection'),
    ('car seats and cribs',        r'car ?seat|crib|playpen|walker|infant'),
    ('anything damaged or stained', r'damag|stain|torn|rip|broken|soiled|worn out|odour|odor|smell'),
    ('hazardous material',         r'hazard|asbestos|paint|chemical|propane|fuel|oil|battery'),
    ('anything needing repair',    r'repair|not working|non-?working|incomplete|missing part'),
    ('encyclopedias and textbooks', r'encyclop|textbook|condensed|ex-?library'),
]


def refusal_summary(orgs):
    """"4 of the 7 places here will not take mattresses" - counted, not claimed."""
    import re as _re
    n, out = len(orgs), []
    for label, pat in REFUSE_THEMES:
        rx = _re.compile(pat, _re.I)
        hits = [o for o in orgs if any(rx.search(r) for r in (o.get('refuses') or []))]
        if len(hits) >= 2:
            out.append((len(hits), label, [o['name'] for o in hits]))
    out.sort(reverse=True)
    return n, out[:5]


def ed_block(ed, route, orgs):
    """The editorial half: what the object is, and what the law says.

    Deliberately narrow. Two research passes and two adversarial audits
    established that the material about physical objects holds up and the
    material about organizations does not - quotes attributed to charities
    whose domains do not resolve, prices credited to shops that publish
    none, "most charities" built from one affiliate. All of that is cut.
    What an organization accepts or refuses now comes from the directory,
    where every record was checked against that organization's own site.
    """
    out = []
    if ed and ed.get('openingTruth'):
        out.append(f'''    <div class="t-truth">
      {IC["info"]}
      <p>{E(ed["openingTruth"])}</p>
    </div>
''')

    if ed and ed.get('tells'):
        items = ''.join(
            f'<li><b>{E(t["what"])}</b><span>{E(t["tell"])}</span></li>' for t in ed['tells'])
        out.append(f'''    <div class="t-box">
      <h2>How to tell what you have got</h2>
      <p>Before you call anyone, two minutes with the object settles most of it. None of
        this needs an expert — it needs a flashlight and a look at the back.</p>
      <ul class="t-tells">{items}</ul>
    </div>
''')

    n, themes = refusal_summary(orgs)
    if themes:
        rows = ''.join(
            f'<li><b>{c} of {n}</b> will not take <span>{E(label)}</span>'
            f'<em>{E(", ".join(names[:4]))}{" and others" if len(names) > 4 else ""}</em></li>'
            for c, label, names in themes)
        out.append(f'''    <div class="t-box">
      <h2>What this list turns away</h2>
      <p>Counted from what each place says on its own site, not from what is generally
        true. Most refusals are about condition and completeness rather than category.</p>
      <ul class="t-refuse">{rows}</ul>
    </div>
''')

    if ed and ed.get('worthNothing'):
        items = ''.join(f'<li>{E(w["what"])}</li>' for w in ed['worthNothing'])
        out.append(f'''    <div class="t-box">
      <h2>Rarely worth anything</h2>
      <p>Not a rule, and not a reason to bin something without asking. These are the
        things people most often expect to be worth money and find are not.</p>
      <ul class="t-none">{items}</ul>
    </div>
''')

    for law in (ed.get('legalOrSafety') if ed else []) or []:
        out.append(f'''    <div class="t-law">
      {IC["info"]}
      <div><b>{E(law["rule"])}</b> <span class="t-juris">{E(law["jurisdiction"])}</span>
        <p>{E(law["detail"])}</p>
        <a href="{E(law["source"])}" target="_blank" rel="noopener">Read the rule &rarr;</a>
      </div>
    </div>
''')
    return ''.join(out)


def page(route, city, slug, item, orgs, ed, idx, checked, siblings):
    cityname, prov = city['n'], city['prov']
    pslug, noun, phrase = item
    verb = 'donate' if route == 'donate' else 'sell'
    canon = f'{SITE}/{route}/{slug}/{pslug}'
    n = len(orgs)
    label = city_label(slug, cityname)
    # The count in the title is generated from the same rows as the H1 below.
    # Numbers are retained in 97.3% of titles where the H1 agrees and 25.8%
    # where it does not, and a hand-typed count that drifts is a false title.
    if route == 'donate':
        free = sum(1 for o in orgs if o.get('pickup') == 'free')
        clauses = ([f'{free} collect free, {n - free} drop-off', f'{free} collect free']
                   if free > 1 else
                   [f'{free} collects free, {n - free} drop-off', f'{free} collects free']
                   if free else ['who collects, who refuses', 'all drop-off'])
    else:
        pawn = sum(1 for o in orgs if o.get('pawnWarning'))
        shop = 'pawn shop' if pawn == 1 else 'pawn shops'
        clauses = ([f'{pawn} {shop}, {n - pawn} buy outright', f'{pawn} of {n} are pawn']
                   if pawn else ['who buys, and on what terms', 'what each one pays'])
    title = fit_title(f'{verb.title()} {noun} in {label}', clauses,
                      f'{n} places' if route == 'donate' else f'{n} buyers')
    # Observed snippets average 146 characters on desktop and 136 on mobile, so
    # writing to about 140 means nothing is cut on either. Real organization names
    # are what make each of these 189 descriptions different from the others, so
    # they go on the end and only as many as fit.
    if route == 'donate':
        desc = (f'{n} places in {label} that take used {noun}, including which collect '
                f'and what they refuse.')
        lede = (f'{n} organizations in and around {cityname} that take donated {noun} — what '
                f'each one accepts, what it turns away, and which will come and collect it.')
    else:
        desc = (f'{n} businesses in {label} that buy used {noun}, and whether each is a '
                f'purchase, a consignment or a loan.')
        lede = (f'{n} businesses in and around {cityname} that buy used {noun} from the public '
                f'— what each takes, and whether you are offered a purchase, a consignment '
                f'or a loan.')
    for o in orgs[:3]:
        cand = desc + ' ' + o['name'] + '.'
        if len(cand) > 145:
            break
        desc = cand

    other = 'sell' if route == 'donate' else 'donate'
    otherN = len(idx[slug][other].get(TO_CAT[pslug], []))
    cross = ''
    if otherN >= MIN_ORGS:
        cross = (f'<a class="btn ghost" href="/{other}/{slug}/{pslug}">'
                 f'{"Sell" if other == "sell" else "Donate"} it instead &rarr;</a>')

    sibs = ''.join(
        f'<a class="t-sib" href="/{route}/{slug}/{s[0]}">{E(s[1])}<small>{c} places</small></a>'
        for s, c in siblings if s[0] != pslug)
    cities = ''.join(
        f'<a class="g-city" href="/{route}/{cs}/{pslug}">{E(idx[cs]["n"])}'
        f'<small>{len(idx[cs][route].get(TO_CAT[pslug], []))} places</small></a>'
        for cs in sorted(idx, key=lambda k: idx[k]['n'])
        if cs != slug and len(idx[cs][route].get(TO_CAT[pslug], [])) >= MIN_ORGS)

    faqs = [(f.get('q'), f.get('a')) for f in (ed.get('faqs') if ed else []) or []][:6]
    faq_html = ''.join(
        f'      <details class="g-faq"><summary>{E(q)}</summary><div class="a">{E(a)}</div></details>\n'
        for q, a in faqs if q and a)

    graph = [
        {'@type': 'WebPage', '@id': canon + '#webpage', 'url': canon, 'name': title,
         'description': desc, 'inLanguage': 'en-CA', 'dateModified': checked},
        {'@type': 'ItemList', '@id': canon + '#list', 'name': title, 'numberOfItems': n,
         'itemListElement': [{'@type': 'ListItem', 'position': i + 1,
                              'item': {'@type': 'Organization', 'name': o['name'], 'url': o['url']}}
                             for i, o in enumerate(orgs)]},
        {'@type': 'BreadcrumbList', 'itemListElement': [
            {'@type': 'ListItem', 'position': 1, 'name': 'Donate' if route == 'donate' else 'Sell',
             'item': f'{SITE}/{route}/'},
            {'@type': 'ListItem', 'position': 2, 'name': cityname, 'item': f'{SITE}/{route}/{slug}'},
            {'@type': 'ListItem', 'position': 3, 'name': noun.title(), 'item': canon}]},
    ]
    if faqs:
        graph.append({'@type': 'FAQPage', '@id': canon + '#faq',
                      'mainEntity': [{'@type': 'Question', 'name': q,
                                      'acceptedAnswer': {'@type': 'Answer', 'text': a}}
                                     for q, a in faqs]})
    ld = ('<script type="application/ld+json">\n'
          + json.dumps({'@context': 'https://schema.org', '@graph': graph}, indent=2, ensure_ascii=False)
          + '\n</script>')

    render = org_donate if route == 'donate' else org_sell
    return head(title, desc, canon, ld) + f'''
<section class="band" style="padding-bottom:0">
  <div class="g-wrap">
    <nav class="t-crumb">
      <a href="/{route}/">{'Donate' if route == 'donate' else 'Sell'}</a> ›
      <a href="/{route}/{slug}">{E(cityname)}</a> ›
      <span>{E(noun)}</span>
    </nav>

    <div class="g-hero">
      <div class="kicker">{E(noun)} · {E(prov)}</div>
      <h1>Where to {verb} {E(phrase)} in {E(cityname)}</h1>
      <p class="lede">{lede}</p>
    </div>

    <div class="g-meta">
      {IC["info"]}
      <span><b>Verified {E(checked)} from each organization&#39;s own website.</b> We are not
      affiliated with anyone listed here, nobody pays to be included, and we receive nothing
      if you {verb} to them.</span>
    </div>

{ed_block(ed, route, orgs)}
    <div class="g-sec">
      <h2>{n} places in {E(cityname)} that take {E(noun)}</h2>
    </div>
{''.join(render(o) for o in orgs)}
{f'    <div class="s-reg">{IC["info"]} <span>{E(city["reg"])}</span></div>' if route == 'sell' and city.get('reg') else ''}

    <div class="g-cta">
      <h2>Not sure what you have got?</h2>
      <p>Photograph it and we will tell you what it is and what it is worth — including when the
        honest answer is that it is worth nothing.</p>
      <a class="btn urgent" href="/whats-it-worth">See what it&#39;s worth</a>
      {cross}
      <a class="btn ghost" href="/{route}/{slug}">Everything in {E(cityname)} &rarr;</a>
    </div>

{f'''    <div class="g-sec"><h2>Common questions</h2></div>
{faq_html}''' if faq_html else ''}
{f'''    <div class="g-sec"><h2>Other things in {E(cityname)}</h2></div>
    <div class="t-sibs">{sibs}</div>''' if sibs else ''}
{f'''    <div class="g-sec"><h2>{E(noun.title())} in other cities</h2></div>
    <div class="g-cities">{cities}</div>''' if cities else ''}
  </div>
</section>
''' + FOOT


def sync_sitemap(urls, checked):
    p = os.path.join(ROOT, 'sitemap.xml')
    s = open(p, encoding='utf-8').read()
    kept = [ln for ln in s.split(chr(10))
            if not any(('<loc>' + u + '</loc>') in ln for u in urls)]
    s = chr(10).join(kept)
    rows = [f'  <url><loc>{u}</loc><lastmod>{checked}</lastmod>'
            f'<changefreq>monthly</changefreq><priority>0.6</priority></url>' for u in urls]
    s = s.replace('</urlset>', chr(10).join(rows) + chr(10) + '</urlset>')
    open(p, 'w', encoding='utf-8').write(s)
    print(f'sitemap.xml - {len(rows)} item-guide URLs')


def main():
    dry = '--dry' in sys.argv
    idx = collect_index()
    don = load('data/donations.json')
    checked = (don or {}).get('lastChecked', '')
    ed_all = load('data/category-editorial.json') or {}
    if not ed_all and not dry:
        raise SystemExit(
            'data/category-editorial.json is missing.\n'
            'These pages are a filtered org list plus researched category editorial. Without the\n'
            'editorial they are a thin list with a city name in the title, which is the doorway\n'
            'pattern this build exists to avoid. Run the editorial research first, or use --dry.')

    built, skipped, urls = [], [], []
    for route in ('donate', 'sell'):
        for slug in sorted(idx, key=lambda k: idx[k]['n']):
            city = idx[slug]
            counts = [(it, len(city[route].get(TO_CAT[it[0]], []))) for it in ITEMS]
            viable = [(it, c) for it, c in counts if c >= MIN_ORGS]
            for it, c in counts:
                orgs = sorted(city[route].get(TO_CAT[it[0]], []), key=lambda o: o['name'])
                if c < MIN_ORGS:
                    if c:
                        skipped.append(f'{route}/{slug}/{it[0]} ({c})')
                    continue
                ed = ed_all.get(TO_CAT[it[0]])
                html = page(route, city, slug, it, orgs, ed, idx, checked, viable)
                d = os.path.join(ROOT, route, slug)
                if not dry:
                    os.makedirs(d, exist_ok=True)
                    open(os.path.join(d, it[0] + '.html'), 'w', encoding='utf-8').write(html)
                built.append(f'{route}/{slug}/{it[0]}')
                urls.append(f'{SITE}/{route}/{slug}/{it[0]}')

    missing_ed = sorted({TO_CAT[b.split('/')[2]] for b in built} - set(ed_all))
    print(('DRY RUN — nothing written\n' if dry else '')
          + f'{len(built)} item guides ({sum(1 for b in built if b.startswith("donate"))} donate, '
            f'{sum(1 for b in built if b.startswith("sell"))} sell)')
    print(f'{len(skipped)} combinations skipped under the {MIN_ORGS}-organization floor')
    if missing_ed:
        print('!! no editorial for: ' + ', '.join(missing_ed))
    if not dry:
        sync_sitemap(urls, checked)


if __name__ == '__main__':
    main()
