"""Canadian English normalisation for reader-facing strings.

The guide research came back with British spellings in places — "aluminium"
in 25 scrap-metal records, "programme" in 17 — and those strings render on
every city and item guide. Applied in the prep scripts rather than edited
into data/*.json, so a re-run of the research pipeline cannot quietly undo
it. URLs are left alone: a path segment is not prose.
"""
import re

CA_SPELLING = [
    (r'\baluminium', 'aluminum'),
    (r'\bprogramme', 'program'),
    (r'\borganisation', 'organization'),
    (r'\brecognise', 'recognize'),
    (r'\bspecialise', 'specialize'),
    (r'\bkerb\b', 'curb'),
    (r'\bwhilst\b', 'while'),
    (r'\bcentre of\b', 'centre of'),   # Canadian keeps "centre"; listed so it is not "corrected"
]

# Keys whose values are identifiers, not prose.
SKIP_KEYS = {'url', 'sourceUrl', 'slug', 'phone', 'kind', 'deal', 'collects', 'pickup'}


def canadianise(s):
    if not isinstance(s, str):
        return s
    for pat, rep in CA_SPELLING:
        s = re.sub(pat, rep, s, flags=re.I)
    return s


def walk_strings(o):
    """Apply the spelling fix to every prose string in a nested structure."""
    if isinstance(o, str):
        return canadianise(o)
    if isinstance(o, list):
        return [walk_strings(x) for x in o]
    if isinstance(o, dict):
        return {k: (v if k in SKIP_KEYS else walk_strings(v)) for k, v in o.items()}
    return o
