#!/usr/bin/env python3
"""
Turn the researched category editorial into data/category-editorial.json.

Two research passes and two adversarial audits produced a clear verdict:
the material about PHYSICAL OBJECTS is excellent and the material about
ORGANIZATIONS is not safe to publish.

The audits found, repeatedly and across every category, the same class of
failure: verbatim quotes attributed to charities whose domains do not
resolve, dollar figures credited to shops that publish no such figure, and
national claims about "most charities" built from one affiliate in one
city. The correction pass removed 321 of these and introduced new ones
while patching the gaps, which is how we learned the problem is structural
rather than a matter of trying again. Twelve of thirteen categories still
failed audit afterwards.

So this script keeps only what does not depend on anyone's word:

  KEPT   the physical tells - pull the drawer out and look for dovetails,
         hold a magnet to the rim, find the model plate under the lid.
         A reader verifies these by looking at the object in front of
         them. No source can be wrong because no source is cited.

  KEPT   legal and safety rules whose cited source is a government page
         that currently returns 200. Health Canada's banned-items list and
         the federal halocarbon regulations are the two places where
         getting it wrong is worse than saying nothing.

  CUT    every claim about what an organization accepts, refuses, pays or
         collects. Not because it is all wrong, but because we cannot tell
         which parts are, and we already hold that information in verified
         form: 344 organizations whose accepts, refuses and pickup fields
         were each checked against their own website.

The result is a guide that tells you what you have, and a directory that
tells you who takes it. Both halves are things we can stand behind.

  python prep-editorial.py <corrected-workflow-output.json>
"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ROOT, 'data', 'category-editorial.json')

# A claim about an organization, a price, or what "most" operators do. Any
# of these in a field means that field asserts something we did not verify.
UNSAFE = re.compile(
    r'habitat|salvation army|diabetes canada|value village|goodwill|restore\b|'
    r"plato|talize|best buy|long & mcquade|kops|furniture bank|turnabout|"
    r'efficiency manitoba|gorecycle|scrap-?it|play it again|'
    r'charit(?:y|ies)|thrift|most (?:shops|stores|charities|yards|buyers)|'
    r'every (?:shop|store|charity|yard|buyer)|no (?:shop|store|charity|yard) will|'
    r'shops? will|stores? will|yards? (?:do|pay|will|accept)|'
    r'[$£]|US\$|\d+\s*(?:per ?cent|%)|dollars?\b', re.I)

MULTI_URL = re.compile(r'\s+(?:and|;)\s+(?=https?://)')

# Several legal entries name the regulation correctly and give no link, so
# they were being dropped for want of a citation we can supply ourselves.
# Each URL below was fetched and returned 200 while writing this file; the
# build re-checks them with --check-sources before publishing anything.
SOURCE_MAP = [
    # (citation pattern, jurisdiction guard, URL)
    # The guard matters: matching "halocarbon" alone attached the FEDERAL
    # regulation to Quebec's Q-2 r. 29, which is a wrong citation on a legal
    # rule - the exact class of error this file exists to strip out.
    (r'halocarbon', r'canada|federal', 'https://laws-lois.justice.gc.ca/eng/regulations/SOR-2022-110/FullText.html'),
    (r'O\.?\s*Reg\.?\s*463/10|e-Laws', r'ontario', 'https://www.ontario.ca/laws/regulation/100463'),
    (r'consumer product safety act|CCPSA', r'canada|federal', 'https://laws-lois.justice.gc.ca/eng/acts/C-1.68/FullText.html'),
    (r'second-?hand products|Information for Shoppers', r'canada|federal', 'https://www.canada.ca/en/health-canada/services/buying-second-hand-products.html'),
    (r'Mattresses Regulations|SOR/2016-183', r'canada|federal', 'https://laws-lois.justice.gc.ca/eng/regulations/SOR-2016-183/FullText.html'),
    (r'B\.?C\.?\s*Reg\.?\s*387/99', r'british columbia|b\.?c\.?', 'https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/387_99'),
    (r'Call2Recycle', r'.', 'https://www.call2recycle.ca/e-mobility/'),
    (r'Parachute', r'.', 'https://parachute.ca/en/injury-topic/helmets/'),
]


# A legal rule may say the word "charity" - "the Act covers used goods given
# away, including donations to a charity" is a statement about the law, not an
# unverified claim about an operator. Only named operators and dollar figures
# disqualify a legal entry.
UNSAFE_LAW = re.compile(
    r'habitat|salvation army|diabetes canada|value village|goodwill|restore|'
    r'plato|talize|best buy|long & mcquade|kops|furniture bank|turnabout|'
    r'efficiency manitoba|gorecycle|scrap-?it|play it again|'
    r'most (?:shops|stores|charities|yards|buyers)|'
    r'every (?:shop|store|charity|yard|buyer)|'
    r'[$£]|US\$|\d+\s*(?:per ?cent|%)', re.I)


# Confirmed live at build time. Rebuilt by hand with a fresh check rather
# than trusted from the research, because a dead citation on a safety rule
# is worse than no citation.
DEAD_SOURCES = set()


def safe(text):
    return bool(text) and not UNSAFE.search(text)


def first_url(s):
    if not s:
        return ''
    s = MULTI_URL.split(s.strip())[0].strip()
    return s if s.startswith('http') else ''


def main():
    raw = json.load(open(sys.argv[1], encoding='utf-8'))
    cats = raw['result']['categories'] if 'result' in raw else raw['categories']

    out, report = {}, []
    for c in cats:
        k, content = c['key'], c['content']

        tells = []
        for w in content.get('worthMoney') or []:
            if w.get('tell') and safe(w['tell']) and safe(w.get('what', '')):
                tells.append({'what': w['what'], 'tell': w['tell']})

        # Item names only. The "why" fields carry the operator claims.
        nothing = [{'what': w['what']} for w in (content.get('worthNothing') or [])
                   if safe(w.get('what', ''))]

        laws = []
        for l in content.get('legalOrSafety') or []:
            u = first_url(l.get('source'))
            if not u:
                cite = l.get('source') or ''
                juris = l.get('jurisdiction', '')
                for pat, guard, url in SOURCE_MAP:
                    hit = re.search(pat, cite, re.I) or re.search(pat, l.get('rule', ''), re.I)
                    if hit and re.search(guard, juris, re.I):
                        u = url
                        break
            if not u or u in DEAD_SOURCES:
                continue
            if UNSAFE_LAW.search(l.get('rule', '') + ' ' + l.get('detail', '')):
                continue
            laws.append({'rule': l['rule'], 'jurisdiction': l.get('jurisdiction', ''),
                         'detail': l['detail'], 'source': u})

        opening = content.get('openingTruth') if safe(content.get('openingTruth')) else ''

        out[k] = {'name': c['name'], 'openingTruth': opening,
                  'tells': tells, 'worthNothing': nothing, 'legalOrSafety': laws}
        report.append((k, len(tells), len(nothing), len(laws), bool(opening)))

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    json.dump(out, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

    print(f'{os.path.relpath(OUT, ROOT)} - {len(out)} categories')
    print(f"{'':14}{'tells':>6}{'no-value':>10}{'laws':>6}{'opener':>8}")
    for k, t, n, l, o in report:
        print(f'  {k:<12}{t:>6}{n:>10}{l:>6}{"yes" if o else "-":>8}')
    tot = sum(r[1] for r in report)
    print(f'\n{tot} physical tells, {sum(r[3] for r in report)} sourced legal rules')
    thin = [r[0] for r in report if r[1] + r[3] == 0]
    if thin:
        raise SystemExit('no usable editorial survived for: ' + ', '.join(thin))


if __name__ == '__main__':
    main()
