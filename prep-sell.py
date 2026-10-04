#!/usr/bin/env python3
"""
Turn the raw resale research into data/sell-outlets.json.

Every rule here comes from the cross-metro audit, applied in code rather
than hand-edited so a re-run cannot silently lose it.

The audit's most consequential finding was structural: `deal` and
`collects` came back as free text with overloaded meanings —
"unclear - confirm in store" in what is supposed to be an enum, and
`collects: "yes"` standing for three different things (a genuine free
home visit, a conditional one, and a pickup you pay for). Neither was
safe to match a user's item against. Both are real enums by the end
of this file.

  python prep-sell.py <raw-sell-metros.json>
"""
import json, os, sys, re
from ca_spelling import walk_strings

ROOT = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ROOT, 'data', 'sell-outlets.json')
CHECKED = '2026-09-24'

METRO_MAP = [
    ('Toronto', 'toronto', 'Toronto', 'Ontario'),
    ('Montreal', 'montreal', 'Montréal', 'Quebec'),
    ('Vancouver', 'vancouver', 'Vancouver', 'British Columbia'),
    ('Calgary', 'calgary', 'Calgary', 'Alberta'),
    ('Edmonton', 'edmonton', 'Edmonton', 'Alberta'),
    ('Ottawa', 'ottawa', 'Ottawa', 'Ontario'),
    ('Winnipeg', 'winnipeg', 'Winnipeg', 'Manitoba'),
    ('Quebec City', 'quebec-city', 'Québec City', 'Quebec'),
    ('Hamilton', 'hamilton', 'Hamilton', 'Ontario'),
    ('Kitchener', 'kitchener-waterloo', 'Kitchener–Waterloo', 'Ontario'),
    ('London', 'london', 'London', 'Ontario'),
    ('Halifax', 'halifax', 'Halifax', 'Nova Scotia'),
    ('Victoria', 'victoria', 'Victoria', 'British Columbia'),
    ('Saskatoon', 'saskatoon', 'Saskatoon', 'Saskatchewan'),
]

# Audit §6: do not publish as-is. An outlet whose existence could not be
# confirmed, and two lenders with no address, no phone and an unknown
# contract type — sending someone to an unidentifiable lender is the exact
# inverse of what this site is for.
# Keyed by metro so a finding about one branch does not silently delete a
# perfectly good branch in another city — the Saskatoon Plato's Closet was
# never in question, only the Kitchener one.
DROP = {
    'kitchener-waterloo': ['plato'],
    'montreal': ['comptant.com', 'comptant maximum'],
}

# Audit §1 + the structural note: `deal` must be a real enum.
DEAL_FIX = {
    'unclear': 'quote-first',
    'unclear - confirm in store': 'quote-first',
    'both - confirm in store': 'quote-first',
    '': 'quote-first',
}
# 'trade-credit' earns its own value rather than collapsing into quote-first.
# Two shops here state plainly that they pay no cash at all and settle in store
# credit. Flattening that into "ask for a quote" would let someone carry four
# boxes of books across town expecting money. Same failure the audit caught in
# collects:"yes" — a distinction the reader needs, lost inside a tidier enum.
DEAL_OK = {'both', 'sell-outright', 'pawn-loan', 'consignment-split',
           'by-weight', 'quote-first', 'trade-credit'}

# Audit §4: collects:"yes" flattened a free home visit, a conditional one and
# a paid one. Nothing published lets us tell them apart per-outlet, so the
# honest default is "ask" — never a promise of a free truck.
COLLECT_UNLIKELY = ['device mart', 'general recycling', 'cft group', 'palmer recycling',
                    'williams scrap', 'bare wire']

# Audit §6: internal provenance that leaked into reader-facing fields.
AUDIT_LOG = re.compile(
    r'(NOT VERIFIED|DELIBERATELY BLANK|^CORRECTION:|The original record|'
    r'could not be (?:retrieved|confirmed)|HTTP \d{3}|CanLII|e-Laws)', re.I | re.M)

# Audit §6: specific strings that must not be republished.
STRIP_CLAIMS = [
    (re.compile(r'other jewellers and pawn shops pay only[^.]*\.', re.I), ''),
    (re.compile(r'[^.]*firearm[^.]*\.', re.I), ''),
]

PAWNY = re.compile(r'pawn|comptant|buyback|buy-?back|repurchase', re.I)

# An auction house is neither a shop that buys nor a consignment store in the
# high-street sense: you get paid weeks later, at hammer price, minus a
# commission, and you can get nothing at all. Four of them came back filed
# under three different kinds, which would have scattered them across the page
# under headings that describe none of them.
KIND_FIX = {
    'kelso & company':          'auction',
    'gardner galleries':        'auction',
    'pritchard auctions':       'auction',
    'architectural clearinghouse': 'building-salvage',
}

# These take "estate contents" and "household goods" rather than a category
# list, which is why no category regex matched a single one of them. They are
# the opposite of a gap: they will look at anything. build-outlets.py reads
# this flag and tags them with every category, ranked last, because they are
# the right answer for a whole house and the wrong one for one chair.
TAKES_ANYTHING = ['kelso & company', 'gardner galleries', 'pritchard auctions',
                  'la shop lesage', 'yardigan', 'maxsold']

REG_PLACEHOLDER = ('We could not verify this city’s municipal rules for second-hand dealers '
                   'and pawnbrokers from an official source, so we state none. Check with the '
                   'City or the province before relying on anything you read about them elsewhere.')


def clean_text(s):
    if not s:
        return ''
    s = str(s)
    if AUDIT_LOG.search(s):
        return ''                      # internal provenance, never reader copy
    for rx, rep in STRIP_CLAIMS:
        s = rx.sub(rep, s)
    return re.sub(r'\s+', ' ', s).strip()


def main():
    raw = json.load(open(sys.argv[1], encoding='utf-8'))
    changes, metros = [], []

    for m in raw:
        slug = name = prov = None
        for key, s, n, p in METRO_MAP:
            if m['metro'].startswith(key):
                slug, name, prov = s, n, p
                break
        if not slug:
            print('!! unmapped metro:', m['metro'][:50]); continue
        # Audit §6: the Toronto label carried "no Mississauga business was
        # verified" — an internal note sitting in a user-facing heading.

        orgs = []
        for o in m['verified']:
            o = dict(o)
            low = o['name'].lower()

            if any(d in low for d in DROP.get(slug, [])):
                changes.append(f'{slug}: DROPPED "{o["name"]}" (audit: do not publish)')
                continue

            # --- deal: free text -> enum ---
            d = (o.get('deal') or '').strip().lower()
            if d not in DEAL_OK:
                fixed = DEAL_FIX.get(d)
                if not fixed:
                    fixed = 'quote-first'
                changes.append(f'{slug}: "{o["name"]}" deal {d!r} -> {fixed}')
                o['deal'] = fixed
            else:
                o['deal'] = d

            # --- kind/deal mismatch: a shop named pawn that only buys ---
            if o.get('kind') == 'pawn' and o['deal'] == 'sell-outright':
                o['nameNote'] = ('Trades as a pawn shop, but what it advertises is an outright '
                                 'purchase. Ask which one you are being offered.')
                changes.append(f'{slug}: "{o["name"]}" flagged pawn-name/purchase-deal mismatch')

            # --- collects: three meanings -> enum, defaulting to "ask" ---
            c = (o.get('collects') or 'unknown').strip().lower()
            note = (o.get('dealNote') or '').lower()
            if c == 'yes':
                if any(u in low for u in COLLECT_UNLIKELY):
                    o['collects'] = 'unknown'
                    changes.append(f'{slug}: "{o["name"]}" collects yes -> unknown (audit: implausible)')
                elif 'free' in note and 'pick' in note:
                    o['collects'] = 'conditional'
                else:
                    o['collects'] = 'conditional'
            elif c in ('no', 'none'):
                o['collects'] = 'no'
            else:
                o['collects'] = 'unknown'

            # --- the pawn sentence, verbatim, on every pawn-like listing ---
            if o.get('kind') == 'pawn' or o['deal'] in ('pawn-loan', 'both') or PAWNY.search(o['name']):
                o['pawnWarning'] = True

            for frag, k in KIND_FIX.items():
                if frag in low and o.get('kind') != k:
                    changes.append(f'{slug}: "{o["name"]}" kind {o.get("kind")!r} -> {k}')
                    o['kind'] = k
            if any(f in low for f in TAKES_ANYTHING):
                o['takesAnything'] = True

            o['caution'] = clean_text(o.get('caution'))
            o['dealNote'] = clean_text(o.get('dealNote'))
            if not o.get('singleAddress') and not o.get('phone'):
                o['noPremises'] = True

            for junk in ('sourceUrl', 'confidence', 'dealNote2'):
                o.pop(junk, None)
            orgs.append(o)

        reg = clean_text(m.get('regulationNote')) or REG_PLACEHOLDER
        local = clean_text(m.get('localNote'))

        orgs.sort(key=lambda x: (x.get('collects') not in ('conditional',), x['name']))
        metros.append({'slug': slug, 'name': name, 'prov': prov,
                       'localNote': local, 'regulationNote': reg, 'orgs': orgs})

    os.makedirs(os.path.join(ROOT, 'data'), exist_ok=True)
    # Canadian English on every reader-facing string (see ca_spelling.py).
    metros = walk_strings(metros)
    json.dump({'lastChecked': CHECKED, 'metros': metros},
              open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

    tot = sum(len(m['orgs']) for m in metros)
    pawn = sum(1 for m in metros for o in m['orgs'] if o.get('pawnWarning'))
    print(f'wrote data/sell-outlets.json · {len(metros)} metros · {tot} outlets · '
          f'{pawn} carry the pawn warning')
    print(f'\n{len(changes)} audit corrections applied:')
    for c in changes:
        print('  ·', c)


if __name__ == '__main__':
    main()
