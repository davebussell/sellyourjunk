#!/usr/bin/env python3
"""
Turn the raw research output into data/donations.json.

Every transformation here comes from the cross-metro audit that ran after
verification. They are applied in code rather than by hand-editing the data
so that re-running the research does not silently lose them.

  python prep-donations.py <raw-metros.json>
"""
import json, os, sys, re
from datetime import date

ROOT = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ROOT, 'data', 'donations.json')
CHECKED = '2026-09-24'

# raw metro string -> (slug, display name, province)
METRO_MAP = [
    ('Toronto',    'toronto',             'Toronto',            'Ontario'),
    ('Montr',      'montreal',            'Montréal',           'Quebec'),
    ('Vancouver',  'vancouver',           'Vancouver',          'British Columbia'),
    ('Calgary',    'calgary',             'Calgary',            'Alberta'),
    ('Edmonton',   'edmonton',            'Edmonton',           'Alberta'),
    ('Ottawa',     'ottawa',              'Ottawa',             'Ontario'),
    ('Winnipeg',   'winnipeg',            'Winnipeg',           'Manitoba'),
    ('Quebec City','quebec-city',         'Québec City',        'Quebec'),
    ('Hamilton',   'hamilton',            'Hamilton',           'Ontario'),
    ('Kitchener',  'kitchener-waterloo',  'Kitchener–Waterloo', 'Ontario'),
    ('London',     'london',              'London',             'Ontario'),
    ('Halifax',    'halifax',             'Halifax',            'Nova Scotia'),
    ('Victoria',   'victoria',            'Victoria',           'British Columbia'),
    ('Saskatoon',  'saskatoon',           'Saskatoon',          'Saskatchewan'),
]

# kinds the researchers invented, folded into the display taxonomy
KIND_FIX = {'paid-disposal': 'specialty', 'electronics-recycling': 'electronics',
            'thrift-store': 'thrift-chain', 'thrift': 'thrift-chain',
            'books': 'books-media', 'media': 'books-media'}

# --- audit rule: these are NOT charities. A reader skimming a donations page
#     assumes charity and expects a tax receipt, so each needs an explicit label.
NOT_CHARITY = {
    'value village': 'A for-profit retailer, not a charity. It pays a nonprofit partner for donated goods — the partner differs by store, so ask at the door if that matters to you.',
    'savers':        'A for-profit retailer, not a charity. It pays a nonprofit partner for donated goods — the partner differs by store.',
    'try recycling': 'A commercial recycling business, not a charity. They charge to take material.',
    'sarcan':        'A recycling programme, not a charity. Material is recycled, not passed on to anyone who needs it.',
    'epra':          'A regulated recycling programme, not a charity. Electronics are dismantled and recycled, not reused.',
    'recycle my electronics': 'A regulated recycling programme, not a charity. Electronics are dismantled and recycled, not reused.',
}

# --- audit rule: not open to the general public. Without a label these read as
#     ordinary donation options and waste both the reader's time and theirs.
RESTRICTED = {
    'safetynet charities': 'Works by Ontario Works / ODSP referral rather than public donation, and its $200–$400 charge is a delivery fee paid by the receiving family — not a donor pickup fee.',
    'access tech':         'University drop-off logistics rather than a residential donation service.',
    'reboot canada':       'Pickup is for organizational donations of roughly 20 items or more, not household drop-offs.',
}

# --- audit rule: free-pickup claims that did not survive scrutiny. Downgraded
#     to unknown so the page says "ask them" rather than promising a free truck.
DOWNGRADE_FREE = {
    'habitat for humanity greater vancouver restore':
        'Their site mentions collection but gives no service area, minimum or booking line we could confirm. Ask when you call.',
    'comptoir emmaüs':
        'Collection is referred to on their site but the terms were not something we could confirm. Ask when you call.',
    'centre ozanam':
        'Collection is referred to on their site but the terms were not something we could confirm. Ask when you call.',
}

# --- audit rule: one national programme reported three different ways across
#     metros. Normalised to the most conservative reading that is true everywhere.
DIABETES = 'declutter' , 'diabetes'
DIABETES_NOTE = ('Free home collection, but only when they have a scheduled run in your area — enter your '
                 'postal code on their site to check. Items must be in sealed bags or boxes under 40 lb and '
                 'left on the doorstep; loose items are not collected.')


def norm(s):
    return re.sub(r'[^a-z ]', '', (s or '').lower()).strip()


def main():
    raw = json.load(open(sys.argv[1], encoding='utf-8'))
    changes = []
    metros = []

    for m in raw:
        slug = name = prov = None
        for key, s, n, p in METRO_MAP:
            if m['metro'].startswith(key):
                slug, name, prov = s, n, p
                break
        if not slug:
            print('!! unmapped metro:', m['metro']); continue

        orgs = []
        for o in m['verified']:
            o = dict(o)
            o['kind'] = KIND_FIX.get(o.get('kind'), o.get('kind', 'specialty'))
            n = norm(o['name'])

            for key, label in NOT_CHARITY.items():
                if key in n:
                    o['notCharity'] = label
                    changes.append(f'{slug}: labelled "{o["name"]}" as not-a-charity')
                    break

            for key, label in RESTRICTED.items():
                if key in n:
                    o['restricted'] = label
                    changes.append(f'{slug}: labelled "{o["name"]}" as restricted access')
                    break

            for key, why in DOWNGRADE_FREE.items():
                if norm(key) in n and o.get('pickup') == 'free':
                    o['pickup'] = 'unknown'
                    o['pickupNote'] = why
                    changes.append(f'{slug}: downgraded "{o["name"]}" free -> unknown')
                    break

            if all(d in n for d in DIABETES) or 'declutter for diabetes' in n:
                if o.get('pickup') != 'none':
                    if o.get('pickup') != 'conditional':
                        changes.append(f'{slug}: normalised Diabetes Canada pickup '
                                       f'{o.get("pickup")} -> conditional')
                    o['pickup'] = 'conditional'
                    o['pickupNote'] = DIABETES_NOTE

            # belt and braces: never publish a street address for a shelter that
            # is a women's or DV service, even where the org publishes one itself
            if o.get('kind') == 'shelter' and re.search(
                    r"women|transition house|anova|cornerstone|win house|ywca|cha[iî]non", n):
                if o.pop('singleAddress', None):
                    changes.append(f'{slug}: stripped address from "{o["name"]}" (DV service)')

            for junk in ('url_sources', 'url_source_notes', 'url_note', 'note', 'confidence', 'sourceUrl'):
                o.pop(junk, None)
            orgs.append(o)

        orgs.sort(key=lambda x: (x.get('pickup') not in ('free', 'paid', 'conditional'), x['name']))
        metros.append({'slug': slug, 'name': name, 'prov': prov,
                       'localNote': m.get('localNote', ''), 'orgs': orgs})

    os.makedirs(os.path.join(ROOT, 'data'), exist_ok=True)
    json.dump({'lastChecked': CHECKED, 'metros': metros},
              open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

    print(f'wrote data/donations.json · {len(metros)} metros · '
          f'{sum(len(m["orgs"]) for m in metros)} organizations')
    print(f'\n{len(changes)} audit corrections applied:')
    for c in changes:
        print('  ·', c)


if __name__ == '__main__':
    main()
