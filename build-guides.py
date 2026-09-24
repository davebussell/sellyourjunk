#!/usr/bin/env python3
"""
Build the /donate/<city> guides from data/donations.json.

Static HTML on purpose. The whole point of these pages is to be found by
someone searching "where to donate a sofa in Calgary", which means the
content has to be in the markup for a crawler that runs no JavaScript.
Fourteen cities inside the SPA's index.html would also be absurd.

Netlify has pretty_urls on, so donate/toronto.html serves at /donate/toronto
with no redirect rules — same mechanism that gives us /thanks.

Re-run after any edit to data/donations.json:  python build-guides.py
"""
import json, os, re, html
from datetime import date

ROOT = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(ROOT, 'data', 'donations.json')
OUT  = os.path.join(ROOT, 'donate')
SITE = 'https://wepayforjunk.com'

E = lambda s: html.escape(str(s or ''), quote=True)

KINDS = [
    ('furniture-bank',  'Furniture banks',                 'They furnish homes for people leaving shelters, resettling, or starting over. They want good furniture and they are the most likely to collect it.'),
    ('thrift-chain',    'Thrift stores',                   'The workhorses. Wide range, many locations, and the most predictable place to take a carload.'),
    ('clothing',        'Clothing and textiles',           'Clothes, shoes, linens and soft goods, including items too worn to resell that get recycled as fibre.'),
    ('building-reuse',  'Building materials and renovation','Doors, cabinets, fixtures, lumber, tools and appliances pulled out of a renovation.'),
    ('electronics',     'Electronics',                     'Working devices for reuse, and dead ones for responsible recycling.'),
    ('books-media',     'Books and media',                 'Books, records and games, which most general thrift stores take only in small quantities.'),
    ('shelter',         'Shelters and community services',  'They take specific things for specific people. Call before you load the car — a wasted trip costs them staff time.'),
    ('food-bank',       'Food banks',                      'Food first, but several also run household-goods programmes.'),
    ('specialty',       'Specialist',                      'Organizations that take one category properly rather than everything badly.'),
]

PICK = {
    'free':        ('free',        'Will collect, free'),
    'paid':        ('paid',        'Will collect, for a fee'),
    'conditional': ('conditional', 'Will collect, conditions apply'),
    'none':        ('none',        'Drop off only'),
    # The audit's single most important rendering rule: roughly a third of the
    # pickup fields are genuine unknowns. Collapsing them into a confident yes
    # or no is the one change that would turn an honest dataset into a
    # misleading page. 'unknown' must always read as a question, never a denial.
    'unknown':     ('unknown',     'Not stated - ask them'),
}

IC = {
 'check': '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" aria-hidden="true"><path d="m20 6-11 11-5-5"/></svg>',
 'truck': '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h2"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>',
 'info':  '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>',
 'phone': '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.1a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7A2 2 0 0 1 22 16.9z"/></svg>',
 'x':     '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>',
}

def tel(p):
    return re.sub(r'[^0-9+]', '', p or '')

def head(title, desc, canon, extra_ld=''):
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{E(title)}</title>
<meta name="description" content="{E(desc)}">
<link rel="canonical" href="{E(canon)}">
<meta name="theme-color" content="#FBF8F3">
<meta property="og:type" content="article">
<meta property="og:site_name" content="We Pay for Junk">
<meta property="og:url" content="{E(canon)}">
<meta property="og:title" content="{E(title)}">
<meta property="og:description" content="{E(desc)}">
<meta property="og:image" content="{SITE}/assets/og-image.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://api.fontshare.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT,WONK@0,9..144,300..900,0..100,0..1;1,9..144,300..900,0..100,0..1&display=swap" rel="stylesheet">
<link href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@600..700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/styles.css">
<link rel="stylesheet" href="/assets/guide.css">
{extra_ld}
</head>
<body>

<header class="nav">
  <div class="nav-in">
    <a class="logo" href="/" style="text-decoration:none">
      <span class="dot"></span><span>WePayForJunk</span>
    </a>
    <nav class="navlinks" style="display:flex;gap:2px">
      <a class="navlink" href="/whats-it-worth">What&#39;s it worth?</a>
      <a class="navlink" href="/marketplace">Going free</a>
      <a class="navlink" href="/donate">Donate</a>
    </nav>
  </div>
</header>
'''

FOOT = f'''
<footer>
  <div class="wrap">
    <div class="foot">
      <div>
        <div class="logo" style="margin-bottom:14px;cursor:default"><span class="dot"></span><span>WePayForJunk</span></div>
        <p>Free to give, free to receive, free for organizations — permanently. An early prototype: the listings on the rest of the site are sample data.</p>
      </div>
      <div>
        <h5>Product</h5>
        <a href="/whats-it-worth" style="display:block;font-size:.92rem;color:var(--ink-2);padding:5px 0;text-decoration:none">What&#39;s it worth?</a>
        <a href="/marketplace" style="display:block;font-size:.92rem;color:var(--ink-2);padding:5px 0;text-decoration:none">Everything going free</a>
        <a href="/clearing-a-home" style="display:block;font-size:.92rem;color:var(--ink-2);padding:5px 0;text-decoration:none">Clearing a home</a>
      </div>
      <div>
        <h5>Donate</h5>
        <a href="/donate" style="display:block;font-size:.92rem;color:var(--ink-2);padding:5px 0;text-decoration:none">All cities</a>
        <a href="/for-organizations" style="display:block;font-size:.92rem;color:var(--ink-2);padding:5px 0;text-decoration:none">For organizations</a>
        <a href="/privacy" style="display:block;font-size:.92rem;color:var(--ink-2);padding:5px 0;text-decoration:none">Privacy &amp; terms</a>
      </div>
    </div>
    <div class="foot-btm">
      <span>© 2026 We Pay for Junk · <a href="/privacy" style="color:inherit">Privacy &amp; terms</a></span>
      <span>We are not affiliated with any organization listed on these pages.</span>
    </div>
  </div>
</footer>

</body>
</html>
'''


def org_html(o):
    pk_cls, pk_lbl = PICK.get(o.get('pickup', 'unknown'), PICK['unknown'])
    rows = []

    if o.get('accepts'):
        rows.append(f'<div class="g-row"><span class="k">Takes</span><span class="v">{E(", ".join(o["accepts"]))}</span></div>')
    if o.get('refuses'):
        rows.append(f'<div class="g-row"><span class="k">Won&#39;t take</span><span class="v no">{E(", ".join(o["refuses"]))}</span></div>')
    if o.get('pickupNote'):
        rows.append(f'<div class="g-row"><span class="k">Collection</span><span class="v">{E(o["pickupNote"])}</span></div>')
    if o.get('singleAddress'):
        rows.append(f'<div class="g-row"><span class="k">Where</span><span class="v">{E(o["singleAddress"])}</span></div>')
    elif o.get('locationsNote'):
        rows.append(f'<div class="g-row"><span class="k">Where</span><span class="v">{E(o["locationsNote"])}</span></div>')

    flags = ''
    if o.get('notCharity'):
        flags += (f'<div class="g-flag not-charity">{IC["info"]}<span><b>Not a charity.</b> '
                  f'{E(o["notCharity"])}</span></div>')
    if o.get('restricted'):
        flags += (f'<div class="g-flag restricted">{IC["info"]}<span><b>Not a general public service.</b> '
                  f'{E(o["restricted"])}</span></div>')

    foot = [f'<a class="btn sm" href="{E(o["url"])}" target="_blank" rel="noopener nofollow">Visit their site &rarr;</a>']
    if o.get('phone'):
        foot.append(f'<a class="g-tel" href="tel:{E(tel(o["phone"]))}">{IC["phone"]}{E(o["phone"])}</a>')
    if o.get('taxReceipt') == 'yes':
        foot.append('<span class="g-receipt">Tax receipt available</span>')
    elif o.get('taxReceipt') == 'conditional':
        foot.append('<span class="g-receipt">Tax receipt on some donations</span>')

    return f'''      <article class="g-org">
        <div class="g-org-top">
          <h3><a href="{E(o["url"])}" target="_blank" rel="noopener nofollow">{E(o["name"])}</a></h3>
          <span class="g-pick {pk_cls}">{IC["truck"]}{pk_lbl}</span>
        </div>
        <div class="g-rows">
{chr(10).join("          " + r for r in rows)}
        </div>
{flags}
        <div class="g-org-foot">{"".join(foot)}</div>
      </article>
'''


def city_page(m, all_metros, checked):
    name, slug = m['name'], m['slug']
    orgs = m['orgs']
    canon = f'{SITE}/donate/{slug}'
    title = f'Where to donate used furniture and household goods in {name}'
    desc = (f'{len(orgs)} places in {name} that accept donated furniture, clothes, appliances and '
            f'household goods — including which ones will collect from your home, and what each one refuses.')

    collectors = [o for o in orgs if o.get('pickup') in ('free', 'paid', 'conditional')]

    # answer-first: the single question everyone actually has
    if collectors:
        items = ''.join(
            f'<li>{IC["check"]}<span><a href="{E(o["url"])}" target="_blank" rel="noopener nofollow">{E(o["name"])}</a>'
            f'{" — " + E(o["pickupNote"]) if o.get("pickupNote") else ""}</span></li>'
            for o in collectors)
        quick = f'''    <div class="g-quick">
      <h2>If you cannot move it yourself</h2>
      <p>These {len(collectors)} will come to you in {E(name)}. Everyone else on this page is drop-off.</p>
      <ul>{items}</ul>
    </div>
'''
    else:
        quick = f'''    <div class="g-quick none">
      <h2>Everything here is drop-off</h2>
      <p>We could not confirm a home collection service from any of these organizations in {E(name)}.
         If you cannot move the item yourself, phone the closest one and ask — several run collections
         that are not advertised on their websites.</p>
    </div>
'''

    # organizations, grouped
    body = []
    for kind, label, blurb in KINDS:
        group = [o for o in orgs if o.get('kind') == kind]
        if not group:
            continue
        body.append(f'''    <div class="g-sec">
      <h2>{label} in {E(name)}</h2>
      <p>{blurb}</p>
    </div>
''')
        body.extend(org_html(o) for o in group)

    # other cities
    cities = ''.join(
        f'<a class="g-city{" here" if x["slug"] == slug else ""}" href="/donate/{x["slug"]}">{E(x["name"])}'
        f'<small>{len(x["orgs"])} places</small></a>' for x in all_metros)

    faq = [
        (f'Will any of them pick it up from my house in {name}?',
         (f'{len(collectors)} of the {len(orgs)} organizations on this page collect from your home: '
          + ', '.join(o['name'] for o in collectors) + '. '
          if collectors else
          'We could not confirm a home collection service from any of them. ')
         + 'Collection usually depends on what the item is, what condition it is in, and whether you are inside their catchment. Phone first.'),
        ('Do I get a tax receipt for donated goods?',
         'Registered charities can issue a receipt for the fair market value of a gift in kind, but many thrift '
         'operations do not issue receipts for ordinary household donations because valuing them individually is not '
         'practical. Ask before you drop off if the receipt matters to you, and do not assume.'),
        ('What will nobody take?',
         'Stained or torn upholstery, mattresses in most of the country, broken particleboard furniture, exercise '
         'equipment, cribs and car seats past their expiry, and anything that has been in a fire or a flood. Most '
         'organizations list their refusals on their own site, and the list above repeats them where they do.'),
        ('Is my stuff worth money instead of donating it?',
         'Sometimes, and it is worth thirty seconds to find out. A dead car, a garage of tools or mid-century teak '
         'can be worth real money. A sofa is usually worth nothing, no matter how good it looks. We will tell you '
         'which one you have got before you decide.'),
    ]
    faq_html = ''.join(
        f'      <details class="g-faq"><summary>{E(q)}</summary><div class="a">{E(a)}</div></details>\n'
        for q, a in faq)

    ld = {
        '@context': 'https://schema.org',
        '@graph': [
            {'@type': 'WebPage', '@id': canon + '#webpage', 'url': canon, 'name': title,
             'description': desc, 'inLanguage': 'en-CA',
             'isPartOf': {'@type': 'WebSite', 'url': SITE + '/', 'name': 'We Pay for Junk'},
             'dateModified': checked},
            {'@type': 'ItemList', '@id': canon + '#orgs',
             'name': f'Organizations accepting donated household goods in {name}',
             'numberOfItems': len(orgs),
             'itemListElement': [
                 {'@type': 'ListItem', 'position': i + 1,
                  'item': {'@type': 'Organization', 'name': o['name'], 'url': o['url']}}
                 for i, o in enumerate(orgs)]},
            {'@type': 'FAQPage', '@id': canon + '#faq',
             'mainEntity': [{'@type': 'Question', 'name': q,
                             'acceptedAnswer': {'@type': 'Answer', 'text': a}} for q, a in faq]},
        ],
    }
    ld_tag = '<script type="application/ld+json">\n' + json.dumps(ld, indent=2, ensure_ascii=False) + '\n</script>'

    local = f'<p class="lede" style="margin-top:14px">{E(m["localNote"])}</p>' if m.get('localNote') else ''

    return head(title + ' | We Pay for Junk', desc, canon, ld_tag) + f'''
<section class="band" style="padding-bottom:0">
  <div class="g-wrap">
    <div class="g-hero">
      <div class="kicker">Donating in {E(m["prov"])}</div>
      <h1>Where to donate used goods in {E(name)}</h1>
      <p class="lede">{len(orgs)} organizations in and around {E(name)} that take donated furniture, clothes,
        appliances, kitchenware and household goods. For each one: what they take, what they refuse,
        and whether they will come and collect it.</p>
      {local}
    </div>

    <div class="g-meta">
      {IC["info"]}
      <span><b>Verified {E(checked)} from each organization&#39;s own website.</b> Hours, fees, pickup areas
      and what is accepted change without notice — call or check their site before you load the car.
      We are not affiliated with any organization listed here and we receive nothing if you donate to them.</span>
    </div>

{quick}
{''.join(body)}
    <div class="g-check">
      <h2>Before you load the car</h2>
      <ul>
        <li>{IC["check"]}<span><b>Phone first if it is bulky.</b> Capacity changes week to week, and a sofa that cannot be
          accepted is a wasted trip for you and a wasted hour for them.</span></li>
        <li>{IC["check"]}<span><b>Clean it.</b> Most refusals are about condition, not category. Textiles must be
          dry and odour-free or they get thrown out at the back door.</span></li>
        <li>{IC["check"]}<span><b>Take the parts.</b> Bed frames need their hardware, and a dresser without its drawers
          is scrap to almost everyone.</span></li>
        <li>{IC["check"]}<span><b>Do not leave it outside after hours.</b> Anything left at a closed door usually gets
          rained on, and the charity pays to dispose of it.</span></li>
        <li>{IC["check"]}<span><b>Ask about the receipt before you hand it over</b>, not after.</span></li>
      </ul>
    </div>

    <div class="g-cta">
      <h2>Not sure it should be donated at all?</h2>
      <p>Some of what people give away is worth real money, and some of it will cost a charity money to dispose
        of. Photograph it and we will tell you which — including when the honest answer is that it is worth
        nothing and a thrift store is exactly the right place for it. We earn nothing when you donate.</p>
      <a class="btn urgent" href="/whats-it-worth">See what it&#39;s worth</a>
      <a class="btn ghost" href="/marketplace">Browse what&#39;s going free</a>
    </div>

    <div class="g-sec"><h2>Common questions</h2></div>
{faq_html}
    <div class="g-sec"><h2>Other cities</h2>
      <p>Same guide, different metro.</p></div>
    <div class="g-cities">{cities}</div>
  </div>
</section>
''' + FOOT


def hub_page(metros, checked):
    canon = f'{SITE}/donate/'   # trailing slash: Netlify 301s /donate -> /donate/
    title = 'Where to donate used goods in Canada — city by city'
    total = sum(len(m['orgs']) for m in metros)
    desc = (f'Verified guides to donating used furniture, clothing and household goods in {len(metros)} Canadian '
            f'cities. {total} organizations, with what each one refuses and which will collect from your home.')
    cities = ''.join(
        f'<a class="g-city" href="/donate/{m["slug"]}">{E(m["name"])}<small>{len(m["orgs"])} places · {E(m["prov"])}</small></a>'
        for m in metros)

    ld = {'@context': 'https://schema.org', '@type': 'CollectionPage', 'url': canon, 'name': title,
          'description': desc, 'inLanguage': 'en-CA', 'dateModified': checked,
          'hasPart': [{'@type': 'WebPage', 'name': f'Where to donate used goods in {m["name"]}',
                       'url': f'{SITE}/donate/{m["slug"]}'} for m in metros]}
    ld_tag = '<script type="application/ld+json">\n' + json.dumps(ld, indent=2, ensure_ascii=False) + '\n</script>'

    return head(title + ' | We Pay for Junk', desc, canon, ld_tag) + f'''
<section class="band" style="padding-bottom:0">
  <div class="g-wrap">
    <div class="g-hero">
      <div class="kicker">Canada</div>
      <h1>Where to donate used goods, city by city</h1>
      <p class="lede">{total} organizations across {len(metros)} Canadian cities that accept donated furniture,
        clothes, appliances and household goods. Every one was checked against its own website rather than
        copied from a directory, and each listing says plainly what the organization refuses and whether it
        will come and collect.</p>
    </div>

    <div class="g-meta">
      {IC["info"]}
      <span><b>Verified {E(checked)} from each organization&#39;s own website.</b> Hours, fees, pickup areas
      and what is accepted change without notice — call or check their site before you load the car.
      We are not affiliated with any organization listed on these pages and we receive nothing if you
      donate to them.</span>
    </div>

    <div class="g-sec"><h2>Pick your city</h2></div>
    <div class="g-cities">{cities}</div>

    <div class="g-cta">
      <h2>Worth money, or worth donating?</h2>
      <p>Most things people give away are worth nothing, and a thrift store is exactly the right answer for them.
        Some are worth several hundred dollars and should not go in a donation bin. Photograph it and we will
        tell you which you have got — we earn nothing either way.</p>
      <a class="btn urgent" href="/whats-it-worth">See what it&#39;s worth</a>
    </div>
  </div>
</section>
''' + FOOT


def sync_sitemap(metros, checked):
    """Rewrite the /donate block of sitemap.xml in place.

    Generated from the same data as the pages, so a city that fails
    verification and loses its page also loses its sitemap entry. A
    sitemap that lists a 404 is worse than no sitemap entry at all.
    """
    p = os.path.join(ROOT, 'sitemap.xml')
    marker = '<loc>' + SITE + '/donate'
    kept = [ln for ln in open(p, encoding='utf-8').read().split('\n') if marker not in ln]
    s = '\n'.join(kept)
    rows = [f'  <url><loc>{SITE}/donate/</loc><lastmod>{checked}</lastmod>'
            f'<changefreq>monthly</changefreq><priority>0.8</priority></url>']
    rows += [f'  <url><loc>{SITE}/donate/{m["slug"]}</loc><lastmod>{checked}</lastmod>'
             f'<changefreq>monthly</changefreq><priority>0.7</priority></url>' for m in metros]
    nl = chr(10)
    s = s.replace('</urlset>', nl.join(rows) + nl + '</urlset>')
    open(p, 'w', encoding='utf-8').write(s)
    print(f'sitemap.xml - {len(rows)} donate URLs')



def main():
    with open(DATA, encoding='utf-8') as f:
        d = json.load(f)
    metros = sorted(d['metros'], key=lambda m: m['name'])
    checked = d.get('lastChecked') or date.today().isoformat()

    # Guard. Three organizations were once dropped from their pages because the
    # researcher returned kind="thrift-store", which has no display group — the
    # grouping loop simply skipped them and the page looked fine. Fail loudly
    # rather than quietly publishing a shorter page than the data supports.
    known = {k for k, _, _ in KINDS}
    orphans = [(m['slug'], o['name'], o.get('kind'))
               for m in metros for o in m['orgs'] if o.get('kind') not in known]
    if orphans:
        for s, n, k in orphans:
            print(f'  !! {s}: "{n}" has kind={k!r}, which has no display group')
        raise SystemExit(f'{len(orphans)} organizations would be silently dropped. '
                         f'Add the kind to KINDS, or map it in prep-donations.py KIND_FIX.')

    os.makedirs(OUT, exist_ok=True)
    for m in metros:
        with open(os.path.join(OUT, m['slug'] + '.html'), 'w', encoding='utf-8') as f:
            f.write(city_page(m, metros, checked))
    with open(os.path.join(OUT, 'index.html'), 'w', encoding='utf-8') as f:
        f.write(hub_page(metros, checked))

    sync_sitemap(metros, checked)

    total = sum(len(m['orgs']) for m in metros)
    print(f'built {len(metros)} city pages + hub · {total} organizations · checked {checked}')
    for m in metros:
        pick = sum(1 for o in m['orgs'] if o.get('pickup') in ('free', 'paid', 'conditional'))
        print(f'  /donate/{m["slug"]:<22} {len(m["orgs"]):>2} orgs, {pick} collect')


if __name__ == '__main__':
    main()
