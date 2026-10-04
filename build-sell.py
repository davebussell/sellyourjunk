#!/usr/bin/env python3
"""
Build the /sell/<city> guides from data/sell-outlets.json.

Separate pages from /donate deliberately. "Where to donate a sofa in
Toronto" and "where to sell used furniture Toronto" are different
searches, and the donation audit already warned that mixing a for-profit
into a charity list makes readers assume charity and expect a receipt.

Re-run after editing the data:  python build-sell.py
"""
import json, os, importlib.util

# The donate builder owns the shared chrome — head(), FOOT, the icon set. Load
# it as a module rather than copying any of it, so the two page types cannot
# drift apart. The hyphen in its filename rules out a plain import.
_spec = importlib.util.spec_from_file_location(
    'guides', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'build-guides.py'))
_g = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_g)
head, FOOT, IC, E, tel, SITE = _g.head, _g.FOOT, _g.IC, _g.E, _g.tel, _g.SITE
city_label, title_clause, fit_title = _g.city_label, _g.title_clause, _g.fit_title

ROOT = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(ROOT, 'data', 'sell-outlets.json')
OUT = os.path.join(ROOT, 'sell')

KINDS = [
    ('pawn',          'Pawn shops',                  'Two completely different transactions under one roof. Read the box above before you go into any of these.'),
    ('buyback',       'Electronics buy-back'      ,       'They pay cash or credit for working electronics, phones and games.'),
    ('consignment',   'Consignment stores',          'They sell it for you and keep a share. More money than an outright sale, but you wait for it, and you get nothing if it does not sell.'),
    ('used-dealer',   'Dealers who buy outright',    'Furniture, antiques and household goods bought on the spot. Fastest route, lowest price.'),
    ('auction',       'Auction houses',              'They sell it for you to whoever bids. It can beat every other route here, and it can also fetch almost nothing — the price is decided in the room, not by them, and you find out weeks later.'),
    ('building-salvage','Architectural and building salvage','Doors, windows, cabinetry, fixtures and hardware pulled out of a renovation.'),
    ('jeweller',      'Gold and jewellery buyers' ,  'Paid against the daily spot price, minus a margin almost nobody publishes.'),
    ('scrap-metal',   'Scrap metal yards',           'Paid by weight and grade at the scale. Appliances, copper, aluminum, radiators.'),
    ('auto-salvage',  'Auto salvage and scrap cars',       'Non-running vehicles, usually towed free. Often the single most valuable thing on a property.'),
    ('books-records', 'Book and record shops'     ,    'They buy selectively. Most general paperbacks are worth nothing to anyone.'),
    ('other',         'Other',                       ''),
]

DEAL = {
    'sell-outright':     ('sell',   'Buys outright'),
    'pawn-loan':         ('pawn',   'Pawn loan'),
    'both':              ('pawn',   'Buys or lends'),
    'consignment-split': ('consign','Consignment'),
    'by-weight':         ('weight', 'Paid by weight'),
    'quote-first':       ('quote',  'Quote first'),
    'trade-credit':      ('credit', 'Store credit, not cash'),
}
COLLECT = {
    'conditional': ('cond', 'May collect — ask'),
    'no':          ('no',   'Bring it to them'),
    'unknown':     ('unk',  'Not stated — ask'),
}

# Audit §1, verbatim and in the same place on every page that lists a pawn shop.
PAWN_BOX = '''      <div class="s-pawn">
        <h2>{ic} If you are thinking about pawning something</h2>
        <p><b>A pawn loan is borrowing, not selling: you get your item back only by repaying the
          money plus all interest and fees by the date printed on the ticket, and if you miss that
          date the shop keeps the item and sells it.</b></p>
        <p>Before you hand anything over, get three things written on the ticket: <b>the interest
          rate</b>, <b>the total redemption figure in dollars</b>, and <b>the deadline</b>. Across all
          fourteen cities we checked, almost no pawn shop publishes its rate anywhere on its website —
          so the only place you will see it is on the paperwork in front of you.</p>
        <p>If you want money and do not want the item back, ask separately for an outright purchase
          price and compare the two. They are different numbers for different transactions, and a shop
          that offers both will not necessarily volunteer which one it is quoting.</p>
      </div>
'''

# Audit §5. The refusal, said out loud, is the positioning.
PAYOUT_BOX = '''      <div class="s-payout">
        <h2>What will they actually pay?</h2>
        <p><b>We do not publish an average payout, because nobody publishes one.</b> Any site quoting
          you "typically 60% of retail" invented it. Across 189 businesses in fourteen cities, a
          handful publish a consignment split, one publishes a per-gram gold table, and not one pawn
          shop, scrap yard or electronics buyer publishes what it pays relative to resale value.</p>
        <p>What we can tell you is the shape of it. Consignment pays the most and pays last, often on a
          declining scale as the item sits. An outright sale pays least and pays today. Metals and gold
          are weight times purity minus a spread nobody states, so the only real number is the one at
          the scale. And for a great deal of what comes out of a cleared house — flat-pack furniture,
          book-club paperbacks, old encyclopedias, out-of-season sports gear, adult clothing more than
          a few years old — the honest answer is that nobody in these fourteen cities will pay anything
          for it at all. The refusal lists below are the evidence.</p>
      </div>
'''


def outlet_html(o):
    d = DEAL.get(o.get('deal'), DEAL['quote-first'])
    c = COLLECT.get(o.get('collects'), COLLECT['unknown'])
    rows = []
    if o.get('buys'):
        rows.append(f'<div class="g-row"><span class="k">Buys</span><span class="v">{E(", ".join(o["buys"]))}</span></div>')
    if o.get('refuses'):
        rows.append(f'<div class="g-row"><span class="k">Won&#39;t take</span><span class="v">{E(", ".join(o["refuses"]))}</span></div>')
    if o.get('dealNote'):
        rows.append(f'<div class="g-row"><span class="k">The deal</span><span class="v">{E(o["dealNote"])}</span></div>')
    if o.get('singleAddress'):
        rows.append(f'<div class="g-row"><span class="k">Where</span><span class="v">{E(o["singleAddress"])}</span></div>')
    elif o.get('locationsNote'):
        rows.append(f'<div class="g-row"><span class="k">Where</span><span class="v">{E(o["locationsNote"])}</span></div>')

    flags = ''
    if o.get('nameNote'):
        flags += f'<div class="g-flag restricted">{IC["info"]}<span>{E(o["nameNote"])}</span></div>'
    if o.get('noPremises'):
        flags += (f'<div class="g-flag restricted">{IC["info"]}<span><b>No public premises listed.</b> '
                  f'We could not find a street address or phone on their site — contact them through '
                  f'it before making any plans.</span></div>')
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
{chr(10).join("          " + r for r in rows)}
        </div>
{flags}
        <div class="g-org-foot">{"".join(foot)}</div>
      </article>
'''


def city_page(m, all_metros, checked):
    name, slug, orgs = m['name'], m['slug'], m['orgs']
    canon = f'{SITE}/sell/{slug}'
    label = city_label(slug, name)
    title = fit_title(f'Sell used goods in {label}', title_clause(orgs, 'sell'),
                      f'{len(orgs)} buyers')
    desc = (f'{len(orgs)} businesses in {name} that buy used goods from the public — pawn shops, '
            f'consignment, scrap yards, auto salvage and buy-back. What each one takes, and how the '
            f'deal actually works.')
    has_pawn = any(o.get('pawnWarning') for o in orgs)

    body = []
    for kind, label, blurb in KINDS:
        group = [o for o in orgs if o.get('kind') == kind]
        if not group:
            continue
        body.append(f'''    <div class="g-sec">
      <h2>{label} in {E(name)}</h2>
      {f'<p>{blurb}</p>' if blurb else ''}
    </div>
''')
        body.extend(outlet_html(o) for o in group)

    cities = ''.join(
        f'<a class="g-city{" here" if x["slug"] == slug else ""}" href="/sell/{x["slug"]}">{E(x["name"])}'
        f'<small>{len(x["orgs"])} buyers</small></a>' for x in all_metros)

    faq = [
        (f'Will a pawn shop in {name} give me a loan or buy it outright?',
         'Many do both, and they are entirely different transactions. A loan means you get the item '
         'back only if you repay the money plus interest and fees by the date on the ticket; miss it '
         'and the shop keeps and sells your item. An outright sale is final. Ask for both numbers '
         'separately and compare them.'),
        ('How much will I actually get?',
         'Less than you think, and nobody publishes a reliable average — we checked 189 businesses '
         'across fourteen cities. Consignment pays most and pays last. An outright sale pays least '
         'and pays today. Scrap and gold are weight and purity against the day’s market, minus a '
         'margin almost nobody states.'),
        (f'Will any of them collect from my house in {name}?',
         'Auto salvage almost always tows a non-running car free. Some furniture dealers and '
         'consignment shops will collect, usually for a fee or above a minimum value. Scrap yards '
         'that advertise collection generally mean a commercial roll-off bin, not a van for a box of '
         'copper. Every listing here says what we could confirm and nothing more.'),
        ('Do I need identification?',
         'Almost certainly, and it is the most common cause of a wasted trip. Several businesses '
         'state plainly that government-issued photo ID is required and that a health card will not '
         'be accepted. Take a driving licence or passport.'),
        ('What is genuinely worth nothing?',
         'Flat-pack furniture, most paperbacks, encyclopedias, classical and easy-listening records, '
         'out-of-season sports equipment and adult clothing more than a few years old. The refusal '
         'lists on this page are the evidence. Those things can still be donated, and often should be.'),
    ]
    faq_html = ''.join(
        f'      <details class="g-faq"><summary>{E(q)}</summary><div class="a">{E(a)}</div></details>\n'
        for q, a in faq)

    ld = {'@context': 'https://schema.org', '@graph': [
        {'@type': 'WebPage', '@id': canon + '#webpage', 'url': canon, 'name': title,
         'description': desc, 'inLanguage': 'en-CA', 'dateModified': checked},
        {'@type': 'ItemList', '@id': canon + '#outlets',
         'name': f'Businesses buying used goods in {name}', 'numberOfItems': len(orgs),
         'itemListElement': [{'@type': 'ListItem', 'position': i + 1,
                              'item': {'@type': 'Organization', 'name': o['name'], 'url': o['url']}}
                             for i, o in enumerate(orgs)]},
        {'@type': 'FAQPage', '@id': canon + '#faq',
         'mainEntity': [{'@type': 'Question', 'name': q,
                         'acceptedAnswer': {'@type': 'Answer', 'text': a}} for q, a in faq]},
    ]}
    ld_tag = '<script type="application/ld+json">\n' + json.dumps(ld, indent=2, ensure_ascii=False) + '\n</script>'

    return head(title, desc, canon, ld_tag) + f'''
<section class="band" style="padding-bottom:0">
  <div class="g-wrap">
    <div class="g-hero">
      <div class="kicker">Selling in {E(m["prov"])}</div>
      <h1>Where to sell used goods in {E(name)}</h1>
      <p class="lede">{len(orgs)} businesses in and around {E(name)} that buy used goods from the
        public, or sell them on your behalf. For each one: what they buy, what they refuse, and
        exactly how the transaction works — because a pawn loan, a consignment split and an outright
        sale are three different things.</p>
    </div>

    <div class="g-meta">
      {IC["info"]}
      <span><b>Verified {E(checked)} from each business&#39;s own website.</b> Prices, terms and what
      they take change without notice. We are not affiliated with any business listed here, none of
      them pay to be included, and we receive nothing if you sell to them.</span>
    </div>

{PAWN_BOX.format(ic=IC["info"]) if has_pawn else ''}
{PAYOUT_BOX}
{''.join(body)}
    <div class="g-check">
      <h2>Before you go</h2>
      <ul>
        <li>{IC["check"]}<span><b>Take government photo ID.</b> Several of these businesses say plainly
          that they cannot buy from you without it, and that a health card will not do.</span></li>
        <li>{IC["check"]}<span><b>Phone ahead with the specifics.</b> Make, model, age, condition. Most
          refusals happen at the counter over something that could have been settled in a
          two-minute call.</span></li>
        <li>{IC["check"]}<span><b>Get more than one number</b> if the item is worth more than a hundred
          dollars or so. Offers on the same item vary widely.</span></li>
        <li>{IC["check"]}<span><b>Ask which transaction you are being offered</b> — a purchase, a
          consignment or a loan — and get it in writing.</span></li>
      </ul>
    </div>

    <div class="s-reg">{IC["info"]} <span>{E(m.get("regulationNote", ""))}</span></div>

    <div class="g-cta">
      <h2>Worth nothing? That is a real answer too.</h2>
      <p>Most of what comes out of a cleared house will not sell at any price, and the businesses above
        will tell you so at the counter. Photograph it first and we will tell you before you drive
        anywhere — and if the answer is that it is worth nothing, we will point you at
        <a href="/donate/{slug}">the {E(name)} charities that will still take it</a>.</p>
      <a class="btn urgent" href="/whats-it-worth">See what it&#39;s worth</a>
      <a class="btn ghost" href="/donate/{slug}">Donate it instead</a>
    </div>

    <div class="g-sec"><h2>Common questions</h2></div>
{faq_html}
    <div class="g-sec"><h2>Other cities</h2></div>
    <div class="g-cities">{cities}</div>
  </div>
</section>
''' + FOOT


def hub_page(metros, checked):
    canon = f'{SITE}/sell/'
    total = sum(len(m['orgs']) for m in metros)
    title = 'Where to sell used goods in Canada, city by city'
    desc = (f'{total} verified businesses across {len(metros)} Canadian cities that buy used furniture, '
            f'electronics, gold, scrap and cars from the public. What each takes and how the deal works.')
    cities = ''.join(
        f'<a class="g-city" href="/sell/{m["slug"]}">{E(m["name"])}<small>{len(m["orgs"])} buyers · {E(m["prov"])}</small></a>'
        for m in metros)
    ld = {'@context': 'https://schema.org', '@type': 'CollectionPage', 'url': canon, 'name': title,
          'description': desc, 'inLanguage': 'en-CA', 'dateModified': checked,
          'hasPart': [{'@type': 'WebPage', 'name': f'Where to sell used goods in {m["name"]}',
                       'url': f'{SITE}/sell/{m["slug"]}'} for m in metros]}
    ld_tag = '<script type="application/ld+json">\n' + json.dumps(ld, indent=2, ensure_ascii=False) + '\n</script>'

    return head(title, desc, canon, ld_tag) + f'''
<section class="band" style="padding-bottom:0">
  <div class="g-wrap">
    <div class="g-hero">
      <div class="kicker">Canada</div>
      <h1>Where to sell used goods, city by city</h1>
      <p class="lede">{total} businesses across {len(metros)} Canadian cities that buy used goods from
        the public — pawn shops, consignment, gold buyers, scrap yards, auto salvage and electronics
        buy-back. Each one checked against its own website, with the transaction spelled out, because
        a pawn loan and a sale are not the same thing.</p>
    </div>

    <div class="g-meta">
      {IC["info"]}
      <span><b>Verified {E(checked)}.</b> Nobody here pays to be listed and we receive nothing if you
      sell to them. Terms change constantly — always check the business&#39;s own site first.</span>
    </div>

{PAYOUT_BOX}
    <div class="g-sec"><h2>Pick your city</h2></div>
    <div class="g-cities">{cities}</div>

    <div class="g-cta">
      <h2>Giving it away instead?</h2>
      <p>Most of what people clear out is worth nothing to a dealer and perfectly useful to somebody
        else. We keep a separate, equally checked guide to the charities that will take it.</p>
      <a class="btn urgent" href="/donate">Where to donate it</a>
    </div>
  </div>
</section>
''' + FOOT


def sync_sitemap(metros, checked):
    """Rewrite the /sell block of sitemap.xml in place.

    Same contract as the donate builder: the sitemap is generated from the
    data that generated the pages, so a city that drops out of the dataset
    drops out of the sitemap in the same run rather than becoming a 404.
    """
    p = os.path.join(ROOT, 'sitemap.xml')
    marker = '<loc>' + SITE + '/sell'
    kept = [ln for ln in open(p, encoding='utf-8').read().split(chr(10)) if marker not in ln]
    s = chr(10).join(kept)
    rows = [f'  <url><loc>{SITE}/sell/</loc><lastmod>{checked}</lastmod>'
            f'<changefreq>monthly</changefreq><priority>0.8</priority></url>']
    rows += [f'  <url><loc>{SITE}/sell/{m["slug"]}</loc><lastmod>{checked}</lastmod>'
             f'<changefreq>monthly</changefreq><priority>0.7</priority></url>' for m in metros]
    nl = chr(10)
    s = s.replace('</urlset>', nl.join(rows) + nl + '</urlset>')
    open(p, 'w', encoding='utf-8').write(s)
    print(f'sitemap.xml - {len(rows)} sell URLs')


def main():
    d = json.load(open(DATA, encoding='utf-8'))
    metros = sorted(d['metros'], key=lambda m: m['name'])
    checked = d['lastChecked']

    known = {k for k, _, _ in KINDS}
    orphans = [(m['slug'], o['name'], o.get('kind'))
               for m in metros for o in m['orgs'] if o.get('kind') not in known]
    if orphans:
        for s, n, k in orphans:
            print(f'  !! {s}: "{n}" kind={k!r} has no display group')
        raise SystemExit(f'{len(orphans)} outlets would be silently dropped.')

    os.makedirs(OUT, exist_ok=True)
    for m in metros:
        open(os.path.join(OUT, m['slug'] + '.html'), 'w', encoding='utf-8').write(
            city_page(m, metros, checked))
    open(os.path.join(OUT, 'index.html'), 'w', encoding='utf-8').write(hub_page(metros, checked))
    sync_sitemap(metros, checked)

    print(f'built {len(metros)} sell pages + hub · {sum(len(m["orgs"]) for m in metros)} outlets')
    for m in metros:
        pawn = sum(1 for o in m['orgs'] if o.get('pawnWarning'))
        print(f'  /sell/{m["slug"]:<22} {len(m["orgs"]):>3} outlets, {pawn} pawn-flagged')


if __name__ == '__main__':
    main()
