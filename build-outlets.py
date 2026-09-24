#!/usr/bin/env python3
"""
Merge the donation guides and the resale guides into one machine-readable
index, so the site can answer "I have THIS, in THIS city — who near me
actually takes it?" without anybody maintaining a second list.

The problem this solves: the researchers returned `accepts` and `buys` as
free text — 807 distinct strings across the donation set alone, everything
from "housewares" to "gently used clothing" to "computers and electronics".
None of that matches an item category the site already knows about. So we
tag every organization with a canonical category set here, once, at build
time, rather than trying to string-match in the browser on every render.

Emits assets/outlets-data.js (a plain script, not JSON — a static site
fetching JSON cross-path invites CORS and caching problems for no gain).

  python build-outlets.py
"""
import json, os, re

ROOT = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ROOT, 'assets', 'outlets-data.js')

# The canonical vocabulary. Deliberately the same words the rest of the site
# already uses — market.js prices by furniture/appliance/vehicle/sport/tools/
# kitchen/textile/electronics, so a category here can address an item there
# without a translation layer in between.
CATS = ['furniture', 'appliance', 'electronics', 'clothing', 'kitchen', 'tools',
        'bike', 'vehicle', 'books', 'building', 'metal', 'toys', 'music']

# Free text -> canonical. An organization gets every category it matches;
# "kitchen cabinets" is legitimately both kitchen and building.
PATTERNS = {
    'furniture':   r'furnitur|sofa|couch|chesterfield|armchair|recliner|chair|tables?\b|desks?\b|dresser|'
                   r'bed\b|beds\b|bedroom|mattress|box spring|bookcase|bookshel|shelving|shelves|'
                   r'wardrobe|cabinet|sideboard|nightstand|bedside|futon|ottoman|patio set',
    'appliance':   r'appliance|fridge|refrigerat|freezer|stove|oven|range\b|microwave|dishwasher|'
                   r'washer|dryer|laundry|vacuum|air condition|kettle|toaster|blender|mixer',
    'electronics': r'electronic|computer|laptop|desktop|monitor|tablet|phone|cell|smartphone|'
                   r'television|\btv\b|stereo|audio|speaker|camera|printer|console|e-?waste|'
                   r'cable|router|gaming',
    'clothing':    r'cloth|apparel|shoe|footwear|boots|coat|jacket|dress\b|textile|linen|bedding|'
                   r'towel|sheet|curtain|drape|fabric|accessor|handbag|purse|backpack|jewell|jewel|'
                   r'watch|wedding',
    'kitchen':     r'kitchen|housewar|house war|dish|crocker|glassware|cutlery|pot\b|pots|pan\b|pans|'
                   r'cookware|tableware|dinnerware|small kitchen|utensil|china\b',
    'tools':       r'\btool|hardware|workshop|drill|saw\b|wrench|garden tool|lawn|mower|ladder|'
                   r'power tool|hand tool|workbench',
    'bike':        r'bicycl|\bbike|cycling|sport|sporting|exercise|fitness|ski\b|skis|skate|golf|'
                   r'hockey|camping|outdoor gear',
    'vehicle':     r'\bcar\b|cars\b|vehicle|automobile|auto\b|truck\b|van\b|motorcycle|scooter|'
                   r'scrap car|junk car|trailer|boat',
    'books':       r'\bbook|media|\bdvd|\bcd\b|cds\b|record|vinyl|magazine|textbook|comic|'
                   r'video game|board game|puzzle|science fiction|fantasy|\bsci-?fi\b|'
                   r'philosophy|mystery|paperback|hardcover|fiction|literature|\bnovel|\bauthor',
    'building':    r'building material|construction|lumber|timber|plywood|door\b|doors|window|'
                   r'flooring|tile\b|tiles|fixture|faucet|sink\b|toilets?\b|vanity|lighting|light fixture|'
                   r'paint\b|renovat|hardware store|cabinetry|countertop|insulation|roofing',
    'metal':       r'scrap metal|scrap\b|copper|aluminium|aluminum|brass|steel|iron\b|metal\b|'
                   r'catalytic|radiator|wire\b|battery|batteries',
    'toys':        r'\btoy|games for kids|children|baby|infant|stroller|crib|nursery|playpen|'
                   r'stuffed anim|lego',
    'music':       r'musical instrument|instrument|piano|guitar|violin|drum|keyboard|amplifier|brass band',
}
# The Quebec City organizations list what they accept in French, so an
# English-only tagger silently kills the matcher for that entire city.
FR = {
    'furniture':   r'meuble|mobilier|matelas|fauteuil|divan|sofa|chaise|\btables?\b|commode|'
                   r'biblioth|arm(?:oire|oires)|lit\b|\blits\b|bureau',
    'appliance':   r'[ée]lectrom[ée]nager|r[ée]frig[ée]rateur|cuisini[eè]re|laveuse|s[ée]cheuse|'
                   r'lave-vaisselle|micro-?ondes|cong[ée]lateur|aspirateur',
    'electronics': r'[ée]lectronique|ordinateur|portable|t[ée]l[ée]viseur|\bt[ée]l[ée]\b|'
                   r'console|imprimante|appareil photo',
    'clothing':    r'v[êe]tement|chaussure|friperie|bijou|linge|manteau|textile|literie|'
                   r'accessoire|sac \w+ main',
    'kitchen':     r'article\w* m[ée]nager|vaisselle|cuisine|ustensile|batterie de cuisine|'
                   r'verrerie|coutellerie',
    'tools':       r'\boutil|quincaillerie|jardinage|tondeuse',
    'bike':        r'v[ée]lo|bicyclette|sport|patin|ski\b',
    'vehicle':     r'voiture|automobile|\bauto\b|camion|v[ée]hicule',
    'books':       r'\blivre|document|disque|vinyle|revue|\bjeu\b|jeux',
    'building':    r'mat[ée]riaux|construction|r[ée]novation|porte\b|fen[êe]tre|plancher|'
                   r'luminaire|robinet',
    'metal':       r'm[ée]tal|ferraille|cuivre|aluminium',
    'toys':        r'jouet|enfant|b[ée]b[ée]|poussette',
    'music':       r'instrument de musique|piano|guitare|violon',
}
for _c, _p in FR.items():
    PATTERNS[_c] = PATTERNS[_c] + '|' + _p

# Every alternative is anchored to the start of a word. Without this, 'cell'
# matched "ex[cell]ent", 'range' matched "ar[range]", 'tiles' matched
# "tex[tiles]" and 'door' matched "in[door]" — a run of quiet mistagging
# that is invisible in the totals and wrong on the page. Trailing letters stay
# free on purpose so plurals and compounds (books, dressers, kitchenware) match.
COMPILED = {c: re.compile(r'\b(?:' + p + ')', re.I) for c, p in PATTERNS.items()}

# A leading boundary cannot help where the false match also begins a word:
# 'table' opening "tablets" and "tableware", 'desk' opening "desktops".
# Those few need a closing boundary too, which is why they carry one above.
COLLISIONS = [
    ('furniture', 'iPads and tablets'),
    ('furniture', 'Computers - laptops, desktops, servers'),
    ('furniture', 'Portable air conditioners'),
    ('furniture', 'Tableware and glassware'),
    ('furniture', 'Fresh vegetables'),
    ('furniture', 'Turntables'),
    ('furniture', 'Collectables'),
    ('building',  'Indoor and outdoor textiles'),
    ('building',  'Toiletries'),
    ('electronics','Items in excellent condition'),
    ('appliance', 'We arrange collection'),
    ('bike',      'Public transportation passes'),
    ('bike',      'Recycling services'),
    ('kitchen',   'skipthedepot.com'),
]


def check_collisions():
    """Fail the build on a category that matches text it must never match.

    Same contract as the orphan guard in build-guides.py: a tagging bug does
    not announce itself, it just quietly sends someone with a dresser to a
    phone shop. Each line below is a real string from the data that was being
    matched by the category named beside it.
    """
    bad = [(c, t) for c, t in COLLISIONS if COMPILED[c].search(t)]
    for c, t in bad:
        print(f'  !! {c!r} still matches {t!r}')
    if bad:
        raise SystemExit(f'{len(bad)} category collisions - refusing to build.')

# Organizations that keep a CURRENT NEEDS list rather than accepting household
# goods. They belong on the city guide -- people genuinely want to help them --
# but they must never surface in a "who takes my sofa" match. Shepherds of Good
# Hope wants toothbrushes and new underwear; sending someone there with a
# dresser wastes their afternoon and the charity's staff time.
WISHLIST = re.compile(r'wish ?list|needs list|currently on their|current needs|amazon|'
                      r'brand new|new in package|unopened|non-perishable|liste de besoins', re.I)


HOUSEHOLD = re.compile(r'household (?:goods|items|contents)|home ?wares|general merchandise|contents of a home', re.I)


def tag(strings):
    """Free text in, canonical categories out."""
    blob = ' ; '.join(s for s in (strings or []) if s)
    return sorted(c for c, rx in COMPILED.items() if rx.search(blob))


def load(path):
    p = os.path.join(ROOT, path)
    return json.load(open(p, encoding='utf-8')) if os.path.exists(p) else None


def main():
    check_collisions()
    don = load('data/donations.json')
    sell = load('data/sell-outlets.json')
    if not don:
        raise SystemExit('data/donations.json missing — run prep-donations.py first')

    cities, stats = {}, {'donate': 0, 'sell': 0, 'wishlist': 0, 'untagged': []}

    for m in don['metros']:
        entries = []
        for o in m['orgs']:
            cats = tag(o.get('accepts', []))
            # Recyclers rehome nothing; the guides label them and the matcher
            # must route them separately or "where can I donate this" starts
            # recommending a shredder.
            blob = ' ; '.join(o.get('accepts', []) or [])
            if o.get('notCharity') and re.search(r'epra|sarcan|recycle my electronics', o['name'], re.I):
                route = 'recycle'
            elif WISHLIST.search(blob) or o.get('kind') == 'food-bank':
                route = 'wishlist'        # on the page, never in a match
                cats = []
            else:
                route = 'donate'
            if not cats and route == 'donate':
                stats['untagged'].append(f"{m['slug']}/{o['name']}")
            entries.append({
                'n': o['name'], 'u': o['url'], 'k': o.get('kind', ''), 'r': route,
                'c': cats, 'p': o.get('pickup', 'unknown'),
                'd': (o.get('pickupNote') or '')[:180],
                'x': 1 if o.get('notCharity') else (2 if o.get('restricted') else 0),
            })
            stats['wishlist' if route == 'wishlist' else 'donate'] += 1
        cities[m['slug']] = {'n': m['name'], 'p': m['prov'], 'o': entries}

    if sell:
        for m in sell['metros']:
            c = cities.setdefault(m['slug'], {'n': m['name'], 'p': m['prov'], 'o': []})
            for o in m['orgs']:
                # Estate and auction buyers publish no category list because
                # they will look at anything out of a house. Tagging them with
                # everything is the accurate answer, not a shortcut; outlets.js
                # ranks them last so they never displace a specialist.
                generalist = 0
                if o.get('takesAnything'):
                    cats = list(CATS)
                    generalist = 1
                else:
                    cats = tag(o.get('buys', []))
                    # "Second-hand household goods, per their current accepting
                    # list" is a real answer for a sofa and a kettle and useless
                    # as a category list. Fall back to the things that actually
                    # come out of a house — not clothing, not scrap, not a car.
                    if not cats and HOUSEHOLD.search(' '.join(o.get('buys', []))):
                        cats = ['furniture', 'kitchen', 'electronics',
                                'appliance', 'books', 'toys']
                    if not cats:
                        stats['untagged'].append(f"{m['slug']}/{o['name']}")

                # collects is a real enum by the time it reaches here, and the
                # widget's vocabulary is its own. Testing it against 'yes' —
                # the pre-audit value prep-sell.py stopped emitting — silently
                # rendered all 189 of these as "ask them", including the ones
                # that plainly say drop-off only.
                pick = {'conditional': 'conditional', 'no': 'none'}.get(
                    o.get('collects'), 'unknown')

                c['o'].append({
                    'n': o['name'], 'u': o['url'], 'k': o.get('kind', ''), 'r': 'sell',
                    'c': cats, 'p': pick,
                    'd': (o.get('dealNote') or '')[:180],
                    'deal': o.get('deal', ''), 'caution': (o.get('caution') or '')[:220],
                    # A pawn shop surfacing in the widget with no sign that the
                    # transaction might be a loan is precisely the confusion the
                    # audit said does real harm. It has to travel with the row.
                    'w': 1 if o.get('pawnWarning') else 0,
                    'g': generalist,
                    'x': 0,
                })
                stats['sell'] += 1

    payload = {'v': don.get('lastChecked'), 'cats': CATS, 'cities': cities}
    banner = (
        '/* GENERATED by build-outlets.py — do not edit.\n'
        '   Merges data/donations.json and data/sell-outlets.json into one index\n'
        '   keyed by city and canonical item category, so the Verdict can answer\n'
        '   "who near me actually takes this" from verified real organizations\n'
        '   rather than the fictional buyers the demo ships with.\n'
        '   Re-generate after either data file changes. */\n')
    with open(OUT, 'w', encoding='utf-8') as f:
        f.write(banner + 'window.OUTLET_DATA = ' +
                json.dumps(payload, ensure_ascii=False, separators=(',', ':')) + ';\n')

    size = os.path.getsize(OUT)
    print(f'assets/outlets-data.js · {len(cities)} cities · '
          f'{stats["donate"]} matchable + {stats["wishlist"]} wish-list + '
          f'{stats["sell"]} sell · {size // 1024} KB')

    cover = {c: sum(1 for ct in cities.values() for e in ct['o'] if c in e['c']) for c in CATS}
    print('\ncategory coverage (organizations tagged, all cities):')
    for c in CATS:
        print(f'  {c:<12} {cover[c]:>4}')
    if stats['untagged']:
        print(f'\n!! {len(stats["untagged"])} organizations matched NO category '
              f'(they will never surface in a match):')
        for u in stats['untagged'][:15]:
            print('   ', u)


if __name__ == '__main__':
    main()
